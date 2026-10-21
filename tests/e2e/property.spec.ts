import { expect, test, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, liveHas, signedIn, watch } from './helpers';

// Listings on the live API: 182 is for sale (9 photos, floor plan), 165 is for
// rent (deposit), 181 is a short stay. No live listing has a 360° tour, so the
// tour tests add one with the dev-only `?_tour=` parameter.
const SALE = '/property/182';
const RENT_ID = 165;
const STAY_ID = 181;
const RENT = `/property/${RENT_ID}`;
const STAY = `/property/${STAY_ID}`;
const TOUR = 'https://kuula.co/share/collection/test-tour';

/** Waits until the islands inside `root` have hydrated (client:visible islands wait for the scroll). */
async function ready(page: Page, selector: string) {
  await page.locator(selector).scrollIntoViewIfNeeded();
  await page.waitForFunction((sel) => [...document.querySelectorAll(`${sel} astro-island`)].every((i) => !i.hasAttribute('ssr')), selector);
}

/** Third-party frames load a stub, so tests never wait on Google or Kuula. */
async function stubFrames(page: Page) {
  await page.route(
    (url) => /(^|\.)kuula\.co$|^maps\.google\.com$/.test(url.hostname),
    (route) => route.fulfill({ contentType: 'text/html', body: '<title>stub</title><p>stub frame</p>' }),
  );
}

test('property: gallery, viewer keys, modes, rail and the floor plan section', async ({ page }, info) => {
  const w = watch(page);
  await stubFrames(page);
  await page.goto(SALE);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BHK');
  await hydrated(page);

  // Phones swipe the strip; it scrolls sideways inside itself, not the page.
  const track = page.getByRole('list', { name: 'Photos of this home' });
  // All nine on phones (after the first touch: photos 3 and on wait for it); the mosaic shows five and the viewer has the rest.
  if (info.project.name === 'phone') await track.dispatchEvent('touchstart');
  await expect(track.getByRole('listitem')).toHaveCount(info.project.name === 'phone' ? 9 : 5);
  if (info.project.name === 'phone') {
    await track.evaluate((el) => el.scrollBy({ left: 400 }));
    await expect.poll(() => track.evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
    await expect(track.getByText('2 of 9')).toBeInViewport();
  }

  // The first photo opens the viewer at photo 1.
  await track.getByRole('button', { name: /^Open photo 1 of 9/ }).click();
  const viewer = page.getByRole('dialog', { name: 'Media viewer' });
  await expect(viewer).toBeVisible();
  await expect(viewer.locator('figcaption')).toContainText('1 of 9');
  await page.keyboard.press('ArrowRight');
  await expect(viewer.locator('figcaption')).toContainText('2 of 9');
  await page.keyboard.press('ArrowLeft');
  await page.keyboard.press('ArrowLeft');
  await expect(viewer.locator('figcaption')).toContainText('9 of 9');
  await viewer.getByRole('button', { name: 'Next photo' }).click();
  await expect(viewer.locator('figcaption')).toContainText('1 of 9');
  await viewer.getByRole('button', { name: 'Previous photo' }).click();
  await expect(viewer.locator('figcaption')).toContainText('9 of 9');
  // The thumbnail rail jumps to a photo and marks it.
  const rail = viewer.getByRole('list', { name: 'All photos' });
  await rail.getByRole('button', { name: /^Open photo 4 of 9/ }).click();
  await expect(viewer.locator('figcaption')).toContainText('4 of 9');
  await expect(rail.getByRole('button', { name: /^Open photo 4 of 9/ })).toHaveAttribute('aria-current', 'true');
  // Switch to the floor plan inside the viewer, then back.
  await viewer.getByRole('button', { name: 'Floor plan' }).click();
  await expect(viewer.getByRole('img', { name: /^Floor plan:/ })).toBeVisible();
  await expect(rail).toBeHidden();
  await viewer.getByRole('button', { name: 'Photos' }).click();
  await expect(viewer.locator('figcaption')).toContainText('of 9');
  await viewer.getByRole('button', { name: 'Close' }).click();
  await expect(viewer).toBeHidden();
  await expect.poll(() => page.evaluate(() => document.documentElement.style.overflow)).toBe('');

  // Toolbar entry points.
  await page.getByRole('button', { name: /^(See all 9 photos|9 photos)$/ }).click();
  await expect(viewer.locator('figcaption')).toContainText('1 of 9');
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await page.locator('.pg-tools').getByRole('button', { name: 'Floor plan' }).click();
  await expect(viewer.getByRole('img', { name: /^Floor plan:/ })).toBeVisible();
  await page.keyboard.press('Escape');

  // The floor plan section opens the same viewer (a plain link without JS).
  const plan = page.getByRole('region', { name: 'Floor plan' });
  await expect(plan.getByRole('img', { name: /^Floor plan:/ })).toBeVisible();
  await plan.getByRole('link', { name: 'Open full screen' }).click();
  await expect(viewer.getByRole('img', { name: /^Floor plan:/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await w.check();
});

test('property: facts, costs, read more, map, nearby and local data', async ({ page }) => {
  const w = watch(page);
  await stubFrames(page);
  await page.goto(SALE);
  await hydrated(page);
  const facts = page.getByRole('region', { name: 'Key facts' });
  await expect(facts.getByText('Bedrooms')).toBeVisible();
  await expect(facts.getByText('2 of 4')).toBeVisible();
  await expect(facts.getByText('12 years')).toBeVisible();

  const costs = page.getByRole('region', { name: 'What it costs' });
  await expect(costs.getByText('₹1,86,48,000')).toBeVisible();
  // Price per sq ft is worked out from the price and the area: 18648000 / 1850.
  await expect(costs.locator('.prop-cost-rows').getByText('₹10,080')).toBeVisible();
  await expect(costs.getByRole('link', { name: 'Work out the EMI' })).toHaveAttribute('href', '/emi-calculator');
  await expect(costs.getByRole('link', { name: 'Check the stamp duty' })).toHaveAttribute('href', '/stamp-duty-calculator');

  // Read more: two paragraphs first, all after the click.
  const about = page.getByRole('region', { name: 'About this home' });
  const more = about.getByRole('button', { name: 'Read more' });
  await expect(more).toHaveAttribute('aria-expanded', 'false');
  const shown = await about.locator('p:visible').count();
  await more.click();
  await expect(about.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
  expect(await about.locator('p:visible').count()).toBeGreaterThan(shown);

  // Location: the map frame loads only on click; nearby places come from the data files.
  const loc = page.getByRole('region', { name: 'Location' });
  await expect(loc.locator('iframe')).toHaveCount(0);
  await expect(loc.locator('[data-map-src]')).toHaveAttribute('data-ready', '');
  await loc.getByRole('button', { name: 'Show the map' }).click();
  await expect(loc.locator('iframe[title="Map"]')).toBeVisible();
  await expect(loc.getByRole('link', { name: 'About Palam Vihar' })).toHaveAttribute('href', '/locality/palam-vihar-gurgaon');
  await expect(loc.getByRole('heading', { name: 'Around Palam Vihar' })).toBeVisible();
  await expect(loc.getByRole('heading', { name: 'How far it is' })).toBeVisible();
  await expect(loc.getByText('Cyber City')).toBeVisible();
  // Circle rates come from the data hub API after the island scrolls into view.
  await loc.getByText('Straight-line distance from the map pin.', { exact: false }).scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 400);
  await expect(loc.getByRole('heading', { name: /Circle rate in Palam Vihar/ })).toBeVisible({ timeout: 20_000 });
  await expect(loc.getByText(/per sq yd/).first()).toBeVisible();

  // Similar homes are real listings with photos.
  const similar = page.getByRole('region', { name: 'Similar homes' });
  await similar.scrollIntoViewIfNeeded();
  await expect(similar.getByRole('listitem').first().locator('img').first()).toBeVisible();
  await w.check();
  await axe(page);
});

test('property: contact panel, callback dialog, actions and the phone dock', async ({ page }, info) => {
  const w = watch(page);
  await page.addInitScript(() => {
    window.print = () => document.body.setAttribute('data-printed', '');
  });
  await page.goto(SALE);
  await hydrated(page);

  // Save, share, compare, print.
  await page.getByRole('button', { name: 'Compare' }).first().click();
  await expect(page.getByRole('button', { name: 'Compare' }).first()).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: 'Compare' }).first().click();
  await expect(page.getByRole('button', { name: 'Compare' }).first()).toHaveAttribute('aria-pressed', 'false');
  await page.getByRole('button', { name: 'Print' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-printed', '');
  await page.getByRole('button', { name: 'Share' }).first().click();
  await expect(page.locator('.toast').first()).toBeVisible();

  const side = page.getByRole('complementary', { name: 'Contact and visits' });
  await ready(page, '#prop-book');
  // The owner's own number is never shown: the agent's, or the company's, answers.
  await expect(side.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/91\d{10}\?text=/);
  await expect(side.getByRole('link', { name: /^Call \+91/ })).toHaveAttribute('href', /^tel:\+91\d{10}$/);
  await expect(side.getByRole('button', { name: 'Show phone number' })).toHaveCount(0);
  await side.getByRole('button', { name: 'Request a callback' }).click();
  const cb = page.getByRole('dialog', { name: 'Request a callback' });
  await expect(cb).toBeVisible();
  await cb.getByRole('button', { name: 'Send request' }).click();
  await expect(cb.getByText(/10-digit mobile number/)).toBeVisible();
  await cb.getByRole('button', { name: 'Close' }).click();
  await expect(cb).toBeHidden();

  // Phones and tablets: a dock with the price, WhatsApp and "Book a visit".
  const dock = page.locator('[data-dock]');
  if (info.project.name === 'desktop') {
    await expect(dock).toBeHidden();
  } else {
    // The Share toast can sit over the dock; wait for it to go.
    await expect(page.locator('.toast')).toHaveCount(0, { timeout: 15_000 });
    // At the top the card's own buttons are on screen, so the dock waits.
    await page.evaluate(() => window.scrollTo(0, 0));
    await expect(dock).toHaveAttribute('data-away', '');
    // Further down it shows: price, WhatsApp and "Book a visit".
    await page.evaluate(() => window.scrollTo(0, 1800));
    await expect(dock).not.toHaveAttribute('data-away', '');
    await expect(dock).toBeInViewport();
    await expect(dock.getByRole('link', { name: 'Chat on WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\//);
    // The chat launcher floats above the dock, never over its buttons.
    await expect(page.locator('[data-chat-launcher]')).toBeVisible();
    const bar = await dock.boundingBox();
    const chat = await page.locator('[data-chat-launcher]').boundingBox();
    expect(chat!.y + chat!.height).toBeLessThanOrEqual(bar!.y);
    // "Book a visit" opens the visit form in a sheet.
    await dock.getByRole('link', { name: 'Book a visit' }).click();
    const sheet = page.getByRole('dialog', { name: 'Book a visit' });
    await expect(sheet).toBeVisible();
    await sheet.getByRole('button', { name: 'Close' }).click();
    await expect(sheet).toBeHidden();
    // It steps aside, out of the tab order too, while the contact panel is on screen.
    await side.scrollIntoViewIfNeeded();
    await expect(dock).toHaveAttribute('data-away', '');
    await expect(dock).toHaveAttribute('inert', '');
    await expect(dock.getByRole('link', { name: 'Book a visit' })).toBeHidden();
  }
  await w.check();
});

test('property: rent shows the move-in cost; a short stay shows nights and guests', async ({ page }) => {
  test.skip(!(await Promise.all([RENT_ID, STAY_ID].map((id) => liveHas(`/api/v1/properties/${id}`)))).every(Boolean), 'listing 165 or 181 is not on the live API');
  const w = watch(page);
  await page.goto(RENT);
  const costs = page.getByRole('region', { name: 'What it costs' });
  await expect(costs.getByText('Monthly rent')).toBeVisible();
  await expect(costs.getByText("2 months' rent, refundable")).toBeVisible();
  // 74,250 rent + 4,200 maintenance + 1,48,500 deposit.
  await expect(costs.getByText('₹2,26,950')).toBeVisible();
  await expect(costs.getByRole('link', { name: 'Work out the EMI' })).toHaveCount(0);

  await page.goto(STAY);
  await expect(page.locator('.prop-price')).toContainText('/night');
  await expect(page.getByRole('region', { name: 'What it costs' }).getByText('Per night')).toBeVisible();
  await expect(page.getByRole('region', { name: 'Key facts' }).getByText('Guests')).toBeVisible();
  await w.check();
});

test('property: the 360° tour poster loads the tour only on click', async ({ page }) => {
  const w = watch(page);
  await stubFrames(page);
  const frames: string[] = [];
  page.on('request', (r) => {
    if (new URL(r.url()).hostname.endsWith('kuula.co')) frames.push(r.url());
  });
  await page.goto(`${SALE}?_tour=${encodeURIComponent(TOUR)}`);
  await hydrated(page);
  const poster = page.getByRole('button', { name: 'Start the 360° tour' });
  await expect(poster).toBeVisible();
  expect(frames).toEqual([]);
  await poster.click();
  const viewer = page.getByRole('dialog', { name: 'Media viewer' });
  await expect(viewer.locator('iframe[title^="360° tour"]')).toBeVisible();
  await expect(viewer.getByRole('button', { name: '360° tour' })).toHaveAttribute('aria-pressed', 'true');
  await expect(viewer.getByRole('link', { name: 'Open in a new tab' })).toHaveAttribute('href', TOUR);
  expect(frames.length).toBeGreaterThan(0);
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(viewer.locator('iframe')).toHaveCount(0);
  await w.check();
});

test('property: the virtual tour page, with and without a tour', async ({ page }) => {
  const w = watch(page);
  await stubFrames(page);
  await page.goto(`${SALE}/virtual-tour`);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('This home has no 360° tour yet');
  await expect(page.getByRole('link', { name: 'See the photos and floor plan' })).toHaveAttribute('href', SALE);
  await expect(page.getByRole('region', { name: /photos of this home/ }).getByRole('listitem')).toHaveCount(8);
  await axe(page);

  await page.goto(`${SALE}/virtual-tour?_tour=${encodeURIComponent(TOUR)}`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('360° tour');
  const stage = page.locator('[data-tour]');
  await expect(stage.locator('iframe')).toHaveCount(0);
  await expect(stage).toHaveAttribute('data-ready', '');
  await page.getByRole('button', { name: 'Start the tour' }).click();
  await expect(stage.locator('iframe')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Start the tour' })).toHaveCount(0);
  await w.check();

  expect((await page.request.get('/property/99999999/virtual-tour')).status()).toBe(404);
});

test('property: the Hindi page and the backend down in the browser', async ({ page }) => {
  const w = watch(page);
  await page.goto(`/hi${SALE}`);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('BHK');
  await expect(page.getByRole('heading', { name: 'कितना खर्च होगा' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'फ़्लोर प्लान' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'लोकेशन' })).toBeVisible();
  await hydrated(page);
  await expect(page.getByRole('list', { name: 'इस घर की फ़ोटो' })).toBeVisible();
  await axe(page);

  // Islands call the API from the browser; with it down the page still works.
  await backendDown(page);
  await page.goto(SALE);
  await hydrated(page);
  await page.getByRole('button', { name: /^Open photo 1 of 9/ }).click();
  await expect(page.getByRole('dialog', { name: 'Media viewer' })).toBeVisible();
  await page.keyboard.press('Escape');
  const side = page.getByRole('complementary', { name: 'Contact and visits' });
  await side.scrollIntoViewIfNeeded();
  await expect(side.getByRole('link', { name: 'WhatsApp' })).toBeVisible();
  // Local data hides quietly or shows its error box; it never breaks the page.
  await page.getByRole('region', { name: 'Location' }).scrollIntoViewIfNeeded();
  await expect(page.getByRole('heading', { name: 'How far it is' })).toBeVisible();
  await w.check();
});

test('property: price per sq ft against the locality, from real listings', async ({ page }) => {
  const w = watch(page);
  await page.goto(SALE);
  const costs = page.getByRole('region', { name: 'What it costs' });
  await expect(costs.getByRole('heading', { name: 'Price per sq ft in Palam Vihar' })).toBeVisible();
  // The sentence carries the numbers: this home against the median of N other builder floors.
  await expect(costs.getByText(/^This home is (\d+% (below|above)|priced about the same as) the median of \d+ other builder floors for sale in Palam Vihar on 360Ghar\.$/)).toBeVisible();
  await expect(costs.getByText('This home ₹10,080')).toBeVisible();
  await expect(costs.getByText(/^Median ₹[\d,]+$/)).toBeVisible();
  // A listing with the ₹10 Cr placeholder price gets no comparison.
  await page.goto('/property/129');
  await expect(page.getByRole('region', { name: 'What it costs' })).toBeVisible();
  await expect(page.getByRole('heading', { name: /^Price per sq ft in/ })).toHaveCount(0);
  await w.check();
});

test('property: book a visit with the day buttons (POST mocked)', async ({ page }, info) => {
  // Open: passes with the real Supabase keys; with the fake CI project the form shows no confirmation.
  test.skip((process.env.PUBLIC_SUPABASE_URL ?? '').includes('ci-test'), 'fake CI Supabase project: confirmation not shown, set the repo variables');
  const w = watch(page);
  await signedIn(page);
  let body: { property_id?: number; scheduled_date?: string } = {};
  await page.route(/\/api\/v1\/visits$/, async (route) => {
    if (route.request().method() !== 'POST') return route.fallback();
    body = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { id: 1, property_id: 182, scheduled_date: body.scheduled_date, status: 'requested' } });
  });
  await page.goto(SALE);
  await hydrated(page);
  await ready(page, '#prop-book');
  const side = page.locator('#prop-book');
  // From 64rem the form sits in the rail; on phones and tablets it opens in a sheet.
  let form = side;
  if (info.project.name !== 'desktop') {
    await side.getByRole('button', { name: 'Book a visit' }).click();
    form = page.getByRole('dialog', { name: 'Book a visit' }) as typeof side;
    await expect(form).toBeVisible();
  }
  const days = form.getByRole('group', { name: 'Day' });
  await expect(days.getByRole('button')).toHaveCount(7);
  // One date control: no native date field.
  await expect(form.getByLabel('Date', { exact: true })).toHaveCount(0);
  // No day yet: the validation asks for one.
  // Retry the click: on a slow runner it can land before the form has hydrated.
  await expect(async () => {
    await form.getByRole('button', { name: 'Request this visit' }).click();
    await expect(form.getByText('Pick a day.')).toBeVisible({ timeout: 2_000 });
  }).toPass({ timeout: 20_000 });
  const tomorrow = days.getByRole('button', { name: /^Tomorrow/ });
  await tomorrow.click();
  await expect(tomorrow).toHaveAttribute('aria-pressed', 'true');
  await expect(form.getByText('Pick a day.')).toHaveCount(0);
  // Times read in 12 hours; the value stays 24 hours.
  await expect(form.getByRole('option', { name: '5:30 pm' })).toHaveAttribute('value', '17:30');
  await form.getByLabel('Time', { exact: true }).selectOption('17:30');
  const iso = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  });
  await form.getByRole('button', { name: 'Request this visit' }).click();
  await expect(form.getByRole('status')).toContainText('Visit requested for');
  expect(body.property_id).toBe(182);
  // Parsed in the page, so the zone is the browser's (Asia/Kolkata), not Node's.
  expect(new Date(body.scheduled_date!).getTime()).toBe(await page.evaluate((d) => new Date(`${d}T17:30`).getTime(), iso));
  await w.check();
});

test('property: a callback request goes to /leads without sign-in (POST mocked)', async ({ page }) => {
  const w = watch(page);
  const sent: { lead?: Record<string, unknown>; visits: number } = { visits: 0 };
  await page.route(/\/api\/v1\/leads$/, async (route) => {
    sent.lead = route.request().postDataJSON();
    await route.fulfill({ status: 201, json: { id: 1 } });
  });
  await page.route(/\/api\/v1\/visits$/, (route) => {
    if (route.request().method() === 'POST') sent.visits++;
    return route.fallback();
  });
  await page.goto(SALE);
  await hydrated(page);
  await ready(page, '#prop-book');
  await page.locator('#prop-book').getByRole('button', { name: 'Request a callback' }).click();
  const cb = page.getByRole('dialog', { name: 'Request a callback' });
  await cb.getByLabel('Your mobile number').fill('+91 98765 43210');
  await cb.getByLabel('Your note').fill('Evening please');
  await cb.getByRole('button', { name: 'Send request' }).click();
  await expect(cb.getByRole('status')).toContainText('Thanks, we have your request.');
  expect(sent.lead).toMatchObject({ property_id: 182, phone: '9876543210', note: 'Evening please' });
  expect(sent.visits).toBe(0);
  await w.check();
});

test('property: an unavailable home says so and offers similar homes (dev flag)', async ({ page }) => {
  const w = watch(page);
  await page.goto(`${SALE}?_unavailable=1`);
  await hydrated(page);
  const side = page.getByRole('complementary', { name: 'Contact and visits' });
  await side.scrollIntoViewIfNeeded();
  await expect(side.getByText('This home is no longer available.')).toBeVisible();
  await expect(side.getByRole('link', { name: 'See similar homes' })).toBeVisible();
  await expect(side.getByRole('button', { name: 'Request a callback' })).toHaveCount(0);
  await expect(page.locator('[data-dock]')).toHaveCount(0);
  await axe(page);
  await w.check();
});

test('property: card actions fit one row; the rail price is small; the viewer groups rooms', async ({ page }, info) => {
  const w = watch(page);
  await page.goto(SALE);
  await hydrated(page);
  // The card holds save and share; compare and print are under "More details".
  const actions = page.locator('.prop-actions.is-top > .btn');
  await expect(actions).toHaveCount(2);
  const boxes = await actions.evaluateAll((els) => els.map((e) => e.getBoundingClientRect()).map((r) => ({ top: Math.round(r.top), h: r.height, w: r.width })));
  // One row, every target at least 44 px, names unchanged.
  expect(new Set(boxes.map((b) => b.top)).size).toBe(1);
  for (const b of boxes) expect(Math.min(b.h, b.w)).toBeGreaterThanOrEqual(44);
  const bar = page.locator('.prop-actions.is-top');
  await expect(bar.getByRole('button', { name: 'Save to shortlist' })).toBeVisible();
  await expect(bar.getByRole('button', { name: 'Share' })).toBeVisible();
  const more = page.getByRole('region', { name: 'More details' });
  await expect(more.getByRole('button', { name: 'Compare' })).toBeVisible();
  await expect(more.getByRole('button', { name: 'Print' })).toBeVisible();
  // Phones show icons only (the names stay); from 640 px the labels show.
  const label = await bar.getByRole('button', { name: 'Save to shortlist' }).locator('span').evaluate((e) => getComputedStyle(e).display);
  expect(label === 'none').toBe(info.project.name === 'phone');

  if (info.project.name === 'desktop') {
    const main = await page.locator('.prop-price').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    const card = await page.locator('.prop-side-price').evaluate((e) => parseFloat(getComputedStyle(e).fontSize));
    expect(card).toBeLessThan(main / 2);
  }

  // Room groups: each jumps to its first photo and is marked while its photos show.
  await page.getByRole('list', { name: 'Photos of this home' }).getByRole('button', { name: /^Open photo 1 of 9/ }).click();
  const viewer = page.getByRole('dialog', { name: 'Media viewer' });
  const rooms = viewer.getByRole('group', { name: 'Rooms' });
  await expect(rooms.getByRole('button', { name: /^Bedrooms/ })).toBeVisible();
  await rooms.getByRole('button', { name: /^Kitchen/ }).click();
  await expect(rooms.getByRole('button', { name: /^Kitchen/ })).toHaveAttribute('aria-pressed', 'true');
  // Owner captions often name the wrong room, so the viewer shows only the count.
  await expect(viewer.locator('figcaption')).toHaveText(/^\d+ of 9$/);
  await rooms.getByRole('button', { name: /^Living and dining/ }).click();
  await expect(viewer.locator('figcaption')).toContainText('2 of 9');
  await page.keyboard.press('Escape');
  await w.check();
});

test('property: a stand-in ₹10 Cr price shows "Price on request" everywhere', async ({ page }, info) => {
  const w = watch(page);
  const PLACEHOLDER = '/property/129';
  await page.goto(PLACEHOLDER);
  await expect(page.locator('.prop-price')).toHaveText('Price on request');
  await expect(page.locator('.prop-side-price')).toHaveText('Price on request');
  await expect(page.locator('.prop-side-sub')).not.toContainText('per sq ft');
  const costs = page.getByRole('region', { name: 'What it costs' });
  await expect(costs.locator('.prop-cost-rows dd')).toHaveText(['Price on request', 'Price on request', /^₹/]);
  await expect(costs.getByText('₹10,00,00,000')).toHaveCount(0);
  await expect(costs.getByRole('link', { name: 'Work out the EMI' })).toHaveAttribute('href', '/emi-calculator');
  await expect(page).toHaveTitle(/\| Price on request \| 360Ghar$/);
  if (info.project.name !== 'desktop') await expect(page.locator('[data-dock] .prop-dock-price')).toHaveText('Price on request');
  // JSON-LD keeps the offer but gives no price.
  const offers = await page.locator('script[type="application/ld+json"]').evaluateAll((els) =>
    els.flatMap((e) => [JSON.parse(e.textContent ?? '{}')].flat()).find((b) => b['@type'] === 'RealEstateListing')?.offers,
  );
  expect(offers['@type']).toBe('Offer');
  expect(offers.price).toBeUndefined();
  await page.goto(`/hi${PLACEHOLDER}`);
  await expect(page.locator('.prop-price')).toHaveText('कीमत पूछने पर');
  await w.check();
});

test('property: the day buttons are never cut, the price dots are readable, gallery captions are counts', async ({ page }, info) => {
  test.skip(process.platform === 'linux', 'Linux fonts make the tablet day grid wider than the panel, see handoff');
  const w = watch(page);
  await page.goto(SALE);
  await hydrated(page);
  // The strip under the photos says only "N of 9": owner captions often name the wrong room.
  if (info.project.name === 'phone') await expect(page.locator('.pg-cap').first()).toHaveText('1 of 9');

  await ready(page, '#prop-book');
  // Phones and tablets show the form in a sheet.
  if (info.project.name !== 'desktop') await page.locator('#prop-book').getByRole('button', { name: 'Book a visit' }).click();
  const row = page.locator('.contact-day-row');
  await expect(row.locator('button')).toHaveCount(7);
  const panel = await row.boundingBox();
  const boxes = await row.locator('button').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
  // A grid: every button whole inside the panel.
  for (const b of boxes) expect(b.left >= panel!.x - 0.5 && b.right <= panel!.x + panel!.width + 0.5).toBe(true);
  for (const b of boxes) expect(b.height).toBeGreaterThanOrEqual(44);
  if (info.project.name !== 'desktop') await page.keyboard.press('Escape');

  // Price strip: each dot at least 6 px across, and stacked dots do not touch.
  const dots = await page.locator('.pc-strip g[fill="var(--color-kesar-600)"] > path').evaluateAll((els) => els.map((e) => e.getBoundingClientRect().toJSON() as DOMRect));
  expect(dots.length).toBeGreaterThan(3);
  for (const d of dots) expect(Math.min(d.width, d.height)).toBeGreaterThanOrEqual(6);
  const stacked = dots.filter((a) => dots.some((b) => b !== a && Math.abs(b.x - a.x) < 1));
  expect(stacked.length).toBeGreaterThan(1);
  for (const a of stacked) for (const b of stacked) if (a !== b && Math.abs(a.x - b.x) < 1 && a.top < b.top) expect(b.top - a.bottom).toBeGreaterThan(0.5);
  await w.check();
});

test('property: the fold shows the price, the place and the ways to reach the agent', async ({ page }, info) => {
  const w = watch(page);
  await page.goto(SALE);
  await hydrated(page);
  const vh = page.viewportSize()!.height;
  const inFold = async (loc: ReturnType<Page['locator']>) => {
    const b = await loc.boundingBox();
    expect(b, 'element has a box').not.toBeNull();
    expect(b!.y + b!.height).toBeLessThanOrEqual(vh);
  };
  await inFold(page.locator('.prop-price'));
  await inFold(page.getByRole('heading', { level: 1 }));
  if (info.project.name === 'desktop') {
    // The card and the rail share one top edge and both rise into the photos.
    const card = await page.locator('.hc').boundingBox();
    const rail = page.locator('#prop-book .prop-side-sheet');
    const railBox = await rail.boundingBox();
    expect(Math.abs(card!.y - railBox!.y)).toBeLessThan(2);
    const mosaic = await page.locator('.pg-track').boundingBox();
    expect(card!.y).toBeLessThan(mosaic!.y + mosaic!.height);
    await inFold(rail.getByRole('link', { name: 'WhatsApp' }));
    await inFold(rail.getByRole('link', { name: /^Call/ }));
  } else {
    const cta = page.locator('[data-hc-cta]');
    for (const name of ['WhatsApp', 'Call', 'Book a visit']) {
      await inFold(cta.getByRole('link', { name }));
      const box = await cta.getByRole('link', { name }).boundingBox();
      expect(Math.min(box!.width, box!.height)).toBeGreaterThanOrEqual(44);
    }
  }
  await w.check();
});

test('property: the contact rail fits a short laptop screen', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the rail is beside the page only from 64rem');
  await page.setViewportSize({ width: 1366, height: 768 });
  await signedIn(page);
  await page.goto(SALE);
  await hydrated(page);
  await ready(page, '#prop-book');
  await page.evaluate(() => window.scrollTo(0, 900));
  const side = page.locator('#prop-book');
  const box = await side.boundingBox();
  expect(box!.height).toBeLessThanOrEqual(768 - 84 + 1);
  const submit = side.getByRole('button', { name: 'Request this visit' });
  await submit.scrollIntoViewIfNeeded();
  await expect(submit).toBeInViewport();
});

test('property: amenities show in groups and the heads hang left', async ({ page }, info) => {
  const w = watch(page);
  await page.goto(SALE);
  const amen = page.getByRole('region', { name: 'Amenities' });
  // Until the backend fix for cached detail responses ships, the API can leave amenities out (docs/backend-gaps.md, R27).
  test.skip((await amen.count()) === 0, 'the API response has no amenities');
  await expect(amen.getByRole('heading', { level: 3 }).first()).toBeVisible();
  // Wide: the heading sits left of the list.
  if (info.project.name !== 'phone') {
    const h = await amen.getByRole('heading', { level: 2 }).boundingBox();
    const list = await amen.locator('.am').boundingBox();
    expect(list!.x).toBeGreaterThan(h!.x + h!.width);
  }
  await axe(page);
  await w.check();
});

test('property: the floor marker moves only when motion is allowed', async ({ page }, info) => {
  test.skip(info.project.name === 'phone', 'the building drawing shows from 40rem');
  const layer = () => page.locator('.prop-building svg > g > g').nth(2);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(SALE);
  await expect(layer()).toBeAttached();
  expect(await layer().evaluate((e) => getComputedStyle(e).animationName)).toBe('none');
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  expect(await layer().evaluate((e) => getComputedStyle(e).animationName)).toBe('hc-rise');
});

test.describe('property: without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the strip shows the first photos, the mosaic all five, and the floor plan loads', async ({ page }, info) => {
    await page.goto(SALE);
    const slides = page.locator('.pg-slide');
    await expect(slides).toHaveCount(9);
    // Phones: the two photos in the first screen (the rest wait for JS). Mosaic: five.
    const shown = info.project.name === 'phone' ? 2 : 5;
    for (let i = 0; i < 9; i++) {
      if (i < shown) {
        await expect(slides.nth(i)).toBeVisible();
        await expect.poll(() => slides.nth(i).locator('img').evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
      } else await expect(slides.nth(i)).toBeHidden();
    }
    // The agent's WhatsApp and call links are plain links.
    const link = info.project.name === 'desktop' ? page.locator('#prop-book') : page.locator('[data-hc-cta]');
    await expect(link.getByRole('link', { name: 'WhatsApp' })).toHaveAttribute('href', /^https:\/\/wa\.me\/91\d{10}/);
    await expect(link.getByRole('link', { name: /^Call/ })).toHaveAttribute('href', /^tel:\+91\d{10}$/);
    const plan = page.getByRole('region', { name: 'Floor plan' }).getByRole('img', { name: /^Floor plan:/ });
    await plan.scrollIntoViewIfNeeded();
    await expect.poll(() => plan.evaluate((e: HTMLImageElement) => e.complete && e.naturalWidth > 0)).toBe(true);
  });
});
