# Repository Guidelines

## Project Structure & Module Organization

- Frontend is a React 18 + Vite app under `src/`.
- Pages live in `src/pages/` (route-level components).
- Reusable UI lives in `src/components/` and `src/common/`.
- API access is centralized in `src/services/`; state in `src/store/` (Zustand) and `src/contextApi/`.
- Static data is in `src/data/`; global styles and assets are in `public/assets/`.
- SEO helpers and sitemap tools are in `src/seo/` and `scripts/generate-sitemaps.mjs`.

## Build, Test, and Development Commands

- `npm install` – Install dependencies.
- `npm run dev` – Start Vite dev server.
- `npm run build` – Generate production build (runs sitemap generation first).
- `npm run preview` – Preview the built app locally.
- `npm run lint` – Run ESLint; fix all reported issues before committing.

## Coding Style & Naming Conventions

- Use modern React with functional components and hooks.
- Follow existing patterns for imports, spacing, and JSX; prefer small, focused components.
- Components and pages use `PascalCase` filenames (e.g., `Home.jsx`); helpers, stores, and services use `camelCase` (e.g., `authStore.js`, `propertyService.js`).
- Keep side effects inside hooks and services, not JSX trees.

## Testing Guidelines

- No formal test suite is configured yet; manually verify key flows (auth, property search, contact forms) using `npm run dev`.
- If you add tests, prefer Vitest + React Testing Library under `src/__tests__/` or `*.test.jsx` and add an `npm test` script.

## Commit & Pull Request Guidelines

- Use conventional-style commit messages, e.g. `feat: add project guides section` or `fix: resolve property filter bug`.
- Each PR should be focused, include a brief summary, list any new env vars or API dependencies, and link related issues.
- For UI changes, attach before/after screenshots and note how you tested (`npm run dev`, `npm run build`, `npm run lint`).

## Security & Configuration

- Do not commit real API keys or secrets; use `.env.local` for machine-specific values (e.g., `VITE_API_BASE_URL`, `VITE_GOOGLE_PLACES_API_KEY`).
- When changing API usage, update `src/services/` and keep configuration in Vite env variables, not hard-coded URLs.
- Auth/session handling must stay SDK-managed via Supabase client (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`); do not reintroduce backend `/api/v1/auth/*` login/register flows.

## Branding & Design Guidelines

All UI components must follow the 360Ghar brand guidelines defined in `src/styles/_theme.scss`. Never hardcode colors - always use CSS custom properties.

### Primary Brand Colors

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--main-color` | `#ff6b00` | Primary orange - buttons, highlights, hero sections |
| `--main-color-dark` | `#cc5500` | Darker variant - hover states, gradients |
| `--main-color-light` | `#ff8c3a` | Lighter variant - secondary highlights |
| `--main-color-lighter` | `#fff5eb` | Very light - subtle backgrounds |
| `--cta-color` | `#0369A1` | Call-to-action buttons, links |

### Semantic Colors

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--success-color` | `#28a745` | Success states, checkmarks, positive indicators |
| `--danger-color` | `#dc3545` | Errors, warnings, negative indicators |
| `--warning-color` | `#ffc107` | Caution states, partial success |
| `--info-color` | `#17a2b8` | Informational messages |

### Text Colors

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--text-primary` | `#181616` | Headings, primary text |
| `--text-secondary` | `#777777` | Body text |
| `--text-muted` | `#6b7385` | Secondary/muted text |

### Border & Background Colors

| Variable | Hex Value | Usage |
|----------|-----------|-------|
| `--border-color-light` | `#e0e6ed` | Card borders, dividers |
| `--bg-light` | `#f8f8f8` | Light backgrounds |
| `--bg-white` | `#ffffff` | White backgrounds |

### Typography

| Variable | Font | Usage |
|----------|------|-------|
| `--font-heading` | 'Cinzel', serif | All headings (h1-h6) |
| `--font-body` | 'Josefin Sans', sans-serif | Body text, paragraphs |

### Card Styling Pattern

All cards should follow this consistent pattern:

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

### Section Padding Classes

| Class | Padding | Usage |
|-------|---------|-------|
| `padding-y-120` | 120px top/bottom | Major sections |
| `padding-y-60` | 60px top/bottom | Medium sections |
| `padding-t-120 padding-b-60` | Mixed | Asymmetric sections |

### Gradients (Brand Colors Only)

```scss
// Correct - Use brand orange gradient
background: linear-gradient(135deg, var(--main-color) 0%, var(--main-color-dark) 100%);

// Wrong - Never use generic purple/blue gradients
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Buttons

- Primary: `btn btn-main` or `btn btn-primary`
- Outline: `btn btn-outline-main`
- Hover effects: Use transform and box-shadow transitions

### Common Components to Use

- `SectionHeading` - For all section titles with subtitles
- `Button` - For action buttons with icons
- `Cta` - For bottom call-to-action sections
- `LazyImage` - For lazy-loaded images
- `SEO` - For meta tags and structured data

### Do Not

- ❌ Hardcode hex colors in components (e.g., `color: #ff6b00`)
- ❌ Use purple/blue gradients (use orange brand gradient)
- ❌ Skip CSS custom properties
- ❌ Use inline styles for colors
- ❌ Create new color variables outside `_theme.scss`

### Always

- ✅ Use `var(--main-color)` for primary orange
- ✅ Use `var(--success-color)` for positive indicators
- ✅ Use `var(--danger-color)` for negative indicators
- ✅ Use semantic classes like `text-success`, `text-muted`
- ✅ Follow existing card patterns in `phase1-additions.scss`

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
- One-time prerequisite: create the first wiki page via GitHub UI to initialize the `.wiki.git` backend
