import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.clock.install()
  await page.goto('/')
})

test('start, pause, reset, and skip change the visible timer', async ({ page }) => {
  await expect(page.getByRole('timer')).toHaveText('25:00')
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  await expect(page.getByRole('timer')).toHaveText('24:00')

  await page.getByRole('button', { name: 'Pause' }).click()
  await page.clock.fastForward(60_000)
  await expect(page.getByRole('timer')).toHaveText('24:00')

  await page.getByRole('button', { name: 'Reset' }).click()
  await expect(page.getByRole('timer')).toHaveText('25:00')
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(page.getByText('Short break', { exact: true })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText('05:00')
  await expect(page.getByText('Completed work sessions').locator('..')).toContainText('0')
})

test('completed work automatically starts a break and counts the session', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(25 * 60_000)
  await expect(page.getByText('Short break', { exact: true })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText('05:00')
  await expect(page.getByText('Completed work sessions').locator('..')).toContainText('1')
  await expect(page.getByRole('button', { name: 'Pause' })).toBeVisible()
  await page.clock.fastForward(5 * 60_000)
  await expect(page.getByText('Focus', { exact: true })).toBeVisible()
  await expect(page.getByRole('timer')).toHaveText('25:00')
})

test('four completed focus sessions lead to a long break and cycle reset', async ({ page }) => {
  await page.getByRole('button', { name: 'Start' }).click()
  for (let session = 1; session <= 4; session += 1) {
    await page.clock.fastForward(25 * 60_000)
    await expect(page.getByText('Completed work sessions').locator('..')).toContainText(String(session))
    await expect(page.getByText(session === 4 ? 'Long break' : 'Short break', { exact: true })).toBeVisible()
    await expect(page.getByRole('timer')).toHaveText(session === 4 ? '15:00' : '05:00')
    await page.clock.fastForward((session === 4 ? 15 : 5) * 60_000)
    await expect(page.getByText('Focus', { exact: true })).toBeVisible()
    await expect(page.getByRole('timer')).toHaveText('25:00')
  }
  await expect(page.getByText('Session 1 of 4')).toBeVisible()
})
