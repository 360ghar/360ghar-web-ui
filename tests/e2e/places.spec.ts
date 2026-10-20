/**
 * Place pages: the localities directory, a locality and its buy and rent
 * pages, projects, the city hubs and the "near" pages. Read-only: no test
 * writes to the API.
 */
import { expect, test } from '@playwright/test';
import { axe, backendDown, hydrated, watch } from './helpers';

test('directory: type buttons, search, letters and the places with homes', async ({ page }) => {
  // The directory holds all 3,215 places: axe needs more than a minute on the phone profile.
  test.slow();
  const w = watch(page);
  await page.goto('/localities');
  await expect(page.getByRole('heading', { level: 1, name: 'Localities' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut street of Gurugram places/ })).toBeVisible();
  await axe(page);
  await expect(page.locator('[data-dir]')).toHaveAttribute('data-ready', '');

  const count = page.locator('[data-dir-count]');
  const all = Number((await count.innerText()).replace(/\D/g, ''));
  const sectors = page.locator('.dir-types').getByRole('button', { name: /^Sector/ });
  await sectors.click();
  await expect(sectors).toHaveAttribute('aria-pressed', 'true');
  await expect(count).not.toHaveText(`${all.toLocaleString('en-IN')} results`);
  await expect(page.locator('.dir-list li:not([hidden]) .dir-t').first()).toBeHidden();

  const q = page.getByRole('searchbox', { name: 'Locality name' });
  await q.fill('sector 56');
  await expect(count).toHaveText(/^[1-9]\d* results$/);
  await expect(page.locator('.dir-list li:not([hidden])').first()).toContainText('Sector 56');
  await q.fill('zzzzqqq');
  await expect(page.getByText('No locality matches. Try fewer words.')).toBeVisible();
  await q.fill('');
  await page.locator('.dir-types').getByRole('button', { name: /^All/ }).click();
  await expect(count).toHaveText(`${all.toLocaleString('en-IN')} results`);

  // "Browse by type" in the hero picks the type and goes to the list.
  await page.locator('.dir-mix').getByRole('link', { name: /^Societies/ }).click();
  await expect(page.locator('.dir-types').getByRole('button', { name: /^Society/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('#dir-all')).toBeInViewport();
  await page.locator('.dir-types').getByRole('button', { name: /^All/ }).click();

  await page.locator('.dir-letters').getByRole('link', { name: 'P', exact: true }).click();
  await page.waitForURL(/#dir-P$/, { timeout: 40_000, waitUntil: 'commit' });

  // A place with live homes opens its guide.
  const listed = page.locator('.lp-card').first();
  if (await listed.count()) {
    const name = (await listed.locator('h3').innerText()).trim();
    await listed.locator('h3 a').click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(name);
  }
  await w.check();
});

test('locality: vignette, facts, landmarks, checklist, FAQ and links', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('/locality/sector-56-gurgaon');
  await expect(page.getByRole('heading', { level: 1, name: 'Sector 56' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut sector street/ })).toBeVisible();
  await expect(page.locator('.ph-aside')).toContainText(/No homes listed yet|homes? listed|could not load/);
  await expect(page.locator('.ph-aside')).toContainText('Sector 55-56 Metro');
  await expect(page.getByRole('heading', { name: 'How far things are' })).toBeVisible();
  await expect(page.locator('.lm-row')).toHaveCount(4);
  await expect(page.getByRole('heading', { name: 'Check before you decide' })).toBeVisible();
  await axe(page);

  const faq = page.locator('#loc-faq-title').locator('..').locator('details').first();
  await faq.locator('summary').click();
  await expect(faq).toHaveAttribute('open', '');

  const circle = page.getByRole('link', { name: 'Circle rates in Sector 56' });
  if (await circle.count()) await expect(circle).toHaveAttribute('href', /^\/circle-rate\/gurugram-sector-56-/);

  await page.getByRole('link', { name: 'Buy in Sector 56' }).click();
  await page.waitForURL(/\/locality\/sector-56-gurgaon\/buy$/, { timeout: 40_000, waitUntil: 'commit' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Homes for sale in Sector 56');
  await hydrated(page);
  await axe(page);
  await page.getByRole('link', { name: 'Rent in Sector 56 instead' }).click();
  await page.waitForURL(/\/locality\/sector-56-gurgaon\/rent$/, { timeout: 40_000, waitUntil: 'commit' });
  await w.check();

  expect((await request.get('/locality/sector-56', { maxRedirects: 0 })).headers()['location']).toBe('/locality/sector-56-gurgaon');
  expect((await request.get('/locality/sector-56-gurgaon/sale', { maxRedirects: 0 })).status()).toBe(301);
  expect((await request.get('/locality/not-a-real-place-xyz')).status()).toBe(404);
});

test('locality: a place with live homes shows them, matched exactly', async ({ page }) => {
  const w = watch(page);
  await page.goto('/locality/palam-vihar-gurgaon');
  await expect(page.getByRole('heading', { level: 1, name: 'Palam Vihar' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut colony/ })).toBeVisible();
  const cards = page.locator('.loc-grid > li');
  if (await cards.count()) {
    await expect(page.locator('.ph-aside .pf-text.is-strong').first()).toHaveText(/^\d+ homes? listed$/);
    // With 3 or more real prices the hero gives the middle half; otherwise "from".
    await expect(page.locator('.ph-aside')).toContainText(/for sale · (most homes ₹[\d.,]+ (L|Cr) to ₹[\d.,]+ (L|Cr)|from ₹)/);
    for (const card of await cards.all()) await expect(card).toContainText('Palam Vihar');
    const sale = page.getByRole('link', { name: /^All \d+ for sale$/ });
    if (await sale.count()) {
      await sale.click();
      await page.waitForURL(/\/locality\/palam-vihar-gurgaon\/buy$/, { timeout: 40_000, waitUntil: 'commit' });
    }
  }
  await w.check();
});

test('locality: Hindi page and a place with no landmarks', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi/locality/sector-56-gurgaon');
  await expect(page.getByRole('heading', { level: 1, name: 'Sector 56' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'फ़ैसले से पहले जाँचें' })).toBeVisible();
  await expect(page.getByText('Sector 56 में सर्कल रेट क्या हैं?')).toBeVisible();
  await axe(page);
  await page.goto('/locality/ansal-plaza-gurgaon');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut project site/ })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'How far things are' })).toHaveCount(0);
  await w.check();
});

test('locality: the buy page works with the backend down in the browser', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/locality/sector-85-gurgaon/rent');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Homes for rent in Sector 85');
  await hydrated(page);
  await w.check();
});

test('projects: counts, cards in line, detail with the honest fallback', async ({ page, request }) => {
  const w = watch(page);
  await page.goto('/project');
  await expect(page.getByRole('heading', { level: 1, name: 'Projects in Gurugram' })).toBeVisible();
  await axe(page);
  const cards = page.locator('.pj-card');
  await expect(cards).toHaveCount(8);
  await expect(cards.first().locator('.pj-count')).toHaveText(/\d+ homes? now|No homes yet/);
  // The foot of every card in a row sits on one line.
  const feet = await cards.locator('.pj-foot').evaluateAll((els) => els.map((e) => Math.round(e.getBoundingClientRect().top + window.scrollY)));
  const cols = await page.evaluate(() => getComputedStyle(document.querySelector('.pjs-grid')!).gridTemplateColumns.split(' ').length);
  for (let i = 0; i + cols <= feet.length; i += cols) expect(new Set(feet.slice(i, i + cols)).size).toBe(1);

  await page.getByRole('link', { name: 'Luxury Apartments in Sector 62' }).click();
  await page.waitForURL(/\/project\/luxury-apartments-in-sector-62$/, { timeout: 40_000, waitUntil: 'commit' });
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Luxury Apartments in Sector 62');
  await expect(page.locator('.ph-sheet')).toContainText('Apartments');
  const note = page.getByText(/No apartments are listed in Sector 62 yet/);
  if (await note.count()) await expect(page.getByRole('heading', { name: 'Homes like this elsewhere in Gurugram' })).toBeVisible();
  await axe(page);
  await page.locator('.ph-sheet').getByRole('link', { name: /Sector 62/ }).click();
  await page.waitForURL(/\/locality\/sector-62-gurgaon$/, { timeout: 40_000, waitUntil: 'commit' });
  await page.goBack();
  await page.locator('.pj-others a').first().click();
  await page.waitForURL(/\/project\/[a-z0-9-]+$/, { timeout: 40_000, waitUntil: 'commit' });
  await w.check();

  expect((await request.get('/project/no-such-project')).status()).toBe(404);
  expect((await request.get('/projects', { maxRedirects: 0 })).status()).toBe(301);
  expect((await request.get('/hi/project/villa-projects-in-dlf-phase-2')).status()).toBe(200);
});

test('city hub: live counts, places with homes, near links; empty cities are noindex', async ({ page }) => {
  const w = watch(page);
  await page.goto('/gurgaon');
  await expect(page.getByRole('heading', { level: 1, name: 'Homes in Gurgaon' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut city/ })).toBeVisible();
  await expect(page.locator('.ph-aside .pf-text.is-strong').first()).toHaveText(/^\d+ homes listed|No homes listed yet|could not load/);
  const photos = await page.locator('.lp-card img').evaluateAll((els) => els.map((e) => e.getAttribute('src')));
  expect(new Set(photos).size, 'no photo repeats across place cards').toBe(photos.length);
  await axe(page);
  await page.getByRole('link', { name: 'Near Medanta Hospital' }).click();
  await page.waitForURL(/\/near\/medanta$/, { timeout: 40_000, waitUntil: 'commit' });
  await expect(page.getByRole('img', { name: /Paper-cut hospital/ })).toBeVisible();
  await page.goto('/gurgaon');
  await page.getByRole('link', { name: 'DLF Phase 1', exact: true }).click();
  await page.waitForURL(/\/locality\/dlf-phase-1-gurgaon$/, { timeout: 40_000, waitUntil: 'commit' });
  await w.check();

  await page.goto('/delhi');
  await expect(page.getByRole('heading', { level: 1, name: 'Homes in Delhi' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut Delhi: India Gate/ })).toBeVisible();
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  await page.goto('/hi/gurgaon');
  await expect(page.getByRole('heading', { level: 1, name: 'गुड़गाँव में घर' })).toBeVisible();
  await axe(page);
});

test('one-segment paths that are not a city get the shared 404 page', async ({ page, request }) => {
  for (const path of ['/no-such-page', '/hi/no-such-page']) {
    const res = await page.goto(path);
    expect(res?.status()).toBe(404);
    await expect(page.locator('.not-found-places')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  expect((await request.get('/gurgaon')).status()).toBe(200);
});

test('near: vignette, facts, results and links to the other places', async ({ page }) => {
  const w = watch(page);
  await page.goto('/near/cyber-city');
  await expect(page.getByRole('heading', { level: 1, name: 'Homes near Cyber City' })).toBeVisible();
  await expect(page.getByRole('img', { name: /Paper-cut office district/ })).toBeVisible();
  // One scene of about 15 KB at most.
  expect(await page.locator('.vig-box').evaluate((e) => e.outerHTML.length)).toBeLessThanOrEqual(15_000);
  await expect(page.locator('.ph-aside .pf-text.is-strong').first()).toHaveText(/within 5 km|No homes within 5 km yet|could not load/);
  await expect(page.locator('.ph-aside a').first()).toHaveAttribute('href', /^\/near\/[a-z0-9-]+$/);
  await hydrated(page);
  await axe(page);
  await page.getByRole('link', { name: 'Near Sectors 55-56 Rapid Metro' }).click();
  await page.waitForURL(/\/near\/sector-55-56-metro$/, { timeout: 40_000, waitUntil: 'commit' });
  await expect(page.getByRole('img', { name: /Paper-cut metro station/ })).toBeVisible();
  await w.check();
});

test('near: works with the backend down in the browser, and 404s', async ({ page, request }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/near/ambience-mall');
  await expect(page.getByRole('heading', { level: 1, name: 'Homes near Ambience Mall' })).toBeVisible();
  await hydrated(page);
  await w.check();
  expect((await request.get('/near/nowhere-at-all')).status()).toBe(404);
});
