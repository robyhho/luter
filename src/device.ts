// Phone-specific bits: keep the screen on and get iOS audio routing right.

/** Keeps the screen awake until the returned function is called. Re-acquires after the app comes back to the front. */
export function keepScreenAwake(): () => void {
  let lock: WakeLockSentinel | null = null
  let active = true
  const acquire = async () => {
    if (!active || !('wakeLock' in navigator) || document.visibilityState !== 'visible') return
    try {
      lock = await navigator.wakeLock.request('screen')
    } catch {
      // not allowed right now (low battery mode, etc.), not worth failing over
    }
  }
  const onVisible = () => void acquire()
  document.addEventListener('visibilitychange', onVisible)
  void acquire()
  return () => {
    active = false
    document.removeEventListener('visibilitychange', onVisible)
    lock?.release().catch(() => {})
    lock = null
  }
}

/**
 * Safari's Audio Session API (iOS 16.4+). play-and-record keeps the tutor on
 * the loudspeaker at normal volume while the mic is open. Ignored elsewhere.
 */
export function setAudioSession(type: 'play-and-record' | 'auto'): void {
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession
  if (session) session.type = type
}
