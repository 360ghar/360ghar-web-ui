import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: process.env.CI ? 90_000 : 60_000,
  // One retry on CI: the Vite dev server compiles each page on first request.
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  use: { baseURL, channel: 'chrome', trace: 'retain-on-failure' },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
