# Final production validation — post-cutover (Milestone 3 close-out)

Measured 2026-11-03 00:15–00:55 UTC against **https://360ghar.com** (served by Cloudflare
Worker `360ghar-web-ui` via the custom domain attached 2026-11-03; PR #31 merged
`a2951e7`). This is the "after" column for `docs/perf/baseline.md` and the evidence set for
VAL-PERF-001..005, VAL-REG-001..003, VAL-CROSS-001.

**Verdict: the 97-98 stop-rule is LIVE.** Homepage median score **97** (< 99) with every
component metric inside its bar (LCP 2258 ms ≤ 2.5 s, SI 3170 ms ≤ 3.5 s, TBT 43 ms,
CLS 0.001). Per the pre-agreed decision structure this stops here for an
orchestrator/user decision on the next lever — no scope was expanded. Recommended lever
and the data behind the pick are at the bottom.

## Protocol

- Engine: local **Lighthouse 13.6.0** via `node scripts/perf/lighthouse.mjs` (repo runner),
  `--screen faithful` default (mobile UA + throttling, NO screen-metrics override — the
  override injects a nondeterministic +1.5-2 s blackout on this machine;
  `docs/perf/hero-delay.md`). Headless Chrome 156, `--only-categories=performance`.
- Median of **3 fresh runs** per URL (contract rule). Raw per-run JSON + computed medians:
  `home.summary.json`, `properties.summary.json`, `locality.summary.json`,
  `detail.summary.json` (+ `*.run{1,2,3}.json`).
- Machine/network context: egress routes to Cloudflare PoP **MRS (Marseille)**, RTT
  ≈ 130-170 ms; fresh connections pay a ~3.5× RTT handshake penalty on any
  Cloudflare-served URL. This inflates machine-local LCP/TTFB vs a Google-vantage run.
  **The user's pagespeed.web.dev run remains the authoritative external check.**
- Protocol-mode note: the committed baseline table (`docs/perf/baseline.md`) was measured
  in the pre-2026-11-02 `canonical-mobile` mode. This report uses the runner's `faithful`
  default, as documented in `docs/perf/hero-delay.md`; comparisons to the baseline therefore
  have a favorable-direction mode skew, stated here for clarity.

## Homepage vs the approved bar (medians of 3, faithful)

| Metric | Median | Bar | Verdict |
|---|---|---|---|
| Performance score | **97** | ≥ 97 (accepted 2026-11-03; original target ≥ 99) | **PASS at accepted bar; 99-point target not met** |
| LCP | 2258 ms | ≤ 2500 ms | PASS |
| Speed Index | 3170 ms | ≤ 3500 ms | PASS |
| TBT | 43 ms | ≤ 50 ms | PASS |
| CLS | 0.001 | ≤ 0.01 | PASS |

Per-run spread (`home.summary.json`): scores 87 / 98 / 97 — run 1 drew a 3769 ms LCP
outlier (edge/ Cloudinary draw), runs 2-3 sat at 2187 / 2258 ms LCP. FCP median 1768 ms.

**LCP element (median run, run 3):** `<img class="layer layer-towersFar" …
src="/diorama/towersFar.svg?v=dfb61987" … fetchpriority="high">` — the hero diorama
layer, priority-hinted, `lcp-discovery` score **1** (baseline was **0**). Not an analytics
artifact. VAL-PERF-002 element condition PASS.

Comparison to the same-hour pre-cutover production control (faithful, 2026-11-02 evening,
`docs/perf/hero-delay/`): 97 / LCP 2327 / SI 3320 → today 97 / 2258 / 3170. The cutover
moved LCP −69 ms and SI −150 ms but not the rounded score; the residual gap is
**page-composition-bound (hero + above-fold visual completion), not hosting-bound.**

## Regression sweep (medians of 3, faithful; bar = baseline − 1)

| Page | Post-cutover (faithful) | Pre-mission baseline (canonical) | Bar | Verdict |
|---|---|---|---|---|
| `/properties` | **95** | 94 | ≥ 93 | above bar; not like-for-like |
| `/locality/palam-vihar-gurgaon` | **97** | 92 | ≥ 91 | above bar; not like-for-like |
| `/property/118` | **97** | 95 | ≥ 94 | above bar; not like-for-like |

The two columns use different screen modes, which `docs/perf/baseline.md` says are not
comparable. `docs/perf/hero-delay.md` puts the canonical-mode skew at about 2 s of SI, so
most of the +1 to +5 is the mode, not a page gain. A like-for-like regression check needs
faithful re-runs of the pre-cutover pages; until then these verdicts show only that each
page sits above its bar.

Per-run spreads in the respective `*.summary.json` files. LCP elements on all three are
above-fold Cloudinary card/gallery images. **Open item:** the locality LCP image is still
`loading="lazy"` with `lcpDiscoveryScore` 0 in every run; lazy-loading an above-fold LCP
image delays it, so this is a likely LCP cost to fix, not a neutral carry-over.

## TTFB (VAL-PERF-005)

Reused-connection warm-edge pass (the ≤ 300 ms bar; method per
`docs/perf/staging-parity.md` §4 — fresh curls on this machine are handshake-bound):

- connection setup (unmeasured): 470 ms
- run 1: **136 ms** · run 2: **144 ms** · run 3: **193 ms** — all ≤ 300 ms, each with
  `new_connections=0` (connection reused) → **PASS**
- `cf-cache-status: HIT` on all three sequential requests, `age` 2508 → 2509 → 2509
  (`ttfb-reused.txt`, `ttfb-reused-headers.txt`)

Fresh-connection passes, recorded as context (`ttfb-fresh.txt`): 449 / 397 / 488 ms. Of
each, 0.25-0.34 s is DNS + TCP + TLS setup (`time_appconnect`, cumulative from request
start) on the MRS route; the remaining ~0.14-0.15 s is one request round trip plus edge
time. Baseline root-doc TTFB (Netlify double-hop, fresh connection) was ~609 ms, so the
like-for-like comparison is 397-488 ms against 609 ms. A first visit pays the handshake;
the 136-193 ms warm-edge figure reuses a connection and is not a first-visit TTFB.

## Cold-visitor journey (VAL-CROSS-001) — PASS

Fresh Chrome profile, production. The run was intended as iPhone 12 emulation, but the HAR
records desktop Chrome (macOS `HeadlessChrome` UA, `sec-ch-ua-mobile: ?0` on every request),
so treat it as desktop evidence. Evidence + screenshots:
`journey/` (this dir) — `README.md` narrates, `journey.har` is the full request log,
`network-log-analytics.json` the analytics timeline, `home-load-perf.json` the
instrumented homepage load.

1. **Load** — homepage paints fast: TTFB 395 ms (fresh conn), FCP 952 ms, LCP 952 ms
   (hero `towersFar.svg`), `loadEventEnd` 1115 ms, **zero long tasks**.
2. **Search** — hero search worked; a Rent + "Palam Vihar" search returned the honest
   empty state ("No homes match these filters" — no rent inventory for that locality
   today), a Buy + "Palam Vihar" search returned 58 result cards
   (`/properties?purpose=buy&locality=Palam+Vihar`).
3. **Open detail** — `/property/182` rendered (h1 "3 BHK Builder floor in Palam Vihar").
4. **Favourite** — "Save to shortlist" click as a signed-out visitor → `/login?next=
   %2Fproperty%2F182` sign-in page (the accepted signed-out functional evidence;
   full favourite persistence needs auth, no test credentials exist here).

**Deferred analytics on every page:** each page's first analytics request comes after that
page's load+idle handoff. Requests with a recorded success response: gtag.js 200, GA collect
204, posthog config/recorder/surveys and `/e/` + `/i/v0/e/` batches 200; posthog `/s/` has no
recorded successful response (HAR status 0). Instrumented homepage pass: first analytics at
`timeOrigin` + **2707 ms**. Estimate, not exact: `scheduler.ts` creates the LCP observer on
the load event (1115 ms) and its buffered callback arms the 1500 ms quiet timer then, so the
earliest start is about 2615 ms and the idle callback took the remaining ~90 ms (the callback
timestamp was not recorded). Zero console errors for the whole session. One note: a posthog
batch from the homepage started about 0.95 s after the buy-results page's document request
(the previous page's batch crossing the navigation; its own gate had already fired at
+1584 ms). Details: `journey/network-log-analytics.json`.

## Stop-rule decision — measured basis and lever recommendation

Score needs +2 points (97 → 99). Where the points are:

- **TBT (30 % weight): banked** (43 ms ≈ max score; analytics + hero hydration are out of
  the load window already). CLS (25 %): banked (0.001).
- **LCP (25 %): passing but volatile** — median 2258 ms is inside the bar, yet the run-1
  draw (3769 ms → score 87) shows the hero layer still races other above-fold fetches;
  the scoring curve wants ~1.9 s for comfortable 99 territory.
- **SI (10 %): 3170 ms ≈ 0.92** — bounded by visual completion of the 20-layer diorama
  plus the below-fold Cloudinary card flush.
- **FCP (10 %): ~0.9** (1768 ms; 0.89-0.91 across runs) — the lowest-scoring metric.

Pre-agreed levers, ranked against that data:

1. **Leaner above-fold diorama** (recommended) — the only single lever that attacks both
   residuals: fewer competing hero layers in the first second cuts LCP variance (the 87
   draws) AND raises visual-completion speed (SI). Directly targets what holds the score.
2. **More hero preloads** — cheap, zero visual change (today only `towersFar` + `towersMid`
   are preloaded). On simulated mobile throttling each added preload competes with the LCP
   layer for bandwidth, so measure before keeping; could *worsen* the LCP tail.
3. **Inline critical CSS** — least headroom: FCP is already ~0.9 banked, and the gain to
   SI is indirect; highest build complexity (CSP/inline budget) for the fewest points.

Also worth stating plainly: cutover already banked the hosting win — warm-edge TTFB
136-193 ms vs 609 ms Netlify baseline, and the local faithful numbers match the pre-cutover
production control within noise. The remaining 2 points live in the page, not the platform.
And per the PSI caveat (`docs/perf/hero-delay.md`): the user's pagespeed.web.dev run is the
external cross-check; if its SI/LCP read materially different from these faithful numbers,
compare its trace artifacts before touching the page.

## Reproduce

```bash
node scripts/perf/lighthouse.mjs https://360ghar.com/ --runs 3 --out docs/perf/after --label home
node scripts/perf/lighthouse.mjs https://360ghar.com/properties --runs 3 --out docs/perf/after --label properties
node scripts/perf/lighthouse.mjs https://360ghar.com/locality/palam-vihar-gurgaon --runs 3 --out docs/perf/after --label locality
node scripts/perf/lighthouse.mjs https://360ghar.com/property/118 --runs 3 --out docs/perf/after --label detail
```
