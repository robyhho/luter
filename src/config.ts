// Everything you might want to swap while testing lives here.
// Live models are renamed and retired often, so never hard-code a model name elsewhere.

export type Mode = 'topic' | 'fluency'

export const config = {
  // Checked 22 Nov 2026: gemini-3.8-live is Google's recommended Live model and is
  // "Free of charge" on the Gemini API free tier. The others are fallbacks if the
  // voice or latency test fails.
  model: 'gemini-3.8-live',
  // Ephemeral tokens from our Worker only work on v1alpha. (The SDK's default,
  // v1, rejects Live sessions with 1006.)
  apiVersion: 'v1alpha',
  models: [
    'gemini-3.8-live',
    'gemini-3.1-flash-live-preview',
    'gemini-2.5-flash-native-audio-preview-12-2025',
  ],

  // Prebuilt Live voices. Try a few for Mandarin tone accuracy.
  voices: ['Kore', 'Puck', 'Charon', 'Fenrir', 'Aoede', 'Leda', 'Orus', 'Zephyr'],
  defaultVoice: { topic: 'Kore', fluency: 'Puck' } as Record<Mode, string>,

  // Hints for transcribing the learner. Remove a code if setup ever rejects it.
  transcriptionLanguages: {
    topic: ['zh-CN', 'en-GB'],
    fluency: ['en-GB'],
  } as Record<Mode, string[]>,

  audio: {
    inputSampleRate: 16000, // what the Live API expects
    outputSampleRate: 24000, // what the Live API returns
    micChunkSamples: 640, // 40ms per message at 16kHz
    playbackLeadSeconds: 0.05, // small buffer before the first chunk plays
  },

  // Server voice activity detection. Lower = snappier replies, but a hesitant
  // beginner may get cut off mid-sentence. Google suggests 500 to 800.
  vadSilenceMs: 600,

  // Mic level (RMS, 0 to 1) that counts as "you are speaking", for latency timing.
  speechRmsThreshold: 0.02,
}
