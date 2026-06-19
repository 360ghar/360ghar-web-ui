# Lore

A walking tour through the history of the 360Ghar frontend, reconstructed from the 84 commits on `main` between May 2025 and June 2026. Every event below is dated to the month it landed.

## Eras

### Era 1 — Foundation (May 2025 – Aug 2025)

The repository's first commit landed on **May 2025** with the laconic message "Initial Commit". The seed already carried a full static asset bundle (Bootstrap, FontAwesome, LineAwesome fonts, a compiled `main.css`) and the now-superseded `react-image-lightbox`, which was replaced with `yet-another-react-lightbox` in the very next commit on the same day.

After a three-month quiet stretch, **August 2025** brought the first real architecture work: routing paths were refactored, the property-related component and service layer was introduced, and two rounds of "mixed content" fixes hardened the API surface to HTTPS. This is the era in which the React + Vite skeleton, the SCSS 7-1 directory under `public/assets/sass/`, and the basic property data model took shape.

### Era 2 — SEO & UX polish (Sep 2025 – Nov 2025)

**September 2025** is when 360Ghar started to look like a product. The API service structure was hardened to enforce HTTPS, the `SEO` component was added and integrated across pages, and the policies page and details view shipped.

**October 2025** was the densest month of the era (7 commits): a major "Restructure application pages and components" refactor, a branding refresh, header styling work, a revamp of the Property Details section, account management components, Android `assetlinks.json` for app integration, and the first wave of tool pages (3D Blueprint design tool, Vastu Checker). This is also when the original `src/pages/unused/` directory — mentioned in CLAUDE.md as holding legacy `HomeOne/HomeTwo/HomeThree` and placeholder `Cart/Checkout` pages — was relevant. Those legacy variants have since been removed; the directory no longer exists on `main`.

**November 2025** closed the era with a team page update, Google Places API key configuration, and the API proxy setup that still powers address autocomplete today.

### Era 3 — AI & Data Hub buildout (Dec 2025 – Feb 2026)

**December 2025** opened the AI chapter: the AI Design Studio tool with Puter integration landed, the Reimagine Photo form was simplified, and the Property Management Showcase section was added to the homepage. A parallel "agent skills, code refactoring, and design system" commit reorganized the codebase.

**January 2026** was the era's peak (7 commits). Locality-specific pages and dynamic sitemap generation shipped, followed by a sweeping UI/UX redesign with loading skeletons, then the AI Agent showcase, competitor comparison pages, and "truth exposure" pages. The Refer & Earn feature and a dev-dependency upgrade closed the month.

**February 2026** (5 commits) was dominated by the AI ChatBot, built across six explicit phases: chat service & store (Phase 1), core shell components (Phase 2), `ChatMessages` and `ChatInput` (Phase 3), message sub-components (Phase 4), the widget system (Phase 5), SCSS styles and App wiring (Phase 6). ESLint was downgraded back to `^9` to resolve a Netlify peer-dependency conflict — a constraint that still applies today.

### Era 4 — Optimization & scale (Mar 2026 – Jun 2026)

**March 2026** is the single most active month in the project's history, with **31 commits** — more than a third of the project's total. The month opened with dual Gurgaon/Gurugram SEO (301 redirects, canonical fix), then a sustained data-hub sprint: the `dataHubService` and `useDataHubStore`, ten shared data-hub components (`ScoreWheel`, `AuctionCard`, badges, widgets), the circle rate directory and stamp duty calculator, the RERA directory, bank/court auction pages, regulatory updates, builder reputation pages, verify-ownership and zone-checker pages, and finally the data-hub routing, navigation, SEO, and sitemap wiring. Two fix passes cleaned up react-hooks lint errors and twelve API contract mismatches.

A **major codebase restructuring** commit in March also introduced RSS feeds, testing infrastructure, and the Netlify migration. Puppeteer was added for prerendering, Chrome was explicitly installed for Netlify's Chromium cache, geolocation and Supabase auth were skipped during prerender, and `svgo` made the prerender step resilient to per-route failures. A "careers section with internship listings" commit rounded out the month.

**April 2026** was quiet (1 commit) — a fix guarding against null elements in `PropertyDetails`.

**May 2026** (13 commits) returned to SEO and i18n: an SEO overhaul with new pages and programmatic landing improvements, AI discoverability with WebMCP tools and performance optimizations, Hindi (`hi`) internationalization with full i18n infrastructure, a Software Developer Intern role on the careers page, a Linktree-style `/links` page, password reset flow, tools index page, customer reviews section, GSC-targeted SEO on the Area Calculator, Area Converter, and Vastu Checker, and the rent receipt generator tool.

**June 2026** (3 commits) is the current era: PostHog session replay with SPA pageview tracking, user identity, and CWV capture; AVIF/WebP image optimization with a phone auth flow; LCP optimization and reduced JS payload on prerendered pages; and finally the SEO/GEO/AEO optimization pass across nine tool pages.

## Longest-standing features

Several files introduced in Era 1 or early Era 2 are still actively modified in 2026:

- `src/App.jsx` — present since the initial routing refactor, it is the second-most-changed file in the last 90 days (13 changes), absorbing every new route, prerender guard, and i18n provider.
- `public/assets/sass/` — the SCSS 7-1 architecture and the `_property.scss` partial (now 2,059 lines) have grown continuously since the May 2025 asset seed.
- `src/pages/Home.jsx` — touched 8 times in the last 90 days; it has absorbed the Property Management Showcase, customer reviews, and the 3D page loader over its lifetime.
- The property filter components (`PropertyFilters.jsx`, 967 lines) and `PropertyDetailsSection.jsx` (1,307 lines) trace back to the August–October 2025 property component work and remain among the largest files in the repo.
- The SEO component and `src/seo/` directory, born in September 2025, has ballooned to 11 files and 3,217 lines — `structuredData.js` alone is 1,519 lines, the largest source file in the codebase.

## Deprecated and removed features

- **Legacy home variants** — `HomeOne`, `HomeTwo`, `HomeThree` and the placeholder `Cart`/`Checkout` pages once lived in `src/pages/unused/`, as documented in CLAUDE.md. That directory no longer exists on `main`; the legacy designs and e-commerce placeholders have been removed in favor of the single `Home.jsx`.
- **`react-image-lightbox`** — replaced by `yet-another-react-lightbox` in the second commit, May 2025.
- **Backend `/api/v1/auth/*` login/register flows** — explicitly prohibited by AGENTS.md. Supabase Auth SDK now owns session handling; the old backend auth endpoints must not be reintroduced.
- **ESLint 10** — the codebase attempted an upgrade and rolled back to `^9` in February 2026 because `eslint-plugin-react@7.x` does not declare peer support for ESLint 10+ and Netlify's strict resolver fails the install.

## Major rewrites

- **October 2025 — "Restructure application pages and components"** (`a420338`): the largest structural reorganization of Era 2, moving pages into the feature-domain subdirectories (`account/`, `blogs/`, `properties/`, etc.) still in use today.
- **January 2026 — UI/UX redesign** (`4c5795f`): "loading skeletons, new components, and extensive style updates across the application." This is the commit that introduced the shimmer-skeleton loading pattern that later became central to the prerender UX.
- **March 2026 — Major codebase restructuring, RSS, testing, Netlify migration** (`a92fea4`): the biggest single-commit reorganization in the project. It introduced the build-script library (`scripts/lib/`), RSS generation, the test harness, and the Netlify deployment configuration that now powers production.
- **March 2026 — Data Hub integration** (`855bd74` + preceding data-hub commits): ten new shared components, six new page types, and the integration of data-hub panels into the property detail page.

## Growth trajectory

The codebase grew in clear pulses rather than a steady line. Era 1 (May–Aug 2025, 5 commits) produced the skeleton. Era 2 (Sep–Nov 2025, 12 commits) added the SEO layer, branding, and the first tool pages. Era 3 (Dec 2025–Feb 2026, 19 commits) layered in AI features and the chatbot. Era 4 (Mar–Jun 2026, 48 commits) is where the codebase roughly doubled in surface area: the data-hub subsystem, the prerender pipeline, i18n, analytics, and the GEO/AEO optimization pass all landed here.

The single biggest inflection is **March 2026**, which alone accounts for 31 of the project's 84 commits (37%). Almost every system that now distinguishes 360Ghar from a stock React real-estate template — the data hub, the prerender pipeline, the RSS feed, the test harness, the Netlify config — traces back to that month.

## Notes on the journey

What stands out across the history is how consistently the work has stayed on-theme: nearly every commit advances either property search, SEO/discoverability, or tooling for buyers. There are very few "refactor for refactor's sake" commits. The three surviving `TODO`/`FIXME`/`HACK` markers across 61,000 lines suggest either aggressive cleanup or a habit of finishing what is started before moving on — likely both, given the cadence.
