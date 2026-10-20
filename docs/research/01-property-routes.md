I traced all 10 routes from page component to HTTP call. Only 11 distinct API calls sit behind them, and one has no backend handler at all: the home-page review form. Everything else hits a real handler, but there are several param and field-name mismatches, a few frontend state bugs to avoid copying, and two routes whose forms are static or not wired up.

**Base URL.** In prod the site calls `VITE_API_BASE_URL=https://api.360ghar.com/api/v1` (netlify.toml). In dev it uses `/api`, which Vite (and `public/_redirects` `/api/*`) rewrites to `/api/v1`. All paths below are relative to `/api/v1`.
- `publicApi` sends no token; `api` attaches the Supabase bearer token (`src/services/http.js`, `api.js`).
- The backend strips trailing slashes (`app/middleware/trailing_slash.py`), so slash differences don't matter.
- Every route also exists under `/hi/...` (Hindi, via `LocaleGate` in App.jsx).

---

## Shared across all routes
- **Global calls:**
  - `initializeAuth` reads the Supabase session; if logged in it calls `GET /users/profile` (auth). Backend: `users.py:247`.
  - PostHog `capturePageView` fires on every route change (autocapture off). Env: `VITE_PUBLIC_POSTHOG_KEY` / `VITE_PUBLIC_POSTHOG_HOST`.
  - A floating ChatBot on every page uses fetch-based SSE: `POST /agent/chat-public` (guest), `POST /agent/chat` (auth), and `GET`/`DELETE /agent/conversations...`. Backend: `agent_chat.py`.
- **Layout:** Header, MobileMenu and Footer are static and use auth state for login/logout. The OffCanvas `SearchBox` has keyword, type (apartment/house/pg/commercial), purpose, min/max price, bedrooms and radius. It keeps recent searches in localStorage `360ghar:recentSearches` (max 8) and navigates to `/properties?...`.
- **`Cta` block:** a newsletter form posting to Formspree `mkgzdjyj` (email field).
- **Location store** (`store/locationStore.js`, persisted as `location-store`, 24h max age): browser geolocation, falling back to Gurgaon `28.4595, 77.0266`.
- **Google Places:** `common/search/GooglePlacesInput.jsx` uses `@googlemaps/js-api-loader` with Places API (New) `AutocompleteSuggestion`. It debounces 250ms, restricts to region `in`, uses session tokens, and returns `{lat, lng, name=formattedAddress}`. Env: `VITE_GOOGLE_PLACES_API_KEY`.
- **SEO component** (`common/SEO.jsx`, react-helmet-async):
  - Canonical defaults to the current path (locale-aware, trailing slash stripped). On noindex pages the canonical and hreflang (en/hi/x-default) are suppressed.
  - Sets og:* and twitter:*; adds `og:video` when a `video` prop is passed.
  - App.jsx injects global JSON-LD on every page: Organization, WebSite, LocalBusiness, KnowledgePanel, MobileApplication, Person, Speakable.
- **Prerender:** Puppeteer at build time; axios short-circuits to `/prerender-data.json` during capture. `/properties`, `/project`, `/post-property`, `/map-location`, `/add-new-listing` and `/property-sidebar` are in `scripts/prerender-routes.json`. `/property/:id` and `/project/:title` are not prerendered.

---

## 1. `/` — `src/pages/Home.jsx`

**API calls**

| # | Call | Where | Auth | Backend |
|---|---|---|---|---|
| 1 | `GET /properties/recommendations?limit=12` | `PropertyTwo.jsx` → `propertyStore.fetchRecommendations(12)` → `propertyAPIService.getRecommendations` | no (publicApi) | `properties.py:382`, `CursorPage[Property]`. Accepts `cursor`, `limit`, `include_total`. Personalizes only with a token, which is never sent. |
| 2 | `GET /blog/posts?limit=6` | `components/blog/BlogFeed.jsx` → `blogService.getPosts` | no | `blog.py:102`, `CursorPage[BlogPost]`. Frontend reads `thumbnail_url` and `author_name`, which the schema doesn't have; it falls back to `cover_image_url`. |
| 3 | `POST https://360ghar.com/api/reviews` body `{rating, text, name, role:'buyer', platform:'web'}` | `components/reviews/CustomerReviews.jsx:82` (raw fetch) | no | **No handler.** `_redirects` proxies it to `/api/v1/reviews`; the backend only has `POST /bookings/review` (`bookings.py:332`). |

Two more forms post straight to Formspree: `MessageThree` owner onboarding (`https://formspree.io/f/mwpqglyb`, fields `full_name`, `email`, `address`, `message`, hidden `source`, required `terms_agreement`), and the `Newsletter` (`mkgzdjyj`).

**Static data:** `data/HomeThreeData.jsx` (bannerThreeContent, aboutCheckLists, propertyTwoTabs, messageThreeContents, counterThreeContents, faqs), `data/HomeOneData.jsx` (filterTabs, propertyTypes, toolFeatures), `PropertyManagementData.jsx`, `AIAgentData.jsx` (mcpUrl `https://api.360ghar.com/mcp`), `reviewsData.js` (customerReviews, reviewRoles, reviewAggregate).

**Features**
- **Hero `TabFilter`** has tabs Rent / Buy / Sell.
  - Rent and Buy set store `purpose` to `rent` or `buy`.
  - Sell navigates to `/contact?subject=List%20my%20property`.
- **`SimplifiedFilter`:**
  - Places input sets lat/lng.
  - A radius select (5/10/20/50/100, default 20) appears only once a location is chosen.
  - "Search" goes to `/properties?limit=12&lat=&lng=&radius=&purpose=` (via `buildPropertySearchQuery`); "View All" goes to `/properties`.
  - A clear button resets location.
- **Other sections:** ReferEarn CTA, "why us" cards, and PropertyTwo (a 6-card grid of recommendations). PropertyTwo has 5 tabs (Houses, Apartments, Bedrooms, Smart House, Swimming Pool) that all show the same list.
- **Remaining sections:** PM showcase (Play Store link), AppDownload, and CustomerReviews:
  - role filter chips;
  - review form with 1–5 stars, optional name, and text of at least 20 characters.
- **Below that:** stats counters (react-countup), AI Agent showcase, ToolShowcase, a static FAQ accordion, BlogFeed (6 posts linking to `/blog/{slug}`, plus an RSS link `/rss.xml`), a 12-link "Explore" grid, AiFactSheet and Footer. Below-fold sections lazy-load through `LazySection`.
- **Card (`PropertyItem`)**, shared by all listing routes:
  - Image carousel on hover (2s, up to 5 dots; `kuula.co` URLs are filtered out).
  - Favourite heart → `POST /swipes` only when logged in (see route 4).
  - Share modal (copy link, `navigator.share`).
  - Compare toggle (Zustand `compareStore`, max 4).
  - Badges: verified, distance, 360° when `virtual_tour_url` is set.
  - Price shown as rent `/month` or `/day`, plus `price_per_sqft`.
  - Chips for beds/baths/sqft/balconies/parking/floor/age, amenities and features.

**SEO:** title "360Ghar – VR Home Tours & Property in Gurugram", canonical `/`, keywords from `siteMetadata.defaultKeywords`. JSON-LD: an FAQPage (10 Q&As inline in Home.jsx), BreadcrumbList, and a RealEstateAgent with AggregateRating and 5 Reviews (from CustomerReviews).

---

## 2. `/properties` — `src/pages/properties/Property.jsx` → `components/property/PropertyPageSection.jsx`

**API calls**

| Call | Where | Auth | Backend |
|---|---|---|---|
| `GET /properties?limit=12[&cursor=][filters]` | SWR key `['/properties/search', activeFilters]` in PropertyPageSection → `propertyAPIService.searchProperties` → `utils/propertyFilters.buildPropertySearchParams` | no (publicApi) | `properties.py:295`; params built at `:96-203`; `CursorParams` at `pagination.py:133`; returns `CursorPage[Property]` `{items, next_cursor, has_more, limit, total}` |
| Same call again | `applyFilters` → `propertyStore.fetchProperties` from TopBar Enter/Search, PropertyFilters "Search", sort change | no | Result goes into `store.properties`, which **this page never renders**. Duplicate request. |
| `POST /swipes` `{property_id, is_liked}` | card heart | yes | `swipes.py:38`, body `PropertySwipe`, returns `MessageResponse` |

**API params sent:**
- `limit`, `cursor`, `lat`, `lng`, `radius`, `q`, `purpose`
- repeated: `property_type`, `amenities`, `features`
- `price_min`/`price_max`, `bedrooms_min`/`bedrooms_max`, `bathrooms_min`/`bathrooms_max`, `area_min`/`area_max`
- `city`, `locality`, `pincode`
- `parking_spaces_min`, `floor_number_min`/`floor_number_max`, `age_max`
- `check_in`, `check_out`, `guests`, `gender_preference`, `sharing_type`, `sort_by`

All of these are accepted by the backend.

**Backend accepts but the frontend never sends:** `furnishing[]`, `kitchen_type[]`, `ventilation_type[]`, `windows_min`, `has_lift`, `available_from`, `move_in`, `semantic_search`, `exclude_swiped`, `ids[]`, `include_total`.

**Page-URL query params** (parsed by `parsePropertySearchParams`):
- **Primary keys:** the same as the API param names above.
- **Ignored:** `page`, `offset`, `cursor`, `view` (`view=list|grid` only switches layout).
- **Legacy aliases** (`utils/propertyTaxonomy.js`):
  - `intent` / `purpose`: `sale`→`buy`, `short stay`→`short_stay`, `pg`→`rent` plus type `pg`.
  - `type` / `property_types`: flat(s)→apartment, independent-house→house, builder-floor, plot/land, co-living/hostel→pg, roommate→flatmate, commercial→office+shop+warehouse, etc.
  - `bhk=N`: sets `bedrooms_min=N` and `bedrooms_max=N`; for N≥4, no max.
  - `budget`: `under-10k`, `under-15k`, `under-20k`, `under-50-lakhs`, `under-80-lakhs`, `under-1-crore` → `price_max`.
  - `amenity` → appended to `amenities`.
  - Old names: `min_price`, `max_price`, `min_area`, `max_area`, `zip_code`, `latitude`, `longitude`, `radius_km`, `searchKeyword`, `bedrooms`, `bathrooms`.

**Filters (`PropertyFilters.jsx`, desktop sidebar and mobile drawer)**
- **Basic:**
  - Purpose radio: All / buy / rent / short_stay.
  - Property type checkboxes: apartment, house, builder_floor, room, villa, plot, pg, flatmate, commercial (commercial = office+shop+warehouse).
  - Budget min/max number inputs.
  - BHK buttons: Any / 1 / 2 / 3 / 4+.
  - Radius select (5/10/20/50/100), shown only when lat/lng are set.
- **Advanced toggle:**
  - Bathrooms min/max, area (sqft) min/max, floor min/max, parking min, age max.
  - City, locality and pincode text fields.
  - PG/flatmate gender (any/male/female) and sharing (private_room/shared_room), shown only when pg or flatmate is selected.
  - Short-stay check-in/check-out dates and guests, shown only when purpose is short_stay.
- **Amenity checkboxes (15, sent by title):** Parking, Security, Garden, Gym, Swimming Pool, Power Backup, Water Supply, Waste Management, Intercom, Gas Pipeline, WiFi, Air Conditioning, RO Water System, Servant Room, Study Room. The backend matches these case-insensitively on `Amenity.title` (`services/property/search.py:470`).
- **Feature checkboxes (12):** Furnished, Semi-Furnished, Unfurnished, Modular Kitchen, Built-in Wardrobes, False Ceiling, Wooden Flooring, Marble Flooring, Corner Property, Park Facing, Main Road Facing, East Facing. The backend matches these as JSONB keys on `features`.
- **Other controls:** active-filter chips with remove and "Clear All", an active-count badge, and saved searches in localStorage `property_saved_searches` (max 10: save, load, delete). The mobile drawer has a focus trap and Esc to close.

**Other controls on the page**
- **Top bar:**
  - Keyword `q`, with recent searches in localStorage `360ghar_recent_property_searches` (max 5).
  - A Places location input.
  - "Share filtered view", which copies `/properties?{all filters}`.
  - Search button.
- **Sort select:** newest, distance, price_low, price_high, popular, relevance. It writes `?sort_by=` to the URL.
- **Layout and paging:** grid/list toggle (`?view=`), cursor "Load More" pagination, pull-to-refresh on touch (100px threshold, triggers SWR `mutate`), offline banner, skeletons, retry, clear filters.
- **Compare tray:** links to `/compare?ids=1,2`. There is no `/compare` route, so it falls through to `/:citySlug` (CityHub).

**Frontend quirks — don't copy these**
- Any filter change triggers an SWR fetch immediately, including every keystroke in `q`, with no debounce.
- Filters other than `sort_by` and `view` are never written to the URL. Changing sort or view calls `replaceFilters(URL)`, which wipes the sidebar selections.

**Static data:** `propertyTaxonomy.js`, plus the hardcoded amenity and feature lists above.

**SEO:** title "Flats in Gurgaon | Verified Properties for Sale & Rent | 360Ghar", a long hardcoded keyword string, canonical = bare path (no query). JSON-LD: ItemList (`realEstateListing`) and a Home › Properties BreadcrumbList. The page also has static "popular searches" links to `/gurgaon/rent/flats`, `/gurgaon/buy/flats`, `/gurgaon/buy/flats/2-bhk`, `/gurgaon/rent/flats/budget/under-20k`, `/gurgaon/pg/flats` and `/localities`.

---

## 3. `/property-sidebar` — `pages/properties/PropertySidebar.jsx` → `components/property/PropertySidebarSection.jsx`

- **API calls:**
  - `GET /properties?...` through `propertyStore.fetchProperties` (no auth, same handler as route 2). It fires on changes to location or filters, and again on every sidebar change.
  - "Load More" passes `cursor=pagination.nextCursor` and appends.
  - `POST /swipes` from cards.
- **Bug:** the payload is `{lat, lng, radius:10, sort_by:'distance', ...storeFilters}`. The store defaults (`lat:null`, `lng:null`, `radius:20`, `sort_by:'newest'`) come last and override the location, so the geo search is dropped unless lat/lng are already in the filters.
- **`SearchSidebar`** (`common/search/SearchSidebar.jsx`) auto-applies on change:
  - Working: property-type checkboxes, the Status radio (buy/rent/short_stay), and the price range slider (0–1e7, `CustomRangeSlider` → `price_min` / `price_max`).
  - Not working: the "Price Range" checkboxes (values like `'Low Price'`, which parse to nothing), and the "Amenities" and "Bed/Bath" lists, which are decorative and not wired to anything.
- **`LocationSearchInput`:** Places input plus a radius select; on selection it navigates to `/properties?lat=&lng=&radius=&sort_by=distance`.
- **Also on the page:** a location status line ("near {name}", geolocation error text), a sort select (`PropertyFilterBottom`), and a Clear Filters button.
- **Static data:** `data/OthersPageData.jsx` (`priceRanges`, `bedBaths`, `searchAmenities`).
- **SEO:** title "Properties with Filter Sidebar | 360Ghar", canonical `/property-sidebar`, **noindex**. No JSON-LD beyond the global set.

---

## 4. `/property/:id` — `pages/properties/PropertyDetails.jsx` → `components/property/PropertyDetailsSection.jsx`

**API calls**

| Call | Where | Auth | Backend |
|---|---|---|---|
| `GET /properties/{id}` (AbortController, cancelled on id change) | `propertyStore.fetchPropertyById` → `propertyAPIService.getPropertyById` | no (publicApi) | `properties.py:437`, `Property`. Auth is optional there and, with a token, the response adds `liked`, `user_has_scheduled_visit`, `user_scheduled_visit_count`, `user_next_visit_date` and `compatibility_score`. **publicApi never sends the token, so these never arrive.** The handler also increments the view count for non-bot user agents. |
| `GET /properties?limit=4&locality=&city=&purpose=&property_type=&price_min=&price_max=` (base_price ±20%) | similar properties, `searchProperties(filters, null, 4)` | no | `properties.py:295` |
| `POST /swipes` `{property_id, is_liked: !current}` | Save button → `propertyStore.recordSwipe`; if not logged in, redirects to `/login` with `state.from` | yes | `swipes.py:38` |
| `POST /visits` `{property_id, scheduled_date: ISO (local→UTC), special_requirements}` | schedule-visit form → `visitStore.scheduleVisit` → `visitService.schedule` | yes | `visits.py:41` (def `:63`), `VisitCreate` (`schemas/visit.py:22`), returns `Visit` |
| `POST /visits` `{property_id, scheduled_date: "tomorrow YYYY-MM-DDTHH:MM", special_requirements: "Callback requested. Phone… Preferred time… Notes…"}` | "Request callback" modal (dynamic import of `visitService`) | yes (UI doesn't gate on login) | same handler; a callback is saved as a visit tomorrow |
| `GET /data-hub/circle-rates?sector={locality}&limit=3` | `data-hub/CircleRateBanner.jsx` → `dataHubService.getCircleRates` | no | `data_hub/circle_rates.py:36`, `CursorPage[CircleRateResponse]` |
| `GET /data-hub/zoning?sector={locality}&limit=1` | `data-hub/ZoneInfoCard.jsx` | no | `data_hub/registry.py:120`, `CursorPage[ZoningDataResponse]`. **Field names differ:** the schema aliases `far`→`far_limit` and `ground_coverage_pct`→`max_coverage_pct` (`schemas/data_hub.py:195,198`). FastAPI serializes by alias by default, so the frontend's `zone.far` and `zone.ground_coverage_pct` come back undefined. |
| `GET /data-hub/neighbourhood/{id}` | `data-hub/NeighbourhoodScorePanel.jsx` | no | `data_hub/neighbourhood.py:16`, `NeighbourhoodScoreResponse` (404 when missing; the panel hides) |

**Fields the frontend reads that the backend `Property` schema (`schemas/property.py:370-498`) doesn't have**

| Frontend reads | Backend has | Effect |
|---|---|---|
| `is_liked` | `liked` | card heart never pre-filled (details falls back to `liked`) |
| `is_verified` | nothing | verified badge never shows |
| `rera_number` | nothing | RERA badge and ClaimReview JSON-LD never render |
| `bhk` | nothing | BHK label |
| `sector` | nothing | data-hub panels key off `locality` only |
| `video_url` | `video_tour_url`, `video_urls[]` | Video tab always disabled |
| `tour_url` | nothing | tour fallback |
| `lat` / `lng` | `latitude` / `longitude` | JSON-LD `geo` never emitted; the map embed does fall back correctly |
| `price_type`, `furnishing` | `furnishing_level` | not displayed |
| amenities `.key` / `.name` / `.label` | `{id, title, icon, category}` | amenity labels render blank |

**Features**
- **Media tabs:**
  - Virtual Tour (the default when `virtual_tour_url` is set): `LazyVRPlayer` shows a click-to-load thumbnail, then a plain `<iframe src=virtual_tour_url>`. It has fullscreen (Fullscreen API) and open-in-new-tab.
  - Photos: hero image, 7 thumbnails plus a "+N" tile, `yet-another-react-lightbox` (Zoom and Thumbnails plugins, zoom % toolbar), `react-swipeable` swipe navigation, and neighbour-image preloading.
  - Video: YouTube, Vimeo, native mp4/webm/ogg, or a generic iframe.
- **Actions bar:** Save/like, Compare, Share dropdown (WhatsApp with UTM params, Facebook, Twitter, copy link), Print.
- **Content:**
  - Header with title, address and price (/month or /day); trust strip (ID, updated date); description.
  - Overview stats (beds, baths, area, floor, parking).
  - Key details: type, listing, status, availability, available-from, builder, owner name/contact, gender, room type, ID; plus tags.
  - Pricing (rent/base, daily, deposit, maintenance, ₹/sqft, minimum stay, max occupancy); building/area; features; amenities with an icon map.
  - Address list plus a Google Maps iframe embed (`maps?q=lat,lng&z=15&output=embed`, no API key).
  - Engagement counts (views, likes, interests, created, updated).
  - Similar properties (up to 4 cards).
- **Sidebar:** price, stats and badges, then owner box:
  - WhatsApp deep link `wa.me/+91…` with a prefilled message.
  - "Show phone number" reveals `owner_contact` locally; no API call.
  - "Request callback" modal: phone (required, regex `^[\d\s+()-]{10,}$`), preferred time (required: morning/afternoon/evening), notes.
- **Schedule-visit form:**
  - Date input (min = today in UTC) and time input, both required and in the future; optional notes.
  - Shakes on validation error; shows a success alert for 5s.
- **Mobile:** sticky bar with Call (`tel:`), WhatsApp and Callback.
- **Below the details:** data-hub panels (circle rate, zone info, neighbourhood score wheels), CTA, and an AI Design Studio cross-link.
- **Broken link:** "Back to listings" points to `/property`, which isn't a route; it falls through to `/:citySlug`.
- **Not present on this page:** an EMI widget, and any link to `/property/:id/virtual-tour`.

**SEO**
- **Title:** `[N BHK|N Bedroom] {TypeLabel} {ListingLabel} in {locality|city|Gurugram} | ₹{price} | 360Ghar`.
- **Description:** first 160 chars of the description plus "Verified by on-site team with 360° virtual tour in {loc}. {listing} directly from owner."
- **Meta:** `type=product`, `og:video=virtual_tour_url`, preloads the first 2 images, noindex when not found or on error. Canonical defaults to `/property/{id}`, so UTM query strings are dropped.
- **JSON-LD:**
  - Accommodation, SingleFamilyResidence or Apartment (address, floorSize FTK, rooms, amenities).
  - RealEstateListing (forSale/forRent, datePosted, price INR, availability).
  - Product/Offer (`generatePropertyProductStructuredData`; price omitted when 0).
  - EEA Organization (+ ClaimReview if `rera_number`).
  - BreadcrumbList.
  - When there's a tour: VideoObject and 3DModel.
- **URL format:** the raw numeric id only (`/property/1055`, `/hi/property/1055`). The sitemap (`scripts/generate-dynamic-sitemaps.mjs:136`) and RSS use the same format. There is no slug and no legacy format; a non-integer id gets a 422 from the backend and shows the error state.

---

## 5. `/property/:id/virtual-tour` — `pages/properties/VirtualTourPage.jsx`

- **API call:** `GET /properties/{id}` (no auth) via `propertyAPIService.getPropertyById` directly, not the store. Backend `properties.py:437`, `Property`.
- **Features:**
  - Breadcrumb.
  - A full-width `<iframe src={virtual_tour_url || tour_url}>` (600px, `allow="fullscreen; xr-spatial-tracking; gyroscope; accelerometer"`).
  - A "tour not available" fallback.
  - Property info card: title link, BHK, locality, price (/mo for rent).
  - 5 static "tour highlights" (i18n `virtualTourPage.highlights.*`) and "back to property" CTAs.
- **Viewer tech:** an iframe to an external host. No pannellum or three.js is used. `kuula.co` URLs show up in the data, which suggests Kuula-hosted tours. The backend's own tour API (`GET /public/tours/{tour_id}`, `public.py:177`) is not used.
- **SEO:**
  - Title `{title} - 360° Virtual Tour | 360Ghar`; description "Take a 360° virtual tour of {title} in {locality}…"; `og:video=tour url`.
  - noindex when there's no data. No explicit canonical, so it defaults to `/property/{id}/virtual-tour`.
  - JSON-LD: BreadcrumbList (4 levels) and a VideoObject with a fabricated `uploadDate=now`, `duration PT5M` and 5 fixed `hasPart` Clip chapters.
- **Reachability:** nothing in the app links to this route.

---

## 6. `/add-new-listing` — `pages/properties/AddListing.jsx` → `components/forms/AddListingSection.jsx`

- **API calls:** none. `<form action="#">` has no submit handler.
- **Structure:** a template form with a scroll-spy sidebar (`common/listing/ListingSidebar.jsx`, anchors from `addListings`).
- **Fields (uncontrolled, no names, no validation):**
  - Basic info: title, description, a "Status" select (For Rent/For Sell, all `value="1"`), type (Apartment/House/Land/Single Family), price (placeholder "USD"), area, rooms.
  - Gallery: `common/forms/ImageUpload.jsx`, a local multi-file picker with `URL.createObjectURL` previews and remove. It doesn't upload anything.
  - Details: property id, area size, size prefix, land area, bedrooms, bathrooms, garages, year built, and amenity checkboxes (`addAmenities`).
  - Contact: name, email.
- **Static data:** `data/OthersPageData.jsx` (`addListings`, `addAmenities`).
- **SEO:** "Add Listing | 360Ghar", canonical `/add-new-listing`, **noindex**.
- **For a real rebuild:** the backend endpoints exist but are unused here: `POST /properties` (`properties.py:206`), `POST /upload` (`upload.py:64`), `/upload/batch` (`:91`), `/upload/presigned` (`:119`) + `/upload/confirm/{id}` (`:209`), and `GET /amenities` (`amenities.py:21`, no auth, `list[Amenity]`).

---

## 7. `/post-property` — `pages/properties/PostProperty.jsx`

- **API call:** `POST /properties` (auth) via `propertyService.createProperty` (authenticated `api`). Backend `properties.py:206` (def `:248`), body `PropertyCreate`, returns `Property`.
- **Body from `utils/postPropertyPayload.js`:**
  - `title` = "{type} - {location}" (max 200 chars).
  - `description` = notes + budget + size + owner contact.
  - `property_type`, `purpose` (= `listing_type`), `base_price` (from `budget_range`, capped at 1e8).
  - `full_address` = `city` = the Places formatted address.
  - `owner_name`, `owner_contact` = `+91{phone}`, optional `area_sqft`.
  - `monthly_rent = base_price` for rent; `daily_rate = base_price` for short_stay.
- **Form (Formik + Yup):**

  | Field | Rule |
  |---|---|
  | `full_name` | required, min 2 |
  | `email` | required, email |
  | `phone` | required, `^[6-9]\d{9}$`, digits only, maxLength 10 |
  | `property_type` | required; the 15 backend enum values |
  | `property_location` | required, min 3; Places autocomplete (lat/lng discarded) |
  | `property_size` | optional number (sqft) |
  | `budget_range` | optional number ("expected price") |
  | `listing_type` | buy / rent / short_stay, default rent |
  | `property_description` | optional |
  | `terms_agreement` | must be true; links to `/policies/terms-of-service` and `/policies/privacy-policy` |

- **Behaviour:** on success it shows a success screen with "Back to home" and "Post another". A 401 shows "Please log in to post a property listing"; there's no redirect to login and no login gate before submit. No image upload.
- **Backend validation the form doesn't enforce** (`schemas/property.py:26, 216-229`):
  - A rent (or pg/flatmate) listing with no budget sends no `monthly_rent`, so the backend returns 422 ("monthly_rent must be a positive number…"). Rent is the default, so this happens often.
  - pg or flatmate with buy or short_stay returns 422 ("PG and flatmate listings must use purpose 'rent'").
- **SEO:** "Post a Property | 360Ghar", canonical `/post-property`, **noindex**.

---

## 8. `/map-location` — `pages/MapLocation.jsx` → `components/layout/MapLocationSection.jsx`

- **API calls:**
  - `GET /properties?lat=&lng=&radius=&sort_by=` merged with store filters, via `propertyStore.fetchProperties` (no auth). It fires on changes to location, radius or sort; with no location it sends only `sort_by`. Backend `properties.py:295`.
  - Cursor "Load More Properties" appends. Cards can `POST /swipes`.
- **Sort mismatch:** the sort select offers `newest`, `price_asc`, `price_desc`, `distance`. The backend `SortBy` enum (`schemas/property.py:538`) only has `distance`, `price_low`, `price_high`, `newest`, `popular` and `relevance`, so the two price sorts return 422.
- **Filters not wired:** `PropertyQuickFilters` (BHK 1/2/3/4+; budget Under 20L / 20L–50L / 50L–1Cr / Above 1Cr; type house/apt/pg/commercial; clear) and the collapsible full `PropertyFilters` update the store but don't trigger this page's fetch. Only the location, radius and sort changes do. PropertyFilters' Search calls `applyFilters`, which fetches without the map lat/lng.
- **Map:**
  - Google Maps JS via `@googlemaps/js-api-loader`, key `VITE_GOOGLE_PLACES_API_KEY` or `VITE_GOOGLE_MAPS_API_KEY`; `importLibrary` for maps, marker and core.
  - Legacy `google.maps.Marker` with red/blue dot icons loaded over **http**.
  - A radius `Circle`, fit-bounds to markers (which use `latitude`/`longitude`), and click-to-select with zoom 15.
  - Hover or click on a card highlights its marker.
- **Controls:** MapControls (map type roadmap/satellite/hybrid, reset zoom, my location), RadiusSlider (1–50 km, step 1), current-location card with "Use current location", selected-property card, Places search, grid-1/grid-2 view toggle, group-by-city toggle, and an empty state with a clear-all button.
- **SEO:** "Properties on Map | Find Real Estate Near You | 360Ghar", keywords set, canonical `/map-location`, **noindex**.

---

## 9. `/project` — `pages/projects/Project.jsx` → `components/project/ProjectSection.jsx`

- **API calls:** none. Fully static.
- **Data:** `data/OthersPageData.jsx` `projectItems`, 8 entries of `{id, slug, thumb, title, desc}`. It's mirrored in `data/projectCatalog.js`, which `scripts/lib/projectEntries.mjs` uses for `sitemap-projects.xml`.
- **Features:** a grid of image cards linking to `/project/{slug}`, passing router state `{id, title, thumb, desc}`.
- **SEO:** "Real Estate Projects in Gurugram | 360Ghar". **Canonical is `/projects`, which isn't a route**; the real path is `/project`. No page JSON-LD.

## 10. `/project/:title` — `pages/projects/ProjectDetails.jsx` → `components/project/ProjectDetailsSection.jsx`

- **API calls:** none.
- **Slug handling:** `:title` is matched exactly against `projectItems[].slug`, which are hand-written kebab-case strings such as `luxury-apartments-in-sector-62`. There's a `convertToSlug` fallback (lowercase, spaces → `-`) used only when building links. No id in the URL and no legacy formats; an unknown slug shows "Project Not Found" and sets noindex.
- **Features:** hero image, title, description split into two paragraphs, placeholder "Project Challenges" lorem ipsum, `challengeLists`, sidebar (`projectSidebarLists`: client, amount, category, plus City=Gurugram and today's date), and social links (`CommonData.socialLists`).
- **SEO:**
  - Title `{title} in Gurugram | 360Ghar`; description = desc; keywords "`{title} Gurugram`, real estate project, floor plans, amenities".
  - Canonical `/project/{slug}`.
  - JSON-LD: a BreadcrumbList whose middle item points to `/project`.

---

## Backend gaps (frontend call or field with no or mismatched backend support)

1. **`POST /api/reviews` has no handler.** `CustomerReviews.jsx:82` fetches `https://360ghar.com/api/reviews`, which `public/_redirects` proxies to `/api/v1/reviews`. A grep of `app/api` finds no reviews route, only `POST /bookings/review` (`bookings.py:332`). The home review form always fails with "Could not submit review".
2. **`sort_by=price_asc` / `price_desc` are invalid.** Sent from `MapLocationSection.jsx` (sort select). The backend `SortBy` enum at `schemas/property.py:538` only allows `price_low`/`price_high`, so `GET /properties` returns 422.
3. **Zoning field names don't match.** `ZoneInfoCard.jsx` reads `zone.far` and `zone.ground_coverage_pct`. `ZoningDataResponse` defines `Field(alias="far_limit")` and `Field(alias="max_coverage_pct")` (`schemas/data_hub.py:195,198`), and FastAPI serializes by alias by default, so those two fields render blank.
4. **Auth-aware fields are never returned.** Property detail, list and recommendations all use `publicApi` (no token), while `properties.py:295/382/437` use `get_current_user_optional`. So `liked`, `user_has_scheduled_visit`, `user_next_visit_date`, `compatibility_score`, personalized recommendations and `exclude_swiped` never come back.
5. **Property fields the frontend reads but the backend doesn't have** (vs `schemas/property.py:370-498`): `is_liked` (backend `liked`), `is_verified`, `rera_number`, `bhk`, `sector`, `tour_url`, `video_url` (backend `video_tour_url`/`video_urls`), `lat`/`lng` (backend `latitude`/`longitude`), `price_type`, `furnishing` (backend `furnishing_level`). Amenities come back as `{id, title, icon, category}` (`schemas/amenity.py:66`) but are read as `key`/`name`/`label`.
6. **Furnishing is sent the wrong way.** `PropertyFilters` sends Furnished / Semi-Furnished / Unfurnished as `features[]`, which the backend matches as JSONB keys. The backend has a dedicated `furnishing[]` param (values `furnished` / `semi_furnished` / `unfurnished`, `properties.py:126`) that is never used.
7. **Post-property payload can fail validation.** `POST /properties` returns 422 for a rent/PG/flatmate listing with no budget (no `monthly_rent`; `schemas/property.py:216-229`), and for PG/flatmate with a non-rent purpose (`:26-28`). The form lets both through, and rent is the default.
8. **Callback requests are stored as visits.** The callback modal calls `POST /visits` with a naive "tomorrow" timestamp and packs the phone and preferred time into `special_requirements`. There is no lead or callback endpoint (`visits.py:41` only accepts `VisitCreate`).
9. **Unbounded numeric inputs can 422.** Free inputs for `bathrooms_max`, `area_max` and `floor_number_max` have backend limits (le 10 / 100000 / 100, `properties.py:115-146`) that the UI doesn't enforce.
10. **Frontend-only dead links.** `/compare?ids=` (compare tray) and `/property` ("Back to listings") aren't routes and fall through to `/:citySlug` (CityHub). The `/project` canonical is `/projects`, which also isn't a route.
11. **Unused backend capabilities worth using in a rebuild:**
    - `GET /amenities` (`amenities.py:21`) — the frontend hardcodes its amenity lists.
    - The upload endpoints (`upload.py:64/91/119/209`) — no listing flow uploads images.
    - `GET /public/tours/{id}` (`public.py:177`) — the in-house 360° tour API; the frontend only iframes `virtual_tour_url`.
    - `semantic_search` and `GET /properties/semantic-search` (`properties.py:347`).