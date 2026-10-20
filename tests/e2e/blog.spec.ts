import { expect, test } from '@playwright/test';
import { axe, hydrated, watch } from './helpers';

const cards = (page: import('@playwright/test').Page) => page.locator('.blog-grid > li:not(:has(.skeleton))');

test('index: page 1, load more, Back restores the list', async ({ page }) => {
  const w = watch(page);
  await page.goto('/blog');
  await expect(cards(page)).toHaveCount(12);
  await axe(page);
  await hydrated(page);
  const more = page.getByRole('link', { name: 'Load more posts' });
  await more.scrollIntoViewIfNeeded();
  await expect(cards(page)).toHaveCount(20, { timeout: 20_000 });
  await expect(more).toHaveCount(0);
  await cards(page).nth(15).getByRole('link').click();
  await page.waitForURL(/\/blog\/[a-z0-9-]+$/);
  await page.goBack();
  await expect(cards(page)).toHaveCount(20, { timeout: 20_000 });
  await w.check();
});

test('index: seed covers are replaced with paper scenes, and neighbours differ', async ({ page }) => {
  await page.goto('/blog');
  await expect(cards(page)).toHaveCount(12);
  // Seed covers are 64 x 64 px placeholders; none may be shown.
  await expect(page.locator('.blog-grid img[src*="/seed/blogs/"]')).toHaveCount(0);
  const scenes = await page.locator('.blog-grid .blog-card-img [data-scene]').evaluateAll((els) => els.map((e) => e.getAttribute('data-scene')));
  expect(scenes).toHaveLength(12);
  for (let i = 1; i < scenes.length; i += 1) expect(scenes.slice(Math.max(0, i - 3), i), `card ${i}`).not.toContain(scenes[i]);
});

test('index: a failed next page shows an error and a retry', async ({ page }) => {
  await page.route(/\/api\/v1\/blog\/posts\?.*cursor=/, (route) => route.abort('connectionfailed'));
  await page.goto('/blog');
  await hydrated(page);
  await page.getByRole('link', { name: 'Load more posts' }).scrollIntoViewIfNeeded();
  await expect(page.getByText('More posts did not load.')).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('link', { name: 'Try again' })).toBeVisible();
  await expect(cards(page)).toHaveCount(12);
});

test('index: filters are links and filtered pages are noindex', async ({ page }) => {
  await page.goto('/blog');
  await page.getByRole('navigation', { name: 'Categories' }).getByRole('link', { name: /Rental Tips/ }).click();
  await expect(page).toHaveURL(/\?category=rental-tips/);
  await expect(page.getByRole('heading', { level: 1, name: 'Rental Tips' })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.getByRole('searchbox', { name: 'Search the blog' }).fill('zzzqqq');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.getByRole('heading', { name: 'No posts match this' })).toBeVisible();
  await page.getByRole('link', { name: 'See all posts' }).click();
  await expect(cards(page)).toHaveCount(12);
});

test('post: content, meta, share and related posts', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('/blog/understanding-rera-first-time-buyer-guide');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText("Understanding RERA: A First-Time Buyer's Guide");
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://360ghar.com/blog/understanding-rera-first-time-buyer-guide');
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  expect(ld.filter((x) => x.includes('"BlogPosting"'))).toHaveLength(1);
  await expect(page.getByRole('link', { name: 'Share on WhatsApp' })).toHaveAttribute('href', /wa\.me/);
  await expect(page.locator('.post-related .blog-card')).toHaveCount(3);
  await expect(page.locator('.post-hero svg[data-scene="seal"]')).toBeVisible();
  const rail = page.getByRole('complementary', { name: 'With this post' });
  await expect(rail.getByRole('link', { name: /^RERA projects/i })).toHaveAttribute('href', '/rera-projects');
  await rail.getByRole('link', { name: /^RERA projects/i }).scrollIntoViewIfNeeded();
  await expect(rail.getByRole('link', { name: /^RERA projects/i })).toBeVisible();
  await axe(page);
  await w.check();
  expect((await request.get('/blog/2', { maxRedirects: 0 })).status()).toBe(301);
  expect((await request.get('/blog/no-such-post-here')).status()).toBe(404);
});
