# SEO

The 360Ghar frontend centralises all SEO concerns in `src/common/SEO.jsx` and `src/seo/`. The `SEO` component is a `react-helmet-async` wrapper that every page renders once; it emits the `<title>`, meta description, canonical URL, robots directives, Open Graph, Twitter card, hreflang alternates, and JSON-LD structured data blocks. The `src/seo/` folder holds the canonical site metadata, the structured-data generators, the indexation policy, and a CI validation script. Sitemaps and RSS are generated at build time by scripts under `scripts/`.

## Key Files

| File | Purpose |
|------|---------|
| `src/common/SEO.jsx` | React Helmet wrapper, renders all head tags |
| `src/seo/siteMetadata.js` | Site URL, defaults, organization, map embed, `absoluteUrl` |
| `src/seo/structuredData.js` | Schema.org generators (Organization, FAQPage, BreadcrumbList, etc.) |
| `src/seo/toolSchemas.js` | Structured data for tool/calculator pages |
| `src/seo/aiDiscovery.js` | AI-discovery feed (llm-feed.json, llms.txt) |
| `src/seo/indexationPolicy.js` | Which city slugs / static routes / facets are indexable |
| `src/seo/validateStructuredData.js` | Runtime schema validation helpers |
| `src/seo/reportWebVitals.js` | Core Web Vitals reporting |
| `scripts/validate-structured-data.mjs` | CI script verifying required schema types exist |
| `scripts/generate-sitemaps.mjs` | Generates `sitemap-*.xml` with hreflang alternates |
| `scripts/generate-dynamic-sitemaps.mjs` | Dynamic sitemap batches |
| `scripts/generate-locality-sitemap.mjs` | Locality sitemap |
| `scripts/generate-rss.mjs` | RSS feed generation |
| `scripts/prerender-pages.mjs` | Pre-renders pages for crawlers |

## The SEO Component

`src/common/SEO.jsx` exports a single `SEO` component. It uses `react-helmet-async`'s `<Helmet defer={false}>` so tags are present in the initial HTML (critical for crawlers and SSR/prerender). Props:

| Prop | Type | Purpose |
|------|------|---------|
| `title` | string | `<title>` and OG/Twitter title (falls back to `siteMetadata.defaultTitle`) |
| `description` | string | Meta description (falls back to `defaultDescription`) |
| `keywords` | string | Meta keywords |
| `canonical` | string | Canonical URL path (localized + absolutized) |
| `image` | string | OG/Twitter image (absolutized; falls back to `defaultOgImage`) |
| `type` | string | OG type (`'website'` default, `'article'` for blog posts) |
| `url` | string | OG/Twitter URL (defaults to localized current path) |
| `hreflangs` | array | Override auto-generated alternates |
| `structuredData` | object\|array | JSON-LD block(s) injected as `<script type="application/ld+json">` |
| `noindex` | bool | Emits `noindex,nofollow` |
| `prevUrl` / `nextUrl` | string | `rel="prev"` / `rel="next"` for pagination |
| `articlePublishedTime` / `articleModifiedTime` | string | `article:published_time` / `article:modified_time` (type=article only) |
| `articleTags` | string[] | `article:tag` entries |
| `articleSection` | string | `article:section` |
| `video` | string | OG/Twitter video + player cards (for VR tour pages) |

### Locale handling
`SEO` reads `useLocation()` and `useLocaleStore()`. It infers the locale from the path (`/hi` prefix → `'hi'`) and prefers the store locale when set. All paths are localized via `localizePath` from `src/i18n/I18nLink` before being absolutized with `absoluteUrl`. The `<html lang>` attribute is set to the resolved locale.

### hreflang alternates
`buildHreflangs(canonicalUrl)` generates three alternates: `en` (bare path), `hi` (`/hi` prefixed), and `x-default` (bare path). The origin is parsed from the canonical URL so CDN deployments with a different external origin work correctly. Callers can override with the `hreflangs` prop.

### What gets emitted
- Primary: `<title>`, `meta description`, `meta keywords`, `link canonical`, optional `prev`/`next`.
- `meta theme-color` is `#ff6b00` (brand orange).
- `meta robots` defaults to `index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1`; `googlebot` mirrors it. `noindex` flips both to `noindex,nofollow`.
- hreflang `<link rel="alternate" hrefLang>`.
- Open Graph: `og:title/description/image/image:alt/locale/locale:alternate/url/type/site_name`, plus `og:video*` when `video` is set, and `article:*` when `type === 'article'`.
- Twitter: `summary_large_image` card with `twitter:site`/`twitter:creator` = `@360ghar`, plus `twitter:player*` when `video` is set.
- Structured data: each `structuredData` entry is wrapped with `{'@context': 'https://schema.org', ...ld}` and rendered as a JSON-LD `<script>`.

## siteMetadata

`src/seo/siteMetadata.js` exports the `siteMetadata` object and the `absoluteUrl(urlOrPath)` helper. Key fields: `siteUrl` (`https://360ghar.com`), `siteName` (`360Ghar`), `defaultTitle`, `defaultDescription`, `defaultKeywords` (a long bilingual EN/HI keyword list), `defaultOgImage`, `twitterCard`, `organization` (name, email, telephone, postal address), and `mapEmbedUrl` (Gurugram Google Maps embed, audits 5.4/5.11). `absoluteUrl` returns already-absolute URLs unchanged and joins relative paths onto `siteUrl`.

## Structured Data

`src/seo/structuredData.js` (~1520 lines) exports generators for the schema types 360Ghar uses: `organization` (RealEstateAgent + Organization with `areaServed`, bilingual `alternateName`s, `inLanguage: ['en-IN','hi-IN']`), `WebSite`, `Product`, `FAQPage`, `BreadcrumbList`, `Person`, `Event`, `PodcastSeries`, `Course`, `QAPage`, `SpeakableSpecification`, and blog-specific generators (`generateBlogStructuredData`, `generateBreadcrumbStructuredData`). Authors come from `src/data/authors`. `src/seo/toolSchemas.js` provides schema for calculator/tool pages.

Pages import the relevant generator and pass the result to `<SEO structuredData={...} />`. `BlogDetailsSection.jsx` is a good reference: it calls `generateBlogStructuredData` and `generateBreadcrumbStructuredData` and feeds both to `SEO`.

## Structured Data Validation

`scripts/validate-structured-data.mjs` is a CI script (run via `npm run validate:schemas`, or directly with `node`). It:

1. Verifies `src/seo/structuredData.js` exists.
2. Reads the file and checks for a required set of `@type` values: `Organization`, `RealEstateAgent`, `LocalBusiness`, `WebSite`, `Product`, `FAQPage`, `BreadcrumbList`, `Person`, `Event`, `PodcastSeries`, `Course`, `QAPage`, `SpeakableSpecification`.
3. Exits non-zero if any required schema type is missing, failing the build.

Runtime validation helpers live in `src/seo/validateStructuredData.js` (with tests in `validateStructuredData.test.js`).

## Sitemap Generation

`scripts/generate-sitemaps.mjs` runs automatically before the production build. It reads `approvedIndexableCitySlugs`, `indexableStaticRoutes`, and `indexableBudgetFacets` from `src/seo/indexationPolicy.js`, prunes entries via `src/data/pseo-prune-list.json` (if present), and writes XML sitemaps to `public/`. Each `<url>` includes `<xhtml:link rel="alternate" hreflang>` for `en`, `hi`, and `x-default`. The `SITE_URL` env var (default `https://360ghar.com`) controls the origin. Phased-release knobs (`SITEMAP_MAX_LANDING_PER_CITY`, `SITEMAP_BATCH`) limit landing URLs per city.

Related scripts: `scripts/generate-dynamic-sitemaps.mjs`, `scripts/generate-locality-sitemap.mjs`, `scripts/generate-rss.mjs` (RSS feed), `scripts/prerender-pages.mjs` (pre-renders pages so crawlers receive fully populated `<head>` tags).

## How Pages Use SEO

A typical page renders `<SEO>` once near the top of its JSX:

```jsx
import SEO from '../../common/SEO';
import { generateBlogStructuredData } from '../../seo/structuredData';

<SEO
  title={post.title}
  description={post.excerpt}
  type="article"
  image={post.cover_image_url}
  articlePublishedTime={post.published_at}
  articleModifiedTime={post.updated_at}
  articleTags={post.tags}
  structuredData={generateBlogStructuredData(post)}
/>
```

Because `Helmet` is `defer={false}`, the tags appear in the prerendered HTML produced by `scripts/prerender-pages.mjs`, so crawlers and AI assistants see the full metadata without executing JS.

## Cross-Links

- [SEO & Programmatic](../features/SEO-Programmatic) for the landing-page strategy and indexation policy.
- [Build Pipeline](../build/Build-Pipeline) for how sitemaps, prerendering, and schema validation fit into `npm run build`.
- [Navigation & Layout](Navigation-Layout) for `siteMetadata.mapEmbedUrl` usage in the off-canvas panel.
