# Data pipeline and content correctness (Agent D)

Status: D1 done, D2 done, D3 done, D4 done. Checks are at the end.

## What the old site did, and what v2 has now

| Old script (360ghar-web-ui/scripts) | v2 script (scripts/data) | Output |
|---|---|---|
| `ingest-gurgaon-entities.mjs`, `ingest-ncr-entities.mjs` | `ingest-entities.mjs` (`--cities`) | `entity-raw.json` |
| `merge-entities.mjs`, `build-localities-json.mjs`, `build-localities-index.mjs` | `build-localities.mjs` | `entity-coverage.json`, `entity-duplicates.json`, `entity-unresolved.json`, `localities.json`, `localities-index.json` |
| `build-price-context.mjs` | `build-price-context.mjs` | `priceContext-generated.json`, `price-context-report.json` |
| `pseo-quality-check.mjs` | `pseo-quality-check.mjs` and `lib/pseo.mjs` | `pseo-quality.json` |
| `lib/entityNormalization.mjs`, `lib/paginatedApi.mjs` | `lib/entities.mjs`, `lib/paginatedApi.mjs` | none |
| `generate_localities.js` | not ported | see "Not ported" |
| `lib/localitySitemap.mjs`, sitemap scripts | not ported (Agent C) | none |

Extra files: `lib/schema.mjs` (shape checks for every file in `src/data`), `lib/diff.mjs` (row diff), `lib/cli.mjs` (flags, out dir), `fixtures/` (3 tiny sitemaps and the old prune list).

## How to run

Every script writes to a temp folder unless you pass `--out <dir>`. The default is `$DATA_OUT` or `os.tmpdir()/360ghar-data-out`. No script writes into `src/data` unless you pass `--write` (only `build-localities.mjs` has it).

```bash
# 1. Raw names. Offline by default: the rows already in src/data/localities.json only.
node scripts/data/ingest-entities.mjs [--cities gurgaon|all|delhi,noida] [--out DIR]
node scripts/data/ingest-entities.mjs --fixtures scripts/data/fixtures --cities all   # offline, from sitemap files
node scripts/data/ingest-entities.mjs --live --max-bytes 3000000 --delay 1500        # GET the sitemaps, one at a time

# 2. Merge and build the two files. Prints a diff against src/data.
node scripts/data/build-localities.mjs [--raw FILE] [--out DIR] [--today YYYY-MM-DD]
node scripts/data/build-localities.mjs --write [--allow-removals]   # copy into src/data

# 3. Price ranges from live listings (never writes src/data; merge by hand).
node scripts/data/build-price-context.mjs                        # offline: copies the curated file
node scripts/data/build-price-context.mjs --live --max-pages 1   # 10 GET calls, at most 100 listings each
node scripts/data/build-price-context.mjs --fixture listings.json

# 4. pSEO check (runs through Vitest, see below). Exit code 1 on an error.
node scripts/data/pseo-quality-check.mjs [--out DIR] [--prune FILE] [--strict]
```

Environment: `DATA_OUT` (out dir), `DATA_CACHE_DIR` (response cache, default `node_modules/.cache/360ghar-data`), `DATA_CACHE_DISABLED=1`, `API_ORIGIN` (API for the price script, default `https://api.360ghar.com`).

Package scripts wanted (Agent C wires them): `data:ingest`, `data:build`, `data:price-context`, `check:pseo`. See the report.

### Rules the scripts follow

- GET only. Sources are read one at a time, `--delay` ms apart (default 1500). `--max-bytes` cuts each download (default 8 MB; a cut-off `.gz` still gives its first rows). Responses are cached for 12 h (sitemaps 24 h).
- `--write` (localities only) copies into `src/data` after three gates: the shape checks pass, no slug disappears (every slug is a live URL) unless `--allow-removals`, and the diff has been printed.
- No credentials are needed. The price script reads only public `GET /api/v1/properties`.

## D1 findings

1. The v2 `localities.json` equals the old `localities.json` minus six fields (`id`, `numericId`, `canonicalUrl`, `sourceCoverage`, `sourceUrls`, `confidence`), with the same key order. `build-localities.mjs` writes that shape. Proof: rebuilding from the old repo's `scripts/reports/entity-raw.json` (5,032 rows, the real June ingest) gives 3,215 rows, and the rows are equal to the v2 file except for the class of change below.
2. One class of difference, fixed on purpose: the old merge wrote "Gurgaon" into the copy of every row (title, keywords, description, overview text), and the search description used the lower case city (`delhi`). 17 rows in Delhi, Noida, Faridabad and Ghaziabad had this. The new merge uses the city of the row. These 17 rows were written into `src/data/localities.json` (fields `seo`, `description`, `contentBlocks` only; the v2 pages do not read them, and slugs, names, cities and `contentBlocks.nearby` are unchanged). Before: `Dwarka Gurgaon | properties | 360Ghar`. After: `Dwarka Delhi | properties | 360Ghar`. A copy of the file before the write is in the scratchpad (`data-out/localities.before-write.json`). `localities.json` now ends with a newline (it did not before); `localities-index.json` is byte for byte the same as before.
3. The old `canonicalUrl` used `{slug}-gurgaon` for every city. The merged file now uses `{slug}-{city}` (the v2 rule). It is not part of the v2 file.
4. `lastVerifiedAt` of seed rows is kept. The old script reset it to today on every run.
5. The old ingest read `.xml.gz` files as text, so magicbricks and nobroker always gave 0 rows. The new one gunzips them. When it did, both turned out to be search-result URLs today (`2bhk-flats-for-sale-in-x-gurgaon-prjtl`, `villas-projects-sector-57-in-gurgaon-nprid`), not project pages: about 15,000 junk names from a 300 KB sample of each file. Those sources are off by default (`off: true` in `SOURCE_URLS`), and a name filter drops such names even if you turn them on.
6. Live status of the upstream sources on 2026-09-29 (small sample, cached in the scratchpad):
   - commonfloor: HTTP 403 (503 with a browser user agent). The old June run got 1,585 rows.
   - squareyards sublocation: works, but the file no longer lists any Gurgaon page (8,106 links: Ghaziabad 229, Noida 289, Delhi 55, Faridabad 108, other cities 7,425). The location file is city level.
   - magicbricks, nobroker: see 5.
   So a live ingest gives 0 new Gurgaon rows today. The useful run is offline: rebuild from the seed (proves the pipeline) or from fixtures. To grow coverage, the project needs a real source (HRERA project list, or the backend), not these sitemaps. Squareyards names now lose the "projects in" prefix (the old script kept it; see finding 8).
7. Bug fixed in the loader: `resolveLocality('antriksh-gurgaon')` returned null for the 235 entries whose slug itself ends in `-gurgaon`, because the loader cut the suffix before it looked the slug up. It now tries the slug as it is first (test in `data.test.ts`).
8. Content problems in `localities.json` (reported, not changed, since every slug is a live URL):
   - 462 entries are named "projects in ..." (444 localities). They come from squareyards page titles. 457 have a plain twin ("dlf phase 1"). Helper: `isScrapedName` in `src/features/localities/data.ts`.
   - 710 entries were made up by the old seed script `generate_localities.js` (loops over sector numbers and random adjective plus noun names "to reach 1000+"): 100 "Housing Board Colony Sector N", 100 "HUDA Sector N", 39 "RWA Sector N", 156 "Block A-D Sector N", 115 "Sector N Extension", 200 "Royal Apartments Sector N" style names. No source backs them. Helper: `isGeneratedSeed`. The count is asserted in `data.test.ts`.
   - Together 1,172 of 3,215 pages (36 percent) are duplicate or unverified. All are in the sitemap (`feeds/data.ts` lists every locality). Suggested decision for the owner: `noindex` and drop from the sitemap for both helpers, then 301 the scraped ones to their twin. Agent C owns the sitemap.

## D2 findings (pSEO check)

- `scripts/data/pseo-quality-check.mjs` starts `scripts/__tests__/pseo-quality.gate.test.mjs` with Vitest, because the v2 landing model and copy are TypeScript with `@/` imports. (Starting a Vite server from a plain script would touch `node_modules/.vite`, which the dev server uses.) Same run without the wrapper: `npx vitest run scripts/__tests__/pseo-quality.gate.test.mjs`. The rules are pure functions in `lib/pseo.mjs` and are unit tested with fakes (`pseo.test.mjs`).
- Result on the real code and data: 580 landing pages (5 cities x buy, rent, pg x types, plus 1 to 4 BHK and budget facets), both languages. 0 errors, 91 warnings. 313 pages are indexable, 267 noindex.
- Checks: title and description length (old minimums 30 and 80; new maximums 70 and 260 as warnings), empty heading, unfilled template slots, at least 3 FAQs, duplicate title, description, heading or FAQ set across pages, price context for the city and intent (the page shows the type range or the `default` one), type notes in `landingTypeContext.json`, v2 `isIndexable` compared page by page with a written-out copy of the old indexation policy, the old prune list, and locality shape (`lib/schema.mjs`).
- Warnings: 60 base pages have no type notes; 25 pages fall back to the city default range (`office`, `shop`, `plot`); 4 titles are longer than 70 characters; localities as in D1 finding 8.
- Prune list: v2 needs no prune list. The 12 old entries are covered: 5-BHK facets of villas and plots are `noindex` (`isIndexable` allows 1 to 3 BHK only), and `/pg/<type>` for non-flat types redirect 301 to `/pg/flats`, `/land` redirects to `/plots` (`lib/redirects.ts`). The old list was only used by the old sitemap script. So nothing was added to the landing loader. Old indexation policy: implemented in v2 (`model.ts` `isIndexable`), no delta found.

## D3 celebrity homes

- Live check on 2026-09-29: `GET /api/v1/blog/posts?limit=100` returns 20 posts, none about a celebrity. `GET /blog/posts/{slug}` for the 16 card slugs: 16 times 404. Search `q=celebrity` returns nothing.
- The 16 places are Mumbai, Hyderabad, Chennai, Fazilka, Vadodara, Shimla, New York and Turin. 360Ghar has no listing and no place page for any of them (localities are NCR only), so a link to a search or a locality would not be honest.
- Decision: no card links. The page already linked a card only if its post exists at build time, and said so in a note. This round moved the card logic into `celebrityCards()` (data.ts) so it can be tested, and the page renders from it. Cards without a post are plain text: no arrow, no hover colour. The note above the list says the case studies are not published yet. When a post is published, a rebuild makes its name a link.
- Tests (`celebrity.test.ts`): 16 unique slugs; no link when no post; only published cards link; every possible link matches a route pattern read from `src/pages` (English and `/hi`); the page source has no `href` other than the case-study link. E2E (`tests/e2e/data-parity.spec.ts`, not run): every link on the list returns 200 and the other names are not links.
- The block "Top celebrity real estate localities" lists which star lives where. It is old content and the API cannot back it. Left as it was. Flag for the owner.

## D4 zone checker

- Live check on 2026-09-29: `GET /api/v1/data-hub/zoning?limit=100` returns 8 rows, not 0 (`docs/inventory.md` and `docs/backend-gaps.md` D6 say the table is empty; update them). Sectors 1, 4, 5, 7, 9, 9A, 10 and 10A, all `residential`, with `far_limit`, `max_height_m` and `max_coverage_pct`. `permitted_uses`, `prohibited_uses` and `source_url` are null in every row. `GET /zoning/sectors` returns the same 8 names. `GET /zoning/gurugram-sector-1-residential` returns 200, `GET /zoning/no-such` returns 404.
- Code read (no server started): the list route passes the page to the island, the detail route uses `validSlug`, `safe(zone(slug))` and `settle` (404 for missing, 503 for API errors, no cache for errors). Rows render with real field names. The detail page shows only fields the API returns. No bug found in the render path.
- Changes: (1) both empty states (no zoning data, or no match for a searched sector) now also link to RERA projects and Verify ownership, next to the existing circle rates link. (2) The hub links list on the page now includes Verify ownership. (3) The detail page description no longer prints "N/A" for a missing field.
- Backend data needed: zoning rows for the other sectors (only 8 sectors exist today), plus `permitted_uses`, `prohibited_uses` and `source_url` so that the detail page can cite DTCP Haryana. The page says plainly that only a few sectors are covered.

## Not ported

- `generate_localities.js`: not used by any npm script, writes to a path that does not exist (`../frontend/src/data`), uses `Math.random`, and is the source of the 710 made-up entries above. Do not run it again.
- Sitemap parts of `localitySitemap.mjs`: Agent C.
- `locality-landing-crossref.json`: the old index script also wrote it. v2 does not read it, so it is not built.

## Tests

`scripts/__tests__/`: `entity-normalization.test.mjs`, `api-pagination.test.mjs` (both ported from the old repo and extended), `data-schema.test.mjs` (every file in `src/data` against its loader), `data-pipeline.test.mjs` (offline pipeline, fixtures, diff, price context), `pseo.test.mjs`, `pseo-quality.gate.test.mjs`. `vitest.config.ts` already includes `scripts/**/*.test.mjs`, so no config change was needed. Other tests: `src/features/localities/data.test.ts`, `src/features/content/celebrity/celebrity.test.ts`.

# Thin localities: noindex, delist, 301 (Agent D2, 2026-09-29)

Owner decision 2026-09-29 ("fix them all"): the 1,172 thin rows (462 scraped "projects in X", 710 seed-invented; no overlap) are noindex, out of the sitemap, not listed or linked, and the scraped ones with a real twin 301 to it.

## Real counts

| Item | Count |
|---|---|
| Rows in `src/data/localities.json` | 3,215 |
| Scraped (`isScrapedName`) | 462 |
| Seed-invented (`isGeneratedSeed`) | 710 |
| Overlap | 0 |
| Thin (`isThinLocality`) | 1,172 |
| Listed (`LISTED_LOCALITIES`) | 2,043 |
| Sitemap paths (`sitemap-localities`) | 6,039 (was 9,555; 3,516 removed), 12,078 URLs with `/hi` |
| Scraped rows with a real twin (same city, same name after "projects in ") | 289 |
| Scraped rows without a twin | 173 (noindex only) |
| Keys in `src/data/locality-redirects.json` | 434 |

Correction to D1 finding 8: it said 457 (and elsewhere 139) scraped rows have a plain twin. A strict match (same city, same name, twin is not itself thin) gives 140. Three small normalisations raise it to 289 and are safe: a trailing city word ("projects in mg road gurgaon" is "mg road"), roman numerals after "phase" ("dlf phase iv" is "dlf phase 4"), and prefer the row whose slug equals the name when several rows share a name (10 cases, for example `mg-road` over `mg-road-road`). The other 173 are places the data has no real row for (Manesar sectors, Farukh Nagar, villages, "central gurgaon"). They stay 200 with noindex; a real source (HRERA, backend) would be needed to give them a page worth indexing.

## What changed

- `src/features/localities/data.ts`: `isThinLocality(row)` (= scraped or seed), `isNoindexLocality(row | null)` (unknown or thin), `LISTED_LOCALITIES` (non-thin rows). `ALL_LOCALITIES` is now used only inside `data.ts` (a test guards this) so a list or link cannot pick a thin row by accident. `nearbyLocalities` skips thin rows. Every page still resolves (`resolveLocality` is unchanged).
- Noindex: `src/pages/locality/[slug].astro` and `LocalityIntentPage.astro` pass `noindex={isNoindexLocality(l)}` (the `/hi` copies were regenerated with `node scripts/sync-hi-routes.mjs`). `Seo.astro` then writes `noindex,follow` and no canonical or hreflang. Status stays 200.
- Sitemap: `localityEntries()` in `src/features/feeds/data.ts` iterates `LISTED_LOCALITIES`, so `/locality/:slug`, `/buy` and `/rent` (and the `/hi` twins, which `xml.ts` adds) skip thin rows.
- 301: `src/data/locality-redirects.json` is built by `scripts/data/build-locality-redirects.mjs` (pure logic in `scripts/data/lib/locality-redirects.mjs`). Dry run by default; `--write` writes; `--all` lists every pair and the rows without a twin. It refuses to write when a target is missing or thin, equals its source, a chain or loop exists, or a key does not resolve to a thin row. The map has one key for every slug form the page accepts (`x-gurgaon`, bare `x`, and `x-gurgaon-gurgaon`), so a request is one hop. Package script: `pnpm data:locality-redirects` (needs Node 22.18+ type stripping: it imports the thin predicate from `src/lib/seo/aiDiscovery.ts`, so there is no third copy of the regexes).
- Lists and links now on `LISTED_LOCALITIES`: localities directory (A to Z, type counts, JSON-LD ItemList, the count in the title and description), `listedPlaces()` in `live.ts` (directory "listed now", city hub, locality page fallback), city hub top list, project page place link, RSS `localities` feed, nearby lists (via `nearbyLocalities`), price index place list (`PriceIndexPage.astro`, filters with `isThinLocality`), AI feed.
- Counts: the directory shows 2,043 (computed). `site.json` footer/explore link "All 3,000+ localities" is now "All 2,000+ localities" (en and hi). The AI feed `metadata.total_localities` is 2,043 (`llm-feed.json` regenerated; only that line changed, `llms.txt`, `llms-full.txt`, `ai.txt`, `api-catalog` are unchanged).

## Tests

`src/features/localities/data.test.ts` (predicate over all 3,215 rows: 462, 710, no overlap, 1,172 thin, 2,043 listed; noindex flag; nearby lists; source guard for `ALL_LOCALITIES`), `live.test.ts` (no thin row in `listedPlaces`), `src/features/feeds/feeds.test.ts` (sitemap has no thin path, exactly 6,039 paths), `src/lib/redirects.test.ts` (scraped slug under `/hi`, with a query string, upper case, trailing slash, unknown intent word, bare slug forms, no chain, unrelated routes untouched), `scripts/__tests__/locality-redirects.test.mjs` (map equals the script output, every target exists and is not thin, no chain or loop or self, every scraped row with a twin is covered under every slug form, one hop through `legacyRedirect` for all 434 keys in both locales, twin matching, the checks refuse bad maps, the aiDiscovery copy agrees with `data.ts`), `data-schema.test.mjs` (new file listed), `src/lib/seo/aiDiscovery.test.ts` (combined predicate, feed counts). E2E appended to `tests/e2e/data-parity.spec.ts` (not run).

## How to undo

- Stop the redirects: delete entries (or all entries) in `src/data/locality-redirects.json`. `redirects.ts` reads it as a plain map. The test "is what the script builds" then fails on purpose; re-run `pnpm data:locality-redirects --write` for the full map or update the test.
- Stop the noindex, delisting and list filtering: make `isThinLocality` in `data.ts` return `false`. Then `LISTED_LOCALITIES` is all 3,215 rows and the sitemap returns to 9,555 paths. Update the count tests (2,043, 6,039, 1,172) and re-run `pnpm ai:discovery --write`.

## Not fixed here (files outside the ownership)

- `src/features/home/load.ts` line 12: `LOCALITY_TOTAL = 3215`, used at `HomePage.astro:228` (`c.allPlaces(num(localityTotal))`) and in `facts.ts` ("N locality and project pages"). The link goes to `/localities`, which now lists 2,043. Change to 2043 (`data.test.ts` here accepts either number). `src/features/home/facts.test.ts` has 3215 as test input only.
- `src/features/property/nearby.ts` `localityPath()`: looks up the listing's locality name in `localities-index.json` and links `/locality/{slug}-gurgaon`. It can return a thin row only when a listing's locality is named exactly like a scraped or seed row (checked on 2026-09-29 against the first 100 live listings, 13 localities: no match). A thin match should return null (use `isThinLocality` on the index entry).
- `tests/e2e/places.spec.ts` line 10 and `tests/e2e/core.spec.ts` line 78 say "all 3,215 places" in comments only.
