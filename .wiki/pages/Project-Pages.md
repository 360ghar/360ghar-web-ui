# Project Pages

Project pages showcase new-launch and resale real estate projects in Gurugram. They are simpler than property pages: a listing page and a dynamic detail page, both driven by static data in `src/data/OthersPageData/projectItems` and rendered through portfolio components in `src/components/project/`. There is no dedicated project store or service; SEO metadata is resolved client-side from the URL slug.

## Key Files

| Route | Page File | Purpose |
|-------|-----------|---------|
| `/project` | `src/pages/projects/Project.jsx` | Project listings page |
| `/project/:title` | `src/pages/projects/ProjectDetails.jsx` | Project detail page (dynamic) |

Supporting files:

| File | Purpose |
|------|---------|
| `src/components/project/ProjectSection.jsx` | Renders the project grid on the listing page |
| `src/components/project/ProjectDetailsSection.jsx` | Renders the detail page body |
| `src/components/project/Portfolio.jsx` | Portfolio grid wrapper |
| `src/components/project/PortfolioItem.jsx` | Individual project card |
| `src/data/OthersPageData.js` | `projectItems` array (slug, title, desc, image) |

## Page Details

### Project (`/project`)

The project listing page. Mounts `ProjectSection`, which renders a portfolio grid of `PortfolioItem` cards from `projectItems`. SEO is set with translated `projectPage.seoTitle`, `seoDescription`, and `seoKeywords` from the `projects` i18next namespace, canonical `/projects`, and the default OG image. The header CTA links to `/post-property`. Note the route is `/project` (singular) while the page is conceptually a directory.

### ProjectDetails (`/project/:title`)

Dynamic detail page. Reads `title` (the slug) from `useParams` and resolves metadata via `resolveProjectMeta(slug)`, which matches against `projectItems` by `slug`. If no match is found, the page renders a not-found state and sets `noindex` so unmatched slugs do not pollute the index.

SEO is built dynamically from the matched project:

- Title: `${projectMeta.title} in ${defaultCity} | 360Ghar`
- Description: `projectMeta.desc` or a not-found fallback
- Keywords: `${projectMeta.title} ${defaultCity}, real estate project, floor plans, amenities`
- Canonical: `/project/${title}`
- Structured data: `BreadcrumbList` (Home > Projects > Project Title)

The body is rendered by `ProjectDetailsSection`, which shows the project hero, floor plans, amenities, and a CTA. All copy is translated via the `projects` namespace.

## Patterns

- **Slug-driven SEO**: because there is no project API, the detail page resolves all metadata from the static `projectItems` array. Adding a project means adding an entry to `src/data/OthersPageData.js` with a unique `slug`.
- **No store, no service**: project pages do not use a Zustand store or an Axios service. They are entirely static, which keeps them fast and prerenderable.
- **Indexation**: matched projects are indexable; unmatched slugs are `noindex`. This guards the index from link scrapers hitting random slugs.
- **i18n**: all user-facing strings go through the `projects` namespace; the default city label comes from `projectPage.defaultCity`.

## Compared to Property Pages

Project pages are about developments (e.g. a DLF launch), while [Property Pages](Property-Pages) are about individual listings. Projects link into property search so users can browse available units within a project. See [Property Components](../components/Property-Components) for the shared card patterns and [SEO & Programmatic](../features/SEO-Programmatic) for how project URLs appear in sitemaps.
