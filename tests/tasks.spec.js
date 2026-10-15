import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
})

async function addTask(page, name, estimate = 1) {
  await page.getByPlaceholder('What will you work on?').fill(name)
  await page.getByLabel('Estimate').fill(String(estimate))
  await page.getByRole('button', { name: 'Add task' }).click()
}

test('tasks can be planned, selected, edited, completed, and removed', async ({ page }) => {
  await addTask(page, 'Read chapter 3', 2)
  await expect(page.getByText('Read chapter 3')).toBeVisible()
  await expect(page.getByText('Focusing on')).toHaveCount(0)

  await page.getByRole('button', { name: 'Select Read chapter 3' }).click()
  await expect(page.getByText(/Focusing on/)).toContainText('Read chapter 3')

  await page.getByRole('button', { name: 'Edit Read chapter 3' }).click()
  const editingTask = page.getByRole('listitem').filter({ has: page.getByLabel('Task name') })
  await editingTask.getByLabel('Task name').fill('Review chapter 3')
  await editingTask.getByLabel('Estimate').fill('3')
  await editingTask.getByRole('button', { name: 'Save' }).click()
  await expect(page.getByRole('listitem').getByText('Review chapter 3')).toBeVisible()
  await expect(page.getByText('0 / 3 Pomodoros').first()).toBeVisible()

  await page.reload()
  await expect(page.getByText(/Focusing on/)).toContainText('Review chapter 3')
  await page.getByRole('button', { name: 'Complete Review chapter 3' }).click()
  await expect(page.getByText(/Focusing on/)).toHaveCount(0)
  await page.reload()
  await expect(page.getByRole('button', { name: 'Reopen Review chapter 3' })).toBeVisible()
  await page.getByRole('button', { name: 'Delete Review chapter 3' }).click()
  await expect(page.getByText('Review chapter 3')).toHaveCount(0)
})

test('only a completed work phase credits the selected task', async ({ page }) => {
  await addTask(page, 'Write outline', 2)
  await page.getByRole('button', { name: 'Select Write outline' }).click()

  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('0 / 2 Pomodoros').first()).toBeVisible()
  await page.getByRole('button', { name: 'Skip' }).click()
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByText('0 / 2 Pomodoros').first()).toBeVisible()

  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(25 * 60_000)
  await expect(page.getByText('1 / 2 Pomodoros').first()).toBeVisible()
  await page.reload()
  await expect(page.getByText('1 / 2 Pomodoros').first()).toBeVisible()
})
