/**
 * Static content pages: every route (one slug per template, plus unknown
 * slugs for 404) at 360, 768 and 1440 px (playwright projects). Clicks every
 * accordion and control, fills every form (validation errors, then a mocked
 * submit), runs axe, and fails on page errors or horizontal scroll.
 * Formspree is always intercepted: nothing is posted.
 * SHOTS=1 also writes full-page screenshots to docs/screenshots/content/.
 */
import { mkdirSync } from 'node:fs';
import { expect, test, type Page, type Request } from '@playwright/test';
import { axe, backendDown, hydrated, watch } from './helpers';

const SHOTS = process.env.SHOTS === '1';
const SHOT_DIR = new URL('../../docs/screenshots/content/', import.meta.url).pathname;

/** Any Formspree call that a test did not mock fails at the network layer. */
test.beforeEach(async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});
  await page.route(/formspree\.io/, (route) => route.abort('blockedbyclient'));
});

/** Mocks Formspree; returns the posted JSON bodies. */
async function mockFormspree(page: Page, status = 200) {
  const posts: { url: string; body: Record<string, unknown> }[] = [];
  await page.route(/formspree\.io\/f\//, async (route) => {
    const req: Request = route.request();
    posts.push({ url: req.url(), body: req.postDataJSON() as Record<string, unknown> });
    await route.fulfill({
      status,
      contentType: 'application/json',
      body: status === 200 ? '{"ok":true,"next":"/thanks"}' : '{"errors":[{"message":"Form not active"}]}',
    });
  });
  return posts;
}

/** Scrolls down one screen at a time so every client:visible island hydrates, then back to the top. */
async function scrollThrough(page: Page) {
  for (let i = 0; i < 40; i += 1) {
    const done = await page.evaluate(() => {
      window.scrollBy(0, window.innerHeight * 0.9);
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;
    });
    await page.waitForTimeout(80);
    if (done) break;
  }
  await page.evaluate(() => window.scrollTo(0, 0));
}

async function open(page: Page, path: string) {
  const w = watch(page);
  const res = await page.goto(path);
  expect(res?.status(), path).toBe(200);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await scrollThrough(page);
  await hydrated(page);
  return w;
}

/** Opens and closes every accordion in the main content. */
async function toggleAll(page: Page) {
  const summaries = page.locator('main details > summary');
  const n = await summaries.count();
  for (let i = 0; i < n; i += 1) {
    const s = summaries.nth(i);
    if (!(await s.isVisible())) continue;
    const details = s.locator('..');
    const wasOpen = await details.evaluate((d) => (d as HTMLDetailsElement).open);
    await s.click();
    await expect.poll(() => details.evaluate((d) => (d as HTMLDetailsElement).open)).toBe(!wasOpen);
  }
}

async function shot(page: Page, name: string, project: string) {
  if (!SHOTS || project === 'tablet') return;
  mkdirSync(SHOT_DIR, { recursive: true });
  const w = page.viewportSize()?.width ?? 0;
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: `${SHOT_DIR}${name}-${w}.png`, fullPage: true, scale: 'css' });
}

const STATIC = [
  ['about', '/about-us'],
  ['gurugram-guide', '/gurugram-real-estate-guide'],
  ['investment-guide', '/property-investment-gurugram'],
  ['for-ai', '/for-ai'],
  ['celebrity-homes', '/celebrity-homes'],
  ['nri-guide', '/nri-property-guide'],
  ['security-deposit', '/landlord-not-returning-security-deposit'],
  ['list-property-free', '/list-property-free'],
  ['careers', '/careers'],
  ['career', '/careers/real-estate-agent'],
  ['career-closed', '/careers/software-developer-intern'],
  ['vs-hub', '/vs'],
  ['vs', '/vs/nobroker'],
  ['vs-stanza', '/vs/stanza-living'],
  ['truth', '/truth/zolo-issues'],
  ['policies', '/policies'],
  ['policy', '/policies/grievance-redressal-mechanism'],
  ['about-hi', '/hi/about-us'],
  ['vs-hi', '/hi/vs/99acres'],
] as const;

for (const [name, path] of STATIC) {
  test(`content: ${path} renders, accordions work, no a11y or layout errors`, async ({ page }, info) => {
    const w = await open(page, path);
    await shot(page, name, info.project.name);
    await toggleAll(page);
    await w.check();
    await axe(page);
  });
}

test('content: unknown slugs return a real 404, /truth redirects to /vs', async ({ page, request }) => {
  for (const path of ['/careers/nope', '/vs/stanza', '/truth/nobroker', '/policies/not-a-policy', '/hi/careers/nope']) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  }
  const r = await request.get('/truth', { maxRedirects: 0 });
  expect(r.status()).toBe(301);
  expect(r.headers()['location']).toMatch(/\/vs$/);
});

test('content: JSON-LD uses real data (founder, jobs, fixed dates, MCP tools)', async ({ page }) => {
  const ld = async () => (await page.locator('script[type="application/ld+json"]').allTextContents()).map((s) => JSON.parse(s));

  await page.goto('/about-us');
  const person = (await ld()).find((b) => b['@type'] === 'Person');
  expect(person?.name).toBe('Saksham Mittal');
  await expect(page.getByText(person.name, { exact: true }).first()).toBeAttached();
  // No listing has a tour yet, so no "each with a 360° walkthrough"; no "India's first" claim.
  expect(person.description).not.toMatch(/AI \+ VR|first/i);
  await expect(page.locator('main')).not.toContainText(/each (one )?(has|with) a 360° walkthrough|AI \+ VR/i);
  await page.goto('/hi/about-us');
  await expect(page.locator('main')).not.toContainText(/हर घर का 360°|AI \+ VR/);

  await page.goto('/careers/real-estate-agent');
  const job = (await ld()).find((b) => b['@type'] === 'JobPosting');
  expect(job?.datePosted).toBe('2026-06-08');
  expect(job).not.toHaveProperty('baseSalary');
  await expect(page.getByRole('link', { name: 'Apply by email' })).toHaveAttribute('href', /^mailto:info@360ghar\.com\?subject=Application%20for%20Real%20Estate%20Agent/);

  const closed = await page.goto('/careers/software-developer-intern');
  expect(closed?.status()).toBe(200);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  expect((await ld()).some((b) => b['@type'] === 'JobPosting')).toBe(false);

  await page.goto('/truth/nobroker-listings');
  const art = (await ld()).find((b) => b['@type'] === 'Article');
  expect(art?.datePublished).toBe('2026-06-20');
  const crumbs = (await ld()).find((b) => b['@type'] === 'BreadcrumbList');
  expect(crumbs.itemListElement.map((i: { item: string }) => i.item)).toEqual(['https://360ghar.com/', 'https://360ghar.com/vs', 'https://360ghar.com/truth/nobroker-listings']);

  await page.goto('/ai-agent');
  await expect(page.getByRole('rowheader', { name: 'discovery_search' })).toBeVisible();
  await expect(page.getByText('property_search', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/50K\+|10K\+|99%/)).toHaveCount(0);
});

test('contact: validation, ?subject= prefill, failed and successful submit', async ({ page }, info) => {
  await open(page, '/contact?subject=Visit%20in%20Sector%2057');
  await shot(page, 'contact', info.project.name);
  const form = page.locator('form.contact-form');
  await expect(form.getByLabel('Subject')).toHaveValue('Visit in Sector 57');

  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText('Name is required')).toBeVisible();
  await expect(form.getByText('Email is required')).toBeVisible();
  await expect(form.getByText('Message must have minimum 5 characters')).toBeVisible();

  await form.getByLabel('Your Name').fill('Asha Rao');
  await form.getByLabel('Your Email').fill('not-an-email');
  await form.getByLabel('Your Message').fill('I want to see a 2 BHK this weekend.');
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText('Invalid email format')).toBeVisible();
  await form.getByLabel('Your Email').fill('asha@example.com');

  // Formspree refuses: the error shows and the form keeps the values.
  await mockFormspree(page, 422);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Your message was not sent' })).toBeVisible();
  await expect(form.getByLabel('Your Name')).toHaveValue('Asha Rao');

  // A later route wins, so this mock replaces the failing one.
  const posts = await mockFormspree(page);
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Message sent')).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]!.url).toContain('/f/mwpqglyb');
  expect(posts[0]!.body).toEqual({ user_name: 'Asha Rao', user_email: 'asha@example.com', user_subject: 'Visit in Sector 57', message: 'I want to see a 2 BHK this weekend.' });
  await page.getByRole('button', { name: 'Send another message' }).click();
  await expect(page.locator('form.contact-form')).toBeVisible();

  await axe(page);
});

test('faq: questions from the API, accordion, contact form', async ({ page }, info) => {
  const w = await open(page, '/faq');
  await shot(page, 'faq', info.project.name);
  const items = page.locator('main .faq-page-list details');
  expect(await items.count()).toBeGreaterThan(0);
  await toggleAll(page);
  const posts = await mockFormspree(page);
  const form = page.locator('form.contact-form');
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(form.getByText('Name is required')).toBeVisible();
  await form.getByLabel('Your Name').fill('Asha Rao');
  await form.getByLabel('Your Email').fill('asha@example.com');
  await form.getByLabel('Your Message').fill('Do you cover Sohna Road?');
  await form.getByRole('button', { name: 'Send Message' }).click();
  await expect(page.getByText('Message sent')).toBeVisible();
  expect(posts[0]!.body).toMatchObject({ user_name: 'Asha Rao', message: 'Do you cover Sohna Road?' });
  await w.check();
  await axe(page);
});

test('faq and policy pages still work with the backend down in the browser', async ({ page }) => {
  await backendDown(page);
  for (const path of ['/faq', '/policies/privacy-policy']) {
    const w = await open(page, path);
    await expect(page.locator('main')).not.toContainText('undefined');
    await w.check();
  }
});

test('policy: table of contents jumps to its section', async ({ page }, info) => {
  await open(page, '/policies/terms-of-service');
  const desktop = info.project.name === 'desktop';
  if (!desktop) await page.locator('.page-toc-small summary').click();
  const toc = page.locator(desktop ? '.page-toc-wide' : '.page-toc-small');
  const first = toc.getByRole('link').first();
  const target = (await first.getAttribute('href'))!;
  await first.click();
  await expect(page).toHaveURL(new RegExp(`${target}$`));
  await expect(page.locator(`[id="${target.slice(1)}"]`)).toBeInViewport();
});

test('refer and earn: validation, then a referral goes to Formspree with form_type', async ({ page }, info) => {
  const w = await open(page, '/refer-and-earn');
  await shot(page, 'refer-and-earn', info.project.name);
  await toggleAll(page);
  const form = page.locator('form.ref-form');
  await form.getByRole('button', { name: 'Submit referral' }).click();
  await expect(form.getByText('Select your relationship to the owner.')).toBeVisible();
  await expect(form.getByText('Confirm that the owner agreed.')).toBeVisible();
  await expect(form.getByText('Accept the referral terms to continue.')).toBeVisible();
  await expect(form.getByLabel('Your Name')).toBeFocused();

  await form.getByLabel('Your Name').fill('Ravi Kumar');
  await form.getByLabel('Mobile Number', { exact: true }).fill('12345');
  await form.getByLabel('Your Email').fill('ravi@example.com');
  await form.getByLabel('Relationship to the owner').selectOption('friend');
  await form.getByLabel('Owner name').fill('Meena Sharma');
  await form.getByLabel('Owner mobile number').fill('+91 98765-43210');
  await form.getByLabel('Full property address').fill('Tower 4, Flat 1203, Sector 57, Gurugram');
  await form.getByLabel('Property type').selectOption('apartment');
  await form.getByLabel('Rent or sale').selectOption('rent');
  await form.getByLabel('Expected price or rent (₹)').fill('45000');
  await form.getByLabel('I confirm that the owner agreed').check();
  await form.getByRole('checkbox', { name: /I agree to the/ }).check();
  await form.getByRole('button', { name: 'Submit referral' }).click();
  await expect(form.getByText('Please enter a valid Indian mobile number starting with 6-9')).toBeVisible();
  await form.getByLabel('Mobile Number', { exact: true }).fill('9123456780');

  const posts = await mockFormspree(page);
  await form.getByRole('button', { name: 'Submit referral' }).click();
  await expect(page.getByText('Referral sent')).toBeVisible();
  expect(posts).toHaveLength(1);
  expect(posts[0]!.url).toContain('/f/mwpqglyb');
  expect(posts[0]!.body).toMatchObject({
    form_type: 'referral',
    referrer_name: 'Ravi Kumar',
    referrer_phone: '9123456780',
    relationship: 'friend',
    owner_phone: '9876543210',
    property_type: 'apartment',
    intent: 'rent',
    expected_price: '45000',
    consent: 'yes',
    terms_accepted: 'yes',
  });
  await w.check();
  await axe(page);
});

test('glossary: search, A to Z filter, empty state', async ({ page }, info) => {
  const w = await open(page, '/glossary');
  await shot(page, 'glossary', info.project.name);
  const items = page.locator('.gl-list details');
  const total = await items.count();
  expect(total).toBe(20);

  await page.getByRole('searchbox', { name: 'Search terms' }).fill('stamp');
  await expect(page.locator('.gl-list .gl-term')).toContainText(['Stamp Duty']);
  expect(await items.count()).toBeLessThan(total);
  await page.getByRole('searchbox', { name: 'Search terms' }).fill('');

  const letters = page.getByRole('group', { name: 'Jump to letter' });
  await letters.getByRole('button', { name: 'R', exact: true }).click();
  await expect(letters.getByRole('button', { name: 'R', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(items).toHaveCount(2);
  await items.first().locator('summary').click();
  await expect(items.first()).toHaveAttribute('open', '');

  await page.getByRole('searchbox', { name: 'Search terms' }).fill('zzzz');
  await expect(page.getByText('No matching results found.')).toBeVisible();
  await page.getByRole('button', { name: 'Clear filters' }).click();
  await expect(items).toHaveCount(total);
  await expect(letters.getByRole('button', { name: 'All' })).toHaveAttribute('aria-pressed', 'true');

  await w.check();
  await axe(page);
});

test('links and AI agent: copy buttons copy the URL', async ({ page }, info) => {
  let w = await open(page, '/links');
  await shot(page, 'links', info.project.name);
  await expect(page.locator('main').getByRole('link', { name: /Instagram/ }).first()).toHaveAttribute('href', 'https://www.instagram.com/360ghar/');
  await expect(page.getByText('Coming Soon')).toHaveCount(0);
  await page.getByRole('button', { name: 'Copy the link to this page' }).click();
  await expect(page.getByRole('button', { name: 'Link copied' })).toBeVisible();
  if (info.project.name === 'desktop') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://360ghar.com/links');
  await w.check();
  await axe(page);

  w = await open(page, '/ai-agent');
  await shot(page, 'ai-agent', info.project.name);
  await toggleAll(page);
  await page.getByRole('button', { name: 'Copy server URL' }).click();
  await expect(page.getByRole('button', { name: 'Copied' })).toBeVisible();
  if (info.project.name === 'desktop') expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('https://api.360ghar.com/mcp');
  await w.check();
  await axe(page);
});

test('paper art: the about story has four scenes, and each content page has its strip', async ({ page }) => {
  await page.goto('/about-us');
  const steps = page.locator('.story-step');
  await expect(steps).toHaveCount(4);
  for (let i = 0; i < 4; i += 1) await expect(steps.nth(i).locator('svg[data-scene]')).toBeVisible();
  for (const path of ['/faq', '/contact', '/policies', '/careers', '/vs', '/vs/nobroker', '/truth/zolo-issues', '/glossary', '/gurugram-real-estate-guide', '/property-investment-gurugram', '/nri-property-guide', '/landlord-not-returning-security-deposit', '/list-property-free', '/links', '/for-ai', '/ai-agent', '/refer-and-earn', '/celebrity-homes', '/hi/faq']) {
    await page.goto(path);
    await expect(page.locator('.page-art svg[data-scene]'), path).toHaveCount(1);
  }
});

test('security deposit guide: the contents list jumps to its section', async ({ page }, info) => {
  await page.goto('/landlord-not-returning-security-deposit');
  const desktop = info.project.name === 'desktop';
  if (!desktop) await page.locator('.page-toc-small summary').click();
  const toc = page.locator(desktop ? '.page-toc-wide' : '.page-toc-small');
  await toc.getByRole('link', { name: 'State-wise rules' }).click();
  await expect(page).toHaveURL(/#sd-states$/);
  await expect(page.getByRole('heading', { name: 'State-wise deposit rules' })).toBeInViewport();
});

test('NRI guide: the contents list jumps to its section', async ({ page }, info) => {
  await page.goto('/nri-property-guide');
  const desktop = info.project.name === 'desktop';
  if (!desktop) await page.locator('.page-toc-small summary').click();
  const toc = page.locator(desktop ? '.page-toc-wide' : '.page-toc-small');
  await toc.getByRole('link', { name: 'Tax rules' }).click();
  await expect(page).toHaveURL(/#nri-tax$/);
  await expect(page.getByRole('heading', { name: 'Tax implications for NRI property transactions' })).toBeInViewport();
});

test('newsletter: validation and a mocked sign-up', async ({ page }) => {
  await open(page, '/about-us');
  const form = page.locator('form.news-form');
  await form.scrollIntoViewIfNeeded();
  // client:visible: wait until the island has hydrated, or the click submits the plain form.
  await expect(page.locator('astro-island:has(form.news-form)')).not.toHaveAttribute('ssr', /.*/, { timeout: 20_000 });
  await form.getByRole('button', { name: 'Subscribe' }).click();
  await expect(form.getByText('Enter your email address.')).toBeVisible();
  await form.getByLabel('Email address').fill('a@b');
  await form.getByRole('button', { name: 'Subscribe' }).click();
  await expect(form.getByText('Enter an email address like name@example.com.')).toBeVisible();
  const posts = await mockFormspree(page);
  await form.getByLabel('Email address').fill('reader@example.com');
  await form.getByRole('button', { name: 'Subscribe' }).click();
  await expect(page.getByText('Thanks for joining!')).toBeVisible();
  expect(posts[0]!.url).toContain('/f/mkgzdjyj');
  expect(posts[0]!.body).toEqual({ email: 'reader@example.com' });
});
