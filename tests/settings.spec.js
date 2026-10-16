import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
})

async function saveSettings(page, values) {
  await page.getByRole('button', { name: 'Settings' }).click()
  for (const [label, value] of Object.entries(values)) {
    await page.getByRole('dialog').getByLabel(label).fill(String(value))
  }
  await page.getByRole('button', { name: 'Save settings' }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
}

test('changing the current duration restarts the running phase', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  await expect(page.getByRole('timer')).toHaveText('24:00')

  await saveSettings(page, { 'Work (minutes)': 10 })
  await expect(page.getByRole('timer')).toHaveText('10:00')
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await page.clock.fastForward(60_000)
  await expect(page.getByRole('timer')).toHaveText('09:00')
})

test('settings control the long break and survive a reload', async ({ page }) => {
  await saveSettings(page, {
    'Work (minutes)': 1,
    'Short break (minutes)': 2,
    'Long break (minutes)': 3,
    'Work sessions before a long break': 1,
  })
  await expect(page.getByRole('timer')).toHaveText('01:00')
  await page.reload()
  await expect(page.getByRole('timer')).toHaveText('01:00')
  await expect(page.getByText('Session 1 of 1')).toBeVisible()

  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  await expect(page.getByText('Long break', { exact: true })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText('03:00')
})

test('reopening preserves the exact saved countdown and running state', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  await expect(page.getByRole('timer')).toHaveText('24:00')
  await page.reload()
  await expect(page.getByRole('timer')).toHaveText('24:00')
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()

  await page.clock.fastForward(60_000)
  await expect(page.getByRole('timer')).toHaveText('23:00')
  await page.getByRole('button', { name: 'Pause' }).click()
  await page.reload()
  await expect(page.getByRole('timer')).toHaveText('23:00')
  await expect(page.getByRole('button', { name: 'Start' })).toBeVisible()
})
