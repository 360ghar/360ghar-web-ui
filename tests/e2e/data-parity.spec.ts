import { expect, test, type Page } from '@playwright/test';
import { axe, hydrated, watch } from './helpers';

async function open(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), path).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await hydrated(page);
}

test('zone checker: the empty state points to real pages', async ({ page }) => {
  const w = watch(page);
  await open(page, '/zone-checker');
  await page.getByRole('searchbox', { name: 'Sector' }).fill('Sector 999');
  const empty = page.locator('section', { has: page.getByRole('heading', { name: /No zoning data for/ }) });
  await expect(empty).toBeVisible();
  await expect(empty.getByRole('link', { name: 'RERA projects' })).toHaveAttribute('href', '/rera-projects');
  await expect(empty.getByRole('link', { name: 'Verify ownership' })).toHaveAttribute('href', '/verify-ownership');
  await expect(empty.getByRole('link', { name: 'See circle rates' })).toHaveAttribute('href', /\/circle-rates\?sector=Sector%20999/);
  await axe(page);
  await w.check();
  // Both pages exist.
  for (const href of ['/rera-projects', '/verify-ownership']) expect((await page.request.get(href)).status(), href).toBe(200);
});

test('zone checker (Hindi): the empty state links stay in Hindi', async ({ page }) => {
  await open(page, '/hi/zone-checker');
  await page.getByRole('searchbox', { name: 'सेक्टर' }).fill('Sector 999');
  const empty = page.locator('section', { has: page.getByRole('heading', { name: /का ज़ोनिंग डेटा नहीं मिला/ }) });
  await expect(empty.getByRole('link', { name: 'RERA प्रोजेक्ट' })).toHaveAttribute('href', '/hi/rera-projects');
  await expect(empty.getByRole('link', { name: 'मालिकाना हक जाँचें' })).toHaveAttribute('href', '/hi/verify-ownership');
});

test('celebrity homes: every link on the page resolves, and names without a post are not links', async ({ page }) => {
  const w = watch(page);
  await open(page, '/celebrity-homes');
  // All 16 names show. A name is a link only when its blog post exists.
  await expect(page.locator('.celeb-list > li')).toHaveCount(16);
  const links = await page.locator('.celeb-list a').evaluateAll((els) => els.map((e) => e.getAttribute('href')));
  for (const href of links) expect((await page.request.get(href!)).status(), href!).toBe(200);
  const plain = await page.locator('.celeb-list > li > p.celeb-name').count();
  expect(plain + links.length).toBe(16);
  if (plain) await expect(page.locator('.celeb-note')).toBeVisible();
  await axe(page);
  await w.check();
});

// Thin localities (owner decision 2026-09-29): scraped "projects in X" names 301 to their real twin,
// seed-invented names stay 200 with noindex, and neither is listed. Written, not run (QA runs it later).
const SCRAPED = '/locality/projects-in-golf-course-road-gurgaon';
const TWIN = '/locality/golf-course-road-gurgaon';
const SEED = '/locality/huda-sector-10-gurgaon';

test('scraped locality: 301 to the real twin, English and Hindi, with the query string kept', async ({ request }) => {
  const cases: [string, string][] = [
    [SCRAPED, TWIN],
    [`${SCRAPED}?q=1`, `${TWIN}?q=1`],
    [`${SCRAPED}/rent?bhk=2`, `${TWIN}/rent?bhk=2`],
    [`/hi${SCRAPED}`, `/hi${TWIN}`],
    [`/hi${SCRAPED}/buy?q=1`, `/hi${TWIN}/buy?q=1`],
    ['/locality/projects-in-golf-course-road', TWIN],
    // Upper case. A trailing slash is covered in src/lib/redirects.test.ts: the astro dev server answers 404 to any
    // trailing slash before the middleware runs (vite-plugin-astro-server trailing-slash.js), so HTTP cannot test it here.
    ['/Locality/Projects-In-Golf-Course-Road-Gurgaon', TWIN],
  ];
  for (const [from, to] of cases) {
    const res = await request.get(from, { maxRedirects: 0 });
    expect(res.status(), from).toBe(301);
    expect(new URL(res.headers().location!, 'http://x').pathname + new URL(res.headers().location!, 'http://x').search, from).toBe(to);
    // One hop: the target answers 200, not another redirect.
    expect((await request.get(to, { maxRedirects: 0 })).status(), to).toBe(200);
  }
});

test('seed-invented locality: 200 with noindex, not in the localities sitemap', async ({ page, request }) => {
  const res = await page.goto(SEED);
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);
  const intent = await page.goto(`${SEED}/buy`);
  expect(intent?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  const xml = await (await request.get('/sitemap-localities.xml')).text();
  expect(xml).not.toContain('huda-sector-10-gurgaon');
  expect(xml).not.toContain('projects-in-');
});

test('twin locality: indexable and in the sitemap', async ({ page, request }) => {
  const res = await page.goto(TWIN);
  expect(res?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).not.toHaveAttribute('content', /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /\/locality\/golf-course-road-gurgaon$/);
  const xml = await (await request.get('/sitemap-localities.xml')).text();
  expect(xml).toContain('https://360ghar.com/locality/golf-course-road-gurgaon</loc>');
  expect((xml.match(/<url>/g) ?? []).length).toBe(6039 * 2);
});

test('localities directory: no "projects in" or made-up seed names', async ({ page }) => {
  await open(page, '/localities');
  await expect(page.locator('[data-dir-root] a', { hasText: /^projects in /i })).toHaveCount(0);
  await expect(page.locator('[data-dir-root] a', { hasText: /^HUDA Sector \d+$/ })).toHaveCount(0);
  await expect(page.locator('[data-dir-count]')).toHaveText(/2,043 results/);
  const hrefs = await page.locator('[data-dir-root] a').evaluateAll((els) => els.map((e) => e.getAttribute('href') ?? ''));
  expect(hrefs.some((h) => h.includes('/locality/projects-in-'))).toBe(false);
});
