# Landing Pages

Landing pages are the programmatic SEO engine of 360Ghar. They generate thousands of indexable, intent-specific URLs from city/intent/type combinations and facet them by BHK, budget, and amenity. They live in `src/pages/landing/` and are the primary driver of organic traffic, funneling users into `/properties` search and the locality directory.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/:citySlug` | `src/pages/landing/CityHub.jsx` | City hub: links to all intents/types/localities |
| `/:citySlug/:intent/:type` | `src/pages/landing/Landing.jsx` | Programmatic landing (e.g. `/gurgaon/rent/flats`) |
| `/:citySlug/:intent/:type/:bhk` | `src/pages/landing/FacetLanding.jsx` | BHK facet (e.g. `/gurgaon/buy/flats/2-bhk`) |
| `/:citySlug/:intent/:type/budget/:budget` | `src/pages/landing/FacetLanding.jsx` | Budget facet (e.g. `/budget/under-20k`) |
| `/:citySlug/:intent/:type/amenity/:amenity` | `src/pages/landing/FacetLanding.jsx` | Amenity facet (e.g. `/amenity/parking`) |
| `/near/:slug` | `src/pages/landing/NearOfficePage.jsx` | "Properties near X" landing |

Supporting files:

| File | Purpose |
|------|---------|
| `src/hooks/useLocalitiesIndex.js` | Loads the localities index for a city |
| `src/utils/internalLinks.js` | `normalizeCitySlug`, `getCityLocalities`, `getRelatedLandingLinks`, `getBhkFacetLinks`, `getBudgetFacetLinks`, `getPriceRange` |
| `src/utils/propertyFilters.js` | `buildPropertySearchQuery` translates route into `/properties` query |
| `src/utils/propertyTaxonomy.js` | `getPropertyRouteSlug`, `getPropertyTypeLabel`, `normalizePropertyTypeToken` |
| `src/utils/landingKeywords.js` | `buildLandingKeywords`, `buildFacetKeywords` for SEO |
| `src/seo/indexationPolicy.js` | `isIndexableCitySlug`, `isIndexableFacetLanding` decide what to index |
| `src/components/landing/LandingPageContent.jsx` | Shared body for landing and facet pages |
| `src/components/seo/AiFactSheet.jsx` | AI-friendly fact sheet block |
| `scripts/generate-sitemaps.mjs` | Generates `sitemap-landing.xml` |
| `scripts/ingest-gurgaon-entities.mjs` | Entity ingestion that feeds city/locality data |

## Programmatic SEO Strategy

The strategy is to enumerate every meaningful (city, intent, type, facet) combination and render a unique, indexable page for each. Intents are constrained to `['buy', 'rent', 'pg']`. Types are normalized through `normalizePropertyTypeToken`. For each combination:

1. **City hub** (`/:citySlug`) lists all intents, types, and localities for the city.
2. **Landing** (`/:citySlug/:intent/:type`) is the canonical page for that intent+type, e.g. "2 BHK flats for rent in Gurugram".
3. **Facets** layer on BHK, budget, or amenity to capture long-tail queries.

Each page renders `LandingPageContent`, which shows:
- An H1 and intro specific to the combination
- Live property results from `buildPropertySearchQuery` -> `/properties`
- Internal links to related facets and localities (via `getRelatedLandingLinks`, `getBhkFacetLinks`, `getBudgetFacetLinks`)
- An `AiFactSheet` block for AI/LLM discoverability
- FAQs built by `buildLandingFaqs` / `buildFacetFaqs` (translated through the `landing` namespace, including Hindi transliterations)

## Page Details

### CityHub (`/:citySlug`)

The city-level hub. Loads the localities index via `useLocalitiesIndex`, lists city landing links (`getCityLandingLinks`), city localities, and reviews (`ReviewDisplay`). Emits `BreadcrumbList` structured data. Indexation is gated by `isIndexableCitySlug` so non-target cities are `noindex`.

### Landing (`/:citySlug/:intent/:type`)

The canonical programmatic landing. Validates intent against `VALID_INTENTS`, normalizes the city and type tokens, and renders `LandingPageContent`. Builds keywords via `buildLandingKeywords`, FAQs via `buildLandingFaqs`, and breadcrumbs via `generateBreadcrumbStructuredData`. Uses `Helmet` (react-helmet-async) for fine-grained head control on top of the `SEO` component. Indexation gated by `isIndexableCitySlug`. The `pretty()` helper title-cases slugs for display. A colocated `Landing.ssr.test.jsx` and `Landing.test.jsx` guard rendering.

### FacetLanding (`/:citySlug/:intent/:type/:bhk` | `/budget/:budget` | `/amenity/:amenity`)

Handles all three facet types in one component. Detects which facet is active from the URL (BHK path segment, `budget/` prefix, or `amenity/` prefix), validates, and renders `<Navigate>` for invalid combos. Builds facet-specific FAQs via `buildFacetFaqs` with Hindi transliteration variables, keywords via `buildFacetKeywords`, and internal links via `getBhkFacetLinks` / `getBudgetFacetLinks`. Uses `DOMPurify` to sanitize any user-influenced strings. Indexation gated by `isIndexableFacetLanding`. A colocated `FacetLanding.ssr.test.jsx` guards prerender.

### NearOfficePage (`/near/:slug`)

"Properties near X" landing for landmarks and offices. Follows the same content pattern as the city landing but scoped to a near-me intent.

## Sitemap Generation and Entity Ingestion

The build pipeline generates landing URLs at build time:

- `scripts/ingest-gurgaon-entities.mjs` ingests Gurgaon area/entity data.
- `scripts/merge-entities.mjs` and `scripts/build-localities-json.mjs` produce the localities index consumed by `useLocalitiesIndex`.
- `scripts/generate-sitemaps.mjs` and `scripts/generate-dynamic-sitemaps.mjs` emit `sitemap-landing.xml`, `sitemap-localities.xml`, and `sitemap-properties.xml`.
- `scripts/generate-prerender-routes.mjs` + `scripts/prerender-pages.mjs` prerender key landing URLs for fast FCP.

This means adding a new city or locality is a data + build pipeline change, not a code change. See [Build Pipeline](../build/Build-Pipeline) for the full pipeline and [SEO & Programmatic](../features/SEO-Programmatic) for the indexation policy and AI discovery layer.

## Indexation Policy

`src/seo/indexationPolicy.js` is the single source of truth for what gets indexed:

- `isIndexableCitySlug(slug)` - true for target cities (currently Gurugram-centric).
- `isIndexableFacetLanding(params)` - true for valid, non-duplicate facet combinations.

Pages that fail the policy set `noindex` to keep the index clean. This is critical because the combinatorial surface is huge and most invalid combinations would otherwise be crawled.

## Localization

Landing pages are fully locale-aware. The `LocaleGate` in `src/App.jsx` mounts the same route tree under `/hi/*` for Hindi, and `Landing.jsx` / `FacetLanding.jsx` use the `landing` namespace for all copy, including Hindi transliterations of key verbs (kharidne, kiraye par lene) in FAQ answers. See [Internationalization](../features/Internationalization).

See [SEO & Programmatic](../features/SEO-Programmatic) for the full programmatic SEO strategy, [Build Pipeline](../build/Build-Pipeline) for sitemap and prerender details, and [Property Search](../features/Property-Search) for how landing pages funnel into `/properties`.
