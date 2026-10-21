import { defineConfig, devices } from '@playwright/test';

// Node builds some fixtures (visit dates); give it the same zone as the browser.
process.env.TZ = 'Asia/Kolkata';

const baseURL = process.env.BASE_URL ?? 'http://localhost:4321';

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: process.env.CI ? 90_000 : 60_000,
  // One retry on CI: the Vite dev server compiles each page on first request.
  retries: process.env.CI ? 1 : 0,
  reporter: [['list']],
  // Booking windows and "In 2 days" depend on the clock zone; fix it so a UTC runner matches a developer laptop in India.
  use: { baseURL, channel: 'chrome', trace: 'retain-on-failure', timezoneId: 'Asia/Kolkata' },
  projects: [
    { name: 'phone', use: { ...devices['Pixel 7'], viewport: { width: 360, height: 780 } } },
    { name: 'tablet', use: { viewport: { width: 768, height: 1024 } } },
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
  ],
});
