/** /app: official badges only for live stores, the OS notice on a phone, the Smart App Banner on FlatMates pages only. */
import { expect, test } from '@playwright/test';
import { hydrated } from './helpers';

const PLAY_GHAR = /play\.google\.com\/store\/apps\/details\?id=com\.the360ghar\.ghar360$/;
const PLAY_FLAT = /play\.google\.com\/store\/apps\/details\?id=com\.the360ghar\.flatmates360$/;
const IOS_FLAT = 'https://apps.apple.com/in/app/360-flatmates/id6771899300';

test('/app lists a badge only where the app is live', async ({ page }) => {
  await page.goto('/app');
  const main = page.locator('main');
  await expect(main.getByRole('link', { name: 'Get 360Ghar on Google Play' })).toHaveAttribute('href', PLAY_GHAR);
  await expect(main.getByRole('link', { name: 'Get 360 FlatMates on Google Play' })).toHaveAttribute('href', PLAY_FLAT);
  await expect(main.getByRole('link', { name: 'Download 360 FlatMates on the App Store' })).toHaveAttribute('href', IOS_FLAT);
  await expect(main.getByRole('link', { name: /Download 360Ghar on the App Store/ })).toHaveCount(0);
  await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveAttribute('content', 'app-id=6771899300');
  await expect(page.locator('main img[src$="app-store.svg"]')).toHaveCount(1);
});

test('the home page has no Smart App Banner', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('meta[name="apple-itunes-app"]')).toHaveCount(0);
});

test('an iPhone sees the store notice', async ({ browser }) => {
  const ctx = await browser.newContext({ userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148', viewport: { width: 390, height: 800 } });
  const page = await ctx.newPage();
  await page.goto('/app');
  await hydrated(page);
  await expect(page.getByRole('status').filter({ hasText: 'You are on an iPhone or iPad' })).toContainText('360Ghar for iPhone is not out yet');
  await ctx.close();
});
