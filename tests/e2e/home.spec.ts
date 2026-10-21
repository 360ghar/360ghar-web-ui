/**
 * Home page: lead home, homes rail, steps, localities, searches, owners,
 * tools, FAQ and blog. Runs at 360, 768 and 1440 px (see playwright.config.ts).
 * No test writes to the production API.
 */
import { expect, test, type Page } from '@playwright/test';
import { axe, backendDown, hydrated, watch } from './helpers';

const main = (page: Page) => page.locator('main');

/**
 * Clicks and waits for the new URL. Retries, because the dev server reloads
 * the page when other files change, and a click during a reload is lost.
 */
async function follow(page: Page, act: () => Promise<unknown>, url: RegExp | ((u: URL) => boolean), waitUntil: 'commit' | 'domcontentloaded' = 'commit') {
  await expect(async () => {
    if (!(typeof url === 'function' ? url(new URL(page.url())) : url.test(page.url()))) await act();
    await page.waitForURL(url, { timeout: 10_000, waitUntil });
  }).toPass({ timeout: 50_000 });
}

/** Scrolls through the page so lazy images and `client:visible` islands load. Retries after a dev-server reload. */
async function scrollThrough(page: Page) {
  await expect(async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.8) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
  }).toPass({ timeout: 30_000 });
}

test('home: sections render with live data, no sideways scroll, axe clean', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Walk in before you visit.');
  await scrollThrough(page);
  const m = main(page);
  await expect(m.locator('#home-homes')).toContainText(/\d+ verified homes/);
  await expect(m.getByRole('heading', { name: 'More verified homes' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'Shortlist from your sofa. Visit once.' })).toBeVisible();
  await expect(m.locator('.home-steps > li')).toHaveCount(3);
  await expect(m.locator('.home-step-art')).toHaveCount(3);
  await expect(m.getByRole('heading', { name: 'Where the homes are' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'Questions people ask us' })).toBeVisible();
  // Locality counts are real numbers from the API, sorted high to low.
  const counts = await m.locator('.home-places-count').allInnerTexts();
  expect(counts.length).toBeGreaterThan(0);
  const nums = counts.map((c) => Number(c.replace(/\D/g, '')));
  expect(nums.every((n) => n > 0)).toBe(true);
  expect([...nums].sort((a, b) => b - a)).toEqual(nums);
  // Every image has a size, so nothing jumps while photos load.
  const unsized = await m.locator('img:not([width]), img:not([height])').count();
  expect(unsized).toBe(0);
  await axe(page);
  await w.check();
});

test('home: the lead home and a rail card open the property page', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  const lead = main(page).locator('.home-lead');
  await expect(lead.locator('img')).toHaveCount(5);
  await expect(lead).toContainText(/\d+ photos of this home/);
  const href = await lead.getByRole('link').getAttribute('href');
  expect(href).toMatch(/^\/property\/\d+$/);
  // The whole lead is one link: a click on a photo opens the home.
  await follow(page, () => lead.locator('img').nth(1).click({ force: true }), /\/property\/\d+$/);
  expect(new URL(page.url()).pathname).toBe(href);
  await page.goBack();
  const card = main(page).locator('.home-rail li').first();
  const cardHref = await card.getByRole('link').first().getAttribute('href');
  await follow(page, () => card.getByRole('link').first().click(), (u) => u.pathname === cardHref);
  await w.check();
});

test('home: rail buttons and keys scroll the homes', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await hydrated(page);
  const rail = main(page).locator('.home-rail');
  const prev = main(page).getByRole('button', { name: 'Previous homes' });
  const next = main(page).getByRole('button', { name: 'Next homes' });
  await rail.scrollIntoViewIfNeeded();
  // Rail cards have one photo and no nested photo strip, so a swipe on a photo moves the rail.
  await expect(rail.locator('.pcard-strip')).toHaveCount(0);
  await expect(prev).toBeDisabled();
  await expect(next).toBeEnabled();
  const left = () => rail.evaluate((el) => el.scrollLeft);
  // Each block is retried as one step: a dev-server reload resets the scroll.
  await expect(async () => {
    await rail.evaluate((el) => (el.scrollLeft = 0));
    await next.click();
    await expect.poll(left, { timeout: 3_000 }).toBeGreaterThan(100);
    await expect(prev).toBeEnabled({ timeout: 1_000 });
    await prev.click();
    await expect.poll(left, { timeout: 3_000 }).toBeLessThan(8);
  }).toPass({ timeout: 40_000 });
  // Keyboard: the rail takes focus and arrow keys scroll it.
  await expect(async () => {
    await rail.evaluate((el) => (el.scrollLeft = 0));
    await rail.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await expect.poll(left, { timeout: 3_000 }).toBeGreaterThan(0);
  }).toPass({ timeout: 30_000 });
  // A sideways swipe (horizontal wheel) on a card photo scrolls the rail itself.
  await expect(async () => {
    await rail.evaluate((el) => (el.scrollLeft = 0));
    const photo = (await rail.locator('li img').first().boundingBox())!;
    await page.mouse.move(photo.x + photo.width / 2, photo.y + photo.height / 2);
    await page.mouse.wheel(300, 0);
    await expect.poll(left, { timeout: 3_000 }).toBeGreaterThan(100);
  }).toPass({ timeout: 30_000 });
  // Tab into the next card: the whole card scrolls into view, not just its edge.
  // Retried as one step, because a dev-server reload resets the scroll and focus.
  const cards = rail.locator(':scope > li');
  const vw = page.viewportSize()!.width;
  await expect(async () => {
    await rail.evaluate((el) => (el.scrollLeft = 0));
    await cards.nth(1).locator('a[href^="/property/"]').first().focus();
    const b = (await cards.nth(1).boundingBox())!;
    expect(b.x).toBeGreaterThanOrEqual(0);
    expect(b.x + b.width).toBeLessThanOrEqual(vw);
  }).toPass({ timeout: 30_000 });
  await w.check();
});

test('home: favourite on the lead asks a signed-out user to sign in', async ({ page }) => {
  await page.goto('/');
  const fav = main(page).locator('.home-lead').getByRole('button', { name: 'Save to shortlist' });
  await fav.scrollIntoViewIfNeeded();
  await expect(fav).toBeVisible();
  // Retry: the dev server may reload the page while other files change.
  await expect(async () => {
    await page.waitForFunction(() => !document.querySelector('.home-lead astro-island[ssr]'));
    await fav.click();
    await page.waitForURL(/\/login\?next=/, { timeout: 5_000 });
  }).toPass({ timeout: 45_000 });
});

test('home: locality, search, tool and owner links go to live pages', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  const m = main(page);
  const place = m.locator('.home-places a').first();
  const placeHref = await place.getAttribute('href');
  expect(placeHref).toMatch(/^\/locality\/[a-z0-9-]+-gurgaon$/);
  await follow(page, () => place.click(), (u) => u.pathname === placeHref, 'domcontentloaded');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await page.goBack();

  await follow(page, () => m.getByRole('link', { name: '2 BHK flats for rent' }).click(), /\/gurgaon\/rent\/flats\/2-bhk$/);
  await page.goBack();

  await follow(page, () => m.getByRole('link', { name: /EMI calculator/ }).click(), /\/emi-calculator$/);
  await page.goBack();

  await follow(page, () => m.getByRole('link', { name: /Post your property free/ }).click(), /\/post-property$/);
  await page.goBack();

  await expect(m.getByRole('link', { name: /All [\d,]+ localities/ })).toHaveAttribute('href', '/localities');
  await expect(m.getByRole('link', { name: 'Get the owner app' })).toHaveAttribute('href', /play\.google\.com/);
  await expect(m.getByRole('link', { name: /Read reviews on Google/ })).toHaveAttribute('href', /google\.com\/search/);
  await w.check();
});

test('home: every internal link in the page answers', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop', 'one width is enough for a link check');
  test.setTimeout(240_000);
  await page.goto('/');
  const hrefs = await main(page)
    .locator('a[href^="/"]')
    .evaluateAll((as) => [...new Set(as.map((a) => a.getAttribute('href')!))]);
  expect(hrefs.length).toBeGreaterThan(20);
  const bad: string[] = [];
  for (const href of hrefs) {
    const r = await request.get(href, { maxRedirects: 0, timeout: 60_000 });
    if (r.status() >= 400) bad.push(`${r.status()} ${href}`);
  }
  expect(bad).toEqual([]);
});

test('home: FAQ shows five questions, the rest open under one toggle, JSON-LD keeps all', async ({ page }) => {
  await page.goto('/');
  const faq = main(page).locator('.home-faq');
  const item = faq.locator('.faq-item').first();
  await item.locator('summary').click();
  await expect(item).toHaveAttribute('open', '');
  await expect(item.locator('p')).toBeVisible();
  await item.locator('summary').click();
  await expect(item).not.toHaveAttribute('open', '');
  // Five visible questions; the other five are in the HTML behind "5 more questions".
  await expect(faq.locator('.faq-item:visible')).toHaveCount(5);
  await expect(faq.locator('.faq-item')).toHaveCount(10);
  const more = faq.locator('.home-faq-more');
  await more.locator('> summary').click();
  await expect(more).toHaveAttribute('open', '');
  await expect(faq.locator('.faq-item:visible')).toHaveCount(10);
  const last = faq.locator('.faq-item').last();
  await last.locator('summary').click();
  await expect(last.locator('p')).toBeVisible();
  const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
  const faqLd = ld.map((x) => JSON.parse(x)).flat().find((x) => x['@type'] === 'FAQPage');
  expect(faqLd.mainEntity).toHaveLength(10);
});

test('home: the three steps line up, same top, height and vignette size', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'the steps sit side by side from 896 px');
  await page.goto('/');
  const steps = main(page).locator('.home-steps > li');
  await expect(steps).toHaveCount(3);
  const boxes = await steps.evaluateAll((lis) =>
    lis.map((li) => {
      const r = (s: string) => li.querySelector(s)!.getBoundingClientRect();
      return { top: r('.home-step').top, h: r('.home-step').height, art: r('.home-step-art').height, title: r('.home-step-title').top, body: r('.home-step-body').top };
    }),
  );
  for (const k of ['top', 'h', 'art', 'title', 'body'] as const) {
    const vals = boxes.map((b) => b[k]);
    expect(Math.max(...vals) - Math.min(...vals), k).toBeLessThanOrEqual(1);
  }
});

test('home: tools in three groups, each tool with its own icon', async ({ page }) => {
  await page.goto('/');
  const sets = main(page).locator('.home-toolset');
  await expect(sets).toHaveCount(3);
  await expect(sets.nth(0).getByRole('heading', { level: 3 })).toHaveText('Money');
  await expect(sets.nth(1).getByRole('heading', { level: 3 })).toHaveText('Checks');
  await expect(sets.nth(2).getByRole('heading', { level: 3 })).toHaveText('Design');
  await expect(sets.nth(0).locator('.paper-vignette')).toHaveCount(1);
  const icons = await main(page)
    .locator('.home-tools a > svg:first-child path')
    .evaluateAll((ps) => ps.map((p) => p.getAttribute('d')));
  expect(icons).toHaveLength(10);
  expect(new Set(icons).size).toBe(10);
  await expect(main(page).getByRole('link', { name: /Capital gains tax calculator/ })).toHaveAttribute('href', '/capital-gains-tax-calculator');
});

test('home: search by PG, by text, and Near me without location', async ({ page, context }) => {
  const w = watch(page);
  await context.grantPermissions([]);
  await page.goto('/');
  await hydrated(page);
  const form = page.getByRole('search', { name: 'Find a home' });
  await form.locator('label', { hasText: 'PG' }).click();
  // The island adds the PG type field; wait for it, so the click is not lost to a reload.
  await expect(form.locator('input[name="property_type"]')).toHaveCount(1);
  await form.getByRole('button', { name: 'Search' }).click();
  await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
  const q = new URL(page.url()).searchParams;
  expect(q.get('purpose')).toBe('rent');
  expect(q.get('property_type')).toBe('pg');
  await page.goBack();
  await hydrated(page);
  await form.getByRole('combobox').or(form.getByRole('textbox')).first().fill('Sector 85');
  await form.getByRole('button', { name: 'Search' }).click();
  await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
  expect(new URL(page.url()).searchParams.get('q')).toBe('Sector 85');
  await page.goBack();
  await hydrated(page);
  await page.evaluate(() => {
    // Location is refused, as when the user says no.
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) => fail({ code: 1 }) },
      configurable: true,
    });
  });
  await form.getByRole('button', { name: 'Near me' }).click();
  await expect(form.getByRole('status')).toContainText('Location is off');
  await w.check();
});

test('home: the scene moves only without reduced motion', async ({ browser }) => {
  for (const reducedMotion of ['no-preference', 'reduce'] as const) {
    const ctx = await browser.newContext({ reducedMotion, viewport: { width: 1440, height: 900 } });
    const page = await ctx.newPage();
    await page.goto('/');
    const running = await page.evaluate(() => ['.layer-train', '.layer-clouds', '.layer-kite'].map((s) => document.querySelector(s)!.getAnimations().length));
    if (reducedMotion === 'reduce') expect(running).toEqual([0, 0, 0]);
    else expect(running).toEqual([1, 1, 1]);
    await ctx.close();
  }
});

test('home: works with the backend down in the browser, rail still scrolls', async ({ page }) => {
  const w = watch(page);
  await backendDown(page);
  await page.goto('/');
  await hydrated(page);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const next = main(page).getByRole('button', { name: 'Next homes' });
  await next.scrollIntoViewIfNeeded();
  await next.click();
  await expect.poll(() => main(page).locator('.home-rail').evaluate((el) => el.scrollLeft)).toBeGreaterThan(100);
  await w.check();
});

test('home: the Hindi page renders in Hindi', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('विज़िट से पहले घर घूमिए।');
  await scrollThrough(page);
  const m = main(page);
  await expect(m.getByRole('heading', { name: 'घर कहाँ हैं' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'कमरा-दर-कमरा देखिए' })).toBeVisible();
  await expect(m.getByRole('button', { name: 'अगले घर' })).toBeVisible();
  await expect(m.locator('.home-places a').first()).toHaveAttribute('href', /^\/hi\/locality\//);
  await axe(page);
  await w.check();
});

test('home: free AI tools band compares and links', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await hydrated(page);
  const band = page.locator('section[aria-labelledby="home-fai"]');
  await band.scrollIntoViewIfNeeded();
  await expect(band.getByRole('heading', { name: /furnished in half a minute/ })).toBeVisible();
  const slider = band.getByRole('slider', { name: /empty flat or the AI redesign/ });
  await slider.fill('25');
  await expect(band.locator('.fai-stage')).toHaveAttribute('style', /--cmp: 25%/);
  await expect(band.getByRole('link', { name: 'Design a room' })).toHaveAttribute('href', '/ai-design-studio');
  await expect(band.getByRole('link', { name: 'Check a plan' })).toHaveAttribute('href', '/vastu-checker');
  await band.getByRole('button', { name: 'Start a chat' }).click();
  await expect(page.locator('[data-chat-launcher]')).toHaveAttribute('aria-expanded', 'true');
  await w.check();
});
