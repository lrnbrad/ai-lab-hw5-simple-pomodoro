import { computed, onMounted, onUnmounted, reactive, ref } from 'vue'

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
const STORAGE_KEY = 'simple-pomodoro:timer'
const DURATION_LIMITS = {
  work: [1, 180],
  shortBreak: [1, 120],
  longBreak: [1, 120],
  sessionsBeforeLongBreak: [1, 8],
}

function validSetting(key, value) {
  const [minimum, maximum] = DURATION_LIMITS[key]
  return Number.isInteger(value) && value >= minimum && value <= maximum
}

function loadSavedTimer() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || typeof saved !== 'object') return null

    const settings = { ...DEFAULT_SETTINGS }
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      if (validSetting(key, saved.settings?.[key])) settings[key] = saved.settings[key]
    }

    const phase = Object.values(PHASES).includes(saved.phase) ? saved.phase : PHASES.work
    const fullDuration = durationInMilliseconds(settings, phase)
    const remainingMilliseconds = Number.isFinite(saved.remainingMilliseconds)
      && saved.remainingMilliseconds > 0
      && saved.remainingMilliseconds <= fullDuration
      ? saved.remainingMilliseconds
      : fullDuration

    return {
      settings,
      phase,
      remainingMilliseconds,
      isRunning: saved.isRunning === true,
      completedWorkSessions: Number.isInteger(saved.completedWorkSessions)
        && saved.completedWorkSessions >= 0 ? saved.completedWorkSessions : 0,
      cycleCompleted: Number.isInteger(saved.cycleCompleted)
        && saved.cycleCompleted >= 0 ? saved.cycleCompleted : 0,
    }
  } catch {
    return null
  }
}

export function usePomodoro({ onWorkComplete } = {}) {
  const saved = loadSavedTimer()
  const settings = reactive(saved?.settings ?? { ...DEFAULT_SETTINGS })
  const phase = ref(saved?.phase ?? PHASES.work)
  const remainingMilliseconds = ref(saved?.remainingMilliseconds ?? durationInMilliseconds(settings, phase.value))
  const isRunning = ref(saved?.isRunning ?? false)
  const completedWorkSessions = ref(saved?.completedWorkSessions ?? 0)
  const cycleCompleted = ref(saved?.cycleCompleted ?? 0)
  const announcement = ref(saved ? 'Session restored.' : 'Ready to focus?')

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

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        settings: { ...settings },
        phase: phase.value,
        remainingMilliseconds: remainingMilliseconds.value,
        isRunning: isRunning.value,
        completedWorkSessions: completedWorkSessions.value,
        cycleCompleted: cycleCompleted.value,
      }))
    } catch {
      // The timer remains usable if browser storage is unavailable.
    }
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
    persist()
  }

  function start() {
    if (isRunning.value) return
    isRunning.value = true
    announcement.value = phase.value === PHASES.work ? 'Focus session running.' : 'Break running.'
    lastTick = Date.now()
    intervalId = setInterval(updateCountdown, 200)
    persist()
  }

  function pause() {
    if (!isRunning.value) return
    updateCountdown()
    isRunning.value = false
    stopInterval()
    announcement.value = 'Timer paused.'
    persist()
  }

  function reset() {
    isRunning.value = false
    stopInterval()
    remainingMilliseconds.value = durationInMilliseconds(settings, phase.value)
    announcement.value = 'Timer reset.'
    persist()
  }

  function skip() {
    if (isRunning.value) updateCountdown()
    advancePhase(false)
    lastTick = Date.now()
    persist()
  }

  function updateSettings(nextSettings) {
    let currentDurationChanged = false
    for (const key of Object.keys(DEFAULT_SETTINGS)) {
      const value = Number(nextSettings[key])
      if (!validSetting(key, value)) return false
      if (key === phase.value && settings[key] !== value) currentDurationChanged = true
    }

    for (const key of Object.keys(DEFAULT_SETTINGS)) settings[key] = Number(nextSettings[key])
    if (currentDurationChanged) {
      remainingMilliseconds.value = durationInMilliseconds(settings, phase.value)
      lastTick = Date.now()
      announcement.value = 'Current session restarted with the new duration.'
    } else {
      announcement.value = 'Settings saved.'
    }
    persist()
    return true
  }

  onMounted(() => {
    if (isRunning.value) {
      lastTick = Date.now()
      intervalId = setInterval(updateCountdown, 200)
    }
  })

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
    updateSettings,
  }
}
