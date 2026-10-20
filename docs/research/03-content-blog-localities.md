I've covered all 25 routes. Every compare page runs on one template and every truth page on another. Line numbers are approximate for the areas I only scanned. Two short names are used for the repo roots throughout:
- `WEB` = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui`
- `BE` = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-backend`

## Applies to every route
- **Routes**: defined in `WEB/src/App.jsx:142-231`. Every route is also mounted under `/hi/*` (`App.jsx:316-325`) with the same component; the path decides the locale.
- **SEO component** (`WEB/src/common/SEO.jsx`):
  - Canonical is the `canonical` prop (or the current path) and gets a `/hi` prefix on Hindi pages.
  - hreflang en / hi / x-default is generated automatically for every page.
  - `noindex` sets `noindex,follow` and removes both the canonical and the hreflang tags (lines 77, 90).
  - `article:*` meta tags are only added when `type="article"`.
- **Site-wide JSON-LD** (`App.jsx:292-302`): Organization/RealEstateAgent, WebSite+SearchAction, LocalBusiness, an ItemList, MobileApplication, Person, Speakable.
- **`WEB/src/seo/indexationPolicy.js` does not set noindex at runtime for these routes.** It only feeds `scripts/generate-sitemaps.mjs` and `scripts/generate-prerender-routes.mjs`; at runtime only Landing, FacetLanding and CityHub read it. Every static route below is in `indexableStaticRoutes` (L9-95). The real noindex rules are per page and listed in each section.
- **Prerender**: 258 routes (`WEB/scripts/prerender-routes.json`) = indexable static routes + `noindexPrerenderRoutes` + `seedLocalityPrerenderRoutes`, each in en and hi. Blog posts and 99%+ of locality pages are not prerendered; they render in the browser only.
- **Forms on almost every page**:
  - `<Cta>` contains a newsletter form that posts to Formspree `mkgzdjyj` (field `email`), `WEB/src/common/forms/NewsletterForm.jsx:6`.
  - The site-wide ChatBot uses POST `/agent/chat-public` or `/agent/chat` (streaming), `WEB/src/services/chatService.js:77,108`.
- **API base**: `/api` is rewritten to `https://api.360ghar.com/api/v1` (`WEB/public/_redirects:1`). GET requests retry on 408/429/5xx (`WEB/src/services/http.js`).

---

## /about-us
- **File**: `WEB/src/pages/core/AboutUs.jsx`
- **Content: static, no API.**
  - AboutThree uses `aboutCheckLists` (`WEB/src/data/HomeThreeData.jsx`).
  - Team uses `teams` (`WEB/src/data/OthersPageData.jsx` ~L670: Arjun Mehta, Priya Singh, Vikram Malhotra).
  - PropertyTypeThree, AreasWeCover (inline data), OwnerCta, Cta.
- **Interactive**: newsletter only.
- **SEO**:
  - Title/description from `seo.json` `about.*` ("About 360Ghar | India's VR-First Way to Find a Home"); canonical `/about-us`.
  - JSON-LD: Organization, AboutPage, BreadcrumbList, 3 × Person.
  - The Person schema lists Saksham Mittal, but the rendered team shows Arjun Mehta instead.

## /faq
- **File**: `WEB/src/pages/core/FaqPage.jsx`
- **Content: static.** 5 Q&As in `faqs`, `WEB/src/data/HomeThreeData.jsx:166` (fields `btnText`/`bodyText`).
  - The backend has GET `/faqs/public` (`BE/app/api/api_v1/endpoints/core.py:428`, returns `CursorPage[FAQResponse]`, schema at `BE/app/schemas/core.py:172`) with 5 seeded FAQs (`BE/seed_data/hardcoded/05_faqs.json`).
  - The page never calls it; `utilityService.getPublicFAQs` is unused.
- **Interactive**:
  - FaqAccordion, one item open at a time.
  - FaqContactUs → ValidationForm (name, email, address, message; Formik + Yup). **It submits nowhere**: onSubmit only resets the form and shows a toast (`WEB/src/components/forms/ValidationForm.jsx:26-31`).
  - That section still has leftover template copy ("Contact uss", "For your car we will do everything…").
- **SEO**: `seo.json` `faq.*`; canonical `/faq`; FAQPage built from the same 5 items, plus BreadcrumbList.

## /contact
- **File**: `WEB/src/pages/core/Contact.jsx`
- **Content: static.** ContactTop (`contactTopInfos`, `OthersPageData.jsx:993`: email plus location) and a Google Maps iframe.
- **Form**: ContactUsSection posts to **Formspree `mwpqglyb`** (`WEB/src/components/contact/ContactUsSection.jsx:9`).
  - Fields: `user_name`, `user_email`, `user_subject` (prefilled from `?subject=`), `message`. No backend involved.
- **SEO**:
  - The title comes from `policies.json` `contact.title` = "Contact Us!"; `seo.json` has no contact title. Description is `seo.json` `contact.description`. Canonical `/contact`.
  - JSON-LD: RealEstateAgent (with ContactPoint), BreadcrumbList, LocalBusiness+RealEstateAgent (opening hours).

## /policies, /policies/:slug
- **Files**: `WEB/src/pages/core/Policies.jsx`, `WEB/src/pages/core/PolicyDetails.jsx`
- **Valid slugs** (hardcoded in both files and in `indexableStaticRoutes`):
  - `terms-of-service`, `privacy-policy`, `content-guidelines`, `content-takedown-policy`, `grievance-redressal-mechanism`
  - All are seeded as markdown (8-33 KB each) in `BE/seed_data/hardcoded/06_pages.json`. The seed also has `platform-policies`, which the frontend never links to.
- **API**: GET `/pages/{unique_name}/public` via `pageService.getPublicPage` / `getManyPublicPages` (`WEB/src/services/pageService.js:15-42`). The listing page makes 5 parallel calls (`Promise.allSettled`).
  - Handler: `BE/app/api/api_v1/endpoints/core.py:282`, which calls `CoreService.get_page_public` (`BE/app/services/core.py:206`).
  - A page is only returned if active, not a draft and not private. Each call adds 1 to `view_count`.
  - Response is `PagePublicResponse` (`BE/app/schemas/core.py:94`): `unique_name, title, content, format(html|markdown|json), custom_config, view_count, updated_at`.
- **Mismatches**:
  - The frontend always renders ReactMarkdown and ignores `format`, so an HTML page would show as escaped text.
  - It also falls back to fields that don't exist (`summary`, `excerpt`, `body`, `heading`, `updatedAt`); harmless.
  - The listing's summary is the first line of `content`, cut to 200 characters.
- **Unknown slug**: shows an "unable to load" error with title "Policy", still indexable with a canonical. This is a soft 404.
- **SEO, listing**: `seo.json` `policies.*`; `og:type` is article; CollectionPage whose `hasPart` is one CreativeWork per policy (`dateModified` from `updated_at`). No breadcrumb.
- **SEO, detail**: title "{title} | 360Ghar", description "{title} page for 360Ghar." (thin); canonical `/policies/{slug}`; CreativeWork. No breadcrumb.

## /blog
- **Files**: `WEB/src/pages/blogs/BlogClassic.jsx`, `WEB/src/components/blog/BlogClassicSection.jsx`, and the sidebar (`WEB/src/common/listing/CommonSidebar.jsx`, `SidebarCategoryList.jsx`, `SidebarRecentPost.jsx`).
- **API (all public)**:

| Call | Used for | Handler (`BE/app/api/api_v1/endpoints/blog.py`) | Response |
|---|---|---|---|
| GET `/blog/posts?limit=10[&cursor][&category][&tag][&q]` | main list; Load More appends using `next_cursor` | `:102` | `CursorPage[BlogPost]` |
| GET `/blog/posts?limit=4` / `?limit=3` | popular posts / sidebar recent | `:102` | same |
| GET `/blog/categories` | sidebar | `:363` | `CursorPage[BlogCategory]` |
| GET `/blog/tags` | sidebar | `:462` | `CursorPage[BlogTag]` |

- **Filter mismatch (backend wins)**: the frontend sends `category=` and `tag=` (`BlogClassicSection.jsx:34-35, 63-64`). The backend only accepts `categories`, `tags` (lists) and `keywords` (`blog.py:105-107`), so **category and tag filters are silently ignored** and the full list comes back. `q` works.
- **URL params**: `?category=<slug|id>`, `?tag=<slug|id>`, `?q=`.
  - Seeded category slugs (14, `BE/seed_data/hardcoded/08_blog_categories.json`): market-insights, buying-guide, rental-tips, vastu-design, neighborhoods, legal-rera, real-estate, virtual-tours, 360-ghar, finance-pricing, construction-home-improvement, lifestyle-living, tech-real-estate, relocation-nri.
  - 32 seeded tags in `09_blog_tags.json`.
- **Interactive**:
  - The hero search box goes to `/properties?q=…&city=Gurgaon`; it does not search the blog.
  - The sidebar search sets `?q=` (real blog search).
  - Load More (cursor), Clear Filters, featured-guide links.
- **SEO**:
  - Title "Real Estate Blog | 360Ghar Insights", or "{category|tag} | …" when filtered.
  - **noindex when `?category` or `?tag` is present.** Canonical is the bare path (`/blog`).
  - JSON-LD: CollectionPage (with an ItemList stub) and BreadcrumbList. Prerendered.

## /blog/:title
- **Files**: `WEB/src/pages/blogs/BlogDetails.jsx`, `WEB/src/components/blog/BlogDetailsSection.jsx`
- **Slug format**: `:title` is the post slug.
  - The backend `get_blog_post` also accepts a numeric id (`BE/app/services/blog.py:326-331`), so `/blog/123` works, but no link on the site uses ids and the sitemap has none.
  - Current links take the backend `slug` (BlogClassicItem, BlogFeed, SidebarRecentPost).
  - Older components (BlogItem, BlogItemTwo, BlogItemThree) build the slug from the title (lowercase, spaces to hyphens), which can produce 404s.
- **Valid slugs**: `WEB/public/sitemap-blog.xml` has 20 posts (each also under `/hi`, 40 URLs). The sitemap script walks all pages of the API:
  - vastu-compliant-homes-sohna-road
  - manesar-property-investment-opportunities
  - rental-yield-comparison-gurgaon-sectors
  - understanding-circle-rates-gurugram
  - cyber-city-to-sohna-road-commuter-guide
  - affordable-sectors-under-50-lakhs-gurgaon
  - flatmate-vs-pg-gurgaon-guide
  - new-gurgaon-vs-old-gurgaon
  - best-schools-near-golf-course-road
  - dwarka-expressway-next-big-corridor
  - 360-virtual-tours-transforming-property-discovery
  - emerging-sectors-gurgaon-budget-buyers
  - check-before-signing-lease-agreement
  - short-stays-vs-hotels-360-stays
  - complete-guide-pg-life-gurgaon
  - negotiate-rent-gurgaon-pro-tips
  - vastu-tips-new-apartment
  - golf-course-road-vs-sohna-road-investment-2026
  - understanding-rera-first-time-buyer-guide
  - top-gated-communities-gurgaon-families
- **API**: GET `/blog/posts/{slug}` → `blog.py:219`. Response `BlogPost` (`BE/app/schemas/blog.py:154`): `id, slug, title, content, excerpt, cover_image_url, categories[], tags[], meta_title, meta_description, focus_keyword, canonical_url, og_image_url, reading_time_minutes, word_count, published_at, updated_at, status, sources[], seo_metadata{schema_markup…}`.
- **Field mismatches**:
  - The frontend reads `author_slug`, `author_name`, `thumbnail_url`, `featured_image`, `image_url` and `summary`, none of which exist. So the author is always "360Ghar Team" (`WEB/src/data/authors.js`).
  - The backend's `canonical_url` is ignored.
- **Content rendering**: HTML (sanitised by DOMPurify with an allowlist), Markdown (react-markdown + GFM), or plain text converted to HTML by a heuristic.
- **Interactive**:
  - Share buttons: WhatsApp, Facebook, X, LinkedIn, copy link (with UTM tags).
  - Category badges link to `/blog?category=` and tag chips to `/blog?tag=`.
  - "Related Tools" chosen by keyword (EMI, loan, area, capital gains, stamp duty, checklist, vastu, floor plan, circle rate).
  - Retry button on error.
- **SEO**:
  - Title is `meta_title`, otherwise "{title} ({year}) | 360Ghar".
  - Description is `meta_description`, otherwise the excerpt (up to 150 characters; legal topics get a "Verified guide: " prefix).
  - Image is `og_image_url`, then `cover_image_url`, then the first markdown image.
  - Canonical `/blog/{slug}`. Type article, with published time, modified time, section and tags.
  - JSON-LD: BlogPosting and BreadcrumbList. The backend `schema_markup` is spread in first and then `@type` is forced to BlogPosting, so an FAQPage in `schema_markup` would be corrupted.
  - noindex on error or not found. Not prerendered.

## /gurugram-real-estate-guide
- **File**: `WEB/src/pages/core/GurugramGuide.jsx`
- **Content: static.** Copy is in i18n `gurugramGuide.*` (52 keys) in `WEB/src/i18n/locales/{en,hi}/policies.json`. The price table is hardcoded in the JSX (4 areas × 2BHK/3BHK buy/rent).
- **Interactive**: none; links to `/properties` and `/post-property`.
- **SEO**: title "Complete Guide to Real Estate in Gurugram 2024 | …"; canonical set. JSON-LD BreadcrumbList and Article, with dates hardcoded to 2024-01-01.

## /property-investment-gurugram
- **File**: `WEB/src/pages/core/PropertyInvestment.jsx`
- **Content: static.** i18n `propertyInvestment.*` (67 keys) in `policies.json`.
- **Interactive**: none.
- **SEO**: title "Property Investment Guide Gurugram 2024 | Best Areas & ROI". JSON-LD BreadcrumbList and Article (2024-01-01).

## /refer-and-earn
- **Files**: `WEB/src/pages/core/ReferAndEarn.jsx` and `WEB/src/components/referral/{HowItWorks,RewardTiers,ReferralForm,ReferralTerms}.jsx`. Copy in i18n `referAndEarn.*` and `common` `contentSeo.referral*`.
- **Form fields** (`ReferralForm`):
  - Referrer: name, phone (10-digit Indian mobile `/^[6-9]\d{9}$/`), email, relationship (self, friend, family, neighbor, colleague, acquaintance, agent, other).
  - Property: owner_name, owner_phone, address, locality, property_type (`PROPERTY_TYPE_OPTIONS`), intent (rent/sale), expected_price, additional_notes.
  - Checkboxes: consent, terms_accepted.
- **The submission is fake**: it waits 800 ms, shows success and throws the data away; the code has a TODO for a `/referrals/` endpoint (`ReferralForm.jsx:152-161`).
- **FAQ**: 6 static Q&As, not an accordion and not in JSON-LD.
- **SEO**: `seo.json` `referAndEarn.*`. JSON-LD WebPage and BreadcrumbList.

## /for-ai
- **File**: `WEB/src/pages/core/ForAI.jsx`
- **Content: static.** Mostly hardcoded English body, plus i18n page title and intro.
  - Data comes from `WEB/src/seo/aiDiscovery.js` (`aiDiscoveryFeed.important_pages`).
  - Related static files: `WEB/public/data/llm-feed.json` (34 KB), `/llms.txt`, `/llms-full.txt`.
- **Interactive**: none.
- **SEO**: "For AI Assistants | 360Ghar". JSON-LD Organization, WebSite+SearchAction, DataFeed. No Cta or mobile menu on this page.

## /ai-agent
- **File**: `WEB/src/pages/core/AIAgent.jsx`
- **Content: static.** `WEB/src/data/AIAgentData.jsx` (199 lines): showcase, how-it-works, capabilities, 8 MCP tools, use cases, 8 FAQs, stats, CTA. All English.
- **Interactive**: none. The chat shown is a static mock.
- **SEO**: `seo.json` `aiAgent.*`. JSON-LD Service, SoftwareApplication (`https://api.360ghar.com/mcp`), FAQPage (8).
- **Mismatch (backend wins)**:
  - The tool names shown (`property_search, get_property_details, schedule_visit, list_visits, get_rent_status, manage_tenants, track_maintenance, get_documents`, at `AIAgentData.jsx:93-126`) don't exist.
  - The real MCP names include `discovery_search`, `discovery_property_get`, `visits_schedule`, `visits_list`, `owner_rent_status` and `tenant_/owner_maintenance_*`.
  - There is no tool for managing tenants or fetching documents.
  - The stats (50K+, 10K+, 99%) have no source.

## /celebrity-homes
- **File**: `WEB/src/pages/core/CelebrityHomesHub.jsx`
- **Content: static.** `CELEBRITY_HOMES` (16 entries, L11-124) with `{name, slug, location, type, highlights}`. Each card links to `/blog/{slug}`.
- **None of the 16 slugs appear in the 20-post blog sitemap**, so they probably 404 on the backend (worth confirming in the DB).
- **Interactive**: none.
- **SEO**: `seo.json` `celebrityHomes.*` (the description names SRK and Virat Kohli, who aren't on the page). BreadcrumbList only.

## /nri-property-guide
- **File**: `WEB/src/pages/core/NriPropertyGuide.jsx`
- **Content: static English.** 8 FAQs, 5 HowTo steps, 6 checklist cards, a 5-row tax table.
- **Interactive**: FAQ accordion (first item open).
- **SEO**: `seo.json` `nriPropertyGuide.*`. JSON-LD BreadcrumbList, FAQPage, HowTo.

## /landlord-not-returning-security-deposit
- **File**: `WEB/src/pages/core/SecurityDepositGuide.jsx` (797 lines)
- **Content: static.** 12 FAQs, 10 HowTo steps, a central-laws table, a state-by-state rules table (~13 rows), plus deductions, timelines and a legal-notice checklist.
- **Interactive**: FAQ accordion; links to `/rent-receipt`, `/regulatory-updates`, `/contact`.
- **SEO**:
  - `seo.json` `securityDepositGuide.*`. Type article (dated 2026-08-12, section "Tenant Rights", 4 tags).
  - JSON-LD BreadcrumbList, Article, FAQPage, HowTo, QAPage.

## /list-property-free
- **File**: `WEB/src/pages/core/ListPropertyFree.jsx`
- **Content: static.** 6 FAQs, 4 HowTo steps, a 6-row comparison table against "Other Portals" (MagicBricks figures).
- **Interactive**: FAQ accordion; CTA to `/post-property`.
- **SEO**: `seo.json` `listPropertyFree.*`. JSON-LD BreadcrumbList, FAQPage, HowTo.

## /glossary
- **File**: `WEB/src/pages/core/Glossary.jsx`
- **Content: static.** `GLOSSARY_ENTRIES`: 20 terms (L12-33), each `{term, question, answer}`.
- **Interactive**: text search over term and question, an A–Z letter filter (only letters that have entries), accordion.
- **SEO**: `seo.json` `glossary.*`, which claims "100+ terms". JSON-LD BreadcrumbList and FAQPage (all 20).

## /links
- **File**: `WEB/src/pages/core/Links.jsx`
- **Content: static.** `WEB/src/data/socialLinksData.js`: 23 entries (13 verified, 10 "coming soon"), grouped as follow / review / app.
- **Interactive**: copy-page-link button (clipboard, with an `execCommand` fallback) and outbound links.
- **SEO**:
  - `seo.json` has no `links` key, so the inline English fallback title/description is used, including on `/hi`.
  - JSON-LD WebPage, Organization (`sameAs` = verified URLs), BreadcrumbList.

## /localities
- **File**: `WEB/src/pages/localities/LocalitiesDirectory.jsx`
- **Content: static.** `WEB/src/data/localities-index.json` (611 KB, 3,215 entries `{slug, name, city, entityType, type, lastVerifiedAt}`), lazy-loaded by `WEB/src/hooks/useLocalitiesIndex.js`.
  - Types: project 1597, sector 846, locality 520, society 179, village 28, road 18, township 17, phase 10.
  - Cities: Gurgaon 3198, delhi 5, noida 5, ghaziabad 4, faridabad 3.
- **Interactive**: name search, type dropdown, reset, A–Z chips (first 18 letters). Groups render progressively as you scroll (6 letters per batch).
- **Links** go to `/locality/{slug}-{citySlug}` via `buildLocalitySlug` (`WEB/src/utils/localitySlug.js`).
- **SEO**:
  - `seo.json` `localitiesDirectory.*` says "500+ areas", while the data has 3,215.
  - JSON-LD ItemList (5 hardcoded top localities) and BreadcrumbList. Prerendered.

## /locality/:slug
- **File**: `WEB/src/pages/localities/LocalityTemplate.jsx` (998 lines) plus `WEB/src/components/locality/*`.
- **Data**: `WEB/src/data/localities.json` (4.9 MB, 3,215 entries), loaded on demand.
  - Fields: `id, name, slug (bare), city, entityType, canonicalUrl, aliases, parentLocality, geo, sourceCoverage, sourceUrls, confidence, lastVerifiedAt, numericId, seo{title,description,keywords}, description, contentBlocks{overview,connectivity,marketSignals,nearby}`.
- **Slug format**: `{bare-slug}-{citySlug}`, where citySlug is the city lowercased with gurugram → gurgaon.
  - Lookup is an exact match first, then it strips `-gurgaon` and matches the bare slug, so bare slugs also resolve (duplicate URLs).
  - An unknown slug does a client-side redirect to `/properties` (`LocalityTemplate.jsx:612-614`); there is no 404.
- **Canonical mismatch**:
  - The page's canonical is `/locality/{slug}-{citySlug}` (L622, L671).
  - The sitemap uses the data's `canonicalUrl`, which always ends in `-gurgaon`.
  - For the 17 non-Gurgaon entries they differ. Example: the sitemap has `/locality/crossing-republik-gurgaon`, but that page's canonical is `/locality/crossing-republik-ghaziabad`.
  - NearbyLocalities also hardcodes `-gurgaon`.
- **API**: only GET `/properties/recommendations?limit=12` (PropertyTwo → `propertyStore.fetchRecommendations`), handled at `BE/app/api/api_v1/endpoints/properties.py:382` (`CursorPage[Property]`).
  - **The listings are not filtered by locality**, even though GET `/properties` supports `locality` and `city` (`properties.py:120-121`).
- **Interactive**:
  - Share buttons: WhatsApp, Facebook, X, LinkedIn, copy link (with UTM tags).
  - Section anchor chips.
  - FAQ accordion with 4 template questions per entity type (`LocalityFaq.jsx`).
  - CTAs to `/contact`; sidebar cards that change by entity type.
- **SEO**:
  - Title is `seo.title`, otherwise "{name} {city} - Property Prices, Reviews & Locality Guide | 360 Ghar". Description is `seo.description`, otherwise a template.
  - JSON-LD: BreadcrumbList, Place (with geo when present), WebPage (`dateModified` = `lastVerifiedAt`), FAQPage, an Organization reference.
  - No noindex path at all.
  - In the sitemap: 3,215 pages × en/hi. Prerendered: only 9 seed pages.

## /locality/:slug/:intent
- **File**: `WEB/src/pages/localities/SocietyLanding.jsx`
- **Data**: `localities.json` and `WEB/src/data/locality-landmarks.json` (27 entries). No API calls.
- **Valid `:intent`**: `buy` and `rent` only. Anything else quietly renders as buy, with the canonical pointing to `/buy`.
- **Which slugs get intent pages** in the sitemap: 3,170 entities × 2 intents — those whose type is society, project, locality, sector, township or phase, or whose name matches a regex (`WEB/scripts/lib/localitySitemap.mjs:12-31`). The page itself renders for any entity it finds.
  - Lookup only strips `-gurgaon`, so `-ghaziabad`-style slugs show "Society Not Found".
- **Canonical bug**:
  - The canonical is `/locality/{bare slug}/{intent}` (~L165-167), while the sitemap, prerender list and inbound links use `/locality/{slug}-gurgaon/{intent}`.
  - The "Explore More" links also use the bare slug; the breadcrumb hardcodes `{slug}-gurgaon`.
  - The title always says "Flats for …", even when the heading says "Properties".
- **Interactive**:
  - "Browse for Sale/Rent" goes to `/properties?city=&purpose=&locality=`.
  - FAQ accordion (3 template questions); `AiFactSheet`.
- **SEO**: noindex while loading and when not found. JSON-LD BreadcrumbList, CollectionPage (about a Place), FAQPage.

## /careers, /careers/:slug
- **Files**: `WEB/src/pages/core/Careers.jsx`, `WEB/src/pages/core/CareerDetails.jsx`
- **Data: static.** `WEB/src/data/careers.js` (87 lines), 4 openings. The listing hides any with `status: 'closed'`.
- **Slugs**:

| Slug | Posted | Status |
|---|---|---|
| `content-creator-internship` | 2026-06-01 | open |
| `real-estate-agent` | 2026-06-08 | open |
| `founders-office-intern` | 2026-08-06 | open |
| `software-developer-intern` | — | closed 2026-08-05; noindex, listed in `noindexPrerenderRoutes` |

- **Interactive**:
  - The listing has a search box (title and description) and a category dropdown derived from the title (content / engineering / sales / other).
  - Applying is **mailto only**. The detail page's "Apply Now" is `mailto:info@360ghar.com` with the subject "Application for {title} - Career at 360Ghar".
  - The longer descriptions are hardcoded in `CAREER_DETAILS_LAYOUT`. No form, no backend.
- **SEO, list**:
  - `seo.json` `careers.*`.
  - JSON-LD: CollectionPage with a JobPosting for each open role, plus `careerFaqStructuredData` (`WEB/src/seo/structuredData.js:1552`).
  - Every JobPosting hardcodes 15000 INR/MONTH and INTERN, including the Real Estate Agent role. `validThrough` is the later of posted + 60 days and today + 30 days.
- **SEO, detail**:
  - "{title} at 360Ghar | Internships"; canonical `/careers/{slug}`; JobPosting only for open roles.
  - A closed role gets noindex and no schema.
  - An unknown slug shows "Career Not Found" with noindex, but returns HTTP 200.

## /vs/* (10 pages): one template
- **Template**: `WEB/src/pages/compare/ComparePage.jsx` (322 lines). Each `vs-*.jsx` is a 24-line wrapper that passes a competitor object, i18n `compare.json` `<key>.pageTitle/pageDescription`, and `canonicalPath`.
- **Data**: `WEB/src/data/competitors.js` (684 lines). Each competitor has:
  - id, name, fullName, founded, valuation, users, cities, logo, tagline, website, strengths, weaknesses, seoKeywords.
  - `claimsVsReality`: 5 for nobroker and magicbricks, 3 for the rest.
  - `testimonials`: 5 × `{text, author}`. `faqs`: 6.
  - `comparisonFeatures`: keyed to a shared list of 10 features.
  - The file also has `ourAdvantages` (6) and `generateCompetitorBreadcrumbs`. Shared UI is in `WEB/src/components/compare/ComparisonComponents.jsx`.

| Route | Data key / id | Links to truth page |
|---|---|---|
| `/vs/nobroker` | nobroker | `/truth/nobroker-listings` |
| `/vs/magicbricks` | magicbricks | `/truth/magicbricks-spam` |
| `/vs/99acres` | '99acres' | `/truth/99acres-fake` |
| `/vs/housing` | housing | – |
| `/vs/commonfloor` | commonfloor | – |
| `/vs/proptiger` | proptiger | – |
| `/vs/squareyards` | squareyards | – |
| `/vs/nestaway` | nestaway | `/truth/nestaway-collapse` |
| `/vs/zolo` | zolo | `/truth/zolo-issues` |
| `/vs/stanza-living` | **stanza** (id doesn't match the route) | – |

- **Sections, in order**: hero, at-a-glance stats, QuickComparison (first 5 features), a 10-feature ComparisonTable, ClaimsVsReality, WhyChooseUs, testimonials, FAQ (a plain list, not an accordion), See Also, CTA, newsletter.
  - See Also shows the truth link plus the first 3 other competitors in the data order, which is almost always nobroker, magicbricks and 99acres.
- **Interactive**: only links and the newsletter.
- **SEO**:
  - Canonical `/vs/{slug}`. JSON-LD BreadcrumbList, WebPage, FAQPage (6).
  - Bug: in the breadcrumb, item 2 is `https://360ghar.com/vs`, which is caught by the `/:citySlug` route and shows a noindexed CityHub.
  - Bug: item 3 is `/vs/{id}`, so for Stanza it becomes `/vs/stanza`, which is a 404.

## /truth/* (5 pages): one template
- **Template**: `WEB/src/pages/truth/TruthPage.jsx` (279 lines). Wrappers (50-55 lines) pass the competitor, `seo.json` `truth.<key>.title/description`, `canonicalPath`, `truthTitle`, `introText` and `keyIssues` (`{title, description, source}`, hardcoded English).
  - It reuses the competitor's `claimsVsReality`, `testimonials` and `faqs`, plus the shared ComparisonComponents (IssueCard is only used here).
- **Slugs**: `nobroker-listings` (4 issues), `magicbricks-spam` (4), `99acres-fake` (4), `nestaway-collapse` (4), `zolo-issues` (5).
- **Interactive**: only links and the newsletter.
- **SEO**:
  - JSON-LD BreadcrumbList, Article, FAQPage.
  - The Article's `datePublished` and `dateModified` are set to the current time on every render (L56-57).
  - The breadcrumb's item 3 URL is `/truth/{id}` (e.g. `/truth/nobroker`, a 404) and is named "360 Ghar vs X". Item 2, `/truth`, shows a noindexed CityHub.
  - The body is hardcoded English, so `/hi/truth/*` pages have a Hindi title over English content.

**Templates:** the 10 `/vs` pages share one template and the 5 `/truth` pages share another. Both use the same data (`competitors.js`) and the same ComparisonComponents. The NRI, security-deposit and list-property-free guides all follow the same layout (breadcrumb, FAQ and HowTo arrays, accordion, FAQ/HowTo schema), but it is copied into each file rather than shared.

---

## Backend gaps (backend wins)
1. **Blog filter parameters don't match.** The frontend sends `category` and `tag` (`BlogClassicSection.jsx:34-35,63-64`; sidebar links build `?category=`/`?tag=`). The backend only accepts `categories`, `tags` and `keywords` (`BE/app/api/api_v1/endpoints/blog.py:105-107`), so filtering never works.
2. **No referral endpoint.** `ReferralForm.jsx:152-161` fakes success. Searching `BE/app/api` for "referral" finds nothing.
3. **No contact or lead endpoint.** Contact goes to Formspree `mwpqglyb`, the newsletter to Formspree `mkgzdjyj`, and the FAQ-page form submits nowhere (`ValidationForm.jsx:26-31`).
4. **No careers or job-application API.** Openings are static (`WEB/src/data/careers.js`) and applying is by mailto only.
5. **No locality model or API.** The browser downloads the 4.9 MB `localities.json` and the 611 KB index. The backend has no Locality model; the nearest slug-based endpoints are data-hub zoning, circle-rates and builders. Locality pages show unfiltered `/properties/recommendations` although `/properties?locality=` exists (`properties.py:120-121`).
6. **The FAQ source is duplicated.** `/faqs/public` exists (`core.py:428`) with 5 seeded FAQs, but `/faq` uses 5 hardcoded ones.
7. **Policy pages**:
   - The frontend ignores `PagePublicResponse.format` and always renders markdown.
   - The seeded page `platform-policies` has no route.
   - `PageCreate` defaults to `is_private=True` (`BE/app/schemas/core.py:65`), so any page an admin creates returns 404 on `/public` until it's made public.
   - Every fetch adds to `view_count` (`BE/app/services/core.py:206+`), and the listing fetches all 5.
8. **Blog fields**:
   - `BlogPost` has no author fields (`author_slug`/`author_name`), so the byline is always the default.
   - The backend `canonical_url` is ignored.
   - `seo_metadata.schema_markup` is merged under a forced BlogPosting type.
   - Numeric ids work in the API but are never used in URLs.
9. **Celebrity blog links.** All 16 `/celebrity-homes` slugs are missing from the published-post sitemap (20 posts).
10. **MCP tool names.** The names on `/ai-agent` (`AIAgentData.jsx:93-126`) don't match the backend's names (`discovery_search`, `visits_schedule`, `owner_rent_status`, and so on).
11. **No CMS for most content.** The glossary, compare/truth pages, the three guides, AI Agent, the careers details, the celebrity list and the `/links` list are all in frontend code. The only backend place that could hold them is the generic Pages API (`format=json` with `custom_config`).