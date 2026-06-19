# Navigation & Layout

The `src/common/layout/` directory and its `footer/` subdirectory hold the global chrome of the 360Ghar frontend: the top bar, sticky header, primary nav, mobile menu, off-canvas panel, footer, breadcrumb, and scroll-to-top button. These components mount once (in `src/App.jsx` or page wrappers) and persist across route changes. State for the mobile menu and off-canvas panel lives in `useUIStore` (Zustand), so any component can open or close them.

## Key Files

| File | Purpose |
|------|---------|
| `src/common/layout/TopHeader.jsx` | Top contact-info bar |
| `src/common/layout/Header.jsx` | Sticky header with logo, nav, auth menu, off-canvas trigger |
| `src/common/layout/NavMenu.jsx` | Desktop nav with overflow "More" menu and dropdowns |
| `src/common/layout/MobileMenu.jsx` | Full-screen mobile drawer with quick search |
| `src/common/layout/OffCanvas.jsx` | Right-side off-canvas panel with search + map |
| `src/common/layout/Footer.jsx` | Primary footer composing footer subcomponents |
| `src/common/layout/FooterTwo.jsx` | Alternate footer layout |
| `src/common/layout/FooterBottom.jsx` | Copyright + legal links bar |
| `src/common/layout/Breadcrumb.jsx` | Page breadcrumb with optional compact variant |
| `src/common/layout/ScrollToTop.jsx` | Floating scroll-to-top button |
| `src/common/layout/LanguageSwitcher.jsx` | EN / HI locale toggle |
| `src/common/layout/footer/FooterLogoDesc.jsx` | Footer logo, description, contact, newsletter |
| `src/common/layout/footer/FooterServiceItem.jsx` | Footer services link list |
| `src/common/layout/footer/FooterUsefulItem.jsx` | Footer useful-links list |
| `src/common/layout/footer/FooterInfo.jsx` | Footer contact info grid |
| `src/common/layout/footer/BottomFooterLinks.jsx` | Legal links in footer bottom |
| `src/common/layout/footer/SubscribeBox.jsx` | Formspree email subscribe box |

## TopHeader

`TopHeader.jsx` renders a thin `header-top` bar above the main header. It maps `topHeaderInfos` from `src/data/CommonData` and renders each item as an icon + translated text. `tel:` and `mailto:` links become `<a>` tags; other links go through `I18nLink`. Text is i18n-driven (`common:*` namespace).

## Header

`Header.jsx` is the primary site header. Props:

| Prop | Default | Purpose |
|------|---------|---------|
| `headerClass` | `"bg-transparent"` | Background class |
| `logoBlack` | `true` | Show dark logo |
| `logoWhite` | `false` | Show white logo |
| `headerMenusClass` | `"ms-auto menu-right"` | Nav alignment |
| `btnLink` | `"/post-property"` | CTA destination |
| `btnText` | `t('header.postProperty')` | CTA label |
| `showHeaderBtn` | `true` | Toggle CTA |
| `showOffCanvasBtn` | `true` | Toggle off-canvas trigger |

Behaviour:

- **Sticky header** — a scroll listener (throttled via `requestAnimationFrame`, `{ passive: true }`) toggles `stickyHeader` once `window.scrollY > 100`. The state only updates on change to avoid re-renders.
- **Auth menu** — reads `user`, `isAuthenticated`, `logout` from `useAuthStore`. A user dropdown toggles on click and closes on outside-click (registered on `document`). Logout awaits `logout()` before navigating to `/` to avoid races with `PrivateRoute`.
- **UI triggers** — `handleMobileMenuClick` and `handleOffCanvas` come from `useUIStore`. The hamburger only shows on mobile (`d-lg-none`).
- **Skip-to-content link** is rendered first for keyboard/screen-reader users (audit 5.1).
- Embeds `NavMenu`, `LanguageSwitcher`, and `LazyImage`.

## NavMenu

`NavMenu.jsx` renders the desktop navigation from `navMenus` in `src/data/CommonData`. Features:

- **Overflow "More" menu** — measures each item's width on mount/resize and collapses overflowing items into a "More" dropdown (`visibleCount` / `overflowMenus` via `useMemo`). Disabled for the mobile class `nav-menu--mobile`.
- **Dropdowns** — top-level items with submenus toggle on click; `activeIndex` tracks the open dropdown. Outside-click (`mousedown`) and `Escape` close all dropdowns.
- **Active link** — `I18nNavLink`'s `isActive` adds the `active` class.
- **`onNavigate` callback** — lets parent components (e.g., `MobileMenu`) close after a click.

## MobileMenu

`MobileMenu.jsx` is a full-screen drawer shown below the `lg` breakpoint. It is controlled by `toggleMobileMenu` / `handleMobileMenuClose` in `useUIStore`. Behaviour:

- Renders `Logo`, `NavMenu` (with `nav-menu--mobile` class to disable the overflow logic), `LanguageSwitcher`, auth actions, and a **quick search input** (audit 5.3) that navigates to filtered property results.
- **Escape** closes the menu; **focus** moves to the first focusable element on open.
- Logout awaits `logout()` before navigating (audit 1.7) to prevent `PrivateRoute` redirect races.
- `handleNavigation(path)` navigates and closes in one step.

## OffCanvas

`OffCanvas.jsx` is a right-side panel (`d-lg-block d-none`) toggled by `offCanvas` / `handleOffCanvasClose` in `useUIStore`. Contents:

- `LogoWhite` + close button.
- **`SearchBox` mounted only while open** — the panel is always in the DOM, but eagerly mounting `SearchBox` would download ~230KB of Google Maps/Places JS on every cold load. Once opened, `window.google` is cached so reopening is free.
- Address list from `offCanvasInfos`, with external (`mailto:`, `tel:`, `http(s)://`) links rendered as `<a>`.
- Google Maps iframe sourced from `siteMetadata.mapEmbedUrl` (Gurugram service area — audit 5.4 replaced a hardcoded NYC iframe).
- `SocialList`.
- **Focus trap** via `useFocusTrap(panelRef, offCanvas)` (audit 5.5); `role="dialog"`, `aria-modal="true"`, `aria-label`.

## Footer

`Footer.jsx` composes a four-column footer: `FooterLogoDesc` (logo + description + contact + newsletter), `FooterUsefulItem` (quick links), `FooterServiceItem` (services), and a connect column with `SocialList`, `LanguageSwitcher`, and quick-action buttons (Search Properties, List Your Property, View Projects). It ends with `FooterBottom`. Everything is i18n-driven (`common:footer.*`).

`FooterTwo.jsx` is an alternate layout that swaps the connect column for `FooterInfo` + a "Contact Support" button and adds `SubscribeBox`.

### Footer subcomponents (`src/common/layout/footer/`)

- **`FooterLogoDesc.jsx`** — white logo, description, contact items (from `offCanvasInfos`), and an inline newsletter form (local state only — `isSubscribed` resets after 3s). This is separate from the Formspree-powered `SubscribeBox`.
- **`FooterServiceItem.jsx`** — lists `footerServiceLinks` from `CommonData` as `I18nLink`s.
- **`FooterUsefulItem.jsx`** — lists `footerUsefulLinks` (quick links).
- **`FooterInfo.jsx`** — two-column contact info grid from `footerInfos`.
- **`BottomFooterLinks.jsx`** — renders `BottomFooterLink` (legal links) used by `FooterBottom`.
- **`SubscribeBox.jsx`** — Formspree form (`useForm("mkgzdjyj")`) with success state and `ValidationError` display.

### FooterBottom
`FooterBottom.jsx` accepts a `footerClass` prop and renders the copyright line ("© 360Ghar {year} | All rights reserved") plus `BottomFooterLinks`.

## Breadcrumb

`Breadcrumb.jsx` accepts `pageTitle`, `pageName`, and an optional `variant`. When `variant === 'compact'` it applies the `breadcrumb--compact` class instead of `padding-y-120`. It renders a `breadcrumb-img.webp` background (priority `LazyImage`), an H2 of `pageTitle`, and a two-step list (Home / `pageName`). The Home link goes through `I18nLink`.

## ScrollToTop

`ScrollToTop.jsx` is a floating button that appears once `window.scrollY > 400` (audit 5.10, to avoid distracting on short pages). It uses `visibility` rather than conditional render so the button stays in the accessibility tree. Clicking calls `window.scroll({ top: 0, behavior: 'smooth' })`. The icon uses the brand `text-gradient` class.

## Responsive Behaviour Summary

| Breakpoint | Header | Nav | Mobile menu | Off-canvas |
|------------|--------|-----|-------------|------------|
| `< lg` (mobile/tablet) | Hamburger shown, `NavMenu` hidden | Hidden | Full-screen drawer | Hidden (`d-none`) |
| `≥ lg` (desktop) | Full nav + CTA | Overflow-aware `NavMenu` | Hidden | Available (`d-lg-block`) |

The sticky header activates past 100px scroll on all viewport sizes. Focus management (focus trap in `OffCanvas`, first-focusable in `MobileMenu`, skip-link in `Header`) ensures keyboard accessibility throughout.

## Cross-Links

- [UI Components](../components/UI-Components) for `SectionHeading`, `Button`, `LazyImage`, `SocialList`.
- [Common UI Elements](Forms-Inputs) for `SearchBox`, `GooglePlacesInput`.
- [SEO](SEO) for `siteMetadata` used by the off-canvas map.
- [Architecture](../Architecture) for how the header/footer mount in `App.jsx`.
