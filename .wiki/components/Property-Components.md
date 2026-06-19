# Property Components

The `src/components/property/` and `src/components/property-filters/` directories contain the components that power property listings, detail pages, and the filter experience. Together they compose the three property-facing routes: the grid listing (`/properties`), the sidebar listing (`/property-sidebar`), and the detail page (`/property/:id`). A shared `PropertyItem` card is the atomic unit reused by the home page, locality templates, map search, and listing pages.

> Note: the legacy spec referenced `PropertyList`, `PropertyDetails`, and `PropertyFilter` files. Those names do not exist in the current codebase; the equivalent responsibilities live in `PropertyPageSection`, `PropertyDetailsSection`, and `PropertyFilters` respectively.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/property/PropertyItem.jsx` | Atomic property card with share modal, compare, trust badges |
| `src/components/property/Property.jsx` | Home-page "Latest property" section, reads store recommendations |
| `src/components/property/PropertyTwo.jsx` | Tabbed property grid used by locality templates |
| `src/components/property/PropertyPageSection.jsx` | Full `/properties` listing page with SWR, drawer filters, compare tray |
| `src/components/property/PropertySidebarSection.jsx` | `/property-sidebar` listing with `SearchSidebar` |
| `src/components/property/PropertyDetailsSection.jsx` | `/property/:id` detail page (1300+ lines): media tabs, lightbox, VR, visit scheduling |
| `src/components/property/PropertyActions.jsx` | Like / share / print toolbar for detail page |
| `src/components/property/PropertyQuickFilters.jsx` | Quick-filter chips on the map page |
| `src/components/property/PropertyListControls.jsx` | List/grid and sort controls |
| `src/components/property/FloorPlan.jsx` | Static floor-plan section with tabs (marketing) |
| `src/components/property/ListingPropertyInformation.jsx` | Static "Details Information" form card for the legacy add-listing wizard |
| `src/components/property/LazyVRPlayer.jsx` | Lazy-loaded 360° VR tour player |
| `src/components/property-filters/PropertyFilters.jsx` | Full filter panel with saved searches, chips, mobile drawer mode |
| `src/components/property-filters/AdvancedPropertyFilter.jsx` | Formik-powered advanced search form for landing pages |
| `src/components/property-filters/PropertyFilterBottom.jsx` | Results count, sort dropdown, list/grid toggle |
| `src/components/property-filters/PropertyTopBar.jsx` | Top search bar with recent searches and Places autocomplete |

## PropertyItem — the atomic card

`PropertyItem.jsx` is the most reused component in the property domain. It accepts a `property` object plus styling props (`itemClass`, `btnClass`, `badgeText`, `badgeClass`, `iconsClass`, `btnRenderBottom`, `btnRenderRight`, `showFeatureBadges`) so the same card can render in compact, shaped, or full layouts. Responsibilities:

- Generates descriptive `alt` text from BHK, type, purpose, locality, and furnishing via `getPropertyTypeLabel` / `getListingLabel` from `src/utils/propertyTaxonomy`.
- Falls back to `property-1.webp` when the image URL is empty or a Kuula VR link.
- Renders a `ShareModal` with copy-link and native `navigator.share` support, using `react-toastify` for confirmation.
- Integrates with `usePropertyStore` (swipe/like), `useAuthStore`, and `useCompareStore`.

`PropertyItem` is consumed by `Property`, `PropertyTwo`, `PropertyPageSection`, `PropertySidebarSection`, `PropertyDetailsSection` (related listings), `MapLocationSection`, and `LocalityTemplate`.

## Listing Sections

### Property (home)
`Property.jsx` reads `recommendations` from `usePropertyStore` (or accepts `properties` / `loading` props to override). It shows up to six `PropertyItem` cards in a 3-column grid with loading skeletons, an error state, and an empty state. A "Sell All Listing" `Button` links to `/properties`.

### PropertyTwo (tabbed)
`PropertyTwo.jsx` is a highly configurable section used by `src/pages/localities/LocalityTemplate.jsx`. Props control `sectionClass`, `containerClass`, heading copy, `showTabs`, `maxItems`, grid item class, and the `PropertyItem` style class. It uses `react-tabs` with `propertyTwoTabs` from `HomeThreeData`; each tab panel renders the same recommendation list (the tabs are presentational). Loading and error states mirror `Property`.

### PropertyPageSection (full listing)
`PropertyPageSection.jsx` is the `/properties` page body (~560 lines). It wires together:

- `useSWR` for data fetching with `propertyAPIService` and `parsePropertySearchParams`.
- `PropertyTopBar` (search + recent searches), `PropertyFilters` (in a focus-trapped drawer), `PropertyFilterBottom` (sort + list/grid).
- `Pagination` from `src/common/ui/Pagination`.
- A comparison tray from `useCompareStore` (`compareList`, `isCompareOpen`, `removeCompare`, `clearCompare`, `closeCompare`).
- Body-scroll locking and a Tab-key trap while the filter drawer is open; `Escape` closes it and restores focus to the trigger.
- `viewMode` read from the `view` search param (`list` or `grid`).

### PropertySidebarSection
`PropertySidebarSection.jsx` renders the `/property-sidebar` layout: a `PropertyFilterBottom` header, then a two-column row with the `SearchSidebar` + `LocationSearchInput` on the left and the property grid on the right. It pushes filters into the global `usePropertyStore` so they persist across the main listing and sidebar pages, and fetches with `lat` / `lng` / `radius: 10` / `sort_by: 'distance'` from `useLocationStore`.

## Detail Page

`PropertyDetailsSection.jsx` is the largest component in the repo (~1300 lines). It renders `/property/:id` and includes:

- **Media tabs** (Photos / 360° Tour / Video) with `getMediaTabDefault` selecting the initial tab based on available media. `parseVideoUrl` handles YouTube, Vimeo, native mp4/webm, and generic iframes.
- **Lightbox** via `yet-another-react-lightbox` with `Zoom` and `Thumbnails` plugins.
- **VR tours** through `LazyVRPlayer` (lazy-loaded).
- **Visit scheduling** via `useVisitStore` and `localInputToServerTimestamp`.
- **PropertyActions** toolbar (like, share dropdown, print).
- **Related listings** using `PropertyItem`.
- `WhatsAppButton`, `CommonSidebar`, `LoadingSkeleton`, `LazyImage`.
- `hapticLight` / `hapticSuccess` from `src/utils/hapticFeedback` for mobile feedback.
- Currency formatting (`₹` with `en-IN` locale) and date formatting helpers.

### PropertyActions
`PropertyActions.jsx` is the toolbar embedded in the detail page. It accepts `property`, `onLikeToggle`, `isLiked`, `likeLoading`. Share options: WhatsApp (with UTM params), Facebook, Twitter, copy link. A print button calls `window.print()`. The share dropdown closes on outside-click (`mousedown`) and `Escape`.

### FloorPlan
`FloorPlan.jsx` is a **static marketing** section (not the dynamic floor-plan designer). It uses `react-tabs` with `floorTabLists` / `floorTabPanels` from `HomeTwoData` to show a fixed floor-plan image and tabbed specs. It is unrelated to the `/design-blueprint` 3D tool.

### ListingPropertyInformation
`ListingPropertyInformation.jsx` is a static "Details Information" card (Property Id, Area Size, Bedrooms, Bathrooms, Garages, Year Build, Amenities checkboxes from `addAmenities` in `OthersPageData`). It is composed into the legacy `AddListingForm` alongside the `src/common/listing/` sections.

## Filter Components

### PropertyFilters
`PropertyFilters.jsx` (~968 lines) is the primary filter panel. Props: `showAdvanced`, `isMobile`, `onCloseDrawer`. It binds to `usePropertyStore` (`filters`, `updateFilter`, `clearFilters`, `applyFilters`, `setFilters`, `filtersChanged`, `getActiveFiltersCount`) and `useLocationStore` (`setLocation`). Features:

- Purpose, property type, price, bedrooms, bathrooms, area, amenities, features, parking, floor, age, gender preference, sharing type, short-stay filters.
- Filter chips with per-chip remove animation (`removingChip` state).
- **Saved searches** persisted to `localStorage` under `property_saved_searches` (no auth required).
- Toast notifications for filter actions.
- Taxonomy helpers from `src/utils/propertyTaxonomy` (`COMMERCIAL_PROPERTY_TYPES`, `PROPERTY_TYPE_FILTER_OPTIONS`, `PURPOSE_OPTIONS`, `SHARING_TYPE_OPTIONS`, `includesPgOrFlatmateType`, `isCommercialSelection`).

### AdvancedPropertyFilter
`AdvancedPropertyFilter.jsx` is a Formik + Yup form used on programmatic SEO landing pages. It collects the full filter set (keyword, purpose, types, location, price, rooms, area, amenities, features, parking, floor, age, gender, sharing, short-stay dates) and navigates to `/properties?...` via `buildPropertySearchQuery` from `src/utils/propertyFilters`. It embeds `GooglePlacesInput` for location.

### PropertyFilterBottom
`PropertyFilterBottom.jsx` is the results header. Props: `total`, `currentPage`, `viewMode`, `onViewModeChange`. It shows "Showing X–Y of Z properties", a sort `<select>` (`newest`, `distance`, `price_low`, `price_high`, `popular`, `relevance`), and `ListGridButtons`. Sort changes call `updateFilter('sort_by', ...)` + `applyFilters()` and update the URL via `useI18nNavigate`.

### PropertyTopBar
`PropertyTopBar.jsx` is the top search bar on the listing page. It maintains recent searches in `localStorage`, shows a suggestion dropdown, and embeds `GooglePlacesInput`. Click-outside and Escape close the suggestions.

## How They Compose

```
PropertyPageSection
├── PropertyTopBar (search)
├── PropertyFilters (drawer, focus-trapped)
├── PropertyFilterBottom (sort + view toggle)
├── PropertyItem[] (grid or list)
├── Pagination
└── CompareTray (useCompareStore)

PropertySidebarSection
├── PropertyFilterBottom
├── SearchSidebar + LocationSearchInput
└── PropertyItem[]

PropertyDetailsSection
├── MediaTabs (Photos / VR / Video)
├── Lightbox (yet-another-react-lightbox)
├── LazyVRPlayer
├── PropertyActions
├── CommonSidebar
└── PropertyItem[] (related)
```

## Cross-Links

- [Property Pages](../pages/Property-Pages) for the route-level wrappers (`Property.jsx`, `PropertySidebar.jsx`, `PropertyDetails.jsx`).
- [Property Search](../features/Property-Search) for the store, service, and filter utilities.
- [Maps & Places](../features/Maps-Places) for `GooglePlacesInput` and the map listing page.
- [UI Components](UI-Components) for `LoadingSkeleton`, `WhatsAppButton`, `TrustBadge`.
