import { config } from '../config'
import { base64ToBytes } from './base64'

/** Plays streamed 24kHz PCM chunks back to back, and can stop instantly. */
export class PcmPlayer {
  private nextStart = 0
  private sources = new Set<AudioBufferSourceNode>()

  constructor(private ctx: AudioContext) {}

  get playing(): boolean {
    return this.sources.size > 0
  }

  /** Queues a base64 PCM chunk. Returns the AudioContext time it will start. */
  enqueue(b64: string): number {
    const bytes = base64ToBytes(b64)
    const samples = new Int16Array(bytes.buffer, 0, bytes.byteLength >> 1)
    const floats = new Float32Array(samples.length)
    for (let i = 0; i < samples.length; i++) floats[i] = samples[i] / 0x8000

    const buffer = this.ctx.createBuffer(1, floats.length, config.audio.outputSampleRate)
    buffer.copyToChannel(floats, 0)
    const src = this.ctx.createBufferSource()
    src.buffer = buffer
    src.connect(this.ctx.destination)

    const start = Math.max(this.ctx.currentTime + config.audio.playbackLeadSeconds, this.nextStart)
    src.start(start)
    this.nextStart = start + buffer.duration
    this.sources.add(src)
    src.onended = () => this.sources.delete(src)
    return start
  }

  /** Stops playback immediately and drops anything queued. */
  clear(): void {
    for (const src of this.sources) {
      src.onended = null
      try {
        src.stop()
      } catch {
        // already stopped
      }
    }
    this.sources.clear()
    this.nextStart = 0
  }
}
