# Quality checks (2026-09-27)

| Check | Result |
|---|---|
| `pnpm typecheck` (astro check + tsc) | 0 errors |
| `pnpm lint` | 0 problems |
| `pnpm test` (Vitest) | 198 of 198 pass, 37 files |
| `pnpm test:e2e` (Playwright, phone 360 px, tablet 768 px, desktop 1440 px) | 306 of 306 pass (3 phone tests failed only in the first cold run after a dev restart, when Vite reloaded the page, and passed on re-run). Every spec clicks its controls, runs axe (WCAG 2.2 AA, serious and critical), checks for sideways scroll, and simulates the backend down in the browser |
| Old URLs | 3,500 old URLs checked: 2,018 return 200, 22 return 301, 1,460 return 404. All 404s are `/property/:id` for 730 listings that the API has deleted (see `inventory.md`) |
| Backend down on the server | A build that points at a dead API: no page returns 500. Pages show a clear message with "Try again"; list pages return 503, other pages keep their fixed content |

## Lighthouse (mobile, simulated slow 4G, median of 3 runs)

Production build, served locally with a CDN-like cache (on Netlify the CDN serves these pages from cache). Measured again after the font change to Supreme.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT |
|---|---|---|---|---|---|---|---|
| `/` | 99 | 100 | 100 | 100 | 1.8 s | 0 | 29 ms |
| `/properties` | 92 | 98 | 100 | 100 | 3.1 s | 0 | 40 ms |
| `/property/182` | 96 | 100 | 100 | 100 | 2.8 s | 0 | 28 ms |

- Performance 90+ on all three pages. LCP under 2.5 s on the home page.
- On listing and detail the LCP is a photo from `res.cloudinary.com`, a second origin; on simulated slow 4G the new connection and the page's JavaScript share the bandwidth. INP cannot be measured in a lab run; TBT stays under 50 ms.
- What got here: analytics start after the load event (about 370 KB out of the first load), the Supabase SDK loads only when a session is stored (55 KB), no CORS on the image preconnect, below-the-fold cards not at high priority, the closed photo viewer and the closed mobile menu no longer download images, a smaller header logo.
- Options that would cut the photo LCP further, not done: serve photos from the site's own origin through Netlify Image CDN (may cost money: needs your approval), or hydrate the listing island on idle instead of on load.

## Trailing slashes

In the production build, `/about-us/`, `/properties/`, `/property/182/`, `/hi/properties/` and similar URLs return a 301 to the URL without the slash. In `astro dev` they show a 404; that is dev-only behaviour.

# Round 3 (2026-09-28): more visuals on every page

## Checks

| Check | Result |
|---|---|
| `pnpm lint` | 0 problems |
| `pnpm typecheck` (astro check + tsc) | 0 errors, 0 warnings, 570 files |
| `pnpm test` (Vitest) | 307 of 307 pass, 55 files (198 before this round) |
| `playwright test` (phone 360, tablet 768, desktop 1440; 3 workers, 1 retry) | 570 pass, 6 skipped by design (desktop-only or phone-only tests), 3 flaky: each failed once under load (a slow chat panel open, a network pause, a select timeout) and passed on the retry. 579 tests in total (306 before this round) |
| Build | `pnpm build` passes; dev restarts with `--force` and every island hydrates |

## Lighthouse (mobile, simulated slow 4G, median of 3 runs)

Production build, served locally with the same CDN-like cache as before.

| Page | Performance | Accessibility | Best practices | SEO | LCP | CLS | TBT | Before round 3 |
|---|---|---|---|---|---|---|---|---|
| `/` | 96 (96, 95, 96) | 100 | 100 | 100 | 2.6 s | 0 | 18 ms | 99, LCP 1.8 s |
| `/properties` | 90 (90, 92, 84) | 98 | 100 | 100 | 3.2 s | 0 | 10 ms | 92, LCP 3.1 s |
| `/property/182` | 90 (90, 90, 89) | 100 | 100 | 100 | 3.5 s | 0 | 5 ms | 96, LCP 2.9 s |

- All three pages stay at 90 or more. The new visuals cost some of the margin on the list and the detail page.
- Home: the first build of this round fell to 91 (HTML 66 KB gzip, 1,622 DOM elements). Below-the-fold drawings now load as cached SVG files (`/art/…`), and paths are shorter. HTML is now 40 KB gzip, lower than before this round (41 KB).
- `/properties`: the island props went from 128 KB to 27 KB raw, so the HTML is back to 28 KB gzip. The LCP is the first card photo from `res.cloudinary.com`.
- `/property/182`: HTML 31.6 KB gzip (20.5 KB before this round) and render-blocking CSS 18.7 KB gzip (14 KB before), for the price context, the day picker, the room groups and the costs layout. First paint 1.9 s (1.2 s before).
- Extra card and gallery photos now load after the page has loaded, or when a person touches the strip. Lighthouse cannot show this gain: it records on a fast machine, where the load event comes at about 40 ms, and then simulates slow 4G. On a slow phone the main photo no longer shares bandwidth with them.
- Options not done, to win back the list and detail margin: serve photos from the site's own origin through Netlify Image CDN (may cost money: needs your approval), and split the detail page CSS so that the below-the-fold parts do not block the first paint.

## Re-check (2026-09-30), after the changes of 2026-09-29

Another session changed about 680 files on 2026-09-29 (a second display font, Sentient; a pine palette; a review form; a service worker; SEO and parity tests). Checks on the current code:

| Check | Result |
|---|---|
| `pnpm lint` | 0 problems |
| `pnpm typecheck` | 0 errors, 0 warnings |
| `pnpm test` | 729 pass, 1 skipped, 104 files |
| `playwright test` (3 workers, 1 retry) | 787 pass, 1 flaky, 61 skipped by design |
| Old URLs (3,500) | 1,974 return 200, 66 return 301 (44 more than before: `/add-new-listing` and `/locality/projects-in-*`, each one hop to a 200 page), 1,460 return 404 (deleted listings, as before) |
| Broken images, page errors, sideways scroll | None on 24 page types at 360 and 1440 px |

Lighthouse (mobile, median of 3): `/` 97, `/properties` 85, `/property/182` 86. The list and the detail page are now below 90 (90 and 90 on 2026-09-28). Before LCP (the Cloudinary photo), the detail page now loads about 130 KB more at high priority than on 2026-09-28: the Sentient font (51 KB, preloaded), the form code (react-hook-form and zod, 36 KB gzip, for the contact panel at load) and service-worker traffic. One list run also had a slow server response (TTFB 1.4 s), which is the environment, not the code. Options: do not preload the second display font on pages whose LCP is a photo (or subset it), hydrate the contact panel on idle or visible, and keep the analytics recorder and surveys off until the person interacts.

## Replacement PR #18 (2026-10-21)

Checks on `feat/replace-with-web-ui-2` after the review round.

| Check | Result |
|---|---|
| `pnpm install --frozen-lockfile` | ok |
| `pnpm typecheck` | 0 errors |
| `pnpm lint` | 0 problems |
| `pnpm test` | 817 pass, 1 skipped, 112 files |
| `pnpm check:api` | ok (openapi synced from `integration/contract-2026-10`) |
| `pnpm check:pseo` | 0 errors, 91 warnings |
| `pnpm build` | ok |
| `playwright test` (3 workers, 1 retry, warm dev server) | 797 pass, 3 flaky, 0 failed, 85 skipped (61 by design, 24 need the contract backend, which the live API does not serve yet) |
| Old URLs (3,574) | 1,904 return 200, 150 return 301, 1,520 return 404 (deleted listings) |

Deploy preview, Lighthouse mobile (single run, simulated slow 4G). SEO reads 69 only because Netlify sends `X-Robots-Tag: noindex` on previews.

| Page | Performance | Accessibility | Best practices | LCP | CLS | TBT |
|---|---|---|---|---|---|---|
| `/` | 88 | 100 | 96 | 2.3 s | 0 | 20 ms |
| `/properties` | 89 | 99 | 96 | 2.6 s | 0 | 20 ms |
| `/property/182` | 86 | 100 | 96 | 2.8 s | 0 | 10 ms |
