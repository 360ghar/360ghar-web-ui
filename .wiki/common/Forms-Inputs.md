# Forms & Inputs

The `src/common/` directory hosts the shared form and input components reused across the 360Ghar frontend: search boxes, Google Places autocomplete, location search, property filter panels, range sliders, newsletter forms, image upload, FAQ accordion, and the multi-step listing form sections. These primitives feed into the property search experience, the add-listing wizard, the home-page hero filter, and the contact/quote forms.

## Key Files

| File | Purpose |
|------|---------|
| `src/common/search/SearchBox.jsx` | Dual-mode search (general + location) with recent searches |
| `src/common/search/GooglePlacesInput.jsx` | Google Places autocomplete input (singleton loader) |
| `src/common/search/LocationSearchInput.jsx` | Places input + radius selector, navigates to `/properties` |
| `src/common/search/SearchSidebar.jsx` | Sidebar search panel for the sidebar listing |
| `src/common/forms/Filter.jsx` | Toggle between `PropertyFilters` and `AdvancedPropertyFilter` |
| `src/common/forms/SimplifiedFilter.jsx` | Lightweight filter for home/landing heroes |
| `src/common/forms/TabFilter.jsx` | Rent/Buy/Sell tabbed filter wrapping `SimplifiedFilter` |
| `src/common/forms/CustomRangeSlider.jsx` | Dual-thumb range slider |
| `src/common/forms/NewsletterForm.jsx` | Formspree newsletter signup |
| `src/common/forms/ImageUpload.jsx` | Multi-file image uploader with previews |
| `src/common/FaqAccordion.jsx` | Controlled FAQ accordion (uses `ui/FaqItem`) |
| `src/common/listing/ListingBasicInformation.jsx` | Step 1 of add-listing (title, description, status) |
| `src/common/listing/ListingPropertyGallery.jsx` | Step 2 of add-listing (wraps `ImageUpload`) |
| `src/common/listing/ListingContactDetails.jsx` | Step 3 of add-listing (name, email) |
| `src/common/listing/ListGridButtons.jsx` | List/grid view toggle |
| `src/common/listing/ListingSidebar.jsx` | Scrollspy sidebar for the add-listing page |
| `src/common/listing/CommonSidebar.jsx` | Generic sidebar for blog/detail pages |

## Search Components (`src/common/search/`)

### SearchBox
`SearchBox.jsx` (~384 lines) is the primary search component, mounted in the off-canvas panel and elsewhere. It uses Formik and supports two modes (`general` and `location`). Features:

- General mode: keyword + purpose + property type (filtered to `apartment`, `house`, `pg`, `commercial` from `PROPERTY_TYPE_FILTER_OPTIONS`).
- Location mode: embeds `GooglePlacesInput`.
- **Recent searches** persisted to `localStorage` under `360ghar:recentSearches` (max 8), surfaced as debounced autocomplete suggestions (audit 5.5 / imp 5.2).
- Binds to `useLocationStore` and navigates to `/properties?...` via `useI18nNavigate` using `buildPropertySearchQuery` from `src/utils/propertyFilters`.

### GooglePlacesInput
`GooglePlacesInput.jsx` wraps the Google Maps JS API Places autocomplete. Props: `placeholder`, `onSelect`, `className`, `restrictCountry` (default `'in'`), `types`. Implementation notes:

- **Singleton loader** — `loaderSingleton` caches the `@googlemaps/js-api-loader` `Loader` and a single `loadPromise`, so the Places library is fetched once per page lifecycle.
- Reads `VITE_GOOGLE_PLACES_API_KEY` from env; logs an error if missing.
- Shows a loading indicator while the Places library is fetched (audit 5.8).
- `onSelect` is kept in a ref so the autocomplete listener always calls the latest callback.
- Returns `{lat, lng, name, ...place}` to the parent.

See [Maps & Places](../features/Maps-Places) for the broader Google Maps integration.

### LocationSearchInput
`LocationSearchInput.jsx` composes `GooglePlacesInput` with a radius `<select>` (5/10/20/50/100 km, default 20). On select it writes the location to `useLocationStore` and navigates to `/properties?lat=...&lng=...&radius=...&sort_by=distance`. It shows a "Searching around: {name} (within {radius}km)" hint.

### SearchSidebar
`SearchSidebar.jsx` is the sidebar search panel used by `PropertySidebarSection`.

## Filter Components (`src/common/forms/`)

### Filter
`Filter.jsx` is a thin wrapper with a toggle button that switches between `PropertyFilters` (modern) and `AdvancedPropertyFilter` (legacy/Formik). It accepts `colClass` and `buttonText` props.

### SimplifiedFilter
`SimplifiedFilter.jsx` is the lightweight filter used inside `TabFilter` on home and landing heroes. Props: `buttonText` (default `'Search'`). It binds to `usePropertyStore` (`filters`, `updateFilter`, `clearFilters`, `isLoading`) and `useLocationStore`. On location select it updates both the location store and the filter's `lat`/`lng`. On search it builds a URL via `buildPropertySearchQuery` and navigates to `/properties`.

### TabFilter
`TabFilter.jsx` wraps `SimplifiedFilter` in `react-tabs` using `filterTabs` from `HomeOneData` (Rent / Buy / Sell). `onTabSelect` maps the index to a `purpose` (`rent`, `buy`, or cleared for `sell`) and calls `updateFilter('purpose', ...)` on `usePropertyStore`. Each tab panel renders a `SimplifiedFilter` with contextual button text. Used by the home `Banner` variants.

### CustomRangeSlider
`CustomRangeSlider.jsx` is a dual-thumb range slider. Props: `min`, `max`, `onChange` (all required, PropTypes-validated). Two `<input type="range">` elements overlap; their widths are computed from percentages via `getPercent`. The `onChange` callback receives `{ min, max }`. The left thumb cannot exceed `maxVal - 1` and the right cannot go below `minVal + 1`. Used for price and area filters.

### NewsletterForm
`NewsletterForm.jsx` is a Formspree form (`useForm("mkgzdjyj")`) with an email input, envelope icon, and subscribe button. Props: `formClass`, `inputClass`, `iconClass`. On success it renders a translated confirmation (audit 5.9). `ValidationError` displays inline. Reused by `Cta` and `Newsletter` UI components.

### ImageUpload
`ImageUpload.jsx` is a multi-file image uploader. It maintains an array of `File` objects in state, renders object-URL previews via `LazyImage`, and allows per-image removal. The empty state shows a drag-and-drop prompt. Used by `ListingPropertyGallery`.

## FaqAccordion

`FaqAccordion.jsx` is a controlled accordion. It accepts `accordionClass` and `itemClass` props, holds `activeAccordion` state, and renders `FaqItem` (from `src/components/ui/FaqItem.jsx`) per entry in `faqs` from `HomeThreeData`. `handleAccordionClick` toggles the active id. Used by `Faq` and `FaqTwo` layout components.

## Listing Form Sections (`src/common/listing/`)

These power the legacy add-listing wizard composed by `src/components/forms/AddListingForm.jsx`:

- **`ListingBasicInformation.jsx`** — "Property Basic Information" card: title, description, status (For Rent / For Sell), and additional fields.
- **`ListingPropertyGallery.jsx`** — "Property Gallery" card wrapping `ImageUpload`.
- **`ListingContactDetails.jsx`** — "Property Contact Details" card: name, email, phone.
- **`ListingSidebar.jsx`** — scrollspy sidebar that highlights the active section (`basicInformation`, `propertyGallery`, `propertyContactDetails`, etc.) based on scroll position (160px offset) or `window.location.hash`. Reads `addListings` from `OthersPageData`.
- **`ListGridButtons.jsx`** — accessible list/grid view toggle. Props: `viewMode` (`'grid'` default), `onViewModeChange`, `className`. Buttons have `aria-label`, `aria-pressed`, and `aria-hidden` icons. Used by `PropertyFilterBottom`.
- **`CommonSidebar.jsx`** — generic sidebar used by blog and detail pages (recent posts, categories, etc.).

> Note: the task spec mentioned "checkout legacy components" in `src/common/`. No checkout/cart components exist under `src/common/` in the current codebase; the legacy e-commerce placeholders live under `src/pages/unused/` (`Cart.jsx`, `Checkout.jsx`) and are not wired into any route.

## Cross-Links

- [Maps & Places](../features/Maps-Places) for the Google Maps/Places integration powering `GooglePlacesInput`.
- [Property Components](../components/Property-Components) for `PropertyFilters`, `AdvancedPropertyFilter`, and the listing pages that consume these inputs.
- [Property Search](../features/Property-Search) for `buildPropertySearchQuery` and the filter utilities.
- [UI Components](../components/UI-Components) for `FaqItem`, `Cta`, `Newsletter` which consume `NewsletterForm`.
- [Layout Components](../components/Layout-Components) for `ValidationForm` and the contact/quote sections.
