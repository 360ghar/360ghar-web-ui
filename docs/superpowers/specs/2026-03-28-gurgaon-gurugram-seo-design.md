# Gurgaon/Gurugram Dual SEO Optimization

**Date:** 2026-03-28
**Goal:** Ensure 360Ghar ranks for both "Gurgaon" and "Gurugram" search queries by fixing duplicate content risk, adding 301 redirects, and enhancing keyword coverage.

## Context

"Gurgaon" is the colloquial/legacy name with higher search volume. "Gurugram" is the official name used in branding. The codebase already has a dual-targeting strategy but has a critical duplicate content risk: both `/gurugram/buy/flats` and `/gurgaon/buy/flats` exist as separate landing pages in the sitemap serving identical content, with no canonical or redirect relationship between them.

## Strategy

- **Gurgaon** = canonical URL slug (higher search volume)
- **Gurugram** landing pages → 301 redirect to Gurgaon equivalents
- Both spellings in meta keywords, structured data, and SEO tags across all pages
- No changes to visible user-facing text (already uses "Gurugram" consistently)

## Changes

### 1. Netlify 301 Redirects (`public/_redirects`)

Add redirect rules **before** the SPA catch-all for programmatic landing pages:

```
/gurugram/:intent/:type  /gurgaon/:intent/:type  301
/gurugram/:intent/:type/:bhk  /gurgaon/:intent/:type/:bhk  301
/gurugram/:intent/:type/budget/:budget  /gurgaon/:intent/:type/budget/:budget  301
/gurugram/:intent/:type/amenity/:amenity  /gurgaon/:intent/:type/amenity/:amenity  301
```

Only affects programmatic landing pages. Static routes like `/gurugram-real-estate-guide` remain unchanged (they have no duplicate).

### 2. Remove "Gurugram" from Sitemap City List (`scripts/generate-sitemaps.mjs`)

Remove `'Gurugram'` from the `cities` array (line ~79) and `priorityCities` array (line ~117). Since `/gurugram/` URLs now 301 to `/gurgaon/`, they should not appear in sitemaps.

**Before:** `['Gurugram', 'Gurgaon', 'Delhi', ...]`
**After:** `['Gurgaon', 'Delhi', ...]`

### 3. Landing Page Canonical Belt-and-Suspenders (`src/pages/landing/Landing.jsx`, `FacetLanding.jsx`)

As a safety net (in case pages are accessed client-side before redirect fires), normalize citySlug for canonical URL computation:

```jsx
const canonicalCity = citySlug === 'gurugram' ? 'gurgaon' : citySlug;
```

Use `canonicalCity` when constructing the canonical URL passed to the `<SEO>` component.

### 4. SEO.jsx Global Meta Tags (`src/common/SEO.jsx`)

Update hardcoded meta tags to include both spellings:

| Meta Tag | Current | Updated |
|----------|---------|---------|
| `businessLocation` | `Gurgaon, Haryana` | `Gurgaon, Gurugram, Haryana` |
| `serviceArea` | `Gurgaon, Delhi, Noida, Faridabad, Ghaziabad` | `Gurgaon, Gurugram, Delhi, Noida, Faridabad, Ghaziabad` |
| `DC.coverage` | `Gurgaon, Haryana, India` | `Gurgaon, Gurugram, Haryana, India` |
| `geo.placename` | Already has both | No change |

### 5. Page-Level Keywords Audit

Ensure every page's `keywords` meta tag includes both "Gurgaon" and "Gurugram" variants. Pages to update (those missing one variant):

- `src/pages/core/AboutUs.jsx` — ensure both in keywords
- `src/pages/core/Contact.jsx` — ensure both in keywords
- `src/pages/core/FaqPage.jsx` — ensure both in keywords
- `src/pages/properties/Property.jsx` — ensure both in keywords
- `src/pages/blogs/BlogClassic.jsx` — ensure both in keywords
- `src/pages/localities/LocalitiesDirectory.jsx` — ensure both in keywords

For each page: if keywords contain "Gurgaon" but not "Gurugram" (or vice versa), add the missing variant.

### 6. Locality Pages — Keywords Only

No changes to titles or descriptions (per user decision). The `entityNormalization.mjs` script (line ~95) already injects both spellings into SEO keywords for all 3,195 locality entries. Verified working — no changes needed.

## Files Modified

1. `public/_redirects` — add 4 redirect rules
2. `scripts/generate-sitemaps.mjs` — remove "Gurugram" from cities/priorityCities arrays
3. `src/pages/landing/Landing.jsx` — canonical URL normalization
4. `src/pages/landing/FacetLanding.jsx` — canonical URL normalization
5. `src/common/SEO.jsx` — update 3 hardcoded meta tags
6. `src/pages/core/AboutUs.jsx` — keywords enhancement
7. `src/pages/core/Contact.jsx` — keywords enhancement
8. `src/pages/core/FaqPage.jsx` — keywords enhancement
9. `src/pages/properties/Property.jsx` — keywords enhancement
10. `src/pages/blogs/BlogClassic.jsx` — keywords enhancement
11. `src/pages/localities/LocalitiesDirectory.jsx` — keywords enhancement

## Verification

1. **Build check:** `npm run build` succeeds (sitemaps regenerate without "Gurugram" landing URLs)
2. **Sitemap check:** `public/sitemap-landing.xml` contains only `/gurgaon/` URLs, no `/gurugram/` duplicates
3. **Redirect check:** Deploy to Netlify preview, verify `curl -I https://preview.360ghar.com/gurugram/buy/flats` returns 301 to `/gurgaon/buy/flats`
4. **Canonical check:** Visit `/gurgaon/buy/flats`, inspect `<link rel="canonical">` points to `https://360ghar.com/gurgaon/buy/flats`
5. **Meta check:** View page source on any page, confirm `businessLocation`, `serviceArea`, `DC.coverage` include both spellings
6. **Keywords check:** Spot-check 3-4 pages' `<meta name="keywords">` includes both "Gurgaon" and "Gurugram"
7. **Static routes intact:** `/gurugram-real-estate-guide` still works (no redirect)
