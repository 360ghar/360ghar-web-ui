# By the numbers

> Data collected on 2026-06-19. Figures were gathered by running shell commands against the repository at `https://github.com/360ghar/frontend.git` and reflect the state of the `main` branch on that date.

## Size at a glance

360Ghar's frontend is a mid-sized React application: roughly **61,000 lines** of JavaScript/JSX across **418 source files**, layered on top of **10,868 lines** of SCSS in **91 stylesheets**. A solo project, it has accumulated **84 commits** between May 2025 and June 2026.

```mermaid
---
config:
    xychart:
        x-axis: "Lines of code"
        y-axis: "Category"
        height: 500
        width: 900
---
xychart-beta
    title "Lines of code by category"
    x-axis "Pages", "Components", "Common", "Services", "Stores", "Scripts", "SCSS"
    y-axis "Lines" 0 --> 25000
    bar [23451, 20136, 5557, 1769, 1538, 5279, 10868]
```

## Source files by type

| Type | Files | Lines | Avg lines/file |
|------|------:|------:|---------------:|
| Pages (`src/pages`) | 100 | 23,451 | 234 |
| Components (`src/components`) | 163 | 20,136 | 123 |
| Common (`src/common`) | 75 | 5,557 | 74 |
| Services (`src/services`) | 23 | 1,769 | 76 |
| Stores (`src/store`) | 14 | 1,538 | 109 |
| SEO (`src/seo`) | 11 | 3,217 | 292 |
| Static data (`src/data`) | 13 | 3,522 | 270 |
| Build scripts (`scripts/`) | 24 | 5,279 | 220 |
| SCSS (`public/assets/sass`) | 91 | 10,868 | 119 |
| **Total source (JS/JSX)** | **418** | **61,389** | **147** |

## Dependencies

The project pulls in **82** production and development dependencies from `package.json`. The runtime stack is anchored by React 18.2, Vite 7.3, Zustand 5, React Router v6, Supabase, PostHog, i18next, Formik, and Axios.

## Activity

### Commits per month

```mermaid
---
config:
    xychart:
        height: 450
        width: 900
---
xychart-beta
    title "Commits per month"
    x-axis "May 25", "Aug 25", "Sep 25", "Oct 25", "Nov 25", "Dec 25", "Jan 26", "Feb 26", "Mar 26", "Apr 26", "May 26", "Jun 26"
    y-axis "Commits" 0 --> 35
    bar [2, 3, 3, 7, 2, 7, 7, 5, 31, 1, 13, 3]
```

The shape is telling: a slow ramp through late 2025, a single explosive month in **March 2026 (31 commits)** when the data-hub, RERA directory, Netlify prerender pipeline, and major restructuring all landed together, followed by a sustained optimization push through May and June 2026.

### Most changed files in the last 90 days

These are the files touched most often in commits since mid-March 2026, ranked by commit count:

| Rank | File | Changes |
|-----:|------|--------:|
| 1 | `src/data/localities.json` | 13 |
| 2 | `src/App.jsx` | 13 |
| 3 | `src/data/localities-index.json` | 12 |
| 4 | `src/seo/toolSchemas.js` | 9 |
| 5 | `src/seo/structuredData.js` | 9 |
| 6 | `src/seo/indexationPolicy.js` | 8 |
| 7 | `src/pages/data-hub/BankAuctions.jsx` | 8 |
| 8 | `src/pages/Home.jsx` | 8 |
| 9 | `src/pages/tools/EmiCalculator.jsx` | 7 |
| 10 | `src/pages/tools/AreaConverter.jsx` | 7 |

The list is dominated by SEO tooling (`src/seo/`), locality data, and the data-hub pages, which matches the recent focus on GEO/AEO optimization and programmatic locality SEO.

## Complexity

### Largest source files

| File | Lines |
|------|------:|
| `src/seo/structuredData.js` | 1,519 |
| `src/components/property/PropertyDetailsSection.jsx` | 1,307 |
| `src/components/forms/LoginRegister.jsx` | 1,162 |
| `src/data/OthersPageData.jsx` | 1,026 |
| `src/pages/localities/LocalityTemplate.jsx` | 981 |
| `src/components/property-filters/PropertyFilters.jsx` | 967 |
| `src/pages/tools/AIDesignStudio.jsx` | 702 |
| `src/pages/tools/RentReceipt.jsx` | 698 |
| `src/data/competitors.js` | 684 |
| `src/pages/tools/EmiCalculator.jsx` | 679 |

### Average file size by directory

```mermaid
---
config:
    xychart:
        height: 450
        width: 900
---
xychart-beta
    title "Average lines per file by directory"
    x-axis "SEO", "Data", "Pages", "Scripts", "Stores", "Components", "Services", "Common"
    y-axis "Avg lines/file" 0 --> 320
    bar [292, 270, 234, 220, 109, 123, 76, 74]
```

The `src/seo/` directory has the densest files (292 lines each on average), driven by the 1,519-line `structuredData.js`. `src/data/` follows at 270 lines/file, reflecting large static data objects. Common UI primitives in `src/common/` stay small at 74 lines/file.

### Largest SCSS files

| File | Lines |
|------|------:|
| `partials/home/_property.scss` | 2,059 |
| `components/_chatbot.scss` | 970 |
| `abstracts/_wordpress-default.scss` | 577 |
| `layout/_header.scss` | 445 |
| `components/_form.scss` | 386 |

### Largest build scripts

| File | Lines |
|------|------:|
| `scripts/refresh-image-assets.mjs` | 566 |
| `scripts/prerender-pages.mjs` | 386 |
| `scripts/generate-rss.mjs` | 309 |
| `scripts/lib/imageRefreshManifest.mjs` | 279 |
| `scripts/lib/paginatedApi.mjs` | 263 |

## Code health signals

| Signal | Count |
|--------|------:|
| `TODO` / `FIXME` / `HACK` markers | 3 |
| Total commits | 84 |
| Commit window | May 2025 – Jun 2026 |
| Contributors | Solo project |

Only three outstanding `TODO`/`FIXME`/`HACK` markers across the entire source tree is a notably clean state for a codebase this size, though it may also reflect the solo-developer dynamic where follow-up work is tracked externally rather than in inline comments.
