import { computed, onUnmounted, reactive, ref } from 'vue'

export const PHASES = {
  work: 'work',
  shortBreak: 'shortBreak',
  longBreak: 'longBreak',
}

export const DEFAULT_SETTINGS = {
  work: 25,
  shortBreak: 5,
  longBreak: 15,
  sessionsBeforeLongBreak: 4,
}

const durationInMilliseconds = (settings, phase) => settings[phase] * 60 * 1000

export function usePomodoro({ onWorkComplete } = {}) {
  const settings = reactive({ ...DEFAULT_SETTINGS })
  const phase = ref(PHASES.work)
  const remainingMilliseconds = ref(durationInMilliseconds(settings, phase.value))
  const isRunning = ref(false)
  const completedWorkSessions = ref(0)
  const cycleCompleted = ref(0)
  const announcement = ref('Ready to focus?')

  let intervalId = null
  let lastTick = null

  const remainingSeconds = computed(() => Math.ceil(remainingMilliseconds.value / 1000))
  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  function stopInterval() {
    if (intervalId !== null) clearInterval(intervalId)
    intervalId = null
  }

  function advancePhase(completedNaturally) {
    if (phase.value === PHASES.work) {
      if (completedNaturally) {
        completedWorkSessions.value += 1
        cycleCompleted.value += 1
        onWorkComplete?.()
      }
      phase.value = cycleCompleted.value >= settings.sessionsBeforeLongBreak
        ? PHASES.longBreak
        : PHASES.shortBreak
      announcement.value = completedNaturally ? 'Focus complete. Time for a break.' : 'Break time.'
    } else {
      if (phase.value === PHASES.longBreak) cycleCompleted.value = 0
      phase.value = PHASES.work
      announcement.value = completedNaturally ? 'Break complete. Time to focus.' : 'Focus time.'
    }
    remainingMilliseconds.value = durationInMilliseconds(settings, phase.value)
  }

  function updateCountdown() {
    if (!isRunning.value) return
    const now = Date.now()
    let elapsed = Math.max(0, now - lastTick)
    lastTick = now

    while (elapsed >= remainingMilliseconds.value && isRunning.value) {
      elapsed -= remainingMilliseconds.value
      advancePhase(true)
    }
    remainingMilliseconds.value -= elapsed
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    announcement.value = phase.value === PHASES.work ? 'Focus session running.' : 'Break running.'
    lastTick = Date.now()
    intervalId = setInterval(updateCountdown, 200)
  }

  function pause() {
    if (!isRunning.value) return
    updateCountdown()
    isRunning.value = false
    stopInterval()
    announcement.value = 'Timer paused.'
  }

  function reset() {
    isRunning.value = false
    stopInterval()
    remainingMilliseconds.value = durationInMilliseconds(settings, phase.value)
    announcement.value = 'Timer reset.'
  }

  function skip() {
    if (isRunning.value) updateCountdown()
    advancePhase(false)
    lastTick = Date.now()
  }

  onUnmounted(stopInterval)

  return {
    settings,
    phase,
    remainingMilliseconds,
    remainingSeconds,
    formattedTime,
    isRunning,
    completedWorkSessions,
    cycleCompleted,
    announcement,
    start,
    pause,
    reset,
    skip,
  }
}
