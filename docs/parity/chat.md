# Parity notes: chat and AI surfaces (agent B)

Status: B1, B2 and B3 are done. Unit tests, tsc, eslint and `astro check` pass. The e2e spec `tests/e2e/chat-parity.spec.ts` is written but not run (QA phase). Nothing was checked in a browser.

## Findings about v1

- v1 has NO history UI. `chatService.getConversations`, `getConversationMessages` and `deleteConversation` exist in `360ghar-web-ui/src/services/chatService.js`, but no component or store calls them. History in v2 is new behaviour, built from the openapi schema.
- v1 WebMCP (`360ghar-web-ui/src/main.jsx`) registers `search_properties`, `schedule_visit` and `calculate_emi` with `navigator.modelContext.registerTool(tool, { signal })`. It does not use `provideContext`. `schedule_visit` did not book: it returned a message that says to sign in through the MCP OAuth flow. `search_properties` fetched `https://api.360ghar.com/api/v1/properties` with `q, city, purpose, price_max, bedrooms_min` and returned the raw JSON.
- v1 widget map: PropertySearch, PropertyDetails, VisitList (also VisitScheduler), OwnerDashboard, LeaseDetails and LeaseManagement, Maintenance; RentCollection, TenantRent and PropertySwipe went to Generic. v1 property widgets read `items` and `thumbnail_url`, which the backend does not send.

## Real payload shapes (backend, not guessed)

Source: `360ghar-backend/app/mcp/chatgpt/__init__.py` (widget map), `app/services/ai_agent/agent_service.py` (SSE `widget` event: `{ widget_name, structured_content }`), and `chatgpt-widgets/src/widgets/*` (the readers of each payload).

- Search and swipe: `properties[]` with `id, title, locality, city, base_price, monthly_rent, bedrooms, bathrooms, area_sqft, property_type, purpose, main_image_url`.
- Details: `property{...}` plus `full_address, furnished_status, floor_number, total_floors, facing, amenities[{name}]`.
- Visits: `visits[]` or `bookings[]`, one `visit` or `booking` (with a sibling `property`); rows have `id, property_id, property{}, scheduled_date, status`.
- Owner dashboard: `stats{total_properties, occupied, vacant, total_monthly_income}` and `items[]`.
- Lease: `lease{}` or `leases[]` with `stats{active_leases, total_monthly_rent}`.
- Maintenance: `items[]` or `request{}`.
- Rent: `charges[]`, `payments[]`, `totals{}` or top-level `total_due, total_collected, overdue_count`.
- Errors: `{ error: true, message, requires_auth? }`.
- Timestamps have no zone and are UTC (the widget bundles add `Z`); the normalizer does the same.
- Stored history rows: roles `user`, `widget` (saved before the reply's `assistant` row) and `assistant`. For `widget` rows the API fills `widget_name` and `widget_data` from `tool_name` and `tool_result`. `GET .../messages` returns the newest 100 rows (no cursor).

## B1: history (`HistoryPanel.tsx`, `history.ts`)

- Signed-in users get a clock button in the panel header. It opens a list inside the panel: title (fallback "Untitled conversation"), `updated_at` date, `message_count`. Cursor paging with "Show older conversations".
- Open loads the messages, maps them (`mapMessages`) into the panel model, replaces the current conversation and sets `conversationId`, so the next message continues it.
- Delete asks in the panel (Keep or Delete, no `confirm()`). Escape cancels the confirm only. Focus goes to "Keep" when the confirm opens and back to the row's delete button on cancel. A status line announces "Conversation deleted." Deleting the open conversation resets the chat.
- States: skeleton inside `<Delayed>`, empty text, error with `describeError` and "Try again", open and delete failures inline.
- Lazy loading: `HistoryPanel` is a `React.lazy` import of `ChatPanel`, with its own `QueryProvider`. Guests and signed-in users who never open history do not download it, or TanStack Query, with the panel. The launcher still loads none of it.
- The history button and "new conversation" are disabled while a reply streams.

## B2: widgets (`widgets.ts`, `WidgetViews.tsx`, `chat.css`)

- `normalizeWidget(name, data)` returns a typed shape and never throws. Kinds: properties, property, visits, dashboard, leases, maintenance, rent, notice, generic. Unknown names, non-object data and payloads without the expected fields become `generic` (top-level primitives only, at most 8 rows, text capped, keys cleaned). Only `https` images reach an `<img>`. All values render as React text.
- Links use `localizePath`. Ids must be positive integers.
- Rent widgets (RentCollection, TenantRent) render real rows instead of v1's near-empty Generic. Statuses of leases, maintenance and rent show the raw backend value in English (only visit statuses are translated).
- Styling is in `src/features/chat/chat.css` (imported by `ChatPanel.tsx`, so it loads with the panel). `global.css` is untouched.
- Strings: `src/features/chat/copy.ts` (`en` and `hi`, same shape enforced by types).

## B3: WebMCP (`src/features/webmcp/`)

- `WebMcp.astro` (one import and one tag in `Base.astro`) checks `'modelContext' in navigator`. Only then does it import `register.ts`, which registers after idle. Other browsers download nothing.
- `register.ts` holds the three schemas. The tool code (`tools.ts`) loads on the first call. `registerWebMcp` never throws, skips a tool that fails to register, and returns a function that aborts the signal.
- `search_properties`: uses `parseFilters`, `toApiQuery` and `toSearchParams`, then `GET /api/v1/properties` through the API client. Returns at most 10 compact results (id, title, price, place, link) and the `/properties?...` URL.
- `calculate_emi`: `summary()` from `features/tools/emi/math`. Rounds to whole rupees. Input is bounded (rate 0 to 100, tenure up to 50 years).
- `schedule_visit`: DOES NOT BOOK. v1 did not book either. v2 validates the input, returns `sign_in_required` (with a sign-in URL) when signed out, checks that the property exists and is available, and returns `user_confirmation_required` with the property page URL. The user picks a time and presses "Request this visit" on that page. No call to `POST /visits` exists in the WebMCP code (a unit test and an e2e test check that).
- `/ai-agent` and `/for-ai` do not mention WebMCP, so no copy changed.

## Backend gaps and notes for the orchestrator

- `GET /agent/conversations/{id}/messages` returns the newest 100 rows and has no cursor. Long conversations show their last 100 rows.
- Tool-call chips are not stored, so opened conversations show no tool chips.
- History rows carry no widget-less "error" marker; a failed stream leaves no assistant row.
- `ContactPanel` cannot read a prefilled date from the URL. If a later task adds `?visit_date=YYYY-MM-DD` there, `schedule_visit` could return a prefilled link.

---

# Follow-ups B4 to B7

Checks after these: vitest (chat, webmcp, property) 17 files, 110 tests pass; eslint clean; `tsc` 0 errors; `astro check` 0 errors. The new e2e tests are written, not run. Nothing checked in a browser.

## B4: prefilled visit day

- `src/features/property/visitDay.ts` (new): `visitDayFromParam(raw, now)` returns the day only when it is a real calendar date (`YYYY-MM-DD` exactly) inside the form's window (today and the next 6 days, `VISIT_WINDOW_DAYS`) and today still has an open slot (uses `slotOpen` and `SLOTS`). Everything else returns null with no message (bad format, `2026-02-30`, past, too far, script text, arrays, non-strings).
- `ContactPanel.tsx`, the one allowed edit: imports, `nextDays(VISIT_WINDOW_DAYS, ...)` instead of the literal 7, and one `useEffect` (guarded by a ref, so it runs once) that reads `visit_date` from `window.location.search` after hydration and calls `visit.setValue('date', ...)`. If the current time value is not open that day, it picks the first open slot (same rule as the day buttons). It never submits. I re-read the file before and after; the other differences from the baseline (`haptic('success')`) are not mine.
- `schedule_visit`: `confirm_url` is now `/property/{id}?visit_date=YYYY-MM-DD` when the day is one the form offers. For a valid day beyond 7 days it returns the plain page URL and says in `message` that the day is outside the form's window. Invalid input still returns `invalid_input` (the date is regex-checked, so nothing unsafe reaches the URL, and it is also `encodeURIComponent`-ed).
- Tests: `visitDay.test.ts` (window edges, late-evening today, month end, impossible dates, injection strings, non-strings); `tools.test.ts` (prefilled URL, far date without param, injection-looking `scheduled_date` values rejected). E2E: valid day is pressed and nothing is POSTed; six bad values leave no day pressed and no alert.

## B5: translated status values

- `copy.ts`: `values` map (en and hi) for the real backend enums (`app/models/enums.py`): lease status, rent charge status, maintenance status, urgency, category, payment method, plus `urgent`. `valueLabel(copy, raw)` normalizes case and separators; unknown values go through `humanize` (underscores to spaces, first letter capital), so nothing is blank; missing input returns '' and the renderer hides it. `Object.hasOwn` guards `__proto__` and `constructor`.
- `WidgetViews.tsx` uses it for lease, maintenance (status, priority, category), rent (status, payment method), visit status fallback and furnishing. The CSS `text-transform: capitalize` was removed.
- Tests: `copy.test.ts` (both maps have the same keys, every value non-empty, fallback, prototype names, Hindi labels).

## B6: conversation continuity and privacy

Continuity. Nothing was wrong, now it is proven and the code is extracted:
- `store.ts`: `openConversation(id, messages)` (used by HistoryPanel), `reset()` clears id and messages, and `chatRequest(token, message, conversationId)` builds the path and body. Signed in: `{ message, conversation_id }` to `/agent/chat` (`null` after a new conversation). Guest: `{ message }` only to `/agent/chat-public`, even if an id is stored. `ChatPanel.send` now uses `chatRequest`.
- Tests in `store.test.ts`: open(42) then send has `conversation_id: 42`; open(1) then open(2) uses 2; reset then send has `null`; guest body has no key; the opened id is saved to storage.

Privacy. What I found: before this change nothing cleared `360ghar:chat-v2`. `signOut()` in `features/auth/store.ts` and the Supabase sign-out event only set the auth store to `anon`; nothing touched chat storage. So after sign-out, or after account B signed in on the same browser, the chat panel showed account A's messages and would send A's `conversation_id` with B's token. This was a real leak.

Fix (`store.ts`, `ChatPanel.tsx`):
- The stored state now has an `owner` (the signed-in user id, or null for a guest).
- `syncOwner(uid)` runs on every auth change (`followAuth` subscribes to `useAuthStore`, which signals sign-out and user change through `status` and `session`). Owner changes from a user to null or to another user: messages, conversation id and the disk copy are cleared. A guest who signs in keeps the guest messages on screen but the conversation id is dropped (the next message starts a conversation of the account); those messages are cleared at sign-out. Old saved data without `owner` is treated as a guest's.
- While the session is `unknown`, `ChatPanel` shows no stored messages, so a signed-out visitor never sees them for a moment.
- Tests in `store.test.ts` (13 in total): sign-out clears memory and disk, load with no session clears, other account clears, same user keeps, guest sign-in, unknown session changes nothing, legacy data.

Residual risk, needs a decision from the orchestrator: the subscription lives in the lazily loaded chat module. If a user signs out on a page where the panel was never opened, the old messages stay in localStorage until the panel loads next (then they are cleared before first render, and never shown). They are not readable through the UI, but they sit on disk. To remove them at sign-out too, add `localStorage.removeItem('360ghar:chat-v2')` inside `signOut()` in `src/features/auth/store.ts` (not my file). Server-side the backend checks conversation ownership on the messages and delete routes; I did not verify it for `POST /agent/chat` with a foreign `conversation_id`.

## B7: HistoryPanel a11y self-review

Fixed:
- Buttons that were `disabled` while a request ran (open, delete trigger, Delete) dropped keyboard focus to the page body. They now use `aria-disabled` with a click guard (the `.btn` style for `aria-disabled` already exists), so focus stays.
- `aria-busy` on the whole section could stop the status message from being announced. Removed; the single `role="status"` line carries "Opening conversation", "Loading conversations" and "Conversation deleted.".
- The Keep button now has `aria-describedby` pointing at the confirm question, so it reads "Keep, Delete this conversation? You cannot undo this." when focused.

Reviewed and unchanged:
- Focus order follows the DOM and the visual order: header buttons, list, per row open then delete, then "Show older". The heading takes focus on entry (not a tab stop); Keep takes it when a confirm opens; Cancel, Keep and Escape return it to that row's delete button (found by `data-delete`, because the button is rebuilt); after a delete it goes to the heading; after opening a conversation it goes to the message input.
- Hindi: every label comes from `copy.ts` (back, list title, delete, confirm, keep, status lines); conversation titles are the server text. Pre-existing and not mine: `aria-label="Tools"` on the tool list in `ChatPanel` is English.
- One live region in the history view (`role="status"`); the message list's `aria-live` is not mounted there. Errors use `role="alert"`.
- Escape: with a confirm open it cancels only the confirm (native listener on the section stops propagation before the host handler). Without a confirm it closes the whole panel and returns focus to the launcher, as everywhere else in the panel.
- Reduced motion: the history CSS has no animation or transition; the skeleton uses the global `.skeleton` rule, and the global reduced-motion rule sets transitions to 1 ms.
- Targets: rows 56 px, open button 44 px high, icon buttons 44 px.

Could not verify without a browser: real screen-reader output (VoiceOver, TalkBack, NVDA), that the focus ring is visible on the heading, tab order at 360 px, that Escape behaves the same when focus is on a row button, the axe result, and the 44 px targets as rendered. The e2e tests `history a11y` and the earlier history tests check focus, description and reduced motion; they have not been run.
