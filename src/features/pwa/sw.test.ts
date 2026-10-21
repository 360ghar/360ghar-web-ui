import { readFileSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { describe, expect, it, vi } from 'vitest';

/**
 * /sw.js is a classic script that cannot import anything, so it is loaded the
 * way a browser would run it, in a vm with fake worker globals. `module` is
 * only there so the file's pure helpers come out.
 */
const source = readFileSync(new URL('../../../public/sw.js', import.meta.url), 'utf8');

type Listener = (event: Record<string, unknown>) => void;
type Sw = {
  KILL_SWITCH: boolean;
  OFFLINE_CACHE: string;
  staleCacheNames: (names: string[], kill: boolean) => string[];
  legacyCacheNames: (names: string[]) => string[];
  isPageNavigation: (r: Req) => boolean;
  isOfflineEligible: (p: string) => boolean;
  shouldGuard: (r: Req, kill: boolean) => boolean;
};
type Req = { method: string; mode: string; destination: string; url: string };

function load(prefix = source) {
  const listeners: Record<string, Listener> = {};
  const deleted: string[] = [];
  const store: Record<string, Map<string, unknown>> = {};
  const navigated: string[] = [];
  const state = { claimed: false, skipped: false, unregistered: false, names: [] as string[], fetchFails: false };
  const self = {
    addEventListener: (type: string, fn: Listener) => void (listeners[type] = fn),
    skipWaiting: async () => void (state.skipped = true),
    clients: {
      claim: async () => void (state.claimed = true),
      matchAll: async () => [{ url: 'https://360ghar.com/a', navigate: async (u: string) => void navigated.push(u) }],
    },
    registration: { unregister: async () => void (state.unregistered = true) },
  };
  const caches = {
    keys: async () => state.names,
    delete: async (n: string) => void deleted.push(n),
    open: async (n: string) => {
      const m = (store[n] ??= new Map());
      return { add: async (r: { url: string }) => void m.set(new URL(r.url, 'https://360ghar.com').pathname, 'OFFLINE PAGE'), match: async (u: string) => m.get(u) };
    },
  };
  class FakeResponse {
    constructor(
      public body: string,
      public init: { status?: number },
    ) {}
  }
  const network = vi.fn(async () => {
    if (state.fetchFails) throw new TypeError('Failed to fetch');
    return 'NETWORK';
  });
  const module = { exports: {} as Sw };
  runInNewContext(prefix, { self, caches, module, URL, Request: class { constructor(public url: string) {} }, Response: FakeResponse, fetch: network });
  return { listeners, deleted, store, navigated, state, network, sw: module.exports };
}

const nav = (url: string, over: Partial<Req> = {}): Req => ({ method: 'GET', mode: 'navigate', destination: 'document', url, ...over });
const runWait = async (l: Listener) => {
  let p: Promise<unknown> = Promise.resolve();
  l({ waitUntil: (x: Promise<unknown>) => void (p = x) });
  await p;
};
const runFetch = async (l: Listener, request: Req) => {
  let responded: Promise<unknown> | null = null;
  l({ request, respondWith: (p: Promise<unknown>) => void (responded = p) });
  return responded ? await (responded as Promise<unknown>) : undefined;
};

describe('sw.js helpers', () => {
  const { sw } = load();

  it('ships with the kill switch off', () => {
    expect(sw.KILL_SWITCH).toBe(false);
  });

  it('deletes every cache but its own (old Workbox, api, image, font, older versions)', () => {
    const names = ['workbox-precache-v2-https://360ghar.com/', 'api-cache', 'image-cache', 'font-cache', '360ghar-offline-v0', sw.OFFLINE_CACHE];
    expect(sw.staleCacheNames(names, false)).toEqual(names.slice(0, 5));
    expect(sw.staleCacheNames(names, true)).toEqual(names);
  });

  it('calls only the old site\'s caches legacy', () => {
    expect(sw.legacyCacheNames(['api-cache', '360ghar-offline-v0', 'workbox-runtime'])).toEqual(['api-cache', 'workbox-runtime']);
  });

  it('guards only top-level GET page navigations', () => {
    expect(sw.isPageNavigation(nav('https://360ghar.com/'))).toBe(true);
    expect(sw.isPageNavigation(nav('https://360ghar.com/', { method: 'POST' }))).toBe(false);
    expect(sw.isPageNavigation(nav('https://360ghar.com/', { mode: 'cors', destination: '' }))).toBe(false);
    expect(sw.isPageNavigation(nav('https://360ghar.com/', { destination: 'iframe' }))).toBe(false);
  });

  it('never guards API paths or files', () => {
    expect(sw.isOfflineEligible('/')).toBe(true);
    expect(sw.isOfflineEligible('/properties')).toBe(true);
    expect(sw.isOfflineEligible('/hi/property/182')).toBe(true);
    expect(sw.isOfflineEligible('/about-us.html')).toBe(true);
    expect(sw.isOfflineEligible('/api/v1/properties')).toBe(false);
    expect(sw.isOfflineEligible('/dev-api/api/v1/users/profile')).toBe(false);
    expect(sw.isOfflineEligible('/api')).toBe(false);
    expect(sw.isOfflineEligible('/_astro/index.abc123.js')).toBe(false);
    expect(sw.isOfflineEligible('/rss.xml')).toBe(false);
    expect(sw.isOfflineEligible('/apiary')).toBe(true); // only the /api prefix as a whole segment
  });

  it('turns everything off when killed', () => {
    expect(sw.shouldGuard(nav('https://360ghar.com/'), false)).toBe(true);
    expect(sw.shouldGuard(nav('https://360ghar.com/'), true)).toBe(false);
    expect(sw.shouldGuard(nav('https://360ghar.com/api/v1/x'), false)).toBe(false);
  });
});

describe('sw.js events', () => {
  it('install caches the offline page and takes over at once', async () => {
    const w = load();
    await runWait(w.listeners.install!);
    expect(w.store[w.sw.OFFLINE_CACHE]?.get('/offline.html')).toBe('OFFLINE PAGE');
    expect(w.state.skipped).toBe(true);
  });

  it('activate removes the old site\'s caches, claims, and reloads tabs once', async () => {
    const w = load();
    w.state.names = ['workbox-precache-v2-x', 'api-cache', w.sw.OFFLINE_CACHE];
    await runWait(w.listeners.activate!);
    expect(w.deleted).toEqual(['workbox-precache-v2-x', 'api-cache']);
    expect(w.state.claimed).toBe(true);
    expect(w.navigated).toEqual(['https://360ghar.com/a']);
    expect(w.state.unregistered).toBe(false);
  });

  it('activate does not reload tabs when there are no old-site caches', async () => {
    const w = load();
    w.state.names = ['360ghar-offline-v0', w.sw.OFFLINE_CACHE];
    await runWait(w.listeners.activate!);
    expect(w.deleted).toEqual(['360ghar-offline-v0']);
    expect(w.navigated).toEqual([]);
  });

  it('with the kill switch on, activate deletes all caches and unregisters; it reloads tabs only for old-site caches', async () => {
    const w = load(source.replace('const KILL_SWITCH = false;', 'const KILL_SWITCH = true;'));
    w.state.names = ['api-cache', w.sw.OFFLINE_CACHE];
    await runWait(w.listeners.install!);
    expect(w.store[w.sw.OFFLINE_CACHE]).toBeUndefined(); // no offline page cached
    await runWait(w.listeners.activate!);
    expect(w.deleted).toEqual(['api-cache', w.sw.OFFLINE_CACHE]);
    expect(w.navigated.length).toBe(1); // 'api-cache' is an old-site cache
    expect(w.state.unregistered).toBe(true);
    expect(w.state.claimed).toBe(false);
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/'))).toBeUndefined();
    expect(w.network).not.toHaveBeenCalled();
  });

  it('with the kill switch on and only its own cache, nothing reloads (no loop while pages re-register it)', async () => {
    const w = load(source.replace('const KILL_SWITCH = false;', 'const KILL_SWITCH = true;'));
    w.state.names = [w.sw.OFFLINE_CACHE];
    await runWait(w.listeners.activate!);
    expect(w.deleted).toEqual([w.sw.OFFLINE_CACHE]);
    expect(w.navigated).toEqual([]);
    expect(w.state.unregistered).toBe(true);
  });

  it('fetch passes a page through when the network works', async () => {
    const w = load();
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/properties'))).toBe('NETWORK');
  });

  it('fetch answers a failed navigation with the offline page', async () => {
    const w = load();
    await runWait(w.listeners.install!);
    w.state.fetchFails = true;
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/properties'))).toBe('OFFLINE PAGE');
  });

  it('fetch uses the inline page when the offline page was never cached', async () => {
    const w = load();
    w.state.fetchFails = true;
    const res = (await runFetch(w.listeners.fetch!, nav('https://360ghar.com/'))) as { init: { status: number } };
    expect(res.init.status).toBe(503);
  });

  it('fetch never touches API calls, assets or non-navigations', async () => {
    const w = load();
    w.state.fetchFails = true;
    for (const r of [
      nav('https://api.360ghar.com/api/v1/properties', { mode: 'cors', destination: '' }),
      nav('https://360ghar.com/api/v1/properties'),
      nav('https://360ghar.com/_astro/a.abc.js', { mode: 'no-cors', destination: 'script' }),
      nav('https://360ghar.com/properties', { method: 'POST' }),
    ])
      expect(await runFetch(w.listeners.fetch!, r)).toBeUndefined();
    expect(w.network).not.toHaveBeenCalled();
  });
});
