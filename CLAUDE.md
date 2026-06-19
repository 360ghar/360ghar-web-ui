# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Vite
- `npm run build` - Build for production (runs entity ingestion + sitemap generation + Vite build)
- `npm run build:sitemaps` - Generate sitemaps manually
- `npm run lint` - Run ESLint for code linting
- `npm run preview` - Preview production build locally

## Architecture Overview

### Technology Stack
- **Framework**: React 18.2 + Vite 5.1
- **State Management**: Zustand 5.0 (primary) + React Context API (legacy UI state)
- **Routing**: React Router DOM v6.22
- **Styling**: SCSS with 7-1 architecture pattern in `public/assets/sass/`
- **Forms**: Formik 2.4 + Yup validation
- **HTTP Client**: Axios 1.9 with interceptors and retry logic
- **Notifications**: React Toastify 10.0
- **SEO**: React Helmet Async
- **Carousel/Slider**: React Slick
- **Lightbox**: Yet Another React Lightbox
- **Markdown**: React Markdown + Remark GFM
- **Maps**: Google Maps JS API Loader

### Project Structure

```
frontend/
├── src/
│   ├── pages/           # Route page components
│   ├── components/      # Feature components by domain
│   ├── common/          # Shared UI components
│   ├── services/        # API service modules
│   ├── store/           # Zustand state stores
│   ├── contextApi/      # React Context providers
│   ├── data/            # Static data by page/feature
│   ├── App.jsx          # Main app with routing
│   └── main.jsx         # Entry point with providers
├── public/
│   ├── assets/
│   │   ├── sass/        # SCSS architecture
│   │   └── images/      # Static images
│   ├── blueprint3d/     # 3D Blueprint tool assets
│   ├── data/            # Public JSON data files
│   └── sitemap*.xml     # SEO sitemaps
├── scripts/             # Build scripts (sitemap generation)
└── CLAUDE.md            # This file
```

---

## Pages (`src/pages/`)

### Page Organization
Pages are organized into subdirectories by feature domain:

#### Core Pages (`src/pages/core/`)
- `AboutUs.jsx` - Company about page
- `Contact.jsx` - Contact form page
- `FaqPage.jsx` - Frequently asked questions
- `NotFound.jsx` - 404 error page
- `Policies.jsx` - List of policy pages
- `PolicyDetails.jsx` - Individual policy page (dynamic: `/policies/:slug`)
- `GurugramGuide.jsx` - Gurugram real estate guide
- `PropertyInvestment.jsx` - Investment information page
- `ForAI.jsx` - AI assistants information page

#### Account Pages (`src/pages/account/`)
- `Login.jsx` - User login page
- `Register.jsx` - User registration page
- `Account.jsx` - User dashboard with tabs (profile, properties, favorites)
- `AccountDeletionRequest.jsx` - Account deletion request form
- `McpLogin.jsx` - MCP (Model Context Protocol) login for AI assistants

#### Property Pages (`src/pages/properties/`)
- `Property.jsx` - Property listings with filters
- `PropertySidebar.jsx` - Alternative property listing layout
- `PropertyDetails.jsx` - Individual property page (dynamic: `/property/:id`)
- `PostProperty.jsx` - Post a new property form
- `AddListing.jsx` - Add property listing wizard

#### Project Pages (`src/pages/projects/`)
- `Project.jsx` - Project listings page
- `ProjectDetails.jsx` - Individual project page (dynamic: `/project/:title`)

#### Blog Pages (`src/pages/blogs/`)
- `BlogClassic.jsx` - Blog listing page
- `BlogDetails.jsx` - Individual blog post (dynamic: `/blog/:title`)

#### Tool Pages (`src/pages/tools/`)
- `EmiCalculator.jsx` - EMI calculation tool
- `AreaConverter.jsx` - Area unit converter
- `AreaCalculator.jsx` - Area calculation tool
- `LoanEligibilityCalculator.jsx` - Loan eligibility calculator
- `CapitalGainsCalculator.jsx` - Capital gains tax calculator
- `PropertyChecklist.jsx` - Property document checklist
- `DesignBlueprint.jsx` - 3D Blueprint design tool (uses Blueprint3D)
- `VastuChecker.jsx` - AI-powered Vastu compliance checker

#### Landing Pages (`src/pages/landing/`)
- `Landing.jsx` - Programmatic SEO landing (dynamic: `/:citySlug/:intent/:type`)
- `FacetLanding.jsx` - Faceted landing pages for:
  - BHK filters: `/:citySlug/:intent/:type/:bhk`
  - Budget filters: `/:citySlug/:intent/:type/budget/:budget`
  - Amenity filters: `/:citySlug/:intent/:type/amenity/:amenity`

#### Other Pages
- `Home.jsx` - Main homepage
- `MapLocation.jsx` - Map-based property search

#### Unused Pages (`src/pages/unused/`)
Legacy pages not currently in use:
- `HomeOne.jsx`, `HomeTwo.jsx`, `HomeThree.jsx` - Alternative home designs
- `Cart.jsx`, `Checkout.jsx` - E-commerce features (placeholder)

---

## Components (`src/components/`)

### Component Organization by Domain

#### UI Components (`src/components/ui/`)
General UI elements:
- `Banner.jsx`, `BannerTwo.jsx`, `BannerThree.jsx` - Hero banners
- `Counter.jsx`, `CounterTwo.jsx`, `CounterThree.jsx`, `CounterFour.jsx` - Statistics counters
- `Testimonial.jsx`, `TestimonialThree.jsx` - Customer testimonials
- `PropertyType.jsx`, `PropertyTypeThree.jsx` - Property type cards
- `Team.jsx`, `TeamItem.jsx` - Team member cards
- `Service.jsx` - Service cards
- `Cta.jsx`, `OwnerCta.jsx` - Call-to-action sections
- `Newsletter.jsx` - Newsletter signup
- `FaqItem.jsx` - FAQ accordion item
- `VideoPopup.jsx` - Video modal popup
- `AppDownload.jsx` - Mobile app download section

#### Property Components (`src/components/property/`)
Property-related components:
- `Property.jsx`, `PropertyTwo.jsx` - Property section layouts
- `PropertyItem.jsx` - Single property card
- `PropertyList.jsx` - Property list container
- `PropertyDetails.jsx` - Property detail display
- `PropertyDetailsSection.jsx` - Full property details section
- `PropertyPageSection.jsx` - Property page layout
- `PropertySidebarSection.jsx` - Sidebar layout for properties
- `PropertyFilter.jsx` - Property filtering UI
- `PropertyActions.jsx` - Property action buttons (like, share, etc.)
- `FloorPlan.jsx` - Floor plan display
- `ListingPropertyInformation.jsx` - Listing info display

#### Property Filters (`src/components/property-filters/`)
Advanced filtering components:
- `PropertyFilters.jsx` - Main filter container
- `PropertyFilterBottom.jsx` - Bottom filter bar
- `AdvancedPropertyFilter.jsx` - Advanced filter options

#### Account Components (`src/components/account/`)
User account components:
- `AccountSection.jsx` - Account page wrapper
- `PrivateRoute.jsx` - Protected route wrapper
- `UserProfile.jsx` - User profile display
- `Logout.jsx` - Logout component
- Tab components for account dashboard:
  - `AccountHomeTab.jsx` - Dashboard home
  - `AccountProfileTab.jsx` - Profile information
  - `AccountDetailsTab.jsx` - Account details
  - `AccountAddressTab.jsx` - Address management
  - `AccountMyPropertyTab.jsx` - User's properties
  - `AccountAddPropertyTab.jsx` - Add property form
  - `AccountFavoritePropertyTab.jsx` - Favorite properties
  - `AccountPaymentTab.jsx` - Payment information
  - `AccountChangePasswordTab.jsx` - Password change

#### Blog Components (`src/components/blog/`)
Blog-related components:
- `Blog.jsx`, `BlogTwo.jsx`, `BlogThree.jsx` - Blog section layouts
- `BlogItem.jsx`, `BlogItemTwo.jsx`, `BlogItemThree.jsx` - Blog post cards
- `BlogClassicSection.jsx` - Classic blog layout
- `BlogClassicItem.jsx` - Classic blog post item
- `BlogDetailsSection.jsx` - Blog detail page section

#### Layout Components (`src/components/layout/`)
Page layout sections:
- `About.jsx`, `AboutTwo.jsx`, `AboutThree.jsx` - About sections
- `Gallery.jsx` - Image gallery
- `Faq.jsx`, `FaqTwo.jsx` - FAQ sections
- `FaqContactUs.jsx` - FAQ with contact
- `Message.jsx`, `MessageTwo.jsx`, `MessageThree.jsx` - Message/CTA sections
- `MapLocationSection.jsx` - Map location display
- `Apartment.jsx` - Apartment listing section
- `AreasWeCover.jsx` - Service areas display

#### Project Components (`src/components/project/`)
Project-related components:
- `Portfolio.jsx` - Portfolio grid
- `PortfolioItem.jsx` - Portfolio card
- `ProjectSection.jsx` - Project list section
- `ProjectDetailsSection.jsx` - Project detail display

#### Form Components (`src/components/forms/`)
Form-related components:
- `LoginForm.jsx` - Login form
- `RegisterForm.jsx` - Registration form
- `LoginRegister.jsx` - Combined login/register
- `AddListingForm.jsx` - Property listing form
- `AddListingSection.jsx` - Listing form section
- `ValidationForm.jsx` - Form with validation
- `CheckoutSection.jsx` - Checkout form
- `CartSection.jsx` - Shopping cart

#### Contact Components (`src/components/contact/`)
- `ContactUsSection.jsx` - Contact form section
- `ContactTop.jsx` - Contact page header

#### Vastu Components (`src/components/vastu/`) [NEW]
AI-powered Vastu analysis:
- `FloorPlanUpload.jsx` - Floor plan image upload
- `DirectionSelector.jsx` - North direction selector
- `VastuLoadingState.jsx` - Loading state display
- `VastuScoreCard.jsx` - Vastu score display
- `VastuReport.jsx` - Full Vastu analysis report

---

## Common Components (`src/common/`)

Shared UI components used across the application:

### Navigation & Layout
- `Header.jsx` - Main site header
- `TopHeader.jsx` - Top header bar
- `NavMenu.jsx` - Navigation menu
- `MobileMenu.jsx` - Mobile navigation menu
- `OffCanvas.jsx` - Off-canvas sidebar menu
- `Footer.jsx`, `FooterTwo.jsx` - Site footer variants
- `FooterBottom.jsx` - Footer bottom section
- `Breadcrumb.jsx` - Page breadcrumb navigation
- `ScrollToTop.jsx` - Scroll to top button

### Footer Subcomponents (`src/common/footer/`)
- `FooterLogoDesc.jsx` - Footer logo and description
- `FooterServiceItem.jsx` - Service link item
- `FooterUsefulItem.jsx` - Useful link item
- `FooterInfo.jsx` - Contact information
- `BottomFooterLinks.jsx` - Legal links
- `SubscribeBox.jsx` - Newsletter subscription

### Branding
- `Logo.jsx` - Standard logo
- `LogoWhite.jsx` - White/inverted logo

### UI Elements
- `Button.jsx` - Styled button component
- `SectionHeading.jsx` - Section title component
- `PageTitle.jsx` - Page title component
- `Pagination.jsx` - Pagination controls
- `StarRating.jsx` - Star rating display
- `LazyImage.jsx` - Lazy-loaded image component
- `SocialList.jsx` - Social media links

### SEO
- `SEO.jsx` - React Helmet wrapper for meta tags

### Forms & Inputs
- `Filter.jsx` - Filter component
- `SimplifiedFilter.jsx` - Simplified filter
- `TabFilter.jsx` - Tab-based filter
- `SearchBox.jsx` - Search input
- `GooglePlacesInput.jsx` - Google Places autocomplete
- `LocationSearchInput.jsx` - Location search input
- `CustomRangeSlider.jsx` - Range slider input
- `NewsletterForm.jsx` - Newsletter signup form
- `ImageUpload.jsx` - Image upload component
- `FaqAccordion.jsx` - FAQ accordion

### Sidebars
- `CommonSidebar.jsx` - Generic sidebar
- `SearchSidebar.jsx` - Search sidebar
- `ListingSidebar.jsx` - Listing page sidebar
- `SidebarCategoryList.jsx` - Category list sidebar
- `SidebarProperty.jsx` - Property sidebar widget
- `SidebarRecentPost.jsx` - Recent posts widget

### Blog Elements
- `BlogKeyword.jsx` - Blog keyword/tag
- `BlogNextPrev.jsx` - Next/previous navigation
- `BlogShowcase.jsx` - Blog showcase section
- `BlogTesti.jsx` - Blog testimonial
- `Comment.jsx` - Comment display
- `CommentForm.jsx` - Comment submission form

### Listing Forms
- `ListingBasicInformation.jsx` - Basic info form section
- `ListingPropertyGallery.jsx` - Gallery upload section
- `ListingContactDetails.jsx` - Contact details form
- `ListGridButtons.jsx` - List/grid view toggle

### Checkout (Legacy)
- `CheckoutForm.jsx` - Checkout form
- `CheckoutSidebar.jsx` - Checkout sidebar
- `CheckoutPaymentCard.jsx` - Payment method card
- `CardTotalCard.jsx` - Cart total display

---

## Services (`src/services/`)

API service layer for backend integration.

### Base Configuration

#### `http.js` - Core HTTP Configuration
- Axios instance factory with configurable auth and retry
- Base URL: `/api` (proxied to backend)
- HTTPS enforcement (except localhost)
- Retry logic: max 3 retries for GET on 5xx errors
- 30-second default timeout
- Auto 401 handling with redirect to login

#### `api.js` - Authenticated API Instance
Pre-configured axios instance with `withAuth: true`

#### `index.js` - Service Exports
Central barrel export for all services

### Authentication & User Services

#### `authService.js` - Authentication
```javascript
login(phone, password)     // Supabase auth.signInWithPassword()
register(userData)         // Supabase auth.signUp()
getCurrentUser()           // GET /users/profile/
updateCurrentUser(data)    // PUT /users/profile/
logout()                   // Supabase auth.signOut() + clear cached user state
```

#### `userService.js` - User Management
```javascript
getProfile()                    // GET /users/profile/
updateProfile(data)             // PUT /users/profile/
updatePreferences(prefs)        // PUT /users/preferences/
updateLocation(location)        // PUT /users/location/
getNotificationSettings()       // GET /users/notification-settings
updateNotificationSettings(s)   // PUT /users/notification-settings
getAssignedAgent()              // GET /agents/assigned/
// Admin operations
getUserById(id)                 // GET /users/{id}
getAllUsers(params)             // GET /users
createUser(data)                // POST /users
updateUser(id, data)            // PUT /users/{id}
```

### Property Services

#### `propertyService.js` - Property CRUD (Authenticated)
```javascript
getAllProperties(filters)       // GET /properties/
getAllPropertiesAdmin(params)   // GET /properties/all/
getUserProperties(params)       // GET /properties/me/
getPropertyById(id)             // GET /properties/{id}
createProperty(data)            // POST /properties/
updateProperty(id, data)        // PUT /properties/{id}
deleteProperty(id)              // DELETE /properties/{id}/
verifyProperty(id)              // PUT /properties/{id}/verify/
```

#### `propertyAPIService.js` - Public Property Search (No Auth)
```javascript
searchProperties(filters, page, limit)  // GET /properties/
getPropertyById(propertyId)             // GET /properties/{id}
getRecommendations(limit)               // GET /properties/recommendations/
```

**Supported Filters:**
- Location: `lat`, `lng`, `radius`, `city`, `locality`, `pincode`
- Search: `q` (text search)
- Property: `purpose`, `property_type[]`
- Price: `price_min`, `price_max`
- Rooms: `bedrooms_min/max`, `bathrooms_min/max`
- Area: `area_min`, `area_max`
- Features: `amenities[]`, `features[]`, `parking_spaces_min`
- Building: `floor_number_min/max`, `age_max`
- Short Stay: `check_in`, `check_out`, `guests`
- Sorting: `sort_by`

#### `mediaService.js` - Property Media
```javascript
getPropertyMedia(propertyId)    // GET /media/property/{id}
uploadMedia(formData)           // POST /media/upload (multipart)
createMedia(data)               // POST /media
updateMedia(id, data)           // PUT /media/{id}
deleteMedia(id)                 // DELETE /media/{id}
```

### User Interaction Services

#### `swipeService.js` - Property Swipe Actions
```javascript
recordSwipe({property_id, is_liked})  // POST /swipes/
getSwipes(params)                      // GET /swipes/
undoLast()                             // DELETE /swipes/undo/
toggle(swipeId)                        // PUT /swipes/{id}/toggle/
stats()                                // GET /swipes/stats/
```

#### `visitService.js` - Property Visits
```javascript
schedule({property_id, scheduled_date, special_requirements})
getAll()                      // GET /visits/
getUpcoming()                 // GET /visits/upcoming/
getPast()                     // GET /visits/past/
getById(visitId)              // GET /visits/{id}
update(visitId, data)         // PUT /visits/{id}
reschedule(visitId, data)     // POST /visits/{id}/reschedule
cancel(visitId, data)         // POST /visits/{id}/cancel
```

### Content Services

#### `blogService.js` - Blog Content
```javascript
getPosts(params)                    // GET /blog/posts
getPostByIdentifier(identifier)     // GET /blog/posts/{id|slug}
getCategories(params)               // GET /blog/categories
getCategoryByIdentifier(identifier) // GET /blog/categories/{id|slug}
getTags(params)                     // GET /blog/tags
getTagByIdentifier(identifier)      // GET /blog/tags/{id|slug}
```

#### `pageService.js` - Static Pages (No Auth)
```javascript
getPublicPage(uniqueName)           // GET /pages/{name}/public
getManyPublicPages(uniqueNames[])   // Batch fetch with Promise.allSettled
```

### Utility Services

#### `utilityService.js` - Miscellaneous
```javascript
getAmenities()                // GET /amenities/
uploadFile(file)              // POST /upload/
getPublicFAQs(params)         // GET /faqs/public
getPageByUniqueName(name)     // GET /pages/{name}/public
reportBug(data)               // POST /bugs/
checkAppUpdate(data)          // POST /versions/check
```

#### `agentService.js` - Agent Management
```javascript
getAssignedAgent()            // GET /agents/assigned/
```

#### `deletionService.js` - Account Deletion
```javascript
submitDeletionRequest(data)           // POST /account/delete-request/
getDeletionRequestStatus(requestId)   // GET /account/delete-request/{id}/status/
cancelDeletionRequest(requestId)      // POST /account/delete-request/{id}/cancel/
```

#### `vastuService.js` - Vastu Analysis [NEW]
AI-powered floor plan analysis (public endpoint):
```javascript
analyzeFloorPlan(imageFile, northDirection, notes)  // POST /vastu/analyze
checkHealth()                                        // GET /vastu/health
```
- 3-minute timeout for AI processing
- Supports: JPEG, PNG, WebP images
- North directions: 'up', 'down', 'left', 'right', 'unknown'

---

## State Management

### Zustand Stores (`src/store/`)

#### `authStore.js` - Authentication
**State:** `user`, `token`, `isAuthenticated`, `isLoading`, `error`
**Actions:** `login()`, `register()`, `logout()`, `updateProfile()`, `clearError()`
- Persists only cached user profile in localStorage
- Reads access token from active Supabase session
- Auto-extracts nested API error messages

#### `propertyStore.js` - Property Management (Most Complex)
**State:**
- `properties`, `recommendations`, `likedProperties`, `userProperties`
- `currentProperty`, `propertyMedia`
- `pagination` (page, totalPages, total, limit)
- `filters` (31 filter fields), `filtersChanged`
- `isLoading`, `error`

**Actions:**
- Search: `fetchProperties()`, `applyFilters()`, `setFilters()`, `updateFilter()`, `clearFilters()`, `getActiveFiltersCount()`
- Swipes: `recordSwipe()`, `fetchLikedProperties()`, `undoLastSwipe()`, `getSwipeStats()`
- CRUD: `createProperty()`, `updateProperty()`, `deleteProperty()`, `getUserProperties()`
- Read: `fetchPropertyById()`, `fetchRecommendations()`

#### `userStore.js` - User Profile
**State:** `profile`, `preferences`, `assignedAgent`, `isLoading`, `error`
**Actions:** `getProfile()`, `updateProfile()`, `updatePreferences()`, `updateLocation()`, `getAssignedAgent()`

#### `locationStore.js` - Geolocation
**State:** `location` ({lat, lng, name}), `isLocating`, `error`
**Actions:** `initializeLocation()`, `fetchBrowserLocation()`, `setLocation()`, `resetToCurrentLocation()`
- Uses Zustand persist middleware with 24-hour expiration
- Fallback to Gurugram (lat: 28.4595, lng: 77.0266)

#### `visitStore.js` - Property Visits
**State:** `visits`, `upcomingVisits`, `pastVisits`, `isLoading`, `error`
**Actions:** `scheduleVisit()`, `getVisits()`, `getUpcomingVisits()`, `getPastVisits()`, `getVisitDetails()`, `updateVisit()`, `rescheduleVisit()`, `cancelVisit()`

#### `agentStore.js` - Agent Management
**State:** `assignedAgent`, `isLoading`, `error`
**Actions:** `getAssignedAgent()`, `clearError()`

#### `adminStore.js` - Admin Operations (Stub)
**State:** `users`, `allProperties`, `isLoading`, `error`
- Most methods show alerts (not yet implemented)
- Only `updateUser()` is functional

### React Context (`src/contextApi/`)

#### `BlogDataContext.jsx`
Manages blog data passed between blog components (posts, categories, current post)

**Usage Pattern:**
```javascript
import { useAuthStore, usePropertyStore } from './store';
// In component
const { user, login } = useAuthStore();
const { properties, fetchProperties } = usePropertyStore();
```

---

## Routing Architecture

### Route Configuration (`src/App.jsx`)

The app uses React Router v6 with the following route structure:

#### Static Routes
```
/                           → Home
/home-two, /home-three      → Alternative home designs (legacy)
/properties                 → Property listings
/property-sidebar           → Property listings with sidebar
/property/:id               → Property details (by ID)
/add-new-listing            → Add new listing wizard
/post-property              → Post property form
/map-location               → Map-based search
/about-us                   → About page
/faq                        → FAQ page
/contact                    → Contact page
/login                      → Login page
/mcp/login                  → MCP login for AI assistants
/register                   → Registration page
/account                    → User dashboard (protected)
/delete-account             → Account deletion request
/policies                   → Policy list
/policies/:slug             → Policy details
/project                    → Project listings
/project/:title             → Project details
/blog                       → Blog listings
/blog/:title                → Blog post details
```

#### Tool Routes
```
/emi-calculator                 → EMI Calculator
/area-converter                 → Area Converter
/area-calculator                → Area Calculator
/loan-eligibility-calculator    → Loan Eligibility Calculator
/property-document-checklist    → Property Document Checklist
/capital-gains-tax-calculator   → Capital Gains Calculator
/design-blueprint               → 3D Blueprint Tool
/vastu-checker                  → Vastu Compliance Checker
```

#### SEO Landing Routes
```
/gurugram-real-estate-guide     → Gurugram Guide
/property-investment-gurugram   → Property Investment
/for-ai                         → AI Assistants Info
```

#### Programmatic SEO Routes (Dynamic)
```
/:citySlug/:intent/:type                    → Landing page
/:citySlug/:intent/:type/:bhk               → BHK-filtered landing
/:citySlug/:intent/:type/budget/:budget     → Budget-filtered landing
/:citySlug/:intent/:type/amenity/:amenity   → Amenity-filtered landing
```

#### Catch-all
```
*                           → NotFound (404)
```

### App Initialization
- Location store initialized on app load
- Routes wrapped in `BrowserRouter`
- `ScrollToTop` component for navigation

---

## Static Data (`src/data/`)

### Data Organization
```
src/data/
├── CommonData/      → Shared navigation, footer, social data
├── HomeOneData/     → Home page content
├── HomeTwoData/     → Alternative home design data
├── HomeThreeData/   → Alternative home design data
└── OthersPageData/  → Various page-specific data
```

### CommonData Contents
- `navMenus` - Main navigation structure with nested submenus
- `socialLists` - Social media links
- `topHeaderInfos`, `offCanvasInfos` - Contact information
- `footerInfos`, `footerServiceLinks`, `footerUsefulLinks` - Footer content
- `footerGallery`, `BottomFooterLink` - Footer elements

### Page-Specific Data
- Banner content, testimonials, counters
- Filter options (property types, price ranges, amenities)
- Team members, FAQ items
- Form field options

---

## Styling System

### SCSS Architecture (`public/assets/sass/`)

Uses 7-1 pattern architecture:

```
sass/
├── abstracts/       → Variables, mixins, functions, utilities
│   ├── _variable.scss     → Color, spacing, typography variables
│   ├── _mixins.scss       → Reusable mixins
│   ├── _functions.scss    → SCSS functions
│   ├── _classes.scss      → Utility classes
│   ├── _extend.scss       → Placeholder selectors
│   └── _index.scss        → Abstracts barrel
├── base/            → Typography, margins, padding, reset
│   ├── _typography.scss   → Font styles
│   ├── _margin.scss       → Margin utilities
│   ├── _padding.scss      → Padding utilities
│   └── _index.scss        → Base barrel
├── components/      → Reusable component styles
│   ├── _button.scss       → Button styles
│   ├── _form.scss         → Form elements
│   ├── _card.scss         → Card components
│   └── _index.scss        → Components barrel
├── layout/          → Major layout elements
│   ├── _header.scss       → Header styles
│   ├── _footer.scss       → Footer styles
│   └── _index.scss        → Layout barrel
├── partials/        → Page-specific styles
│   ├── home/              → Home page styles
│   ├── home-two/          → Home Two styles
│   ├── home-three/        → Home Three styles
│   ├── home-four/         → Home Four styles
│   ├── home-five/         → Home Five styles
│   ├── othersPage/        → Other page styles
│   ├── rtlVersion/        → RTL support
│   └── _index.scss        → Partials barrel
└── main.scss        → Main entry point
```

### Key Variables
Located in `abstracts/_variable.scss`:
- Color palette
- Typography scale
- Spacing system
- Breakpoints

---

## API Integration

### Backend Configuration
- **Development:** `http://localhost:3600/api/v1` (via Vite proxy)
- **Production:** `https://api.360ghar.com`

### Vite Proxy (`vite.config.js`)
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3600',
      changeOrigin: true,
      rewrite: (path) => path.replace(/^\/api/, '/api/v1'),
    },
  },
}
```

### Authentication Flow
1. Login/Register happens directly via Supabase Auth SDK
2. Access token is read from Supabase session and injected in `Authorization` header
3. Backend validates Supabase bearer token; no backend `/api/v1/auth/*` login/register endpoints
4. 401 responses trigger logout and redirect to `/login`
5. Public endpoints (property search, blog) don't require auth

### Error Handling Pattern
All services use consistent error extraction:
```javascript
const extractError = (err, fallback) => {
  // Handles FastAPI/Pydantic v2 error formats
  // Returns normalized error message string
}
```

---

## Special Features

### 3D Blueprint Tool (`/design-blueprint`)
- Uses Blueprint3D library (loaded from `/public/blueprint3d/`)
- Interactive floor plan designer
- Exports floor plan data

### Vastu Checker (`/vastu-checker`)
- AI-powered Vastu compliance analysis
- Upload floor plan image
- Specify north direction
- Receive score and detailed report

### Programmatic SEO
- Dynamic landing pages for city/intent/type combinations
- Faceted pages for BHK, budget, and amenity filters
- Sitemap generation script in `/scripts/`

### Google Places Integration
- `GooglePlacesInput.jsx` - Autocomplete for address search
- `LocationSearchInput.jsx` - Location-based search
- API key configured via environment variables

---

## Environment Variables

Required environment variables (see `.env.example`):
```
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

---

## Build Scripts

### Sitemap Generation (`scripts/generate-sitemaps.mjs`)
- Runs automatically before production build
- Generates:
  - `public/sitemap.xml` - Main sitemap
  - `public/sitemap-static.xml` - Static pages
  - `public/sitemap-landing.xml` - Landing pages

---

## Deployment & CI

### Netlify Build
- Netlify runs `npm run build` which triggers entity ingestion, sitemap generation, then Vite build
- Netlify uses **strict peer dependency resolution** — mismatches that `npm install` tolerates locally will fail CI with `ERESOLVE`

### ESLint Version Constraint
- `eslint` and `@eslint/js` must stay on **major version 9** (`^9.x`)
- `eslint-plugin-react@7.x` declares `peerDependency: eslint ^2 || ^3 || ... || ^9` — it does **not** support eslint 10+
- Upgrading eslint to `^10` causes Netlify `npm install` to fail: `ERESOLVE unable to resolve dependency tree`
- Current locked versions: `eslint@^9.39.4`, `@eslint/js@^9.39.4`

### Dependency Upgrade Checklist
Before upgrading any devDependency to a new major version:
1. Check peer dependency ranges of all related plugins: `npm info <pkg> peerDependencies`
2. Run `npm install` locally and check for `WARN peer dep` messages
3. Run `npm run build && npm run lint` before pushing — Netlify runs both

---

## Documentation Maintenance

The `.wiki/` directory contains comprehensive codebase documentation that is published to the GitHub Wiki tab automatically. Keep it up to date after every change.

### When to update

| Change type | Wiki page to update |
|-------------|-------------------|
| New/removed page, component, service, or store | Relevant `.wiki/pages/`, `.wiki/components/`, `.wiki/services/`, or `.wiki/state/` page |
| Feature or architecture change | `.wiki/Architecture.md` + relevant `.wiki/features/` page |
| Dependency added/removed/updated | `.wiki/reference/Reference.md` |
| Build process change | `.wiki/build/Build-Pipeline.md` |
| Branding or UI pattern change | `.wiki/how-to-contribute/Patterns-Conventions.md` |
| Video content change (features, architecture, branding) | Re-render `.wiki/video/overview.mp4` |

### Commands

```bash
# Re-render the wiki overview video (after editing .wiki/video/src/)
cd .wiki/video && npm install && npx remotion render src/Root.tsx OverviewVideo overview.mp4

# Preview the video in Remotion Studio (interactive editing)
cd .wiki/video && npm run dev

# Wiki auto-publishes to GitHub Wiki tab on push to main (via .github/workflows/publish-wiki.yml)
# Video auto-renders on push to main when .wiki/video/src/ changes (via .github/workflows/render-wiki-video.yml)
```

### Wiki structure

- Wiki source lives in `.wiki/` (markdown files, versioned with code, browsable on GitHub)
- `_Sidebar.md` and `_Footer.md` provide navigation on the GitHub Wiki tab
- The Remotion video project lives in `.wiki/video/` (editable, re-renderable)
- Do NOT upload to Factory - the wiki is GitHub-only
- One-time prerequisite: create the first wiki page via GitHub UI (Repo -> Wiki tab -> "Create the first page") to initialize the `.wiki.git` backend

---

## Company Information

- **Name:** 360Ghar
- **Location:** Gurugram, Haryana, India (122001)
- **Email:** info@360ghar.com
- **Phone:** 9999900876
- **Website:** https://360ghar.com
- **Social:** Facebook, Twitter, LinkedIn, Instagram
