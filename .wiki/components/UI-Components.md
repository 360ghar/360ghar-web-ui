# UI Components

The `src/components/ui/` directory holds the general-purpose marketing and section components that assemble the 360Ghar home page and supporting pages. These are presentational building blocks (heroes, counters, testimonials, CTAs, team cards) reused across `Home.jsx`, alternative home designs, and several detail pages. Almost every component here is data-driven: it imports a static array from `src/data/` and renders one item child per entry, so updating copy is a data-file change rather than a code change.

## Key Files

| File | Purpose |
|------|---------|
| `src/components/ui/Banner.jsx` | Default hero banner with `TabFilter` and decorative shapes |
| `src/components/ui/BannerTwo.jsx` | Compact two-column hero with background filter box |
| `src/components/ui/BannerThree.jsx` | Active home hero with responsive `srcSet` for LCP |
| `src/components/ui/Counter.jsx` | Statistics counter grid (`HomeOne`) |
| `src/components/ui/CounterTwo.jsx` | Counter variant for `HomeTwo` |
| `src/components/ui/CounterThree.jsx` | Counter with decorative background image |
| `src/components/ui/CounterFour.jsx` | Counter variant used on interior pages |
| `src/components/ui/Testimonial.jsx` | Fade-slider testimonial with thumbnail |
| `src/components/ui/TestimonialThree.jsx` | Center-mode testimonial slider, `prefers-reduced-motion` aware |
| `src/components/ui/PropertyType.jsx` | "Why choose 360Ghar" value-prop cards |
| `src/components/ui/PropertyTypeThree.jsx` | Property-type cards for `HomeThree` |
| `src/components/ui/Team.jsx` | Team grid with social-share toggle |
| `src/components/ui/TeamItem.jsx` | Single team card with outside-click share menu |
| `src/components/ui/Service.jsx` | Three-column services grid |
| `src/components/ui/Cta.jsx` | Newsletter CTA with `NewsletterForm` |
| `src/components/ui/OwnerCta.jsx` | Owner onboarding CTA linking to `/post-property` |
| `src/components/ui/Newsletter.jsx` | Background-image newsletter band |
| `src/components/ui/FaqItem.jsx` | Controlled accordion item |
| `src/components/ui/VideoPopup.jsx` | YouTube thumbnail with play link |
| `src/components/ui/AppDownload.jsx` | Mobile app download section with QR code |

## Banner Group

`Banner`, `BannerTwo`, and `BannerThree` are three visual treatments of the same idea: an H1, a subtitle, contact info, a hero image, and an embedded `TabFilter` from `src/common/forms/TabFilter.jsx`. They differ in layout and LCP strategy:

- **`Banner.jsx`** reads `bannerContent` from `src/data/HomeOneData` and renders decorative shape images positioned absolutely around the thumb.
- **`BannerTwo.jsx`** reads `bannerTwoContent` from `src/data/HomeTwoData` and places the filter inside a background-image box (`banner-two-filter-bg.webp`).
- **`BannerThree.jsx`** is the **active** hero used by `src/pages/Home.jsx`. It ships a responsive `srcSet` (`banner-three-320w.webp` through `banner-three-1024w.webp`) and `priority` on `LazyImage` to optimise LCP. Decorative dotted and shape layers are lazy-loaded.

All three are prop-less and pull their copy from data files. `BannerThree` is the only one wired into a live route; the others are legacy designs retained for reference.

## Counter Group

Four counter variants share the same pattern: import an array, map it, and render a sibling `*Item` component per entry.

| Container | Item | Data source |
|-----------|------|-------------|
| `Counter.jsx` | `CounterItem.jsx` | `counts` in `HomeOneData` |
| `CounterTwo.jsx` | `CounterTwoItem.jsx` | `counters` in `HomeTwoData` |
| `CounterThree.jsx` | `CounterThreeItem.jsx` | `counterThreeContents` in `HomeThreeData` |
| `CounterFour.jsx` | `CounterFourItem.jsx` | `counterFourContents` in `OthersPageData` |

`CounterThree` adds a decorative `counter-bg.webp` background via `LazyImage`. `Home.jsx` lazy-loads `CounterThree` via `React.lazy`.

## Testimonial Group

`Testimonial.jsx` and `TestimonialThree.jsx` both use `react-slick` with custom `PrevArrow` / `NextArrow` components that strip the `currentSlide` / `slideCount` non-DOM props before forwarding to a `<button>`. `Testimonial` uses a `fade` transition; `TestimonialThree` uses `centerMode` and disables autoplay when `window.matchMedia('(prefers-reduced-motion: reduce)')` matches. Each maps an array of items into a `TestimonialItem` / `TestimonialThreeItem` child. Both pair with a `SectionHeading`.

## Property Type Group

`PropertyType.jsx` ("Why Choose 360Ghar") and `PropertyTypeThree.jsx` render grids of value-prop or property-type cards using `PropertyTypeItem` and `PropertyTypeThreeItem` respectively. They are pure presentation; the parent `SectionHeading` carries the title and subtitle. `PropertyType` is lazy-loaded on the home page.

## Team Group

`Team.jsx` renders a `SectionHeading` plus a grid of `TeamItem` cards. `TeamItem` accepts a `team` prop (`{thumb, name, designation, shareIcon}`) and manages a social-share popover with an outside-click handler registered on `document`. The popover renders links from `socialLists` in `src/data/CommonData`.

## Service

`Service.jsx` maps `services` from `HomeTwoData` into icon/title/text/link cards. Each card ends with an `I18nLink` "simple-btn" using the brand gradient text class.

## Call-to-Action Group

- **`Cta.jsx`** accepts a `ctaClass` prop and renders a translated newsletter CTA (i18n key `cta.*`) containing `NewsletterForm` and a `cta-img.webp` thumbnail. It is imported directly (not lazy) by many pages including login, register, account, project, and data-hub pages.
- **`OwnerCta.jsx`** is an untranslated, brand-specific CTA promoting free owner onboarding and 360° photography. It links to `/post-property` via `I18nLink` and accepts a `className` prop.
- **`Newsletter.jsx`** renders a centered, background-image newsletter band with `NewsletterForm`. Lazy-loaded on `Home.jsx`.

## FaqItem

`FaqItem.jsx` is a controlled accordion item. It receives `itemClass`, a `faq` object (`{id, btnText, bodyText}`), the current `activeAccordion` id, and a `handleAccordionClick` callback. The parent toggles the active id. This item is consumed by `src/common/FaqAccordion.jsx`, which iterates `faqs` from `HomeThreeData`.

## VideoPopup

`VideoPopup.jsx` is a prop-less section that renders a `video-popup.webp` thumbnail wrapped in an `I18nLink` pointing at a YouTube URL, with a play icon overlay. It is a simple marketing block.

## AppDownload

`AppDownload.jsx` is a large marketing section promoting the 360Ghar Android app. It hardcodes the Play Store URL and a screenshot URL at module scope, renders feature cards (VR tours, AI recommendations, alerts, RM chat), shows star ratings, and includes a Google Play badge plus a QR code generated via `api.qrserver.com`. The iOS badge is a "Coming Soon" placeholder. Lazy-loaded on the home page.

## Where Used

- `src/pages/Home.jsx` lazy-loads `BannerThree`, `PropertyType`, `CounterThree`, `Newsletter`, `AppDownload`, and `ReferEarnCta`.
- `src/pages/account/*` (Login, Register, Account, McpLogin, ResetPassword, ForgotPassword, AccountDeletionRequest) and `src/pages/data-hub/*`, `src/pages/projects/*`, `src/pages/properties/PropertySidebar.jsx`, `src/pages/MapLocation.jsx` import `Cta` directly.
- Legacy home designs (`HomeOne`, `HomeTwo`, `HomeThree`) compose the `Banner`/`Counter`/`Testimonial` variants corresponding to their number.

## Cross-Links

- [Layout Components](Layout-Components) for section wrappers like `About`, `Faq`, `Message`.
- [Common UI Elements](../common/Forms-Inputs) for `NewsletterForm`, `SectionHeading`, `Button`, `LazyImage`.
- [Architecture](../Architecture) for how pages compose these sections.
