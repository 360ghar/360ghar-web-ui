# Property Search

Property search is 360Ghar's core flow. The public search API is unauthenticated so anonymous users (and crawlers) can browse listings, while authenticated users get additional swipe, like, and visit-scheduling features layered on top. The full filter vocabulary (31 fields) is shared between the URL query string, the filter UI, and the API request.

## Key Files

| File | Role |
|------|------|
| `src/services/propertyAPIService.js` | Public search API (no auth) |
| `src/services/propertyService.js` | Authenticated property CRUD |
| `src/services/swipeService.js` | Swipe actions (auth) |
| `src/store/propertyStore.js` | Search state, filters, pagination, swipes |
| `src/utils/propertyFilters.js` | `DEFAULT_PROPERTY_FILTERS`, `buildPropertySearchParams`, `cleanPropertyFilters`, `parsePropertySearchParams` |
| `src/utils/propertyTaxonomy.js` | Property type normalization |
| `src/components/property-filters/PropertyFilters.jsx` | Main filter sidebar |
| `src/components/property-filters/AdvancedPropertyFilter.jsx` | Advanced filter panel |
| `src/components/property-filters/PropertyFilterBottom.jsx` | Bottom filter bar (mobile) |
| `src/components/property-filters/PropertyTopBar.jsx` | Top search bar |
| `src/pages/properties/Property.jsx` | Listings page |
| `src/pages/properties/PropertySidebar.jsx` | Sidebar listings layout |
| `src/pages/properties/PropertyDetails.jsx` | Detail page |
| `src/pages/MapLocation.jsx` | Map-based search |
| `src/components/layout/MapLocationSection.jsx` | Map section |

## Public Search API (`propertyAPIService.js`)

Uses `publicApi` (no `Authorization` header) so the same endpoints serve anonymous browsing and prerendered pages.

| Method | Endpoint |
|--------|----------|
| `searchProperties(filters, page, limit)` | `GET /properties/?...` |
| `getPropertyById(propertyId)` | `GET /properties/{id}` |
| `getRecommendations(limit)` | `GET /properties/recommendations/?limit=` |

Search params are built by `buildPropertySearchParams(filters, page, limit)` in `src/utils/propertyFilters.js`:

1. `cleanPropertyFilters()` drops `null` / `undefined` / `''` and empty arrays, and runs `normalizePropertySearchFilters()` from `propertyTaxonomy.js`.
2. `setIfPresent()` writes scalar fields; `appendArray()` repeats array fields (`property_type`, `amenities`, `features`).
3. `page` and `limit` are always set.

## The 31 Filter Fields

Defined in `DEFAULT_PROPERTY_FILTERS`:

| Group | Fields |
|-------|--------|
| Text / type | `q`, `property_type[]`, `purpose` |
| Price | `price_min`, `price_max` |
| Rooms | `bedrooms_min`, `bedrooms_max`, `bathrooms_min`, `bathrooms_max` |
| Area | `area_min`, `area_max` |
| Location | `city`, `locality`, `pincode`, `lat`, `lng`, `radius` |
| Features | `amenities[]`, `features[]`, `parking_spaces_min` |
| Building | `floor_number_min`, `floor_number_max`, `age_max` |
| Short stay / PG | `check_in`, `check_out`, `guests`, `gender_preference`, `sharing_type` |
| Sorting / paging | `sort_by`, `page`, `limit` |

`PROPERTY_FILTER_NUMBER_KEYS` lists which keys are parsed as numbers by `parsePropertySearchParams()` (used when hydrating filters from a URL).

## URL <-> State Sync

`parsePropertySearchParams(searchParams)` reads a `URLSearchParams` back into the filter object, parsing number keys and collecting array keys (`property_type`, `amenities`, `features`) via `getAll()`. This lets deep links, browser back/forward, and the [programmatic landing pages](../features/SEO-Programmatic) all drive the same store.

## Store (`propertyStore.js`)

See [State Management](../state/State-Management) for the full action list. Search-specific behavior:

- `fetchProperties(overrideFilters, page, limit)` merges overrides into `state.filters`, cleans them, calls `propertyAPIService.searchProperties`, and normalizes the response (`properties` or `items`, `total_pages` or `totalPages`).
- `filtersChanged` is set `true` by any filter mutation and `false` after a successful fetch, so the UI can show an "Apply" badge.
- `getActiveFiltersCount()` counts non-empty filter groups for the badge.
- `setPagination(p)` lets SWR-driven components sync pagination back into the store (audit fix 2.5).

## Swipes

Swipes are an authenticated layer over the public search results. `swipeService`:

| Method | Endpoint |
|--------|----------|
| `recordSwipe({ property_id, is_liked })` | `POST /swipes/` |
| `getSwipes(params)` | `GET /swipes/` |
| `undoLast()` | `DELETE /swipes/undo` |
| `toggle(swipeId)` | `PUT /swipes/{id}/toggle` |
| `stats()` | `GET /swipes/stats` |

`recordSwipe` performs an **optimistic** update: it immediately flips `is_liked` on the property in `properties`, `currentProperty`, etc., then fires the API call. `isSwipeLoading` is used (not `isLoading`) so a slow swipe never blocks the page.

`fetchLikedProperties()` filters swipes by `is_liked: true` to populate the favorites tab.

## Recommendations

`fetchRecommendations(limit = 6)` calls `GET /properties/recommendations/?limit=` and stores the result in `recommendations` for the homepage carousel.

## Map-Based Search

`/map-location` renders `MapLocationSection`, which combines [Google Maps](../features/Maps-Places) with the same `propertyAPIService.searchProperties` call, passing `lat`, `lng`, and `radius`. The page is `noindex` (it's an interactive tool, not a crawlable result page).

`LocationSearchInput` (`src/common/search/LocationSearchInput.jsx`) wires `GooglePlacesInput` to `locationStore.setLocation()` and navigates to `/properties?lat=...&lng=...&radius=...&sort_by=distance`, so a Places selection becomes a geo-filtered search.

## Filter UI Components

| Component | Purpose |
|-----------|---------|
| `PropertyFilters.jsx` | Full sidebar: location, type, price slider, rooms, area, amenities, features, sorting |
| `AdvancedPropertyFilter.jsx` | Advanced panel: floor number, age, parking, PG-specific fields |
| `PropertyFilterBottom.jsx` | Sticky bottom bar for mobile filter toggling |
| `PropertyTopBar.jsx` | Top search bar with text query and view toggle |

All filter components read from and write to `propertyStore` via `updateFilter(key, value)` / `setFilters()`, then call `applyFilters()` to trigger a search.

## Cross-References

- [API Layer](../services/API-Layer) - service signatures and error handling
- [State Management](../state/State-Management) - propertyStore internals
- [Maps & Places](../features/Maps-Places) - geo search integration
- [SEO & Programmatic](../features/SEO-Programmatic) - landing pages that pre-fill filters
