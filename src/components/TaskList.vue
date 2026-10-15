<script setup>
import { ref } from 'vue'

const props = defineProps({
  tasks: { type: Array, required: true },
  selectedTaskId: { type: String, default: null },
})

const emit = defineEmits(['add', 'edit', 'select', 'complete', 'delete'])

const newName = ref('')
const newEstimate = ref(1)
const editingId = ref(null)
const editName = ref('')
const editEstimate = ref(1)

function add() {
  if (!newName.value.trim()) return
  emit('add', newName.value, newEstimate.value)
  newName.value = ''
  newEstimate.value = 1
}

function beginEdit(task) {
  editingId.value = task.id
  editName.value = task.name
  editEstimate.value = task.estimate
}

function saveEdit() {
  if (!editName.value.trim()) return
  emit('edit', editingId.value, editName.value, editEstimate.value)
  editingId.value = null
}
</script>

<template>
  <section class="surface-card mt-8 rounded-[2rem] p-6 sm:p-8" aria-labelledby="tasks-heading">
    <div class="mb-5 flex items-baseline justify-between gap-3">
      <h2 id="tasks-heading" class="font-serif text-2xl font-semibold">Tasks</h2>
      <span class="muted-text text-sm">Choose one to focus on</span>
    </div>

    <form class="mb-6 flex flex-wrap items-end gap-3" @submit.prevent="add">
      <label class="min-w-48 flex-1 text-sm font-medium">
        Task name
        <input v-model="newName" class="task-input mt-1 w-full" type="text" maxlength="120" placeholder="What will you work on?" required>
      </label>
      <label class="w-32 text-sm font-medium">
        Estimate
        <input v-model.number="newEstimate" class="task-input mt-1 w-full" type="number" min="1" step="1" required>
      </label>
      <button class="primary-button" type="submit">Add task</button>
    </form>

    <p v-if="tasks.length === 0" class="empty-task rounded-2xl border border-dashed p-5 text-center text-sm">
      Add a task to give your next focus session a purpose.
    </p>

    <ul v-else class="space-y-3">
      <li v-for="task in tasks" :key="task.id" class="task-item rounded-2xl border p-4" :class="{ 'is-selected': task.id === selectedTaskId }">
        <form v-if="editingId === task.id" class="flex flex-wrap items-end gap-3" @submit.prevent="saveEdit">
          <label class="min-w-44 flex-1 text-sm font-medium">
            Task name
            <input v-model="editName" class="task-input mt-1 w-full" type="text" maxlength="120" required>
          </label>
          <label class="w-28 text-sm font-medium">
            Estimate
            <input v-model.number="editEstimate" class="task-input mt-1 w-full" type="number" min="1" step="1" required>
          </label>
          <button class="secondary-button" type="submit">Save</button>
          <button class="secondary-button" type="button" @click="editingId = null">Cancel</button>
        </form>
        <div v-else class="flex flex-wrap items-center justify-between gap-3">
          <div class="min-w-0 flex-1">
            <p class="break-words font-semibold" :class="{ 'completed-task line-through': task.isComplete }">{{ task.name }}</p>
            <p class="muted-text mt-1 text-sm">{{ task.completed }} / {{ task.estimate }} Pomodoros</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <button v-if="!task.isComplete" class="task-action" type="button" :aria-label="`Select ${task.name}`" :disabled="task.id === selectedTaskId" @click="emit('select', task.id)">
              {{ task.id === selectedTaskId ? 'Selected' : 'Select' }}
            </button>
            <button class="task-action" type="button" :aria-label="`Edit ${task.name}`" @click="beginEdit(task)">Edit</button>
            <button class="task-action" type="button" :aria-label="`${task.isComplete ? 'Reopen' : 'Complete'} ${task.name}`" @click="emit('complete', task.id)">
              {{ task.isComplete ? 'Reopen' : 'Complete' }}
            </button>
            <button class="task-action" type="button" :aria-label="`Delete ${task.name}`" @click="emit('delete', task.id)">Delete</button>
          </div>
        </div>
      </li>
    </ul>
  </section>
</template>
