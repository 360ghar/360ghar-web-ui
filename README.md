# 360Ghar website

The public website of 360Ghar (https://360ghar.com), rebuilt with Astro and React islands. It replaces `../360ghar-web-ui/` and keeps its URLs.

- Astro 7 with `@astrojs/react` and the Netlify adapter. TypeScript strict.
- API types come from the backend OpenAPI file (`openapi-typescript` + `openapi-fetch`).
- Docs: `docs/inventory.md` (routes and decisions), `docs/backend-gaps.md`, `docs/conventions.md`, `docs/design-system.md`, `docs/quality.md`.

## Set up

1. Install Node 22 and pnpm 12.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env` and fill in the keys (see the table below).
4. Run `pnpm dev`, then open http://localhost:4321.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on port 4321. It also mirrors routes to `/hi` (`scripts/sync-hi-routes.mjs`) |
| `pnpm build` | Production build into `dist/` and `.netlify/` |
| `pnpm typecheck` | `astro check` and `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright, Chrome, at 360, 768 and 1440 px). Needs `pnpm dev` running |
| `pnpm api:sync` | Copy `docs/openapi.json` from the backend (`../360ghar-backend`, or `BACKEND_DIR`) to `openapi/openapi.json` |
| `pnpm api:types` | Regenerate `src/lib/api/schema.d.ts` from `openapi/openapi.json` |

## Environment

| Name | Where | Value |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Browser | Supabase project URL. Required: a Netlify build fails without it |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase publishable key. Required |
| `PUBLIC_POSTHOG_KEY` | Browser | PostHog project key. Without it, no analytics |
| `PUBLIC_POSTHOG_HOST` | Browser | `https://us.i.posthog.com` (set in `netlify.toml`) |
| `PUBLIC_GA_ID` | Browser | Google Analytics id (set in `netlify.toml`) |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Browser | Maps JavaScript and Places API key. The old key has expired: the map view shows a fallback until a valid key is set |
| `PUBLIC_API_BASE` | Browser | Local dev: `/dev-api` (Vite proxy). Deploy previews: empty (Netlify `/api/v1` proxy, set in `netlify.toml`). Production: leave unset (`https://api.360ghar.com`) |
| `API_ORIGIN` | Server | `https://api.360ghar.com` (set in `netlify.toml`) |

The old site's names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST`, `VITE_GOOGLE_MAPS_API_KEY` or `VITE_GOOGLE_PLACES_API_KEY`, `VITE_API_SERVER`) also work: `astro.config.mjs` copies them to the new names.

`.env` is not in git. Values are read at build time, so change them in Netlify and deploy again.

## Deploy

Netlify builds the site with `pnpm build` (see `netlify.toml`). Build on Netlify only: a local build uses `PUBLIC_API_BASE=/dev-api` from `.env`, which works only with the dev server.

## Pitfalls

- Run one dev server only. A second `astro dev` shares `node_modules/.vite` and breaks hydration (`_jsxDEV is not a function`).
- Stop the dev server before `pnpm build` (`npx astro dev stop`): the dev server clears `.netlify/build`.
- After a build, start dev with `npx astro dev --force`, so Vite rebuilds its dependency cache. If islands then fail with `_jsxDEV is not a function`, stop dev and start it with `--force` once more.
- `astro preview` does not work with the Netlify adapter.
- Route files under `src/pages/` must use `@/` imports: `src/pages/hi/` is generated from them.
