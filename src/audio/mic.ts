import { config } from '../config'

export interface MicChunk {
  pcm: ArrayBuffer // 16-bit little-endian PCM at 16kHz
  rms: number
}

export interface Mic {
  stop(): void
}

/** Starts the mic and calls onChunk with 16kHz PCM chunks. */
export async function startMic(ctx: AudioContext, onChunk: (c: MicChunk) => void): Promise<Mic> {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: {
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  })
  await ctx.audioWorklet.addModule('/pcm-capture-worklet.js')
  const source = ctx.createMediaStreamSource(stream)
  const node = new AudioWorkletNode(ctx, 'pcm-capture', {
    processorOptions: {
      targetRate: config.audio.inputSampleRate,
      chunkSamples: config.audio.micChunkSamples,
    },
  })
  node.port.onmessage = (e: MessageEvent<MicChunk>) => onChunk(e.data)
  source.connect(node)
  // The worklet outputs silence; connecting it keeps it running in every browser.
  const mute = ctx.createGain()
  mute.gain.value = 0
  node.connect(mute).connect(ctx.destination)

  return {
    stop() {
      node.port.onmessage = null
      source.disconnect()
      node.disconnect()
      mute.disconnect()
      stream.getTracks().forEach((t) => t.stop())
    },
  }
}
