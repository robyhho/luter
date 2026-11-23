import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from '@google/genai'
import { config, type Mode } from '../config'
import { prompts } from '../prompts'
import { bytesToBase64 } from '../audio/base64'
import { startMic, type Mic, type MicChunk } from '../audio/mic'
import { PcmPlayer } from '../audio/player'
import { keepScreenAwake, setAudioSession } from '../device'
import { fetchLiveToken } from './token'

export type Status = 'idle' | 'connecting' | 'live' | 'error'

export interface Line {
  id: number
  who: 'you' | 'tutor'
  text: string
}

export interface StartOptions {
  mode: Mode
  model: string
  voice: string
}

export interface TutorEvents {
  status(status: Status, detail?: string): void
  transcript(lines: Line[]): void
  /** End of your speech to the tutor's first audio, in ms. */
  latency(ms: number): void
  log(message: string): void
}

/** One Live session: mic in, audio out, transcript of both sides. */
export class Tutor {
  private ctx?: AudioContext
  private mic?: Mic
  private player?: PcmPlayer
  private session?: Session
  private releaseWake?: () => void
  private stopping = false
  private ready = false // true once the server has sent setupComplete
  private kickoff = ''
  private kickedOff = false

  private lines: Line[] = []
  private nextId = 1

  // Latency timing
  private lastSpeechAt = 0 // performance.now() when your voice was last above threshold
  private spokeSinceReply = false
  private awaitingFirstAudio = true

  constructor(private events: TutorEvents) {}

  async start(opts: StartOptions): Promise<void> {
    this.stopping = false
    this.ready = false
    this.kickedOff = false
    this.lines = []
    this.events.transcript([])
    this.events.status('connecting')

    try {
      // Create the AudioContext before any await, while we're still inside the
      // tap, or iOS keeps it suspended.
      this.ctx = new AudioContext()
      const token = fetchLiveToken() // runs while the mic starts
      token.catch(() => {}) // awaited below; stops an unhandled rejection if the mic fails first
      setAudioSession('play-and-record')
      this.releaseWake = keepScreenAwake()
      await this.ctx.resume()
      this.player = new PcmPlayer(this.ctx)
      this.mic = await startMic(this.ctx, (c) => this.onMicChunk(c))

      const prompt = prompts[opts.mode]
      this.kickoff = prompt.kickoff
      const ai = new GoogleGenAI({ apiKey: await token, httpOptions: { apiVersion: config.apiVersion } })
      this.events.log(`connecting to ${opts.model} with voice ${opts.voice}`)
      this.session = await ai.live.connect({
        model: opts.model,
        config: {
          responseModalities: [Modality.AUDIO],
          systemInstruction: prompt.system,
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: opts.voice } } },
          inputAudioTranscription: { languageCodes: config.transcriptionLanguages[opts.mode] },
          outputAudioTranscription: {},
          realtimeInputConfig: {
            automaticActivityDetection: { silenceDurationMs: config.vadSilenceMs },
          },
        },
        callbacks: {
          onmessage: (m) => this.onMessage(m),
          onerror: (e) => this.events.log(`socket error: ${e.message ?? 'unknown'}`),
          onclose: (e) => this.onClose(e),
        },
      })
      // setupComplete can arrive before connect() resolves, so try here as well.
      this.startConversation()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      this.events.status('error', msg)
      this.cleanup()
    }
  }

  stop(): void {
    this.stopping = true
    this.session?.close()
    this.cleanup()
    this.events.status('idle')
  }

  private cleanup(): void {
    this.ready = false
    this.mic?.stop()
    this.player?.clear()
    this.releaseWake?.()
    setAudioSession('auto')
    this.ctx?.close().catch(() => {})
    this.mic = undefined
    this.player = undefined
    this.ctx = undefined
    this.session = undefined
    this.releaseWake = undefined
  }

  private onMicChunk({ pcm, rms }: MicChunk): void {
    if (rms > config.speechRmsThreshold && !this.player?.playing) {
      this.lastSpeechAt = performance.now()
      this.spokeSinceReply = true
    }
    if (!this.ready) return
    this.session?.sendRealtimeInput({
      audio: { data: bytesToBase64(new Uint8Array(pcm)), mimeType: 'audio/pcm;rate=16000' },
    })
  }

  private onMessage(m: LiveServerMessage): void {
    if (m.setupComplete) {
      this.ready = true
      this.events.status('live')
      this.events.log('setup complete')
      this.startConversation()
    }

    const sc = m.serverContent
    if (sc?.interrupted) {
      this.player?.clear()
      this.awaitingFirstAudio = true
      this.events.log('interrupted')
    }

    for (const part of sc?.modelTurn?.parts ?? []) {
      const data = part.inlineData?.data
      if (!data || !this.player || !this.ctx) continue
      const startAt = this.player.enqueue(data)
      if (this.awaitingFirstAudio) {
        this.awaitingFirstAudio = false
        if (this.spokeSinceReply) {
          const untilPlay = (startAt - this.ctx.currentTime) * 1000
          const latency = Math.round(performance.now() + untilPlay - this.lastSpeechAt)
          this.spokeSinceReply = false
          this.events.latency(latency)
          this.events.log(`latency ${latency}ms`)
        }
      }
    }

    if (sc?.inputTranscription?.text) this.append('you', sc.inputTranscription.text)
    if (sc?.outputTranscription?.text) this.append('tutor', sc.outputTranscription.text)

    if (sc?.turnComplete) this.awaitingFirstAudio = true
    if (m.goAway) this.events.log(`server will close soon (goAway, ${m.goAway.timeLeft ?? '?'} left)`)
  }

  /** Asks the tutor to speak first, once the session is both assigned and set up. */
  private startConversation(): void {
    if (!this.ready || !this.session || this.kickedOff) return
    this.kickedOff = true
    this.session.sendRealtimeInput({ text: this.kickoff })
  }

  private onClose(e: CloseEvent): void {
    if (this.stopping) return
    let detail = `Connection closed (${e.code}${e.reason ? `: ${e.reason}` : ''})`
    if (!this.ready && !e.reason) {
      detail += '. It never connected: check the model name and that the free tier has quota left.'
    }
    this.events.log(detail)
    this.events.status('error', detail)
    this.cleanup()
  }

  private append(who: Line['who'], text: string): void {
    const last = this.lines[this.lines.length - 1]
    if (last && last.who === who) {
      this.lines = [...this.lines.slice(0, -1), { ...last, text: last.text + text }]
    } else {
      this.lines = [...this.lines, { id: this.nextId++, who, text: text.trimStart() }]
    }
    this.events.transcript(this.lines)
  }
}
