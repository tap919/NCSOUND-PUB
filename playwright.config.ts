import { defineConfig, devices } from '@playwright/test';

// E2E tests require live environment variables (TEST_URL, VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY).
// When running locally without these vars, E2E tests are skipped — run unit tests via `npm run test:unit` instead.
// In CI, these vars must be configured as secrets for the E2E job.
const hasLiveEnvVars = !!(process.env.TEST_URL && process.env.VITE_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);

export default defineConfig({
  testDir: './e2e',
  // Skip the entire e2e directory when live env vars are missing
  testIgnore: hasLiveEnvVars ? undefined : '**/*.spec.ts',
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  timeout: 60000,
  globalSetup: './e2e/global-setup.ts',
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: process.env.TEST_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000/api/health',
    reuseExistingServer: true,
    timeout: 60000,
  },
});
