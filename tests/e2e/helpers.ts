import { readFileSync } from 'node:fs';
import AxeBuilder from '@axe-core/playwright';
import { expect, type Page } from '@playwright/test';

/** Fails on page errors and on horizontal scroll. */
export function watch(page: Page) {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  return {
    errors,
    async check() {
      expect(errors, errors.join('\n')).toEqual([]);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      expect(overflow, 'horizontal scroll').toBeLessThanOrEqual(0);
    },
  };
}

/** WCAG 2.2 AA scan. Colour contrast on images is excluded (photos). */
export async function axe(page: Page) {
  // Scan from the top: at a random scroll position the sticky header covers
  // whatever sits under it, and target-size reports that as a failure.
  const y = await page.evaluate(() => {
    const at = window.scrollY;
    window.scrollTo(0, 0);
    return at;
  });
  const r = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  await page.evaluate((at) => window.scrollTo(0, at), y);
  const serious = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
  const detail = serious.flatMap((v) => v.nodes.slice(0, 3).map((n) => `${v.id}: ${n.target.join(' ')}\n    ${n.html.slice(0, 160)}\n    ${(n.failureSummary ?? '').replace(/\s+/g, ' ').slice(0, 240)}`));
  expect(serious.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).slice(0, 3).join(' | ')}`), detail.join('\n')).toEqual([]);
}

/** Simulates the backend being down: every API call fails at the network layer. */
export async function backendDown(page: Page) {
  await page.route(/\/api\/v1\//, (route) => route.abort('connectionfailed'));
  await page.route(/api\.360ghar\.com/, (route) => route.abort('connectionfailed'));
}

/**
 * Waits until the islands that hydrate without scrolling are ready (Astro
 * removes the `ssr` attribute). `client:visible` islands below the fold wait
 * for the scroll, so they are left out.
 */
export async function hydrated(page: Page) {
  await page.waitForFunction(
    () =>
      [...document.querySelectorAll('astro-island')]
        // astro-island is display: contents, so measure its first child.
        .filter((i) => i.getAttribute('client') !== 'visible' || (i.firstElementChild ?? i).getBoundingClientRect().top < innerHeight)
        .every((i) => !i.hasAttribute('ssr')),
    null,
    { timeout: 30_000 },
  );
}

/**
 * Seeds a fake Supabase session and mocks the profile calls, so pages see a
 * signed-in user without a real account. Supabase auth calls are blocked.
 */
export async function signedIn(page: Page) {
  // Local runs read .env; CI has no .env file and sets the variable instead.
  let env = '';
  try {
    env = readFileSync(new URL('../../.env', import.meta.url), 'utf8');
  } catch {
    env = `PUBLIC_SUPABASE_URL=${process.env.PUBLIC_SUPABASE_URL ?? ''}`;
  }
  const ref = /PUBLIC_SUPABASE_URL=https:\/\/([^.]+)\./.exec(env)?.[1] ?? 'test';
  const user = { id: '00000000-0000-4000-8000-000000000001', email: 'tester@example.com', user_metadata: { full_name: 'Test User' } };
  const session = { access_token: 'test-token', refresh_token: 'test-refresh', token_type: 'bearer', expires_in: 3600, expires_at: 4102444800, user };
  await page.addInitScript(([k, v]) => localStorage.setItem(k!, v!), [`sb-${ref}-auth-token`, JSON.stringify(session)]);
  await page.route(/supabase\.co\/auth\//, (route) => route.fulfill({ status: 200, json: user }));
  await page.route(/\/api\/v1\/users\/profile/, (route) => route.fulfill({ json: { id: 1, email: user.email, full_name: 'Test User', phone: '+919876543210', is_active: true } }));
  await page.route(/\/api\/v1\/users\/me\/auth-state/, (route) => route.fulfill({ json: { stage: 'active', next_action: 'grant_access', missing_fields: [] } }));
}

const API = process.env.API_ORIGIN ?? 'https://api.360ghar.com';
const probes = new Map<string, Promise<boolean>>();

/**
 * True when the live API answers 200 for `path` and `ok(json)` holds. Tests
 * that need the contract-2026-10 backend (or one specific listing) skip when
 * it does not, so CI does not depend on what production serves today.
 */
export function liveHas(path: string, ok: (json: unknown) => boolean = () => true): Promise<boolean> {
  let p = probes.get(path);
  if (!p) {
    p = fetch(`${API}${path}`)
      .then(async (r) => r.ok && ok(await r.json().catch(() => null)))
      .catch(() => false);
    probes.set(path, p);
  }
  return p;
}

/** The contract backend returns circle-rate sectors as `{ items }`; the old API returned a bare array. */
export const contractReady = () => liveHas('/api/v1/data-hub/circle-rates/sectors', (j) => !Array.isArray(j) && j != null);
