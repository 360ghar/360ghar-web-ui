# Debugging

This page is a field guide for the errors and failure modes you will hit most often while working on the 360Ghar frontend, from local dev server quirks to Netlify build failures. When something breaks, start here.

## Key Files

| File | Purpose |
|------|---------|
| `vite.config.js` | Dev server, `/api` proxy to `http://localhost:3600` |
| `src/services/http.js` | Axios instance factory: 401 redirect, retry, timeout |
| `src/services/supabaseClient.js` | Supabase auth session |
| `.env.example` | Required `VITE_*` variables |
| `build_logs.txt` | Snapshot of the most recent Netlify build output |
| `netlify.toml` | Build command, redirects, headers |

## Common Errors

### API returns 401 and the app redirects to `/login`

The authenticated Axios instance in `src/services/http.js` intercepts 401 responses, clears the cached auth state, and redirects to `/login`. Common causes:

- The Supabase session expired. Refresh the page; `useAuthStore.initializeAuth()` rehydrates the session on app load.
- The backend rejects the bearer token (clock skew, revoked token, wrong Supabase project). Confirm `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` match the project that issued the token.
- You hit a protected endpoint from a public page. Public endpoints (property search, blog, vastu) live in `propertyAPIService.js`, `blogService.js`, and `vastuService.js` and must not use the authenticated `api.js` instance.

### `/api` requests 404 or CORS error in dev

The Vite proxy rewrites `/api/*` to `http://localhost:3600/api/v1/*`. If the backend is not running on port 3600, requests will hang or 404. Verify:

- The local backend is up on `http://localhost:3600`.
- `vite.config.js` still has the `server.proxy['/api']` block.
- You are not calling a URL that already includes `/api/v1` (the rewrite would double-prefix it).

### Supabase session issues

- **`supabase.auth.getSession()` returns null after login**: check that the redirect URL in the Supabase dashboard includes `http://localhost:5173` for dev and `https://360ghar.com` for prod.
- **OAuth/phone flows loop on `/auth/callback`**: inspect `AuthCallbackPage.jsx` and confirm the code exchange completes before navigating.
- **`getSupabaseAccessToken()` throws in `McpLogin.jsx`**: the session was not established; the MCP login flow requires a valid session before redirecting back to the client.

### Missing environment variable

Vite only exposes vars prefixed with `VITE_`. A missing var is `undefined` at runtime, not a build error. Symptoms:

- Google Places autocomplete does not render (`VITE_GOOGLE_PLACES_API_KEY`).
- Auth SDK throws on init (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`).
- API requests hit the wrong host (`VITE_API_BASE_URL`).

Run `npm run dev` with `console.log(import.meta.env)` if you are unsure which vars are loaded. Never commit real keys; use `.env.local`.

## Vite Dev Server

- **Blank page, no errors**: check the browser console for a failed dynamic import. `src/App.jsx` lazy-loads every page; a syntax error in any page module will surface as a Suspense fallback that never resolves.
- **HMR stops updating**: hard refresh. Vite 7 is fast but occasionally loses the HMR boundary after large SCSS edits.
- **SCSS changes do not appear**: confirm the file is imported through `main.scss` (7-1 architecture) and not orphaned.

## Browser DevTools

- **Network tab**: filter by `Fetch/XHR` to inspect API calls. Look for the `Authorization` header on authenticated requests and the `X-` retry headers set by the Axios interceptor.
- **Application > Local Storage**: Zustand persist slices (`360ghar-location`, cached user profile) live here. Clearing localStorage fixes most stale-state bugs.
- **React DevTools Profiler**: use it to confirm Zustand selector re-renders are scoped. Selectors that return new object literals on every call cause re-render loops.

## PostHog Session Replay

PostHog is wired up in `src/services/posthogService.js` and `src/main.jsx`. For production debugging:

1. Open the PostHog dashboard for the 360Ghar project.
2. Filter Sessions by the affected user's `distinct_id` (the Supabase user id) or by a URL they visited.
3. Replay the session to see DOM changes, clicks, and console errors in sync.

PostHog also captures Core Web Vitals and SPA pageviews via `capturePageView()` in `src/App.jsx` `RouteScrollToTop`, so a drop in pageview events signals a routing or hydration problem. See [Analytics](../features/Analytics) for the full instrumentation map.

## Netlify Build Logs

When a deploy fails on Netlify:

1. Download the deploy log from the Netlify UI, or read `build_logs.txt` (committed snapshot of the most recent build for diffing).
2. The build runs `npm run build`, which chains: entity ingestion, sitemaps, RSS, image optimization, OG image, Vite build, CSS purge, prerender, Bootstrap purge. Identify which stage failed from the section headers in the log.
3. Common Netlify-only failures:
   - **`ERESOLVE unable to resolve dependency tree`**: peer dep conflict, usually from upgrading `eslint` past major 9. Pin back and reinstall locally.
   - **`sharp` / `puppeteer` install errors**: the build image is missing system deps. Both are used in `scripts/` for image optimization and prerendering.
   - **Prerender timeout**: a page threw during SSR. Check the failing route against its `*.ssr.test.jsx`.
   - **`Cannot find module` after a dependency bump**: clear the Netlify build cache and redeploy.

## Local Reproduction of CI

```bash
npm ci
npm run lint
npm test
npm run build
```

`npm ci` matches `package-lock.json` exactly, mirroring Netlify. If `npm ci` fails locally but `npm install` succeeds, you have a lockfile drift; resolve it before pushing.

For runtime triage flow, see [Development Workflow](Development-Workflow) for the PR checklist and [Testing](Testing) for writing tests that catch regressions early.
