// Captures mic audio at the context's native rate, resamples to 16kHz,
// converts to 16-bit PCM and posts fixed-size chunks to the main thread.
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super()
    const { targetRate, chunkSamples } = options.processorOptions
    this.step = sampleRate / targetRate // input samples per output sample
    this.chunkSamples = chunkSamples
    this.pos = 0 // read position relative to the current block, may be in [-1, 0)
    this.prev = 0 // last sample of the previous block
    this.chunk = new Int16Array(chunkSamples)
    this.filled = 0
    this.sumSq = 0
  }

  process(inputs) {
    const ch = inputs[0] && inputs[0][0]
    if (!ch || ch.length === 0) return true
    const n = ch.length
    while (this.pos < n - 1) {
      const i = Math.floor(this.pos)
      const frac = this.pos - i
      const a = i < 0 ? this.prev : ch[i]
      const b = ch[i + 1]
      let v = a + (b - a) * frac
      v = v > 1 ? 1 : v < -1 ? -1 : v
      this.sumSq += v * v
      this.chunk[this.filled++] = v < 0 ? v * 0x8000 : v * 0x7fff
      if (this.filled === this.chunkSamples) {
        const rms = Math.sqrt(this.sumSq / this.chunkSamples)
        this.port.postMessage({ pcm: this.chunk.buffer, rms }, [this.chunk.buffer])
        this.chunk = new Int16Array(this.chunkSamples)
        this.filled = 0
        this.sumSq = 0
      }
      this.pos += this.step
    }
    this.pos -= n
    this.prev = ch[n - 1]
    return true
  }
}

registerProcessor('pcm-capture', PcmCaptureProcessor)
