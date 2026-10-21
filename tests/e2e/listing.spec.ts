import { expect, test, type Locator, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, signedIn, watch } from './helpers';

test('listing: filters, URL, load more, back restores', async ({ page }, info) => {
  const w = watch(page);
  await page.goto('/properties');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await hydrated(page);
  const cards = page.locator('.results-item');
  await expect(cards.first()).toBeVisible();
  const before = await cards.count();

  const desktop = info.project.name === 'desktop';
  if (desktop) {
    await page.locator('.results-side').getByRole('radio', { name: '2 BHK' }).click();
  } else {
    await page.getByRole('button', { name: /^Filters/ }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await sheet.getByRole('radio', { name: '2 BHK' }).click();
    await sheet.getByRole('button', { name: /^(Show \d[\d,]* homes|Show homes|No homes match)$/ }).click();
    await expect(sheet).toBeHidden();
  }
  await expect(page).toHaveURL(/bedrooms_min=2&bedrooms_max=2/);
  await expect(page.getByRole('button', { name: /Remove filter: 2 BHK/ })).toBeVisible();

  // Remove the chip again, then load more.
  await page.getByRole('button', { name: /Remove filter: 2 BHK/ }).click();
  await expect(page).not.toHaveURL(/bedrooms_min/);
  const more = page.getByRole('button', { name: 'Load more homes' });
  if (await more.isVisible()) {
    await more.click();
    await expect.poll(async () => cards.count()).toBeGreaterThan(before);
  }

  // Open a home and come back: the list and scroll come back.
  await page.mouse.wheel(0, 1200);
  const y = await page.evaluate(() => window.scrollY);
  const count = await cards.count();
  await cards.nth(Math.min(count - 1, 4)).locator('h3 a').click();
  await expect(page).toHaveURL(/\/property\/\d+/);
  await page.goBack();
  await hydrated(page);
  await expect.poll(async () => cards.count()).toBeGreaterThanOrEqual(count);
  await expect.poll(async () => page.evaluate(() => window.scrollY)).toBeGreaterThan(Math.min(y, 400) - 50);
  await w.check();
  await axe(page);
});

test('listing: the card, quick filters, list view and the compare tray', async ({ page }, info) => {
  const w = watch(page);
  await page.goto('/properties?purpose=buy');
  await hydrated(page);
  const card = page.locator('.results-item').first();
  await expect(card).toBeVisible();
  // Sale cards show the price per sq ft, the place (locality first) and the photo count.
  await expect(card.getByText(/₹[\d,]+\/sq ft/)).toBeVisible();
  await expect(card.getByText(/\d+ photos/)).toBeVisible();
  await expect(page.locator('.results-count')).toContainText('for sale');

  if (info.project.name !== 'desktop') {
    // Quick filters replace the sidebar below 1024 px.
    const quick = page.getByRole('group', { name: 'Quick filters' });
    await quick.getByRole('button', { name: '3 BHK' }).click();
    await expect(page).toHaveURL(/bedrooms_min=3&bedrooms_max=3/);
    await expect(quick.getByRole('button', { name: '3 BHK' })).toHaveAttribute('aria-pressed', 'true');
    await quick.getByRole('button', { name: 'Rent' }).click();
    await expect(page).toHaveURL(/purpose=rent/);
    await quick.getByRole('button', { name: 'Rent' }).click();
    await expect(page).not.toHaveURL(/purpose=/);
    await page.goto('/properties?purpose=buy');
    await hydrated(page);
  } else {
    await expect(page.getByRole('group', { name: 'Quick filters' })).toBeHidden();
    // A budget preset with no purpose picked also picks "Buy".
    await page.goto('/properties');
    await hydrated(page);
    await page.locator('.results-side').getByRole('button', { name: '≤ ₹2 Cr' }).click();
    await expect(page).toHaveURL(/purpose=buy.*price_max=20000000/);
    await expect(page.locator('.results-side').getByText('₹2 Cr', { exact: true })).toBeVisible();
    await page.goto('/properties?purpose=buy');
    await hydrated(page);
    // List view: the row shows the main photo and, on a wide row, two more.
    await page.getByRole('button', { name: 'List view' }).click();
    await expect(page.locator('.results-grid.is-list')).toBeVisible();
    await expect(page.locator('.results-item').first().locator('img')).toHaveCount(3);
    await page.getByRole('button', { name: 'Grid view' }).click();
  }

  // Compare two homes: the tray counts them and links to /compare.
  const toggles = page.locator('.pcard-compare');
  await toggles.nth(0).click();
  await expect(toggles.nth(0)).toHaveAttribute('aria-pressed', 'true');
  await toggles.nth(1).click();
  const tray = page.getByRole('region', { name: 'Compare' });
  await expect(tray).toContainText('Compare 2 homes');
  await expect(tray.getByRole('link', { name: 'Compare' })).toHaveAttribute('href', /\/compare\?ids=\d+,\d+$/);
  await tray.getByRole('button', { name: 'Clear' }).click();
  await expect(tray).toBeHidden();
  await w.check();
  await axe(page);
});

/** Steps a card's photo strip: buttons on a fine pointer, a native scroll on touch. */
async function stepStrip(page: Page, card: Locator) {
  const strip = card.locator('.pcard-strip');
  const count = card.locator('[data-pcs-count]');
  await strip.scrollIntoViewIfNeeded();
  await expect(count).toHaveText(/^1 \/ [2-4]$/);
  const n = Number((await count.textContent())!.split('/')[1]);
  if (await page.evaluate(() => matchMedia('(pointer: fine)').matches)) {
    // Fine pointer (mouse, trackpad): the buttons show on hover and step one photo at a time.
    await strip.hover();
    const next = card.getByRole('button', { name: `Next photo, 2 of ${n}` });
    await expect(next).toBeVisible();
    await next.click();
    await expect(count).toHaveText(`2 / ${n}`);
    const prev = card.getByRole('button', { name: `Previous photo, 1 of ${n}` });
    await expect(prev).toBeVisible();
    await prev.click();
    await expect(count).toHaveText(`1 / ${n}`);
  } else {
    // Touch: the first touch readies the strip (photos 2 to 4 wait for it); no buttons;
    // the strip scrolls natively and the count follows.
    await strip.dispatchEvent('touchstart');
    await expect(count).toBeVisible();
    await expect(card.locator('[data-pcs="next"]')).toBeHidden();
    await strip.evaluate((s) => s.scrollBy({ left: s.clientWidth }));
    await expect(count).toHaveText(`2 / ${n}`);
  }
  // The second photo is a real photo, not an empty box.
  await expect.poll(() => strip.locator('img').nth(1).evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
  // A photo still opens the home.
  expect(await strip.locator('a').first().evaluate((a) => (a as HTMLAnchorElement).href)).toMatch(/\/property\/\d+$/);
}

test('listing: the photo strip scrolls on touch and steps with the buttons', async ({ page }) => {
  const w = watch(page);
  await page.goto('/properties?purpose=buy');
  await hydrated(page);
  const card = page.locator('.results-item').filter({ has: page.locator('.pcard-strip') }).first();
  // The first photo keeps the list's loading rules; the others wait for the strip
  // (data-src until the first touch, hover or focus, or the page load; then lazy, low priority).
  const imgs = card.locator('.pcard-strip img');
  expect(await imgs.first().getAttribute('loading')).toBe('eager');
  expect(await imgs.first().getAttribute('src')).toBeTruthy();
  expect(await imgs.nth(1).getAttribute('data-src')).toBeTruthy();
  expect(await imgs.nth(1).getAttribute('fetchpriority')).toBe('low');
  expect(await imgs.nth(1).getAttribute('loading')).toBe('lazy');
  await stepStrip(page, card);
  await w.check();
  await axe(page);
});

test('listing: the strip works on a server-drawn page and in a client-only island', async ({ page, request }) => {
  const w = watch(page);
  // Server-drawn cards (Astro, no island): similar homes on a property page.
  await page.goto('/property/182');
  const similar = page.locator('.prop-similar article').filter({ has: page.locator('.pcard-strip') });
  if (await similar.count()) await stepStrip(page, similar.first());
  // Client-only island: saved homes on the account page (the list is mocked with real homes).
  const homes = (await (await request.get('https://api.360ghar.com/api/v1/properties?limit=4')).json()) as { items: unknown[] };
  await signedIn(page);
  await page.route(/\/api\/v1\/swipes/, (r) => r.fulfill({ json: { items: homes.items, next_cursor: null, has_more: false, limit: 20, total: homes.items.length } }));
  await page.goto('/account?tab=favorites');
  await hydrated(page);
  const saved = page.locator('main article').filter({ has: page.locator('.pcard-strip') });
  await expect(saved.first()).toBeVisible();
  await stepStrip(page, saved.first());
  await w.check();
  await axe(page);
});

test('listing: on a slow phone the strips wait for the island to hydrate', async ({ page }) => {
  const w = watch(page);
  const logs: string[] = [];
  page.on('console', (m) => logs.push(m.text()));
  // The island's code arrives after the load event (held until then), on a slow CPU.
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  let release = () => {};
  const held = new Promise<void>((f) => (release = f));
  await page.route(/\/SearchResults[\w.-]*\.(tsx|js)(\?|$)/, async (r) => {
    await held;
    await r.continue();
  });
  // When the island hydrates, none of its strips may have been changed yet.
  await page.addInitScript(() => {
    new MutationObserver((ms) => {
      for (const m of ms)
        if (m.target instanceof Element && !m.target.hasAttribute('ssr'))
          (window as Window & { __early?: number }).__early = m.target.querySelectorAll('.pcard-strip[data-ready], .pcard-strip img[data-src][src]').length;
    }).observe(document, { subtree: true, attributes: true, attributeFilter: ['ssr'] });
  });
  await page.goto('/properties?purpose=buy', { waitUntil: 'load' });
  // The load event came first: the strips are still waiting.
  expect(await page.locator('astro-island[ssr] .pcard-strip').count()).toBeGreaterThan(0);
  // Past the load work of photoStrip.ts (idle, at most 2 s): still untouched.
  await page.waitForTimeout(2500);
  expect(await page.locator('astro-island[ssr] .pcard-strip[data-ready]').count()).toBe(0);
  release();
  await hydrated(page);
  expect(await page.evaluate(() => (window as Window & { __early?: number }).__early)).toBe(0);
  // Then every strip gets its photos, and React logged no mismatch.
  const strip = page.locator('.results-item .pcard-strip').first();
  await expect(strip).toHaveAttribute('data-ready', '', { timeout: 15_000 });
  await expect.poll(() => page.locator('.results-item .pcard-strip:not([data-ready])').count()).toBe(0);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  expect(logs.filter((l) => /hydrat|did(n't| not) match/i.test(l))).toEqual([]);
  await w.check();
});

test('listing: backend down shows a clear state', async ({ page }) => {
  await backendDown(page);
  await page.goto('/properties?purpose=rent&bedrooms_min=3&bedrooms_max=3');
  // Server render may have data; the client refetch fails without breaking the page.
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await hydrated(page);
  await page.getByRole('combobox', { name: 'Where' }).fill('sector 57');
  await expect(page.getByText(/offline|server is busy|Something broke/i).first()).toBeVisible({ timeout: 20_000 });
});

test('listing: the Hindi page renders the same island', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi/properties?purpose=buy');
  await hydrated(page);
  await expect(page.locator('.results-item').first()).toBeVisible();
  await expect(page.locator('.results-count')).toContainText('बिक्री के लिए');
  await expect(page.locator('.results-item').first().getByText(/फ़ोटो/)).toBeVisible();
  await w.check();
});

test.describe('listing: without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('a card shows photo 1 only: no count, no buttons, no empty photos', async ({ page }) => {
    await page.goto('/properties?purpose=buy');
    const card = page.locator('.results-item').filter({ has: page.locator('.pcard-strip') }).first();
    const imgs = card.locator('.pcard-strip img');
    expect(await imgs.count()).toBeGreaterThan(1);
    await expect(imgs.first()).toBeVisible();
    await expect.poll(() => imgs.first().evaluate((i: HTMLImageElement) => i.complete && i.naturalWidth > 0)).toBe(true);
    // Photos 2 to 4 have no src (nothing to download) and no box.
    const n = await imgs.count();
    for (let i = 1; i < n; i++) await expect(imgs.nth(i)).toBeHidden();
    expect(await imgs.evaluateAll((els) => els.slice(1).filter((i) => i.hasAttribute('src')).length)).toBe(0);
    await expect(card.locator('[data-pcs-count]')).toBeHidden();
    await expect(card.locator('[data-pcs]')).toHaveCount(2);
    for (const b of await card.locator('[data-pcs]').all()) await expect(b).toBeHidden();
  });
});
