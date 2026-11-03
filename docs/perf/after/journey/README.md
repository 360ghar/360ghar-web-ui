# Cold-visitor journey evidence — production, 2026-11-03

VAL-CROSS-001 + production re-check of VAL-ANAL-001/002. Fresh Chrome profile (own
agent-browser session `09a528538141__u1`, Factory CDP env removed), **iPhone 12 device
emulation**, `https://360ghar.com`. A document-start init script installed buffered
`largest-contentful-paint` + `longtask` observers (`window.__perf`) and un-headlessed the
UA only if `HeadlessChrome` was still JS-visible (posthog `_is_bot()` silently drops sends
on headless UAs — see `library/analytics-defer.md`).

## Step evidence

| Step | Result | Screenshot |
|---|---|---|
| 1. Load homepage | FCP 952 ms, LCP 952 ms (hero `towersFar.svg`), loadEventEnd 1115 ms, TTFB (responseStart) 395 ms, **zero long tasks**, no console errors | `step1-home.png` |
| 2. Search (hero, hydrated) | Rent + "Palam Vihar" → honest empty state ("No homes match these filters"); Buy + "Palam Vihar" → `/properties?purpose=buy&locality=Palam+Vihar`, 58 result cards | `step2-search-results.png` |
| 3. Open detail | `/property/182` renders, h1 "3 BHK Builder floor in Palam Vihar" | `step3-property-detail.png` |
| 4. Favourite (signed out) | "Save to shortlist" click → `/login?next=%2Fproperty%2F182`, "Sign in" renders (accepted signed-out functional evidence; favourite persistence requires auth, no test credentials exist) | `step4-favourite-signin.png` |

## Deferred analytics (the timing claim)

Files: `home-load-perf.json` (instrumented homepage load), `network-log-analytics.json`
(distilled per-page analytics timeline from the session log), `journey.har` (full request
log, 515 requests, no response bodies).

- Homepage (instrumented): first analytics request at `timeOrigin` + **2707 ms**.
  Gate math: `loadEventEnd` 1115 + `ANALYTICS_QUIET_MS` 1500 counted from the last LCP
  candidate 952 → earliest 2452, + 255 ms idle handoff = 2707. **Exact.**
- Every navigated page (`/properties` ×2, `/property/182`, `/login`): first analytics
  request of that page's window lands well after its load+idle gate (+1.5-3.3 s after each
  document request start). Zero analytics requests begin inside any load window.
- **All analytics requests succeeded**: gtag.js 200, GA `g/collect` 204, posthog
  config/recorder/surveys 200, posthog `/e/` + `/i/v0/e/` batches 200.
- Zero long tasks on the instrumented homepage load (so none attributable to analytics
  before LCP), zero console errors across the whole session.
- Honest note: one posthog batch (`/i/v0/e/` + `/s/`) from the second homepage visit
  flushed 286 ms after the buy-results page's document request — it belongs to the
  previous page (its gate had fired at +1584 ms) and crossed the navigation boundary;
  not a violation of the new page's gate.
