# Getting Started

This guide walks through cloning, configuring, running, building, and testing the 360Ghar frontend locally.

## Prerequisites

- **Node.js** >= 18 (LTS recommended)
- **npm** (ships with Node)
- Git
- A Supabase project with Auth enabled
- A Google Cloud project with the Places API and Maps JavaScript API enabled
- (Optional) Local backend running on `http://localhost:3600` for full API access

## Clone and Install

```bash
git clone github.com:360ghar/frontend.git
cd frontend
npm install
```

Netlify uses strict peer dependency resolution. If `npm install` reports `ERESOLVE`, resolve the conflict locally before pushing. Note that `eslint` and `@eslint/js` are pinned to major version 9 because `eslint-plugin-react@7.x` does not support eslint 10+.

## Environment Variables

Copy `.env.example` to `.env.local` and fill in the values:

```bash
cp .env.example .env.local
```

| Variable | Purpose |
|----------|---------|
| `VITE_GOOGLE_PLACES_API_KEY` | Google Places autocomplete and Maps JS API |
| `VITE_SUPABASE_URL` | Supabase project URL (auth SDK) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon/publishable key |
| `VITE_API_BASE_URL` | Backend API base URL. Defaults to `/api` which the Vite proxy rewrites to `http://localhost:3600/api/v1` in dev. In production this points to `https://api.360ghar.com`. |

Never commit real keys. Use `.env.local` for machine-specific values.

## Development Server

```bash
npm run dev
```

Starts the Vite dev server at `http://localhost:5173`. The `/api` prefix is proxied to `http://localhost:3600` with a rewrite to `/api/v1` (see `vite.config.js`).

## Production Build

```bash
npm run build
```

The build runs a multi-stage pipeline before Vite bundles the SPA:

1. **Entity ingestion** of Gurgaon area data
2. **Sitemap generation** (`scripts/generate-sitemaps.mjs`) for static, landing, locality, and property URLs
3. **RSS feeds** (`public/rss.xml`, `public/rss/localities.xml`)
4. **Image optimization** to AVIF/WebP
5. **Open Graph image** generation
6. **Vite build** of the React SPA into `dist/`
7. **CSS purge** and Bootstrap purge
8. **HTML prerendering** for key routes

To regenerate sitemaps without a full build:

```bash
npm run build:sitemaps
```

## Preview

```bash
npm run preview
```

Serves the production `dist/` build locally for verification.

## Lint

```bash
npm run lint
```

Runs ESLint 9 with the config in `eslint.config.js`. Fix all reported issues before committing.

## Test

```bash
npm test
```

Runs Vitest. Tests live under `src/__tests__/` or as `*.test.jsx` files colocated with source. No formal test suite is fully configured yet; manually verify key flows (auth, property search, contact forms) using `npm run dev` when tests are missing.

## Project Structure (Brief)

```
frontend/
├── src/
│   ├── pages/        route-level components by domain
│   ├── components/   feature components by domain
│   ├── common/       shared UI, layout, forms, sidebars, SEO
│   ├── services/     Axios-based API service layer
│   ├── store/        Zustand stores
│   ├── contextApi/   React Context providers
│   ├── data/         static page/feature data
│   ├── styles/       _theme.scss and global styles
│   ├── App.jsx       routes
│   └── main.jsx      entry with providers
├── public/
│   ├── assets/sass/  SCSS 7-1 architecture
│   ├── data/         public JSON data
│   ├── blueprint3d/  3D Blueprint tool assets
│   └── sitemap*.xml  SEO sitemaps
└── scripts/          build scripts (sitemaps, entity ingestion)
```

See [Architecture](Architecture) for the full system design.

## GitHub Wiki Setup

GitHub Wikis require a one-time setup: open the repo's Wiki tab in the browser and create the first page (e.g., `Home`) through the UI. After that, the `.wiki` directory can be cloned, pushed, and synced like any other Git remote. Once the first page exists, push the contents of this `.wiki/` directory to the wiki remote.
