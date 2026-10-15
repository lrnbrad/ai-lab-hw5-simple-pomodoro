import { expect, test } from '@playwright/test'

test('theme choice persists and phase colors change', async ({ page }) => {
  await page.goto('/')
  const shell = page.locator('.app-shell')
  const workBackground = await shell.evaluate((element) => getComputedStyle(element).backgroundColor)

  await page.getByRole('button', { name: 'Dark mode' }).click()
  await expect(shell).toHaveClass(/is-dark/)
  const darkBackground = await shell.evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(darkBackground).not.toBe(workBackground)

  await page.reload()
  await expect(shell).toHaveClass(/is-dark/)
  await page.getByRole('button', { name: 'Skip' }).click()
  await expect(shell).toHaveClass(/theme--shortBreak/)
  const breakBackground = await shell.evaluate((element) => getComputedStyle(element).backgroundColor)
  expect(breakBackground).not.toBe(darkBackground)
})

test('guidance is readable and layout fits a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 })
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'How to use it' })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Why Pomodoro?' })).toBeVisible()
  const dimensions = await page.evaluate(() => ({
    pageWidth: document.documentElement.scrollWidth,
    viewportWidth: window.innerWidth,
  }))
  expect(dimensions.pageWidth).toBeLessThanOrEqual(dimensions.viewportWidth)

  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
})
