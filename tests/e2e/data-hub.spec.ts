import { expect, test, type Page } from '@playwright/test';
import { CONTRACT_PROBE, axe, backendDown, hydrated, liveHas, watch } from './helpers';

/** Opens a page, checks the H1 and waits for every island. */
async function open(page: Page, path: string) {
  const res = await page.goto(path);
  expect(res?.status(), path).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await hydrated(page);
}

const rows = (page: Page) => page.locator('.dh-table tbody tr');

/** Axe once lists have finished loading (stale rows are dimmed while a filter loads). */
async function a11y(page: Page) {
  await expect(page.locator('.dh-body[aria-busy="true"]')).toHaveCount(0, { timeout: 20_000 });
  await axe(page);
}
const OFFLINE = /offline|server is busy|Something broke|taking too long/i;

test('circle rates: filters, load more, calculator, detail', async ({ page }) => {
  test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
  const w = watch(page);
  await open(page, '/circle-rates');
  await expect(page.getByText('183 rates')).toBeVisible();
  const before = await rows(page).count();
  await page.getByRole('button', { name: 'Load more' }).click();
  await expect.poll(() => rows(page).count()).toBeGreaterThan(before);

  await page.getByRole('combobox', { name: 'Sector' }).first().selectOption('Sector 45');
  await expect(page).toHaveURL(/sector=Sector\+45/);
  await expect(rows(page)).toHaveCount(3);
  await page.getByRole('radio', { name: 'Plot' }).first().click();
  await expect(page).toHaveURL(/property_type=plot/);
  await expect(rows(page)).toHaveCount(1);
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page).toHaveURL(/\/circle-rates$/);

  // The calculator posts to the pure calculation endpoint (writes nothing).
  await page.getByLabel('Deal value (₹)').fill('50,00,000');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.locator('.dh-slip')).toContainText('₹4,00,000');
  await a11y(page);
  await w.check();

  await rows(page).first().getByRole('link').click();
  await expect(page).toHaveURL(/\/circle-rate\/gurugram-sector-/);
  await hydrated(page);
  await expect(page.getByText(/per sq yd/).first()).toBeVisible();
  await a11y(page);
  await w.check();
});

test('circle rate: unknown slug is a real 404', async ({ page }) => {
  const res = await page.goto('/circle-rate/gurugram-sector-999-residential');
  expect(res?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('No circle rate at this link');
});

test('stamp duty calculator: buyer, sector rate and state table', async ({ page }) => {
  test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
  const w = watch(page);
  await open(page, '/stamp-duty-calculator');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByText('Enter a value above ₹0.')).toBeVisible();
  await page.getByLabel('Deal value (₹)').fill('5000000');
  await page.getByRole('radio', { name: /Woman/ }).click();
  await page.getByRole('combobox', { name: 'Sector' }).selectOption('Sector 45');
  await page.getByRole('combobox', { name: 'Circle rate for' }).selectOption('residential');
  await page.getByLabel(/Area \(sq yd\)/).fill('200');
  await page.getByRole('button', { name: 'Calculate' }).click();
  await expect(page.getByText(/The circle-rate value .* is higher/)).toBeVisible();
  await expect(page.getByRole('row', { name: /Delhi, woman/ })).toContainText('₹2,00,000');
  await a11y(page);
  await w.check();
});

test('rera: search, status, load more, number check', async ({ page }) => {
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

test('bank auctions: filters, load more, alert asks for login, detail', async ({ page }, info) => {
  test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
  const w = watch(page);
  await open(page, '/bank-auctions');
  const cards = page.locator('.dh-cards > li');
  await expect(cards.first()).toBeVisible();

  const desktop = info.project.name === 'desktop';
  if (desktop) {
    await page.locator('.dh-results-side').getByRole('radio', { name: 'Court order' }).click();
  } else {
    await page.getByRole('button', { name: /^Filters/ }).click();
    const sheet = page.getByRole('dialog', { name: 'Filters' });
    await sheet.getByRole('radio', { name: 'Court order' }).click();
    await sheet.getByRole('button', { name: /^(Show|Nothing)/ }).click();
    await expect(sheet).toBeHidden();
  }
  await expect(page).toHaveURL(/type=court/);
  await expect(cards).toHaveCount(10);

  const form = desktop ? page.locator('.dh-results-side') : page.getByRole('dialog', { name: 'Filters' });
  if (!desktop) await page.getByRole('button', { name: /^Filters/ }).click();
  await form.getByRole('radio', { name: 'All' }).first().click();
  await form.getByRole('radio', { name: 'Commercial' }).click();
  await form.getByRole('combobox', { name: 'Bank' }).selectOption('ICICI Bank');
  await form.getByLabel('Lowest reserve price (₹)').fill('1000000');
  await form.getByLabel('Lowest reserve price (₹)').press('Enter');
  await form.getByLabel('Auction from').fill('2026-01-01');
  if (!desktop) await page.getByRole('dialog', { name: 'Filters' }).getByRole('button', { name: /^(Show|Nothing)/ }).click();
  await expect(page).toHaveURL(/property_type=commercial/);
  await expect(page).toHaveURL(/bank=ICICI/);
  await expect(page).toHaveURL(/min_price=1000000/);
  await expect(page).toHaveURL(/date_from=2026-01-01/);

  if (desktop) await page.getByRole('button', { name: 'Clear filters' }).click();
  else {
    await page.goto('/bank-auctions');
    await hydrated(page);
  }
  await expect(page).toHaveURL(/\/bank-auctions$/);
  const before = await cards.count();
  await page.getByRole('button', { name: 'Load more' }).click();
  await expect.poll(() => cards.count()).toBeGreaterThan(before);

  // Signed out: the alert sends the user to the login page first. Nothing is posted.
  await page.getByRole('button', { name: 'Set an alert' }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fbank-auctions/);
  await page.goBack();
  await hydrated(page);
  await a11y(page);
  await w.check();

  await cards.first().getByRole('link').click();
  await expect(page).toHaveURL(/\/bank-auctions\/\d+$/);
  await hydrated(page);
  await expect(page.getByText(/days to go|auction has ended|auction is today|day to go/)).toBeVisible();
  await a11y(page);
  await w.check();
});

test('bank auction: court row opens, unknown id is a 404', async ({ page }) => {
  test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
  await open(page, '/bank-auctions/31');
  await expect(page.getByText('DRT/480/2023')).toBeVisible();
  const res = await page.goto('/bank-auctions/999999');
  expect(res?.status()).toBe(404);
  expect((await page.goto('/bank-auctions/abc'))?.status()).toBe(404);
});

test('auction sources: portal groups with live counts', async ({ page }) => {
  const w = watch(page);
  await open(page, '/auction-sources');
  await expect(page.getByRole('heading', { name: 'Central government portals' })).toBeVisible();
  await expect(page.getByRole('link', { name: /IBAPI/ })).toHaveAttribute('href', 'https://ibapi.in');
  await expect(page.getByText(/on 360Ghar$/).first()).toBeVisible();
  await a11y(page);
  await w.check();
});

test('verify ownership: signed-out users are asked to sign in', async ({ page }) => {
  const w = watch(page);
  await open(page, '/verify-ownership');
  await expect(page.getByRole('heading', { name: 'Sign in to look up land records' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sign in/ }).last()).toHaveAttribute('href', '/login?next=%2Fverify-ownership');
  await a11y(page);
  await w.check();
});

test('zone checker: search, empty state, FAR calculator, detail', async ({ page }) => {
  const w = watch(page);
  await open(page, '/zone-checker');
  await expect(rows(page).first()).toBeVisible();
  const all = await rows(page).count();
  await page.getByRole('searchbox', { name: 'Sector' }).fill('Sector 10A');
  await expect(page).toHaveURL(/sector=Sector\+10A/);
  await expect(rows(page).filter({ hasText: 'Sector' }).first()).toContainText('Sector 10A');
  await page.getByRole('searchbox', { name: 'Sector' }).fill('Sector 999');
  await expect(page.getByRole('heading', { name: /No zoning data for/ })).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect.poll(() => rows(page).count()).toBe(all);

  await page.getByLabel('Plot area (sq ft)').fill('2000');
  await page.getByRole('combobox', { name: 'Use the FAR of a sector' }).selectOption({ label: 'Sector 1 (2.49)' });
  await expect(page.getByText('4,980 sq ft')).toBeVisible();
  await a11y(page);
  await w.check();

  await rows(page).first().getByRole('link').click();
  await expect(page).toHaveURL(/\/zone-checker\/gurugram-sector-/);
  await expect(page.getByText('What FAR means')).toBeVisible();
  await a11y(page);
  expect((await page.goto('/zone-checker/nowhere'))?.status()).toBe(404);
});

test('regulatory updates: tabs, empty tab, keyboard', async ({ page }) => {
  const w = watch(page);
  await open(page, '/regulatory-updates');
  await page.getByRole('tab', { name: 'Policy' }).click();
  await expect(page).toHaveURL(/type=policy/);
  await expect(page.locator('.dh-rows > li').first()).toContainText('Policy');
  await page.getByRole('tab', { name: 'Rate revision' }).click();
  await expect(page.getByRole('heading', { name: 'No rate revision notices yet' })).toBeVisible();
  await page.getByRole('button', { name: 'See all notices' }).click();
  await expect(page).toHaveURL(/\/regulatory-updates$/);
  await page.getByRole('tab', { name: 'All' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('tab', { name: 'Land acquisition' })).toHaveAttribute('aria-selected', 'true');
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

for (const path of ['/builder-reputation-score', '/tenant-demand-heatmap', '/best-sectors-investment-2026', '/price-index/gurgaon', '/hi/price-index/delhi', '/hi/circle-rates']) {
  test(`static and Hindi page ${path}`, async ({ page }) => {
    const w = watch(page);
    await open(page, path);
    await page.locator('.faq-item summary').first().click();
    await expect(page.locator('.faq-item[open]')).toHaveCount(1);
    // The site-wide chat launcher is fixed at the bottom right and can cover a link
    // after the scroll; scan from the top so the result does not depend on the scroll.
    await page.evaluate(() => window.scrollTo(0, 0));
    await a11y(page);
    await w.check();
  });
}

test('price index: unknown city is a real 404', async ({ page }) => {
  expect((await page.goto('/price-index/mumbai'))?.status()).toBe(404);
});

test.describe('backend down', () => {
  test('circle rates: load more fails with a clear message', async ({ page }) => {
    await page.goto('/circle-rates');
    await hydrated(page);
    await backendDown(page);
    await page.getByRole('button', { name: 'Load more' }).click();
    await expect(page.getByText(OFFLINE).first()).toBeVisible({ timeout: 20_000 });
  });

  test('rera: a new filter shows the offline state with retry', async ({ page }) => {
    await page.goto('/rera-projects');
    await hydrated(page);
    await backendDown(page);
    await page.getByRole('radio', { name: 'Revoked' }).click();
    await expect(page.getByText(OFFLINE).first()).toBeVisible({ timeout: 20_000 });
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
  });

  test('bank auctions: load more fails with a clear message', async ({ page }) => {
    test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
    await page.goto('/bank-auctions');
    await hydrated(page);
    await backendDown(page);
    await page.getByRole('button', { name: 'Load more' }).click();
    await expect(page.getByText(OFFLINE).first()).toBeVisible({ timeout: 20_000 });
  });

  test('gazette, zones and builders: offline state', async ({ page }) => {
    for (const [path, act] of [
      ['/regulatory-updates', () => page.getByRole('tab', { name: 'Policy' }).click()],
      ['/zone-checker', () => page.getByRole('searchbox', { name: 'Sector' }).fill('Sector 4')],
      ['/builder-reputation', () => page.getByRole('radio', { name: 'Score, high to low' }).click()],
    ] as const) {
      await page.unrouteAll();
      await page.goto(path);
      await hydrated(page);
      await backendDown(page);
      await act();
      await expect(page.getByText(OFFLINE).first()).toBeVisible({ timeout: 20_000 });
    }
  });
});

// ---------- Round 3: data charts from real rows, paper headers ----------

test('circle rates: sector skyline from every row, rank on the detail page', async ({ page }) => {
  const w = watch(page);
  await open(page, '/circle-rates');
  const sky = page.locator('.dh-sky');
  await expect(sky.locator('.dh-sky-col')).toHaveCount(61);
  await expect(sky.locator('.dh-sky-tick').first()).toBeAttached();
  await expect(sky).toContainText('Highest');
  await expect(sky).toContainText('Source: IGRS Haryana, 2024 revision');
  await open(page, '/circle-rate/gurugram-sector-45-residential');
  await expect(page.locator('.dh-sky-col.is-mine')).toHaveCount(1);
  await expect(page.locator('.dh-sky-lead')).toContainText(/Sector 45 (is higher than \d+ of the other \d+ sectors|has the (highest|lowest) rate)/);
  await a11y(page);
  await w.check();
});

test('rera: status mix has one square per project', async ({ page }) => {
  const w = watch(page);
  await open(page, '/rera-projects');
  const mix = page.locator('.dh-mix');
  const lead = await mix.locator('.dh-meta').first().textContent();
  const n = Number(/all (\d+) projects/.exec(lead ?? '')?.[1]);
  expect(n).toBeGreaterThan(0);
  await expect(mix.locator('svg rect')).toHaveCount(n);
  const counts = await mix.locator('.dh-mix-keys b').allTextContents();
  expect(counts.reduce((a, b) => a + Number(b), 0)).toBe(n);
  await w.check();
});

test('price index: range bars for buy and rent', async ({ page }) => {
  const w = watch(page);
  await open(page, '/price-index/gurgaon');
  await expect(page.locator('#pi-buy + .pr-rows .pr-row')).toHaveCount(7);
  await expect(page.locator('#pi-rent + .pr-rows .pr-row')).toHaveCount(8);
  await expect(page.locator('.pr-span')).toHaveCount(15);
  await expect(page.getByText('₹85 lakhs - 3.5 crore')).toBeVisible();
  await a11y(page);
  await w.check();
});

test('stamp duty: paper empty state, deal against circle value (mocked)', async ({ page }) => {
  test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
  const w = watch(page);
  await page.route(/calculator\/stamp-duty/, async (route) => {
    const body = route.request().postDataJSON() as { property_value: number; buyer_type: 'male' | 'female' | 'joint' };
    const rate = { male: 7, female: 5, joint: 6 }[body.buyer_type];
    const d = Math.round((body.property_value * rate) / 100);
    const f = Math.round(body.property_value / 100);
    await route.fulfill({ json: { property_value: body.property_value, buyer_type: body.buyer_type, stamp_duty_rate: rate, stamp_duty_amount: d, registration_fee: f, total_cost: d + f } });
  });
  // The quick calculator on /circle-rates shows the paper scene while empty.
  await open(page, '/circle-rates');
  await expect(page.locator('.dh-sd-art svg')).toBeVisible();
  await open(page, '/stamp-duty-calculator');
  await expect(page.locator('.dh-slip')).toContainText('press Calculate');
  await page.getByLabel('Deal value (₹)').fill('5000000');
  await page.getByRole('combobox', { name: 'Sector' }).selectOption('Sector 45');
  await page.getByLabel(/Area \(sq yd\)/).fill('200');
  await page.getByRole('button', { name: 'Calculate' }).click();
  const base = page.locator('.dh-sd-base li');
  await expect(base).toHaveCount(2);
  await expect(base.filter({ hasText: 'Circle-rate value' })).toHaveClass(/is-used/);
  await expect(page.locator('.dh-sd-bar')).toHaveCount(6);
  await a11y(page);
  await w.check();
});

test('data hub headers: the page scene from 768 px', async ({ page }, info) => {
  test.skip(!(await liveHas(CONTRACT_PROBE)), 'needs the contract-2026-10 backend (not on the live API yet)');
  for (const path of ['/circle-rates', '/rera-projects', '/bank-auctions', '/tenant-demand-heatmap']) {
    await page.goto(path, { waitUntil: 'domcontentloaded' });
    const art = page.locator('.dh-head-art');
    if (info.project.name === 'phone') await expect(art).toBeHidden();
    else await expect(art.locator('svg.vignette')).toBeVisible();
  }
});
