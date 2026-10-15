import { expect, test } from '@playwright/test'

test('built GitHub Pages app works from its project subpath', async ({ page }) => {
  await page.clock.install()
  await page.goto('/ai-lab-hw5-simple-pomodoro/')

  await expect(page.getByRole('heading', { name: 'Simple Pomodoro' })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText('25:00')
  await expect(page.getByRole('heading', { name: 'How to use it' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Why Pomodoro?' })).toBeVisible()

  await page.getByPlaceholder('What will you work on?').fill('Class report')
  await page.getByRole('button', { name: 'Add task' }).click()
  await page.getByRole('button', { name: 'Select Class report' }).click()
  await page.getByRole('button', { name: 'Dark mode' }).click()
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Work (minutes)').fill('1')
  await page.getByLabel('Play a sound when a phase ends').check()
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(page.getByRole('timer')).toHaveText('01:00')

  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  await expect(page.getByText('Short break', { exact: true })).toBeVisible()
  await expect(page.getByText('Today’s focus sessions').locator('..')).toContainText('1')
  await expect(page.getByRole('listitem').filter({ hasText: 'Class report' })).toContainText('1 / 1')

  await page.reload()
  await expect(page.locator('.app-shell')).toHaveClass(/is-dark/)
  await expect(page.getByRole('listitem').filter({ hasText: 'Class report' })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText('05:00')
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByLabel('Play a sound when a phase ends')).toBeChecked()
})
