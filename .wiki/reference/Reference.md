# Reference

This is the 360Ghar frontend reference shelf: environment variables,
dependencies, data model shapes, naming conventions, scripts, and Vite config
highlights. It is intended as a lookup, not a tutorial — for narratives see
[Architecture](../Architecture) and [Getting Started](../Getting-Started).

## Environment variables

All client-exposed variables must be prefixed with `VITE_` to be visible to the
app at runtime. The canonical list lives in `.env.example` at the repo root;
machine-specific values go in `.env.local` (never committed).

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `VITE_API_SERVER` | Yes | `http://localhost:3600` (dev) | Backend origin. Used by the Vite dev/preview proxy and the PWA runtime cache pattern. |
| `VITE_API_BASE_URL` | Yes | `/api` (dev) | Axios `baseURL`. In dev `/api` is proxied to `${VITE_API_SERVER}/api/v1`. In prod `netlify.toml` sets this to `https://api.360ghar.com/api/v1`. |
| `VITE_SUPABASE_URL` | Yes | — | Supabase project URL. Drives auth, session, and token refresh. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | — | Supabase anon/publishable key. Falls back to legacy `VITE_SUPABASE_ANON_KEY` name. |
| `VITE_GOOGLE_PLACES_API_KEY` | Yes | — | Google Places autocomplete key (client-side). Should be HTTP-referrer restricted. |
| `VITE_PUBLIC_POSTHOG_KEY` | No | — | PostHog project key for analytics and session replay. |
| `VITE_PUBLIC_POSTHOG_HOST` | No | `https://us.i.posthog.com` | PostHog ingestion host. |
| `VITE_AUTH_REDIRECT_URL` | No | `window.location.origin` | Override the Google OAuth redirect base for Docker / reverse-proxy setups. |
| `VITE_GOOGLE_OAUTH_CLIENT_ID` | No | — | Optional, only if Google One-Tap is enabled. Google sign-in via Supabase OAuth redirect does **not** need this. |
| `BUILD_CACHE_DISABLED` | No | — | Set to `1` to bypass the 12h sitemap cache in `.build-cache/`. |

Notes from `.env.example`:

- Google sign-in uses the Supabase OAuth **redirect** flow. No client env var
  is required — configure the Google provider in the Supabase dashboard and
  add the origin's `/auth/callback` to the Supabase Redirect URL allowlist.
- The properties sitemap is cached to `.build-cache/` for 12h to avoid
  re-crawling the backend on every local build (mirrors the backend
  search-cache TTL). Netlify builds are unaffected because ephemeral
  containers start cold.

Production values for `VITE_API_SERVER` and `VITE_API_BASE_URL` are pinned in
`netlify.toml`. See [Netlify Deployment](../deployment/Netlify).

## Dependencies

Key runtime dependencies from `package.json`:

| Package | Version | Purpose |
|---|---|---|
| `react` / `react-dom` | `^18.2.0` | UI runtime |
| `react-router-dom` | `^6.22.3` | Routing |
| `zustand` | `^5.0.5` | Primary state management |
| `@supabase/supabase-js` | `^2.95.3` | Auth SDK, session, token refresh. Lazy-loaded. |
| `axios` | `^1.9.0` | HTTP client with interceptors and retry |
| `formik` | `^2.4.5` | Forms |
| `yup` | `^1.4.0` | Schema validation (paired with Formik) |
| `dompurify` | `^3.3.1` | HTML sanitisation of blog / user content |
| `react-markdown` / `remark-gfm` | `^10.1.0` / `^4.0.1` | Markdown rendering |
| `react-helmet-async` | `^2.0.5` | SEO meta tags and structured data |
| `react-toastify` | `^10.0.5` | Toast notifications |
| `react-slick` | `^0.30.2` | Carousels |
| `yet-another-react-lightbox` | `^3.23.2` | Image lightbox |
| `react-swipeable` | `^7.0.2` | Swipe gestures for property discovery |
| `react-tabs` | `^6.0.2` | Tab UI |
| `react-to-print` | `^3.3.0` | Print receipts / reports |
| `react-countup` | `^6.5.0` | Animated stat counters |
| `@googlemaps/js-api-loader` | `^1.16.10` | Google Maps JS loader |
| `i18next` / `react-i18next` / `i18next-*` | `^26` / `^17` / `^8` / `^3` | Internationalisation (Hindi + English) |
| `posthog-js` | `^1.311.0` | Analytics, session replay, CWV capture |
| `web-vitals` | `^4.2.4` | Core Web Vitals reporting |
| `swr` | `^2.4.0` | Data fetching / caching |
| `html2canvas` / `jspdf` | `^1.4.1` / `^4.2.0` | Client-side PDF / image export (receipts, reports) |
| `@formspree/react` | `^3.0.0` | Contact form backend (legacy) |

Key dev dependencies:

| Package | Version | Purpose |
|---|---|---|
| `vite` | `^7.3.1` | Build tool and dev server |
| `@vitejs/plugin-react` | `^4.2.1` | React Fast Refresh and JSX |
| `sass` | `^1.71.1` | SCSS compilation |
| `eslint` / `@eslint/js` | `^9.39.4` | Linting. **Must stay on major 9** — see [Netlify](../deployment/Netlify.md#eslint-peer-dependency-constraint). |
| `eslint-plugin-react` / `react-hooks` / `react-refresh` | `^7.37.5` / `^7.0.1` / `^0.5.0` | React lint rules |
| `vitest` / `@testing-library/react` / `jsdom` | `^3.2.4` / `^16.3.0` / `^27.0.1` | Unit tests |
| `puppeteer` | `^24.40.0` | Headless Chrome for prerendering |
| `sharp` | `^0.34.5` | Image optimisation to AVIF / WebP |
| `purgecss` | `^8.0.0` | Bootstrap CSS purging |
| `vite-plugin-pwa` | `^1.2.0` | Service worker / PWA manifest |
| `vite-plugin-compression` | `^0.5.1` | Gzip + brotli pre-compression |
| `vite-plugin-image-optimizer` | `^2.0.3` | Build-time image optimisation |
| `critters` | `^0.0.23` | Critical CSS inlining |
| `rollup-plugin-visualizer` | `^6.0.5` | Bundle analysis (`ANALYZE=1 npm run build`) |
| `terser` | `^5.44.1` | JS minification (drops `console.log`/`debug`/`info`) |
| `svgo` | `^4.0.1` | SVG optimisation |

## Data models

The frontend does not own these schemas — the FastAPI backend does. The shapes
below are what the services in `src/services/` and stores in `src/store/`
expect to receive and mutate. Treat them as the contract; confirm against the
backend for canonical field names.

### Property

Served by `propertyService.js` (auth) and `propertyAPIService.js` (public).
Search supports 31 filter fields, managed in `propertyStore.js`.

| Field group | Fields |
|---|---|
| Identity | `id`, `title`, `slug`, `description` |
| Listing | `purpose` (`buy` / `rent` / `pg`), `property_type[]` |
| Location | `lat`, `lng`, `radius`, `city`, `locality`, `pincode` |
| Price | `price_min`, `price_max` |
| Rooms | `bedrooms_min` / `bedrooms_max`, `bathrooms_min` / `bathrooms_max` |
| Area | `area_min`, `area_max` |
| Features | `amenities[]`, `features[]`, `parking_spaces_min` |
| Building | `floor_number_min` / `floor_number_max`, `age_max` |
| Short stay | `check_in`, `check_out`, `guests` |
| Sort | `sort_by` |

### User

Served by `userService.js` and `authService.js`. Cached profile persisted in
`localStorage` by `authStore.js`.

| Field group | Fields |
|---|---|
| Identity | `id`, `email`, `phone`, `full_name` |
| Profile | `preferences`, `location` |
| Settings | `notification_settings` |
| Admin | `is_active`, `role` (managed via admin endpoints) |

Endpoints: `GET/PUT /users/profile`, `PUT /users/preferences`,
`PUT /users/location`, `GET/PUT /users/notification-settings`, plus admin
`GET /users`, `POST /users`, `GET/PUT /users/{id}`.

### Project

Project listings and detail pages. Routes: `/project`, `/project/:title`.
Endpoints follow the same pattern as properties (`/projects/`,
`/projects/{id|slug}`) but live behind the project page components and stores.
Confirm exact routes with the backend.

### Blog

Served by `blogService.js`. Public read uses `publicApi` (no auth); admin write
uses `api` (auth).

| Field group | Fields |
|---|---|
| Post | `id`, `title`, `slug`, `content` (HTML or Markdown), `excerpt`, `category`, `tags[]`, `created_at` |
| Category | `id`, `name`, `slug` |
| Tag | `id`, `name`, `slug` |

Identifiers accept either `id` or `slug` for `getPostByIdentifier`,
`getCategoryByIdentifier`, `getTagByIdentifier`.

HTML blog content is sanitised with DOMPurify before render (see
[Security](../security/Security.md#html-sanitisation)).

### Visit

Served by `visitService.js`. All endpoints require auth.

| Field group | Fields |
|---|---|
| Visit | `id`, `property_id`, `scheduled_date`, `special_requirements`, `status` |
| Lifecycle | `schedule`, `update`, `reschedule`, `cancel` |

Endpoints: `POST /visits/`, `GET /visits/`, `GET /visits/upcoming`,
`GET /visits/past`, `GET /visits/{id}`, `PUT /visits/{id}`,
`POST /visits/{id}/reschedule`, `POST /visits/{id}/cancel`.

### Swipe

Served by `swipeService.js`. Used by the property discovery (Tinder-style) UI.
All endpoints require auth.

| Field group | Fields |
|---|---|
| Swipe | `id`, `property_id`, `is_liked`, `created_at` |
| Stats | counts returned by `GET /swipes/stats` |

Endpoints: `POST /swipes/`, `GET /swipes/`, `DELETE /swipes/undo`,
`PUT /swipes/{id}/toggle`, `GET /swipes/stats`.

## File naming conventions

| Type | Convention | Example |
|---|---|---|
| Components | PascalCase | `src/common/layout/Header.jsx` |
| Pages | PascalCase | `src/pages/properties/PropertyDetails.jsx` |
| Stores | camelCase | `src/store/authStore.js` |
| Services | camelCase | `src/services/propertyService.js` |
| Static data | camelCase | `src/data/CommonData/navMenus.js` |
| SCSS partials | underscore-prefixed | `public/assets/sass/abstracts/_variable.scss` |
| Build scripts | kebab-case | `scripts/generate-sitemaps.mjs` |
| Tests | `*.test.jsx` / `*.test.js` next to source | `src/services/lastAuthMethod.test.js` |

Tests run with Vitest. Add new tests as `*.test.jsx` (component) or
`*.test.js` (logic) under `src/__tests__/` or co-located with the module.

## Directory structure

A condensed view. For the full map, see [Architecture](../Architecture).

```
frontend/
├── src/
│   ├── pages/        # Route-level components, grouped by domain
│   ├── components/   # Feature components, grouped by domain
│   ├── common/       # Shared UI (Header, Footer, SEO, forms, sidebar)
│   ├── services/     # Axios-based API modules (one per backend resource)
│   ├── store/        # Zustand stores (auth, property, user, visit, agent, admin, location)
│   ├── contextApi/   # React Context providers (legacy UI state)
│   ├── data/         # Static data by page/feature
│   ├── i18n/         # i18next config and locale bundles
│   ├── seo/          # SEO helpers and structured data
│   ├── styles/       # _theme.scss and global SCSS entry
│   ├── App.jsx       # Routes
│   └── main.jsx      # Providers + entry
├── public/
│   ├── assets/       # SCSS, images, webfonts
│   ├── data/         # Public JSON (localities, llm-feed, etc.)
│   └── blueprint3d/  # 3D Blueprint tool assets
├── scripts/          # Build-time Node scripts (sitemaps, prerender, optimise)
├── netlify/          # Edge functions
├── netlify.toml      # Deploy config
├── vite.config.js    # Build / dev config
└── .env.example      # Required env vars
```

## Key scripts

From `package.json`:

| Script | Command | Purpose |
|---|---|---|
| `dev` | `vite` | Start the Vite dev server with the `/api` proxy |
| `build` | chained (see below) | Full production build |
| `lint` | `eslint . --ext js,jsx --report-unused-disable-directives` | Lint |
| `test` | `vitest run src` | Run unit tests once |
| `preview` | `vite preview` | Serve the built `dist/` locally |

The `build` script chains:

```
build:entities → build:ai-discovery → build:sitemaps → build:rss →
build:images → generate-og-image → vite build → purge-main-css →
build:prerender → purge-bootstrap
```

Sub-scripts of note:

| Script | Purpose |
|---|---|
| `build:entities` | Ingest Gurgaon entities, merge, build localities JSON + index + sitemap |
| `build:sitemaps` | Generate static + dynamic sitemaps |
| `build:prerender` | Generate prerender routes, then prerender with Puppeteer |
| `build:images` | Optimise images (`--quiet`) |
| `build:ai-discovery` | Write `.well-known` agent discovery files |
| `build:rss` | Generate RSS feeds |
| `validate:schemas` | Validate structured data |
| `build:image-refresh-assets` / `build:image-refresh-manifest` | Image refresh tooling |

See [Build Pipeline](../build/Build-Pipeline) for the narrative.

## Vite config highlights

Defined in `vite.config.js`. Highlights that affect runtime and deploy
behaviour:

### Dev / preview proxy

```js
server: {
  proxy: {
    '/api': {
      target: env.VITE_API_SERVER || 'http://localhost:3600',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
    },
  },
}
```

`preview` mirrors this with `apiServer` from env. The proxy lets the app call
`/api/...` in dev with no CORS preflight. In production, `netlify.toml` sets
`VITE_API_BASE_URL` to an absolute URL and no proxy is used.

### Plugins

| Plugin | Role |
|---|---|
| `@vitejs/plugin-react` | React Fast Refresh, JSX |
| `deferEntryCssPlugin` (custom) | Defer the entry CSS chunk so it does not block first paint |
| `asyncRegisterSW` (custom) | Make the PWA service-worker registration `async` |
| `ViteImageOptimizer` | Build-time AVIF/WebP at quality 60-80 |
| `compression` (gzip + brotli) | Pre-compress assets > 1KB |
| `VitePWA` | Service worker, manifest, runtime caching (API NetworkFirst, images/fonts CacheFirst) |
| `rollup-plugin-visualizer` | Bundle analysis, gated on `ANALYZE=1` |

### Build optimisation

- `build.target = 'es2019'` — kept compatible with the Chromium bundled by
  Puppeteer so prerendering runs reliably.
- `build.modulePreload = false` — disables static and runtime modulepreload
  hints. On prerendered pages these force the browser to fetch and compile
  15-40 JS chunks before paint. Chunks still load on demand via native
  dynamic import.
- `build.chunkSizeWarningLimit = 500` — surface large chunks early.
- Manual chunk splitting for vendor bundles: `vendor-react`, `vendor-forms`,
  `vendor-ui`, `vendor-markdown`, `vendor-utils`, `vendor-analytics`,
  `vendor-supabase`, plus `localities-data` and `localities-index`.
- Terser drops `console.log`, `console.debug`, `console.info`, and
  `debugger` statements in production.
- `sourcemap = false` in production.

### PWA runtime caching

| Pattern | Strategy | TTL |
|---|---|---|
| `${VITE_API_SERVER}/*` | NetworkFirst | 1 hour, max 100 entries |
| Images (png/jpg/jpeg/svg/gif/webp) | CacheFirst | 30 days, max 200 entries |
| Fonts (woff2/woff) | CacheFirst | 1 year, max 20 entries |

Blueprint3D assets and `/data/*` are excluded from precaching.

## Related pages

- [Architecture](../Architecture) — system overview and module map.
- [Build Pipeline](../build/Build-Pipeline) — what runs during `npm run build`.
- [Netlify Deployment](../deployment/Netlify) — deploy, redirects, headers.
- [Security](../security/Security) — auth boundaries, sanitisation, key
  exposure.
- [API Layer](../services/API-Layer) — service module patterns.
