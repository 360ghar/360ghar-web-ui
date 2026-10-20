# Old React site: auth, account and global features, checked against the backend

Paths below use two short prefixes:
- **FE** = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-web-ui/src`
- **BE** = `/Users/sakshammittal/Documents/360ghar/github/360ghar/360ghar-backend/app`

All backend routes sit under `/api/v1` (`BE/api/api_v1/api.py`).

**Biggest findings, in short:**
- **Retry bug in `http.js`.** The retry counter and auth flags don't survive axios's config merge, so GET retries have no limit and a lasting 401 can loop.
- **Profile tab save fails.** It sends empty strings that the backend rejects, for any user with no date of birth or no profile image.
- **Google users are never sent to profile completion.** The backend's password check runs first and reports `password_setup`, which the frontend just sends home.
- **Register throws away the full name.** It is collected but never sent.
- **Phone added on `/add-phone` never reaches the backend profile.**
- **Deletion requests from logged-out users, the newsletter form and `paymentService` have no working backend.**

Evidence for each is in the gaps list at the end.

---

## 0. Shared auth and HTTP layer (used by every route)

**Files:** `FE/services/http.js`, `FE/services/api.js`, `FE/services/supabaseClient.js`, `FE/services/authService.js`, `FE/store/authStore.js`, `FE/utils/authStage.js`, `FE/utils/userStorage.js`, `FE/lib/authErrors.js`, `FE/services/lastAuthMethod.js`, `FE/utils/apiError.js`

**`http.js` (axios wrapper)**
- `api` sends the auth header; `publicApi` does not.
- Base URL is `VITE_API_BASE_URL`, otherwise `/api` (the Vite proxy rewrites that to `/api/v1`). Timeout is 30s. Plain `http://` is forced to `https://` except on localhost.
- **Token:** read from an in-memory cache (`getCachedAccessToken`). If the cache is empty it falls back to Supabase `getSession()`.
- **Retry:** GET requests only, on status 408/429/502/503/504 or a network error. Up to 3 retries with a 1s×n backoff. 500 is not retried.
- **401 handling:** refresh the Supabase session once (shared across concurrent requests), then retry the request with the new token.
  - If the refresh fails, or the retry already happened: clear the `user` key in localStorage and fire the `360ghar:auth-cleared` window event. The auth store listens for it and sets `isAuthenticated=false`.
  - There is an opt-out flag, `SKIP_AUTH_RETRY`. **It does not work — see the frontend defects below.**
- During prerender, requests are short-circuited: empty envelope, a bundle file (`/prerender-data.json`), or live.
- **Error text:** `extractError` reads `error.message` / `error.code` from the backend envelope first, then `detail` (string, array or object).

**Supabase client (`supabaseClient.js`)**
- Loaded lazily with `flowType:'pkce'`, `persistSession`, `autoRefreshToken`, `detectSessionInUrl:false`, `lock: processLock`.
- Env vars: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`. If missing it only warns; the first real use throws.

**Every Supabase auth call the site makes**

| Method | Where it's used |
|---|---|
| `signInWithPassword({email\|phone, password})` | Login; re-checking the current password in Change Password |
| `signInWithOAuth({provider:'google', redirectTo: <origin, www stripped>/auth/callback})` | Login and Register |
| `exchangeCodeForSession(code)` | `/auth/callback` |
| `signInWithOtp({phone, options:{shouldCreateUser}})` (SMS) | Login, Register, Forgot password |
| `signInWithOtp({email, options:{shouldCreateUser, emailRedirectTo: origin/auth/callback}})` (6-digit code) | Same three |
| `verifyOtp` with `type` `sms` / `email` / `phone_change` | OTP steps; `phone_change` for `/add-phone` |
| `updateUser({password})` | Set password after signup, reset password, change password |
| `updateUser({phone})` | `/add-phone` |
| `getUser`, `getSession`, `refreshSession`, `signOut`, `onAuthStateChange` | General session handling |

- `signUp` is never used; only the prerender stub mentions it.
- No magic-link flow is intended. However, `emailRedirectTo` is set, so if the Supabase email template includes a link, clicking it lands on `/auth/callback`, and that page would record the method as "google".
- `shouldCreateUser` defaults to `false`. It is `true` only on Register, and on Login when the identifier doesn't exist yet.
- Phones are normalized to `+91XXXXXXXXXX`.

**Auth store (`authStore.js`)**
- `initializeAuth` runs on app start: subscribe to auth events → get token → load the cached user (1h TTL) → `syncUserProfile`.
- `syncUserProfile` calls `GET /users/profile` and `GET /users/me/auth-state?app=ghar360`.
  - A 401 or 404 on the profile call sets `authStage='profile_completion'`.
  - If auth-state fails, the stage defaults to `active`.
  - On success it calls PostHog `identify(id, {email, name, phone})`.
- `TOKEN_REFRESHED` only updates the token. `SIGNED_IN` and `USER_UPDATED` re-sync the profile (with a 10s timeout).
- `logout({deleteAccount})`: optionally `POST /auth/delete-account`, then `signOut`, then clear state.

**Stage → page mapping (`utils/authStage.js`)**

| Stage | Sent to |
|---|---|
| `identifier_verification` | `/login` |
| `password_setup` | `/` |
| `profile_completion` | `/profile-completion` |
| `app_onboarding` | `/` |
| `active` | `/` |

**Last auth method (`lastAuthMethod.js`)**
- Stored in localStorage key `360ghar:lastAuthMethod` as `{method, identifierHint (masked), ts}`.
- Allowed values: `google`, `email_password`, `phone_password`, `phone_otp`, `email_otp`.
- `afterAuthSuccess` writes it locally and fires `POST /auth/last-method {method}` in the background.
- The Login page shows a "Last used" badge from it.

---

## 1. `/login` (and `/hi/login`)

**Files:** `FE/pages/account/Login.jsx`, which renders `LoginFlow` in `FE/components/forms/LoginRegister.jsx:624`. Hooks: `FE/hooks/useWebOtp.js` (autofill via `OTPCredential`) and `FE/hooks/useResendTimer.js` (30s).

**Flow:** identifier → either password, or OTP (then a forced set-password step if the account has none) → navigate by stage.
- **Identifier check:** email must match the regex `^[^\s@]+@[^\s@]+\.[^\s@]+$`. A phone must be digits only, exactly 10 digits, starting with 6–9. A leading `91` is stripped when the input is 12 digits.
- Shows a toast for `?error=` in the URL (written by the callback page), and the last-used badge.
- Google button calls `signInWithGoogle('/')`, which stores the destination in `sessionStorage` under `oauth:next`.
- **Password step:** a 25s timeout is raced against `login()`. If time runs out, it checks the store and navigates anyway if the user is already authenticated.
- **OTP step:** after verifying, it records `EMAIL_OTP` or `PHONE_OTP`. If `has_password` is false it shows a set-password step that can't be skipped: at least 8 characters, 1 uppercase, 1 digit, and a matching confirm field. That calls `updateUser` and records `*_PASSWORD`.

| API call | Service | Body | Auth | Backend | Status |
|---|---|---|---|---|---|
| POST `/auth/identifier-status` | `authService.checkIdentifierStatus` (`publicApi`) | `{identifier}` (phone sent as bare 10 digits) | no | `BE/api/api_v1/endpoints/auth.py:91`, response `IdentifierStatusResponse` at `:54` `{exists, verified, has_password, channel, next_step}`, logic in `BE/services/user.py:576` | OK. Rate limit 10/60s per IP **and 5/hour per identifier** (`auth.py:42-43`) |
| POST `/auth/last-method` | `authService.recordLastMethod` | `{method}` | yes | `auth.py:139` → 204. Enum at `BE/models/enums.py:293` (also has `apple`) | OK |
| GET `/users/profile` | `authService.getCurrentUser` | — | yes | `BE/api/api_v1/endpoints/users.py:247`, `UserSchema` at `BE/schemas/user.py:158` | OK. User row is auto-created on first request (see gaps) |
| GET `/users/me/auth-state?app=ghar360` | `utils/authStage.fetchAuthStage` | — | yes | `users.py:51` → `BE/services/user.py:767`, returns `{stage, next_action, missing_fields}` | OK. For `ghar360` there is no onboarding check, so `app_onboarding` never comes back (`user.py:713`) |

---

## 2. `/register`

**Files:** `FE/pages/account/Register.jsx`, which renders `RegisterFlow` in `LoginRegister.jsx:99`.

**Steps:**
1. **Details:** full name, phone (10 digits, starts 6–9), email (regex). At least one of phone or email is required; phone wins if both are given. The Terms and Privacy checkbox is required (links to `/policies/terms-of-service` and `/policies/privacy-policy`). Google button available.
2. **OTP:** `signInWithOtp(shouldCreateUser:true)`, then `verifyOtp`, with a 30s resend timer and autofill.
3. **Password:** strength meter (0–5), rule of at least 8 characters with 1 uppercase and 1 digit, plus confirm. Calls `updateUser({password})`, shows a toast, and navigates to `/account`. The route guard then redirects to profile completion if needed.

**What's wrong here:**
- **No backend calls of its own.** It never calls identifier-status or last-method.
- **`fullName` is collected and thrown away.** It is never sent — not via Supabase `options.data`, and not via PUT. The backend would have used it: it reads `user_metadata.full_name` (`BE/services/user.py:203`).
- **An existing user who enters their phone here** gets an OTP login and then silently overwrites their password.

---

## 3. `/forgot-password`

**File:** `FE/pages/account/ForgotPassword.jsx`

**Flow:**
1. Identifier (email or phone) → `POST /auth/identifier-status`. Phone is sent as `+91XXXXXXXXXX`.
2. If `!exists`, it shows `NO_ACCOUNT_FOUND_MESSAGE`. If the response is null or the server is down, it shows "unavailable".
3. Sends the OTP with `shouldCreateUser:false`, then `verifyOtp` (sms or email). Autofill is on for SMS only.
4. Sets `sessionStorage.passwordResetFlow=1` and navigates to `/reset-password`.

**Backend:** same as above (`auth.py:91`). Both this page and Login count against the 5/hour per-identifier limit.

---

## 4. `/reset-password`

**File:** `FE/pages/account/ResetPassword.jsx`

**Flow:**
1. `getSession()` and check `expires_at`; if expired, `refreshSession()`.
2. If there's no valid session, it shows an "invalid" card with a "request new link" button.
3. Form uses Formik and Yup: password of at least 8 characters with an uppercase letter and a digit, plus a matching confirm field.
4. `updateUser({password})`, remove the `passwordResetFlow` flag, `signOut`, and send the user to `/login`.

- **No backend calls.**
- **Security note:** any signed-in user who opens `/reset-password` directly can change their password **without the current password**. That bypasses the check in the Change Password tab.

---

## 5. `/auth/callback`

**File:** `FE/pages/account/AuthCallbackPage.jsx`

**Flow:**
1. If `?error` or `error_description` is present → `/login?error=…`. If there's no `code` → `/login?error=auth`.
2. `exchangeCodeForSession(code)` → `afterAuthSuccess(GOOGLE)` (which calls `POST /auth/last-method`) → `syncAfterExternalAuth()` (which calls `GET /users/profile` and `GET /users/me/auth-state`).
3. `getUser()`: if there's no phone → `/add-phone?next=…`; otherwise go to `next`.
4. `next` comes from `sessionStorage['oauth:next']` first, then the `?next=` query param. Only same-site paths are allowed.

- It uses plain `useNavigate`, so the `/hi` locale is lost after Google sign-in. `signInWithGoogle` always passes `'/'`.

---

## 6. `/add-phone`

**File:** `FE/pages/account/AddPhonePage.jsx`

**Flow:**
1. Phone (10 digits, starts 6–9) → `updateUser({phone:+91…})`.
2. OTP → `verifyOtp(type:'phone_change')` → `afterAuthSuccess(GOOGLE)` → `syncAfterExternalAuth()` (with a full-screen "syncing" overlay) → navigate to `next`.
3. Resend (30s) and "Change number" controls. A Skip button explains what skipping means.

**Backend:** no direct call. `PUT /users/me/phone` exists (`users.py:152`) but is **never called**, so the backend profile never gets the phone (see gaps).

---

## 7. `/profile-completion`

**File:** `FE/pages/account/ProfileCompletion.jsx`

**Flow:**
1. On load: `GET /users/profile` to pre-fill `full_name` (or `name`) and `date_of_birth`.
2. Validation: name is required; date of birth is required, with `max=today`.
3. `authStore.updateProfile` → `PUT /users/profile {full_name, date_of_birth}`.
4. `GET /users/me/auth-state`, then write the stage to the store. If it still says `profile_completion`, it is forced to `active` to avoid a redirect loop.
5. Navigate by stage. If fetching the stage fails, go to `/account`.

**Backend:**
- PUT handler is `users.py:253`, body `UserUpdate` at `BE/schemas/user.py:57`.
- `full_name` must be at least 2 characters after sanitizing (`:81`). **Date of birth must be 18–120 years ago** (`:97-110`); the frontend doesn't enforce this.
- The update commits before responding (`BE/services/user.py:1029-1034`), so the follow-up auth-state call sees fresh data.
- The profile gate requires `("full_name","date_of_birth")` (`BE/services/user.py:696`). These are the only gated fields.

---

## 8. `/account` (all tabs)

**Files:** `FE/pages/account/Account.jsx`, `FE/components/account/AccountSection.jsx`, and the `Account*Tab.jsx` files. Stores: `FE/store/userStore.js`, `FE/store/propertyStore.js`, `FE/store/visitStore.js`.

- **Guard:** while `isInitializing` it shows a loader. If not authenticated it shows a "Sign in required" card with links to `/login` and `/register` — it does not redirect.
- **Tabs** come from `?tab=`, with aliases: `favourites`/`fav`→`favorites`, `properties`→`my-properties`, `password`→`change-password`, `visits`→`home`, `account-details`→`details`.
- **Logout** button: `authStore.logout()` → `/login`.

| Tab | Controls and validation | API | Backend | Issues |
|---|---|---|---|---|
| **home** | Greeting; upcoming visit count; "profile %" based on full_name, email and phone (**not date of birth**); quick links to `/post-property`, `?tab=profile`, `?tab=my-properties` | GET `/visits/upcoming` (`visitService.getUpcoming`) | `BE/api/api_v1/endpoints/visits.py:98` returns `CursorPage[Visit]` | The % doesn't match the backend gate. First page only |
| **profile** | Read-only until "Edit". full_name (min 3, required), email (valid, **required**), phone (`^[+]?\d{10,15}$`, required), date_of_birth (no check), profile_image_url (no check). Header card shows image, name, email, phone, and "agent assigned" if `agent_id` is set | GET/PUT `/users/profile` sending all 5 fields | `users.py:247/253` | **Empty DOB → 422; empty image URL → 400** (`BE/services/user.py:1014-1024`). Phone-only users can't save because email is required. Editing email or phone only changes the backend copy and resets its verified flags (`user.py:986-1010`) |
| **address** | Read-only card: `full_address` or locality/city/state/pincode, plus email and phone | GET `/users/profile` | `UserSchema` has **no address fields** | The location line always shows "—" |
| **details** | First name, last name, display name, display email → PUT `{full_name: displayName \|\| first+last, email}` | GET/PUT `/users/profile` | Same | Display name is pre-filled, so **editing first/last name has no effect**. Email drift as above |
| **my-properties** | Table: thumbnail, title (links to `/property/:id`), location, price, date; Edit and Delete buttons | GET `/properties/me` | `BE/api/api_v1/endpoints/properties.py:277` returns `CursorPage[Property]` | **Edit/Delete buttons do nothing** (PUT at `properties.py:500` and DELETE at `:532` exist). No pagination |
| **favorites** | Grid of `PropertyItem` | GET `/swipes?is_liked=true` (`swipeService.getSwipes`) | `BE/api/api_v1/endpoints/swipes.py:57` returns `CursorPage[Property]` with an `is_liked` filter | The skeleton reads `isLoading` but the fetch sets `isSwipeLoading`. First page only |
| **change-password** | Current, new and confirm fields; Yup rules: new ≥8 chars with uppercase and digit, confirm must match; 0–5 strength meter | Supabase only: `getUser` → `signInWithPassword(current)` → `updateUser({password})` | — | Users with no password (Google, OTP-only) can't use it, and there is no "set password" option |

**Unused components:** `UserProfile.jsx`, `AccountAddPropertyTab.jsx`, `Logout.jsx`.

---

## 9. `/delete-account`

**File:** `FE/pages/account/AccountDeletionRequest.jsx`, service `FE/services/deletionService.js`

**Signed-in users**
- A notice and one button, with no second confirmation step.
- `logout({deleteAccount:true})` → `POST /auth/delete-account {confirm:true}` → 204 (`auth.py:222`; request schema at `:75`; rate limit 30/60s) → `signOut` → `/`.
- The canonical alternative is `DELETE /users/me` (`users.py:110`), which returns a `MessageResponse`.

**Signed-out users**
- Form: email (required); type radio (account / personal / properties / specific); reason select (required: privacy, inactivity, duplicate, security, poor_experience, other); message textarea.
- `submitDeletionRequest` always throws. The page then redirects to a `mailto:privacy@360ghar.com` link with the subject and body filled in.
- **No API is called**, and the success screen can never be reached.

---

## 10. `ProfileCompletionRouteGuard` (wraps every route)

**File:** `FE/common/ProfileCompletionRouteGuard.jsx`, rendered by `LocaleGate` in `FE/App.jsx`.

- Waits until `isInitializing` is false, and only acts on authenticated users.
- **Exempt paths** (after stripping `/hi`): `/profile-completion`, `/auth/callback`, `/add-phone`, `/forgot-password`, `/reset-password`. It also skips when `sessionStorage.passwordResetFlow==='1'`.
- If `authStage==='profile_completion'` → replace-navigate to `/profile-completion`.
- If the user is on `/login` (only `/login`; `/register` is excluded on purpose) → go to the stage's page.
- Shows `PageLoader` while a redirect is about to happen.

---

## 11. Header, nav, mobile menu, off-canvas panel

**Files:** `FE/common/layout/Header.jsx`, `NavMenu.jsx`, `MobileMenu.jsx`, `OffCanvas.jsx`, `LanguageSwitcher.jsx`; link data in `FE/data/CommonData.jsx`.

**Header**
- Skip link to `#main-content`, logo, desktop nav. Items that don't fit move into a "More" dropdown, measured with a ResizeObserver.
- **Signed in:** avatar (`profile_image_url`) and name → dropdown with My Account `/account`, Favorites `/account?tab=favorites`, My Visits `/account?tab=visits` (this lands on the Home tab; there's no visits list), and Logout (→ `/`).
- **Signed out:** Sign In `/login` and a Post Property button (default link `/post-property`).
- Also: EN/HI switcher, off-canvas toggle, mobile toggle. Sticky after scrolling 100px.

**Nav menu**
- Home `/`
- Properties `/properties`
- Localities: All `/localities`, `/locality/dlf-phase-1-gurgaon`, `-2-`, `-5-`, `golf-course-road-gurgaon`, `sushant-lok-1-gurgaon`
- Vastu Checker `/vastu-checker`
- Design Blueprint `/design-blueprint`
- Data Hub: `/circle-rates`, `/rera-projects`, `/bank-auctions`, `/stamp-duty-calculator`, `/verify-ownership`, `/zone-checker`, `/regulatory-updates`, `/builder-reputation`
- Services: Post Property `/post-property`, Property Valuation (also `/post-property`), Virtual Tours (`/properties`), Map Search `/map-location`, AI Assistant `/ai-agent`, Refer & Earn `/refer-and-earn`
- Resources: `/blog`, `/ai-design-studio`, `/about-us`, `/faq`, `/emi-calculator`, `/loan-eligibility-calculator`, `/area-converter`, `/area-calculator`, `/property-document-checklist`, `/capital-gains-tax-calculator`, `/rent-receipt`, `/policies`
- Contact `/contact`

**Mobile menu:** search box → `/properties?q=`; user card with the same 4 account actions; full nav; Sign In `/login` and Sign Up `/register`; language switcher.

**Off-canvas panel:** address text, `mailto:info@360ghar.com`, a Google Maps embed of Gurugram (`FE/seo/siteMetadata.js:49`), and social links.

- No API calls anywhere in these. `TopHeader.jsx` is unused.

---

## 12. Footer

**Files:** `FE/common/layout/Footer.jsx`, `FooterBottom.jsx`, `footer/*`

**Logo column:** logo, description, contact info, and a **newsletter form that does nothing**. It only shows a success message for 3s; there is no API.

**Useful links**

| Label | Link |
|---|---|
| Property Listings | `/properties` |
| About 360Ghar | `/about-us` |
| Blog & Insights | `/blog` |
| AI Assistant | `/ai-agent` |
| Vastu Checker | `/vastu-checker` |
| AI Design Studio | `/ai-design-studio` |
| Auction Sources | `/auction-sources` |
| EMI Calculator | `/emi-calculator` |
| Loan Eligibility | `/loan-eligibility-calculator` |
| Area Converter | `/area-converter` |
| Property Checklist | `/property-document-checklist` |
| Circle Rates | `/circle-rates` |
| RERA Projects | `/rera-projects` |
| Stamp Duty Calculator | `/stamp-duty-calculator` |
| Help Center | `/faq` |
| Contact Us | `/contact` |
| For AI Assistants | `/for-ai` |
| Refer & Earn | `/refer-and-earn` |
| vs NoBroker / MagicBricks / 99acres | `/vs/nobroker`, `/vs/magicbricks`, `/vs/99acres` |
| Careers | `/careers` |

**Services column**

| Label | Link |
|---|---|
| Property Search | `/properties` |
| Post Property | `/post-property` |
| Virtual Tours | `/properties` |
| Bank Auctions | `/bank-auctions` |
| Verify Ownership | `/verify-ownership` |
| Zone Checker | `/zone-checker` |
| Builder Reputation | `/builder-reputation` |
| Regulatory Updates | `/regulatory-updates` |
| Property Management | `/contact` |
| Investment Advisory | `/contact` |

**Connect column:** social links (Facebook `/people/360Ghar`, X `/360Ghar`, LinkedIn `/company/360ghar`, Instagram `/360ghar/`), language switcher, and quick actions: `/properties`, `/post-property`, `/project`, `/account`, `/contact`.

**Bottom:** trust badges; `mailto:info@360ghar.com`; bottom bar with © and links to `/policies/terms-of-service`, `/policies/privacy-policy`, `/refer-and-earn`, `/for-ai`.

- **Unused:** `FooterTwo.jsx`, which contains a Formspree `SubscribeBox`.

---

## 13. ChatBot (on every page)

**Files:** `FE/components/chatbot/*` (ChatBot, ChatBubble, ChatPanel, ChatHeader, ChatMessages, ChatInput, `messages/*`, `widgets/*`), `FE/store/chatStore.js`, `FE/services/chatService.js`

**UI**
- Floating bubble opens a dialog.
- Header: title, "Online/Thinking" status, reset (clears messages and `conversationId`), close.
- Welcome screen with 4 quick prompts: search Gurugram, schedule visit, rent status, maintenance. The last two need signed-in tools, so they're useless for guests.
- Input: max 4000 characters, counter shown after 3500. Enter sends, Shift+Enter adds a line. A stop button aborts the stream.
- Bot replies render Markdown (react-markdown + remark-gfm) with tool-call chips.
- Guests see a banner linking to `/login`.
- History is kept in localStorage `360ghar:chatStore` (`messages`, `conversationId`). On login `conversationId` resets; on logout the whole chat resets.

**Streaming:** yes, Server-Sent Events via `fetch` POST (not EventSource), bypassing `http.js`.

| Call | Auth | Body | Backend | Notes |
|---|---|---|---|---|
| POST `/agent/chat` | Bearer from `getSupabaseAccessToken()` | `{message, conversation_id}` | `BE/api/api_v1/endpoints/agent_chat.py:103`, `AgentChatRequest` at `BE/schemas/ai_agent.py:10` (message 1–4000) | No 401 refresh. A non-2xx response throws a generic "status N" error |
| POST `/agent/chat-public` | no | `{message}` | `agent_chat.py:50`, `GuestChatRequest` at `ai_agent.py:17`. **Rate limit 10/60s per IP** (`:29`) | Guests only get the discovery (property-search) tools |
| GET `/agent/conversations?limit&cursor` | yes | — | `:212` returns `CursorPage[ConversationSummary]` | **Unused.** URL is `${getApiBaseUrl()}/agent/...` on the axios `api` instance, so it gets a double `/api` prefix when the base is relative (dev) |
| GET `/agent/conversations/{id}/messages?limit` | yes | — | `:229` returns a plain `list[ConversationMessageOut]` | Unused |
| DELETE `/agent/conversations/{id}` | yes | — | `:259` returns 204 | Unused |

**Stream events** (backend `BE/services/ai_agent/agent_service.py:268-466`)

| Event | Payload |
|---|---|
| `conversation_info` | `{conversation_id}` |
| `text_chunk` | `{text}` |
| `tool_call_start` | `{call_id, tool}` |
| `tool_call_end` | `{call_id, tool, success, summary}` |
| `widget` | `{widget_name, structured_content}` |
| `done` | — |
| `error` | `{code, message}` |
| **`fallback`** | `{provider, reason}` (`:444`) — **the frontend ignores this** |

**Widgets** (`messages/ChatWidget.jsx` map)

| Backend widget name | Frontend component |
|---|---|
| PropertySearchWidget | PropertyResults (cards link to `/property/:id`, "view all" to `/properties`) |
| PropertyDetailsWidget | PropertyDetail |
| VisitListWidget, VisitSchedulerWidget | VisitList |
| OwnerDashboardWidget | Dashboard |
| LeaseDetailsWidget, LeaseManagementWidget | Lease |
| MaintenanceWidget | Maintenance |
| RentCollectionWidget, TenantRentWidget, PropertySwipeWidget | Generic |

- These 11 names match the backend `WIDGETS` list (`BE/mcp/chatgpt/__init__.py:38`). Each widget has its own error boundary.

---

## 14. Location store and `LocationFallbackNotifier`

**Files:** `FE/store/locationStore.js`, `FE/common/layout/LocationFallbackNotifier.jsx`

- `initializeLocation()` runs on app mount. If a saved location is less than 24h old it is reused; otherwise the browser is asked for its position (timeout 10s, high accuracy, maximumAge 5 min).
- On failure it falls back to Gurgaon (28.4595, 77.0266) with a reason message: permission denied, unavailable, timeout, or unsupported. During prerender it uses the fallback directly.
- Saved in localStorage key `location-store`: location, timestamp and `isLocating`. `error` is not saved, so the notice won't reappear after a reload.
- `useLocationFallback()` returns `[isFallback, reason]`. The notifier shows a toast warning for 6s, once per reason. It is mounted outside the router.
- **No backend call.** `PUT /users/location` (`users.py:290`, via `userService.updateLocation`) is never used.

---

## 15. OfflineIndicator and scroll-to-top

- **`FE/common/layout/OfflineIndicator.jsx`:** uses `navigator.onLine` plus online/offline events. Shows a status banner with `common:offlineIndicator.message`.
- **Scroll-to-top on navigation:** `RouteScrollToTop` in `FE/App.jsx` calls `window.scrollTo(0,0)` and PostHog `capturePageView()` on every pathname change.
- **Scroll-to-top button:** `FE/common/layout/ScrollToTop.jsx`, visible after 400px, smooth scroll.
- Also global: `UIScrollLockEffect`, `ErrorBoundary`, and `SEO` with 7 structured-data schemas.
- `FE/main.jsx` also registers WebMCP tools: `search_properties` (hard-coded to `https://api.360ghar.com/api/v1/properties`), `schedule_visit` (a stub), and `calculate_emi`.

---

## 16. PostHog (`FE/services/posthogService.js`)

**Setup**
- `init()` runs from `FE/main.jsx` when the browser is idle (or after 2s).
- Only in production builds, only when `VITE_PUBLIC_POSTHOG_KEY` is set, and never during prerender.
- Config: `api_host=VITE_PUBLIC_POSTHOG_HOST`, `autocapture:false`, `capture_pageview:false`.
- Session recording: `maskAllInputs:true`, `maskTextClass:'ph-mask'`, `blockClass:'ph-no-capture'`, no headers or bodies.

**Events captured**
- `$pageview`: once when PostHog loads, then on every route change (changes before load are dropped).
- `web_vitals` `{metric_name, value, metric_id, rating}` for CLS, INP, LCP, FCP, TTFB (`FE/seo/reportWebVitals.js`). The same data also goes to gtag if present.
- `identify(userId, {email, name, phone})` — this sends personal data to PostHog.
- `reset()` on sign-out and on the auth-cleared event.
- No other custom events are captured.

---

## 17. `paymentService` (`FE/services/paymentService.js`)

**Dead code: nothing imports it.** Its fields also don't match the backend:

| Frontend call | Backend | Mismatch |
|---|---|---|
| POST `/payments/razorpay/order {booking_id}` | `BE/api/api_v1/endpoints/payments.py:30` → `RazorpayOrderResponse` (`BE/schemas/payment.py:12`) | Frontend expects `key`; backend returns **`key_id`** (plus `notes`) |
| POST `/payments/razorpay/verify` | `:43` | Matches |
| GET `/payments/methods` | `:66` → `list[PaymentMethodOut]` (`payment.py:43`) | Backend returns `method_type`, `nickname`, `created_at`; no `type` or expiry fields |
| POST `/payments/methods {type, last4, brand, expiry_month, expiry_year, is_default}` | `:78`, `PaymentMethodCreate` (`payment.py:28`) | **`method_type` is required, so this gets a 422.** Expiry fields don't exist; `razorpay_token`, `razorpay_payment_id`, `nickname` are missing from the frontend |
| PUT `/payments/methods/{id}` | `:91`, `PaymentMethodUpdate` (`payment.py:38`) | Backend only accepts `nickname` and `is_default` |
| DELETE `/payments/methods/{id}` | `:108` | Matches |

---

## 18. i18n and how `/hi` works

**Files:** `FE/i18n/index.js`, `languageDetector.js`, `I18nLink.jsx`, `FE/store/localeStore.js`, `FE/common/layout/LanguageSwitcher.jsx`

**Setup**
- i18next plus react-i18next. Languages: `en`, `hi`; fallback `en`; `load:'currentOnly'`; `useSuspense:true`.
- 14 namespaces: common, home, properties, projects, tools, data-hub, account, seo, forms, landing, compare, truth, policies, blog.
- Both languages are bundled up front from `FE/i18n/locales/{en,hi}/*.json`. **I checked key parity: every hi file has all its en keys.** The only missing key I found is `account:deletion.emailSupport`, which is missing in en too; the code supplies a default.
- Missing keys are logged in dev.

**Routing**
- Every route is registered twice: under `/hi` (with the leading slash stripped, plus `/hi` itself for Home) and without a prefix.
- `LocaleGate` sets the locale store, calls `i18n.changeLanguage`, sets `<html lang>`, and renders the route guard.
- The language detector reads only the URL path. The switcher writes `localStorage.i18nextLng`, but nothing reads it.
- `I18nLink`, `I18nNavLink` and `useI18nNavigate` add the `/hi` prefix. `stripLocalePrefix` removes it.
- `SEO` emits hreflang alternates, but not on noindex pages; all auth pages are noindex.
- **Gap:** the callback page and the Google redirect lose `/hi`.

---

## 19. Environment variables (names only)

**Frontend (`VITE_*`)**
- `VITE_API_BASE_URL` — axios base URL; defaults to `/api`; set to the absolute backend URL including `/api/v1` in `netlify.toml`
- `VITE_API_SERVER` — Vite proxy target; also used by `vastuService`
- `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY` — required for auth
- `VITE_AUTH_REDIRECT_URL` — dev-only override of the Google callback origin
- `VITE_PUBLIC_POSTHOG_KEY` and `VITE_PUBLIC_POSTHOG_HOST`
- `VITE_GOOGLE_PLACES_API_KEY` / `VITE_GOOGLE_MAPS_API_KEY` — maps; not used by these routes

**Built-in Vite flags used:** `PROD`, `DEV`, `MODE`, `VITEST`.

**Other:**
- The Google Analytics (gtag) ID is hard-coded in `index.html`, not an env var.
- Build-only, not `VITE_*`: `BUILD_FAST`, `BUILD_CACHE_DISABLED`.
- The Google OAuth client ID is **not** needed (it uses Supabase's redirect flow). The Supabase redirect allowlist and the Google Cloud callback URI must be configured (see `.env.example`).

---

## Backend gaps and contract mismatches

1. **No endpoint for deletion requests from signed-out users.** `deletionService.js` says so and the backend has no `/account/delete-request*` route. Only `POST /auth/delete-account` (`BE/api/api_v1/endpoints/auth.py:222`) and `DELETE /users/me` (`BE/api/api_v1/endpoints/users.py:110`) exist, and both need auth.
2. **No newsletter endpoint.** No match for newsletter/subscribe in `BE/api/api_v1/endpoints/`. The footer form is fake (`FE/common/layout/footer/FooterLogoDesc.jsx`).
3. **Payments contract mismatch** — see section 17 (`key` vs `key_id`, `type` vs required `method_type`, expiry fields that don't exist).
4. **The user schema has no address fields.** `BE/schemas/user.py:12-156` has no full_address, locality, city, state or pincode, and no endpoint sets them. The Address tab is always empty.
5. **`PUT /users/profile` rejects the Profile tab's empty strings.**
   - `date_of_birth: ""` fails validation as a date → 422 (`BE/schemas/user.py:73`).
   - `profile_image_url: ""` → 400 "must be an absolute http(s) URL" (`BE/services/user.py:1014-1024`, `BE/utils/validators.py:195`).
   - The under-18 rule (`BE/schemas/user.py:97-110`) isn't checked on `/profile-completion`.
6. **Email/phone edits only change the backend copy of the user.** `BE/services/user.py:986-1010` resets `email_verified` / `phone_verified` without touching the Supabase identity. That can drift, and can push the gate to `identifier_verification`.
7. **Gate order hides profile completion from users without a password.** `compute_auth_gate_state` checks `password_setup` before `profile_completion` (`BE/services/user.py:800-818`). Google users usually have no password, so they get `password_setup`, which the frontend sends to `/` (`FE/utils/authStage.js`). They never reach `/profile-completion`, and the web app offers them no way to set a password.
   - Unverified: whether GoTrue stores an empty string rather than NULL in `encrypted_password` for OAuth users, which would affect the `IS NOT NULL` check (`BE/services/user.py:858`).
8. **The backend auto-creates users, contrary to the frontend's assumption.**
   - `get_or_create_user_from_supabase` runs on every authenticated request (`BE/api/api_v1/dependencies/auth.py:210,334`), so a 401 on `/users/profile` does not mean "no profile row".
   - The frontend's 401/404 → `profile_completion` branch (`FE/store/authStore.js:84-94`) is misleading.
   - The backend also returns 503 `AUTH_PROVIDER_UNREACHABLE` / `AUTH_DB_UNAVAILABLE` (`dependencies/auth.py:72-100`) and 403 `USER_INACTIVE` (`:256-265`), which the frontend doesn't handle specially.
9. **Phone added on `/add-phone` never reaches the backend profile.** The user-sync helper only raises verification flags (`BE/services/user.py:150-169`); it never copies the phone. The page never calls `PUT /users/me/phone` (`users.py:152`), so account tabs show "no phone" while `phone_verified` may be true.
10. **Full name from Register is dropped.** The backend would pick up `user_metadata.full_name` on first sign-in (`BE/services/user.py:203`), but the frontend never sends it.
11. **Error format mismatch.** The backend returns `{error:{code,message}}` for HTTPException and its own API exceptions (`BE/infrastructure/errors.py:88-135`); only 422s use FastAPI's default `{detail:[…]}`. `authStore` reads `data.detail` (`FE/store/authStore.js:105,328,407`), so it shows generic messages. `extractError` gets it right.
12. **Chat.**
    - The `fallback` event (`BE/services/ai_agent/agent_service.py:444`) is ignored, so text from a failed provider and the retry can end up joined together.
    - The history endpoints (`agent_chat.py:212,229,259`) exist but no web UI uses them.
    - Guests are limited to 10 requests/60s (`agent_chat.py:29`); a 429 shows up as a raw "status 429" error.
    - Streaming ignores the 401 refresh logic.
13. **identifier-status is tightly rate-limited.** 10/60s per IP and 5 per hour per identifier (`auth.py:42-43`). Login and Forgot both use it, so a user who retries a few times gets locked out. The backend CLAUDE.md says 60/min; the code wins.
14. **Account lists only load the first page.** `/properties/me`, `/swipes`, `/visits/upcoming` are cursor-paginated (`properties.py:277`, `swipes.py:57`, `visits.py:98`). The My-Properties Edit and Delete buttons are also dead, even though the backend routes exist (`properties.py:500,532`).
15. **Backend endpoints the web app doesn't use:** `/auth/config` (`auth.py:208`), `/auth/link-identity` (`:159`), `PUT /users/me/phone`, `/users/location`, `/users/preferences`, `/users/notification-settings`, and the `apple` auth-method value.

## Frontend defects not to carry over

- **Retry/auth flags are lost on every request.** `http.js` keeps its retry counter, auth-retry flag and `SKIP_AUTH_RETRY` as `Symbol` keys on the request config (`FE/services/http.js:282-296,308-313,364`). axios 1.13.5 (the locked version) rebuilds the config with `Object.keys` (`lib/core/mergeConfig.js`), which skips Symbol keys, so all three are dropped. Results:
  - GET retries on 408/429/5xx/network errors never stop.
  - A 401 that keeps coming back after a successful refresh can loop refresh-and-retry.
  - `SKIP_AUTH_RETRY` does nothing, so a 401 right after sign-in can clear the session.
  - No test covers `http.js`.
- **`/reset-password` lets any signed-in session change the password** without the current password (`FE/pages/account/ResetPassword.jsx:28-61,82`).
- **Register silently resets the password** of an existing account (no identifier-status check; `LoginRegister.jsx:210-217`).
- **The Details tab ignores first/last name edits** when the display name is filled (`AccountDetailsTab.jsx:40`).
- **The Favorites skeleton flag is wrong** (`isLoading` vs `isSwipeLoading`, `FE/store/propertyStore.js:93`).
- **Google sign-in drops the `/hi` locale** (`AuthCallbackPage.jsx`, `authService.signInWithGoogle('/')`).