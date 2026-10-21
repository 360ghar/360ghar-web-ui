/*
 * 360Ghar service worker. Conservative on purpose.
 *
 * History: the old site (a Vite PWA) installed a Workbox worker at this URL. It
 * cached HTML, JS and API responses. Real visitors still have it. Any change
 * here is an update to those visitors, so this file does four things only:
 *
 *   1. On activate it deletes EVERY cache that is not this worker's own
 *      (old Workbox precache, `api-cache`, `image-cache`, `font-cache`, and
 *      older versions of this worker's cache).
 *   2. If it found old-site caches, it reloads open tabs once, so a tab that
 *      still shows the old site loads the new one. It reloads for no other
 *      reason.
 *   3. When a page navigation fails because the device is offline, it answers
 *      with /offline.html.
 *   4. It does nothing else. It never stores HTML, API responses (/api,
 *      /dev-api), signed-in pages or any asset. A page that loads is passed
 *      through untouched. Hashed /_astro/* files are not cached here: Netlify
 *      already serves them with `immutable`, so the HTTP cache does that job.
 *
 * skipWaiting and clients.claim: used, because this worker holds no pages or
 * API data, so no open page can end up talking to a cache from another
 * version. Without them, a visitor with the old worker would keep the old
 * site in a tab until every tab closed. The old worker used autoUpdate, so
 * these visitors already expect an instant switch.
 *
 * KILL SWITCH: set KILL_SWITCH to true and deploy. On the next visit each
 * browser (netlify.toml sends /sw.js with no-cache) installs this file, which
 * then deletes all caches and unregisters itself. Also set
 * ENABLE_SW to false in src/features/pwa/register.ts, or new page loads will
 * register it again.
 *
 * VERSION: raise it when /offline.html changes, so the new copy is cached.
 *
 * The pure helpers are exported (Node only) for src/features/pwa/sw.test.ts.
 * In a browser `module` does not exist and nothing is exported.
 */
const KILL_SWITCH = false;
const VERSION = 1;

const CACHE_PREFIX = '360ghar-offline-';
const OFFLINE_CACHE = CACHE_PREFIX + 'v' + VERSION;
const OFFLINE_URL = '/offline.html';

/** Last resort when /offline.html could not be cached (a failed install). */
const FALLBACK_HTML =
  '<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">' +
  '<title>Offline</title><body style="font:18px/1.5 system-ui;margin:2rem;color:#0f1d19">' +
  '<h1>You are offline</h1><p>Check your connection and try again.</p>' +
  '<h2 lang="hi">आप ऑफ़लाइन हैं</h2><p lang="hi">अपना कनेक्शन जाँचें और फिर कोशिश करें।</p>';

/** Caches to delete: everything except this worker's current cache (all of them when killed). */
function staleCacheNames(names, kill) {
  return names.filter(function (n) {
    return kill || n !== OFFLINE_CACHE;
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

/** Only HTML-like paths get the offline page: not /api, /dev-api, or files such as /rss.xml. */
function isOfflineEligible(pathname) {
  if (/^\/(api|dev-api)(\/|$)/.test(pathname)) return false;
  var last = pathname.split('/').pop() || '';
  return last.indexOf('.') === -1 || /\.html$/.test(last);
}

/** The whole fetch decision in one place: true means "answer with the offline page if the network fails". */
function shouldGuard(request, kill) {
  if (kill || !isPageNavigation(request)) return false;
  return isOfflineEligible(new URL(request.url).pathname);
}

if (typeof module !== 'undefined') {
  module.exports = { KILL_SWITCH: KILL_SWITCH, VERSION: VERSION, OFFLINE_CACHE: OFFLINE_CACHE, staleCacheNames: staleCacheNames, legacyCacheNames: legacyCacheNames, isPageNavigation: isPageNavigation, isOfflineEligible: isOfflineEligible, shouldGuard: shouldGuard };
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
  if (!shouldGuard(request, KILL_SWITCH)) return; // Not ours: the browser handles it as if no worker existed.
  event.respondWith(
    fetch(request).catch(async function () {
      const cache = await caches.open(OFFLINE_CACHE);
      return (await cache.match(OFFLINE_URL)) || new Response(FALLBACK_HTML, { status: 503, headers: { 'content-type': 'text/html; charset=utf-8' } });
    }),
  );
});
