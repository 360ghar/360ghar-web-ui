import { expect, test, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, watch } from './helpers';

/** Opens a page, checks the H1 and waits for every island. */
async function open(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), path).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await hydrated(page);
}

/** Axe once lists have finished loading (stale rows are dimmed while a filter loads). */
async function a11y(page: Page) {
  await expect(page.locator('.dh-body[aria-busy="true"]')).toHaveCount(0, { timeout: 20_000 });
  await axe(page);
}
const OFFLINE = /offline|server is busy|Something broke|taking too long/i;

// ---------- Editorial holds: the records pages answer 200 with a fixed notice ----------
// (features/data-hub holds the copy; its unit tests gate the wording. When a hold
// lifts, replace the hold row with the real page test again.)

const HOLDS: [path: string, en: string, hi: string | null][] = [
  ['/circle-rates', 'Circle rates unavailable', 'सर्कल रेट उपलब्ध नहीं हैं'],
  ['/stamp-duty-calculator', 'Stamp duty estimate unavailable', 'स्टैंप ड्यूटी का अनुमान उपलब्ध नहीं'],
  ['/price-index', 'Property price data under review', null],
  ['/price-index/gurgaon', 'Property price data under review', null],
  ['/bank-auctions', 'Bank auction listings under review', 'बैंक नीलामी लिस्टिंग समीक्षा के अधीन'],
  ['/auction-sources', 'Auction source directory under review', 'नीलामी स्रोत निर्देशिका समीक्षा के अधीन'],
  ['/regulatory-updates', 'Regulatory records under review', 'नियामक रिकॉर्ड समीक्षा के अधीन'],
  ['/tenant-demand-heatmap', 'Tenant-demand research under review', 'किरायेदार मांग रिसर्च समीक्षा के अधीन'],
];

for (const [path, en, hi] of HOLDS) {
  test(`editorial hold: ${path}`, async ({ page }) => {
    const w = watch(page);
    await open(page, path);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(en);
    await axe(page);
    await w.check();
    if (hi) {
      await open(page, `/hi${path}`);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(hi);
      await w.check();
    }
  });
}

test('circle rate detail: any slug lands on the hold page', async ({ page }) => {
  expect((await page.goto('/circle-rate/gurugram-sector-999-residential'))?.status()).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Circle rates unavailable');
});

test('price index: unknown city is a real 404', async ({ page }) => {
  expect((await page.goto('/price-index/mumbai'))?.status()).toBe(404);
});

// ---------- Live data-hub pages: RERA projects, builder reputation, verify ownership ----------

test('rera: search, status, load more, number check', async ({ page }) => {
  // The verify lookup is mocked so the branch does not depend on what the live
  // backend has on record today.
  await page.route(/\/data-hub\/rera-projects\/verify\//, (route) => {
    const n = decodeURIComponent(route.request().url().split('/verify/')[1] ?? '');
    if (n === 'HRERA-GGM-189-847') {
      return route.fulfill({ json: { valid: true, verification_status: 'registered', status: 'completed', project_name: 'DLF Park Place', official_source_url: 'https://haryanarera.gov.in' } });
    }
    return route.fulfill({ json: { valid: null, verification_status: 'unknown', status: null, project_name: null, official_source_url: 'https://haryanarera.gov.in/view_project/search_project' } });
  });
  const w = watch(page);
  await open(page, '/rera-projects');
  const items = page.locator('.dh-rows > li');
  await expect(items.first()).toBeVisible();
  const more = page.getByRole('button', { name: 'Load more' });
  if (await more.isVisible()) await more.click();
  await expect.poll(() => items.count()).toBeGreaterThan(12);

  await page.getByRole('searchbox', { name: 'Project or developer' }).fill('DLF');
  await expect(page).toHaveURL(/q=DLF/);
  await page.getByRole('radio', { name: 'Completed' }).click();
  await expect(page).toHaveURL(/status=completed/);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\/rera-projects$/);

  await page.getByLabel('RERA registration number').fill('HRERA-GGM-189-847');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText('Found: DLF Park Place')).toBeVisible();
  await page.getByLabel('RERA registration number').fill('NOT-A-NUMBER');
  await page.getByRole('button', { name: 'Check', exact: true }).click();
  await expect(page.getByText(/No project with this number/)).toBeVisible();
  await a11y(page);
  await w.check();
});

test('rera: status mix has one square per project', async ({ page }) => {
  await open(page, '/rera-projects');
  const mix = page.locator('.dh-mix');
  const lead = await mix.locator('.dh-meta').first().textContent();
  const n = Number(/all (\d+) projects/.exec(lead ?? '')?.[1]);
  expect(n).toBeGreaterThan(0);
  await expect(mix.locator('svg rect')).toHaveCount(n);
  const counts = await mix.locator('.dh-mix-keys b').allTextContents();
  expect(counts.reduce((a, b) => a + Number(b), 0)).toBe(n);
  await watch(page).check();
});

test('rera: a new filter shows the offline state with retry', async ({ page }) => {
  await page.goto('/rera-projects');
  await hydrated(page);
  await backendDown(page);
  await page.getByRole('radio', { name: 'Revoked' }).click();
  await expect(page.getByText(OFFLINE).first()).toBeVisible({ timeout: 20_000 });
  await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
});

test('verify ownership: signed-out users are asked to sign in', async ({ page }) => {
  const w = watch(page);
  await open(page, '/verify-ownership');
  await expect(page.getByRole('heading', { name: 'Sign in to look up land records' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sign in/ }).last()).toHaveAttribute('href', '/login?next=%2Fverify-ownership');
  await a11y(page);
  await w.check();
});

test('builder reputation: controls, empty states, 404', async ({ page }) => {
  const w = watch(page);
  await open(page, '/builder-reputation');
  await page.getByRole('radio', { name: 'Score, high to low' }).click();
  await expect(page).toHaveURL(/order_by=score/);
  await page.getByRole('searchbox', { name: 'Builder name' }).fill('Nobody Builders');
  await expect(page).toHaveURL(/q=Nobody/);
  await expect(page.getByRole('heading', { name: /No builder matches|not ready yet/ })).toBeVisible();
  await a11y(page);
  await w.check();
  expect((await page.goto('/builder-reputation/no-such-builder'))?.status()).toBe(404);
});

test('builder reputation: a filter shows the offline state', async ({ page }) => {
  await page.goto('/builder-reputation');
  await hydrated(page);
  await backendDown(page);
  await page.getByRole('radio', { name: 'Score, high to low' }).click();
  await expect(page.getByText(OFFLINE).first()).toBeVisible({ timeout: 20_000 });
});

test('data hub headers: the page scene from 768 px', async ({ page }, info) => {
  for (const path of ['/rera-projects', '/builder-reputation']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const art = page.locator('.dh-head-art');
    if (info.project.name === 'phone') await expect(art).toBeHidden();
    else await expect(art.locator('svg.vignette')).toBeVisible();
  }
});
