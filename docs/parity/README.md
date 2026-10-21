# v1 -> v2 parity work (2026-09-29)

Notes per area (each file lists tasks, decisions, evidence, risks):

- `home.md`: owner enquiry form, home sections, review capture, claims audit, tour count.
- `chat.md`: conversation history, widgets, WebMCP, privacy fix.
- `seo-ops.md`: sitemap paging, JSON-LD, 301s, AI-discovery generator, ops scripts, CI, locality-exclusion design.
- `data.md`: locality/price pipeline, pSEO gate, celebrity links, zoning findings.
- `client.md`: location memory, offline notice and service worker (runbook + QA checklist), installable manifest, haptics.

Final state (2026-09-30): `pnpm test` 104 files / 727 tests pass, `tsc`, `eslint .` clean, `astro check` 0 errors. Browser QA (Playwright against the running dev server, phone/tablet/desktop) passed for home, home-parity, chat-parity, property, parity-client (dev group), compare-map, core, chrome, account, post-property, blog, content, listing, tools, tools-visuals, data-hub, data-parity, places and seo-parity (desktop). Load flakes were re-run and passed.

Defects found only by the browser QA and fixed: chat panel never opened (client bundle imported server-only `sanitize-html`; guard test `src/lib/clientImports.test.ts` added), location notice overlapping results on the paper map, home tool groups misaligned, duplicate property URLs in `sitemap-properties.xml`, WebPage JSON-LD without `url`, founder bio claim in site-wide Person JSON-LD, duplicate Organization node on `/`, duplicate Person node on `/about-us`.

Decisions taken by the owner (2026-09-29): about 1,172 scraped or invented locality pages are noindexed, delisted and (289 scraped ones) 301'd to their twin; home claims stay as they are; `sharp` added as a dev dependency; QA reuses the dev server on 4321.

Not verified (needs a production build or a device): service worker install/offline/kill switch (`SW_E2E=1` tests), iOS installed-app sign-in, Google Maps rendering (key expired, paper-map fallback shown), signed-in `/account` visuals, Safari.

Open items for the owner:
- Site-wide Organization/WebSite/MobileApplication JSON-LD still say "India's first AI + VR real estate platform" (legacy, unbackable).
- H1 "Walk in before you visit." and SEO copy promise walkthroughs; 1 of 109 listings has a tour.
- "Visits each home and checks the owner's papers" is unverified.
- 173 scraped localities without a twin need a real data source.
- Backend gaps: docs/backend-gaps.md rows P1 to P6.
- Playwright `--output` folders must live outside the project root (files inside make Vite full-reload).
