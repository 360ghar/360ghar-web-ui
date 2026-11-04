# 360Ghar website

The public website of 360Ghar (https://360ghar.com), rebuilt with Astro and React islands. It replaces `../360ghar-web-ui/` and keeps its URLs.

- Astro 7 with `@astrojs/react` and the Cloudflare Workers adapter (`@astrojs/cloudflare`, `wrangler.jsonc`). TypeScript strict.
- API types come from the backend OpenAPI file (`openapi-typescript` + `openapi-fetch`).
- Docs: `docs/inventory.md` (routes and decisions), `docs/backend-gaps.md`, `docs/conventions.md`, `docs/design-system.md`, `docs/quality.md`, `docs/perf/` (performance protocol and the Cloudflare rollback runbook).

## Set up

1. Install Node 22.23.4 or newer (astro 7.4.4's floor) and pnpm 12.
2. Run `pnpm install`.
3. Copy `.env.example` to `.env` and fill in the keys (see the table below).
4. Run `pnpm dev`, then open http://localhost:4321.

## Scripts

| Command | What it does |
|---|---|
| `pnpm dev` | Dev server on port 4321. It also mirrors routes to `/hi` (`scripts/sync-hi-routes.mjs`) |
| `pnpm build` | Production build into `dist/` (the prebuild also writes the Hindi route tree) |
| `pnpm preview` | Serve the production build on workerd. Run `pnpm build` first |
| `pnpm typecheck` | `astro check` and `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Unit tests (Vitest) |
| `pnpm test:e2e` | End-to-end tests (Playwright, Chrome, at 360, 768 and 1440 px). Needs `pnpm dev` running |
| `pnpm api:sync` | Copy `docs/openapi.json` from the backend (`../360ghar-backend`, or `BACKEND_DIR`) to `openapi/openapi.json` |
| `pnpm api:types` | Regenerate `src/lib/api/schema.d.ts` from `openapi/openapi.json` |
| `pnpm perf:lighthouse` | Lighthouse runner: `node scripts/perf/lighthouse.mjs <url> --runs 3` (see Performance) |

## Environment

| Name | Where | Value |
|---|---|---|
| `PUBLIC_SUPABASE_URL` | Browser | Supabase project URL. Required for browser sign-in: when it is missing, auth is off and the browser logs a warning (the build does not fail) |
| `PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase publishable key. Required for browser sign-in, same as `PUBLIC_SUPABASE_URL` |
| `PUBLIC_POSTHOG_KEY` | Browser | PostHog project key. Without it, no analytics |
| `PUBLIC_POSTHOG_HOST` | Browser | `https://us.i.posthog.com` (set in the deploy environment). The browser sends events to `/rel/*` on this site; the Worker forwards them to this host (`src/lib/analytics/proxy.ts`), so ad blockers do not drop them |
| `PUBLIC_GA_ID` | Browser | Google Analytics id (set in the deploy environment) |
| `PUBLIC_GOOGLE_MAPS_API_KEY` | Browser | Maps JavaScript and Places API key. The old key has expired: the map view shows a fallback until a valid key is set |
| `PUBLIC_API_BASE` | Browser | Local dev: `/dev-api` (Vite proxy). Production: leave unset (`https://api.360ghar.com`) |
| `API_ORIGIN` | Server | `https://api.360ghar.com` (set in the deploy environment) |

The old site's names (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_PUBLIC_POSTHOG_KEY`, `VITE_PUBLIC_POSTHOG_HOST`, `VITE_GOOGLE_MAPS_API_KEY` or `VITE_GOOGLE_PLACES_API_KEY`, `VITE_API_SERVER`) also work: `astro.config.mjs` copies them to the new names.

`.env` is not in git. Values are read at build time, so change them in the deploy environment and deploy again.

## Deploy

Production `360ghar.com` serves from a Cloudflare Worker custom domain (worker `360ghar-web-ui`, config in `wrangler.jsonc`). The Worker serves the site only: it has no same-origin `/api` proxy, and browser API calls go to `https://api.360ghar.com` directly, so in production `PUBLIC_API_BASE` must be unset or exactly that origin. Deploy with the Cloudflare credentials in the environment (`CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID`):

    pnpm build && npx wrangler deploy

A Workers Builds dashboard connection (auto-deploy on push to `main`) is planned but not yet confirmed. SSR HTML is cached at the edge for one hour (`s-maxage=3600` + stale-while-revalidate).

A local deploy reads `.env` at build time, and the `.env.example` values (`PUBLIC_API_BASE=/dev-api`, `API_ORIGIN=http://localhost:3600`) work only against the dev server. Set both to `https://api.360ghar.com` for the build: the exact steps are AGENTS.md rule 7.

Rollback: Workers version rollback is the primary path — runbook in `docs/perf/cloudflare-rollback.md`. `netlify.toml` stays in the repo as a frozen rollback artifact; Netlify can no longer build this code (the adapter swap removed `@astrojs/netlify`).

## Performance

Homepage after the cutover, median of 3 local mobile Lighthouse 13.6.0 runs in `faithful` mode (2026-11-03): score 97, LCP 2258 ms, SI 3170 ms, TBT 43 ms, CLS 0.001; warm-edge TTFB 136-193 ms on a reused connection (397-488 ms on a fresh one). Key pages score 95-97. Evidence: `docs/perf/after/home.summary.json` and `docs/perf/after/REPORT.md`. PageSpeed Insights mobile work (97 to 100: no prefetch, later analytics start, hero render gate): `docs/perf/psi-100.md`. Protocol: `docs/perf/baseline.md`, `docs/perf/hero-delay.md`.

Runner: `node scripts/perf/lighthouse.mjs <url> --runs 3`. It defaults to the `faithful` screen mode; do not use `--screen canonical-mobile` for score runs (it inflates SI/LCP when the headless presentation blackout fires — `docs/perf/hero-delay.md`).

## Pitfalls

- Run one dev server only. A second `astro dev` shares `node_modules/.vite` and breaks hydration (`_jsxDEV is not a function`).
- Stop the dev server before `pnpm build`.
- After a build, start dev with `npx astro dev --force`, so Vite rebuilds its dependency cache. If islands then fail with `_jsxDEV is not a function`, stop dev and start it with `--force` once more.
- Route files under `src/pages/` must use `@/` imports: `src/pages/hi/` is generated from them.
