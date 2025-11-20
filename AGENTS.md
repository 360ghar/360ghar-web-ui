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

