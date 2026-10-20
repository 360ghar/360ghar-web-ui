# 360ghar-web-ui: SEO, build-time generation and static files (parity report for the Astro rebuild)

Root: `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui`. All paths below are relative to it. Items marked **Live** come from read-only `curl` probes of https://360ghar.com.

## What you most need to know first

1. **Every page that isn't prerendered serves the homepage HTML.** The catch-all `/* → /index.html 200` returns the prerendered homepage. Property, locality, blog, data-hub detail and `/land` URLs all ship `<title>360Ghar – VR Home Tours…</title>` and `<link rel="canonical" href="https://360ghar.com/">` until JavaScript runs. Prerendered pages also carry a stray empty `<link rel="canonical">`. Astro should render real per-page `<head>`s and return real 404s.
2. **The 3D Blueprint tool is broken by a header.** `X-Frame-Options: DENY` is applied to everything, including `/blueprint3d/index.html`. The `/design-blueprint` page loads that file in a same-origin iframe, and DENY blocks it (**Live** header confirmed). Use `SAMEORIGIN` or exempt that path.
3. **Sitemap URLs that aren't canonical.** `/{city}/{buy,rent}/land` (20 URLs) is in `sitemap-landing.xml`, but the page canonicalises to `/plots`, because `land → plot → plots` in `propertyTaxonomy`.
4. **Old service worker.** Users with the old PWA installed have `/sw.js` registered. The new site should ship a self-unregistering `/sw.js`, or they'll keep getting stale pages.
5. **robots.txt:** it omits `sitemap-datahub.xml`. Also, the `Allow:` lines for sitemaps and `.well-known` files are accidentally attached to the `KagiBot` group only.

---

## 1. `src/seo/*`

### siteMetadata.js
| Key | Value |
|---|---|
| siteUrl | `https://360ghar.com` (no trailing slash) |
| siteName | `360Ghar` |
| defaultTitle | `360Ghar – VR Home Tours & Property in Gurugram` |
| defaultDescription | `Explore verified properties in Gurugram with immersive virtual tours. 360Ghar is India's AI + VR real estate platform. Zero fees. No fake listings.` |
| defaultKeywords | 19 terms: English, Hindi (मकान खरीदें गुड़गाँव…) and Hinglish |
| defaultOgImage | `https://360ghar.com/og-image-home.jpg` |
| twitterCard | `summary_large_image` |
| organization | `info@360ghar.com`, `+91-9999900876`, "Sector 50, Gurugram", Gurgaon, Haryana 122001, IN |
| mapEmbedUrl | Google Maps embed of Gurugram |
| helper | `absoluteUrl()` |

Some related values live outside siteMetadata:
- **Twitter handle** `@360ghar` is hardcoded in `SEO.jsx` (site and creator).
- **Schema `sameAs` links** (structuredData.js): instagram.com/360ghar, facebook.com/360ghar, linkedin.com/company/360ghar, twitter.com/360ghar, youtube.com/@360ghar, share.google/DgcLFqSyBgz7kBwKe.
- **UI social links** (`src/data/socialLinksData.js`) don't match the schema set. They include facebook.com/people/360-Ghar/61581822088042, x.com/360Ghar, reddit, pinterest, quora, threads, tiktok, instagram/360flatmates, a Google reviews link, and two Play Store apps (`com.the360ghar.ghar360`, `com.the360ghar.flatmates360`).
- **Geo:** 28.4595, 77.0266.
- **Opening hours disagree:** the organization schema says daily 09–21; localBusiness says Mon–Fri 09–21, Sat–Sun 10–20.

### structuredData.js (1,604 lines)

**Schemas on every page** (injected once in `App.jsx`):
- `organization`: RealEstateAgent + Organization, `@id /#organization`, OfferCatalog of 10 services.
- `website`: WebSite with SearchAction `/properties?q={search_term_string}&city=gurgaon`.
- `localBusiness`: LocalBusiness + RealEstateAgent, `@id /#localbusiness`.
- `knowledgePanel`: Organization with ContactPoint.
- `mobileApplication`: Android app.
- `person`: Saksham Mittal, from `src/data/authors.js`.
- Speakable, with selectors `.speakable-summary`, `.speakable-highlights`, `h1`, `h2`.

**Builders and where they're used:**
| Builder | Output type | Used in |
|---|---|---|
| generateBreadcrumbStructuredData | BreadcrumbList | ~60 pages (nearly all) |
| generateFaqStructuredData | FAQPage | ~30 tool, data-hub, guide and facet pages |
| generateHowToStructuredData | HowTo | ~22 tool and data-hub pages |
| generateToolSchema (toolSchemas.js) | SoftwareApplication | 19 tool and data-hub pages |
| generatePropertyProductStructuredData | Product + Offer + PropertyValue | PropertyDetails |
| generateVideoStructuredData | VideoObject | PropertyDetails, VirtualTourPage |
| generateEeaSignals | ClaimReview (RERA / verified count) | PropertyDetails, LocalityTemplate |
| generateLocalityStructuredData | Place | LocalityTemplate |
| generateBlogStructuredData | BlogPosting | BlogDetailsSection |
| generateQAPageStructuredData | QAPage | SecurityDepositGuide |
| generatePersonStructuredData | Person | AboutUs |
| careerFaqStructuredData | FAQPage | Careers |
| realEstateListing | ItemList | Property |

**Unused builders:** Property (old version), Event, Podcast, Course, PropertyFaq, LocalityFaq, ItemList, VideoGallery, AggregateOffer, JobPosting, Review, Article, `faq`, `gurugramAreasData`.

**JSON-LD written inline in pages:**
- CollectionPage: BlogClassic, Landing, FacetLanding, CityHub, Policies, Careers, SocietyLanding, RegulatoryUpdates
- Article: SecurityDepositGuide, GurugramGuide, PropertyInvestment, BestSectors2026, AuctionSources, TruthPage
- Dataset: BuilderReputationScore, TenantDemandHeatmap, PriceIndexPage
- JobPosting: Careers, CareerDetails (left out when the job is closed)
- RealEstateListing: PropertyDetails
- Clip: VirtualTourPage
- DataFeed: ForAI
- AboutPage: AboutUs
- Event: BankAuctionDetail
- WebSite: Links, ForAI, ReferAndEarn, AboutUs
- SoftwareApplication: AIAgent, ZoneChecker

**Other modules:**
- **toolSchemas.js:** the free-tool schema has price 0 INR, `inLanguage en-IN/hi-IN`, `downloadUrl = site + route`, and an AggregateRating only when real values are passed. It has configs for 19 routes: emi, area-converter, area-calculator, mofa-to-rera, sq-ft, acre-in-gaj, loan-eligibility, capital-gains, doc-checklist, vastu, design-blueprint, stamp-duty, verify-ownership, ai-design-studio, rent-receipt, check-fake-listing, bank-auctions, circle-rates, rera-projects.
- **validateStructuredData.js:** a table of required properties per type. Only used by `npm run validate:schemas` and tests.

### indexationPolicy.js
- **Approved cities:** gurgaon, delhi, noida, faridabad, ghaziabad (`gurugram` is normalised to gurgaon).
- **`indexableStaticRoutes`:** 85 routes, which feed `sitemap-static.xml` and the prerender list.
- **`noindexPrerenderRoutes`:** `/login /register /account /delete-account /post-property /add-new-listing /map-location /property-sidebar /careers/software-developer-intern`. The last is a closed job, prerendered so the already-indexed URL returns real noindex HTML instead of a soft 404.
- **Prerender seeds:** 14 locality routes and 21 landing routes.
- **`isIndexableFacetLanding`** (FacetLanding pages):
  - City must be approved.
  - Amenity facets: always noindex ("until content enriched").
  - `pg` facets: noindex.
  - BHK: only 1, 2 and 3 BHK are indexed.
  - Budget: only four combinations are indexed: gurgaon/buy under-50-lakhs, under-80-lakhs, under-1-crore, and gurgaon/rent under-20k.
- **Landing and CityHub:** noindex when the city isn't approved.

**All other noindex pages found in the app:**
- Always noindex: forgot-password, reset-password, add-phone, profile-completion, NotFound.
- Conditionally noindex:
  - PropertyDetails, ProjectDetails and BlogDetails when not found or on error.
  - BlogClassic when `?category` or `?tag` is set.
  - CareerDetails when closed or the slug is unknown.
  - VirtualTourPage when there's no data.
  - SocietyLanding, CircleRate, PriceIndex, ZoneChecker, BankAuction and BuilderReputation detail pages when not found.
- Static `404.html` has `robots noindex`.

### aiDiscovery.js and reportWebVitals.js
- **aiDiscovery.js** builds `ai.txt`, `llms.txt`, `llms-full.txt`, `llm-feed.json` and `api-catalog` (a linkset).
  - Inputs: about 70 "important pages" in categories (comparisons, truth, tools, dataHub, landing, locality, guides, hindi) plus `src/data/priceContext.json`.
  - Endpoints it references: MCP at `https://api.360ghar.com/mcp`; REST at `/api/v1`, with `/api/v1/openapi.json` and `/api/v1/docs`.
  - `ai.txt` includes a bot allow-list and excluded areas.
- **reportWebVitals.js** uses web-vitals v4 (CLS, INP, LCP, FCP, TTFB). It sends a gtag `web_vitals` event (CLS ×1000) and a PostHog `web_vitals` event with the rating. It starts from `main.jsx` via `requestAnimationFrame`.

## 2. `src/common/SEO.jsx`
- **Path and locale:** `rawPath` is `location.pathname` with trailing slashes removed (`/` stays). The locale comes only from the path (`/hi` or `/hi/*`), never from the store. `<html lang>` is set to match.
- **Canonical:** `absoluteUrl(localizePath((canonical prop || path) without trailing slash, pathLocale))`.
  - The query string is always dropped.
  - Pages pass the English path as the `canonical` prop; `/hi` is added automatically on Hindi pages.
  - No canonical is emitted on noindex pages.
- **hreflang** is derived from the canonical:
  - `en` = the bare path
  - `hi` = `/hi` + path (the homepage becomes `/hi`)
  - `x-default` = `en`
  - Not emitted when noindex. A `hreflangs` override prop exists but nothing uses it.
- **Trailing slashes: never used**, including the Hindi homepage (`/hi`). Sitemaps follow the same rule. `llms-full.txt` lists `/hi/`, which **Live** 301s to `/hi`.
- **Meta tags:**
  - `robots`: `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`, or `noindex,follow`
  - `googlebot`: `index, follow` or `noindex,follow`
  - `theme-color #ff6b00`; prev/next links; optional image preloads
- **Open Graph:** title, description, image (absolute), `image:alt "360Ghar preview image"`, `og:locale en_IN/hi_IN` plus the alternate, `og:url`, `og:type` (website or article), `site_name`. Adds `og:video` (1280×720) for tour pages and `article:*` tags for articles.
- **Twitter:** card, title, description, image, `image:alt`, url, `site`/`creator` `@360ghar`, and `twitter:player` for video.
- **JSON-LD:** each block is wrapped with `@context`, and `<` is escaped.

## 3. `scripts/*`

**Build entry points:**
- `build` (fast, the default): sitemaps (static and locality only), images, AI discovery, OG image, then vite, then CSS purges.
- `build:full` (`FULL_BUILD=1`): entities, all 4 sitemap scripts, RSS, images, AI discovery, OG image, vite, CSS purge, Puppeteer prerender, IndexNow. With `SKIP_PRECOMPUTE=1` it skips the content steps.
- `build:content`: the content steps without vite.
- `build:preview`: what Netlify runs for deploy previews (PWA and compression turned off).

**Schedule** (`.github/workflows`):
- `precompute-content.yml`: cron `0 18 * * *` (23:30 IST). Runs `build:content` and commits the artifacts with `[skip ci]`.
- `content-build.yml`: runs on push to main, on cron `30 18 * * *` (00:00 IST) and on manual dispatch. Runs `build:full`, then `netlify deploy --prod --dir=dist --no-build`, then a smoke test for self-301 loops.
- Netlify's own git-triggered production builds are disabled.

**API calls:** all GET, against `${VITE_API_SERVER || https://api.360ghar.com}/api/v1`. They go through `lib/paginatedApi.mjs`, which pages with `?limit=&cursor=`, has a legacy `page`/`total_pages` fallback, and keeps a 12-hour disk cache in `.build-cache/`.

| Script | Inputs | Outputs |
|---|---|---|
| generate-sitemaps.mjs | indexationPolicy, `src/data/pseo-prune-list.json` | `public/sitemap-static.xml`, `sitemap-landing.xml`, `sitemap.xml` (index of 3) |
| generate-locality-sitemap.mjs (+ `lib/localitySitemap.mjs`) | `src/data/localities.json` (3,215 entities; 3,198 Gurgaon) | `public/sitemap-localities.xml` |
| generate-datahub-sitemap.mjs | `GET /data-hub/circle-rates`, `/data-hub/auctions`, `/data-hub/zoning`, `/data-hub/builders` | `public/sitemap-datahub.xml` |
| generate-dynamic-sitemaps.mjs | `GET /properties/` (cached), `GET /blog/posts`, `src/data/projectCatalog.js` | `sitemap-properties.xml`, `sitemap-blog.xml`, `sitemap-projects.xml`; rewrites `sitemap.xml` with 7 children. Keeps the old file if the API fails. |
| generate-rss.mjs | `GET /blog/posts` (page size 50, falls back to 25), `GET /properties/`, `src/data/localities-index.json` | `public/rss.xml`, `public/rss/{blog,hi-blog,properties,hi-properties,localities,hi-localities}.xml` |
| write-ai-discovery.mjs | aiDiscovery.js, priceContext.json, localities-index (top 50 localities, top 20 societies) | `public/.well-known/ai.txt`, `public/.well-known/api-catalog`, `public/llms.txt`, `public/llms-full.txt`, `public/data/llm-feed.json` |
| generate-og-image.mjs | `public/assets/images/thumbs/banner-three.webp` | `public/og-image-home.jpg` (1200×630, q85). This is the only generated OG image. |
| optimize-images.mjs | all PNG/JPG in `public/assets/images` | `.webp` (q80) and `.avif` (q50) next to each file, plus 320/640/768/1024w variants for hero images. Skips files that are up to date. |
| refresh-image-assets.mjs / generate-image-refresh-manifest.mjs | Pexels URLs, SVG composites | `public/assets/images/*`, `docs/image-refresh-manifest.json` (run manually) |
| ingest-gurgaon-entities → merge-entities → build-localities-json → build-localities-index | External sitemaps: magicbricks `residential_projects.xml.gz`, squareyards `sitemap-projects-location/sublocation.xml`, nobroker `sale_gurgaon_nb_building_new` and `new-projects-gurgaon`, commonfloor `Gurgaon_project_sitemap_1.xml` | `scripts/reports/entity-*.json`, `src/data/localities.json` (4.7M), `localities-index.json` (600K), `locality-landing-crossref.json` |
| ingest-ncr-entities.mjs, build-price-context.mjs, generate_localities.js | Same sources for other NCR cities / `GET /properties/?…` / hand-written seed data | Not called by any npm script |
| generate-prerender-routes.mjs | indexationPolicy, `en/seo.json` | `scripts/prerender-routes.json`: 258 routes (129 English + 129 Hindi) |
| fetch-prerender-data.mjs | `GET /properties/recommendations/?limit=6` and `?limit=12`, `/properties/?sort_by=newest`, plus the property search behind each landing and locality route | `dist/prerender-data.json` |
| prerender-pages.mjs | vite preview on 127.0.0.1:4317 and Puppeteer (concurrency 5; blocks maps, fonts, PostHog, GA/GTM, the service worker) | `dist/<route>.html` (`/` becomes `index.html`, `/hi` becomes `hi.html`); cache in `node_modules/.cache/prerender-html` |
| indexnow-submit.mjs | every `dist/sitemap*.xml` | `POST https://api.indexnow.org/IndexNow` in batches of 1,000 with `{host, key: ba96fa507cb7447aa74f5ddd2f516a6d, keyLocation: /<key>.txt}` |
| purge-main-css / purge-bootstrap | the dist CSS | Trimmed CSS in place |
| validate-structured-data, pseo-quality-check, gsc-audit, smoke-prerender, test-prerender-short-circuit | — | QA reports in `scripts/reports/` |

### Sitemaps
Every sitemap lists English and Hindi versions of each URL with `xhtml:link` alternates for en, hi and x-default.

| File | URLs | Contents |
|---|---|---|
| sitemap.xml | 3 committed, 7 live | Index. The committed file lists static, landing and localities; the live one also lists datahub, properties, blog and projects. |
| sitemap-static.xml | 170 | The 85 static routes × 2. `/` has priority 1.0 and daily; the rest 0.7 and weekly. No lastmod. |
| sitemap-landing.xml | 248 | 5 city hubs; `/{city}/{buy,rent}/{flats,independent-house,builder-floor,villa,plots,land,office-space,shop}`; `/{city}/pg/flats`; `/{city}/{buy,rent}/flats/{1,2,3}-bhk`; the 4 Gurgaon budget pages; minus the prune list. |
| sitemap-localities.xml | 19,110 (10 MB) | `/locality/{slug}`, plus `/buy` and `/rent` for societies, projects, localities, sectors, townships and phases |
| sitemap-datahub.xml | 882 | 8 data-hub hubs, 5 `/price-index/{city}`, 183 `/circle-rate/{slug}`, 238 `/bank-auctions/{id}`, 9 `/zone-checker/{slug}`, 0 `/builder-reputation/{slug}` |
| sitemap-properties.xml | 1,792 | `/property/{numericId}` |
| sitemap-blog.xml | 40 | `/blog/{slug}` |
| sitemap-projects.xml | 16 | `/project/{slug}` |

### RSS
- Feeds are RSS 2.0 with `atom:link rel=self`.
- Each item has title, link, description, pubDate (RFC 2822) and guid (the permalink).
- `hi-*` feeds rewrite links to `/hi/…` and use language `hi-in`.
- `rss.xml` is an index feed with 6 items, one per sub-feed.
- The blog and properties feeds keep the old file if the API fails; the localities feed (localities only) is always rewritten.
- `index.html` has `<link rel=alternate>` tags for `rss.xml`, `rss/blog.xml`, `rss/properties.xml` and `rss/localities.xml`.

## 4. `public/` — files that must stay at the same path (88M total)

| Path | Size | Notes |
|---|---|---|
| `robots.txt` | 4K | Named groups for about 22 AI and search bots (most with Crawl-delay 10). `*` allows `/` with `Disallow /admin/ /api/ /checkout/ /cart/`. 7 Sitemap lines, with datahub missing. |
| `llms.txt`, `llms-full.txt` | 91 / 216 lines | Generated |
| `BingSiteAuth.xml` | — | Bing user ID `239EBEFE4DD60479F9F82FEE1EEC71A3` |
| `ba96fa507cb7447aa74f5ddd2f516a6d.txt` | — | IndexNow key file; its content is the key |
| `openapi.json` | 155 lines | OpenAPI 3.0.3 description of `api.360ghar.com/api/v1` |
| `404.html` | — | Static noindex page. Currently never served, because the catch-all returns 200. |
| `og-image-home.jpg` | 108K | |
| `rss.xml`, `rss/` | 700K | 6 feeds |
| `sitemap*.xml` | ~12M | 8 files |
| `data/llm-feed.json` | 36K | The only file in `public/data`. Used by `/for-ai` (link and DataFeed schema), the PriceIndexPage link, and the `Link` header on `/`. |
| `.well-known/` | 52K | Generated: `ai.txt`, `api-catalog`. Hand-written: `openid-configuration`, `oauth-authorization-server`, `oauth-protected-resource` (Supabase `pezjtoivkrmepydqminz` as auth server), `mcp/server-card.json`, `acp.json`, `ucp`, `agent-skills/index.json` plus 4 `SKILL.md` files. **index.json stores sha256 digests, so the SKILL.md files must stay byte-identical.** `assetlinks.json` and `apple-app-site-association` are not files; they're proxied from the API. |
| `blueprint3d/` | 14M | models 11M, js 988K (`three.min.js`, jquery, `blueprint3d.js`, `items.js`), rooms 936K, fonts 220K, css 164K. Loaded as an iframe of `/blueprint3d/index.html`. |
| `assets/images/` | 61M, 663 files | thumbs 58M, logo 2.3M (`favicon.webp`, `favicon-32.png`, `favicon.png` (192), `favicon-512.png`, `apple-touch-icon.png`, `logo.png` used as the schema logo), icons, shapes, blog, competitors |
| `assets/css`, `webfonts`, `fonts`, `sass` | 256K / 260K / 104K / 492K | Bootstrap and Font Awesome CSS, FA woff2, Cinzel and Josefin woff2. The SCSS source is publicly served. |
| `_redirects` | — | See section 5 |

Build output that isn't in `public/` but is served:
- `manifest.webmanifest`, `sw.js`, `registerSW.js`, `workbox-*.js` (vite-plugin-pwa, autoUpdate)
- `.gz` and `.br` copies of files

There is no `/favicon.ico` file; **Live** it returns the SPA HTML.

## 5. Redirects, rewrites and headers

Beyond the rules you already know:

**netlify.toml:**
- Direct one-hop rules `/{,hi/}gurugram/{buy,rent,pg}/apartments → /{,hi/}gurgaon/…/flats`, so there's no redirect chain.
- The apartments→flats rules match exactly three path segments. `/gurgaon/buy/apartments/2-bhk` is **not** redirected; the page just sets its canonical to `/flats/2-bhk`.
- A comment forbids adding a forced trailing-slash rule (it caused the 2026-07-14 site-wide 301 loop).

**Headers:**
- All paths: `nosniff`, `X-Frame-Options DENY`, `Referrer-Policy strict-origin-when-cross-origin`, `Permissions-Policy camera=(), microphone=(), geolocation=(self)`. No CSP, on purpose.
- `/assets/*.js|css`: 1 year, immutable.
- `/assets/webfonts/*`: immutable, plus `Access-Control-Allow-Origin *`.
- `/assets/css/*` and `/assets/images/*`: 30 days, plus stale-while-revalidate 7 days.
- `sw.js`, `registerSW.js`, `workbox-*`: no-cache.
- `/*.html` and `/`: `max-age=60, swr=604800`, `CDN-Cache-Control max-age=3600, swr=86400`.
- `/` also gets an RFC 8288 `Link` header pointing to: api-catalog, `/for-ai` (service-doc), llm-feed (service-meta), the MCP server card, agent-skills, `llms.txt`, openid-configuration.
- `.well-known/*` and `/openapi.json`: explicit Content-Types (`application/linkset+json` for api-catalog, `text/markdown` for SKILL.md, `text/plain` for ai.txt, JSON otherwise), `Access-Control-Allow-Origin *`, `max-age=3600`.

**Parked edge functions** (`netlify/edge-functions-disabled/`):
- `soft-404-guard.js`: sends unknown paths to `/404.html` with a 404 status and `X-Robots-Tag: noindex`.
- `markdown-negotiation.js`: answers `Accept: text/markdown` requests with Markdown instead of HTML.

**Live platform behaviour:**
- `/x/` → 301 `/x` and `/About-Us` → 301 `/about-us`, but **only for prerendered paths** (Netlify pretty URLs over `dist/<route>.html`).
- Non-prerendered paths with a trailing slash or capitals return 200 with the SPA page.
- Junk paths return 200 (a soft 404).
- `/api/properties/` → 200 through the proxy.

**Handling inside the app:**
- **City slugs:** `normalizeCitySlug` (in `utils/internalLinks.js` and `indexationPolicy`) lowercases and maps gurugram→gurgaon. Landing, FacetLanding and CityHub don't redirect; they render and set the canonical to the normalised path.
- **Invalid intent:** treated as `buy` in the canonical.
- **Type aliases** (`utils/propertyTaxonomy.js`):
  - apartment/apartments/flat/flats → `flats`
  - house → `independent-house`
  - plot/plots/land → `plots`
  - office → `office-space`
  - pg is always `flats`
  - So these only affect the canonical, never the HTTP status.
- **Facet pages:** only the BHK values 1–5 and the budget values under-10k, 15k, 20k, 50-lakhs, 80-lakhs and 1-crore are accepted. Missing path parts trigger `<Navigate to="/properties" replace>`.
- **LocalityTemplate:** matches `{slug}-{citySlug}`, then the legacy `{slug}-gurgaon`, then the bare slug. Unknown slugs trigger `<Navigate replace>` to `/properties` (or `/hi/properties`), a client-side redirect with HTTP 200. The lookup is case-sensitive.
- **SocietyLanding** (`/locality/:slug/:intent`) links internally to `/{city}/buy/apartment` (singular). No Netlify rule covers that; only the canonical fixes it.
- **Case:** React Router matching is case-insensitive, but the canonical keeps the original casing of the URL.
- **Listing pages:** `/properties` and `/blog` canonicals drop `?page` and filters. The blog list is noindex when filtered by category or tag.
- **Property URLs:** only `/property/:id` (numeric) and `/property/:id/virtual-tour`. There's no slug-id format.
- **Unrouted pages:** `/home-two` and `/home-three` (still listed in CLAUDE.md) now render NotFound.
- **Language switcher:** swaps between `/x` and `/hi/x` with `replace`. The URL is the only thing that decides the locale.

## 6. `src/i18n`
- **Languages:** `en` and `hi`. Detection uses the URL path only. Both languages are bundled statically, with no lazy loading. `i18next-http-backend` is installed but not used.
- **14 namespaces:** common, home, properties, projects, tools, data-hub, account, seo, forms, landing, compare, truth, policies, blog.
- **3,106 keys per language, with full key parity.** About 25 Hindi values are identical to English (brand terms).
  - Largest namespaces: tools 810, properties 467, data-hub 313, common 276, policies 265, account 223.
- **Pages with properly translated bodies:** Home, all calculators and tools, data-hub directories and details, Landing, FacetLanding, Policies, GurugramGuide, PropertyInvestment, account and forms, and the Compare and Truth templates (labels only).
- **Pages whose body is hardcoded English** (only the SEO title and description are translated). This is an estimate from how often each page calls `t()`:
  - No translation at all, including meta: TenantDemandHeatmap, BestSectorsInvestment2026, BuilderReputationScore.
  - Body in English: SecurityDepositGuide, NriPropertyGuide, CelebrityHomesHub, Links, ListPropertyFree, Careers/CareerDetails (data from `careers.js`), Glossary, NearOfficePage, CityHub, LocalitiesDirectory, AIAgent, AuctionSources, PriceIndexPage, ForAI.
  - Partly English: SocietyLanding, LocalityTemplate (content blocks from `localities.json`).
  - English data files: Compare (`competitors.js`).
  - English from the API: blog posts, property and project text.

## 7. package.json
- **Scripts:** see section 3. Also `lint`, `test` (vitest), `preview`, `validate:schemas`.
- **Maps:** `@googlemaps/js-api-loader ^1.16.10` (Places input, MapLocationSection).
- **Charts:** no library; custom SVG (ScoreWheel/BuilderScoreChart, EMI calculator).
- **Markdown:** `react-markdown ^10.1.0`, `remark-gfm ^4.0.1`, `dompurify ^3.3.1`.
- **Lightbox:** `yet-another-react-lightbox ^3.23.2`.
- **Carousel:** `react-slick ^0.30.2`.
- **3D / panorama:** blueprint3d plus three.js, vendored in `public/`. VR tours are iframes (`LazyVRPlayer`, `virtualTourUrl`); videos are YouTube or Vimeo embeds.
- **PDF / print:** `jspdf ^4.2.0` and `html2canvas ^1.4.1` (Vastu report), `react-to-print ^3.3.0` (rent receipt).
- **Other:**
  - SEO: `react-helmet-async ^2.0.5`
  - i18n: `i18next ^26.0.3`, `react-i18next ^17.0.2`
  - Data, state and auth: `@supabase/supabase-js ^2.95.3`, `swr ^2.4`, `zustand ^5.0.5`, `axios ^1.9`
  - Forms: `formik ^2.4.5`, `yup ^1.4`, `@formspree/react ^3`
  - Analytics: `posthog-js ^1.311`, `web-vitals ^4.2.4`
  - UI: `react-router-dom ^6.22.3`, `react-toastify ^10`, `react-countup`, `react-tabs`, `react-swipeable`
- **Dev:** `vite ^7.3.1` (CLAUDE.md wrongly says 5.1), `vite-plugin-pwa ^1.2`, `vite-plugin-compression`, `puppeteer ^24.40`, `sharp ^0.34.5`, `purgecss ^8`, `critters`, `svgo ^4`, `sass ^1.71`, `vitest ^3.2.4`, ESLint 9 (pinned; don't move to 10).

## 8. `index.html`
- **Static fallback tags for social crawlers:** `<title>` = the default title, `theme-color #ff6b00`, and homepage OG and Twitter tags. There is deliberately no static description, canonical or hreflang, because react-helmet-async can only add tags, not remove them.
- **Analytics:** a small inline gtag stub; the real `gtag.js` (`G-0S1Q7466MM`) loads on `requestIdleCallback`, or after 2 seconds. PostHog is loaded when the browser is idle, from `main.jsx`.
- **Favicons:** webp, 32px png, 192px png, apple-touch-icon 180. Plus 4 RSS alternate links.
- **Preconnect and dns-prefetch:** api.360ghar.com, googletagmanager.com, google-analytics.com.
- **Fonts:** self-hosted via inline `@font-face` with `font-display: swap`, not preloaded. Cinzel 400/700; Josefin Sans 400, and 600/700 from the variable file.
- **LCP:** preloads the `banner-three*.avif` srcset (320–1024w).
- **CSS:** Bootstrap and Font Awesome load deferred via the `media="print"` onload trick. A vite plugin also defers the main CSS.
- **No Google or Bing verification meta tags.** Bing uses `BingSiteAuth.xml`; Google is presumably verified by DNS, since there's no `google*.html` file.

## 9. Colours and fonts
**`src/styles/_theme.scss`** (SCSS variables, also exported as `--*` CSS variables):
- Brand orange: `--main-color #ff6b00`, `dark #cc5500`, `light #ff8c3a`, `lighter #fff5eb`
- `--cta-color #0369A1`
- Status colours: success `#28a745` / `#d4edda`, danger `#dc3545` / `#f8d7da`, warning `#ffc107` / `#fff3cd`, info `#17a2b8` / `#d1ecf1`
- Grays: 100 `#f8f8f8`, 200 `#e0e6ed`, 300 `#dee2e6`, 400 `#ced4da`, 500 `#adb5bd`, 600 `#6b7385`, 700 `#495057`, 800 `#777777`, 900 `#181616`
- Text: primary = gray-900, secondary = gray-800, muted = gray-600, light `#fff`
- Borders: gray-200 / gray-300. Backgrounds: light = gray-100, white, dark = gray-900
- A dark mode exists as opt-in scaffolding only, via `[data-theme="dark"]`.

**`public/assets/sass/abstracts/_variable.scss`:**
- Fonts: `--heading-font 'Cinzel', serif`; `--body-font` and `--poppins-font` are both `'Josefin Sans'`.
- Headings: `clamp()` sizes, h1 from 32 to 68px down to h6 from 16 to 20px.
- `--main-gradient`: 90°, `#ff8c3a → #ff7d1a → #ff6b00 → #e05e00 → #cc5500`, plus a reversed version.
- Main colour as HSL (25 100% 50%) with lighten and darken steps 100–900.
- Grays here differ from `_theme.scss`: 900 `#181616`, 800 `#777`, 700 `#211E1E`, 200 `#E0E0E0`, 100 `#F8F8F8`.
- HSL tokens: black 0 4% 9%, light 0 1% 53%, body-bg 0 0% 97%, section-bg 208 100% 97%, plus a box-shadow token.

### Key files (absolute paths)
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/seo/indexationPolicy.js`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/common/SEO.jsx`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/App.jsx`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/utils/propertyTaxonomy.js`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/utils/internalLinks.js`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src/utils/localitySlug.js`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/netlify.toml`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/public/_redirects`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/scripts/build.mjs`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/scripts/prerender-pages.mjs`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/.github/workflows/content-build.yml`
- `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/netlify/edge-functions-disabled/soft-404-guard.js`