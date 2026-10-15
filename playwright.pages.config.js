import { defineConfig } from '@playwright/test'

const origin = 'http://127.0.0.1:4174'
const projectPath = '/ai-lab-hw5-simple-pomodoro/'

export default defineConfig({
  testDir: './tests',
  testMatch: 'pages.spec.js',
  use: {
    baseURL: origin,
    browserName: 'chromium',
    launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
      : {},
  },
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4174 --strictPort',
    url: `${origin}${projectPath}`,
    reuseExistingServer: !process.env.CI,
  },
})
