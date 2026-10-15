import { expect, test } from '@playwright/test'

test.use({ timezoneId: 'Asia/Taipei' })

async function setOneMinuteWork(page) {
  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('dialog').getByLabel('Work (minutes)').fill('1')
  await page.getByRole('button', { name: 'Save settings' }).click()
}

test('completed work updates the cycle and local daily total', async ({ page }) => {
  await page.clock.install({ time: new Date('2026-10-16T15:58:00.000Z') })
  await page.goto('/')
  await setOneMinuteWork(page)
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)

  await expect(page.getByText('Cycle progress: 1 / 4 completed', { exact: false })).toBeVisible()
  await expect(page.getByText('Today’s focus sessions').locator('..')).toContainText('1')
  await expect(page.getByRole('status')).toContainText('Focus complete')

  await page.reload()
  await expect(page.getByText('Today’s focus sessions').locator('..')).toContainText('1')
  await page.clock.fastForward(60_000)
  await expect(page.getByText('Today’s focus sessions').locator('..')).toContainText('0')
})

test('completion sound is opt-in and the preference survives reload', async ({ page }) => {
  await page.clock.install()
  await page.addInitScript(() => {
    window.__toneStarts = 0
    window.AudioContext = class {
      currentTime = 0
      destination = {}
      createOscillator() {
        return {
          frequency: { setValueAtTime() {} },
          connect() {},
          start() { window.__toneStarts += 1 },
          stop() {},
        }
      }
      createGain() {
        return {
          gain: { setValueAtTime() {}, exponentialRampToValueAtTime() {} },
          connect() {},
        }
      }
      close() {}
    }
  })
  await page.goto('/')
  await setOneMinuteWork(page)
  await page.getByRole('button', { name: 'Start' }).click()
  await page.clock.fastForward(60_000)
  expect(await page.evaluate(() => window.__toneStarts)).toBe(0)

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByRole('checkbox', { name: 'Play a sound when a phase ends' }).check()
  await page.getByRole('button', { name: 'Save settings' }).click()
  await page.reload()
  await page.getByRole('button', { name: 'Settings' }).click()
  await expect(page.getByRole('checkbox', { name: 'Play a sound when a phase ends' })).toBeChecked()
  await page.getByRole('button', { name: 'Close settings' }).click()

  await page.getByRole('button', { name: 'Skip' }).click()
  await page.clock.fastForward(60_000)
  expect(await page.evaluate(() => window.__toneStarts)).toBe(1)
})
