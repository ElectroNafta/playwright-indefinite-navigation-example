import { defineConfig, devices } from '@playwright/test'

// Set environment variable for Electron testing
process.env.ELECTRON_PLAYWRIGHT_CONFIG = 'true'

export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  forbidOnly: false,
  retries: 0,
  workers: 1,  // Must be 1 for Electron
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'Electron App Tests',
      testMatch: '**/electron-*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
        headless: false,  // Must be false for Electron
      },
    },
    {
      name: 'Web App Tests',
      testMatch: '**/navigation*.spec.ts',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],

  webServer: {
    command: 'npm run dev --prefix ./web-app',
    url: 'http://localhost:5173',
    timeout: 120 * 1000,
    reuseExistingServer: true,
  },
})
