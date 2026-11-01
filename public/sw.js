/*
 * 360Ghar service worker. Conservative on purpose.
 *
 * History: the old site (a Vite PWA) installed a Workbox worker at this URL. It
 * cached HTML, JS and API responses. Real visitors still have it. Any change
 * here is an update to those visitors.
 *
 * This worker does five things:
 *
 *   1. On activate it deletes EVERY cache that is not its own (the old
 *      Workbox precache, `api-cache`, `image-cache`, `font-cache`, and
 *      older versions of its own caches).
 *   2. If it found old-site caches, it reloads open tabs once, so a tab that
 *      still shows the old site loads the new one. It reloads for no other
 *      reason.
 *   3. Pages are network-first: the network answer is what the visitor sees,
 *      and it returns at once (the cache write runs in the fetch event's
 *      waitUntil, so streamed HTML is never held back). A public page's HTML
 *      is kept in the runtime cache under its path plus its result-defining
 *      query (only tracking parameters are dropped, because /properties and
 *      /compare render different HTML per query), and when the device is
 *      offline a page the visitor saw before opens from that copy. A page
 *      never seen offline falls back to /offline.html. Signed-in pages
 *      (/account, /login, ... in every supported locale) and answers marked
 *      `no-store` are never stored. API calls (/api, /dev-api) are never
 *      stored and never answered from cache.
 *   4. Same-origin /_astro/* and /fonts/* and Cloudinary /image/upload/* URLs
 *      are cache-first: they are immutable or per-property, so the cache copy
 *      is the answer. Cloudinary images are opaque no-cors responses, stored
 *      as-is. The runtime cache holds at most RUNTIME_MAX entries; the oldest
 *      are dropped first (insertion order). Hashed /_astro/* files were not
 *      cached by the previous version because Netlify serves them immutable:
 *      caching them here is what makes revisited pages render offline.
 *   5. When a page navigation fails offline and nothing is cached, it answers
 *      with /offline.html.
 *
 * skipWaiting and clients.claim: used, because this worker holds no API data,
 * so no open page can end up talking to a cache from another version. Without
 * them, a visitor with the old worker would keep the old site in a tab until
 * every tab closed. The old worker used autoUpdate, so these visitors already
 * expect an instant switch.
 *
 * KILL SWITCH: set KILL_SWITCH to true and deploy. On the next visit each
 * browser (netlify.toml sends /sw.js with no-cache) installs this file, which
 * then deletes all caches and unregisters itself. Also set
 * ENABLE_SW to false in src/features/pwa/register.ts, or new page loads will
 * register it again.
 *
 * VERSION: raise it when /offline.html changes, so the new copy is cached
 * (every own cache name carries it, so a bump also empties the runtime cache).
 *
 * The pure helpers are exported (Node only) for src/features/pwa/sw.test.ts.
 * In a browser `module` does not exist and nothing is exported.
 */
const KILL_SWITCH = false;
const VERSION = 2;

const CACHE_PREFIX = '360ghar-offline-';
const CACHE_ROOT = CACHE_PREFIX + 'v' + VERSION + '-';
const OFFLINE_CACHE = CACHE_ROOT + 'offline';
const RUNTIME_CACHE = CACHE_ROOT + 'runtime';
const OFFLINE_URL = '/offline.html';
const RUNTIME_MAX = 150;

/** Last resort when /offline.html could not be cached (a failed install). */
const FALLBACK_HTML =
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Offline</title><body style="font:18px/1.5 system-ui;margin:2rem;color:#0f1d19">' +
  '<h1>You are offline</h1><p>Check your connection and try again.</p>' +
  '<h2 lang="hi">आप ऑफ़लाइन हैं</h2><p lang="hi">अपना कनेक्शन जाँचें और फिर कोशिश करें।</p>';

/** The caches this worker owns; activate deletes everything else. */
function ownCacheNames() {
  return [OFFLINE_CACHE, RUNTIME_CACHE];
}

/** Caches to delete: everything not ours (all of them when killed). */
function staleCacheNames(names, kill) {
  const own = ownCacheNames();
  return names.filter(function (n) {
    return kill || own.indexOf(n) === -1;
  });
}

/** Caches that did not come from this worker: the old site's. Their presence means old tabs need a reload. */
function legacyCacheNames(names) {
  return names.filter(function (n) {
    return n.indexOf(CACHE_PREFIX) !== 0;
  });
}

/** A top-level page load: a GET navigation that is not inside an iframe, frame, embed or object. */
function isPageNavigation(request) {
  if (request.method !== 'GET' || request.mode !== 'navigate') return false;
  return ['iframe', 'frame', 'embed', 'object'].indexOf(request.destination) === -1;
}

/** Session pages whose HTML must never be stored: signed-in or auth screens, in every supported locale. */
function isPrivatePath(pathname) {
  return /^(account|auth|login|register|logout|forgot-password|reset-password|add-phone|delete-account|profile-completion)(\/|$)/.test(
    pathname.replace(/^\/(?:hi\/)?/, ''),
  );
}

/** Only HTML-like paths get the offline page: not /api, /dev-api, or files such as /rss.xml. */
function isOfflineEligible(pathname) {
  if (/^\/(api|dev-api)(\/|$)/.test(pathname)) return false;
  var last = pathname.split('/').pop() || '';
  return last.indexOf('.') === -1 || /\.html$/.test(last);
}

/** The whole offline-guard decision in one place: true means "answer with the offline page if the network fails". */
function shouldGuard(request, kill) {
  if (kill || !isPageNavigation(request)) return false;
  return isOfflineEligible(new URL(request.url).pathname);
}

/** True for navigations whose HTML may be stored: public pages only. */
function shouldCachePage(request, kill) {
  if (!shouldGuard(request, kill)) return false;
  return !isPrivatePath(new URL(request.url).pathname);
}

/** Which non-navigation GETs are cache-first: hashed build assets, self-hosted fonts, Cloudinary property images. */
function runtimeCacheFor(request) {
  if (request.method !== 'GET' || isPageNavigation(request)) return null;
  var url = new URL(request.url);
  if (url.origin === self.location.origin && (url.pathname.indexOf('/_astro/') === 0 || url.pathname.indexOf('/fonts/') === 0)) return RUNTIME_CACHE;
  if (url.hostname === 'res.cloudinary.com' && url.pathname.indexOf('/image/upload/') !== -1) return RUNTIME_CACHE;
  return null;
}

/** Worth keeping: a real 200 without `no-store`, or an opaque image (no-cors hides its status). */
function cacheable(response) {
  if (!response) return false;
  if (response.status !== 200) return response.type === 'opaque';
  var control = response.headers && typeof response.headers.get === 'function' ? response.headers.get('cache-control') : null;
  return !control || !/no-store/i.test(control);
}

/** Tracking parameters never change what a page renders, so they leave the cache key. */
function isTrackingParam(key) {
  return /^(utm_.+|fbclid|gclid|msclkid|mc_cid|mc_eid|ref)$/i.test(key);
}

/** The search string with tracking parameters removed, serialised so values stay encoded (`?q=a%26b` never collides with `?q=a&b`). */
function cleanSearch(url) {
  var out = new URLSearchParams();
  url.searchParams.forEach(function (value, key) {
    if (!isTrackingParam(key)) out.append(key, value);
  });
  var search = out.toString();
  return search ? '?' + search : '';
}

/**
 * Cache identity. Navigations keep their result-defining query (properties.astro
 * renders /properties?purpose=rent differently from ?purpose=buy), minus
 * tracking parameters; everything else is keyed by its full URL.
 */
function requestKey(request) {
  var url = new URL(request.url);
  if (!isPageNavigation(request)) return url.href;
  return url.pathname + cleanSearch(url);
}

/** Oldest entries to drop so at most `max` remain (cache.keys() is in insertion order). */
function evictKeys(keys, max) {
  return keys.length > max ? keys.slice(0, keys.length - max) : [];
}

/** Store a copy, best effort: broken storage can never fail a request. Clones now, before the browser locks the body. */
function saveToRuntime(key, response) {
  var copy;
  try {
    copy = response.clone();
  } catch (e) {
    return Promise.resolve(); // Body already in use: nothing to store.
  }
  return (async function () {
    try {
      var cache = await caches.open(RUNTIME_CACHE);
      await cache.put(key, copy);
      var keys = await cache.keys();
      var old = evictKeys(keys, RUNTIME_MAX);
      for (var i = 0; i < old.length; i += 1) await cache.delete(old[i]);
    } catch (e) {
      // Storage refused the write (quota full, Vary: *, private mode): keep the network answer.
    }
  })();
}

/** Cache-first for immutable assets and images: the cache copy is the answer. */
async function cacheFirst(request, event) {
  var key = requestKey(request);
  try {
    var cache = await caches.open(RUNTIME_CACHE);
    var hit = await cache.match(key);
    if (hit) return hit;
  } catch (e) {
    return fetch(request); // Storage off: pass the request through.
  }
  var response = await fetch(request);
  if (cacheable(response)) {
    var saved = saveToRuntime(key, response);
    if (event && event.waitUntil) event.waitUntil(saved); // The answer returns at once; the write settles in the background.
  }
  return response;
}

/** Network-first for pages: the network answer returns at once; the copy lands in the cache in the background. */
async function navigationResponse(request, event) {
  var response;
  try {
    response = await fetch(request);
  } catch (e) {
    var saved;
    try {
      var cache = await caches.open(RUNTIME_CACHE);
      saved = shouldCachePage(request, KILL_SWITCH) ? await cache.match(requestKey(request)) : undefined;
    } catch (e2) {
      // Storage off: straight to the fallback.
    }
    return saved || (await offlineFallback());
  }
  if (shouldCachePage(request, KILL_SWITCH) && cacheable(response)) {
    var writing = saveToRuntime(requestKey(request), response);
    if (event && event.waitUntil) event.waitUntil(writing);
  }
  return response;
}

async function offlineFallback() {
  try {
    var cache = await caches.open(OFFLINE_CACHE);
    var saved = await cache.match(OFFLINE_URL);
    if (saved) return saved;
  } catch (e) {
    // Storage off: the inline page.
  }
  return new Response(FALLBACK_HTML, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
}

if (typeof module !== 'undefined') {
  module.exports = {
    KILL_SWITCH: KILL_SWITCH,
    VERSION: VERSION,
    OFFLINE_CACHE: OFFLINE_CACHE,
    RUNTIME_CACHE: RUNTIME_CACHE,
    RUNTIME_MAX: RUNTIME_MAX,
    staleCacheNames: staleCacheNames,
    legacyCacheNames: legacyCacheNames,
    isPageNavigation: isPageNavigation,
    isPrivatePath: isPrivatePath,
    isOfflineEligible: isOfflineEligible,
    shouldGuard: shouldGuard,
    shouldCachePage: shouldCachePage,
    runtimeCacheFor: runtimeCacheFor,
    cacheable: cacheable,
    requestKey: requestKey,
    cleanSearch: cleanSearch,
    isTrackingParam: isTrackingParam,
    evictKeys: evictKeys,
  };
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    (async function () {
      if (!KILL_SWITCH) {
        try {
          const cache = await caches.open(OFFLINE_CACHE);
          await cache.add(new Request(OFFLINE_URL, { cache: 'reload' }));
        } catch (e) {
          // Not fatal: the inline fallback is used, and the old caches still get cleaned.
        }
      }
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    (async function () {
      const names = await caches.keys();
      const legacy = legacyCacheNames(names).length > 0;
      await Promise.all(staleCacheNames(names, KILL_SWITCH).map(function (n) { return caches.delete(n); }));
      if (!KILL_SWITCH) await self.clients.claim();
      // Only old-site tabs need a reload. Reloading for any other reason could loop while the kill switch is on
      // and pages keep registering this file.
      if (legacy) {
        const tabs = await self.clients.matchAll({ type: 'window' });
        for (const tab of tabs) {
          try {
            await tab.navigate(tab.url);
          } catch (e) {
            // The tab closed or is not controlled: nothing to reload.
          }
        }
      }
      if (KILL_SWITCH) await self.registration.unregister();
    })(),
  );
});

self.addEventListener('fetch', function (event) {
  const request = event.request;
  if (KILL_SWITCH) return;
  if (runtimeCacheFor(request)) {
    event.respondWith(cacheFirst(request, event));
    return;
  }
  // Not ours: the browser handles it as if no worker existed.
  if (!shouldGuard(request, false)) return;
  event.respondWith(navigationResponse(request, event));
});
