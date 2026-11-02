# Pre-mission performance baseline (mobile)

Measured 2026-11-02, **before** any mission change (pre-mission production `360ghar.com`).
This file is the regression reference for VAL-REG-001/002/003 and the "before" column for
VAL-PERF-001..005: the post-cutover bar is **median ≥ baseline − 1 point** per page
(the regression rule, applied per page), plus the absolute targets
(score ≥ 99, LCP ≤ 2.5 s, SI ≤ 3.5 s) on the homepage.

## Engine and protocol

- Local Lighthouse **13.6.0**, `--only-categories=performance`, `--form-factor=mobile`,
  screen mode **canonical-mobile** (runner flag `--screen canonical-mobile`, which passes
  `--screenEmulation.mobile` — the pre-2026-11-02 protocol), headless (`--headless=new`),
  Chrome at `/Applications/Google Chrome.app`. Same engine as PageSpeed; anonymous PSI API is
  quota-dead (429, `quota_limit_value: 0`) and is never used.
- ⚠️ The runner now **defaults to `--screen faithful`** (trace proof of why:
  `docs/perf/hero-delay.md`). Every command that extends or reproduces THIS table must pass
  `--screen canonical-mobile` — omitting it measures the faithful protocol and produces
  non-comparable numbers.
- **Median of 3 fresh runs** per page (score contract). Raw JSON per run and a computed
  median summary live in `docs/perf/baseline/` (`<label>.run<i>.json`, `<label>.summary.json`).
- Runner: `node scripts/perf/lighthouse.mjs <URL> --runs 3 --label <name>
  --screen canonical-mobile` (serialized runs; never two Lighthouses at once).
  `pnpm perf:lighthouse -- <URL> --screen canonical-mobile` is the same thing.
- Machine/network caveat: runs come from one local connection, so absolute values include
  that environment's variance (see run spreads below); medians are the contract numbers.

## Baseline page set (exact URLs)

| # | Label | URL | Why this page |
|---|---|---|---|
| 1 | home | `https://360ghar.com/` | Optimization target (mission homepage levers) |
| 2 | properties | `https://360ghar.com/properties` | Main listing index; must not regress |
| 3 | locality | `https://360ghar.com/locality/palam-vihar-gurgaon` | First locality card linked from the homepage "Where the homes are" section |
| 4 | detail | `https://360ghar.com/property/118` | First property detail linked from the homepage (the lead home) |

All four returned HTTP 200 at measurement time.

## Medians (3 runs each)

| Page | Perf score | FCP | LCP | Speed Index | TBT | CLS |
|---|---|---|---|---|---|---|
| `/` | **95** | 1791 ms | **2622 ms** | **3591 ms** | 17 ms | 0.001 |
| `/properties` | **94** | 1733 ms | 2666 ms | 3703 ms | 2 ms | 0.001 |
| `/locality/palam-vihar-gurgaon` | **92** | 1771 ms | 3008 ms | 3994 ms | 3 ms | 0.001 |
| `/property/118` | **95** | 1712 ms | 2676 ms | 3575 ms | 2 ms | 0.001 |

### Per-run spread

| Page | Scores | LCP (ms) | Speed Index (ms) |
|---|---|---|---|
| `/` | 72 / 95 / 96 | 6282 / 2622 / 2300 | 5241 / 2940 / 3591 |
| `/properties` | 95 / 93 / 94 | 2487 / 2814 / 2666 | 3552 / 3842 / 3703 |
| `/locality/…` | 92 / 96 / 74 | 3008 / 2457 / 5917 | 3994 / 3323 / 4913 |
| `/property/118` | 94 / 95 / 95 | 2676 / 2716 / 2451 | 3603 / 2991 / 3575 |

Run-to-run variance is real (two outlier runs at score 72–74 with LCP > 5.9 s); the
median absorbs it. Near a 99 target, compare medians, never single runs.

## LCP elements at baseline

| Page | LCP element | LCP discovery score |
|---|---|---|
| `/` | `<img class="layer layer-towersFar" … src="/diorama/towersFar.svg?v=dfb61987" …>` | **0** (no priority hint → discovery delay) |
| `/properties` | Cloudinary card image (`f_auto,q_auto`, `fetchpriority="high"`, eager) | 1 |
| `/locality/…` | Cloudinary card image (`loading="lazy"` at baseline) | 0 |
| `/property/118` | Cloudinary gallery photo 1 (`fetchpriority="high"`) | 1 |

The homepage LCP is the hero diorama layer `towersFar.svg` with **discovery score 0** —
the exact lever `hero-lcp-priority` addresses. Baseline homepage TTFB (root doc) was
measured at ~600 ms in the mission research (double CDN hop + SSR function); the
VAL-PERF-005 warm-edge bar is ≤ 300 ms post-cutover.

## Reading the numbers for the mission

- Score gap to 99+ is carried by **LCP** (2.6 s median, one 6.3 s outlier run) and
  **Speed Index** (3.6–4.0 s). TBT (≤ 17 ms) and CLS (0.001) are already maxed and must
  not regress (VAL-PERF-004 bar: TBT ≤ 50 ms, CLS ≤ 0.01).
- `/properties`, locality and detail pages sit at 92–95 with LCPs of ~2.5–3.0 s; the
  mission must keep their medians within 1 point of the table above.
- These are **pre-mission production** numbers. Dev-server Lighthouse runs are not
  comparable and are never asserted (user-testing protocol).

## Reproduce

```bash
node scripts/perf/lighthouse.mjs https://360ghar.com/ --runs 3 --label home \
  --screen canonical-mobile
# → docs/perf/baseline/home.run{1..3}.json + home.summary.json (median + per-run table);
#   --screen canonical-mobile is REQUIRED here — the committed baseline is canonical-mobile
#   and the runner default (faithful) would overwrite it with the other protocol
node scripts/perf/lighthouse.mjs <URL> --runs 3 --label <name> \
  --screen canonical-mobile --resummarize
# → recompute summary.json from existing run JSONs without re-running the browser
```
