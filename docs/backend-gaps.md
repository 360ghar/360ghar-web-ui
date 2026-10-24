# Backend gaps

This file lists the places where the website needs something that the backend does not supply, or where the old site and the backend do not agree. The backend code is the source of truth. The new site uses only fields and parameters that exist in the backend code. It does not invent fields.

Paths: `BE` = `360ghar-backend/app`. `WEB` = `360ghar-web-ui/src` (old site). Line numbers are from the backend commit `f1d9f90` plus the uncommitted working tree on 2026-09-27. Details are in `docs/research/`.

Status values:

- **Missing**: no backend endpoint exists. The new site uses the workaround in the "Website action" column.
- **Mismatch**: the endpoint exists, but the old site used wrong names. The new site uses the backend names. No backend change is needed.
- **Request**: the endpoint exists but lacks something that the website needs. A backend change would improve the site.

Contract pass 2026-10-15: the backend contract changed (`openapi/openapi.json` is now the file `360ghar-backend/docs/openapi.json`). The section "Closed by the contract pass" at the end lists the gaps below that the backend closed, with the client change for each. The tables above it are the history; read that section first.

## Missing endpoints

| # | Need | Evidence | Website action |
|---|---|---|---|
| M1 | Submit a customer review (`POST /reviews`) | `WEB/components/reviews/CustomerReviews.jsx:82`. No reviews route in `BE/api/api_v1`. Live `POST /api/reviews` returns 404. Only `POST /bookings/review` exists (`BE/api/api_v1/endpoints/bookings.py:332`), which is for stay bookings | Open question 1 in `inventory.md` |
| M2 | Submit a referral (`POST /referrals`) | `WEB/components/referral/ReferralForm.jsx:152-161` (TODO; fake success). No referral route | Open question 1 in `inventory.md` |
| M3 | Contact and lead capture | Contact uses Formspree `mwpqglyb`. No contact or lead route | Keep Formspree |
| M4 | Newsletter subscribe | Formspree `mkgzdjyj`. No newsletter route | Keep Formspree |
| M5 | Callback request on a property | Done: `POST /leads` (M12) replaces the old workaround of a visit with the phone in `special_requirements` (`BE/api/api_v1/endpoints/visits.py:41`) | The property page sends the callback to `POST /leads`. No fake visit |
| M6 | Account deletion request from a signed-out user | `WEB/services/deletionService.js` always fails. Only `DELETE /users/me` (the canonical route; `POST /auth/delete-account` is an alias that goes away) needs auth | `mailto:privacy@360ghar.com`, as in the old site |
| M7 | Job applications | Static `WEB/data/careers.js`, mailto only | Keep mailto |
| M8 | Localities (list, detail, search) | No locality model. The old site downloads `localities.json` (4.9 MB) | The new site reads the JSON on the server only. No download in the browser |
| M9 | Listing counts for landing pages (count only, no items) | No count endpoint. `GET /properties?include_total=true&limit=1` works but returns one item | Use `include_total=true&limit=12` and use the total from the page-1 call |
| M10 | Price index and price trends | `WEB/data/priceContext.json` is hand-written | Static data. No trend chart |
| M11 | Property view event that works with CDN caching | `GET /properties/{id}` adds a view for each non-bot request (`BE/api/api_v1/endpoints/properties.py:437`). With CDN caching, the server fetch runs only on a cache miss | Views are under-counted. A `POST /properties/{id}/view` endpoint would fix this |
| M12 | Callback request without sign-in | Added 2026-09-29 (not yet deployed or migrated): `POST /leads` with `property_id`, `phone`, `name`, `note`, honeypot `website` (`BE/api/api_v1/endpoints/leads.py`, `BE/models/leads.py`, `supabase/migrations/20260929000001_leads.sql`). Limits: 10 a minute per IP, 3 an hour per number. Nothing notifies the team yet: leads sit in the `leads` table | The property page shows a callback form to every visitor. Until the migration is applied, the form fails with the standard error. Open: a team notification and an admin list of leads

## Mismatches (the new site uses the backend names)

| # | Area | Old site used | Backend has | Evidence |
|---|---|---|---|---|
| X1 | Blog list filters | `category`, `tag` | `categories[]`, `tags[]`, `keywords[]` | `BE/api/api_v1/endpoints/blog.py:102-107` |
| X2 | Blog post author | `author_name`, `author_slug`, `thumbnail_url` | No author fields. `cover_image_url` | `BE/schemas/blog.py:154` |
| X3 | Property fields | `is_liked`, `is_verified`, `rera_number`, `bhk`, `sector`, `tour_url`, `video_url`, `lat`, `lng`, `price_type`, `furnishing` | `liked`, `latitude`, `longitude`, `video_tour_url`, `video_urls[]`, `furnishing_level`. No verified, RERA, BHK or sector field | `BE/schemas/property.py:370-498` |
| X4 | Amenity object | `key`, `name`, `label` | `id`, `title`, `icon`, `category` | `BE/schemas/amenity.py:66` |
| X5 | Furnishing filter | Sent as `features[]` | `furnishing[]` (`furnished`, `semi_furnished`, `unfurnished`) | `BE/api/api_v1/endpoints/properties.py:126` |
| X6 | Sort values | `price_asc`, `price_desc` (422) | `price_low`, `price_high`, `newest`, `distance`, `popular`, `relevance` | `BE/schemas/property.py:538` |
| X7 | Zoning fields | `far`, `ground_coverage_pct`, `max_height`, `setback_*`, `parking_norm`, `density` | On the wire: `far_limit`, `max_coverage_pct`, `max_height_m` (aliases are serialized) | `BE/schemas/data_hub.py:190-207` |
| X8 | Zoning search | `search` | `sector` | `BE/api/api_v1/endpoints/data_hub/registry.py:120-122` |
| X9 | Colony approvals | `status` | `approval_status` on the wire | `BE/schemas/data_hub.py:219`; live response checked |
| X10 | Builders list | `search`, `sort_by`; reads `name`, `score`, `id` | `q`, `order_by=score`; `builder_name`, `builder_score`, `slug` | `BE/api/api_v1/endpoints/data_hub/rera.py:94-156` |
| X11 | RERA projects | `property_type` filter; status `expired`; reads `property_type` | No type filter; statuses `registered`, `lapsed`, `revoked`, `completed`; field `project_type` | `BE/api/api_v1/endpoints/data_hub/rera.py:30-45` |
| X12 | Auction detail | `city`, `address`, `area_sqft`, `contact_name/phone/email` | `full_address`, `contact_info`. No city, area or contact fields in the response | `BE/schemas/data_hub.py:85-109` |
| X13 | Jamabandi lookup | `owners`, `area`, `last_updated` | `owner_names[]`, `area_acres`, `fetched_at` | `BE/api/api_v1/endpoints/data_hub/registry.py:59` |
| X14 | Profile update | Empty strings for `date_of_birth` and `profile_image_url` | Empty date: 422. Empty image URL: 400. Omit the fields instead | `BE/schemas/user.py:73`, `BE/services/user.py:1014-1024` |
| X15 | Error body | `detail` | `{error: {code, message}}`. Only 422 uses `{detail: [...]}` | `BE/infrastructure/errors.py:88-135` |
| X16 | Vastu upload errors | 413, 415 | 400 for size and type | `BE/api/api_v1/endpoints/vastu.py:67-79` |
| X17 | Map page | Sent `price_asc` | See X6 | |
| X18 | Chat stream | Ignored the `fallback` event | `fallback {provider, reason}` | `BE/services/ai_agent/agent_service.py:444` |

## Requests (backend changes that would improve the site)

| # | Request | Why | Evidence |
|---|---|---|---|
| R1 | Match amenity filters by slug, or return a `slug` field on amenities | Landing URLs use slugs such as `swimming-pool`. The backend matches the exact lowercase title only, and drops the filter when nothing matches | `BE/services/property/search.py:478-491` |
| R2 | Add a `developer` (or `developer_slug`) filter to `GET /data-hub/rera-projects` | The builder page needs the projects of one builder. The builder detail response has them, so this is optional | `BE/api/api_v1/endpoints/data_hub/rera.py:30-33` |
| R3 | Expose `city`, `area_sqft`, `possession_type` in `BankAuctionResponse` | The model has these columns, but the response schema does not. Auction detail pages are held and do not render records during source review | `BE/schemas/data_hub.py` (`BankAuctionResponse`) |
| R4 | Expose `setback_*_m`, `notes`, `master_plan_year` in `ZoningDataResponse` | The model has these columns | `BE/schemas/data_hub.py:190-207` |
| R6 | Fix `area_acres` in Jamabandi results | The value comes from `area_kanal`, which is a different unit | `BE/api/api_v1/endpoints/data_hub/registry.py:83` |
| R7 | Stamp duty: apply "higher of circle rate or deal value", use `property_type` | The looked-up circle rate is not used | `BE/api/api_v1/endpoints/data_hub/calculations.py:56-92`, `BE/services/data_hub/utils.py:159-175` |
| R8 | Auth gate order | `password_setup` is checked before `profile_completion`. Google users without a password never reach profile completion | `BE/services/user.py:800-818` |
| R9 | Rate limit on `POST /auth/identifier-status` | 5 per hour per identifier. Login and forgot-password share it, so a user who retries is locked out | `BE/api/api_v1/endpoints/auth.py:42-43` |
| R10 | Add address fields to the user profile, or confirm that none are needed | The old "Address" tab was always empty. The new site removes the tab | `BE/schemas/user.py:12-156` |
| R11 | Author fields on blog posts | E-E-A-T signals need a real author | `BE/schemas/blog.py:154` |
| R12 | `is_verified` and `rera_number` on properties | The old site showed "verified" and "RERA" badges from fields that do not exist | `BE/schemas/property.py:370-498` |
| R13 | Remove the stale paths from `docs/openapi.json` | The committed spec lists `/lab/*` and `/tours/{id}/generate-3d`, which the code no longer has | `BE/../scripts/generate_openapi.py --check` fails |
| R14 | Post counts on `GET /blog/categories` | `/blog` shows only categories that have posts. It counts them from the newest 50 posts | `src/features/blog/load.ts` (`loadBlogIndex`) |
| R15 | Facet counts for landing pages in one call (city, purpose, type, BHK, budget) | One count call takes about 1.3 s. The landing sitemap counts from the full list of homes instead, with the rules of `BE/repositories/property_query_builder.py:103-125` | `src/features/feeds/data.ts` (`landingCount`) |
| R16 | Circle-rate `sector` filter: exact match | `?sector=Sector 1` returns 30 rows from 10 sectors (substring match). The pages keep exact matches only. The stamp-duty rate lookup has the same problem | `BE/api/api_v1/endpoints/circle_rates.py:47` |
| R17 | `ORDER BY` on offset lists (circle rates, RERA, auctions, zoning, colonies) | With no order, rows can repeat or be skipped between pages. The pages remove repeats | `docs/research/07-data-hub-report.md` |
| R18 | Fill `developer_slug` on RERA projects | `/data-hub/builders` returns 0 rows because every `developer_slug` is null, so every builder page is a 404 | `docs/research/07-data-hub-report.md` |
| R20 | Auction source counts include court (DRT) rows | DRT shows 0 although 10 court auctions exist | `docs/research/07-data-hub-report.md` |
| R21 | Deploy the fix that stops `GET /pages/{name}/public` from changing `updated_at` and `view_count` on every read | Policy pages cannot show a "last updated" date. Each build also adds about 10 views | `BE/services/core.py:188-200` (fixed in code, not deployed) |
| R22 | Hindi FAQs on `GET /faqs/public` | `/hi/faq` shows English answers | `docs/research/08-content-report.md` |
| R23 | Add `daily_rate`, `owner_name`, `owner_contact`, `balconies`, `parking_spaces` and `age_of_property` to `PropertyUpdate` | `PUT /properties/{id}` ignores them (Pydantic drops unknown keys), so an owner cannot change the nightly price or the contact. The edit form shows these fields read-only | `BE/schemas/property.py` (`PropertyUpdate`) |
| R24 | `locality` filter on `GET /properties`: exact match (or a separate exact parameter) | `locality=Sector 8` returns 51 homes from Sectors 81 to 86 (substring match). Locality buy and rent pages show homes from other sectors | `BE/repositories/property_query_builder.py:154-158` |
| R25 | Per-file results from `POST /upload/batch` | One bad file fails the whole batch (`upload_batch` loops over files). The wizard now checks type and size in the browser first | `BE/services/storage/service.py` |
| R26 | A review state on listings (`pending_review`) | A new listing cannot show "Under review"; `status` only has available, sold and similar | `BE/schemas/property.py` |
| R27 | Agent on the property, and no owner phone in public responses | Added 2026-09-29 (not yet deployed): `Property.agent` (`id`, `name`, `contact_number`, `avatar_url`) from `owner -> users.agent_id -> agents`; `owner_contact` is null unless the caller is the owner or an admin (`BE/services/property/privacy.py`). Applies to `GET /properties`, `/properties/{id}`, `/semantic-search`, `/recommendations`. Also fixed: `GET /properties/{id}` lost `amenities` whenever the response came from the cache (`validation_alias="property_amenities"` did not read the cached `amenities` key), so most listings showed no amenities. Not changed: other routes that return a property (share pages, MCP tools) | `BE/schemas/property.py`, `BE/services/property/crud.py` |

## Data and configuration to fix (not code)

| # | Item | Effect on the site |
|---|---|---|
| D1 | Blog seed posts: covers are 64 × 64 px placeholders, the text is about 750 characters, the first heading repeats the title, and `published_at` is null | The site draws a paper cover for any cover URL under `/seed/blogs/` (all 20 posts), drops the repeated heading and uses `created_at` as the date. `/blog/categories` lists 12 categories; the posts use 5 |
| D2 | The Google Maps key in the old `.env` is expired (`ExpiredKeyMapError`) | The map view and place search do not work on the old or the new site. The map view shows "The map did not load. The list still works." Put a valid key in `PUBLIC_GOOGLE_MAPS_API_KEY` |
| D3 | Every bank auction date is in the past (latest 2026-06-05). 15 of 30 RERA projects have more units booked than total units. City and bank names repeat under two spellings ("Gurgaon"/"Gurugram", "PNB"/"Punjab National Bank") | Lists show stale or doubtful rows |
| D4 | The grievance policy still contains "[Name of Grievance Officer]" and "(To be updated…)" | The policy page shows the placeholder text |
| D5 | The 16 celebrity-home cards link to blog slugs that do not exist (rechecked 2026-09-29: `GET /blog/posts/{slug}` is 404 for all 16; the blog has 20 other posts) | The cards do not link to posts. The "top celebrity localities" block names which star lives where and has no backing data |
| D6 | No listing has `features` (all empty). The zoning table has 8 rows (Sectors 1, 4, 5, 7, 9, 9A, 10, 10A, all residential; rechecked 2026-09-29) and `permitted_uses`, `prohibited_uses` and `source_url` are null in every row | The features filter is not shown; zone pages show only the fields the API returns. Needs more sectors and those three fields |
| D7 | All 27 rent listings are flatmates; no apartment is listed for rent | Every "flats for rent" page is empty (it points to related pages that have homes) |
| D8 | Listings 153–169 have a placeholder `base_price` of ₹10 Cr; 27 sale listings disagree between `price_per_sqft` and price ÷ area | Price ranges look wrong; the site shows the middle range and computes price per sq ft from the price shown |
| D9 | Short stays priced ₹203 and ₹667 a night (ids 181, 179, 170); 1 of 109 listings has a `virtual_tour_url` (id 75, Godrej Prana, Kuula) and none has a video (measured 2026-09-29) | Odd prices on cards; the 360° tour mark shows on one listing. Home copy says tours exist "for the homes that have one" |
| D10 | `amenities` on a listing sometimes comes back empty (6, then 0, for the same ids within an hour); `features` holds key names such as `society_name`, not values | Amenities flicker on cards and compare; society and facing cannot be shown |
| D11 | Listing photos are 512 × 292 px and floor plans 512 × 341 px (Cloudinary `fl_getinfo`) | Photos look soft on large screens and in the full-screen viewer. Upload larger originals (at least 1600 px wide) |
| D12 | `features` values are lost: `coerce_features` turns the dict into its keys (`BE/schemas/property.py:421`), so `facing`, `society_name`, `rera_registered`, `vastu_compliant` and `occupancy_type` never reach the site | The page reads facing from tags; the other values cannot be shown. This is a backend code bug, not only data |
| D13 | The neighbourhood score returns 404 for #182, #181 and #80; landmarks exist for only 4 of the 14 localities that have listings | The local data panel shows circle rates only on most listings |
| D14 | `localities.json`: the overview text is one template for all 3,215 places; Delhi and Noida entries say "in Gurgaon"; no place has coordinates. Some circle rates look implausible (Sector 85 residential ₹22,146 per sq ft; Palam Vihar commercial below residential) | Place pages build summaries from real facts instead; rates are shown as given, with the year |
| D15 | Cover photos: 69 of 100 homes use the photo captioned "Building Exterior" as the main image. Many of these are the flat's front door or the lobby, not the building, so result cards look alike (for example home 182, 209). Some "Living Room" files show the tower | The site keeps the owner's main image (`is_main_image`). The listing team should pick the living room or a real exterior as the cover |
| D16 | Photo `caption` and `image_category` often do not match the photo: on #182 "Dining Room" is the balcony and "Building Exterior" is the front door; on #181 "Balcony" is the kitchen and "Bathroom" is a kids' room | The site shows no photo captions on the home page and drops them in the property gallery; the viewer's room groups still use `image_category`, so a few photos sit in the wrong group |

## Unused backend features that the new site will use

- `GET /amenities` (the old site hard-coded 15 amenity names).
- `POST /upload/batch` for photos on post property.
- `PUT /properties/{id}` and `DELETE /properties/{id}` in the account.
- `GET /visits/past`, `POST /visits/{id}/cancel`, `POST /visits/{id}/reschedule` in the account.
- `PUT /users/me/phone` after `/add-phone`.
- `GET /faqs/public` on `/faq`.
- `GET /data-hub/auctions/source-categories` on `/auction-sources`.
- `GET /properties?ids=` for `/compare`.

## Added 2026-09-29 (parity work)

| # | Need | Detail |
|---|---|---|
| P1 | `POST /agent/chat` must reject a `conversation_id` that belongs to another user | Not verified. The web now clears stored chat on sign-out, but the backend is the real guard |
| P2 | `GET /agent/conversations/{id}/messages` has no cursor (newest 100 rows only) and does not store tool chips | Opened conversations show no tool chips; long ones are cut |
| P3 | Reviews: M1 still open. Review capture posts to Formspree (`source=review`) and the page says reviews reach the team by email | A `POST /reviews` plus a `GET` of approved reviews would let a real review list replace the Google Reviews link |
| P4 | Localities: about 1,172 of 3,215 entries are scraped (`projects in ...`, 462) or invented by an old seed script (`HUDA Sector N`, 710) and are in `sitemap-localities` | Decided 2026-09-29 ("fix them all") and done: noindex, out of the sitemap, not listed or linked, and 289 of the 462 scraped rows 301 to their real twin (`src/data/locality-redirects.json`). The other 173 scraped rows and the 710 seed rows stay 200 with noindex. See `docs/parity/data.md` and `docs/parity/seo-ops.md` |
| P5 | Live entity sources are unusable for new coverage (commonfloor 403, Squareyards lists no Gurgaon page) | A real source (HRERA list or a backend model) is needed to add localities |
| P6 | Home copy: the H1 "Walk in before you visit." and the SEO copy still promise walkthroughs | See D9: 1 of 109 listings has a tour. Owner decision |

## Closed by the RERA intelligence build (2026-10-24)

The backend added the RERA project/developer/market surface. Two rows above are now closed, and one new rule affects a route the site already had.

| Gap | Backend now | Client |
|---|---|---|
| R18 | `rera_projects.developer_slug` is set when a filing is written, and `developer_dossier` backfills any row whose slug is still null from its own `developer_name` on every weekly run. Only null slugs are touched, so a project another writer already grouped is never moved. `GET /data-hub/builders` returned 0 rows and every builder page 404'd before this | No change needed. `builder-reputation/[slug]` and `builders` render as written |
| X11 | Superseded by the new surface. `GET /data-hub/projects` takes `city`, `sector`, `stage`, `developer_slug`, `q` and sorts by `order_by`; `GET /data-hub/rera-projects` is unchanged and still has no type filter | The project list and the project detail pages read `/data-hub/projects`, so the missing type filter no longer blocks them |
| R2 | Still open and still optional. `GET /data-hub/rera-projects` has no `developer` filter, but `GET /data-hub/builders` returns each builder's `rera_projects` inline | The builder page reads the projects from the builder response |

**New rule: the `{city}` segment of `/micro-markets/{city}/{slug}` is lowercase.** The site's middleware 301s any path containing an uppercase letter to its lowercase form, so the URL a browser asks for is `/micro-markets/gurugram/sector-76-77` even though the filed district is `Gurugram`. The backend matches the city case-insensitively for this reason, and `MicroMarketPage.astro` lowercases the segment when it builds the canonical URL and `og:url`. Emitting the filed spelling would have pointed the canonical at a redirect.

**A micro-market's stats are now scoped to its own projects.** `project_count`, `avg_price_per_sqft` and `stage_breakdown` are counted by `rera_projects.micro_market_id`, the link the backend writes from each project's filed address. Before that link existed the backend could only scope by district, so two micro-markets in one district returned identical numbers under different names. The page's own FAQ no longer claims an average rate at all: `avg_price_per_sqft` is null on every response, because no register publishes a rate per square foot, and `MicroMarketPanel` drops a null figure rather than rendering a dash. The stage mix and the project count are the two figures the page shows, and they now mean what the page says they mean.

**`POST /data-hub/watchlist` now refuses a project with no public page (404, same as an unknown project).** The slug is the public URL key, so a slug-less project has no page for a watch row to link to. This closes a hole rather than changing a live flow: `WatchlistButton` only renders on a project page, which cannot exist without a slug. `WatchlistList.tsx` already degrades gracefully on a legacy row (`project: null` renders as `#<id>` with no details and a working Remove), and those rows stay readable — only new ones are refused.

## Closed by the contract pass (2026-10-15)

The backend closed these gaps, and the client follows the new contract. Source: `contract-audit/contract-changelog.md`. A row names the backend change and the client change.

| Gap | Backend now | Client |
|---|---|---|
| M5, M12 | `POST /leads` exists: 201 `{id}`, unknown keys 422, 429 `RATE_LIMIT_EXCEEDED`. `GET /leads` is admin only. How long phone numbers are kept is an open product decision | `ContactPanel` sends `property_id`, `phone`, `note`, `website` only. A 422 shows under its field; any other failure shows its message |
| X1 | `keywords` and `category_id` are 422. Lists take `categories` and `tags` | `features/blog/load.ts` sends `categories` and `tags` |
| X12, R3 | Bank auctions have `contact_person`, `contact_phone`, `contact_email` and `kind`. Court rows have `locality`, `case_number`, `borrower_name` | The typed client keeps `Auction = BankAuction \| CourtAuction`, split by `kind`. Both detail routes now show a noindex hold notice and render no auction fields |
| X13, R6 | `area_kanal`, `area_marla`, request key `captcha_text` | `VerifyOwnership` sends `captcha_text` and shows kanal and marla |
| X15 | Every non-2xx body is `{error: {code, message, details}}`. A 422 has `details.fields[{field, msg, type}]` | `lib/api/errors.ts` reads only that shape. Other `details` are never form errors |
| X18 | No `fallback` frame. Frames are typed (`AgentStreamEvent`) | `chat/stream.ts` checks each frame with Zod and skips a frame that does not match |
| R5 | `GET /data-hub/auctions/{id}` needs `kind` (`bank` or `court`) | The detail routes pass the kind to distinguish bank and court ids. Both pages are noindex hold notices and are excluded from the sitemap while source and status checks are reviewed |
| R17 | Keyset cursors with the id as tie-break on every list. `limit` is at most 100 | Lists follow `next_cursor` (`lib/api/pages.ts`). `total` is null unless `include_total` |
| R19 | An unknown gazette `type` is a 422 | The public page is held and no longer requests gazette data |
| R20 | Source counts are live; `source-categories` is one flat `CursorPage` | The public source directory is held and no longer requests or displays portal counts |
| R23 | `PropertyUpdate` takes `daily_rate`, `owner_name`, `owner_contact`, `balconies`, `parking_spaces`, `age_of_property`. An explicit `null` clears a field | The edit form sends them. A cleared field is `null`, no amenities is `[]` |
| R25 | `POST /upload/batch` returns one item per file (`status`, `result`, `error`) and takes `folder_type` | The wizard reads each item and tells the owner how many photos failed. It sends `folder_type=generic` (a `property_image` upload needs the presigned route) |
| R26 | A PG or flatmate listing starts as `pending_review` in `listing_preferences.moderation_status`. A content edit sends a live one back to review | The success sheet of the wizard and the "My listings" row say "in review" |
| R27 | `agent` is on `GET /properties/{id}` only. `owner_contact` is the agent or company number for everyone but the owner and admins | `features/property/contact.ts` reads `agent` of the detail response and never `owner_contact` |
| D8 | `price_per_sqft` is computed by the backend from the price of the purpose | `perSqft` shows the backend number; no client division |
| D12 | `features` is an array of strings. `facing`, `society_name` and the other object values are not on the wire | The page reads facing from tags, as before |
| P1 | An unknown or foreign `conversation_id` is a 404 | The panel says the conversation is gone and the next message starts a new one |
| P2 | `GET /agent/conversations/{id}/messages` is removed. `/messages/page` is a `CursorPage` | History opens on the newest page and has "Show earlier messages" |
| F1 | `Property.floor_plans` holds the floor plan rows. `images` has none | `features/property/photos.ts` `floorPlanUrl` reads `floor_plan_url`, else the first `floor_plans` row |
| F2 | `move_in` is one of nine `MoveInTimeline` values. Other values are a 422 | The filter takes all nine (`MOVE_IN_TIMELINES`, checked against the generated enum). An old name is dropped from a URL, never read as another value |
| F3 | A 403 `USER_INACTIVE` on any call | The account profile tab and the lists show the "account is not active" message and a retry. The session is not ended by the client (lead to confirm) |
| F4 | The agent-discovery file `public/openapi.json` is hand written | It follows the contract: purposes `buy`, `rent`, `short_stay`, integer ids, a date-time with an offset for a visit, cursor keys |

## Ported from the old site (2026-10-21)

The account page has three tabs that the old site had and the first rebuild dropped. Each endpoint was checked against `openapi/openapi.json` (the file `360ghar-backend/docs/openapi.json`).

| Old feature | Endpoint in the contract | Client |
|---|---|---|
| Notification settings | `GET` and `PUT /users/notification-settings` (four booleans: `push_notifications`, `email_notifications`, `sms_notifications`, `promotional_emails`; unknown keys are 422) | Account tab "Notifications" (`features/account/Settings.tsx`) |
| Search preferences | `PUT /users/preferences` (a key sent as `null` is removed). There is no `GET`: the values come from `preferences` on `GET /users/profile` | Account tab "Preferences". The form sends all ten keys; a cleared field is `null`. After a save the profile is read again |
| Current location | `PUT /users/location` (`latitude`, `longitude`) | Button "Use my current location" on the Preferences tab. The browser asks for permission first |
| Saved auction alerts | `GET /data-hub/auctions/alerts/me` (a `CursorPage`) and `DELETE /data-hub/auctions/alerts/{alert_id}` | Account tab "Auction alerts": list, delete with an inline confirm, empty state |

**Removed by the contract: `PUT /data-hub/auctions/alerts/{alert_id}`.** The old site could edit a saved alert. The contract has no update route, so the new site does not offer "Edit". To change an alert, a person deletes it and sets a new one from a bank-auction page. Request R-ALERT-EDIT: add the route back if editing in place is wanted.
