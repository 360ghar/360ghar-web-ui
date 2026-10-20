# SEO, ops scripts and CI (Agent C)

Progress log. Update after each task so work can resume.

## Status

| Task | Status |
|---|---|
| C1 Sitemap hreflang and Hindi URLs | DONE (see C1) |
| C2 Site-wide JSON-LD | DONE (see C2) |
| C3 Duplicate routes to 301 | DONE (see C3) |
| C4 AI-discovery generator | DONE (see C4) |
| C5 Ops scripts | DONE (see C5) |
| C6 CI workflows | DONE (see C6) |

## C1 Sitemap hreflang and Hindi URLs

Finding: `src/features/feeds/xml.ts` already wrote `xmlns:xhtml`, the `/hi` `<url>` entries and en / hi / x-default alternates for every entry. Nothing to add for the shape. Its shape matches the old `public/sitemap-static.xml`.

Added:
- Paging. `urlsetPages()` splits a list into files under 45,000 URLs and 45 MB. An English URL and its Hindi URL never split, so alternates stay in one file. `sitemap-<name>-2.xml`, `-3` and so on are served by `src/pages/sitemap-[name].xml.ts`. `/sitemap.xml` (now async) lists every page. Page 1 keeps the plain name. If a list fails or takes over 8 s the index lists it as one page.
- Today no list needs paging. Localities: 9,555 paths = 19,110 URLs = 10.5 MB in one file.
- `robots.txt` still lists the base names plus the index. Extra pages are found through the index.
- Tests in `src/features/feeds/feeds.test.ts`: namespace, en/hi/x-default on every URL, reciprocity (toy data and the real localities list), canonical path shape, no duplicates, no noindex or removed routes, fixed pages resolve to a route file that does not set `noindex`, page splitting by URL and byte count, name parsing, robots.txt and the sitemap list agree.
- `src/lib/seo/routes.ts` is a route table of `src/pages` (used by tests here and in C4).

## C2 Site-wide JSON-LD

`src/lib/seo/siteSchemas.ts` builds the blocks that `Seo.astro` emits on every page (not on `bare`):
Organization, WebSite, LocalBusiness, Person (founder), MobileApplication.

Decisions:
- KnowledgePanel is not a schema.org type. The old Organization-typed copy shared `@id` with nothing and duplicated the Organization. Its fields `knowsAbout`, `contactPoint` and the extra `alternateName` / `sameAs` values are merged into the Organization block. The validator rejects the type name.
- Speakable: the old site used a bare `SpeakableSpecification` block (invalid at top level) with `.speakable-summary` and `.speakable-highlights`. Those classes do not exist in v2. `Seo.astro` has a new opt-in prop `speakable: string[]` that emits a `WebPage` with `speakable`. `Content.astro` now sets it (see C7).
- Person: only real v1 data (`authors['saksham-mittal']`: name, title, bio, LinkedIn, credentials). The old image `/assets/images/thumbs/team1.webp` is not in `public/`, so no image. The old `sameAs` had the company Twitter under a person, dropped.
- MobileApplication: only the Play Store URL exists (`PLAY_STORE` in `nav.ts`). No App Store URL, so no iOS block.
- Person and MobileApplication reference the Organization by `@id`. The Organization references the founder by `@id`.

## C3 Duplicate routes to 301

- `/property-sidebar` to `/properties` and `/add-new-listing` to `/post-property` are in `EXACT` in `src/lib/redirects.ts`. Locale is kept (`/hi/...`).
- Deleted `src/pages/property-sidebar.astro` and `src/pages/add-new-listing.astro`. `scripts/sync-hi-routes.mjs` removes stale copies under `src/pages/hi/` (it deletes any file whose English source is gone). Ran it: the two `hi` copies are gone.
- New `redirectLocation(pathname, search)` in `redirects.ts` carries the query string. `src/middleware.ts` now calls it (one-line change, same behaviour, testable without the `astro:middleware` module).
- Removed the reference in `public/.well-known/ai.txt`. Updated `tests/e2e/post-property.spec.ts` ("old URLs redirect") because it expected 200.
- Prerendered files never pass through middleware, but both routes were deleted, so requests go to the on-demand path where the middleware runs.

## C4 AI-discovery generator

- Source of truth: `src/lib/seo/aiDiscovery.ts` (pure: `buildAiDiscoveryArtifacts({ priceContext, localitiesIndex, today })`). Script: `scripts/write-ai-discovery.mjs`, package script `pnpm ai:discovery`.
- Default is a dry run: output goes to a temp folder and a `diff -u` against `public/` is printed. `--write` overwrites. `--date` sets `metadata.last_updated` (default today).
- Diff of the first run against the old static copies (all intended):
  - `/hi/` became `/hi` (the old URL is a 301 in v2).
  - Locality URLs in the feed use `/locality/{slug}-{city}` (the bare slug is a 301).
  - Em dashes and curly quotes replaced with hyphens and straight quotes.
  - `/add-new-listing` left `ai.txt` (now a 301).
  - Nothing else changed: `api-catalog` is byte-identical. `--write` was run with `--date 2026-08-12`, the date already in the feed.
- `src/lib/seo/aiDiscovery.test.ts` checks every URL in the five generated files (as committed and as generated) and in the other `.well-known` files: same host URLs must have no trailing slash, must not 301 (`legacyRedirect`), must be a file in `public/` or match a route in `src/pages` (route table from `src/lib/seo/routes.ts`), and city, locality and landing segments must be real data. External hosts allowed: `api.360ghar.com`, `schemas.agentskills.io`, `*.supabase.co`. The test also asserts `llms.txt`, `ai.txt` and `api-catalog` equal the generator output. If `src/data/priceContext.json` or `localities-index.json` change, `llms-full.txt` and the feed need `pnpm ai:discovery --write` (they are not compared byte for byte, so this does not fail tests).
- The scripts load `.ts` modules with Node type stripping (`node --experimental-strip-types`, built in on Node 22.18+). The modules use only relative imports for that reason.

## C5 Ops scripts

| Script | Package script | Default | Notes |
|---|---|---|---|
| `scripts/indexnow-submit.mjs` | `seo:indexnow` | dry run | `--submit` to POST. Source: `--base` sitemap index (GET), `--file`, `--url`. `--include`, `--limit`, `--batch-size`, `--strict`. Checks the key file before a submit. The sitemap builders are not imported: they need Astro aliases and the API. |
| `scripts/validate-structured-data.mjs` | `seo:schemas` | validates site blocks and generator samples | `--url`, `--file`, `--strict`, `--quiet`. Exit 1 on errors. Shared module `src/lib/seo/validate.ts`. |
| `scripts/generate-og-image.mjs` | `seo:og-image` | writes to a temp file | Needs `sharp` (not installed: exit 3 with the install line). `--src` required (old source image is not in v2). `--write` replaces `public/og-image-home.jpg`. |
| `scripts/optimize-images.mjs` | `images:optimize` | dry run (lists files) | Needs `sharp` for `--write`. Uses file times, not the old hash manifest. |
| `scripts/gsc-audit.mjs` | `seo:gsc` | dry mode, no network | `--run` plus `GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY`, optional `GSC_SITE_URL`. JWT is signed with `node:crypto` (the old script needed `jsonwebtoken`). Crawl-errors call dropped (Google removed that API). |

Shared helpers: `scripts/lib/args.mjs`, `indexnow.mjs`, `gsc.mjs`, `sharp.mjs`. Tests: `scripts/lib/*.test.mjs` (Vitest picks up `scripts/**/*.test.mjs`).

Agent D script names reserved in `package.json`: `data:ingest` (`scripts/data/ingest-entities.mjs`), `data:build` (`scripts/data/build-localities.mjs`), `data:price-context` (`scripts/data/build-price-context.mjs`), `check:pseo` (`scripts/data/pseo-quality-check.mjs`, present since C9).

Dependency: `sharp` is not in `node_modules`. `pnpm-workspace.yaml` already allows its build (`allowBuilds: sharp: true`). Install with `pnpm add -D sharp` when you want the two image scripts to run.

## C6 CI workflows (`.github/workflows/`)

- `ci.yml`: push to main, pull requests, manual. Job `checks`: `pnpm install --frozen-lockfile`, `pnpm typecheck`, `pnpm lint`, `pnpm test` (Node 22). Job `e2e`: one dev server, `playwright test --output=$RUNNER_TEMP/pw-output --workers=3`, retries from `playwright.config.ts` (0). Skipped when the repository variable `E2E_DISABLED` is `true`.
- `post-deploy-smoke.yml`: manual (input `base_url`, default https://360ghar.com) and after `CI` succeeds on main. curl only, read only. Checks: home 200 with JSON-LD; no redirect loop (`--max-redirs 5`); the two duplicate URLs answer 301; `/hi/properties` is 200 with lang hi; a missing page is 404; sitemap index 200, `sitemap-static.xml` has hreflang; robots.txt and the IndexNow key file. After a `workflow_run` the deploy may not be live yet, so a failure right after a push can mean the old deploy is still serving: run it again by hand.
- `indexnow.yml`: manual only. Inputs `base_url`, `include`, `limit`, `submit`. It POSTs only when `submit` is `yes`; otherwise it is a dry run.

Secrets: none. Repository variables (Settings, Secrets and variables, Variables):
- `E2E_DISABLED` (optional): `true` skips the Playwright job.
- `PUBLIC_SUPABASE_URL` and `PUBLIC_SUPABASE_PUBLISHABLE_KEY` (needed by the e2e job; both are public values, the same as the Netlify build variables).
Nothing deploys from these workflows.

# Follow-ups (C7 to C11)

## C7 Speakable on text pages

- `src/layouts/Content.astro` now passes `speakable` to `Page` (which forwards to `Seo.astro`). Selectors, from `src/lib/seo/speakable.ts`: `.content-h1` (the page h1) and `.content-lead` (the lead paragraph, only when the page has a lead). Both class names are in the layout markup. `Page.astro` needed no change: it already spreads its props to `Base` and `Seo`.
- Pages that pass `noindex` get no speakable (delete-account, a closed career, an unknown policy). A page can pass its own `speakable` to override. Only pages that use `Content.astro` are affected: guides, policies, glossary, FAQ, careers, compare, truth, celebrity homes, for-ai, blog posts. Search, account and the tools UI do not use it.
- Output is a `WebPage` block with `speakable: { SpeakableSpecification, cssSelector }`, never a stand-alone specification.
- Tests (`src/lib/seo/speakable.test.ts`): the selector helper, the two class names and the wiring appear in the layout source, and the emitted block validates with `validate.ts`.

## C8 AI feed ranking (`top_localities`)

Old rule: the first 50 rows of `src/data/localities-index.json` in file order (alphabetical), so entries such as "1000 trees sai kripa floors 10". New rule, in `rankLocalities()` in `src/lib/seo/aiDiscovery.ts`:
1. Keep entity types road, phase, township, locality, sector, village. Drops 1,597 projects and 179 societies (societies keep their own `top_societies` list).
2. Drop scraped names ("projects in ..."), the old site's made-up seed names ("Block A Sector 41", "Apex Heights Sector 95") and names that start with a digit ("102A", "37B", "1000 trees ..."): sector codes and floor or plot fragments. The two name checks are copies of `isScrapedName` and `isGeneratedSeed` in `src/features/localities/data.ts`; a test checks they agree with the originals on all 3,215 rows.
3. Sort by: has curated landmark data (`src/data/locality-landmarks.json`, 27 places with real content), then type weight (road 40, phase 30, township 20, locality 15, sector 10, village 5), then city order of `src/data/priceContext.json` (Gurgaon, Delhi, Noida, Faridabad, Ghaziabad), then name.
Result: Golf Course Road, Sohna Road, DLF Phase 1, DLF Phase 5, MG Road, Palam Vihar, Sushant Lok 1, then the curated Delhi, Noida, Faridabad and Ghaziabad places and sectors, then roads and DLF or Sushant Lok phases. City names in the feed are now capitalised ("Delhi", not "delhi"). No property or society counts exist in `src/data`, and `localities.json` has no geo or nearby data, so those could not be used. The diff was checked before `--write`: only `data/llm-feed.json` changed, and only `top_localities`. The stale-file test now also compares the committed `top_localities` with the generator.

## C9 `check:pseo`

`package.json`: `check:pseo` is `node scripts/data/pseo-quality-check.mjs`. All four targets exist: `scripts/data/ingest-entities.mjs`, `build-localities.mjs`, `build-price-context.mjs`, `pseo-quality-check.mjs`. `ci.yml` runs `pnpm check:pseo` after the unit tests (the gate runs Vitest, no network).

## C10 CI hardening

- `post-deploy-smoke.yml`: all checks run inside one retried step (up to 10 tries, 30 s apart, fails only after the last try). Header says manual plus retry. Run against production today it fails on try 1 at "old duplicate URLs answer 301" because the live site still serves the old deploy: the checks work and the retry is what protects a `workflow_run` right after a push.
- Audit results (also enforced by `scripts/lib/workflows.test.mjs`): every `pnpm <script>` in a workflow exists in `package.json` (`typecheck`, `lint`, `test`, `check:pseo`, `dev`; `pnpm exec` and `pnpm install` are built in); every `node scripts/...` file exists; `pnpm/action-setup@v4` with no `version:` reads `packageManager` (`pnpm@12.6.0`, the version installed here; `pnpm-lock.yaml` is lockfileVersion 9.0); Node `'22'` satisfies `engines` `>=22.12.0`; Chrome installed with `playwright install --with-deps chrome` (the config uses the Chrome channel); e2e is one job with one `pnpm dev` and `--output`; every workflow has `permissions: contents: read` and none references `secrets.` or `GITHUB_TOKEN`; workflow inputs go through `env:`, never into the shell text.
- Validation: `npx --yes @action-validator/cli <file>` ran on all three files (it takes one file per call): exit 0 for each. It reports schema errors for a deliberately broken file. The Python YAML parse check also passes. Not verified: `pnpm/action-setup@v4` accepting pnpm 12 (no GitHub runner here).

## C11 robots.txt and sitemap index guard

`src/features/feeds/sitemapPages.test.ts` ("robots.txt and the sitemap index cannot drift apart", with paging mocked to 3 locality pages): robots.txt `Sitemap:` lines are exactly the index plus one line per sitemap in `SITEMAPS`; the index's first pages equal those robots.txt entries; every other index entry is `<robots entry>-N.xml` with N counting up from 2 without a gap; every index name is served by the route.

## Design only, not applied: keep scraped and made-up localities out of `sitemap-localities`

Owner decision pending. 1,172 of the 3,215 locality rows are scraped ("projects in ...", 462) or seed-invented (710); they produce 3,516 of the 9,555 sitemap paths (7,032 of 19,110 URLs), leaving 6,039 paths (12,078 URLs). To exclude them: export one predicate from `src/features/localities/data.ts`, `isThinLocality = (l) => isScrapedName(l) || isGeneratedSeed(l)`, and use it in two places so the sitemap and the page never disagree (the invariant in `data.ts` of `src/features/feeds`: a URL is listed only if the page renders index, follow). In `localityEntries()`, filter `ALL_LOCALITIES` with `!isThinLocality(l)` before building the base and buy/rent entries. In `src/pages/locality/[slug].astro` and the intent route, set `noindex={!l || isThinLocality(l)}` (and 200, not 404, so old links still work). Also drop those rows from the AI feed lists: `rankLocalities` already does. Tests to add on approval: no `localityEntries()` path resolves to a thin row; the page source uses the same predicate; sitemap counts drop by exactly the numbers above. Removing the pages instead (410 or 301 to the plain twin: 139 of the scraped names have one) would be a separate, bigger decision.

## Thin localities applied (Agent D2, 2026-09-29)

The design paragraph above is now built, with one addition (301) that the owner chose. Decision date 2026-09-29 ("fix them all").

- One predicate, `isThinLocality` in `src/features/localities/data.ts`. The sitemap (`localityEntries()` over `LISTED_LOCALITIES`) and the pages (`noindex={isNoindexLocality(l)}` on `/locality/:slug` and `/locality/:slug/:intent`) use the same rows, so the invariant "a URL is listed only if the page renders index, follow" holds. A test reads both files for the wiring.
- Sitemap: `sitemap-localities` is 6,039 paths (12,078 URLs with `/hi`), was 9,555 (19,110). The other 3,516 paths belonged to the 1,172 thin rows. Still one file: the paging, index and `robots.txt` tests pass without change.
- AI feed: `rankLocalities` already dropped thin rows. Now `top_societies` and the totals do too (`aiDiscovery.ts` `isThinLocalityName`, a copy of the predicate; `aiDiscovery.test.ts` compares it with `data.ts` on all 3,215 rows). `metadata.total_localities` went from 3,215 to 2,043. `public/data/llm-feed.json` was regenerated (dry run, diff, `--write`): only that line changed. `total_societies` (179) and `top_societies` are unchanged because no society name is thin.
- 301: `redirects.ts` `legacyRedirect` reads `src/data/locality-redirects.json` (434 keys for the 289 scraped rows that have a real twin) after the older rules (trailing slash, lower case, `gurugram` to `gurgaon`, type aliases), inside the same function, so every combination is one hop. `/hi` and the query string are kept (`redirectLocation`). `/locality/x/pg` (an intent word the page sends to `/buy`) goes straight to `/buy`. Checked on the running dev server with curl: `/locality/projects-in-golf-course-road-gurgaon?q=1` gives 301 to `/locality/golf-course-road-gurgaon?q=1`; `/hi/.../rent` keeps `/hi` and `/rent`; `/locality/huda-sector-10-gurgaon` gives 200 with `noindex,follow`; the twin gives 200 with a canonical and `index, follow`.
- Not redirected (200 and noindex only): 710 seed rows and 173 scraped rows without a twin.
- Search Console risk: Google may already index some of the 1,172 URLs (the old sitemap listed them). The 301 tells it to move to the twin. The noindex rows drop out over weeks; keep them out of the sitemap so Google does not keep re-crawling them as new. `noindex,follow` lets links on the page still count. Do not block them in `robots.txt` (Google could not then see the noindex). After deploy, submit the new `sitemap-localities.xml` and watch "Indexed, not submitted in sitemap" fall and "Page with redirect" rise. The real effect on Google's index is not measured here. Reversal is in `docs/parity/data.md`.
- Internal links a redirect could break: none found. Nothing in `src` links a scraped slug (the directory, hubs, nearby lists and feeds now use listed rows only). External links to a scraped URL now land on the twin.
