# Account Pages

Account pages cover authentication, the user dashboard, and account lifecycle (deletion, password reset, phone verification). They live in `src/pages/account/` and rely on `useAuthStore` (Zustand) for session state and the Supabase Auth SDK for actual credential flows. There is no backend `/api/v1/auth/*` login/register endpoint; Supabase manages sessions directly and the access token is injected into authenticated Axios requests.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/login` | `src/pages/account/Login.jsx` | Phone + password login (noindex) |
| `/register` | `src/pages/account/Register.jsx` | Registration (noindex) |
| `/forgot-password` | `src/pages/account/ForgotPassword.jsx` | Forgot password flow |
| `/reset-password` | `src/pages/account/ResetPassword.jsx` | Password reset |
| `/auth/callback` | `src/pages/account/AuthCallbackPage.jsx` | OAuth/code exchange callback |
| `/add-phone` | `src/pages/account/AddPhonePage.jsx` | Add phone number post-OAuth |
| `/profile-completion` | `src/pages/account/ProfileCompletion.jsx` | Profile completion step |
| `/account` | `src/pages/account/Account.jsx` | User dashboard with tabs |
| `/delete-account` | `src/pages/account/AccountDeletionRequest.jsx` | Account deletion request |
| `/mcp/login` | `src/pages/account/McpLogin.jsx` | MCP login for AI assistants |

Supporting files:

| File | Purpose |
|------|---------|
| `src/store/authStore.js` | Zustand auth store: user, token, login/register/logout |
| `src/services/authService.js` | Supabase auth wrappers |
| `src/services/supabaseClient.js` | Supabase client + `getSupabaseAccessToken` |
| `src/services/deletionService.js` | Account deletion request API |
| `src/components/account/AccountSection.jsx` | Dashboard shell with tabs |
| `src/components/account/PrivateRoute.jsx` | Protected route wrapper |
| `src/common/ProfileCompletionRouteGuard.jsx` | Redirects incomplete profiles to `/profile-completion` |

## Auth Flow

1. Login/Register happens directly via the Supabase Auth SDK through `useAuthStore.login()` / `register()`.
2. The access token is read from the active Supabase session and injected into the `Authorization` header by the authenticated Axios instance (`src/services/api.js`).
3. The backend validates the Supabase bearer token; it does not issue its own sessions.
4. 401 responses are intercepted by `src/services/http.js`, which clears auth state and redirects to `/login`.
5. Public endpoints (property search, blog, vastu) skip auth entirely.

OAuth flows land on `/auth/callback`, exchange the code, then redirect to `/add-phone` (if phone is missing) or `/profile-completion` (if profile is incomplete). `ProfileCompletionRouteGuard` enforces the completion step for authenticated routes.

## Page Details

### Login (`/login`)

Renders `LoginRegister` from `src/components/forms/` in login mode (`isLogin={true}`, `showConfirm={false}`, `showForgotRemember={true}`). The form calls `useAuthStore.login(phone, password)`, which delegates to `authService.login` -> `supabase.auth.signInWithPassword()`. Marked `noindex`. Links to `/register` and `/forgot-password`.

### Register (`/register`)

The registration counterpart. Renders `LoginRegister` in register mode and calls `useAuthStore.register(userData)` -> `supabase.auth.signUp()`. Marked `noindex`.

### ForgotPassword and ResetPassword

`ForgotPassword` initiates a Supabase password reset email; `ResetPassword` handles the post-click landing and submits the new password. Both are noindex.

### AuthCallbackPage (`/auth/callback`)

Handles the OAuth/email-code exchange redirect. Exchanges the code for a session, then navigates to the next step (`/add-phone` or `/profile-completion` or `/account`).

### AddPhonePage and ProfileCompletion

`AddPhonePage` collects a phone number after an OAuth sign-up that did not include one. `ProfileCompletion` gathers minimum profile fields (name, role) before the user can access the full dashboard. `ProfileCompletionRouteGuard` wraps the authenticated route tree and redirects incomplete profiles here.

### Account (`/account`)

The user dashboard. Shows a sign-in prompt with links to `/login` and `/register` when unauthenticated; otherwise mounts `AccountSection`, which renders the tabbed dashboard. Tabs include:

- **Home** (`AccountHomeTab`) - dashboard overview
- **Profile** (`AccountProfileTab`) - profile info
- **Details** (`AccountDetailsTab`) - account details
- **Address** (`AccountAddressTab`) - address management
- **My Properties** (`AccountMyPropertyTab`) - user's listings
- **Add Property** (`AccountAddPropertyTab`) - quick add
- **Favorites** (`AccountFavoritePropertyTab`) - liked properties (from `swipeService`)
- **Payments** (`AccountPaymentTab`) - payment info
- **Change Password** (`AccountChangePasswordTab`) - password change

Marked `noindex` because it is a private user surface. See [Authentication](../features/Authentication) for the full session lifecycle.

### AccountDeletionRequest (`/delete-account`)

A GDPR-compliant deletion request form. Pre-fills email from `useAuthStore` when logged in but stays accessible to anonymous users. Lets the user pick deletion type (account vs. data) and reason, then submits via `deletionService.submitDeletionRequest(data)` (the backend service that replaced the legacy Formspree integration). Shows a success state and tracks the request id for status checks via `deletionService.getDeletionRequestStatus(id)`. Marked `noindex`.

### McpLogin (`/mcp/login`)

A specialized login page for MCP (Model Context Protocol) clients like Claude, ChatGPT, Cursor, and Factory. It reuses the phone+password login logic and, on success, redirects back to the client's `redirect_uri` with an access token in the URL. The `ALLOWED_MCP_ORIGINS` allowlist (`localhost:3000`, `localhost:5173`, `claude.ai`, `chatgpt.com`, `chat.openai.com`, `cursor.sh`, `app.factory.ai`) gates which redirect URIs are accepted. Uses `getSupabaseAccessToken()` to extract the token for the client.

## Private Routes and Guards

- `PrivateRoute` (`src/components/account/PrivateRoute.jsx`) wraps any route that requires an authenticated user.
- `ProfileCompletionRouteGuard` (`src/common/ProfileCompletionRouteGuard.jsx`) sits inside the `LocaleGate` in `src/App.jsx` and redirects authenticated users with incomplete profiles to `/profile-completion`.
- The `useAuthStore.initializeAuth()` call in `App.jsx` rehydrates the Supabase session on app load, so a logged-in user stays logged in across refreshes.

## Indexation

All account pages are `noindex` because they are private user surfaces, not discoverable content. The only publicly linked entry points are `/login` and `/register` from the header.

See [Authentication](../features/Authentication) for the session lifecycle, [State Management](../state/State-Management) for the auth store internals, and [API Layer](../services/API-Layer) for how the token is injected into requests.
