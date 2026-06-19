# Security

This page covers the security posture of the 360Ghar frontend: how
authentication is bound, how API requests are authorised, how user input is
validated and sanitised, and where client-side key exposure exists by design.
The frontend does not store secrets — every credential that reaches the
browser is intentionally public-scoped and must be restricted at the provider.

For the auth flow narrative, see [Authentication](../features/Authentication).
For the request layer, see [API Layer](../services/API-Layer).

## Authentication boundaries

360Ghar does **not** run its own auth backend. All authentication is delegated
to Supabase via the `@supabase/supabase-js` SDK, configured in
`src/services/supabaseClient.js`.

| Concern | Implementation |
|---|---|
| Login / register | `supabase.auth.signInWithPassword` / `signUp` (in `src/services/authService.js`) |
| Google sign-in | Supabase OAuth **redirect** flow, callback at `/auth/callback` |
| Session persistence | `persistSession: true`, `autoRefreshToken: true` |
| Session URL detection | `detectSessionInUrl: false` (see note below) |
| SDK loading | Lazy — `@supabase/supabase-js` (~152KB) is dynamically imported only on first use |

`detectSessionInUrl` is disabled on purpose. Google OAuth redirects to
`/auth/callback?code=...` and `AuthCallbackPage` calls
`exchangeCodeForSession()` explicitly. Leaving auto-detection on caused a
double-exchange race (SDK auto-exchange + manual exchange competing for the
single-use PKCE code). All other flows use typed OTP codes, not redirects, so
disabling auto-detection is safe and deterministic.

The Supabase client is created lazily and warns (does not throw) at import
time if `VITE_SUPABASE_URL` or `VITE_SUPABASE_PUBLISHABLE_KEY` is missing. The
hard throw is deferred to first use inside the React tree so an error
boundary can recover gracefully.

There are no backend `/api/v1/auth/*` login or register endpoints and there
must never be — auth is SDK-managed. See the project rules in `AGENTS.md`.

## API request authentication

Two axios instances are created by `createAxiosInstance` in
`src/services/http.js`:

| Instance | Auth? | Used by |
|---|---|---|
| `publicApi` | No | `propertyAPIService`, `blogService` (read), `pageService`, `deletionService` status check |
| `api` | Yes (`withAuth: true`) | `propertyService`, `userService`, `swipeService`, `visitService`, `mediaService`, blog admin writes, `deletionService` submit/cancel |

For authenticated requests, the request interceptor:

1. Calls `getSupabaseAccessToken()` to read the access token from the active
   Supabase session.
2. Attaches `Authorization: Bearer <token>` to the request headers.

The backend validates the Supabase bearer token on every protected endpoint.
The frontend never sees or stores the Supabase service-role key.

## 401 handling

The response interceptor in `src/services/http.js` handles `401 Unauthorized`
with a single refresh-and-retry attempt before giving up:

1. If the failing request was authenticated and has not already been retried
   (`Symbol.for('http.authRetry')` flag), call `refreshSupabaseSession()`.
2. If refresh returns a new `access_token`, clone the config, set the new
   `Authorization` header, mark it `http.authRetry`, and retry once.
3. If refresh fails or the request was already retried:
   - For **public** endpoints (`/properties/`, `/properties/recommendations/`)
     the error is propagated so the calling component can degrade gracefully
     (e.g. show listings without auth-gated actions).
   - For **authenticated** endpoints, the cached `user` entry is removed from
     `localStorage`. Route guards and `PrivateRoute` then redirect to
     `/login`.

This deliberately does **not** force a hard redirect from inside the HTTP
layer. Letting route guards own navigation avoids races during background
fetches and keeps public pages usable when a session expires.

## Input validation

All user-facing forms use Formik + Yup. Validation schemas are co-located
with their forms (e.g. login, register, contact, post-property, add-listing,
account deletion request). The Yup schema is the source of truth for field
shape, required-ness, and length / format constraints; Formik wires it into
the render lifecycle and surfaces errors per-field.

Do not bypass Formik/Yup with ad-hoc `onChange` validation. If a field needs
custom rules, add them to the Yup schema.

## HTML sanitisation

User-generated HTML is sanitised with DOMPurify before being inserted into the
DOM. The pattern is in `src/components/blog/BlogDetailsSection.jsx`:

```js
import DOMPurify from 'dompurify';

const SANITIZE_OPTIONS = { /* stripped tags / attributes config */ };
const clean = DOMPurify.sanitize(rawContent, SANITIZE_OPTIONS);
```

Blog post `content` may arrive as either HTML or Markdown. The renderer
detects the format:

- HTML → `DOMPurify.sanitize(...)` then `dangerouslySetInnerHTML`.
- Markdown → `ReactMarkdown` with `remarkGfm` (no `dangerouslySetInnerHTML`,
  React escapes by default).
- Empty → empty state.

The same pattern is used in `src/pages/landing/FacetLanding.jsx` for any
landing-page content that may contain HTML. Any new code that renders
untrusted HTML must go through DOMPurify with an explicit options object —
never call `dangerouslySetInnerHTML` on raw input.

## HTTPS enforcement

`src/services/http.js` exports `enforceHttpsExceptLocal(absoluteUrl)`. The
request interceptor runs it on both `config.baseURL` and any absolute
`config.url`:

- `http://` URLs whose hostname is **not** in `['localhost', '127.0.0.1', '::1']`
  are rewritten to `https://`.
- Localhost URLs are passed through unchanged so dev against
  `http://localhost:3600` keeps working.

This is a defence-in-depth measure; production `VITE_API_BASE_URL` is already
`https://api.360ghar.com/api/v1` via `netlify.toml`. Netlify also enforces
HTTPS at the edge.

## Environment variable handling

- Only variables prefixed with `VITE_` are exposed to the client bundle by
  Vite. Anything without the prefix is build-time-only and never ships.
- `.env.example` is committed and documents every required var.
- Machine-specific values go in `.env.local` (gitignored).
- Production values for `VITE_API_SERVER` and `VITE_API_BASE_URL` are pinned
  in `netlify.toml`. Secrets (`VITE_SUPABASE_URL`,
  `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_GOOGLE_PLACES_API_KEY`,
  `VITE_PUBLIC_POSTHOG_KEY`) are set in the Netlify site UI, not in
  `netlify.toml`.

Never commit real API keys or secrets. See `AGENTS.md` for the project rule.

## CORS considerations

| Environment | Mechanism |
|---|---|
| Dev | Vite proxy: `/api` → `${VITE_API_SERVER}/api/v1` with `changeOrigin: true`. The browser only ever talks to its own origin, so there is no CORS preflight. |
| Preview (`vite preview`) | Same proxy, target `apiServer` from env. |
| Production | `VITE_API_BASE_URL` is absolute (`https://api.360ghar.com/api/v1`). The backend must return permissive CORS headers for the production origin. Confirm the allowlist on the backend. |

The `.well-known/*` files are served with `Access-Control-Allow-Origin: *` by
`netlify.toml` so AI agents and OAuth clients can fetch them cross-origin.
Webfonts under `/assets/webfonts/*` are also served with
`Access-Control-Allow-Origin: *`.

## Account deletion flow

Account deletion / data erasure is handled by
`src/services/deletionService.js`. It previously posted to Formspree (a
third-party form backend), which bypassed our own backend and authentication.
That was fixed in audit 1.3 and the flow now goes through the authenticated
`api` instance.

| Endpoint | Auth | Purpose |
|---|---|---|
| `POST /account/delete-request/` | Yes (`api`) | Submit a new deletion request. Body: `{ email, deletion_type, reason, message? }`. Returns `{ id, status, created_at }`. |
| `GET /account/delete-request/{id}/status/` | No (`publicApi`) | Poll status of a request by id. Anonymous access supports the GDPR right to erasure keyed by email. |
| `POST /account/delete-request/{id}/cancel/` | Yes (`api`) | Cancel a pending request within the grace period. |

Anonymous submissions are supported because `email` is the primary key, which
lets a user request erasure even if they can no longer log in. The exact
FastAPI route names and response shapes should be confirmed with the backend
team — see the `TODO(BACKEND)` note in `deletionService.js`.

## Google Places API key exposure

`VITE_GOOGLE_PLACES_API_KEY` is a **client-side** key. It is bundled into the
JavaScript that ships to every browser, so it cannot be considered secret.
Mitigations:

- The key **must** be HTTP-referrer restricted in the Google Cloud Console to
  the production origin (`https://360ghar.com/*`) and any preview origins in
  use. An unrestricted key will be scraped and abused.
- Restrict the key to the **Places API** only, not the broader Maps
  JavaScript API or other services, to limit blast radius.
- Rotate the key if it is suspected to have leaked.
- Do not embed the key in screenshots, support tickets, or wiki pages.

The same applies to `VITE_SUPABASE_PUBLISHABLE_KEY` (Supabase anon key) — it
is public by design and safe to ship, but Row Level Security must be
configured on the Supabase side to enforce row-level access. Do not put the
Supabase **service-role** key in any `VITE_*` variable.

## Retry safety

The retry logic in `src/services/http.js` only retries **GET** requests on
`408, 429, 502, 503, 504` (up to 3 times with linear backoff). Non-GET
methods are never retried automatically, which prevents duplicate writes when
the network recovers after a partial failure. The retry counter is keyed on
`Symbol.for('http.retryCount')` and the config is cloned before each retry
so state cannot leak between unrelated requests via shared interceptor
config.

## Related pages

- [Authentication](../features/Authentication) — the user-facing auth flow.
- [API Layer](../services/API-Layer) — service module patterns and the
  `api` / `publicApi` split.
- [Reference](../reference/Reference) — full environment variable and
  dependency tables.
- [Netlify Deployment](../deployment/Netlify) — security headers and CORS on
  static assets.
