<script setup>
import { computed, ref } from 'vue'
import { usePomodoro } from './composables/usePomodoro'
import { useDailyProgress } from './composables/useDailyProgress'
import { useTasks } from './composables/useTasks'
import TaskList from './components/TaskList.vue'
import SettingsDialog from './components/SettingsDialog.vue'
import { playCompletionTone } from './audio'

const taskList = useTasks()
const dailyProgress = useDailyProgress()
const soundEnabled = ref(loadSoundPreference())
const timer = usePomodoro({
  onWorkComplete: () => {
    taskList.creditSelectedTask()
    dailyProgress.recordSession()
  },
  onPhaseComplete: () => {
    if (soundEnabled.value) playCompletionTone()
  },
})

function loadSoundPreference() {
  try {
    return localStorage.getItem('simple-pomodoro:sound') === 'true'
  } catch {
    return false
  }
}

const phaseDetails = {
  work: { label: 'Focus', prompt: 'One thing at a time.' },
  shortBreak: { label: 'Short break', prompt: 'Take a breath and stretch.' },
  longBreak: { label: 'Long break', prompt: 'You have earned a longer rest.' },
}

const currentPhase = computed(() => phaseDetails[timer.phase.value])
const cycleTarget = computed(() => timer.settings.sessionsBeforeLongBreak)
const settingsOpen = ref(false)

function saveSettings({ settings, soundEnabled: nextSoundEnabled }) {
  if (!timer.updateSettings(settings)) return
  soundEnabled.value = nextSoundEnabled
  try {
    localStorage.setItem('simple-pomodoro:sound', String(nextSoundEnabled))
  } catch {
    // The sound choice still works for this open page.
  }
  settingsOpen.value = false
}
</script>

<template>
  <div class="min-h-screen px-4 py-8 text-stone-800 sm:px-6 sm:py-12" :class="`theme--${timer.phase.value}`">
    <main class="mx-auto max-w-2xl">
      <header class="mb-10 text-center sm:mb-14">
        <p class="mb-2 text-xs font-semibold uppercase tracking-[0.28em] text-stone-500">A quiet place to begin</p>
        <h1 class="font-serif text-4xl font-semibold tracking-tight sm:text-5xl">Simple Pomodoro</h1>
        <button class="secondary-button mt-5" type="button" @click="settingsOpen = true">Settings</button>
      </header>

      <section class="timer-card rounded-[2rem] p-6 text-center shadow-lg shadow-stone-300/20 sm:p-10" aria-label="Pomodoro timer">
        <div class="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-current/15 px-4 py-2 text-sm font-semibold">
          <span class="phase-dot h-2.5 w-2.5 rounded-full"></span>
          {{ currentPhase.label }}
        </div>

        <p class="mb-2 text-sm text-stone-500">{{ currentPhase.prompt }}</p>
        <div class="timer-display my-4 font-mono text-[clamp(5rem,19vw,9rem)] font-light leading-none tracking-tighter tabular-nums" role="timer" aria-label="Time remaining">
          {{ timer.formattedTime.value }}
        </div>
        <p class="mb-8 text-sm text-stone-500">Cycle progress: {{ timer.cycleCompleted.value }} / {{ cycleTarget }} completed · Session {{ Math.min(timer.cycleCompleted.value + 1, cycleTarget) }} of {{ cycleTarget }}</p>

        <div class="flex flex-wrap items-center justify-center gap-3">
          <button v-if="!timer.isRunning.value" class="primary-button" type="button" @click="timer.start">Start</button>
          <button v-else class="primary-button" type="button" @click="timer.pause">Pause</button>
          <button class="secondary-button" type="button" @click="timer.reset">Reset</button>
          <button class="secondary-button" type="button" @click="timer.skip">Skip</button>
        </div>
        <p class="mt-8 min-h-6 text-sm text-stone-500" role="status">{{ timer.announcement.value }}</p>
      </section>

      <div class="mt-7 flex flex-wrap items-center justify-center gap-5 text-sm text-stone-600">
        <div class="flex items-center gap-2">
          <span class="font-medium">Completed work sessions</span>
          <span class="rounded-full bg-white/80 px-3 py-1 font-semibold">{{ timer.completedWorkSessions.value }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="font-medium">Today’s focus sessions</span>
          <span class="rounded-full bg-white/80 px-3 py-1 font-semibold">{{ dailyProgress.todayCount.value }}</span>
        </div>
      </div>

      <p v-if="taskList.selectedTask.value" class="mt-4 text-center text-sm text-stone-600">
        Focusing on <strong>{{ taskList.selectedTask.value.name }}</strong>
        · {{ taskList.selectedTask.value.completed }} / {{ taskList.selectedTask.value.estimate }} Pomodoros
      </p>

      <TaskList
        :tasks="taskList.tasks.value"
        :selected-task-id="taskList.selectedTaskId.value"
        @add="taskList.addTask"
        @edit="taskList.editTask"
        @select="taskList.selectTask"
        @complete="taskList.toggleTaskComplete"
        @delete="taskList.deleteTask"
      />
    </main>
    <SettingsDialog :open="settingsOpen" :settings="timer.settings" :sound-enabled="soundEnabled" @close="settingsOpen = false" @save="saveSettings" />
  </div>
</template>
