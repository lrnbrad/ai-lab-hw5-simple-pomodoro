<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
  open: { type: Boolean, required: true },
  settings: { type: Object, required: true },
})

const emit = defineEmits(['close', 'save'])
const draft = reactive({ work: 25, shortBreak: 5, longBreak: 15, sessionsBeforeLongBreak: 4 })

watch(() => props.open, (open) => {
  if (open) Object.assign(draft, props.settings)
}, { immediate: true })

function save() {
  emit('save', { ...draft })
}
</script>

<template>
  <div v-if="open" class="settings-overlay fixed inset-0 z-20 flex items-center justify-center p-4">
    <section class="settings-panel w-full max-w-md rounded-[2rem] p-6 shadow-2xl sm:p-8" role="dialog" aria-modal="true" aria-labelledby="settings-heading">
      <div class="mb-6 flex items-center justify-between gap-4">
        <h2 id="settings-heading" class="font-serif text-2xl font-semibold">Timer settings</h2>
        <button class="task-action" type="button" aria-label="Close settings" @click="emit('close')">Close</button>
      </div>
      <form class="space-y-5" @submit.prevent="save">
        <label class="block text-sm font-medium">
          Work (minutes)
          <input v-model.number="draft.work" class="task-input mt-1 w-full" type="number" min="1" max="180" step="1" required>
        </label>
        <label class="block text-sm font-medium">
          Short break (minutes)
          <input v-model.number="draft.shortBreak" class="task-input mt-1 w-full" type="number" min="1" max="120" step="1" required>
        </label>
        <label class="block text-sm font-medium">
          Long break (minutes)
          <input v-model.number="draft.longBreak" class="task-input mt-1 w-full" type="number" min="1" max="120" step="1" required>
        </label>
        <label class="block text-sm font-medium">
          Work sessions before a long break
          <input v-model.number="draft.sessionsBeforeLongBreak" class="task-input mt-1 w-full" type="number" min="1" max="8" step="1" required>
        </label>
        <p class="text-sm text-stone-500">Changing the current phase length restarts that phase immediately.</p>
        <button class="primary-button w-full" type="submit">Save settings</button>
      </form>
    </section>
  </div>
</template>
