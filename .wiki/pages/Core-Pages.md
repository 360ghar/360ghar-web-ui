# Core Pages

Core pages are the content and policy surfaces of 360Ghar that are not property listings, tools, or programmatic SEO landing pages. They live in `src/pages/core/` and cover company info, contact, FAQs, legal policies, and the long-form Gurugram real estate guides. Each page is a thin route component that sets SEO meta via `src/common/SEO.jsx`, composes section components, and translates copy through `react-i18next`.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/about-us` | `src/pages/core/AboutUs.jsx` | Company about page with team and areas covered |
| `/contact` | `src/pages/core/Contact.jsx` | Contact form and RealEstateAgent schema |
| `/faq` | `src/pages/core/FaqPage.jsx` | FAQ page with FAQPage structured data |
| `/gurugram-real-estate-guide` | `src/pages/core/GurugramGuide.jsx` | Long-form Gurugram market guide |
| `/property-investment-gurugram` | `src/pages/core/PropertyInvestment.jsx` | Investment guide for Gurugram |
| `/for-ai` | `src/pages/core/ForAI.jsx` | AI assistant / LLM crawling guidance |
| `/policies` | `src/pages/core/Policies.jsx` | List of legal policy pages |
| `/policies/:slug` | `src/pages/core/PolicyDetails.jsx` | Individual policy page (dynamic) |
| `*` | `src/pages/core/NotFound.jsx` | 404 with search box |

## Page Details

### AboutUs (`/about-us`)

Renders the company story, team members, and areas 360Ghar covers. Uses `AboutThree`, `PropertyTypeThree`, `AreasWeCover`, `OwnerCta`, `Team`, and `Cta` from `src/components/`. Emits `AboutPage`, `Organization`, `BreadcrumbList`, and `Person` structured data for the founder and leadership team (Saksham Mittal, Priya Singh, Vikram Malhotra). SEO copy is translated via the `policies` and `seo` i18next namespaces.

### Contact (`/contact`)

The contact page wires `ContactTop` and `ContactUsSection` from `src/components/contact/`. It emits a `RealEstateAgent` schema with the company address (Gurugram 122001), email, and phone, plus a `LocalBusiness` / `RealEstateAgent` composite and a `BreadcrumbList`. The form submission is handled inside `ContactUsSection`. Canonical is `/contact`.

### FaqPage (`/faq`)

A focused FAQ page composing `FaqTwo`, `FaqContactUs`, `CounterFour`, and `Cta`. FAQ content comes from `src/data/HomeThreeData/faqs` and is rendered both as accordion UI and as a `FAQPage` JSON-LD schema for rich results. Canonical is `/faq`.

### GurugramGuide (`/gurugram-real-estate-guide`)

Long-form SEO guide to buying, selling, and renting in Gurugram. Uses `I18nLink` for internal cross-linking to localities and property search. Emits `Article` and `BreadcrumbList` structured data. Copy is fully translated through the `policies` namespace (`gurugramGuide.*` keys).

### PropertyInvestment (`/property-investment-gurugram`)

Investment-focused companion to the Gurugram guide. Same `Article` + `BreadcrumbList` pattern, with breadcrumbs built from `propertyInvestment.breadcrumbHome` / `breadcrumbCurrent` keys. Cross-links to the main guide and property search.

### ForAI (`/for-ai`)

A public page that tells AI assistants and crawlers how to interact with 360Ghar. Pulls the `aiDiscoveryFeed` from `src/seo/aiDiscovery` and emits `Organization`, `WebSite` (with `SearchAction`), and related schemas so LLMs can discover the property search and tool endpoints. SEO copy uses the `seo` namespace `forAI.*` keys. See [SEO & Programmatic](../features/SEO-Programmatic) for the AI discovery strategy.

### Policies (`/policies`)

Lists the five legal policy pages defined in `POLICY_DEFINITIONS`: Terms of Service, Privacy Policy, Content Guidelines, Content Takedown Policy, and Grievance Redressal Mechanism. Each entry has a `uniqueName`, fallback title, and description. The list is rendered from `src/data` and links to `/policies/:slug`. Each policy's metadata is fetched from `pageService.getPublicPage(uniqueName)` on demand by `PolicyDetails`.

### PolicyDetails (`/policies/:slug`)

Dynamic policy page. Reads `slug` from `useParams`, calls `pageService.getPublicPage(slug)` (a public, no-auth endpoint), and renders the returned markdown content via `react-markdown` with `remark-gfm`. Markdown components customize links (open in new tab) and tables (wrap in `.table-responsive`). Emits `CreativeWork` structured data with `dateModified`. Shows a loading spinner and a warning alert on error. The `POLICY_DEFINITIONS` map provides a fallback title when the API has no content.

### NotFound (`*`)

The catch-all 404 page. Includes a search box that navigates to `/properties?q=...&city=Gurgaon` so users can recover, plus quick links home. SEO meta uses the `seo` namespace `notFound.*` keys.

## Shared Patterns

- Every page wraps content in `<main className="body-bg">` with `Header`, `Footer`, `MobileMenu`, and `OffCanvas`.
- SEO is set through `src/common/SEO.jsx` with `title`, `description`, `keywords`, `canonical`, `image`, `type`, and `structuredData`.
- Breadcrumbs are generated with `generateBreadcrumbStructuredData` from `src/seo/structuredData`.
- All copy is translated with `useTranslation` across the `policies`, `seo`, and `common` namespaces.

See [Patterns & Conventions](../how-to-contribute/Patterns-Conventions) for the styling and component rules these pages follow, and [SEO](../common/SEO) for the structured data helpers.
