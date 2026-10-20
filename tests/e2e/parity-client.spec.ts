/**
 * Client parity (agent E): saved location and fallback notice, the offline
 * notice and page, the service worker, haptics, and the assigned agent card.
 *
 * Written without a browser run: the QA phase runs it and fixes what fails.
 * The service worker tests need a PRODUCTION build (the page registers /sw.js
 * only there). Run them with SW_E2E=1 and BASE_URL pointing at the built site,
 * for example a local Netlify preview. Without SW_E2E they are skipped, and one
 * test checks that the dev server registers no worker.
 *
 * Every write is mocked. No test sends anything to the real API.
 */
import { expect, test, type Page } from '@playwright/test';
import { axe, hydrated, signedIn, watch } from './helpers';

const KEY = '360ghar:location-v2';
const HOUR = 3_600_000;

/** Counts the calls to the browser's geolocation, across page loads of one tab. */
async function countGeolocation(page: Page) {
  await page.addInitScript(() => {
    const g = navigator.geolocation;
    const real = g.getCurrentPosition.bind(g);
    g.getCurrentPosition = (...args: Parameters<typeof real>) => {
      sessionStorage.setItem('geo-asked', String(Number(sessionStorage.getItem('geo-asked') ?? 0) + 1));
      return real(...args);
    };
  });
}
const asked = (page: Page) => page.evaluate(() => Number(sessionStorage.getItem('geo-asked') ?? 0));

/** The browser refuses (code 1), times out (3), as after the person taps "Block". */
const failWith = (page: Page, code: number) =>
  page.evaluate((c) => {
    Object.defineProperty(navigator, 'geolocation', {
      value: { getCurrentPosition: (_ok: unknown, fail: (e: unknown) => void) => fail({ code: c }) },
      configurable: true,
    });
  }, code);

const seed = (page: Page, fix: Record<string, unknown>) =>
  page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [KEY, JSON.stringify({ state: { fix }, version: 1 })]);

const heroForm = (page: Page, name = 'Find a home') => page.getByRole('search', { name });

/* ------------------------------ E1: location ------------------------------ */

test.describe('saved location', () => {
  test('Near me asks once, saves only four fields, then reuses the fix; Forget clears it', async ({ page, context }) => {
    const w = watch(page);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 28.4089, longitude: 77.0418, accuracy: 25 });
    await countGeolocation(page);
    await page.goto('/');
    await hydrated(page);
    const form = heroForm(page);
    await expect(form.getByRole('button', { name: 'Forget saved location' })).toHaveCount(0);

    await form.getByRole('button', { name: 'Near me' }).click();
    await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
    expect(new URL(page.url()).searchParams.get('lat')).toBe('28.40890');
    const saved = await page.evaluate((k) => JSON.parse(localStorage.getItem(k)!) as { state: { fix: Record<string, unknown> } }, KEY);
    expect(Object.keys(saved.state.fix).sort()).toEqual(['accuracy', 'lat', 'lng', 'time']);
    expect(await asked(page)).toBe(1);

    // Back on the home page the saved fix is read after hydration; Near me does not ask again.
    await page.goto('/');
    await hydrated(page);
    const forget = form.getByRole('button', { name: 'Forget saved location' });
    await expect(forget).toBeVisible();
    await axe(page);
    await form.getByRole('button', { name: 'Near me' }).click();
    await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
    expect(new URL(page.url()).searchParams.get('lat')).toBe('28.40890');
    expect(await asked(page)).toBe(1);

    // Forget: the message says so, focus stays on it, the saved value is gone.
    await page.goto('/');
    await hydrated(page);
    await forget.click();
    const done = form.getByRole('status').filter({ hasText: 'Saved location removed.' });
    await expect(done).toBeVisible();
    await expect(done).toBeFocused();
    expect(await page.evaluate((k) => (JSON.parse(localStorage.getItem(k)!) as { state: { fix: unknown } }).state.fix, KEY)).toBeNull();
    await page.reload();
    await hydrated(page);
    await expect(form.getByRole('button', { name: 'Forget saved location' })).toHaveCount(0);
    await w.check();
  });

  test('a fix older than 24 hours is ignored; a fresh one is used without asking', async ({ page, context }) => {
    const w = watch(page);
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 28.4089, longitude: 77.0418 });
    await countGeolocation(page);
    await seed(page, { lat: 28.1, lng: 77.1, accuracy: null, time: Date.now() - 25 * HOUR });
    await page.goto('/');
    await hydrated(page);
    const form = heroForm(page);
    await expect(form.getByRole('button', { name: 'Forget saved location' })).toHaveCount(0);
    await form.getByRole('button', { name: 'Near me' }).click();
    await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
    expect(new URL(page.url()).searchParams.get('lat')).toBe('28.40890'); // the new fix, not the stale 28.1
    expect(await asked(page)).toBe(1);
    await w.check();
  });

  test('a fresh saved fix from storage is used at once', async ({ page }) => {
    await countGeolocation(page);
    await seed(page, { lat: 28.1, lng: 77.1, accuracy: null, time: Date.now() - HOUR });
    await page.goto('/');
    await hydrated(page);
    const form = heroForm(page);
    await expect(form.getByRole('button', { name: 'Forget saved location' })).toBeVisible();
    await form.getByRole('button', { name: 'Near me' }).click();
    await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
    expect(new URL(page.url()).searchParams.get('lat')).toBe('28.10000');
    expect(await asked(page)).toBe(0);
  });

  test('a garbage value in storage is ignored', async ({ page }) => {
    const w = watch(page);
    await page.addInitScript((k) => localStorage.setItem(k, '{"state":{"fix":{"lat":"x","lng":999,"time":1}},"version":1}'), KEY);
    await page.goto('/');
    await hydrated(page);
    await expect(heroForm(page).getByRole('button', { name: 'Forget saved location' })).toHaveCount(0);
    await w.check();
  });

  test('denied: a status explains, Close hides it, Search then uses central Gurugram', async ({ page }) => {
    const w = watch(page);
    await page.goto('/');
    await hydrated(page);
    await failWith(page, 1);
    const form = heroForm(page);
    await form.getByRole('button', { name: 'Near me' }).click();
    const note = form.getByRole('status');
    await expect(note).toContainText('Location is off for this site');
    await expect(note).toContainText('central Gurugram');
    await expect(note).toContainText('approximate');
    await axe(page);

    await note.getByRole('button', { name: 'Close this notice' }).click();
    await expect(form.getByRole('status')).toHaveCount(0);

    // Asking again brings it back, and Search uses the fallback centre.
    await form.getByRole('button', { name: 'Near me' }).click();
    await expect(form.getByRole('status')).toContainText('central Gurugram');
    await form.getByRole('button', { name: 'Search' }).click();
    await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
    const q = new URL(page.url()).searchParams;
    expect(q.get('lat')).toBe('28.45950');
    expect(q.get('lng')).toBe('77.02660');
    expect(q.get('place')).toBe('Central Gurugram (approximate)');
    // Nothing was saved for a failed request.
    expect(await page.evaluate((k) => (JSON.parse(localStorage.getItem(k) ?? '{"state":{"fix":null}}') as { state: { fix: unknown } }).state.fix, KEY)).toBeNull();
    await w.check();
  });

  test('timeout and no support give their own wording; typing a place replaces the fallback', async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    const form = heroForm(page);
    await failWith(page, 3);
    await form.getByRole('button', { name: 'Near me' }).click();
    await expect(form.getByRole('status')).toContainText('could not find your location in time');
    await page.evaluate(() => Object.defineProperty(navigator, 'geolocation', { value: undefined, configurable: true }));
    await form.getByRole('button', { name: 'Near me' }).click();
    await expect(form.getByRole('status')).toContainText('cannot share a location');

    await form.getByRole('combobox').or(form.getByRole('textbox')).first().fill('Sector 85');
    await form.getByRole('button', { name: 'Search' }).click();
    await page.waitForURL(/\/properties\?/, { waitUntil: 'commit' });
    const q = new URL(page.url()).searchParams;
    expect(q.get('q')).toBe('Sector 85');
    expect(q.get('lat')).toBeNull();
  });

  test('Hindi: the notice and the forget control are in Hindi', async ({ page }) => {
    const w = watch(page);
    await page.goto('/hi');
    await hydrated(page);
    await failWith(page, 1);
    const form = heroForm(page, 'घर खोजें');
    await form.getByRole('button', { name: 'मेरे पास' }).click();
    await expect(form.getByRole('status')).toContainText('इस साइट के लिए लोकेशन बंद है');
    await expect(form.getByRole('button', { name: 'यह सूचना बंद करें' })).toBeVisible();
    await axe(page);

    await seedAfterLoad(page);
    await w.check();
  });

  test('map view without Google Maps: a denied "Near me" moves the search to central Gurugram and shows the notice', async ({ page }) => {
    const w = watch(page);
    await page.route(/maps\.googleapis\.com/, (route) => route.abort('connectionfailed'));
    await page.goto('/map-location');
    await hydrated(page);
    await expect(page.getByRole('region', { name: 'Paper map of the homes' })).toBeVisible({ timeout: 15_000 });
    await failWith(page, 1);
    await page.getByRole('button', { name: 'Near me' }).last().click();
    const note = page.locator('.results-map').getByRole('status').filter({ hasText: 'central Gurugram' });
    await expect(note).toBeVisible();
    // The fallback centre drives the search: URL, filter chip and label agree, and none says "Near me".
    await expect(page).toHaveURL(/lat=28\.4595&lng=77\.0266/);
    expect(new URL(page.url()).searchParams.get('place')).toBe('Central Gurugram (approximate)');
    expect(new URL(page.url()).searchParams.get('sort_by')).toBe('distance');
    await expect(page.getByText('Central Gurugram (approximate)').first()).toBeVisible();
    await expect(page.getByText('Near me · ')).toHaveCount(0);
    // The new search dims the results (.is-stale, opacity 0.6) until it answers; axe must not read colours through that.
    await expect(page.locator('.results-body.is-stale')).toHaveCount(0, { timeout: 15_000 });
    await page.evaluate(() => Promise.all(document.getAnimations().map((a) => a.finished.catch(() => null))));
    await axe(page);
    await note.getByRole('button', { name: 'Close this notice' }).click();
    await expect(note).toHaveCount(0);
    await w.check();
  });
});

/** Sets a saved fix on the open page (Hindi test: the forget control uses Hindi text). */
async function seedAfterLoad(page: Page) {
  await page.evaluate(([k, v]) => localStorage.setItem(k!, v!), [KEY, JSON.stringify({ state: { fix: { lat: 28.4, lng: 77, accuracy: null, time: Date.now() } }, version: 1 })]);
  await page.reload();
  await hydrated(page);
  await expect(heroForm(page, 'घर खोजें').getByRole('button', { name: 'सेव की गई लोकेशन हटाएँ' })).toBeVisible();
}

/* -------------------------- E2: offline notice and page -------------------------- */

test.describe('offline', () => {
  test('/offline.html is self-contained, bilingual and passes axe', async ({ page, request }) => {
    const w = watch(page);
    const res = await request.get('/offline.html');
    expect(res.status()).toBe(200);
    const html = await res.text();
    expect(html).toContain('You are offline');
    expect(html).toContain('आप ऑफ़लाइन हैं');
    // Nothing to fetch: no linked styles, scripts, images, fonts or absolute URLs.
    expect(html).not.toMatch(/<link\b|<img\b|<script[^>]+src=|url\(|https?:\/\//);
    const requested: string[] = [];
    page.on('request', (r) => requested.push(r.url()));
    await page.goto('/offline.html');
    await expect(page.getByRole('heading', { level: 1, name: 'You are offline' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'आप ऑफ़लाइन हैं' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Try again' })).toBeVisible();
    await axe(page);
    expect(requested.filter((u) => !u.endsWith('/offline.html'))).toEqual([]);
    await w.check();
  });

  test('the notice shows only while offline, does not move the page, and is announced', async ({ page, context }) => {
    const w = watch(page);
    await page.goto('/');
    await hydrated(page);
    const note = page.locator('[data-offline-note]');
    await expect(note).toBeHidden();
    const before = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, top: document.querySelector('header')!.getBoundingClientRect().top }));

    await context.setOffline(true);
    await expect(note).toBeVisible();
    await expect(note).toContainText('You are offline. Some features may be unavailable.');
    await expect(page.locator('[data-offline-live]')).toHaveText('You are offline. Some features may be unavailable.');
    expect(await page.getByRole('status').filter({ hasText: 'You are offline' }).count()).toBe(1);
    const after = await page.evaluate(() => ({ h: document.documentElement.scrollHeight, top: document.querySelector('header')!.getBoundingClientRect().top }));
    expect(after).toEqual(before);
    // Clicks pass through it, and it stays inside the screen.
    expect(await note.evaluate((e) => getComputedStyle(e).pointerEvents)).toBe('none');
    const box = (await note.boundingBox())!;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize()!.width);
    await axe(page);

    await context.setOffline(false);
    await expect(note).toBeHidden();
    await expect(page.locator('[data-offline-live]')).toHaveText('');
    await w.check();
  });

  test('Hindi pages show the Hindi text', async ({ page }) => {
    await page.goto('/hi');
    await page.evaluate(() => window.dispatchEvent(new Event('offline')));
    await expect(page.locator('[data-offline-note]')).toContainText('आप ऑफ़लाइन हैं');
  });

  test('a page that loads offline shows the notice at once', async ({ page, context }) => {
    await page.goto('/about-us');
    await hydrated(page);
    await context.setOffline(true);
    await page.evaluate(() => window.dispatchEvent(new Event('offline'))); // some builds do not fire the event for setOffline
    await expect(page.locator('[data-offline-note]')).toBeVisible();
    await context.setOffline(false);
    await page.evaluate(() => window.dispatchEvent(new Event('online')));
    await expect(page.locator('[data-offline-note]')).toBeHidden();
  });
});

/* ------------------------------ E2: service worker ------------------------------ */

const SW_E2E = Boolean(process.env.SW_E2E);
const OFFLINE_CACHE = '360ghar-offline-v1';

const cacheContents = (page: Page) =>
  page.evaluate(async () => {
    const out: Record<string, string[]> = {};
    for (const name of await caches.keys()) out[name] = (await (await caches.open(name)).keys()).map((r) => new URL(r.url).pathname);
    return out;
  });
const registrations = (page: Page) => page.evaluate(async () => (await navigator.serviceWorker.getRegistrations()).length);

test.describe('service worker (development server)', () => {
  test.skip(SW_E2E, 'Production build only: see the other group');
  test('the dev server registers no worker', async ({ page }) => {
    await page.goto('/');
    await hydrated(page);
    await page.waitForTimeout(1500);
    expect(await registrations(page)).toBe(0);
  });
});

test.describe('service worker (production build, SW_E2E=1)', () => {
  test.skip(!SW_E2E, 'Set SW_E2E=1 and BASE_URL to a production build');

  test('registers after load; caches only the offline page; controls the tab', async ({ page }) => {
    const w = watch(page);
    await page.goto('/');
    await hydrated(page);
    const script = await page.evaluate(async () => (await navigator.serviceWorker.ready).active?.scriptURL);
    expect(script).toMatch(/\/sw\.js$/);
    await page.reload();
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    expect(await cacheContents(page)).toEqual({ [OFFLINE_CACHE]: ['/offline.html'] });
    await w.check();
  });

  test('offline: a page navigation shows the offline page; back online it loads again', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await context.setOffline(true);
    await page.goto('/properties');
    await expect(page.getByRole('heading', { level: 1, name: 'You are offline' })).toBeVisible();
    await axe(page);
    await context.setOffline(false);
    await page.reload();
    await expect(page.getByRole('heading', { level: 1 })).not.toHaveText('You are offline');
  });

  test('it never stores pages or API answers, and offline API calls fail instead of returning old data', async ({ page, context }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.reload();
    await page.goto('/properties');
    await hydrated(page);
    await page.evaluate(() => fetch('/api/v1/amenities').catch(() => null));
    expect(await cacheContents(page)).toEqual({ [OFFLINE_CACHE]: ['/offline.html'] });
    await context.setOffline(true);
    const result = await page.evaluate(() => fetch('/api/v1/amenities').then(() => 'answered', () => 'failed'));
    expect(result).toBe('failed');
  });

  test('migration: an old-style worker and its caches are replaced, and open tabs reload once', async ({ page }) => {
    const OLD = `
      self.addEventListener('install', () => self.skipWaiting());
      self.addEventListener('activate', (e) => e.waitUntil(clients.claim()));
      self.addEventListener('fetch', (e) => { if (e.request.mode === 'navigate') e.respondWith(caches.match('/index.html').then((r) => r || fetch(e.request))); });`;
    const oldWorker = (route: import('@playwright/test').Route) => route.fulfill({ contentType: 'text/javascript', body: OLD });
    await page.route('**/sw.js', oldWorker);
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.evaluate(async () => {
      for (const name of ['workbox-precache-v2-https://360ghar.com/', 'api-cache', 'image-cache', 'font-cache']) await (await caches.open(name)).put('/index.html', new Response('OLD SITE'));
    });
    expect((await cacheContents(page))['api-cache']).toEqual(['/index.html']);

    // Ship the real worker: the old one updates to it.
    await page.unroute('**/sw.js', oldWorker);
    const reloaded = page.waitForEvent('load', { timeout: 30_000 });
    await page.evaluate(async () => void (await navigator.serviceWorker.getRegistration())?.update());
    await reloaded; // legacy caches found: open tabs reload once
    await expect.poll(async () => Object.keys(await cacheContents(page)), { timeout: 30_000 }).toEqual([OFFLINE_CACHE]);
    expect(await page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.locator('body')).not.toContainText('OLD SITE');
  });

  test('kill switch: with KILL_SWITCH true the worker deletes every cache and unregisters', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => navigator.serviceWorker.ready);
    expect(Object.keys(await cacheContents(page))).toEqual([OFFLINE_CACHE]);
    await page.route('**/sw.js', async (route) => {
      const real = await (await route.fetch()).text();
      expect(real).toContain('const KILL_SWITCH = false;');
      await route.fulfill({ contentType: 'text/javascript', body: real.replace('const KILL_SWITCH = false;', 'const KILL_SWITCH = true;') });
    });
    await page.evaluate(async () => void (await navigator.serviceWorker.getRegistration())?.update());
    await expect.poll(() => registrations(page), { timeout: 30_000 }).toBe(0);
    expect(await cacheContents(page)).toEqual({});
  });
});

/* ------------------------------ E3: haptics ------------------------------ */

test.describe('haptics', () => {
  /** A vibrate that records its calls; the reduced-motion test flips the media query. */
  async function recordVibrate(page: Page) {
    await page.addInitScript(() => {
      const calls: unknown[] = [];
      (window as unknown as { __vibrate: unknown[] }).__vibrate = calls;
      Object.defineProperty(navigator, 'vibrate', {
        value: (p: unknown) => {
          calls.push(p);
          return true;
        },
        configurable: true,
      });
    });
  }
  const vibrations = (page: Page) => page.evaluate(() => (window as unknown as { __vibrate: unknown[] }).__vibrate);

  test('saving a home buzzes once; the same tap with reduced motion is silent', async ({ page }) => {
    const w = watch(page);
    await recordVibrate(page);
    await signedIn(page);
    await page.route(/\/api\/v1\/swipes/, (route) => (route.request().method() === 'POST' ? route.fulfill({ status: 201, json: { id: 1, property_id: 182, is_liked: true } }) : route.fulfill({ json: { items: [], next_cursor: null, has_more: false, limit: 100, total: 0 } })));
    await page.goto('/property/182');
    await hydrated(page);
    const save = page.getByRole('button', { name: 'Save to shortlist' }).first();
    await save.click();
    await expect(save).toHaveAttribute('aria-pressed', 'true');
    // The buzz comes after the save request answers, a moment after the heart turns.
    await expect.poll(() => vibrations(page)).toEqual([[20]]);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await save.click(); // unsave
    await expect(save).toHaveAttribute('aria-pressed', 'false');
    // Wait for the request to finish (the toast follows the point where a buzz would have fired), then check for silence.
    await expect(page.getByText('Removed from your shortlist')).toBeVisible();
    expect(await vibrations(page)).toEqual([[20]]);
    await w.check();
  });

  test('a callback request buzzes on success only', async ({ page }) => {
    const w = watch(page);
    await recordVibrate(page);
    let fail = true;
    await page.route(/\/api\/v1\/leads$/, (route) => (fail ? route.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'no' } } }) : route.fulfill({ status: 201, json: { id: 1 } })));
    await page.goto('/property/182');
    await hydrated(page);
    await page.locator('#prop-book').scrollIntoViewIfNeeded();
    await page.waitForFunction(() => [...document.querySelectorAll('#prop-book astro-island')].every((i) => !i.hasAttribute('ssr')));
    await page.locator('#prop-book').getByRole('button', { name: 'Request a callback' }).click();
    const cb = page.getByRole('dialog', { name: 'Request a callback' });
    await cb.getByLabel('Your mobile number').fill('9876543210');
    await cb.getByRole('button', { name: 'Send request' }).click();
    await expect(cb.getByRole('alert').or(cb.locator('.field-error')).first()).toBeVisible();
    expect(await vibrations(page)).toEqual([]);
    fail = false;
    await cb.getByRole('button', { name: 'Send request' }).click();
    await expect(cb.getByRole('status')).toContainText('Thanks, we have your request.');
    expect(await vibrations(page)).toEqual([[50, 100, 50]]);
    await w.check();
  });
});

/* ------------------------------ E3: assigned agent ------------------------------ */

test.describe('assigned agent (account, profile tab)', () => {
  const profile = (extra: Record<string, unknown> = {}) => ({ id: 1, email: 'tester@example.com', full_name: 'Test User', date_of_birth: '1990-01-01', phone: '+919876543210', is_active: true, ...extra });
  const agent = { id: 5, name: 'Meera Kapoor', contact_number: '+919811122233', languages: ['english', 'hindi'], avatar_url: null, agent_type: 'general', experience_level: 'senior', is_active: true, is_available: true, total_users_assigned: 12, user_satisfaction_rating: 4.6, created_at: '2026-01-01T00:00:00Z' };

  test('shows the manager with a call link when the profile has an agent', async ({ page }) => {
    const w = watch(page);
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile({ agent_id: 5 }) }));
    await page.route(/\/api\/v1\/agents\/assigned/, (r) => r.fulfill({ json: agent }));
    await page.goto('/account?tab=profile');
    await hydrated(page);
    const card = page.getByRole('region', { name: 'Your relationship manager' });
    await expect(card).toContainText('Meera Kapoor');
    await expect(card).toContainText('Speaks English, Hindi');
    await expect(card.getByRole('link', { name: /Call \+919811122233/ })).toHaveAttribute('href', 'tel:+919811122233');
    await axe(page);
    await w.check();
  });

  test('Hindi labels', async ({ page }) => {
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile({ agent_id: 5 }) }));
    await page.route(/\/api\/v1\/agents\/assigned/, (r) => r.fulfill({ json: agent }));
    await page.goto('/hi/account?tab=profile');
    await hydrated(page);
    const card = page.getByRole('region', { name: 'आपके रिलेशनशिप मैनेजर' });
    await expect(card).toContainText('Meera Kapoor');
    await expect(card).toContainText('भाषाएँ: English, Hindi');
  });

  test('if the details do not load, the card says so', async ({ page }) => {
    const w = watch(page);
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile({ agent_id: 5 }) }));
    await page.route(/\/api\/v1\/agents\/assigned/, (r) => r.fulfill({ status: 500, json: { error: { code: 'INTERNAL_ERROR', message: 'down' } } }));
    await page.goto('/account?tab=profile');
    await hydrated(page);
    const card = page.getByRole('region', { name: 'Your relationship manager' });
    await expect(card).toContainText('We could not load your relationship manager.');
    await axe(page);
    await w.check();
  });

  test('a 404 means none is assigned yet (the read never assigns one)', async ({ page }) => {
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile({ agent_id: 5 }) }));
    await page.route(/\/api\/v1\/agents\/assigned/, (r) => r.fulfill({ status: 404, json: { error: { code: 'AGENT_NOT_FOUND', message: 'No agent assigned' } } }));
    await page.goto('/account?tab=profile');
    await hydrated(page);
    await expect(page.getByRole('region', { name: 'Your relationship manager' })).toContainText('No relationship manager is assigned to you yet.');
  });

  test('no card, and no request, when the profile has no agent', async ({ page }) => {
    let asked = 0;
    await signedIn(page);
    await page.route(/\/api\/v1\/users\/profile/, (r) => r.fulfill({ json: profile() }));
    await page.route(/\/api\/v1\/agents\/assigned/, (r) => {
      asked++;
      return r.fulfill({ json: agent });
    });
    await page.goto('/account?tab=profile');
    await hydrated(page);
    await expect(page.getByRole('heading', { name: 'Your details' })).toBeVisible();
    await expect(page.getByRole('region', { name: 'Your relationship manager' })).toHaveCount(0);
    expect(asked).toBe(0);
  });
});
