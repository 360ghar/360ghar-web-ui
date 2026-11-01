# VAL-ANAL-001/002 evidence — PROD-mode build, real gtag + PostHog sends (2026-11-02)

Feature `analytics-defer-past-idle` (branch `perf/analytics-defer`).

Why a second pass: `src/lib/analytics/index.ts` gates gtag/PostHog behind
`import.meta.env.PROD`, so they never run on the dev server. To prove the deferred
analytics still function (VAL-ANAL-002), a `pnpm build` production bundle was served
statically (`python3 -m http.server 4173`, `dist/glossary-inject.html` — a prerendered
page using the same `Base.astro` shell) and loaded in a fresh agent-browser session
(`235ca0fa2953__u2`, own browser). A `google-analytics.com` route stub answered the gtag
collect hits locally so no hit reached the real GA property; `us.i.posthog.com` was left
real, so the validation session's one anonymous `$pageview` + two `web_vitals` events
reached the project's PostHog (self-originated, device-only data).

Automation note: agent-browser's Chrome is headless (`HeadlessChrome` UA), which triggers
posthog-js's `_is_bot()` and silently drops all event sends. The verification page carries
a document-start script that spoofs `navigator.userAgent` (Headless→Chrome) and
`navigator.webdriver=false` so posthog sends normally. Site code is untouched; this only
compensates for the automation environment (this is why earlier probe loads showed
init + recorder + surveys but zero sends — not a site bug; real browsers are unaffected).

## Timing table (ms, from navigation start; final load)

| Signal | Time | Reading |
|---|---|---|
| domContentLoadedEventEnd / loadEventEnd | 49 / 49 | static page |
| LCP candidate | 52 | |
| Gate math: max(49, 52) + 1500 (quiet) | 1552 | earliest allowed |
| Scheduler wrapper chunk `/_astro/analytics.C0p4TLJK.js` | 32 | initial module graph (2.4 KB gate only) |
| `googletagmanager.com/gtag/js?id=G-…` | 1568 | gtag inject, past gate |
| `/_astro/module.ClDu7S67.js` (posthog-js, 289 KB dynamic chunk) | 1568 | past gate |
| `/_astro/web-vitals.T56GecVW.js` | 1568 | past gate |
| posthog `config.js`, `posthog-recorder.js`, `surveys.js` | 1592–1628 | past gate |
| **PostHog capture `POST us.i.posthog.com/e/` → 200** | **4598** | batch flush: `$pageview` + 2× `web_vitals` |
| **gtag `POST google-analytics.com/g/collect?...en=page_view`** | 1568–2050 window | **intercepted by stub (200 local), not delivered to GA** |
| Long tasks (buffered, whole window) | **none** | therefore none before LCP |

## VAL-ANAL-002: analytics still fire after idle

- PostHog console (debug logging enabled during this pass): `send "$pageview"`,
  `send "web_vitals"` ×2 — the exact events the old site sent, now post-gate.
- Network: `POST https://us.i.posthog.com/e/` → 200 (the capture batch).
- gtag: `dataLayer` populated, collect page_view hit attempted post-gate (stubbed at the
  network layer; the request fires — on production it reaches GA).
- Console: no analytics errors (only posthog's own debug/info lines from the deliberately
  enabled debug mode; a normal load logs nothing — verified on earlier loads: empty console).

## Bundle topology (expectedBehavior: dynamic import, not in essential entry)

- Essential entry: `Base.astro` script chunk is 48 B and statically imports only the
  2.4 KB scheduler wrapper (`analytics.C0p4TLJK.js`).
- posthog-js (289 KB, `module.ClDu7S67.js`) is reachable ONLY via `await import()`
  inside the wrapper — never referenced by page HTML or the entry graph.
- web-vitals (5.6 KB) same — dynamic chunk, fetched only when `begin()` runs.
