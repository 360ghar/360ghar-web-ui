# Layout Components

The `src/components/layout/`, `src/components/project/`, `src/components/forms/`, `src/components/contact/`, and `src/components/blog/` directories hold the section-level components that fill out individual pages. Unlike the marketing UI in [UI Components](UI-Components), these are page-specific blocks: about sections, galleries, FAQ sections, message/quote forms, project cards, contact forms, and blog layouts. They are grouped by domain below.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/layout/About.jsx` | About section with `CountUp` statistic badge |
| `src/components/layout/AboutTwo.jsx` | About variant for `HomeTwo` |
| `src/components/layout/AboutThree.jsx` | About variant for `HomeThree` |
| `src/components/layout/Gallery.jsx` | Asymmetric gallery grid with popup links |
| `src/components/layout/Faq.jsx` | FAQ section using `FaqAccordion` |
| `src/components/layout/FaqTwo.jsx` | FAQ variant for `HomeThree` |
| `src/components/layout/FaqContactUs.jsx` | FAQ + contact form combo |
| `src/components/layout/Message.jsx` | "Get A Quote" form section |
| `src/components/layout/MessageTwo.jsx` | Message variant |
| `src/components/layout/MessageThree.jsx` | Message variant with richer layout |
| `src/components/layout/MapLocationSection.jsx` | Map-based property search section |
| `src/components/layout/Apartment.jsx` | Apartment availability table |
| `src/components/layout/AreasWeCover.jsx` | Gurugram service-areas checklist |
| `src/components/project/Portfolio.jsx` | Portfolio carousel (`react-slick`) |
| `src/components/project/PortfolioItem.jsx` | Single portfolio slide |
| `src/components/project/ProjectSection.jsx` | Project listing grid |
| `src/components/project/ProjectDetailsSection.jsx` | Project detail page body |
| `src/components/forms/ValidationForm.jsx` | Formik + Yup contact/quote form |
| `src/components/forms/LoginRegister.jsx` | Combined auth form (login + register + OTP) |
| `src/components/forms/AddListingForm.jsx` | Legacy add-listing form composition |
| `src/components/forms/AddListingSection.jsx` | Add-listing page with sidebar |
| `src/components/contact/ContactUsSection.jsx` | Formspree contact form |
| `src/components/contact/ContactTop.jsx` | Contact info cards |
| `src/components/blog/Blog.jsx` | Home-page blog preview (fetches latest 6) |
| `src/components/blog/BlogTwo.jsx` | Blog variant for `HomeTwo` |
| `src/components/blog/BlogThree.jsx` | Blog variant for `HomeThree` |
| `src/components/blog/BlogItem.jsx` | Blog card |
| `src/components/blog/BlogItemTwo.jsx` | Blog card variant |
| `src/components/blog/BlogItemThree.jsx` | Blog card variant |
| `src/components/blog/BlogClassicSection.jsx` | Blog listing with pagination + sidebar |
| `src/components/blog/BlogClassicItem.jsx` | Classic blog list item |
| `src/components/blog/BlogDetailsSection.jsx` | Blog post detail body |
| `src/components/blog/BlogFeed.jsx` | Blog feed widget |

## Layout (`src/components/layout/`)

### About variants
`About.jsx` reads `aboutContent` and `aboutStatistics` from `HomeOneData`, renders a `LazyImage` thumb with a `client-statistics` badge using `react-countup` for the number, and a `SectionHeading` + `Button`. `AboutTwo` and `AboutThree` follow the same pattern against their respective data files with different visual treatments.

### Gallery
`Gallery.jsx` maps `galleries` from `HomeTwoData` into an asymmetric grid (items 1 and 2 span 8 columns, others span 4). Each thumb is a `LazyImage` with an anchor link styled as `gallery-popup`.

### Faq variants
`Faq.jsx` pairs a `SectionHeading` with `FaqAccordion` (from `src/common/FaqAccordion.jsx`) and a decorative image. `FaqTwo.jsx` is the `HomeThree` variant. `FaqContactUs.jsx` combines a `SectionHeading` with a `ValidationForm` inside a `contact-form` card.

### Message variants
`Message.jsx` is a "Get A Quote" section: a `message-img.webp` thumb on the left and a `ValidationForm` on the right. `MessageTwo` and `MessageThree` are alternate layouts of the same idea.

### MapLocationSection
`MapLocationSection.jsx` (~625 lines) is the map-based property search section used by `src/pages/MapLocation.jsx`. It loads Google Maps via `@googlemaps/js-api-loader` (singleton `getMapsLoader`), renders `PropertyItem` cards, embeds `PropertyFilters` and `PropertyQuickFilters`, and uses `MapControls` and `RadiusSlider` from `src/components/map/`. It binds to `usePropertyStore` and `useLocationStore`.

### Apartment
`Apartment.jsx` renders a responsive `<table>` of available apartments using `apartmentThs` / `apartmentTds` from `HomeTwoData`, with `I18nLink` actions per row.

### AreasWeCover
`AreasWeCover.jsx` is a hardcoded checklist of 19 Gurugram service areas (DLF Phases, Golf Course Road, MG Road, Cyber City, Sushant Lok, etc.) rendered as a 3-column check-list grid. No props, no data import.

## Project (`src/components/project/`)

- **`Portfolio.jsx`** — `react-slick` carousel (3 slides desktop, responsive down to 1) mapping `portfolios` from `HomeOneData` into `PortfolioItem` slides. Note: `prevArrow` / `nextArrow` are string literals (legacy, non-functional) — the slider relies on `arrows: false`.
- **`PortfolioItem.jsx`** — single slide card.
- **`ProjectSection.jsx`** — project listing grid. Maps `projectItems` from `OthersPageData`, slugs each title, and links to `/project/<slug>` via `I18nLink`, passing `state={{ id, title, thumb, desc }}`.
- **`ProjectDetailsSection.jsx`** — project detail body. Reads `:title` slug from `useParams`, resolves the project via `resolveProjectFromSlug` (matches `item.slug` in `projectItems`), renders a not-found state, formatted current date, sidebar (`projectSidebarLists`), challenges list, and social links.

## Forms (`src/components/forms/`)

### ValidationForm
`ValidationForm.jsx` is a Formik + Yup form with `name`, `email`, `address`, `message` fields. Validation messages are i18n-driven (`forms:*` namespace). On submit it resets the form and shows a `react-toastify` success. It accepts layout props (`colClass`, `inputClass`, `iconSpanClass`, `renderLabel`, `labelClass`) and is reused by `Message`, `MessageTwo`, `MessageThree`, and `FaqContactUs`.

### LoginRegister
`LoginRegister.jsx` (~1163 lines) is the combined authentication form. Despite the task spec listing separate `LoginForm` and `RegisterForm`, the codebase unifies both flows here. It supports email or Indian phone identifiers (`looksLikeEmail`, `normalizePhone`), Supabase auth via `useAuthStore` and `authService`, WebOTP (`useWebOtp`), resend timers (`useResendTimer`), password strength validation (`isStrongPassword`), and post-login redirect via `getRedirectPathForStage` / `fetchAuthStage`. Used by `src/pages/account/Login.jsx` and `Register.jsx`.

### AddListingForm / AddListingSection
`AddListingForm.jsx` composes the legacy add-listing wizard from `ListingBasicInformation`, `ListingPropertyGallery`, `ListingPropertyInformation` (from `src/components/property/`), and `ListingContactDetails` (from `src/common/listing/`). `AddListingSection.jsx` wraps it with a `ListingSidebar` in a two-column layout. The production flow uses `src/pages/properties/AddListing.jsx` instead.

## Contact (`src/components/contact/`)

- **`ContactUsSection.jsx`** — uses `@formspree/react` (`useForm("mwpqglyb")`) to submit contact messages. Shows a success state with a `Trans`-rendered description linking to `/faq`. Form fields: name, email, message.
- **`ContactTop.jsx`** — three contact info cards (`contactTopInfos` from `OthersPageData`) with icons, titles, and optional links (tel/mailto/internal).

## Blog (`src/components/blog/`)

### Blog preview variants
`Blog.jsx` fetches the latest 6 posts via `blogService.getPosts({ page: 1, limit: 6 })` on mount, maps each post to a `BlogItem` shape (thumb, meta with author/date, title, excerpt), and handles loading/error states. `BlogTwo` and `BlogThree` are visual variants using `BlogItemTwo` / `BlogItemThree`.

### BlogClassicSection
`BlogClassicSection.jsx` is the `/blog` listing body. It reads `page`, `category`, `tag`, `q` from `useSearchParams`, fetches via `blogService` (10 posts/page), and renders `BlogClassicItem` cards with `Pagination` and `CommonSidebar`.

### BlogDetailsSection
`BlogDetailsSection.jsx` (~556 lines) renders `/blog/:title`. It detects HTML vs Markdown content (`isHTMLContent`, `isMarkdownContent`), sanitises HTML with `DOMPurify`, renders Markdown via `ReactMarkdown` + `remarkGfm`, attaches `SEO` with `generateBlogStructuredData` and `generateBreadcrumbStructuredData`, and resolves authors via `getAuthor` / `getAuthorSchema` from `src/data/authors`. Includes `ToolRelatedLinks` and a co-located `BlogDetails.scss`.

### BlogFeed
`BlogFeed.jsx` is a sidebar/feed widget showing recent posts.

## Cross-Links

- [UI Components](UI-Components) for `SectionHeading`, `Button`, `LazyImage`, `Cta`.
- [Common UI Elements](../common/Forms-Inputs) for `FaqAccordion`, `CommonSidebar`, `Pagination`.
- [Property Components](Property-Components) for `PropertyItem`, `PropertyFilters`, `ListingPropertyInformation`.
- [Navigation & Layout](../common/Navigation-Layout) for the `Header`, `Footer`, `Breadcrumb` chrome that wraps these sections.
