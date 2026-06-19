# Patterns & Conventions

This page is the authoritative style guide for the 360Ghar frontend. Follow it for every change so the codebase stays consistent, brandable, and debuggable. It complements [Architecture](../Architecture), which describes the system design.

## Key Files

| File | Purpose |
|------|---------|
| `src/styles/_theme.scss` | Brand tokens as CSS custom properties |
| `src/services/http.js` | Axios instance factory, `extractError`, retry logic |
| `src/store/index.js` | Zustand store barrel |
| `public/assets/sass/` | SCSS 7-1 architecture |
| `AGENTS.md` | Branding and design rules |

## Components

- **Functional components and hooks only.** No class components, no `React.createClass`.
- **PascalCase filenames** for components and pages: `PropertyItem.jsx`, `BlogDetails.jsx`.
- **camelCase filenames** for services, stores, utils, hooks: `propertyService.js`, `propertyStore.js`, `useLocalitiesIndex.js`.
- Keep pages thin: route-level components in `src/pages/` wire data fetching and SEO, then compose section components from `src/components/` and `src/common/`. Business logic lives in stores and services, not JSX trees.
- Side effects belong in `useEffect` or services, never inline in the render body.

## State Management

- **Zustand is the primary state library.** Stores live in `src/store/` (`authStore`, `propertyStore`, `userStore`, `locationStore`, `visitStore`, `agentStore`, `adminStore`).
- **React Context is reserved for legacy UI state** that must flow through the tree (e.g. `BlogDataContext`). Do not add new context providers for global state; add a Zustand store instead.
- Use scoped selectors to avoid re-render loops:

  ```js
  // Good: returns a primitive
  const page = usePropertyStore((s) => s.pagination.page);

  // Bad: returns a new object literal every call
  const { page } = usePropertyStore((s) => s.pagination);
  ```

- Persisted slices use Zustand's `persist` middleware with explicit `partialize` and storage keys.

## Services and Error Handling

- All HTTP goes through `src/services/http.js`, the Axios instance factory. It enforces HTTPS (except localhost), a 30s timeout, 3 retries on 5xx GETs, and a 401 interceptor that clears auth and redirects to `/login`.
- `src/services/api.js` is the authenticated instance; public services (`propertyAPIService`, `blogService`, `vastuService`) use a plain instance without `withAuth`.
- Every service uses the shared `extractError` helper to normalize FastAPI/Pydantic v2 error shapes into a string:

  ```js
  const extractError = (err, fallback) => {
    // handles err.response.data.detail, detail[].msg, and plain strings
    // returns a human-readable message
  };
  ```

  Stores receive the normalized message and expose it as `error` in their state.

## Styling

### Brand tokens, never hex

All colors come from `src/styles/_theme.scss` as CSS custom properties. Never hardcode hex values in components or inline styles.

| Variable | Value | Usage |
|----------|-------|-------|
| `--main-color` | `#ff6b00` | Primary orange: buttons, highlights, hero |
| `--main-color-dark` | `#cc5500` | Hover states, gradients |
| `--main-color-light` | `#ff8c3a` | Secondary highlights |
| `--cta-color` | `#0369A1` | Call-to-action buttons, links |
| `--success-color` | `#28a745` | Positive indicators |
| `--danger-color` | `#dc3545` | Errors, negative indicators |
| `--text-primary` | `#181616` | Headings, primary text |
| `--text-secondary` | `#777777` | Body text |
| `--border-color-light` | `#e0e6ed` | Card borders, dividers |
| `--font-heading` | `'Cinzel', serif` | All headings |
| `--font-body` | `'Josefin Sans', sans-serif` | Body, paragraphs |

### Card pattern

All cards follow the same shape with a subtle lift on hover:

```scss
.card-name {
  background: #fff;
  border: 1px solid var(--border-color-light);
  border-radius: 18px;
  padding: 24px;
  box-shadow: 0 12px 24px rgba(16, 24, 40, 0.04);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.card-name:hover {
  transform: translateY(-3px);
  box-shadow: 0 16px 32px rgba(255, 107, 0, 0.1);
}
```

### Section padding

| Class | Padding | Usage |
|-------|---------|-------|
| `padding-y-120` | 120px top/bottom | Major sections |
| `padding-y-60` | 60px top/bottom | Medium sections |
| `padding-t-120 padding-b-60` | mixed | Asymmetric sections |

### Gradients

Use the brand orange gradient. Never use generic purple/blue gradients:

```scss
// Correct
background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);

// Wrong
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Buttons

- Primary: `btn btn-main` or `btn btn-primary`
- Outline: `btn btn-outline-main`
- Hover effects use `transform` and `box-shadow` transitions, not color flips.

## Common Components to Reuse

Before building a new primitive, check `src/common/`:

- `SectionHeading` for all section titles with subtitles
- `Button` for action buttons with icons
- `Cta` for bottom call-to-action sections
- `LazyImage` for lazy-loaded images
- `SEO` for meta tags and structured data
- `Pagination`, `StarRating`, `Breadcrumb`, `PageTitle`

## Internationalization

All user-facing strings flow through `react-i18next` with the `useTranslation` hook. Translation namespaces include `common`, `properties`, `blog`, `account`, `tools`, `policies`, `seo`, and `landing`. Do not hardcode English copy in JSX. See [Internationalization](../features/Internationalization).

## SEO

Every page wraps its meta in `src/common/SEO.jsx`, which renders `react-helmet-async` tags plus JSON-LD structured data from `src/seo/structuredData.js`. Pass `canonical`, `title`, `description`, `keywords`, `image`, `type`, and `structuredData` on every page. See [SEO](../common/SEO).

## Do and Do Not

- ✅ Use `var(--main-color)` for primary orange.
- ✅ Use semantic classes (`text-success`, `text-muted`).
- ✅ Follow the existing card and section patterns.
- ❌ Hardcode hex colors (`color: #ff6b00`).
- ❌ Use purple/blue gradients.
- ❌ Use inline styles for colors.
- ❌ Create new color variables outside `_theme.scss`.
- ❌ Reintroduce backend `/api/v1/auth/*` login/register flows; auth is SDK-managed via Supabase.

For the full system layout, see [Architecture](../Architecture). For the PR checklist that enforces these conventions, see [Development Workflow](Development-Workflow).
