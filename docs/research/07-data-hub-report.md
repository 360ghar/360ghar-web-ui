## Data hub: final report

All 17 routes work in English and at `/hi/*`, and every check passes. The sitemap helper is done and tested.

**Routes**
- **Server-rendered with CDN cache:** `/circle-rates`, `/circle-rate/:slug`, `/rera-projects`, `/bank-auctions`, `/bank-auctions/:id`, `/auction-sources`, `/zone-checker`, `/zone-checker/:slug`, `/regulatory-updates`, `/builder-reputation`, `/builder-reputation/:slug`.
- **Prerendered:** `/stamp-duty-calculator`, `/verify-ownership`, `/builder-reputation-score`, `/tenant-demand-heatmap`, `/best-sectors-investment-2026`, `/price-index/:citySlug` (5 cities).
- Unknown slugs and ids return a real 404. A backend failure returns 503 with a short cache.
- Code is in `src/features/data-hub/`. Routes are in `src/pages/`.

**Checks**
- `pnpm typecheck`: 0 errors, 0 warnings. `pnpm lint`: 0 problems. `pnpm test`: 193/193, including 17 new tests in `format.test.ts` and `sitemap.test.ts`.
- `tests/e2e/data-hub.spec.ts`: 66/66 passed on phone, tablet and desktop. It covers every control, "Load more", detail pages, axe, horizontal scroll, backend-down states and 404s.
- 36 screenshots (360 and 1440 px) are in `docs/screenshots/data-hub/`. I checked each one by eye and against the design law. No page scrolls sideways.

**Sitemap:** `src/features/data-hub/sitemap.ts` exports `datahubEntries()` (and `datahubSitemap()` with a `skipped` list). It uses the same slug and id rules as the routes, caches for 6 hours with `memo`, and never throws. A live run gives 455 entries: 17 fixed pages, 183 circle rates, 247 auctions, 8 zones, 0 builders.

**Features not kept**
- The "illustrative" trend charts: their numbers were invented.
- The RERA `property_type` filter and the auction sorting: the backend ignores them.
- FAQs are in English on `/hi` pages, as on the old site. Long explanatory text is shorter.
- On bank auctions, the property type is not shown on cards. It contradicts the description on 55 of the first 100 rows.

**Backend gaps not in `docs/backend-gaps.md`**
1. The circle-rate `sector` filter matches substrings (`circle_rates.py:47`): `?sector=Sector 1` returns 30 rows from 10 sectors. The page now keeps only exact matches. The stamp-duty rate lookup has the same problem.
2. List endpoints page by offset with no ORDER BY (circle rates, RERA, auctions, zoning, colonies). Rows can repeat or be skipped between pages, so the page removes repeats.
3. `/builders` returns 0 rows because `developer_slug` is null on every RERA project. As a result, every builder page is a 404.
4. `/gazette?type=bogus` returns 500 instead of 422. The page now ignores unknown types.
5. The auction source counts cover bank rows only, so DRT shows 0 although 10 court auctions exist.
6. Data quality:
   - Every auction date is in the past; the latest is 2026-06-05.
   - 15 of 30 RERA projects have more units booked than total units.
   - The city and bank lists contain the same place or bank under two names ("Gurgaon" and "Gurugram", "PNB" and "Punjab National Bank").

**Shared-file changes I propose**
- The chat launcher, which is fixed at the bottom right, covers links and fails axe `target-size` after scrolling. It needs bottom padding or a collapsed form.
- `Breadcrumbs.astro` shows a middle crumb without a path as the current page.
- Old Delhi stamp-duty rates were swapped (4% for men, 6% for women). I corrected them to 6% for men and 4% for women. Please confirm.