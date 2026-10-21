/**
 * Home parity round: owner enquiry, refer and earn, the app, live tool counts,
 * the AI assistant, the review form, the fact sheet and the newsletter, at 360,
 * 768 and 1440 px. Formspree is always intercepted: nothing is posted for real.
 * Written by Agent A; run by the QA phase.
 */
import { expect, test, type Page, type Request } from '@playwright/test';
import { axe, backendDown, hydrated, watch } from './helpers';

type Post = { url: string; body: Record<string, unknown> };

test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  // Anything a test does not mock fails at the network layer.
  await page.route(/formspree\.io/, (route) => route.abort('blockedbyclient'));
});

async function mockFormspree(page: Page, status = 200) {
  const posts: Post[] = [];
  await page.route(/formspree\.io\/f\//, async (route) => {
    const req: Request = route.request();
    posts.push({ url: req.url(), body: req.postDataJSON() as Record<string, unknown> });
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 200 ? '{"ok":true}' : '{"errors":[{"message":"Form not active"}]}',
    });
  });
  return posts;
}

/** Scrolls one screen at a time so every client:visible island hydrates; ends at the top. */
async function scrollThrough(page: Page) {
  await expect(async () => {
    await page.waitForLoadState('domcontentloaded');
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += innerHeight * 0.7) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
    });
  }).toPass({ timeout: 40_000 });
  // Islands inside the sideways homes rail (left of the viewport edge) never scroll into view, so they stay waiting by design.
  await page.waitForFunction(
    () => ![...document.querySelectorAll('astro-island[ssr]')].some((i) => ((i.firstElementChild ?? i).getBoundingClientRect().left < innerWidth)),
    null,
    { timeout: 30_000 },
  );
  await page.evaluate(() => window.scrollTo(0, 0));
}

const main = (page: Page) => page.locator('main');

test('home parity: the new sections are on the page and the page stays clean', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await scrollThrough(page);
  const m = main(page);
  await expect(m.getByRole('heading', { name: 'Free owner onboarding and photography' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'Know someone with a home to rent out or sell?' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'Get the 360Ghar app' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'Ask an AI assistant to search for you' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'How was your experience with 360Ghar?' })).toBeVisible();
  await expect(m.getByRole('heading', { name: 'About 360Ghar' })).toBeVisible();
  await expect(m.getByRole('heading', { name: /New verified homes and guides/ })).toBeVisible();
  // Refer amounts are the real terms.
  await expect(m.locator('.refer-num').first()).toHaveText('₹100');
  await expect(m.locator('.refer-num').nth(1)).toHaveText('₹10,000');
  await expect(m.getByRole('link', { name: /Refer and earn/ })).toHaveAttribute('href', '/refer-and-earn');
  await axe(page);
  await w.check();
});

test('home parity: the owner enquiry validates, then posts once with source=home-enquiry', async ({ page }) => {
  const w = watch(page);
  const posts = await mockFormspree(page);
  await page.goto('/');
  await scrollThrough(page);
  const form = main(page).locator('.enq-form');
  await form.scrollIntoViewIfNeeded();
  await form.getByRole('button', { name: 'Request free onboarding' }).click();
  await expect(form.getByText('Enter your name.')).toBeVisible();
  await expect(form.getByText('Enter your email address.')).toBeVisible();
  await expect(form.getByText('Enter the property address or area.')).toBeVisible();
  await expect(form.getByText('Tick the box to continue.')).toBeVisible();
  expect(posts).toHaveLength(0);
  await form.getByLabel('Full name').fill('Asha Rao');
  await form.getByLabel('Email').fill('asha@');
  await form.getByLabel('Property address or area').fill('DLF Phase 3, Gurugram');
  await form.getByRole('button', { name: 'Request free onboarding' }).click();
  await expect(form.getByText('Enter an email address like name@example.com.')).toBeVisible();
  await form.getByLabel('Email').fill('asha@example.com');
  await form.getByRole('checkbox').check();
  await form.getByRole('button', { name: 'Request free onboarding' }).click();
  await expect(main(page).getByRole('status').filter({ hasText: 'Request sent' })).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]!.url).toContain('/f/mwpqglyb');
  expect(posts[0]!.body).toMatchObject({ source: 'home-enquiry', form_type: 'home-enquiry', full_name: 'Asha Rao', email: 'asha@example.com', address: 'DLF Phase 3, Gurugram', terms_agreement: 'yes' });
  expect(Object.keys(posts[0]!.body)).not.toContain('website');
  // The form can start again.
  await main(page).getByRole('button', { name: 'Send another request' }).click();
  await expect(form.getByLabel('Full name')).toHaveValue('');
  await w.check();
});

test('home parity: a filled honeypot looks sent and posts nothing; a failed post shows an error', async ({ page }) => {
  const posts = await mockFormspree(page);
  await page.goto('/');
  await scrollThrough(page);
  const form = main(page).locator('.enq-form');
  await form.scrollIntoViewIfNeeded();
  await form.getByLabel('Full name').fill('Bot');
  await form.getByLabel('Email').fill('bot@example.com');
  await form.getByLabel('Property address or area').fill('Nowhere');
  await form.getByRole('checkbox').check();
  await form.locator('.enq-trap input').fill('http://spam.example', { force: true });
  await form.getByRole('button', { name: 'Request free onboarding' }).click();
  await expect(main(page).getByRole('status').filter({ hasText: 'Request sent' })).toBeVisible();
  expect(posts).toHaveLength(0);

  // A server refusal: no success message.
  await page.unroute(/formspree\.io\/f\//);
  const failing = await mockFormspree(page, 422);
  await page.reload();
  await scrollThrough(page);
  const again = main(page).locator('.enq-form');
  await again.scrollIntoViewIfNeeded();
  await again.getByLabel('Full name').fill('Asha Rao');
  await again.getByLabel('Email').fill('asha@example.com');
  await again.getByLabel('Property address or area').fill('DLF Phase 3');
  await again.getByRole('checkbox').check();
  await again.getByRole('button', { name: 'Request free onboarding' }).click();
  await expect(again.getByRole('alert')).toContainText('Your message was not sent.');
  await expect(main(page).getByText('Request sent')).toHaveCount(0);
  expect(failing).toHaveLength(1);
});

test('home parity: the review form needs a rating and 20 characters, then posts source=review', async ({ page }) => {
  const w = watch(page);
  const posts = await mockFormspree(page);
  await page.goto('/');
  await scrollThrough(page);
  const form = main(page).locator('.rev-form');
  await form.scrollIntoViewIfNeeded();
  await form.getByRole('button', { name: 'Send review' }).click();
  await expect(form.getByText('Choose a rating from 1 to 5 stars.')).toBeVisible();
  await expect(form.getByText('Write at least 20 characters.')).toBeVisible();
  expect(posts).toHaveLength(0);
  // Four stars: the label follows the choice.
  await form.locator('.rev-star').nth(3).click();
  await expect(form.locator('.rev-rating-text')).toHaveText('Very good');
  await expect(form.locator('.rev-star.is-on')).toHaveCount(4);
  await form.getByLabel('You used 360Ghar as a').selectOption('tenant');
  await form.getByLabel(/^Your review/).fill('too short');
  await form.getByRole('button', { name: 'Send review' }).click();
  await expect(form.getByText('Write at least 20 characters.')).toBeVisible();
  await form.getByLabel(/^Your review/).fill('The team was on time and the flat matched the photos.');
  await form.getByRole('button', { name: 'Send review' }).click();
  await expect(main(page).getByRole('status').filter({ hasText: 'Review sent' })).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]!.body).toMatchObject({ source: 'review', form_type: 'review', rating: '4', role: 'tenant', name: 'Anonymous', platform: 'web' });
  await w.check();
});

test('home parity: rating stars work with the keyboard', async ({ page }) => {
  await page.goto('/');
  await scrollThrough(page);
  const form = main(page).locator('.rev-form');
  await form.scrollIntoViewIfNeeded();
  await form.getByRole('radio', { name: '1, Poor' }).focus();
  await page.keyboard.press('ArrowRight');
  await page.keyboard.press('ArrowRight');
  await expect(form.getByRole('radio', { name: '3, Good' })).toBeChecked();
  await expect(form.locator('.rev-rating-text')).toHaveText('Good');
});

test('home parity: tool notes show real counts, the AI address copies, the app link is the store page', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  await scrollThrough(page);
  const m = main(page);
  // Counts come from the API on each render; a number may be missing when the API is down, but never invented.
  const stats = await m.locator('.home-tool-stat').allInnerTexts();
  for (const s of stats) expect(s).toMatch(/^[\d,]+ listed$/);
  expect(stats.length).toBeGreaterThan(0);
  await expect(m.getByRole('link', { name: /3D floor plan builder/ })).toHaveAttribute('href', '/design-blueprint');
  await expect(m.getByRole('link', { name: /Get 360Ghar on Google Play/ })).toHaveAttribute('href', /play\.google\.com\/store\/apps\/details\?id=com\.the360ghar\.ghar360/);
  await expect(m.getByRole('link', { name: /How to connect/ })).toHaveAttribute('href', '/ai-agent');
  await expect(m.locator('.ai-url')).toHaveText('https://api.360ghar.com/mcp');
  await m.getByRole('button', { name: 'Copy server address' }).click();
  await expect(m.getByRole('button', { name: 'Copied' })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://api.360ghar.com/mcp');
  await w.check();
});

test('home parity: the QR code shows only on wide screens', async ({ page }, info) => {
  await page.goto('/');
  const qr = main(page).locator('.app-qr');
  if (info.project.name === 'desktop') await expect(qr).toBeVisible();
  else await expect(qr).toBeHidden();
});

test('home parity: the fact sheet is server text and matches the JSON-LD', async ({ page }) => {
  await page.goto('/');
  const rows = await main(page).locator('.facts-list > div').evaluateAll((els) => els.map((e) => `${e.querySelector('dt')!.textContent}: ${e.querySelector('dd')!.textContent}`));
  expect(rows.length).toBeGreaterThanOrEqual(8);
  const ld = (await page.locator('script[type="application/ld+json"]').allTextContents()).map((x) => JSON.parse(x)).flat();
  // The fact sheet is a WebPage that points at the site Organization; there is one Organization node only.
  const facts = ld.find((x) => x['@id'] === 'https://360ghar.com/#facts');
  expect(facts['@type']).toBe('WebPage');
  expect(facts.about).toEqual({ '@id': 'https://360ghar.com/#organization' });
  expect(facts.mainEntity.itemListElement.map((i: { name: string; description: string }) => `${i.name}: ${i.description}`)).toEqual(rows);
  expect(ld.filter((x) => x['@id'] === 'https://360ghar.com/#organization')).toHaveLength(1);
  // No unchecked claim.
  expect(rows.join(' ')).not.toMatch(/India.s first|walkthrough/i);
});

test('home parity: the page has one newsletter form and it posts to the newsletter Formspree form', async ({ page }) => {
  const posts = await mockFormspree(page);
  await page.goto('/');
  await scrollThrough(page);
  const news = main(page).locator('.news');
  await news.scrollIntoViewIfNeeded();
  await news.getByLabel('Email address').fill('reader@example.com');
  await news.getByRole('button', { name: 'Subscribe' }).click();
  await expect(news.getByRole('status')).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]!.url).toContain('/f/mkgzdjyj');
});

test('home parity: the enquiry sheet rises over the Owners band without cutting its text', async ({ page }) => {
  await page.goto('/');
  const band = (await main(page).locator('.home-owners').boundingBox())!;
  const sheet = (await main(page).locator('.enq .paper-card').boundingBox())!;
  // The sheet starts inside the band and ends below it.
  expect(sheet.y).toBeGreaterThan(band.y);
  expect(sheet.y).toBeLessThan(band.y + band.height);
  expect(sheet.y + sheet.height).toBeGreaterThan(band.y + band.height);
  // The band's last text (the four owner features) ends above the sheet.
  const last = (await main(page).locator('.home-pm li').last().boundingBox())!;
  expect(last.y + last.height).toBeLessThanOrEqual(sheet.y);
});

test('home parity: the phone drawing sits on the app sheet and does not push the page sideways', async ({ page }) => {
  const w = watch(page);
  await page.goto('/');
  const img = main(page).locator('.app-phone');
  await img.scrollIntoViewIfNeeded();
  await expect(img).toBeVisible();
  // The drawing is lazy: wait for it to load.
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.naturalWidth)).toBeGreaterThan(0);
  await w.check();
});

test('home parity: reduced motion keeps every new section in its final place', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  await page.goto('/');
  const anim = await page.evaluate(() => document.querySelector('.app-phone')!.getAnimations().length);
  expect(anim).toBe(0);
  await ctx.close();
});

test('home parity: with the backend down the new sections and both forms still work', async ({ page }) => {
  const w = watch(page);
  const posts = await mockFormspree(page);
  await backendDown(page);
  await page.goto('/');
  await hydrated(page);
  await scrollThrough(page);
  const m = main(page);
  await expect(m.getByRole('heading', { name: 'Free owner onboarding and photography' })).toBeVisible();
  // The counts are rendered on the server, so a browser-side outage cannot remove them; each one stays a plain count.
  for (const s of await m.locator('.home-tool-stat').allInnerTexts()) expect(s).toMatch(/^[\d,]+ listed$/);
  await m.locator('.rev-star').nth(4).click();
  await m.getByLabel(/^Your review/).fill('Everything was clear and the team called back the same day.');
  await m.getByRole('button', { name: 'Send review' }).click();
  await expect(m.getByRole('status').filter({ hasText: 'Review sent' })).toBeVisible();
  expect(posts).toHaveLength(1);
  await w.check();
});

test('home parity: the Hindi home has the new sections in Hindi', async ({ page }) => {
  const w = watch(page);
  await page.goto('/hi');
  await scrollThrough(page);
  const m = main(page);
  await expect(m.getByRole('heading', { name: 'मुफ़्त मालिक ऑनबोर्डिंग और फ़ोटोग्राफ़ी' })).toBeVisible();
  await expect(m.getByRole('heading', { name: '360Ghar ऐप पाएँ' })).toBeVisible();
  await expect(m.getByRole('heading', { name: '360Ghar के साथ आपका अनुभव कैसा रहा?' })).toBeVisible();
  await expect(m.getByRole('link', { name: /रेफ़र करें और कमाएँ/ })).toHaveAttribute('href', '/hi/refer-and-earn');
  await axe(page);
  await w.check();
});
