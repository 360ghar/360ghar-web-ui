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
type Req = { method: string; mode: string; destination: string; url: string };
type Sw = {
  KILL_SWITCH: boolean;
  OFFLINE_CACHE: string;
  RUNTIME_CACHE: string;
  RUNTIME_MAX: number;
  staleCacheNames: (names: string[], kill: boolean) => string[];
  legacyCacheNames: (names: string[]) => string[];
  isPageNavigation: (r: Req) => boolean;
  isPrivatePath: (p: string) => boolean;
  isOfflineEligible: (p: string) => boolean;
  shouldGuard: (r: Req, kill: boolean) => boolean;
  shouldCachePage: (r: Req, kill: boolean) => boolean;
  runtimeCacheFor: (r: Req) => string | null;
  cacheable: (r: unknown) => boolean;
  requestKey: (r: Req) => string;
  cleanSearch: (u: URL) => string;
  isTrackingParam: (k: string) => boolean;
  evictKeys: (keys: string[], max: number) => string[];
};

function load(prefix = source) {
  const listeners: Record<string, Listener> = {};
  const deleted: string[] = [];
  const store: Record<string, Map<string, unknown>> = {};
  const navigated: string[] = [];
  const state = { claimed: false, skipped: false, unregistered: false, names: [] as string[], fetchFails: false, netResponse: null as unknown, storageFails: false };
  const self = {
    location: { origin: 'https://360ghar.com' },
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
    delete: async (n: string) => {
      deleted.push(n);
      delete store[n];
    },
    open: async (n: string) => {
      if (state.storageFails) throw new Error('storage blocked');
      const m = (store[n] ??= new Map());
      return {
        add: async (r: { url: string }) => void m.set(new URL(r.url, 'https://360ghar.com').pathname, 'OFFLINE PAGE'),
        match: async (u: unknown) => m.get(String(u)),
        put: async (k: unknown, v: unknown) => {
          m.delete(String(k));
          m.set(String(k), v);
        },
        keys: async () => [...m.keys()],
        delete: async (k: unknown) => void m.delete(String(k)),
      };
    },
  };
  class FakeResponse {
    status: number;
    type: string;
    constructor(
      public body: string,
      init: { status?: number; type?: string } = {},
    ) {
      this.status = init.status ?? 200;
      this.type = init.type ?? 'basic';
    }
    clone() {
      return new FakeResponse(this.body, { status: this.status, type: this.type });
    }
  }
  const network = vi.fn(async () => {
    if (state.fetchFails) throw new TypeError('Failed to fetch');
    return state.netResponse ?? 'NETWORK';
  });
  const module = { exports: {} as Sw };
  runInNewContext(prefix, { self, caches, module, URL, URLSearchParams, Request: class { constructor(public url: string) {} }, Response: FakeResponse, fetch: network });
  return { listeners, deleted, store, navigated, state, network, sw: module.exports };
}

const nav = (url: string, over: Partial<Req> = {}): Req => ({ method: 'GET', mode: 'navigate', destination: 'document', url, ...over });
const runWait = async (l: Listener) => {
  let p: Promise<unknown> = Promise.resolve();
  l({ waitUntil: (x: Promise<unknown>) => void (p = x) });
  await p;
};
const runFetch = async (l: Listener, request: Req, waited: Promise<unknown>[] = []) => {
  let responded: Promise<unknown> | null = null;
  l({ request, respondWith: (p: Promise<unknown>) => void (responded = p), waitUntil: (p: Promise<unknown>) => void waited.push(p) });
  return responded ? await (responded as Promise<unknown>) : undefined;
};

describe('sw.js helpers', () => {
  const { sw } = load();

  it('ships with the kill switch off', () => {
    expect(sw.KILL_SWITCH).toBe(false);
  });

  it('deletes every cache but its own (old Workbox, api, image, font, older versions)', () => {
    const names = ['workbox-precache-v2-https://360ghar.com/', 'api-cache', 'image-cache', 'font-cache', '360ghar-offline-v0', sw.OFFLINE_CACHE, sw.RUNTIME_CACHE];
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

  it('calls signed-in and auth screens private, in every locale', () => {
    for (const p of ['/account', '/account/properties', '/login', '/register', '/auth/callback', '/forgot-password', '/reset-password', '/add-phone', '/delete-account', '/profile-completion', '/logout', '/hi/account', '/hi/login', '/hi/register'])
      expect(sw.isPrivatePath(p), p).toBe(true);
    for (const p of ['/', '/properties', '/contact', '/login-tips', '/accounts', '/hi', '/hi/properties'])
      expect(sw.isPrivatePath(p), p).toBe(false);
  });

  it('stores public navigations only: never private pages, API paths or killed workers', () => {
    expect(sw.shouldCachePage(nav('https://360ghar.com/properties'), false)).toBe(true);
    expect(sw.shouldCachePage(nav('https://360ghar.com/hi/property/182?utm_source=x'), false)).toBe(true);
    expect(sw.shouldCachePage(nav('https://360ghar.com/account'), false)).toBe(false);
    expect(sw.shouldCachePage(nav('https://360ghar.com/hi/account'), false)).toBe(false);
    expect(sw.shouldCachePage(nav('https://360ghar.com/api/v1/properties'), false)).toBe(false);
    expect(sw.shouldCachePage(nav('https://360ghar.com/properties'), true)).toBe(false);
    expect(sw.shouldCachePage(nav('https://360ghar.com/_astro/a.js', { mode: 'cors', destination: '' }), false)).toBe(false);
  });

  it('serves hashed assets, fonts and Cloudinary images cache-first', () => {
    expect(sw.runtimeCacheFor(nav('https://360ghar.com/_astro/a.abc.js', { mode: 'cors', destination: 'script' }))).toBe(sw.RUNTIME_CACHE);
    expect(sw.runtimeCacheFor(nav('https://360ghar.com/fonts/sentient-var.woff2', { mode: 'cors', destination: 'font' }))).toBe(sw.RUNTIME_CACHE);
    expect(sw.runtimeCacheFor(nav('https://res.cloudinary.com/demo/image/upload/w_400/pic.jpg', { mode: 'no-cors', destination: 'image' }))).toBe(sw.RUNTIME_CACHE);
    expect(sw.runtimeCacheFor(nav('https://res.cloudinary.com/demo/video/upload/v.mp4', { mode: 'no-cors', destination: 'video' }))).toBe(null);
    expect(sw.runtimeCacheFor(nav('https://evil.example/image/upload/x.jpg', { mode: 'no-cors', destination: 'image' }))).toBe(null);
    expect(sw.runtimeCacheFor(nav('https://360ghar.com/uploads/room.jpg', { mode: 'no-cors', destination: 'image' }))).toBe(null);
    expect(sw.runtimeCacheFor(nav('https://360ghar.com/_astro/a.js', { method: 'POST' }))).toBe(null);
    expect(sw.runtimeCacheFor(nav('https://360ghar.com/properties'))).toBe(null); // navigations take the page path
  });

  it('keeps real 200s and opaque images, nothing else', () => {
    expect(sw.cacheable({ status: 200, type: 'basic' })).toBe(true);
    expect(sw.cacheable({ status: 0, type: 'opaque' })).toBe(true);
    expect(sw.cacheable({ status: 404, type: 'basic' })).toBe(false);
    expect(sw.cacheable({ status: 0, type: 'opaqueredirect' })).toBe(false);
    expect(sw.cacheable(undefined)).toBe(false);
    expect(sw.cacheable('NETWORK')).toBe(false);
  });

  it('never stores an answer marked no-store', () => {
    const noStore = { status: 200, type: 'basic', headers: { get: (n: string) => (n.toLowerCase() === 'cache-control' ? 'private, no-store' : null) } };
    const ok = { status: 200, type: 'basic', headers: { get: (n: string) => (n.toLowerCase() === 'cache-control' ? 'public, max-age=0, must-revalidate' : null) } };
    expect(sw.cacheable(noStore)).toBe(false);
    expect(sw.cacheable(ok)).toBe(true);
    expect(sw.cacheable({ status: 200, type: 'basic', headers: undefined })).toBe(true); // no headers to read: keep it
  });

  it('drops tracking parameters from the cache key, keeps result-defining ones', () => {
    expect(sw.isTrackingParam('utm_source')).toBe(true);
    expect(sw.isTrackingParam('fbclid')).toBe(true);
    expect(sw.isTrackingParam('purpose')).toBe(false);
    expect(sw.cleanSearch(new URL('https://360ghar.com/properties?purpose=rent&bhk=3&utm_source=x&fbclid=y'))).toBe('?purpose=rent&bhk=3');
    expect(sw.cleanSearch(new URL('https://360ghar.com/properties'))).toBe('');
    expect(sw.cleanSearch(new URL('https://360ghar.com/compare?ids=1,2'))).toBe('?ids=1%2C2'); // values stay encoded
    // Encoded delimiters never collapse two server-rendered searches into one key.
    expect(sw.cleanSearch(new URL('https://360ghar.com/properties?q=DLF%26purpose%3Drent'))).toBe('?q=DLF%26purpose%3Drent');
    expect(sw.cleanSearch(new URL('https://360ghar.com/properties?q=DLF&purpose=rent'))).toBe('?q=DLF&purpose=rent');
    expect(sw.requestKey(nav('https://360ghar.com/properties?q=DLF%26purpose%3Drent'))).not.toBe(sw.requestKey(nav('https://360ghar.com/properties?q=DLF&purpose=rent')));
    expect(sw.requestKey(nav('https://360ghar.com/properties?purpose=rent'))).toBe('/properties?purpose=rent');
    expect(sw.requestKey(nav('https://360ghar.com/properties?purpose=rent&utm_source=newsletter'))).toBe('/properties?purpose=rent');
    expect(sw.requestKey(nav('https://360ghar.com/hi/property/182?src=share'))).toBe('/hi/property/182?src=share');
    expect(sw.requestKey(nav('https://360ghar.com/'))).toBe('/');
    expect(sw.requestKey(nav('https://res.cloudinary.com/demo/image/upload/pic.jpg', { mode: 'no-cors', destination: 'image' }))).toBe('https://res.cloudinary.com/demo/image/upload/pic.jpg');
  });

  it('drops the oldest keys beyond the cap', () => {
    expect(sw.evictKeys(['a', 'b'], 3)).toEqual([]);
    expect(sw.evictKeys(['a', 'b', 'c', 'd'], 2)).toEqual(['a', 'b']);
    expect(sw.evictKeys([], 5)).toEqual([]);
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
    w.state.names = ['api-cache', w.sw.OFFLINE_CACHE, w.sw.RUNTIME_CACHE];
    await runWait(w.listeners.install!);
    expect(w.store[w.sw.OFFLINE_CACHE]).toBeUndefined(); // no offline page cached
    await runWait(w.listeners.activate!);
    expect(w.deleted).toEqual(['api-cache', w.sw.OFFLINE_CACHE, w.sw.RUNTIME_CACHE]);
    expect(w.navigated.length).toBe(1); // 'api-cache' is an old-site cache
    expect(w.state.unregistered).toBe(true);
    expect(w.state.claimed).toBe(false);
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/'))).toBeUndefined();
    expect(w.network).not.toHaveBeenCalled();
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/_astro/a.js', { mode: 'cors', destination: 'script' }))).toBeUndefined();
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

  it('fetch saves a public page in the background and answers a failed revisit from the saved copy', async () => {
    const w = load();
    const waited: Promise<unknown>[] = [];
    // The worker's network answer must look like a Response: status 200 with a clone().
    const response = { status: 200, type: 'basic', clone: () => response, headers: undefined };
    w.state.netResponse = response;
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/properties?purpose=rent&utm_source=x'), waited)).toBe(response);
    expect(waited).toHaveLength(1); // the write runs in waitUntil: the answer is not held back
    await Promise.all(waited);
    expect(w.store[w.sw.RUNTIME_CACHE]?.get('/properties?purpose=rent')).toBe(response); // result query kept, tracking dropped
    w.state.fetchFails = true;
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/properties?purpose=rent'))).toBe(response);
  });

  it('a never-seen page still gets the offline fallback', async () => {
    const w = load();
    await runWait(w.listeners.install!);
    w.state.fetchFails = true;
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/never-seen'))).toBe('OFFLINE PAGE');
  });

  it('fetch uses the inline page when the offline page was never cached', async () => {
    const w = load();
    w.state.fetchFails = true;
    const res = (await runFetch(w.listeners.fetch!, nav('https://360ghar.com/'))) as { status: number };
    expect(res.status).toBe(503);
  });

  it('never stores a private page, but still answers it with the offline fallback', async () => {
    const w = load();
    const waited: Promise<unknown>[] = [];
    const response = { status: 200, type: 'basic', clone: () => response, headers: undefined };
    w.state.netResponse = response;
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/hi/account'), waited)).toBe(response);
    await Promise.all(waited);
    expect(w.store[w.sw.RUNTIME_CACHE]?.get('/account')).toBeUndefined();
    expect(w.store[w.sw.RUNTIME_CACHE]?.get('/hi/account')).toBeUndefined();
    w.state.fetchFails = true;
    await runWait(w.listeners.install!);
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/account'))).toBe('OFFLINE PAGE');
  });

  it('does not keep error answers or opaque redirects', async () => {
    const w = load();
    const waited: Promise<unknown>[] = [];
    w.state.netResponse = { status: 404, type: 'basic', clone: () => w.state.netResponse, headers: undefined };
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/missing-page'), waited)).toBe(w.state.netResponse);
    await Promise.all(waited);
    expect(w.store[w.sw.RUNTIME_CACHE]?.size ?? 0).toBe(0);
  });

  it('assets are cache-first: the second ask never touches the network', async () => {
    const w = load();
    const waited: Promise<unknown>[] = [];
    const image = { status: 0, type: 'opaque', clone: () => image, headers: undefined };
    w.state.netResponse = image;
    const asset = nav('https://res.cloudinary.com/demo/image/upload/w_400/pic.jpg', { mode: 'no-cors', destination: 'image' });
    expect(await runFetch(w.listeners.fetch!, asset, waited)).toBe(image);
    expect(w.network).toHaveBeenCalledTimes(1);
    await Promise.all(waited); // the background write lands before the next ask
    w.state.netResponse = { status: 500, type: 'basic', clone: () => w.state.netResponse, headers: undefined };
    expect(await runFetch(w.listeners.fetch!, asset)).toBe(image); // served from the cache
    expect(w.network).toHaveBeenCalledTimes(1);
    expect(w.store[w.sw.RUNTIME_CACHE]?.get('https://res.cloudinary.com/demo/image/upload/w_400/pic.jpg')).toBe(image);
  });

  it('evicts the oldest entries beyond the runtime cap', async () => {
    const w = load(source.replace('const RUNTIME_MAX = 150;', 'const RUNTIME_MAX = 2;'));
    const waited: Promise<unknown>[] = [];
    const html = { status: 200, type: 'basic', clone: () => html, headers: undefined };
    w.state.netResponse = html;
    await runFetch(w.listeners.fetch!, nav('https://360ghar.com/a'), waited);
    await runFetch(w.listeners.fetch!, nav('https://360ghar.com/b'), waited);
    await runFetch(w.listeners.fetch!, nav('https://360ghar.com/c'), waited);
    await Promise.all(waited);
    const cache = w.store[w.sw.RUNTIME_CACHE]!;
    expect(cache.has('/a')).toBe(false);
    expect([...cache.keys()]).toEqual(['/b', '/c']);
  });

  it('survives broken storage: a good page load is never turned into the offline page', async () => {
    const w = load();
    w.state.storageFails = true;
    const response = { status: 200, type: 'basic', clone: () => response };
    w.state.netResponse = response;
    expect(await runFetch(w.listeners.fetch!, nav('https://360ghar.com/properties'))).toBe(response);
    expect(w.network).toHaveBeenCalledTimes(1);
  });

  it('survives broken storage offline: the inline fallback page still answers', async () => {
    const w = load();
    w.state.storageFails = true;
    w.state.fetchFails = true;
    const res = (await runFetch(w.listeners.fetch!, nav('https://360ghar.com/properties'))) as { status: number };
    expect(res.status).toBe(503);
  });

  it('survives broken storage for assets: the network answer passes through', async () => {
    const w = load();
    w.state.storageFails = true;
    const image = { status: 0, type: 'opaque', clone: () => image };
    w.state.netResponse = image;
    const asset = nav('https://360ghar.com/_astro/a.abc.js', { mode: 'cors', destination: 'script' });
    expect(await runFetch(w.listeners.fetch!, asset)).toBe(image);
    expect(w.network).toHaveBeenCalledTimes(1);
    expect(await runFetch(w.listeners.fetch!, asset)).toBe(image); // no cache, so the network again
    expect(w.network).toHaveBeenCalledTimes(2);
  });

  it('fetch never touches API calls, third-party assets or non-navigations', async () => {
    const w = load();
    w.state.fetchFails = true;
    for (const r of [
      nav('https://api.360ghar.com/api/v1/properties', { mode: 'cors', destination: '' }),
      nav('https://360ghar.com/api/v1/properties'),
      nav('https://360ghar.com/dev-api/api/v1/users/profile'),
      nav('https://example.com/x.js', { mode: 'no-cors', destination: 'script' }),
      nav('https://360ghar.com/properties', { method: 'POST' }),
    ])
      expect(await runFetch(w.listeners.fetch!, r)).toBeUndefined();
    expect(w.network).not.toHaveBeenCalled();
  });
});
