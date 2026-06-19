# Property Pages

Property pages are the core marketplace surface of 360Ghar: listings, filters, the detail page, and the listing wizards. They live in `src/pages/properties/` and lean heavily on `usePropertyStore` (the largest Zustand store) and the public `propertyAPIService` for search. Listings are filterable by 31 fields, paginated, and rendered as cards composed from `src/components/property/`.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/properties` | `src/pages/properties/Property.jsx` | Listings with filters, pagination, popular searches |
| `/property-sidebar` | `src/pages/properties/PropertySidebar.jsx` | Sidebar layout variant (noindex) |
| `/property/:id` | `src/pages/properties/PropertyDetails.jsx` | Property detail page (dynamic) |
| `/property/:id/virtual-tour` | `src/pages/properties/VirtualTourPage.jsx` | 360° virtual tour viewer |
| `/add-new-listing` | `src/pages/properties/AddListing.jsx` | Listing wizard (noindex) |
| `/post-property` | `src/pages/properties/PostProperty.jsx` | Single-page property posting form |
| `/map-location` | `src/pages/MapLocation.jsx` | Map-based property search |

## Page Details

### Property (`/properties`)

The main listings page. Renders a hero with popular search chips (rent/buy flats in Gurugram, PG, localities) that link into the programmatic landing routes, then mounts `PropertyPageSection` from `src/components/property/`. SEO includes `RealEstateListing` and `BreadcrumbList` structured data, plus `prev`/`next` pagination links derived from `usePropertyStore.pagination` and the `page` query param. Canonical is `/properties` for page 1 and `/properties?page=N` for later pages. Locale-aware: paths under `/hi/properties` render the Hindi variant.

### PropertySidebar (`/property-sidebar`)

An alternative sidebar layout that mounts `PropertySidebarSection`. Marked `noindex` because it is a UX variant of `/properties`, not a canonical surface.

### PropertyDetails (`/property/:id`)

The most complex property page. Reads `id` from `useParams`, calls `usePropertyStore.fetchPropertyById(id)`, and renders `PropertyDetailsSection`. Enriches the page with data-hub widgets: `ReraVerifiedBadge`, `NeighbourhoodScorePanel`, `ZoneInfoCard`, and `CircleRateBanner` from `src/components/data-hub/`. Generates rich structured data:

- `Accommodation` / `SingleFamilyResidence` schema via `getAccommodationSchemaType`
- `Offer` / `Demand` listing schema via `getListingSchemaType`
- `VideoObject` for the 360° tour
- `BreadcrumbList`
- EEA signals via `generateEeaSignals`

Price logic picks `monthly_rent` / `daily_rate` / `base_price` based on `purpose`. BHK label falls back to `bedrooms` when `bhk` is absent. All taxonomy labels come from `src/utils/propertyTaxonomy`.

### VirtualTourPage (`/property/:id/virtual-tour`)

Dedicated full-screen 360° virtual tour viewer for a property. Has a colocated `VirtualTourPage.test.jsx`.

### AddListing (`/add-new-listing`)

The multi-step listing wizard. Mounts `AddListingSection` from `src/components/forms/`. Marked `noindex` because it is an authenticated user flow, not a discoverable content page. CTA button in the header links back to itself.

### PostProperty (`/post-property`)

A single-page Formik + Yup form for posting a property. Uses `PROPERTY_TYPE_OPTIONS` from `src/utils/propertyTaxonomy`, `GooglePlacesInput` for address, and `propertyService` (authenticated) for submission. Includes toast notifications and a success state. This is the form linked from most "Post Property" header buttons.

## Filter System

`usePropertyStore` holds 31 filter fields: location (`lat`, `lng`, `radius`, `city`, `locality`, `pincode`), text search (`q`), property (`purpose`, `property_type[]`), price (`price_min`, `price_max`), rooms, area, features, amenities, building, short-stay, and sorting. Actions: `setFilters`, `updateFilter`, `clearFilters`, `applyFilters`, `getActiveFiltersCount`. The filter UI lives in `src/components/property-filters/` (`PropertyFilters`, `AdvancedPropertyFilter`, `PropertyFilterBottom`). See [Property Components](../components/Property-Components) and [Property Search](../features/Property-Search).

## Property Cards and Media

- `PropertyItem.jsx` and `PropertyTwo.jsx` render listing cards.
- `PropertyList.jsx` is the list container.
- Media gallery uses `yet-another-react-lightbox` and `mediaService` for fetching/uploading.
- Swipe integration: `swipeService` records likes via `recordSwipe`, surfaced in the account favorites tab.

## SEO and Indexation

Listings pages emit `RealEstateListing` and pagination tags. Detail pages emit the full accommodation/listing/video schema. The sidebar and listing-wizard pages are `noindex` to keep the canonical index clean. See [SEO & Programmatic](../features/SEO-Programmatic) for how programmatic landing pages funnel into `/properties`.

For the components these pages compose, see [Property Components](../components/Property-Components). For the search and filter behavior, see [Property Search](../features/Property-Search).
