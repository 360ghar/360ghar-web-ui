# Hero first-paint render delay: mechanism identified — it is the measurement harness, not the page

Investigated 2026-11-02 (`hero-render-delay-investigation`, user-approved bounded fix attempt).
Question from `docs/perf/staging.md`: why does `towersFar.svg` (fetched by ~700 ms) often
paint ~1.8 s **after** `load` with an idle main thread — on staging, on pre-mission
production, and on the same-hour production control alike?

**Answer: the page was never the problem.** The delay is a nondeterministic
**presentation blackout inside headless Chrome's mobile screen emulation**
(`Emulation.setDeviceMetricsOverride` with `mobile: true`) on this machine. With that
override the headless tab skips the paint stage entirely, delivers no animation frames,
and presents no frames until Lighthouse's full-page screenshot forces one
(`networkIdle` + ~650 ms). With the override absent, the identical page paints and
presents at **~645-745 ms, deterministically**. All the "render-delay lottery" numbers
(first paint 772-2585 ms, LCP render delay 86-2000 ms, the 6282 ms baseline outlier)
are draws from this harness artifact.

## Trace-level evidence (hero-run1/2/3, staging URL, canonical `--screenEmulation.mobile`)

Raw artifacts: run reports and summaries are committed here; the full trace files
(`hero-run{1,2,3}-0.trace.json` + `*-0.devtoolslog.json`, ~45 MB, from the earlier
session's `--save-assets` runs) stay on disk uncommitted, with run 1's trace pair also
committed compressed (`hero-run1-0.trace.json.gz`, `hero-run1-0.devtoolslog.json.gz`);
regeneration command at the bottom.

All three runs show the identical signature (timestamps from run 1):

1. **Style and layout run normally, paint never starts.** HTML committed at 340 ms,
   CSS at ~550 ms; first `UpdateLayoutTree` 511 ms, `Layout` 512 ms — then **zero
   `PrePaint`/`Paint` events until 1501 ms**. Blink runs layout for a page it cannot
   present, and skips the paint stage — the classic hidden-page signature.
2. **The reveal event fires late and nondeterministically.** `EventDispatch
   type=pagereveal` at **1500.1 ms** (site has no view transitions; this is the native
   first-reveal event), followed by the first paint task (26 ms) at 1500-1526 that
   paints all 20 diorama layers, commit 1525, layer-tree activation 1534.8. A burst of
   `resize` events lands at 1526.3-1526.7 — the emulated metrics finally being adopted.
3. **Animation frames are withheld.** A `RequestAnimationFrame` scheduled at 1526.9
   fires at **2516.8 ms** (990 ms later; same stall in run 2/3). Idle callbacks
   scheduled at ~890 ms fire at 2519 — so hydration/analytics idle work also queues
   behind the blackout. The diorama's compositor animations cannot help: commits do not
   present either (a mid-blackout commit at 1935.7 never presents).
4. **The display compositor presents nothing.** Per-presented-frame `Screenshot` trace
   events: one at trace start (~10 ms, the old surface), then **nothing until 2527**,
   then one every ~16.6 ms forever. `VizCompositorThread` has zero tasks >0.5 ms in the
   whole [0, 2517] window. Renderer main-thread busy time in [DCL, firstPaint]: 42-63 ms.
5. **The blackout ends when Lighthouse forces a frame.** At 2516.4 the compositor does
   `RequestMainThreadFrame` (Lighthouse's full-page-screenshot pass, which the
   devtools log places at `networkIdle` + ~650 ms), the queued rAF fires, the Cloudinary
   lazy images paint (they finished fetching ~1 s earlier), the frame presents at
   **2524.8 = recorded FCP/LCP**, and the screenshot is captured at 2527.1. FCP was
   never a paint-metric here — it was the screenshot-scheduling clock.

Lantern then carries the late observed paint into the simulation: late draws → simSI
4427-4941; the lucky early draws (same override, window revealed before the forced
screenshot) → simSI 2940-3791. That is the whole "lottery".

## Isolation matrix (single runs, staging URL, 2026-11-02 evening)

| Emulation | obsFCP | simSI | Verdict |
|---|---|---|---|
| mobile FF, `--screenEmulation.mobile` (canonical protocol) | 2525/2531/2536 (3 saved traces) + 2547 w/ `--window-size=412,823` + 2574 w/ dsf=1 | 4494-4961 | **blackout** |
| desktop FF, default (1350x940, dsf 1, mobile:false) | **745** | 2582 | presents |
| desktop FF, `mobile:false`, **412x823, dsf 1.75** | **745** | 2581 | presents — size+dsf exonerated |
| mobile FF, `--screenEmulation.disabled`, window 412x823 | **645** | 2281 | presents — mobile UA still applied |

Size and deviceScaleFactor are irrelevant; the trigger is `mobile: true` in the metrics
override (or its companion touch-emulation), on Chrome 156 `--headless=new` on this Mac.
The nondeterministic ingredient is *when the headless tab is revealed relative to the
forced screenshot* — not anything on the page (proven identical behavior on staging,
pre-mission production build, and same-hour production control).

## Fix: measurement protocol, not page code

The page already paints as fast as the network allows (645-745 ms observed; the four
mission levers delivered further on top). Any page change to "fix" a blackout that
withholds frames regardless of content would be superstitious. The minimal,
zero-visible-change fix is in the runner: `scripts/perf/lighthouse.mjs` now defaults to
`--screen faithful` (no metrics override, headless window pre-sized 412x823, mobile UA
kept, CPU/network simulation untouched) and keeps `--screen canonical-mobile` for
comparability with the baseline-era tables.

**No staging redeploy was made**: zero page/build changes, so a redeploy would only
bump the Worker version and reset the version-partitioned edge cache ahead of
measurement. Staging serves the same version as `docs/perf/staging.md`.

## Re-measured medians (median of 3, faithful protocol, same hour, edge warmed)

| Metric | Staging (levers) | Prod control (pre-lever Netlify) | Bar | Verdict |
|---|---|---|---|---|
| Perf score | **98** | 97 | ≥ 99 production target | close, see cutover note |
| FCP | 1770 ms | 1769 ms | — | flat |
| LCP | **2057 ms** | 2327 ms | < ~2.8 s | PASS (−12 % vs control) |
| Speed Index | **2542 ms** | 3320 ms | ≤ ~3.5 s target | **PASS** (−48 % vs the 4925 canonical median; −23 % vs control) |
| TBT | **10 ms** | 20 ms | ≤ 50 ms | PASS |
| CLS | 0.001 | 0.002 (run 1 blipped 0.09) | ≤ 0.01 | PASS (staging blip-free) |

Per-run staging: 95/2618/2972/21/0.001, 98/2056/2542/10/0.001, 98/2057/1770/1/0.001.
Raw: `docs/perf/hero-delay/staging-faithful-home.{run1..3,summary}.json`,
`prod-control-faithful-home.{run1..3,summary}.json`. LCP element is still
`layer-towersFar` with discovery score 1 (preloads intact). Production was not modified.

## Notes for the orchestrator (decisions, not blockers)

- **Protocol canonization**: `mission AGENTS.md` still documents the canonical flags as
  `--screenEmulation.mobile`. Recommend switching the contract protocol to the faithful
  mode (or re-running the final cutover validation in both modes). All pre-hero-delay
  tables (baseline.md, staging.md) are canonical-mode numbers and stay comparable only
  within their mode.
- **PSI fidelity caveat**: if PageSpeed's mobile lab runs hit the same override-blackout
  on their fleet, external PSI SI will read higher than local faithful SI for reasons
  that are again not page-caused. The anonymous PSI API is dead (429) and no key is
  available, so this could not be checked from here. The user's final
  pagespeed.web.dev check is the arbiter.
- The score 98 vs the 99+ bar: under the faithful protocol the remaining gap is
  dominated by the below-fold lazy-image flush term, not the hero. Pre-agreed next
  levers (inline critical CSS etc.) apply only if the cutover validation wants the last
  point; do not relitigate here.

## Reproduce

```bash
# trace evidence (the committed compressed pair matches hero-run1):
node scripts/perf/lighthouse.mjs https://360ghar-web-ui.360ghar.workers.dev/ --runs 3 \
  --label staging-faithful-home --out docs/perf/hero-delay
# canonical-mode comparison (expect the lottery back):
node scripts/perf/lighthouse.mjs https://360ghar-web-ui.360ghar.workers.dev/ --runs 3 \
  --label staging-canonical-home --out docs/perf/hero-delay --screen canonical-mobile
# raw traces for anatomy (lighthouse CLI directly):
CHROME_PATH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
  npx --yes lighthouse@13.6.0 <URL> --only-categories=performance --form-factor=mobile \
  --screenEmulation.mobile --chrome-flags="--headless=new" --output=json \
  --output-path=docs/perf/hero-delay/hero-runN.json --save-assets --quiet
node scripts/perf/trace-hero.mjs docs/perf/hero-delay/hero-runN.json
```
