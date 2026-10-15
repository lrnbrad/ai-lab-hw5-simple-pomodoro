import { onMounted, onUnmounted, ref } from 'vue'

const STORAGE_KEY = 'simple-pomodoro:daily-progress'

function localDayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

function loadProgress() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (saved?.date === localDayKey() && Number.isInteger(saved.count) && saved.count >= 0) {
      return saved.count
    }
  } catch {
    // Start a fresh daily count if saved data cannot be read.
  }
  return 0
}

export function useDailyProgress() {
  const date = ref(localDayKey())
  const todayCount = ref(loadProgress())
  let midnightTimeout = null

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: date.value, count: todayCount.value }))
    } catch {
      // The visible count still works if browser storage is unavailable.
    }
  }

  function syncDay() {
    const currentDate = localDayKey()
    if (currentDate !== date.value) {
      date.value = currentDate
      todayCount.value = 0
      persist()
    }
  }

  function scheduleMidnight() {
    clearTimeout(midnightTimeout)
    const nextMidnight = new Date()
    nextMidnight.setHours(24, 0, 0, 0)
    midnightTimeout = setTimeout(() => {
      syncDay()
      scheduleMidnight()
    }, nextMidnight.getTime() - Date.now())
  }

  function recordSession() {
    syncDay()
    todayCount.value += 1
    persist()
  }

  function onVisibilityChange() {
    if (document.visibilityState === 'visible') {
      syncDay()
      scheduleMidnight()
    }
  }

  onMounted(() => {
    syncDay()
    scheduleMidnight()
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onUnmounted(() => {
    clearTimeout(midnightTimeout)
    document.removeEventListener('visibilitychange', onVisibilityChange)
  })

  return { todayCount, recordSession }
}
