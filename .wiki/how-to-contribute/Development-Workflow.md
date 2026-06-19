# Development Workflow

This page walks through the day-to-day workflow for contributing to the 360Ghar frontend, from branching to merge. Follow it for every change, no matter how small, so the codebase stays consistent and Netlify builds stay green.

## Key Files

| File | Purpose |
|------|---------|
| `package.json` | Scripts (`dev`, `build`, `lint`, `test`, `preview`) and dependency pins |
| `vite.config.js` | Vite dev server, `/api` proxy to `http://localhost:3600` |
| `eslint.config.js` | ESLint 9 flat config |
| `.env.example` | Required `VITE_*` env vars |
| `netlify.toml` | Netlify build command, redirects, headers |
| `CLAUDE.md` / `AGENTS.md` | Repo-specific coding and branding rules |

## 1. Branch from `main`

All work branches off `main` and lands back on `main`. Use a short, descriptive, kebab-case branch name prefixed by the type of change:

```bash
git checkout main
git pull origin main
git checkout -b feat/emi-amortization-table
```

Common prefixes: `feat/`, `fix/`, `perf/`, `chore/`, `docs/`, `refactor/`.

## 2. Install and Configure

```bash
npm install
cp .env.example .env.local   # fill in VITE_* values
```

Netlify uses **strict peer dependency resolution**. If `npm install` reports `ERESOLVE`, fix the conflict locally before pushing. In particular, `eslint` and `@eslint/js` are pinned to major version 9 because `eslint-plugin-react@7.x` does not support eslint 10+.

## 3. Run the Dev Server

```bash
npm run dev
```

Vite serves the app at `http://localhost:5173` and proxies `/api` to `http://localhost:3600/api/v1`. For full API behavior, run the local backend on port 3600. See [Getting Started](../Getting-Started) for env var details.

## 4. Code

- Use functional components and hooks only, no class components.
- PascalCase for component filenames (`PropertyItem.jsx`), camelCase for services and stores (`propertyService.js`, `propertyStore.js`).
- Read shared state from Zustand stores in `src/store/`; reach for React Context only for legacy UI state.
- Always use CSS custom properties from `src/styles/_theme.scss` (`var(--main-color)`, `var(--cta-color)`), never hardcode hex values.
- Follow the card and section padding patterns documented in [Patterns & Conventions](Patterns-Conventions).

## 5. Lint Before Commit

```bash
npm run lint
```

ESLint 9 runs against `.js` and `.jsx` files and reports unused `eslint-disable` directives. Fix every reported issue before staging. The same lint runs in CI; a dirty tree will fail the Netlify build.

## 6. Test

```bash
npm test
```

Runs Vitest against `src/`. Add or update `*.test.jsx` files colocated with the code you touch (see [Testing](Testing)). There is no formal coverage gate yet, but exercise the auth, property search, and contact form flows manually with `npm run dev` if tests are missing.

## 7. Commit with Conventional Messages

Use conventional-style commit messages. The repo history follows this convention:

```
feat: add EMI amortization schedule export
fix: resolve property filter price_min regression
perf: lazy-load Vastu report images
chore: bump eslint-plugin-react-hooks
docs: clarify PostProperty validation rules
refactor: extract extractError into shared helper
```

- Keep the subject line to ~72 characters, imperative mood, no trailing period.
- One logical change per commit. If you are tempted to write "and", split the commit.

## 8. Open a Pull Request

Push your branch and open a PR against `main`:

- **Title**: same conventional prefix as your commits.
- **Summary**: 2-3 sentences on what changed and why.
- **Env vars / API deps**: list any new `VITE_*` variables or backend endpoints.
- **Testing notes**: how you verified (e.g. `npm run dev`, `npm run build`, `npm test`) plus before/after screenshots for UI changes.
- Link related issues.

## 9. Verify the Build

Before requesting review, run the full pipeline locally:

```bash
npm run build
npm run lint
npm test
```

`npm run build` runs entity ingestion, sitemap generation, RSS, image optimization, OG image generation, the Vite build, CSS purge, and prerendering. If it passes locally, it will pass on Netlify.

## Definition of Done

A change is ready to merge when:

- [ ] Branch is up to date with `main`.
- [ ] `npm run lint` is clean.
- [ ] `npm test` passes (or manual verification is documented).
- [ ] `npm run build` completes successfully.
- [ ] No hardcoded hex colors; all colors use `_theme.scss` custom properties.
- [ ] No secrets or real API keys committed.
- [ ] PR description lists env vars, API deps, and testing steps.
- [ ] UI changes include before/after screenshots.

See [Debugging](Debugging) for triaging build and runtime issues, and [Patterns & Conventions](Patterns-Conventions) for the full style guide.
