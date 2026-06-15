# Speed Audit — Performance Results

**Branch:** `perf/speed-audit`
**Baseline date:** 2026-06-15
**Source:** PageSpeed Insights mobile report (`seikwbf5r5`), real-user CrUX data

## Baseline Core Web Vitals (mobile, real-user)

| Metric | Value | Target | Status |
|--------|-------|--------|--------|
| TTFB | 2.3s | ≤ 0.8s | 🔴 FAIL (44% poor) |
| FCP | 4.0s | ≤ 1.8s | 🔴 FAIL (47% poor) |
| LCP | 4.8s | ≤ 2.5s | 🔴 FAIL (39% poor) |
| CLS | 0.01 | ≤ 0.1 | 🟢 PASS |

## Baseline asset sizes

### Images — `public/assets/images/thumbs/`
- 112 PNG files, ~27 MB (many are 600 KB – 2.2 MB each)
- 92 WebP files (twins already exist with ~80–95% savings, not referenced)
- 1 AVIF file (format not served anywhere)

Top PNG offenders → existing WebP twin (savings):

| File | PNG | WebP | Reduction |
|------|-----|------|-----------|
| project-details | 2224 KB | 256 KB | 88% |
| testimonial-img | 1916 KB | 76 KB | 96% |
| message-img | 1600 KB | 76 KB | 95% |
| user-img1 / team1 | 1560 KB | 84 / 56 KB | 94–96% |
| property-details-1 | 1456 KB | 116 KB | 92% |
| banner-two-filter-bg | 1028 KB | 72 KB | 93% |
| newsletter-bg | 840 KB | 36 KB | 96% |
| logo/logo | 928 KB | 280 KB | 70% |

### Bundles (`dist/assets/`, from exploration)
- `index` (main app): 647 KB raw / 125 KB brotli
- `localities-data`: 4.0 MB raw / 156 KB brotli (lazy-loaded ✓)
- `localities-index`: 464 KB raw (statically imported into landing pages ✗)
- `index.es-*`: 152 KB orphan chunk (unidentified)
- `index-*.css`: 247 KB raw / 35 KB brotli (deferred ✓)

---

## Results by workstream

(Filled in as each workstream lands.)

### Workstream 1 — Image system overhaul
_Pending._

### Workstream 2 — Bundle / data loading
_Pending._

### Workstream 3 — Hot code paths
_Pending._

### Workstream 4 — Fonts / CSS / preload
_Pending._

### Workstream 5 — Cloudflare edge caching
_Pending._
