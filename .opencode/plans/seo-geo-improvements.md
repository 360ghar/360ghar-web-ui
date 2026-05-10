# SEO/GEO Improvement Plan — feat/hindi-i18n Branch

## Overview
This plan covers all SEO and GEO improvements identified during the review of the `feat/hindi-i18n` branch vs `main`. 15 items across 3 phases.

---

## Phase 1: Pre-Merge Blockers (Critical)

### 1.1 Translate Hard-Coded English SEO Metadata

**Problem:** ~46 pages pass hard-coded English strings to `<SEO>` component, so on `/hi/` URLs the `<title>`, `<meta description>`, `og:title`, and `og:description` are in English while page content is Hindi. Google may treat as language mismatch/soft-404.

**Solution:**
1. Populate `src/i18n/locales/en/seo.json` and `src/i18n/locales/hi/seo.json` with all missing SEO key-value pairs
2. Update each page to use `t('seo:key')` instead of hard-coded strings

**Pages needing changes (grouped by namespace):**

#### Home page (`home` namespace — already has `seo.title`/`seo.description`)
- `src/pages/Home.jsx:134` — Change `title={siteMetadata.defaultTitle}` to `title={t('home:seo.title')}` and `description={siteMetadata.defaultDescription}` to `description={t('home:seo.description')}`
- Already imports `useTranslation` from i18next

#### Core pages (`seo` namespace)
- `src/pages/core/AboutUs.jsx:57` — `title={t('seo:about.title')}`, `description={t('seo:about.description')}`
- `src/pages/core/FaqPage.jsx:20` — `title={t('seo:faq.title')}`, `description={t('seo:faq.description')}`
- `src/pages/core/Contact.jsx:19` — Add `description={t('seo:contact.description')}` (title already uses `t()`)
- `src/pages/core/Policies.jsx:139` — `title={t('seo:policies.title')}`, `description={t('seo:policies.description')}`
- `src/pages/core/PolicyDetails.jsx:80` — `description={t('seo:policyDetails.description', { title })}`
- `src/pages/core/NotFound.jsx:15` — `title={t('seo:notFound.title')}`, `description={t('seo:notFound.description')}`
- `src/pages/core/ReferAndEarn.jsx:33` — `title={t('seo:referAndEarn.title')}`, `description={t('seo:referAndEarn.description')}`
- `src/pages/core/CelebrityHomesHub.jsx:136` — `title={t('seo:celebrityHomes.title')}`, `description={t('seo:celebrityHomes.description')}`
- `src/pages/core/AIAgent.jsx:60` — `title={t('seo:aiAgent.title')}`, `description={t('seo:aiAgent.description')}` (needs `useTranslation` import)
- `src/pages/core/ForAI.jsx:10` — `title={t('seo:forAI.title')}`, `description={t('seo:forAI.description')}`
- `src/pages/core/Careers.jsx:23` — `title={t('seo:careers.title')}`, `description={t('seo:careers.description')}`
- `src/pages/core/CareerDetails.jsx:59,144` — Not found: `title={t('seo:careerDetails.notFoundTitle')}`, Dynamic: keep template but wrap English parts with `t()`
- `src/pages/core/Glossary.jsx:52` — `title={t('seo:glossary.title')}`, `description={t('seo:glossary.description')}`
- `src/pages/core/ListPropertyFree.jsx:100` — `title={t('seo:listPropertyFree.title')}`, `description={t('seo:listPropertyFree.description')}`
- `src/pages/core/NriPropertyGuide.jsx:105` — `title={t('seo:nriPropertyGuide.title')}`, `description={t('seo:nriPropertyGuide.description')}`

#### Property pages (`seo` namespace)
- `src/pages/properties/Property.jsx:47` — `title={t('seo:properties.title')}`, `description={t('seo:properties.description')}`
- `src/pages/properties/PropertyDetails.jsx:167` — Update fallbacks to use `t('seo:propertyDetails.fallbackTitle')` and `t('seo:propertyDetails.fallbackDescription')`
- `src/pages/properties/PropertySidebar.jsx:16` — `title={t('seo:propertySidebar.title')}`, `description={t('seo:propertySidebar.description')}`
- `src/pages/properties/PostProperty.jsx:369` — `title={t('seo:postProperty.title')}`, `description={t('seo:postProperty.description')}`
- `src/pages/properties/VirtualTourPage.jsx:64` — `title={t('seo:virtualTour.fallbackTitle')}`

#### Locality pages (`seo` namespace)
- `src/pages/localities/LocalitiesDirectory.jsx:102` — `title={t('seo:localitiesDirectory.title')}`, `description={t('seo:localitiesDirectory.description')}`
- `src/pages/localities/SocietyLanding.jsx:74,126` — `title={t('seo:societyLanding.notFoundTitle')}` for 404 state

#### Data Hub pages (`seo` namespace)
- `src/pages/data-hub/StampDutyCalculator.jsx:65` — `title={t('seo:stampDuty.title')}`, `description={t('seo:stampDuty.description')}`
- `src/pages/data-hub/AuctionSources.jsx:150` — `title={t('seo:auctionSources.title')}`, `description={t('seo:auctionSources.description')}` (needs `useTranslation` import)
- `src/pages/data-hub/PriceIndexPage.jsx:47,92` — `title={t('seo:priceIndex.notFoundTitle')}` for 404, keep dynamic template but wrap parts with `t()`
- `src/pages/data-hub/BankAuctions.jsx:157` — `title={t('seo:bankAuctions.title', { city: selectedCityLabel })}`, `description={t('seo:bankAuctions.description', { city: selectedCityLabel })}`
- `src/pages/data-hub/BankAuctionDetail.jsx:81` — `title={t('seo:bankAuctionDetail.fallbackTitle')}` for fallback
- `src/pages/data-hub/BuilderReputation.jsx:109` — `title={t('seo:builderReputation.title')}`, `description={t('seo:builderReputation.description')}`
- `src/pages/data-hub/BuilderReputationDetail.jsx:121,142,165` — Error/Not Found titles: `t('seo:builderReputationDetail.notFoundTitle')`, `t('seo:builderReputationDetail.errorTitle')`
- `src/pages/data-hub/RegulatoryUpdates.jsx:82` — `title={t('seo:regulatoryUpdates.title')}`, `description={t('seo:regulatoryUpdates.description')}`
- `src/pages/data-hub/ReraProjectDirectory.jsx:106` — `title={t('seo:reraProjectDirectory.title')}`, `description={t('seo:reraProjectDirectory.description')}`
- `src/pages/data-hub/VerifyOwnership.jsx:112` — `title={t('seo:verifyOwnership.title')}`, `description={t('seo:verifyOwnership.description')}`
- `src/pages/data-hub/ZoneChecker.jsx:128` — `title={t('seo:zoneChecker.title')}`, `description={t('seo:zoneChecker.description')}`
- `src/pages/data-hub/CircleRateDirectory.jsx:69` — `title={t('seo:circleRateDirectory.title')}`, `description={t('seo:circleRateDirectory.description')}`
- `src/pages/data-hub/CircleRateDetail.jsx:37,49` — `title={t('seo:circleRateDetail.notFoundTitle')}` for 404
- `src/pages/data-hub/ZoneCheckerDetail.jsx:70` — `title={t('seo:zoneCheckerDetail.title', { sector: sectorName })}`

#### Tools (`seo` namespace)
- `src/pages/tools/FakeListingChecker.jsx:55` — `title={t('seo:fakeListingChecker.title')}`, `description={t('seo:fakeListingChecker.description')}`

#### Landing pages (`seo` namespace)
- `src/pages/landing/CityHub.jsx:108` — `title={t('seo:cityHub.title', { city })}`, `description={t('seo:cityHub.description', { city })}`
- `src/pages/landing/NearOfficePage.jsx:67` — `title={t('seo:nearOffice.title', { name, city })}`, `description={t('seo:nearOffice.description', { name, city })}`

#### Blog (`seo` namespace)
- `src/components/blog/BlogDetailsSection.jsx:213` — `title={post?.title || t('seo:blog.fallbackTitle')}`, `description={post?.excerpt || t('seo:blog.fallbackDescription')}`

#### Truth pages (`seo` namespace — these 5 need `useTranslation` added)
- `src/pages/truth/99acres-fake.jsx:35` — `title={t('seo:truth.99acres.title')}`, `description={t('seo:truth.99acres.description')}`
- `src/pages/truth/magicbricks-spam.jsx:35` — `title={t('seo:truth.magicbricks.title')}`, `description={t('seo:truth.magicbricks.description')}`
- `src/pages/truth/nobroker-listings.jsx:35` — `title={t('seo:truth.nobroker.title')}`, `description={t('seo:truth.nobroker.description')}`
- `src/pages/truth/nestaway-collapse.jsx:35` — `title={t('seo:truth.nestaway.title')}`, `description={t('seo:truth.nestaway.description')}`
- `src/pages/truth/zolo-issues.jsx:40` — `title={t('seo:truth.zolo.title')}`, `description={t('seo:truth.zolo.description')}`

**Files to create/edit:**
1. `src/i18n/locales/en/seo.json` — Populate with all English SEO strings
2. `src/i18n/locales/hi/seo.json` — Populate with all Hindi SEO translations
3. Update ~46 page files to use `t()` for SEO props
4. Add `useTranslation` import to 3 files that don't have it yet (`AIAgent.jsx`, `AuctionSources.jsx`, `PriceIndexPage.jsx`)

---

### 1.2 Add hreflang to Locality + Dynamic Sitemaps

**Problem:** `sitemap-localities.xml` (3K+ pages), `sitemap-properties.xml`, `sitemap-blog.xml`, and `sitemap-projects.xml` have zero hreflang annotations and no Hindi URLs. Google can't discover Hindi versions of these pages.

**Solution:**

#### A. Fix locality sitemap (`scripts/lib/localitySitemap.mjs`)
1. Add `xmlns:xhtml="http://www.w3.org/1999/xhtml"` to the `<urlset>` namespace
2. For each entity, emit TWO `<url>` entries (English + Hindi) with `xhtml:link` alternates
3. Pattern: follow `generate-sitemaps.mjs` `buildAlternates()` logic

```javascript
// Before (English-only):
<url>
  <loc>https://360ghar.com/locality/slug</loc>
  <lastmod>...</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
</url>

// After (English + Hindi + hreflang):
<url>
  <loc>https://360ghar.com/locality/slug</loc>
  <lastmod>...</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
  <xhtml:link rel="alternate" hreflang="en" href="https://360ghar.com/locality/slug" />
  <xhtml:link rel="alternate" hreflang="hi" href="https://360ghar.com/hi/locality/slug" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://360ghar.com/locality/slug" />
</url>
<url>
  <loc>https://360ghar.com/hi/locality/slug</loc>
  <lastmod>...</lastmod>
  <changefreq>weekly</changefreq>
  <priority>0.7</priority>
  <xhtml:link rel="alternate" hreflang="en" href="https://360ghar.com/locality/slug" />
  <xhtml:link rel="alternate" hreflang="hi" href="https://360ghar.com/hi/locality/slug" />
  <xhtml:link rel="alternate" hreflang="x-default" href="https://360ghar.com/locality/slug" />
</url>
```

#### B. Fix dynamic sitemaps (`scripts/generate-dynamic-sitemaps.mjs`)
1. Update `urlTag()` to accept `alternates` parameter (same pattern as `generate-sitemaps.mjs`)
2. Add `URLSET_NS` with `xmlns:xhtml` namespace
3. For each property/blog/project, generate both English and Hindi URLs with hreflang alternates
4. For properties: `/property/:id` → also `/hi/property/:id`
5. For blog: `/blog/:slug` → also `/hi/blog/:slug`
6. For projects: `/project/:slug` → also `/hi/project/:slug`

**Files to edit:**
- `scripts/lib/localitySitemap.mjs`
- `scripts/generate-dynamic-sitemaps.mjs`

---

### 1.3 Generate Hindi AI Discovery Files

**Problem:** `llms.txt`, `llms-full.txt`, `llm-feed.json`, and `ai.txt` are English-only. Hindi AI queries won't surface 360Ghar.

**Solution:**

#### A. Add `inLanguage` to `llm-feed.json` (`src/seo/aiDiscovery.js`)
1. Add `inLanguage: ['en-IN', 'hi-IN']` to the feed metadata
2. Add Hindi search examples to `search_examples` array:
```javascript
{ query: 'गुड़गाँव में 2 BHK किराये पर', url: `${siteUrl}/hi/gurgaon/rent/flats` },
{ query: 'गुरुग्राम में फ्लैट खरीदें', url: `${siteUrl}/hi/gurgaon/buy/flats` },
{ query: 'गुरुग्राम में PG', url: `${siteUrl}/hi/gurgaon/pg/flats` },
```
3. Add Hindi page entries to `aiDiscoveryImportantPages` for key `/hi/` URLs:
```javascript
{ title: 'मुख्य पृष्ठ (Hindi)', url: `${siteUrl}/hi/`, category: 'hindi' },
{ title: 'प्रॉपर्टी (Hindi)', url: `${siteUrl}/hi/properties`, category: 'hindi' },
// ... top 10-15 Hindi pages
```

#### B. Add Hindi section to `llms-full.txt` (`src/seo/aiDiscovery.js`)
Add a `## Hindi (हिंदी) Content` section to `llmsFullTxt` with:
- Key Hindi URLs
- Hindi description of 360Ghar
- Note about `/hi/` prefix for Hindi content

#### C. Update `ai.txt` (`src/seo/aiDiscovery.js`)
Add `Language-Available: en, hi` line after `Purpose:` line.

**Files to edit:**
- `src/seo/aiDiscovery.js`
- Re-run `scripts/write-ai-discovery.mjs` to regenerate public files

---

## Phase 2: High Priority

### 2.4 Add FAQ + HowTo Schemas to 5 Incomplete Tool Pages

**Problem:** AreaConverter, AreaCalculator, LoanEligibilityCalculator, VastuChecker, and PropertyChecklist pages only have BreadcrumbList + SoftwareApplication schema. Missing FAQ and HowTo schemas reduces AI citability.

**Solution:** For each page, add:
1. **FAQ schema** (4-5 questions relevant to the tool) using `generateFaqStructuredData()`
2. **HowTo schema** (step-by-step usage guide) using `generateHowToStructuredData()`

Follow the pattern established in `EmiCalculator.jsx` which has both.

**Example for AreaConverter:**
```javascript
const faqData = generateFaqStructuredData([
  { question: 'How do I convert sq ft to sq m?', answer: '...' },
  { question: 'What is 1 bigha in sq ft?', answer: '...' },
  // ...
]);

const howToData = generateHowToStructuredData({
  name: 'How to Use the Area Converter',
  description: 'Convert between Indian area units step by step',
  steps: [
    { name: 'Select input unit', text: '...' },
    { name: 'Enter the value', text: '...' },
    // ...
  ],
});
```

**Files to edit:**
- `src/pages/tools/AreaConverter.jsx`
- `src/pages/tools/AreaCalculator.jsx`
- `src/pages/tools/LoanEligibilityCalculator.jsx`
- `src/pages/tools/VastuChecker.jsx`
- `src/pages/tools/PropertyChecklist.jsx`

### 2.5 Fix Blog SEO Component to Pass OG Article Metadata

**Problem:** `BlogDetailsSection.jsx` doesn't pass `type="article"`, `articlePublishedTime`, `articleModifiedTime`, `articleSection`, or `articleTags` to `<SEO>`. This means OG article extensions aren't rendered, losing freshness signals.

**Solution:** Update the `<SEO>` call in `BlogDetailsSection.jsx` to:
```jsx
<SEO
  title={...}
  description={...}
  canonical={...}
  image={...}
  type="article"
  articlePublishedTime={seoMeta.publishedAt}
  articleModifiedTime={seoMeta.updatedAt}
  articleSection={seoMeta.articleSection}
  articleTags={seoMeta.articleTags}
  structuredData={...}
/>
```

Ensure the `seoMeta` object in `BlogDetailsSection.jsx` includes `publishedAt`, `updatedAt`, `articleSection`, and `articleTags` fields derived from the blog post data.

**Files to edit:**
- `src/components/blog/BlogDetailsSection.jsx`

### 2.6 Replace Placeholder Founder Data in Person Schema

**Problem:** `structuredData.js:452-475` uses `'360Ghar Founder'` and a generic LinkedIn URL instead of actual data from `authors.js`.

**Solution:** Import from `authors.js` and use real data:
```javascript
import { authors } from '../data/authors';

// In person schema:
name: authors['saksham-mittal'].name,  // 'Saksham Mittal'
jobTitle: authors['saksham-mittal'].title,  // 'Founder & CEO'
image: `https://360ghar.com${authors['saksham-mittal'].image}`,
sameAs: [authors['saksham-mittal'].linkedin, 'https://twitter.com/360ghar'],
knowsAbout: authors['saksham-mittal'].credentials.split(', '),
description: authors['saksham-mittal'].bio,
```

**Files to edit:**
- `src/seo/structuredData.js`

### 2.7 Add Hindi RSS Feed Variants

**Problem:** All 3 RSS feeds (`blog.xml`, `properties.xml`, `localities.xml`) use `<language>en-in</language>` with no Hindi alternates.

**Solution:**
1. In `scripts/generate-rss.mjs`, for each feed, generate a Hindi variant with:
   - `<language>hi-in</language>`
   - Hindi channel title/description
   - `/hi/` prefixed URLs
   - Same items but with Hindi URLs
2. Write Hindi feeds to `public/rss/hi-blog.xml`, `public/rss/hi-properties.xml`, `public/rss/hi-localities.xml`
3. Add Hindi sub-feeds to the main `rss.xml` index
4. Add Hindi feed entries to `aiDiscoveryImportantPages`

**Files to edit:**
- `scripts/generate-rss.mjs`
- `src/seo/aiDiscovery.js` (add RSS feed URLs)

### 2.8 Add Accept-Language Redirect in Middleware

**Problem:** No server-side language detection. Hindi browser users arriving at `360ghar.com` always see English.

**Solution:** In `functions/_middleware.js`, add:
1. Check `Accept-Language` header for Hindi preference (`hi`, `hi-IN`)
2. If user navigates to root `/` and prefers Hindi, redirect to `/hi`
3. Only redirect on HTML requests (not assets, API, markdown)
4. Set a cookie `__locale=hi` so we don't redirect on every request
5. Respect existing `/hi/` prefix (don't double-redirect)

```javascript
// Pseudocode
if (url.pathname === '/' && !hasLocaleCookie(request, 'hi')) {
  const acceptLang = request.headers.get('Accept-Language') || '';
  if (acceptLang.match(/^hi/i)) {
    return new Response(null, {
      status: 302,
      headers: { Location: '/hi', 'Set-Cookie': '__locale=hi; Path=/; Max-Age=31536000' }
    });
  }
}
```

**Files to edit:**
- `functions/_middleware.js`

### 2.9 Add Security + Multilingual Headers to `_headers`

**Problem:** Missing `Content-Security-Policy`, `Strict-Transport-Security`, `Referrer-Policy`, `Permissions-Policy`, and `Vary: Accept-Language`.

**Solution:** Add to `public/_headers`:
```
/*
  Cache-Control: public, max-age=0, must-revalidate
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(self)
  Vary: Accept-Language
```

**Files to edit:**
- `public/_headers`

---

## Phase 3: Polish

### 3.10 Add `inLanguage` to All Structured Data Schemas

**Problem:** Most schema types in `structuredData.js` lack `inLanguage` property, reducing citability for Hindi AI queries.

**Solution:** Add `inLanguage: ['en-IN', 'hi-IN']` to:
- `organization` schema
- `knowledgePanel` schema
- `mobileApplication` schema
- `generateBlogStructuredData()` — add `inLanguage` parameter
- `generatePropertyStructuredData()` / `generatePropertyProductStructuredData()`
- `generateLocalityStructuredData()`
- `generateFaqStructuredData()` / `generatePropertyFaqStructuredData()` / `generateLocalityFaqStructuredData()`

In each page component, pass `inLanguage` based on current locale.

**Files to edit:**
- `src/seo/structuredData.js`
- Multiple page files to pass `inLanguage`

### 3.11 Localize Compare Page Structured Data URLs

**Problem:** Compare pages use `t()` for SEO title/description (already done), but their structured data URLs are hardcoded to English.

**Solution:** In each `vs-*.jsx` page, use locale-aware URLs for BreadcrumbList structured data. Import `useLocaleStore` or `useParams` to detect current locale and prefix URLs with `/hi/` when in Hindi.

**Files to edit:**
- `src/pages/compare/vs-*.jsx` (10 files)

### 3.12 Align ai.txt/robots.txt Bot Names + Add Missing AI Crawlers

**Problem:** Bot names are inconsistent between `ai.txt` and `robots.txt`. Missing newer AI crawlers.

**Solution:**
1. In `robots.txt`, add dedicated User-agent sections for:
   - `CCBot`
   - `Bytespider`
   - `PetalBot`
   - `Applebot-Extended`
   - `Meta-ExternalAgent`
   - `Amazonbot`
   - `CohereBot`
   - `YouBot`
   - `KagiBot`
2. In `aiDiscovery.js`, update `Bots-Allow` list to match `robots.txt` names exactly
3. Remove `Claude-Web` from ai.txt (not a real user-agent; `ClaudeBot` and `Claude-SearchBot` cover Anthropic)
4. Replace `OpenAI-User` with `ChatGPT-User` in ai.txt

**Files to edit:**
- `public/robots.txt`
- `src/seo/aiDiscovery.js` (ai.txt generation)

### 3.13 Add Hindi Search Examples to `llm-feed.json`

Covered in Phase 1.3 above.

### 3.14 Populate `seo.json` Locale Files

Covered in Phase 1.1 above — this is the primary deliverable of that phase.

### 3.15 Add `/hi/` Trailing-Slash Redirects

**Problem:** English pages have trailing-slash 301s in `_redirects`, but Hindi equivalents do not.

**Solution:** Add `/hi/` trailing-slash redirects mirroring all existing English ones:
```
/hi/vastu-checker/    /hi/vastu-checker    301
/hi/area-calculator/  /hi/area-calculator  301
/hi/emi-calculator/   /hi/emi-calculator   301
... (all 32 existing redirects duplicated with /hi/ prefix)
```

**Files to edit:**
- `public/_redirects`

---

## Execution Order

1. **Phase 1.1** — Populate `seo.json` files + update ~46 pages (largest task, most impactful)
2. **Phase 1.2** — Fix locality + dynamic sitemaps (high SEO impact)
3. **Phase 1.3** — Hindi AI discovery files (GEO impact)
4. **Phase 2.5** — Blog OG article metadata (quick fix)
5. **Phase 2.6** — Founder Person schema fix (quick fix)
6. **Phase 2.9** — Security headers (quick fix)
7. **Phase 2.4** — FAQ + HowTo schemas for 5 tool pages (medium effort)
8. **Phase 2.7** — Hindi RSS feeds (medium effort)
9. **Phase 2.8** — Accept-Language redirect (medium effort)
10. **Phase 3.10** — `inLanguage` on all schemas (medium effort, many files)
11. **Phase 3.12** — Bot name alignment (quick fix)
12. **Phase 3.15** — Hindi trailing-slash redirects (quick fix, many lines)
13. **Phase 3.11** — Localize compare page structured data URLs (low priority)

---

## Validation

After implementation:
1. `npm run build` — ensure build succeeds
2. `npm run lint` — fix all ESLint issues
3. Manual verification with `npm run dev`:
   - Visit `/hi/` pages and verify `<title>` and `<meta name="description">` are in Hindi
   - Check `view-source` for hreflang tags on `/hi/` pages
   - Verify `sitemap-localities.xml` contains `xhtml:link` alternates
   - Verify `llm-feed.json` has `inLanguage` and Hindi examples
   - Verify `_headers` includes security headers
   - Test `/hi/emi-calculator/` redirects to `/hi/emi-calculator`
4. Use Google Rich Results Test to verify structured data
5. Use browser DevTools to verify OG meta tags on blog posts
