/**
 * Home, property detail, projects, localities, landing, auth and account.
 * No test writes to the production API: every POST, PUT and DELETE is mocked.
 */
import { expect, test } from '@playwright/test';
import { axe, backendDown, hydrated, signedIn, watch } from './helpers';

test('home: the hero search goes to the listing with the filters', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await axe(page);
  await hydrated(page);
  const form = page.getByRole('search', { name: 'Find a home' });
  await form.locator('label', { hasText: 'Buy' }).click();
  await form.getByRole('button', { name: 'Search' }).click();
  // Only the target URL matters; do not wait for the listing page to finish loading.
  await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
  expect(new URL(page.url()).searchParams.get('purpose')).toBe('buy');
  await w.check();
});

test('home: works with the backend down in the browser', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await w.check();
});

test('property: facts, gallery viewer, contact and 404', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('/property/182');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await axe(page);
  await hydrated(page);
  const open = page.getByRole('button', { name: /Open photo|photos/ }).first();
  await open.click();
  const viewer = page.getByRole('dialog', { name: 'Media viewer' });
  await expect(viewer).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(page.getByRole('link', { name: /^Call \+91/ }).first()).toBeVisible();
  await w.check();
  expect((await request.get('/property/99999999')).status()).toBe(404);
  expect((await request.get('/property/abc')).status()).toBe(404);
});

test('property: booking a visit sends a signed-out user to sign in', async ({ page }, info) => {
  await page.goto('/property/182');
  // Server HTML says "Request this visit"; after hydration a signed-out user sees the sign-in label.
  // Scroll the panel (not the label, which may already have changed) so the island hydrates.
  await page.locator('#prop-book').scrollIntoViewIfNeeded();
  // Below 64rem the form opens in a sheet.
  if (info.project.name !== 'desktop') await page.locator('#prop-book').getByRole('button', { name: 'Book a visit' }).click();
  const book = page.getByRole('button', { name: 'Sign in to book a visit' }).filter({ visible: true }).first();
  await expect(book).toBeVisible({ timeout: 20_000 });
  await book.click();
  await page.waitForURL(/\/login\?next=%2Fproperty%2F182/);
});

test('project routes: legacy aliases and unknown slugs', async ({ page, request }) => {
  await page.goto('/project/luxury-apartments-in-sector-62');
  await expect(page.getByRole('heading', { level: 1, name: 'Project details are under review' })).toBeVisible();
  expect((await request.get('/project/no-such-project')).status()).toBe(404);
  expect((await request.get('/projects', { maxRedirects: 0 })).status()).toBe(301);
});

test('localities: the directory filter, a locality and its old URL', async ({ page, request }) => {
  // The directory holds all 3,215 places: axe needs more than a minute on the phone profile.
  test.slow();
  const w = watch(page);
  await page.goto('/localities');
  await axe(page);
  await expect(page.locator('[data-dir]')).toHaveAttribute('data-ready', '');
  const q = page.getByRole('searchbox', { name: 'Locality name' });
  await q.fill('zzzzqqq');
  await expect(page.getByText('No locality matches. Try fewer words.')).toBeVisible();
  await q.fill('sector 56');
  await expect(page.locator('[data-dir-count]')).not.toHaveText(/^0 /);
  await page.goto('/locality/sector-56-gurgaon');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await axe(page);
  await w.check();
  expect((await request.get('/locality/sector-56', { maxRedirects: 0 })).status()).toBe(301);
  expect((await request.get('/locality/sector-56-gurgaon/rent')).status()).toBe(200);
  expect((await request.get('/locality/not-a-real-place-xyz')).status()).toBe(404);
});

test('landing: live numbers, price chart, a facet link, the empty page and old aliases', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('/gurgaon/buy/builder-floor');
  await expect(page.getByRole('heading', { level: 1 })).toContainText(/sale in Gurgaon/i);
  // Live numbers come from the listed homes; the chart has one dot per home.
  await expect(page.locator('.landing-live')).toContainText(/\d+ homes listed now\. Most are ₹[\d.]+ (Cr|L) to ₹[\d.]+ (Cr|L)\./);
  // The ₹10 Cr stand-in price never sets the range.
  await expect(page.locator('.landing-live')).not.toContainText('₹10 Cr');
  await expect(page.locator('.lp-dot').first()).toBeAttached();
  await axe(page);
  await hydrated(page);
  // Locked facets are part of the page: no removable chips, no purpose or type groups in the filters.
  await expect(page.locator('.results-chip')).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Looking to' })).toHaveCount(0);
  await page.locator('.landing-facets').getByRole('link', { name: /3 BHK/ }).first().click();
  await page.waitForURL(/\/gurgaon\/buy\/builder-floor\/3-bhk$/);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('3 BHK');
  await w.check();

  // A page with no homes says so and links to pages that have homes, with counts.
  await page.goto('/gurgaon/rent/flats');
  await hydrated(page);
  await expect(page.getByRole('heading', { name: /^No flats for rent in Gurgaon right now$/ })).toBeVisible();
  const next = page.locator('.results-empty').getByRole('link').first();
  await expect(next).toHaveText(/· \d+/);
  const href = (await next.getAttribute('href'))!;
  expect((await request.get(href)).status()).toBe(200);
  await axe(page);
  await w.check();
  expect((await request.get('/gurugram/rent/apartments', { maxRedirects: 0 })).headers()['location']).toBe('/gurgaon/rent/flats');
  // Unknown types, intents or facets get the shared 404 page, with a real 404 status.
  for (const url of ['/gurgaon/rent/castles', '/gurgaon/no-such-intent/flats', '/gurgaon/buy/flats/9-bhk', '/hi/no/such/page']) {
    const res = await request.get(url);
    expect(res.status(), url).toBe(404);
    expect(await res.text(), url).toContain('class="container-page not-found');
  }
});

test('auth: sign-in checks the identifier and moves to the password step', async ({ page }) => {
  const w = watch(page);
  await page.route(/\/api\/v1\/auth\/identifier-status/, (route) => route.fulfill({ json: { exists: true, verified: true, has_password: true, next_step: 'password' } }));
  await page.goto('/login');
  const id = page.getByLabel('Mobile number or email');
  await expect(id).toBeVisible();
  await axe(page);
  await id.fill('12');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.locator('.field-error').first()).toBeVisible();
  await id.fill('tester@example.com');
  await page.getByRole('button', { name: 'Continue', exact: true }).click();
  await expect(page.getByLabel('Password')).toBeVisible();
  await w.check();
});

test('account: signed out asks to sign in; signed in shows the tabs', async ({ page }) => {
  await page.goto('/account');
  await expect(page.getByRole('link', { name: 'Sign in' }).last()).toHaveAttribute('href', /\/login\?next=%2Faccount/);

  await signedIn(page);
  const empty = { items: [], next_cursor: null, has_more: false, limit: 20, total: 0 };
  await page.route(/\/api\/v1\/(swipes|properties\/me|visits\/(upcoming|past))/, (route) => route.fulfill({ json: empty }));
  const w = watch(page);
  await page.goto('/account?tab=favourites');
  await expect(page.getByRole('tab', { name: 'Saved homes' })).toHaveAttribute('aria-selected', 'true');
  await axe(page);
  await page.getByRole('tab', { name: 'My listings' }).click();
  await expect(page.getByRole('tab', { name: 'My listings' })).toHaveAttribute('aria-selected', 'true');
  await w.check();
});
