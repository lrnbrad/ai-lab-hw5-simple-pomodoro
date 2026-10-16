export function playCompletionTone() {
  const AudioContextType = window.AudioContext ?? window.webkitAudioContext
  if (!AudioContextType) return

  try {
    const context = new AudioContextType()
    const oscillator = context.createOscillator()
    const volume = context.createGain()

    oscillator.type = 'sine'
    oscillator.frequency.setValueAtTime(720, context.currentTime)
    volume.gain.setValueAtTime(0.0001, context.currentTime)
    volume.gain.exponentialRampToValueAtTime(0.12, context.currentTime + 0.02)
    volume.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.28)
    oscillator.connect(volume)
    volume.connect(context.destination)
    oscillator.onended = () => context.close()
    oscillator.start()
    oscillator.stop(context.currentTime + 0.3)
  } catch {
    // Sound is optional; the timer and visible message remain available.
  }
}
