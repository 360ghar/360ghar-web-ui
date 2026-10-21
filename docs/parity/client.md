# Client parity (Agent E): location, offline/PWA, account and API leftovers

Progress file. Updated after each task.

## E1. Location memory and fallback notice: DONE (checks: vitest, eslint, tsc on own files)

- `src/features/location/logic.ts`: pure rules (24 h TTL, Gurugram centre `28.4595, 77.0266`, `parseFix`, `serializeFix`, error-code mapping).
- `src/features/location/store.ts`: Zustand + persist, key `360ghar:location-v2`, saves only `lat, lng, accuracy, time`. `skipHydration`: nothing is read until `useLocationMemory()` runs in an effect (or `locate()` is called), so the first client render equals the server HTML.
- `src/features/location/LocationNotice.tsx`: `LocationNotice` (role="status", dismissible, en/hi, plain words) and `ForgetLocation` (clears the saved fix, says so, keeps focus on the message).
- `HeroSearch.tsx`: "Near me" reuses a fresh saved fix (no prompt). On failure it selects central Gurugram as the place (Search then uses it) and shows the notice.
- `ResultsMap.tsx`: same. On failure the Google map recentres on central Gurugram; the result filters are not changed; the notice shows in the map note slot.
- Privacy: the fix is kept in `localStorage` only. It leaves the browser only as the existing `lat`/`lng` search params.

## E2. Offline notice and conservative service worker: DONE in code and unit tests; browser checks are for QA

Files: `public/sw.js`, `public/offline.html`, `src/features/pwa/{register.ts,OfflineNotice.astro,sw.test.ts,register.test.ts}`, one added import and one added tag in `src/layouts/Base.astro`. `public/registerSW.js` and `manifest.webmanifest` are unchanged (registerSW.js stays empty on purpose: old cached v1 pages that load it must not register anything).

Worker rules (see the header of `public/sw.js`):

1. On activate it deletes every cache except its own `360ghar-offline-v1` (old Workbox precache, `api-cache`, `image-cache`, `font-cache`, older versions).
2. Only when old-site caches existed does it reload open tabs once. It never reloads for another reason (a reload while the kill switch is on would loop, because pages re-register the file).
3. It answers a FAILED top-level GET page navigation with `/offline.html`. Nothing else is intercepted: no API (`/api`, `/dev-api`), no assets, no files such as `/rss.xml`, no POST, no iframes. A page that loads is passed through untouched, so signed-in pages are never stored.
4. `/_astro/*` cache-first was skipped: `netlify.toml` already serves those files as `immutable`, so the HTTP cache does the job with no risk.
5. `skipWaiting` + `clients.claim`: used. The worker holds no pages or API data, so an open page can never meet a cache from another version. Without them a visitor with the old worker keeps the old site until every tab closes. The old worker used `autoUpdate`.
6. Kill switch: `const KILL_SWITCH = false` in `public/sw.js`. Set it to `true` and deploy: the worker deletes all caches and unregisters. Also set `ENABLE_SW = false` in `src/features/pwa/register.ts`, or new page loads register it again.
7. `VERSION` in `public/sw.js`: raise it when `public/offline.html` changes.

Registration: only in a production build, after the `load` event, scope `/`, `updateViaCache: 'none'`.

OfflineNotice: an Astro component (no React added to every page). A status region that always exists (visually hidden) gets the text; the visible strip is `aria-hidden`, `position: fixed`, top centre, `pointer-events: none`, so nothing moves. Text comes from the existing key `common:offlineIndicator.message` (en and hi).

### What the QA phase must verify in a real browser

Run `tests/e2e/parity-client.spec.ts`. The dev group runs on `astro dev`. The production group needs `SW_E2E=1` and `BASE_URL` set to a production build (the worker registers only in production).

1. Install: after load, `navigator.serviceWorker.ready` resolves with `/sw.js`; after one reload the tab is controlled; `caches` holds only `360ghar-offline-v1` with `/offline.html`.
2. Offline navigation: `setOffline(true)`, open `/properties`: the offline page shows (heading "You are offline", Hindi block, axe clean). Online again: the page loads.
3. No stored pages or API answers: after browsing, the cache list is unchanged; an offline `fetch('/api/v1/amenities')` fails.
4. Migration from the old worker: a stand-in old worker plus old caches (`workbox-precache-*`, `api-cache`, `image-cache`, `font-cache`) is replaced on `registration.update()`; caches end as only the new one; the tab reloads once. Also check by hand with a real v1 build if one is available (the stand-in is not the real Workbox script).
5. Kill switch: the modified worker (`KILL_SWITCH = true`) unregisters and leaves no caches.
6. Offline notice at 360, 768, 1440 px: appears offline, hidden online, header does not move, no horizontal scroll, axe clean.
7. Netlify: `/sw.js` keeps `Cache-Control: no-cache` (already in `netlify.toml`); `/offline.html` is served (the `/*.html` header gives 60 s browser cache, fine).
8. Safari (macOS and iOS): registration and offline page. Not testable in Chromium.

## E3. Leftover v1 API surface: DONE (one port, haptics, rest classified)

Grep evidence in v1 (`360ghar-web-ui/src`):

| Candidate | v1 callers | Class | Action |
|---|---|---|---|
| `DELETE /swipes/undo` | `swipeService.undoLast` -> `propertyStore.undoLastSwipe`; no component calls `undoLastSwipe` | (b) service only | Not ported. v2 already has an Undo action on the "removed from shortlist" toast |
| `GET /swipes/stats` | `swipeService.stats` -> `propertyStore.getSwipeStats`; no component calls it | (b) | Not ported |
| `POST /swipes/batch-remove` | no match in v1 at all | (b) | Not ported |
| `GET /agents/assigned` | `agentService.getAssignedAgent` -> `agentStore.getAssignedAgent`; no component calls it. But `AccountProfileTab.jsx:111` shows "Agent assigned" when `profile.agent_id` is set | (a) for the visible line, (b) for the endpoint | Ported: card on the account Profile tab (where v1 showed the line), details from `GET /agents/assigned`, falls back to the one line |
| `GET/PUT /users/preferences` | `userService.updatePreferences` -> `userStore.updatePreferences`; no component calls it | (b) | Not ported |
| `GET/PUT /users/location` | `userService.updateLocation` -> `userStore.updateLocation`; no component calls it | (b) | Not ported (and it would send the location to the server: privacy) |
| `/users/notification-settings` | `userService` only, no store or component | (b) | Not ported |
| `GET /data-hub/bank-rates` | `dataHubService.getBankRates` only; the EMI and loan tools have no call | (b) | Not ported |
| Haptics | `PropertyDetailsSection.jsx` (like: `hapticSuccess`; visit booked: `hapticSuccess`; lightbox swipe: `hapticLight`), `PropertyPageSection.jsx` (pull to refresh) | (a) | `src/lib/haptics.ts`; used on save (`FavouriteButton`), visit booked and callback sent (`ContactPanel`). The lightbox swipe and pull-to-refresh are not ported (not confirmations; the gallery file is not in this agent's list) |

Assigned agent card: `AssignedAgent` in `src/features/account/Account.tsx`, shown only when `profile.agent_id` is set. Uses only `Agent` fields from the schema (`name`, `contact_number`, `languages`, `avatar_url`).

## E4. Installability parity: DONE

- `public/manifest.webmanifest`: `display: standalone` (v1 had it; v2 had `browser`, so it could not be installed), plus `id: "/"`, `scope: "/"`, `lang: "en-IN"`, `dir: "ltr"`, `theme_color #ff6b00` (same as the `theme-color` meta in `Base.astro`), `background_color #ffffff`. Icons: 192 and 512 (`purpose: any`) and a new maskable 512.
- The existing 192 and 512 icons have a transparent background and the mark reaches about 90 percent of the canvas, so they are NOT safe to declare as maskable. A new file `public/assets/images/logo/favicon-maskable-512.png` was made from `favicon-512.png` with `sharp` (found in `node_modules/.pnpm`, used from a throwaway script in the scratchpad, not added to `package.json`): white square, mark scaled to 65 percent, centred. Measured: the farthest ink pixel is 174 px from the centre; the safe circle is 204.8 px (radius 40 percent of 512); all four corners are opaque white.
- `apple-touch-icon` in `Base.astro` resolves to a real 180 x 180 PNG (`assets/images/logo/apple-touch-icon.png`). The `icon` links (`/favicon.ico`, `favicon.webp`) also exist (tested).
- Test: `src/features/pwa/manifest.test.ts` parses the manifest and checks display, id, scope, start URL inside scope, names, lang, theme colour equal to `Base.astro`, the 192, 512 and maskable icons, that every icon file exists, is a PNG (magic bytes) and that its declared size equals the IHDR width and height, and the `Base.astro` icon links.
- Standalone hides browser chrome. Findings:
  - Every user page renders through `Page.astro`, whose header has the logo link to home (`aria-label="360Ghar home"`); nothing passes `chrome={false}`. Only `/styleguide` uses `Base.astro` alone (a noindex dev page). Sign-in and `/auth/callback` also use `Page`, so they have the header too.
  - `/auth/callback` reads `code` from its own URL and exchanges it in page script. It does not use browser UI. The OAuth redirect goes to `accounts.google.com` (outside scope) and back to `/auth/callback` (inside scope). On Android Chrome a WebAPK shares storage with Chrome, so this should work. On iOS a standalone app has its own storage and an out-of-scope hop opens an in-app view: the sign-in should finish there, but an email link (reset password, magic link) opens in Safari, not in the installed app, so a PKCE verifier stored by the app is not there. NOT verified, and QA must test it (checklist below). If it breaks, the fix is to not exchange in a different storage context, or to show a "return to the app" message. I did not change auth code.
  - iOS standalone has no back button; the site has no in-page back control on detail pages. Not changed (design decision).

## E5. Near-me fallback drives the results: DONE

- `withNearMe(filters, at, label, approximate)` in `src/features/search/filters.ts` (pure). A real fix keeps v1's start (5 km, sort by distance, label "Near me"). The fallback centre uses 10 km and the label "Central Gurugram (approximate)" (Hindi: "मध्य गुरुग्राम (अंदाज़न)", from `locationCopy(locale).approxPlace`). A radius the person already chose is kept; no other filter and no ranking is touched.
- `ResultsMap.tsx`: on failure it calls `onNearMe(28.4595, 77.0266, true)` (the map no longer only recentres). `SearchResults.tsx` builds the filters with `withNearMe`, so map, filter chip, URL (`lat`, `lng`, `radius`, `place`, `sort_by=distance`) and results agree.
- `HeroSearch.tsx`: the fallback place name is the same honest label, so the results page shows it.
- URL back-compat: a real fix still gives `lat=28.4089` (unchanged path, `compare-map.spec.ts` unaffected). `place` is UI only and is never sent to the API (tested).
- Tests: `src/features/search/nearMe.test.ts` (5 tests). E2E updated in `parity-client.spec.ts` (URL, label, no "Near me").
- Design decision to confirm: on the search page a denied "Near me" now changes the results (it filters to 10 km around central Gurugram). Before it changed nothing.

## E6. Contrast (WCAG 2.2), computed

Script (throwaway, in the scratchpad) with the token hex values from `src/styles/global.css`.

| Component | Pair | FG | BG | Ratio | Needs | Result |
|---|---|---|---|---|---|---|
| LocationNotice | message text 14px | #2c403a | #f5f9f7 | 10.40:1 | 4.5:1 | pass |
| LocationNotice | info icon | #3c5148 | #f5f9f7 | 8.03:1 | 3:1 | pass |
| LocationNotice | close icon (kesar-700) | #b54600 | #f5f9f7 | 5.15:1 | 3:1 | pass |
| LocationNotice | close button hover fill (mist-100) vs notice bg | #e9f1ed | #f5f9f7 | 1.08:1 | state change | visible, weak |
| ForgetLocation | button text on white | #b54600 | #ffffff | 5.47:1 | 4.5:1 | pass |
| ForgetLocation | button text on mist-50 | #b54600 | #f5f9f7 | 5.15:1 | 4.5:1 | pass |
| ForgetLocation | "Saved location removed." | #3c5148 | #ffffff | 8.53:1 | 4.5:1 | pass |
| OfflineNotice | text 15px | #ffffff | #1f4a41 | 9.93:1 | 4.5:1 | pass |
| offline.html | h1 | #0f1d19 | #ffffff | 17.35:1 | 3:1 | pass |
| offline.html | brand 18px 800 | #b54600 | #ffffff | 5.47:1 | 4.5:1 | pass |
| offline.html | paragraph | #3c5148 | #ffffff | 8.53:1 | 4.5:1 | pass |
| offline.html | Hindi card h2 and p | #0f1d19 | #e9f1ed | 15.10:1 | 4.5:1 | pass |
| offline.html | button | #ffffff | #1f4a41 | 9.93:1 | 4.5:1 | pass |
| offline.html | button hover | #ffffff | #0f1d19 | 17.35:1 | 4.5:1 | pass |
| offline.html | focus ring on white | #b54600 | #ffffff | 5.47:1 | 3:1 | pass |

No pair fails. One fix came out of the check: the notice was on `mist-100`, the same colour as the close button's hover fill (`btn-quiet`), so hover showed nothing (ratio 1.00). The notice is now on `mist-50`.

## E7. Runbook

### (a) Kill switch: step by step

Use it if the worker causes a problem in production (wrong pages, stale content, a loop).

1. `public/sw.js`: change `const KILL_SWITCH = false;` to `true`.
2. `src/features/pwa/register.ts`: change `ENABLE_SW = true` to `false`. (Flip both. With only the first, every page load registers the worker again, and it unregisters itself again.)
3. Deploy. `netlify.toml` already sends `/sw.js` with `Cache-Control: no-cache, no-store, must-revalidate`, and registration uses `updateViaCache: 'none'`.
4. How a browser picks it up: on its next navigation in scope (and at most every 24 hours) the browser fetches `/sw.js`, sees new bytes, installs it (`skipWaiting`), and on activate it deletes every cache, unregisters, and reloads tabs only if old-site caches were found. New page loads no longer register a worker (step 2).
5. Confirm in a browser that had the worker: DevTools, Application, Service Workers shows none; Cache Storage is empty; `await navigator.serviceWorker.getRegistrations()` returns `[]`; `curl -sI https://360ghar.com/sw.js` shows `no-cache`; and `grep KILL_SWITCH` on the fetched file shows `true`.
6. To turn it back on, reverse steps 1 and 2 and deploy. Raise `VERSION` in `public/sw.js` if `public/offline.html` changed.

### (b) QA checklist for the checks that need a real browser

Setup: a production build served over `http://localhost` or HTTPS (`astro dev` never registers the worker). Then `SW_E2E=1 BASE_URL=<that URL> npx playwright test tests/e2e/parity-client.spec.ts`. Also do the manual steps below.

1. Install from a v1-style worker with old caches
   - Automated: spec "migration". Manual with a real v1 build: serve the old site (`360ghar-web-ui` build with its Workbox worker) at the same origin, open it, wait for the worker and the precache; then deploy or serve the v2 build at that origin. Reload once.
   - Expect: DevTools, Application, Cache Storage lists only `360ghar-offline-v1` (with `/offline.html`); no `workbox-*`, `api-cache`, `image-cache`, `font-cache`; the worker script is the v2 `/sw.js`; an open old tab reloaded once and shows the v2 site; no reload loop (watch Network for three seconds).
2. Offline navigation
   - Load `/`, reload once so the tab is controlled, set DevTools Network to Offline, open `/properties`, `/hi`, and a `/property/<id>`.
   - Expect: the offline page (English heading, Hindi block, "Try again" button, no console errors, no failed requests other than the page). The offline notice strip shows on pages that were already open. Back online: "Try again" and the `online` event reload the page.
   - Expect: an API call (`fetch('/api/v1/amenities')`) fails offline. Cache Storage still has only the offline page.
3. Kill switch: follow runbook (a) on a local build; confirm registrations are `[]`, caches are empty, and that no reload loop occurs.
4. Safari (macOS and iOS): register, activate, offline page, and that `Add to Home Screen` uses the 180 px apple-touch-icon. Check that the offline notice and standalone chrome behave. Not testable in Chromium.
5. Install (E4): Chrome desktop and Android show the install prompt (Application, Manifest, no warnings; "Installability" passes); the installed app opens standalone, shows the maskable icon inside the launcher shape without clipping; the header logo goes home.
6. Auth in standalone (E4 risk): in the installed app on Android and iOS, sign in with Google and with email; finish an email link (reset password) from the mail app. Report where each one ends.
7. Location (E1, E5): grant, deny and time out in Chrome and Safari; Near me on the map with real Google Maps: fallback moves the map, list and chips to "Central Gurugram (approximate)".
