import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E + accessibility (axe) config. Tests run against the production
 * server (`npm run serve:prod`) on port 8080 so they exercise the real build.
 *
 * In sandboxed containers set `PLAYWRIGHT_CHROMIUM_PATH` to a pre-installed
 * Chromium binary; in CI the browser is installed normally and the var is unset.
 */
const chromiumPath = process.env.PLAYWRIGHT_CHROMIUM_PATH;
const launchOptions = {
  args: ['--no-sandbox'],
  ...(chromiumPath ? { executablePath: chromiumPath } : {}),
};

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list'], ['html', { open: 'never', outputFolder: 'playwright-report' }]],
  use: {
    baseURL: 'http://localhost:8080',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop-chromium',
      use: { ...devices['Desktop Chrome'], channel: undefined, launchOptions },
    },
    {
      name: 'mobile-chromium',
      use: { ...devices['Pixel 5'], channel: undefined, launchOptions },
    },
  ],
  webServer: {
    command: 'npm run serve:prod',
    url: 'http://localhost:8080/api/health',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
