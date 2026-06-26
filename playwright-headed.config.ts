import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 90000,
  globalSetup: './e2e/global-setup.ts',
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    headless: false,
    launchOptions: {
      slowMo: 500,
    },
    video: 'on',
    screenshot: 'on',
    trace: 'on',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  reporter: 'list',
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
