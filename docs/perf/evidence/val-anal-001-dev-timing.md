# VAL-ANAL-001 evidence — dev server, fresh session (2026-11-02)

Feature `analytics-defer-past-idle` on commit `perf/analytics-defer` (scheduler gate:
load → LCP candidates settle (1500 ms quiet) → idle; first-interaction fallback kept).

Method: fresh agent-browser session (`235ca0fa2953__u1`, own browser, no CDP attach),
`open http://localhost:4321/`, waited 9 s (past load + quiet + idle + the 8 s hard cap),
then read buffered `largest-contentful-paint`, `longtask`, `resource` and `navigation`
entries from `performance`. In dev, gtag/PostHog are `import.meta.env.PROD`-gated off, so
the observable analytics-work request is the dynamic `web-vitals` import that `begin()`
fires (PostHog/gtag requests are expected to be **absent** in dev; they are verified in
the PROD-build pass, `val-anal-002` evidence).

## Timing table (ms, from navigation start)

| Signal | Time | Reading |
|---|---|---|
| domContentLoadedEventEnd | 1852 | |
| loadEventStart / End | 1853 / 1853 | automatic gate arms here (8 s hard cap) |
| LCP candidates | 1516, 1528 | text candidates; hero settles later on prod |
| Scheduler module (`/src/lib/analytics/{index,scheduler}.ts`) | 1791, 1828 | initial module graph — the tiny gate only |
| **First analytics-work request: `/node_modules/.vite/deps/web-vitals.js`** | **3362** | `begin()` ran here: 1853 (load) + 1500 (quiet) + idle |
| googletagmanager / PostHog requests | none | PROD-gated off in dev, as designed |
| Long tasks (whole 9.4 s window, buffered) | **none** | therefore none before LCP |

## Gate invariant check

`begin()` must run ≥ max(loadEventEnd, last LCP candidate) + 1500 ms:

- max(1853, 1528) + 1500 = **3353**; web-vitals request starts **3362** ✓
- No analytics-work request begins before load + idle handoff ✓ (only request after load
  until 3362 ms is the idle-hydration react vendor bundle, not analytics)
- Console: only `[vite] connecting/connected`, `[astro] prefetch`, React DevTools dev hint.
  No errors.
