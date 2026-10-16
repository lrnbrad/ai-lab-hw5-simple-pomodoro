import { computed, ref } from 'vue'

const STORAGE_KEY = 'simple-pomodoro:tasks'

function loadSavedTasks() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY))
    if (!saved || !Array.isArray(saved.tasks)) return { tasks: [], selectedTaskId: null }

    const tasks = saved.tasks.filter((task) =>
      typeof task.id === 'string'
      && typeof task.name === 'string'
      && task.name.trim()
      && Number.isInteger(task.estimate)
      && task.estimate > 0
      && Number.isInteger(task.completed)
      && task.completed >= 0
      && typeof task.isComplete === 'boolean',
    )
    const selectedTaskId = tasks.some((task) => task.id === saved.selectedTaskId && !task.isComplete)
      ? saved.selectedTaskId
      : null
    return { tasks, selectedTaskId }
  } catch {
    return { tasks: [], selectedTaskId: null }
  }
}

export function useTasks() {
  const saved = loadSavedTasks()
  const tasks = ref(saved.tasks)
  const selectedTaskId = ref(saved.selectedTaskId)
  const selectedTask = computed(() => tasks.value.find((task) => task.id === selectedTaskId.value) ?? null)

  function persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tasks: tasks.value,
        selectedTaskId: selectedTaskId.value,
      }))
    } catch {
      // The task list remains usable when browser storage is unavailable.
    }
  }

  function addTask(name, estimate) {
    const trimmedName = name.trim()
    const parsedEstimate = Number(estimate)
    if (!trimmedName || !Number.isInteger(parsedEstimate) || parsedEstimate < 1) return false

    const task = {
      id: crypto.randomUUID(),
      name: trimmedName,
      estimate: parsedEstimate,
      completed: 0,
      isComplete: false,
    }
    tasks.value.push(task)
    persist()
    return true
  }

  function editTask(id, name, estimate) {
    const task = tasks.value.find((item) => item.id === id)
    const trimmedName = name.trim()
    const parsedEstimate = Number(estimate)
    if (!task || !trimmedName || !Number.isInteger(parsedEstimate) || parsedEstimate < 1) return false
    task.name = trimmedName
    task.estimate = parsedEstimate
    persist()
    return true
  }

  function selectTask(id) {
    const task = tasks.value.find((item) => item.id === id)
    if (!task || task.isComplete) return
    selectedTaskId.value = id
    persist()
  }

  function toggleTaskComplete(id) {
    const task = tasks.value.find((item) => item.id === id)
    if (!task) return
    task.isComplete = !task.isComplete
    if (task.isComplete && selectedTaskId.value === id) selectedTaskId.value = null
    persist()
  }

  function deleteTask(id) {
    tasks.value = tasks.value.filter((task) => task.id !== id)
    if (selectedTaskId.value === id) selectedTaskId.value = null
    persist()
  }

  function creditSelectedTask() {
    const task = selectedTask.value
    if (!task || task.isComplete) return
    task.completed += 1
    persist()
  }

  return {
    tasks,
    selectedTaskId,
    selectedTask,
    addTask,
    editTask,
    selectTask,
    toggleTaskComplete,
    deleteTask,
    creditSelectedTask,
  }
}
