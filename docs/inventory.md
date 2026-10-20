# Route inventory: 360ghar-web-ui to 360ghar-web-ui-2

Status: draft for review (work plan step 1). Date: 2026-09-27.

This file lists each route of the old site, the backend endpoints that it uses, the rendering type, the render mode, and the build priority. The evidence (file paths and line numbers in the old site and the backend) is in `docs/research/01` to `05`. The backend gaps are in `docs/backend-gaps.md`.

## Sources checked

- Old site routes: `360ghar-web-ui/src/App.jsx` (commit `f3012ba`, 2026-08-12).
- Backend: `360ghar-backend/app/api/api_v1/endpoints/` (commit `f1d9f90` plus the uncommitted working tree).
- OpenAPI: a new spec is made from the backend code with `scripts/generate_openapi.py`. It has 294 paths. The committed `docs/openapi.json` has 299 paths. The 5 extra paths (`/lab/*`, `/tours/{id}/generate-3d`) are not in the code. The new site uses the spec from the code.
- Live API probe (read-only GET requests, 2026-09-27): 109 properties, 20 blog posts, 183 circle rates, 237 auctions, 30 RERA projects, 10 gazette items, 5 colony approvals, 47 amenities, 8 zoning rows (rechecked 2026-09-29; earlier probe said 0).

## Legend

**Type**

| Value | Meaning |
|---|---|
| Astro | Astro component only. Zero client JS. |
| Hybrid | Astro renders the content. React islands add interaction. |
| React | The page body is one React island. Astro renders only the shell. |

**Render mode**

| Value | Meaning |
|---|---|
| SSG | Prerendered at build time (`export const prerender = true`). |
| SSR+CDN | Rendered on demand by the Netlify function. The response sets `Netlify-CDN-Cache-Control` with `stale-while-revalidate`. The TTL is in the Notes column. |
| SSG shell | Prerendered shell with `noindex`. The body is a `client:only` React island (auth-gated or per user). |

**Priority**: the build order from the work plan. 1 is first.

| Priority | Group |
|---|---|
| 1 | Home |
| 2 | Property search and detail |
| 3 | Projects |
| 4 | Localities and landing pages |
| 5 | Account and auth |
| 6 | Post property |
| 7 | Data hub |
| 8 | Tools |
| 9 | Blog |
| 10 | Static pages |

**Endpoints**: paths are relative to `https://api.360ghar.com/api/v1`. `(auth)` means that the call sends the Supabase bearer token. `(opt-auth)` means that the call works without a token and returns more fields with a token.

**Hindi**: every route below also exists at `/hi/<route>`, with the same type and render mode. The Hindi home page is `/hi`. Each page sets `hreflang` for `en`, `hi` and `x-default`, except `noindex` pages. The new site keeps the policy of no trailing slash.

## Global parts (every page)

| Part | Endpoints / services | Type | Notes |
|---|---|---|---|
| Header, nav, mobile menu | none | Astro + 1 small island | The island shows auth state (avatar or "Sign in") and the language switch. The mobile menu is a native `<dialog>`. |
| Footer | Formspree `mkgzdjyj` (newsletter) | Astro + island (`client:visible`) | The old footer newsletter did not submit. The new one uses the working Formspree form. |
| Auth session | Supabase JS; `GET /users/profile` (auth); `GET /users/me/auth-state?app=ghar` (auth) | Store module | Zustand singleton, shared across islands. Loaded only when an island needs it. |
| Profile-completion guard | `GET /users/me/auth-state` (auth) | Island logic | Redirects to `/profile-completion` when the stage is `profile_completion`. Same exempt paths as the old site. |
| Chatbot | `POST /agent/chat-public`, `POST /agent/chat` (auth), SSE stream | React island (`client:idle`) | The launcher button loads first. The chat panel code loads on the first click. Frames are checked with Zod (there is no `fallback` frame); history opens on the newest page of `GET /agent/conversations/{id}/messages/page`; 404 and 429 have their own text. |
| Location | Browser geolocation; fallback Gurgaon 28.4595, 77.0266 | Store module | Asked for only when the user selects "Near me". The old site asked on every page load. |
| Analytics | PostHog (`VITE_PUBLIC_POSTHOG_*`), gtag `G-0S1Q7466MM`, web-vitals | Inline script, idle load | Same events: `$pageview`, `web_vitals`, `identify`, `reset`. |
| SEO head | none | Astro | Canonical, hreflang, OG, Twitter, robots and JSON-LD are in the server HTML. The old site set them only after JavaScript ran. |
| Offline banner, scroll to top | none | Tiny inline script | |
| Old service worker | none | Static file | Ship a `/sw.js` that unregisters itself. Users of the old PWA then get fresh pages. |

## 1. Home

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/` | `GET /properties/recommendations?limit=12`; `GET /blog/posts?limit=6`; Formspree `mwpqglyb` (owner form), `mkgzdjyj` (newsletter); `POST /reviews` (no backend handler, see gaps) | Hybrid | SSR+CDN, 10 min | 1 | Signature SVG Gurugram street hero (Astro SVG + a small parallax script). Search bar island `client:load` (Rent/Buy/Sell tabs, Places input, radius). The recommendation cards and blog cards are rendered on the server. Favourite hearts are an island. Sections: search, recommendations, how it works, property management, app download, reviews (static data), stats, AI agent, tools, FAQ (10 items), blog feed, explore links. |

## 2. Property search and detail

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/properties` | `GET /properties` (opt-auth) with `limit`, `cursor`, `lat`, `lng`, `radius`, `q`, `purpose`, `property_type[]`, `amenities[]`, `features[]`, `furnishing[]`, `price_min/max`, `bedrooms_min/max`, `bathrooms_min/max`, `area_min/max`, `city`, `locality`, `pincode`, `parking_spaces_min`, `floor_number_min/max`, `age_max`, `check_in`, `check_out`, `guests`, `gender_preference`, `sharing_type`, `sort_by`; `GET /amenities`; `POST /swipes` (auth) | Hybrid | SSR+CDN, 60 s, cache key includes the query string | 2 | Astro renders page 1 from the URL filters. The filter island hydrates (`client:load`), then `useInfiniteQuery` loads more pages with a "Load more" fallback. All filters are in the URL. Filters open in a bottom sheet on mobile. The old legacy query aliases (`intent`, `type`, `bhk`, `budget`, `amenity`, `min_price`, `latitude`, and others) are parsed and then replaced with the canonical names. Saved searches and recent searches stay in localStorage. Compare tray (max 4). Grid and list views. Scroll is restored on Back. |
| `/map-location` | Same as `/properties`, plus Google Maps JS (`VITE_GOOGLE_MAPS_API_KEY`) | React | SSG shell, `noindex` | 2 | Map view of the same search island: markers, radius circle, map type, "my location". The map loads on `client:visible`. The old price sorts `price_asc` and `price_desc` return 422, so the new site uses `price_low` and `price_high`. |
| `/property-sidebar` | Same as `/properties` | none | 301 | 2 | Old alternative layout, `noindex`. Many of its filters did not work. **Done 2026-09-29:** 301 to `/properties` (`src/lib/redirects.ts`), route file removed. |
| `/property/:id` | `GET /properties/{id}` (opt-auth); `GET /properties?limit=4&...` (similar); `POST /swipes` (auth); `POST /visits` (auth); `GET /data-hub/circle-rates?sector=&limit=3`; `GET /data-hub/zoning?sector=&limit=1`; `GET /data-hub/neighbourhood/{id}` | Hybrid | SSR+CDN, 5 min | 2 | Astro renders the title, price, facts, description, amenities, address and JSON-LD (Apartment or SingleFamilyResidence, RealEstateListing, Product and Offer, BreadcrumbList, VideoObject). Islands: gallery with lightbox and swipe (`client:visible`), save, share and compare (`client:idle`), schedule-visit form, callback request, owner contact reveal, map (click-to-load iframe), data-hub panels (`client:visible`). A second client call with the token gets `liked` and `user_has_scheduled_visit`. Unknown id: real 404. A non-integer id: 404. |
| `/property/:id/virtual-tour` | `GET /properties/{id}` | Hybrid | SSR+CDN, 5 min | 2 | Full-width iframe of `virtual_tour_url` (Kuula and others) behind a click-to-load poster. `noindex` when there is no tour. The detail page now links to this page. |
| `/compare?ids=1,2,3` | `GET /properties?ids=1&ids=2...` | React | SSG shell, `noindex` | 2 | **New page.** The old compare tray linked here, but the route did not exist. Side-by-side table with aligned rows. |
| `/property` | none | none | 301 to `/properties` | 2 | Old dead link ("Back to listings"). |

## 3. Projects

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/project` | none (static `projectCatalog.js`, 8 items) | Astro | SSR+CDN, 1 day | 3 | Grid of 8 projects. The canonical becomes `/project`. The old canonical was `/projects`, which was not a route. |
| `/project/:title` | none (static) | Astro | SSR+CDN, 1 day | 3 | Slug must match a catalog item; otherwise a real 404. The old lorem-ipsum "challenges" block is removed. |
| `/projects` | none | none | 301 to `/project` | 3 | Old canonical URL. |

## 4. Localities and landing pages

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/localities` | none (static `localities-index.json`, 3,215 entries) | Hybrid | SSG | 4 | Astro renders all groups (A to Z). A small island filters by name and type. The old page loaded a 611 KB JSON file in the browser; the new page ships the HTML only. |
| `/locality/:slug` | `GET /properties?locality=&city=&limit=6` | Hybrid | SSR+CDN, 1 day | 4 | Data from `localities.json` (3,215 entities), read on the server. Slug format `{slug}-{city}`. The bare slug (for example `dlf-phase-1`) gets a 301 to the full slug. The old site rendered it with status 200. Unknown slug: real 404. The old site did a client redirect to `/properties`. Listings are now filtered by locality. The old page showed unfiltered recommendations. |
| `/locality/:slug/:intent` | `GET /properties?locality=&purpose=&limit=12` | Hybrid | SSR+CDN, 1 day | 4 | `intent` is `buy` or `rent`. Other values get a 301 to `/buy`. Page 1 of listings is rendered on the server. |
| `/near/:slug` | `GET /properties?lat=&lng=&radius=5&limit=12` | Hybrid | SSR+CDN, 1 hour | 4 | 10 slugs from `office-landmarks.json`. Unknown slug: real 404. |
| `/:citySlug` | none | Astro | SSG | 4 | 5 cities: `gurgaon`, `delhi`, `noida`, `faridabad`, `ghaziabad`. `gurugram` gets a 301 (Netlify rule). Other single-segment paths get a real 404. The old site showed a `noindex` city hub with status 200. |
| `/:citySlug/:intent/:type` | `GET /properties?city=&purpose=&property_type[]=&limit=12` | Hybrid | SSR+CDN, 1 hour | 4 | `intent`: `buy`, `rent`, `pg`. Canonical `type` segments: `flats`, `independent-house`, `builder-floor`, `villa`, `plots`, `office-space`, `shop`. Aliases (`apartment`, `apartments`, `flat`, `house`, `plot`, `land`, `office`) get a 301 to the canonical segment. Page 1 of listings is rendered on the server, then the filter island hydrates. Zero results: the page shows an empty state with next actions and sets `noindex`. |
| `/:citySlug/:intent/:type/:bhk` | Same, plus `bedrooms_min/max` | Hybrid | SSR+CDN, 1 hour | 4 | `1-bhk` to `5-bhk`. The index rules of `indexationPolicy.js` are kept: 1 to 3 BHK are indexable for the 5 cities (buy and rent). |
| `/:citySlug/:intent/:type/budget/:budget` | Same, plus `price_max` | Hybrid | SSR+CDN, 1 hour | 4 | `under-10k`, `under-15k`, `under-20k`, `under-50-lakhs`, `under-80-lakhs`, `under-1-crore`. 4 combinations are indexable, as in the old site. PG pages get the rent budgets. The old site gave them buy budgets. |
| `/:citySlug/:intent/:type/amenity/:amenity` | Same, plus `amenities[]` | Hybrid | SSR+CDN, 1 hour | 4 | Always `noindex`, as in the old site. The slug is mapped to the amenity title from `GET /amenities` (the backend matches the exact title only). Unknown amenity: real 404. |

## 5. Account and auth

All pages in this group are `noindex`. All use Supabase auth (PKCE, phone OTP, email OTP, password, Google OAuth).

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/login` | `POST /auth/identifier-status`; `POST /auth/last-method` (auth); `GET /users/profile` (auth); `GET /users/me/auth-state` (auth) | React | SSG shell | 5 | Identifier step, then password or OTP. Forced set-password step after OTP when the account has no password. Web OTP autofill. "Last used" badge. Google button. |
| `/register` | `POST /auth/identifier-status`; Supabase `signInWithOtp`, `verifyOtp`, `updateUser` | React | SSG shell | 5 | Sends `full_name` in `options.data`. The old site dropped it. Checks the identifier first, so that an existing account is sent to login. The old site silently reset the password of an existing account. |
| `/forgot-password` | `POST /auth/identifier-status`; Supabase OTP | React | SSG shell | 5 | |
| `/reset-password` | Supabase `updateUser` | React | SSG shell | 5 | Works only when the `passwordResetFlow` flag is set by the OTP step. The old site let any signed-in session change the password here. |
| `/auth/callback` | Supabase `exchangeCodeForSession`; `POST /auth/last-method` | React | SSG shell | 5 | Keeps the `/hi` locale. The old site lost it. |
| `/add-phone` | Supabase `updateUser({phone})`, `verifyOtp(phone_change)`; `PUT /users/me/phone` (auth) | React | SSG shell | 5 | Now also saves the phone in the backend profile. |
| `/profile-completion` | `GET /users/profile`, `PUT /users/profile`, `GET /users/me/auth-state` (auth) | React | SSG shell | 5 | Date of birth: 18 to 120 years ago, the same rule as the backend. |
| `/account` | `GET /users/profile`, `PUT /users/profile`; `GET /visits/upcoming`, `GET /visits/past`, `POST /visits/{id}/cancel`, `POST /visits/{id}/reschedule`; `GET /properties/me`, `PUT /properties/{id}`, `DELETE /properties/{id}`; `GET /swipes?is_liked=true`, `POST /swipes`; `GET /users/notification-settings`, `PUT /users/notification-settings` (all auth) | React | SSG shell | 5 | Tabs: home, profile, my properties (edit and delete now work), favourites, visits (new list; the old "My visits" link went to the home tab), change password, delete account. The old address tab is removed because the backend has no address fields (see gaps). Old `?tab=` aliases are kept. All lists use infinite queries. Optimistic unfavourite. |
| `/delete-account` | `DELETE /users/me` (auth, 204); signed out: `mailto:privacy@360ghar.com` | React | SSG shell | 5 | Signed-in users get a confirmation step. |

## 6. Post property

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/post-property` | `POST /properties` (auth); `GET /amenities`; `POST /upload/batch` (auth) for photos | Hybrid | SSG, `noindex` | 6 | Multi-step form (React Hook Form and Zod). The Zod rules copy the backend rules: rent listings need `monthly_rent`; PG and flatmate listings must be `rent`. Login gate before the last step, with the draft kept in `sessionStorage`. 422 errors are shown on the fields. Photo upload is new (the endpoint exists but the old site did not use it). |
| `/add-new-listing` | none | none | 301 to `/post-property` | 6 | **Done 2026-09-29:** 301 to `/post-property`, route file removed. The old form had no submit handler. |
| `/list-property-free` | none | Astro | SSG | 6 | Static guide with FAQ and HowTo JSON-LD. |

## 7. Data hub

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/circle-rates` | `GET /data-hub/circle-rates/sectors`; `GET /data-hub/circle-rates?sector=&property_type=&limit=20&cursor=` | Hybrid | SSR+CDN, 1 day | 7 | Page 1 table on the server. Filter island with infinite list. Stamp-duty widget island. The old "illustrative" trend bar is removed because its numbers were invented. **Needs approval.** |
| `/circle-rate/:slug` | `GET /data-hub/circle-rates/{slug}`; `POST /data-hub/calculator/stamp-duty` | Hybrid | SSR+CDN, 1 day | 7 | 183 slugs. Unknown slug: real 404. |
| `/stamp-duty-calculator` | `POST /data-hub/calculator/stamp-duty`; `GET /data-hub/circle-rates/sectors` | Hybrid | SSG | 7 | Calculator island. State comparison table in Astro. |
| `/rera-projects` | `GET /data-hub/rera-projects?q=&status=&limit=12&cursor=`; `GET /data-hub/rera-projects/verify/{n}` | Hybrid | SSR+CDN, 1 hour | 7 | Uses the real field `project_type`. Status options come from the backend values (`registered`, `lapsed`, `revoked`, `completed`). The `property_type` filter is removed because the backend ignores it. |
| `/bank-auctions` | `GET /data-hub/auctions/banks`, `GET /data-hub/auctions/cities`, `GET /data-hub/auctions?...`; `POST /data-hub/auctions/alerts` (auth) | Hybrid | SSR+CDN, 1 hour | 7 | Page 1 on the server. Filters in a bottom sheet. The alert form asks the user to log in first. |
| `/bank-auctions/:id` | `GET /data-hub/auctions/{id}` | Hybrid | SSR+CDN, 1 hour | 7 | 237 ids. Uses `full_address`. The countdown is computed on the server and updated by a small script. Event JSON-LD. |
| `/auction-sources` | `GET /data-hub/auctions/source-categories` | Astro | SSR+CDN, 1 day | 7 | Uses the live endpoint with counts. The old static list is the fallback when the API is down. |
| `/verify-ownership` | `GET /data-hub/jamabandi/captcha` (auth), `POST /data-hub/jamabandi/lookup` (auth) | Hybrid | SSG | 7 | Asks the user to log in first. Uses the real fields `owner_names`, `area_kanal`, `area_marla`, `fetched_at`, and sends `captcha_text`. |
| `/zone-checker` | `GET /data-hub/zoning?sector=&limit=12`; `GET /data-hub/colony-approvals?limit=10` | Hybrid | SSR+CDN, 1 day | 7 | Uses the real field names: `far_limit`, `max_coverage_pct`, `max_height_m`, `approval_status`. FAR calculator island. The live zoning table is empty now, so the empty state must be good. |
| `/zone-checker/:slug` | `GET /data-hub/zoning/{slug}` | Astro | SSR+CDN, 1 day | 7 | Shows only the fields that the API returns. Unknown slug: real 404. |
| `/regulatory-updates` | `GET /data-hub/gazette?type=&limit=20&cursor=` | Hybrid | SSR+CDN, 1 hour | 7 | Tabs: all, land_acquisition, rate_revision, policy, clu_change. |
| `/builder-reputation` | `GET /data-hub/builders?q=&order_by=score&limit=20&cursor=` | Hybrid | SSR+CDN, 1 day | 7 | Uses `builder_name`, `builder_score`, `slug`. Sort options only where the backend supports them. |
| `/builder-reputation/:slug` | `GET /data-hub/builders/{slug}` | Astro | SSR+CDN, 1 day | 7 | The projects come from the builder response. The old tab used a filter that does not exist. |
| `/builder-reputation-score` | none (static, 8 builders) | Astro | SSG | 7 | Dataset JSON-LD. |
| `/tenant-demand-heatmap` | none (static, 8 areas) | Astro | SSG | 7 | |
| `/best-sectors-investment-2026` | none (static, 5 sectors) | Astro | SSG | 7 | |
| `/price-index/:citySlug` | none (static `priceContext.json`) | Astro | SSG | 7 | 5 cities. Unknown city: real 404. The old "illustrative" trend is removed. |
| `/data-hub/circle-rates`, `/data-hub/rera-projects`, `/data-hub/bank-auctions` | none | none | 301 (existing rules) | 7 | |

## 8. Tools

All tools are client-side math unless the Endpoints column says otherwise. Each page: Astro shell (text, FAQ, HowTo, SoftwareApplication JSON-LD) plus one calculator island (`client:visible`, or `client:load` when the calculator is above the fold on mobile).

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/tools` | none | Astro | SSG | 8 | Lists all 16 tools. The old page showed raw i18n keys and was not indexable. |
| `/emi-calculator` | none | Hybrid | SSG | 8 | EMI, amortization table, prepayment. Values in the URL. |
| `/area-converter` | none | Hybrid | SSG | 8 | 12 units. Fixes the old `NaN` default. |
| `/loan-eligibility-calculator` | none | Hybrid | SSG | 8 | FOIR by income band, per-bank table. |
| `/area-calculator` | none | Hybrid | SSG | 8 | Carpet, built-up, super built-up. |
| `/property-document-checklist` | none | Hybrid | SSG | 8 | 13 documents, saved in localStorage, print. |
| `/capital-gains-tax-calculator` | none | Hybrid | SSG | 8 | Adds the 12.5% rule without indexation for sales after 23 July 2024. **Needs approval (tax logic change).** |
| `/design-blueprint` | none (vendored `public/blueprint3d/`, 14 MB) | Hybrid | SSG | 8 | Same-origin iframe. Set `X-Frame-Options: SAMEORIGIN` for `/blueprint3d/*`. The old `DENY` header blocked the tool. |
| `/vastu-checker` | `POST /vastu/analyze` (multipart, 180 s timeout) | Hybrid | SSG | 8 | Upload, direction, notes. Report with copy, print and PDF (the PDF code loads on demand). |
| `/ai-design-studio` | Old site: Puter (third party, in the browser). Backend option: `POST /design-studio/generate` (auth) | Hybrid | SSG | 8 | **Decision needed**, see open questions. |
| `/check-fake-listing` | none | Hybrid | SSG | 8 | Rules-based check. The copy must not claim "AI". |
| `/rent-receipt` | none | Hybrid | SSG | 8 | Single and batch (12 months). Print to PDF. Fixes the one-day date shift in IST. |
| `/mofa-to-rera-converter` | none | Hybrid | SSG | 8 | |
| `/sq-ft-calculator` | none | Hybrid | SSG | 8 | |
| `/acre-in-gaj` | none | Hybrid | SSG | 8 | |
| `/stamp-duty-calculator` | see Data hub | | | | |

## 9. Blog

| URL | Endpoints | Type | Render | Priority | Notes |
|---|---|---|---|---|---|
| `/blog` | `GET /blog/posts?limit=12&cursor=&q=&categories=&tags=`; `GET /blog/categories`; `GET /blog/tags` | Hybrid | SSR+CDN, 1 hour | 9 | Page 1 on the server. Category and tag filters now work (the backend names are `categories` and `tags`). The old `?category=` and `?tag=` URLs are read and mapped. `noindex` when filtered, as in the old site. |
| `/blog/:title` | `GET /blog/posts/{slug}` | Astro | SSR+CDN, 1 hour | 9 | Zero JS except share buttons. HTML content is sanitized on the server. Markdown is rendered on the server. Uses the backend `canonical_url` when it is set. Unknown slug: real 404. A numeric id gets a 301 to the slug. |
| `/rss.xml`, `/rss/{blog,hi-blog,properties,hi-properties,localities,hi-localities}.xml` | `GET /blog/posts`, `GET /properties`, static localities | Endpoint | SSR+CDN, 1 hour | 9 | Same 7 feed URLs. |

## 10. Static pages

All are Astro, SSG, priority 10, unless the Notes column says otherwise.

| URL | Endpoints | Notes |
|---|---|---|
| `/about-us` | none | The team list must match the Person JSON-LD. **The old page showed different names in each.** |
| `/faq` | `GET /faqs/public` at build time | The old page used 5 hard-coded items and ignored the API. The contact form on the old page submitted nowhere; the new one uses Formspree `mwpqglyb`. |
| `/contact` | Formspree `mwpqglyb` | Hybrid: form island. `?subject=` prefills the subject. |
| `/policies` | `GET /pages/{name}/public` ×5 at build time | |
| `/policies/:slug` | `GET /pages/{slug}/public` | SSR+CDN, 1 day. 5 slugs. Renders `markdown` or `html` from the `format` field. Unknown slug: real 404. |
| `/gurugram-real-estate-guide` | none | i18n content. |
| `/property-investment-gurugram` | none | i18n content. |
| `/refer-and-earn` | none (see gaps) | Hybrid: referral form. **Decision needed**, see open questions. |
| `/for-ai` | none | |
| `/ai-agent` | none | The tool names must match the backend MCP tools (`discovery_search`, `visits_schedule`, and others). The old page listed tools that do not exist. |
| `/celebrity-homes` | none | The 16 cards link to `/blog/{slug}` posts that do not exist. **Decision needed.** |
| `/nri-property-guide` | none | |
| `/landlord-not-returning-security-deposit` | none | |
| `/glossary` | none | Hybrid: search and A to Z filter island. |
| `/links` | none | |
| `/careers` | none (static `careers.js`) | |
| `/careers/:slug` | none | 4 slugs. The closed role stays `noindex` with status 200. Unknown slug: real 404. |
| `/vs/:competitor` | none (static `competitors.js`) | 10 slugs, one template. Fixes the broken breadcrumb URLs. |
| `/truth/:slug` | none | 5 slugs, one template. `datePublished` becomes a fixed date. The old page used the time of each render. |
| `/vs` | none | **New hub page** that lists the 10 comparisons and 5 truth pages. The old breadcrumbs linked to `/vs` and `/truth`, which were not routes. `/truth` gets a 301 to `/vs`. |
| `/styleguide` | none | **New, internal**, `noindex`. Work plan step 2. |
| 404 page | none | Real HTTP 404, paper-cut illustration, search box, popular links. |

## Redirects and URL rules

Existing Netlify rules that the new site keeps (same order):

1. `https://www.360ghar.com/*` to `https://360ghar.com/:splat`, 301.
2. `/{,hi/}gurugram/{buy,rent,pg}/apartments` to `/{,hi/}gurgaon/.../flats`, 301 (one hop).
3. `/gurugram/*` to `/gurgaon/:splat` and `/hi/gurugram/*` to `/hi/gurgaon/:splat`, 301.
4. `/{,hi/}:city/{buy,rent,pg}/apartments` to `.../flats`, 301.
5. `/.well-known/assetlinks.json` and `/.well-known/apple-app-site-association` proxied to the API, 200.
6. `/data-hub/{circle-rates,rera-projects,bank-auctions}` to the root pages, 301.
7. `/api/*` proxied to `https://api.360ghar.com/api/v1/:splat`, 200.

New rules:

| From | To | Code | Reason |
|---|---|---|---|
| `/property` | `/properties` | 301 | Old dead link |
| `/projects` | `/project` | 301 | Old canonical |
| `/property-sidebar` | `/properties` | 301 | Duplicate layout (done 2026-09-29) |
| `/add-new-listing` | `/post-property` | 301 | Non-working form (done 2026-09-29) |
| `/truth` | `/vs` | 301 | Old breadcrumb parent |
| Type aliases in landing URLs (`apartment`, `flat`, `house`, `plot`, `land`, `office`), any depth | Canonical segment | 301 | The old site returned 200 with a different canonical |
| Bare locality slug `/locality/{slug}` | `/locality/{slug}-{city}` | 301 | Duplicate URLs |
| `/blog/{numeric id}` | `/blog/{slug}` | 301 | The API accepts ids |
| Uppercase paths | Lowercase path | 301 | The old site returned 200 for these |
| `/x/` (trailing slash) | `/x` | 301 | Done in the Astro middleware, not as a Netlify force rule, because a Netlify force rule caused the 2026-07-14 redirect loop |

Behaviour changes that return real 404 instead of a soft 404 (status 200 with a `noindex` page):
unknown single-segment paths (`/:citySlug`), unknown `/near/`, `/locality/`, `/project/`, `/blog/`, `/careers/`, `/policies/`, data-hub slugs, and unknown landing segments. None of these URLs is in any old sitemap.

## Static files and generated files

| Path | Source | Render |
|---|---|---|
| `robots.txt` | Copied, then fixed: add `sitemap-datahub.xml`; put the `Allow` lines in the `*` group | SSG |
| `llms.txt`, `llms-full.txt`, `data/llm-feed.json`, `.well-known/ai.txt`, `.well-known/api-catalog` | Built from the same inputs as the old `aiDiscovery.js` | SSG endpoints |
| `.well-known/{openid-configuration, oauth-authorization-server, oauth-protected-resource, mcp/server-card.json, acp.json, ucp}`, `.well-known/agent-skills/**` | Copied byte for byte. `index.json` stores sha256 digests of the `SKILL.md` files | Static |
| `BingSiteAuth.xml`, `ba96fa507cb7447aa74f5ddd2f516a6d.txt`, `openapi.json`, `og-image-home.jpg` | Copied | Static |
| `blueprint3d/` (14 MB) | Copied | Static |
| `assets/images/**` | Copy only the files that the new pages use. Keep the old paths of files that are linked from outside (logo, favicons, OG images) | Static |
| `/favicon.ico` | New. The old site returned HTML for this path | Static |
| `sitemap.xml` (index) | Endpoint | SSR+CDN, 1 day |
| `sitemap-static.xml`, `sitemap-landing.xml`, `sitemap-localities.xml` | Endpoints from static data | SSG |
| `sitemap-properties.xml`, `sitemap-blog.xml`, `sitemap-projects.xml`, `sitemap-datahub.xml` | Endpoints that call the API | SSR+CDN, 1 day. The old files are the fallback when the API is down |
| `/art/{scene,home,vignette,skyline}/*.svg` | New (round 3). Paper drawings below the first screen, as cached files (`src/pages/art/[kind]/[name].svg.ts`). Not mirrored to `/hi` | SSG, 1 day browser cache (`netlify.toml`) |
| `/art/map/<listing id>.svg` | New (round 3). The street plan on a listing page, seeded by the listing id (`src/pages/art/map/[id].svg.ts`). Bad ids return 404 | SSR+CDN, 1 day browser cache, CDN until the next deploy |
| Headers | Same security headers. HTML: `max-age=60`. Hashed assets: 1 year, immutable. `.well-known` content types as in the old `netlify.toml`. The `Link` header on `/` is kept | netlify.toml |
| IndexNow | Post-deploy script, same key | CI |

## Features found in the old code that do not work

The new site makes these work, because the backend supports them:

- Blog category and tag filters (wrong parameter names).
- Zoning, colony, builder, RERA, auction and Jamabandi fields (wrong field names).
- Edit and delete in "My properties" (buttons with no handlers).
- Favourite state on cards and on the detail page (the token was never sent).
- Listings on locality pages (not filtered by locality).
- Furnishing filter (sent as a feature key, not as `furnishing[]`).
- Map page filters and price sorts.
- Phone number from `/add-phone` saved to the backend profile.
- Full name from `/register`.

## Decisions for you

These change old behaviour. I will not do them without your approval.

1. **Duplicate or broken routes**: done. `/property-sidebar` and `/add-new-listing` return a 301 to `/properties` and `/post-property` (`src/lib/redirects.ts`).
2. **Invented data**: remove the "illustrative" trend charts on `/circle-rates` and `/price-index/*`, and the unsourced stats on `/ai-agent` (50K+, 10K+, 99%).
3. **Real 404s**: return HTTP 404 for unknown slugs and paths, instead of the old soft 404 with status 200. No URL in the old sitemaps is affected.
4. **Capital gains**: add the 12.5% rule without indexation for sales after 23 July 2024.
5. **Location prompt**: ask for browser location only when the user selects "Near me", not on every page load.

## Open questions

1. **Forms without a backend endpoint**: the home review form (`POST /reviews` returns 404) and the referral form (the old form showed success and dropped the data). Options: (a) send both to Formspree, which the old site already uses (no new paid service); (b) hide both forms until the backend has endpoints. Recommendation: (a) for referrals, because each referral is a lead; (b) for reviews, because reviews shown on the page must be real.
2. **AI Design Studio**: the old page uses Puter (a third-party AI service; each user signs in to Puter). The backend has `POST /design-studio/generate`, which needs a 360Ghar login. Recommendation: use the backend endpoint, so that the site uses one AI provider and one login.
3. **Celebrity homes**: the 16 cards link to blog posts that do not exist (the blog has 20 posts, none of them match). Options: keep the cards without links, or remove the page from the nav and sitemap until the posts exist.
4. **Google Maps key**: the map page and the Places input need `VITE_GOOGLE_MAPS_API_KEY` (or the Places key). Please confirm that I can use the same key in the new site.
5. **Images**: the old `public/assets/images` folder is 61 MB with 663 files. Please confirm that I may copy only the files that the new pages use.

## Status of the decisions and questions (2026-09-27)

You have not answered the decisions and questions above yet. I used the safe default for each one. Every default can be changed in a few lines.

| Item | What the new site does now | To change |
|---|---|---|
| Decision 1 | `/property-sidebar` and `/add-new-listing` return a 301 to `/properties` and `/post-property`. The route files are removed | none |
| Decision 2 | The invented charts and stats are not shown (data hub, `/ai-agent`, home counters and reviews) | Tell me which to put back and the real source |
| Decision 3 | Unknown slugs and paths return 404 | none |
| Decision 4 | The capital gains tool applies the 12.5% rule for sales after 23 July 2024 | none |
| Decision 5 | Location is asked only after "Near me" | none |
| Question 1 | Referral, contact and newsletter forms post to Formspree, as on the old site. The review form is not shown, because reviews on the page must be real | Say if you want a backend endpoint (M1 to M4 in `backend-gaps.md`) |
| Question 2 | The AI Design Studio still uses Puter. The code is isolated in `src/features/tools/ai-design/provider.ts` | Say "use the backend" to switch to `POST /design-studio/generate` |
| Question 3 | The celebrity cards show without links | none until the posts exist |
| Question 4 | The old key is copied, but Google returns `ExpiredKeyMapError` for it. The map view shows a clear fallback and the list still works | Put a valid key in `PUBLIC_GOOGLE_MAPS_API_KEY` |
| Question 5 | Only the images that the new pages use are copied | none |

Other changes from the old site:

- Home: the old review score (4.7 from 128), the counters (500+ properties, 5+ years) and the testimonials are gone. The home page shows the real listing count and links to the real Google reviews.
- Search: the "features" filter is not shown, because no listing has features (D6 in `backend-gaps.md`).
- Post property: the form asks for more detail than the old lead form (six steps, photos, amenities). The old email field is gone: `PropertyCreate` has no email field, and the old site only pasted it into the description. The signed-in user's email is on the account.
- New pages: `/compare`, `/vs`, a map view in the search (`/map-location` opens it), `/styleguide`.
- City hubs with no homes (`/delhi`, `/noida`, `/faridabad`, `/ghaziabad`) return 200 but are `noindex` and not in the sitemap, the same rule as landing pages with 0 homes.
- Editing a listing: the backend ignores the nightly price, the owner name and phone, balconies, parking and age on update (R23 in `backend-gaps.md`). The edit form shows them read-only.

## Old URL check (2026-09-27)

I requested 3,500 old URLs on the new site: every URL in the old `sitemap-static`, `-landing`, `-projects`, `-blog`, `-datahub` and `-properties` files, every 40th URL of `sitemap-localities`, and every fixed route in `App.jsx`, in English and Hindi.

- 2,018 return 200 and 22 return 301.
- 1,460 return 404. All of them are `/property/:id` for 730 ids that the API no longer has (`GET /properties/{id}` returns 404 for them too). The old sitemap was built from an older list. The 109 live listings all return 200. A removed listing gets a 404 page that links to similar homes.

## Totals

- Old routes: 95 route patterns in `App.jsx`, each also under `/hi`. The old build prerendered 258 URLs (129 English, 129 Hindi).
- New site: all old URLs in the old sitemaps return 200 or 301. New pages: `/compare`, `/vs`, `/styleguide`, a real 404 page.
- Render modes (route patterns, English): about 60 SSG, about 30 SSR+CDN (including feeds and sitemaps), 12 SSG shells.
