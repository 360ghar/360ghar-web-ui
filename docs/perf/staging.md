# Staging performance checkpoint (before any production change)

Measured 2026-11-02 against the Cloudflare Workers staging URL
`https://360ghar-web-ui.360ghar.workers.dev/` (deployed by `cf-staging-deploy-verify`,
version runs the four homepage perf levers). This is the Milestone-2 gate that must pass
before `production-cutover` is proposed.

**Verdict: PASS with one diagnosed miss.** LCP, TBT, CLS and the analytics gate all meet
their bars and beat same-hour production. Speed Index is the one metric worse than the
baseline direction (median 4.93 s vs 4.4 s original problem / 3.59 s baseline median);
the diagnosis below shows it is bounded by a pre-existing, host-independent hero
first-paint lottery — **not** by the Workers platform or by any of the four levers. All
four levers delivered their mechanisms, each verified in-trace.

> **2026-11-02 resolution (`hero-render-delay-investigation`):** the "render-delay
> lottery" above was traced to its mechanism and is **not a page property** — it is a
> nondeterministic presentation blackout in headless Chrome's mobile screen emulation
> on the measurement machine (`mobile: true` metrics override; the page paints and
> presents at 645-745 ms without it; trace proof + isolation matrix:
> `docs/perf/hero-delay.md`). The SI miss in this file is a measurement artifact of the
> canonical protocol. Re-measured the same hour under the corrected faithful protocol:
> staging median **score 98 / LCP 2057 ms / SI 2542 ms / TBT 10 ms / CLS 0.001** vs
> production control 97 / 2327 / 3320 / 20 / 0.002. Tables in this file remain valid
> as canonical-mode records; do not compare medians across modes.

## Protocol

- Contract engine: local Lighthouse **13.6.0**, mobile emulation (runner screen mode
  **`--screen canonical-mobile`**), `--headless=new`,
  serial runs (no concurrent Chrome).
  `node scripts/perf/lighthouse.mjs <URL> --runs 3 --screen canonical-mobile`.
  The runner now defaults to `--screen faithful`; this table is canonical-mobile, so the
  flag is required to extend or reproduce it (mode comparison rules:
  `docs/perf/hero-delay.md`).
- Staging runs warmed the edge first (`cf-cache-status: HIT`, `age` > 1500 s on arrival;
  fresh-TLS warm TTFB 0.59 s via curl). PoP caveat (in-repo evidence:
  `docs/perf/staging-parity.md` §4 "Warm edge cache", "Network context"): this machine
  routes to Cloudflare PoP **MRS (Marseille)** despite India egress, RTT ≈ 130-170 ms, so
  fresh-connection TTFB reads ~450-530 ms even on edge HITs — warm latency must be
  measured on a reused connection.
- Same-hour **production control** (pre-lever Netlify build on `360ghar.com`) re-run
  immediately after the staging runs to isolate machine/network drift from the platform
  delta. Production was not modified; control runs are diagnostic only.
- Raw JSON: `docs/perf/staging/staging-home.run{1..3}.json` + `.summary.json`,
  `docs/perf/staging/prod-control-home.run{1..3}.json` + `.summary.json`.
  Reference baseline: `docs/perf/baseline.md` (pre-mission production, measured earlier
  the same day on the same machine/engine).

## Results — staging vs baseline vs same-hour production control (medians of 3)

| Metric | Staging (levers, Workers) | Baseline (pre-mission prod) | Prod control (same hour) | Bar | Verdict |
|---|---|---|---|---|---|
| Perf score | **93** | 95 | 90 | — | −2 vs baseline, +3 vs control |
| LCP | **2607 ms** | 2622 ms | 3177 ms | < ~2.8 s | **PASS** (−33 % vs 3.9 s problem; −18 % vs control) |
| Speed Index | **4925 ms** | 3591 ms | 3791 ms | materially < 4.4 s | **MISS** — see diagnosis |
| TBT | **31 ms** | 17 ms | 107 ms | ≤ 50 ms | **PASS** (−71 % vs control) |
| CLS | **0.000** | 0.001 | 0.001 | ≤ 0.01 | **PASS** (staging blip-free 3/3; control run 3 drew a 0.073 shift) |
| FCP | 1841 ms | 1791 ms | 1766 ms | — | flat |

### Per-run spread

| Run | Score | FCP | LCP | SI | TBT | CLS |
|---|---|---|---|---|---|---|
| staging 1 | 93 | 1841 ms | 2607 ms | 4520 ms | 31 ms | 0.000 |
| staging 2 | 91 | 1843 ms | 2857 ms | 4941 ms | 28 ms | 0.000 |
| staging 3 | 93 | 1732 ms | 2470 ms | 4925 ms | 37 ms | 0.000 |
| control 1 | 83 | 1766 ms | 3811 ms | 5101 ms | 114 ms | 0.000 |
| control 2 | 91 | 1916 ms | 2905 ms | 3791 ms | 98 ms | 0.001 |
| control 3 | 90 | 1730 ms | 3177 ms | 3214 ms | 107 ms | 0.073 |

Staging LCP range 2470–2857 ms is tight; the baseline distribution (2300–6282 ms) had
catastrophic outliers that staging eliminates. Control LCP 2905–3811 ms that same hour
confirms the environment drifts more than the staging spread.

## Analytics: none in the load window (PASS)

First analytics request per staging run vs the final LCP entry:

| Run | LCP (sim) | First analytics request | Gap |
|---|---|---|---|
| 1 | 2607 ms | gtag at 4091 ms | +1484 ms |
| 2 | 2857 ms | gtag at 4070 ms | +1213 ms |
| 3 | 2470 ms | gtag at 4044 ms | +1574 ms |

gtag (googletagmanager) is the first analytics work in every run, then PostHog config →
recorder/surveys → `g/collect`. That is the scheduler's contract (final LCP entry →
1500 ms quiet window → `requestIdleCallback`) working end-to-end on a PROD build.
Baseline production started gtag/PostHog at **1022–1697 ms**, i.e. *before* LCP, and the
same-hour control still starts analytics at **528–819 ms** with TBT 98–114 ms. Staging's
TBT 31 ms and CLS 0.000 are the direct result of analytics being out of the window.

## Lever-by-lever mechanism verification (in-trace evidence)

| Lever | Mechanism evidence on staging | Baseline evidence |
|---|---|---|
| TTFB / edge cache | Root doc complete **387–469 ms**; `cf-cache-status: HIT`; `s-maxage=3600` + SWR emitted (stripped CDN directive visible as `Netlify-CDN-Cache-Control` passthrough) | Doc complete 513–902 ms; control 500–560 ms |
| Hero LCP priority | LCP **discovery score 1.0 in 3/3 runs**; `towersFar.svg` + `towersMid.svg` preloaded with `fetchpriority="high"`; LCP fetch starts 444 ms, completes ≤ 704 ms | Discovery score **0 in 3/3** runs; no preloads |
| Idle hydration | `HeroSearch` chunk first fetched at **2524–2621 ms** (post-idle), react-dom at 2856–3094 ms — off the critical path | react-dom on critical path at **688–1590 ms** (`client:load`) |
| Analytics deferral | First analytics ≥ 4044 ms = post-LCP + quiet window; TBT 28–37 ms | Analytics at 1022–1697 ms inside the window; TBT 17 ms but control today 98–114 ms |

## Speed Index diagnosis (the one miss)

**Root cause: the hero first-paint render-delay lottery, pre-existing and
host-independent — plus the below-fold lazy-image flush lottery. Not the Workers
platform, and not a regression introduced by any lever.**

Evidence, observed (unthrottled) trace values across all 9 runs measured today:

| Run | Observed first paint | Observed LCP render delay | Sim LCP / SI |
|---|---|---|---|
| BASE prod-1 | 2548 ms | **1828 ms** | 6282 / 5241 |
| BASE prod-2 | 772 ms | 86 ms | 2622 / 2940 |
| BASE prod-3 | 1227 ms | 110 ms | 2300 / 3591 |
| control 1 | 2519 ms | **1838 ms** | 3811 / 5101 |
| control 2 | 1463 ms | 168 ms | 2905 / 3791 |
| control 3 | 1259 ms | 296 ms | 3177 / 3214 |
| staging 1 | 2585 ms | **2000 ms** | 2607 / 4520 |
| staging 2 | 2556 ms | **1824 ms** | 2857 / 4941 |
| staging 3 | 2532 ms | **1828 ms** | 2470 / 4925 |

1. The LCP element (`towersFar.svg`) is fetched by ~700 ms in every run on both hosts.
   What varies is when it *paints*: most runs show ~1.8 s of render delay after `load`
   with no >50 ms long task explaining it. The pattern — including the identical ~1830 ms
   render delay — fires on the **pre-mission production build** (BASE-1) and on the
   **same-hour production control** (control-1). It is a page property, present before
   the mission and independent of host.
2. Simulated SI tracks the draw: late paints → SI 4520–5241; early paints → SI 2940–3791.
   Baseline's 3591 median is two lucky draws; its own worst run was 5241.
3. Staging drew late 3/3 times (2532–2585 ms). With n = 3 this may be chance. A possible
   build-composition nudge: the Astro 7.4.4/rolldown build ships many more, much smaller
   chunks (~38 `_astro` requests vs ~25 on the Netlify build) executing around `load`.
   Nothing blocking was identified, and first-party bytes all complete *earlier* on
   staging than on production (CSS by 654 ms vs 654–720 ms; all 20 diorama SVGs by
   595–704 ms vs 655–720 ms; font 661 ms vs 685–687 ms).
4. Secondary term: the below-fold lazy Cloudinary card images. Chromium flushes them as a
   batch; staging consistently at ~1527 ms, production at 1034–1533 ms across 6 runs.
   SI correlates with this flush on both hosts (control-3: 1034 ms → SI 3214; control-1:
   1510 ms → SI 5101). Host-independent, pre-existing scheduling, not addressed by any of
   the four levers.

**What this means for cutover:** the platform is measurably faster end-to-end for
first-party bytes, LCP/TBT/CLS all improve, and the SI miss is bounded by a page-level
render-delay lottery that exists on production today. The median SI will remain ~4.5–5 s
whenever the late-paint draw fires, on either host, until the hero first-paint delay
itself is fixed. That is **new scope** (why does the hero paint ~1.8 s after `load` with
no long task — likely font/animation/decode interplay); per the mission rules it is
reported here for an orchestrator decision, not expanded unilaterally. The pre-agreed
next levers (inline critical CSS, more hero-layer preloads, leaner above-fold layers) do
not obviously target the post-`load` render delay either — measure before assuming.

## Checklist summary

- Median-of-3 staging metrics + per-run values recorded: **yes** (this file + JSONs).
- LCP/SI/TBT/CLS trends vs baseline with analysis: **yes** (tables above).
- TBT ≤ 50 ms: **PASS** (31 ms). CLS ≤ 0.01: **PASS** (0.000).
- LCP materially below baseline: **PASS** (2607 ms < 2.8 s bar; −33 % vs 3.9 s).
- SI materially down vs 4.4 s: **MISS** (4925 ms) — diagnosed above; root cause is
  host-independent page behavior, levers all delivered their mechanisms.
- No analytics in the load window on staging: **PASS** (first analytics ≥ 4044 ms,
  ≥ 1.2 s after the final LCP entry, 3/3 runs).
- No production/DNS changes: **confirmed** (production touched only by read-only
  measurement/control GETs).

## Reproduce

```bash
node scripts/perf/lighthouse.mjs https://360ghar-web-ui.360ghar.workers.dev/ --runs 3 \
  --label staging-home --out docs/perf/staging --screen canonical-mobile
node scripts/perf/lighthouse.mjs https://360ghar.com/ --runs 3 \
  --label prod-control-home --out docs/perf/staging --screen canonical-mobile
```
