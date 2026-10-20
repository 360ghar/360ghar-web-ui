# Conventions for 360ghar-web-ui-2

Read this before you add a page. Read `docs/inventory.md` for what each route must do, and `docs/design-system.md` for the visual rules.

## Routes

- Route files in `src/pages/` are thin: read params, call a loader, set caching, render a feature component.
- Route files import with `@/` only. No relative imports: `scripts/sync-hi-routes.mjs` copies every route to `src/pages/hi/` and fails on relative imports. Run `node scripts/sync-hi-routes.mjs` after you add or rename a route.
- The locale comes from the middleware: `const locale = Astro.locals.locale`. Build links with `localizePath(path, locale)`, or `const L = localizer(locale)` (`@/lib/i18n/locale`). Use `byLocale(locale, { en, hi })` for a page text table: TypeScript checks that both sides have the same keys.
- Fixed pages: `export const prerender = true;`. Data pages: `export const prerender = false;` plus `respond(Astro, tier, { notFound, error })` from `@/lib/cache`. It sets the status (404 or 503) and the cache headers together. Data-hub list routes use `settleList` from `@/features/data-hub/route`.
- Unknown slug or id: use `respond(..., { notFound: true })`, render `NotFoundPage` (whole page, already `noindex`) or `NotFoundState` (inside a page; pass `noindex` to the layout) from `@/ui/states`. Backend down: status 503, `scene="error"` or `"offline"`, short cache (`{ error: true }`).
- No trailing slashes. Canonical paths are English paths; the SEO component adds `/hi`.

## Layouts

- `@/layouts/Page.astro`: header, main, footer, chat launcher. Props are the SEO props of `@/lib/seo/Seo.astro` (title, description, path, noindex, image, type, jsonLd, article).
- `@/layouts/Content.astro`: text pages. Props: `heading`, `lead`, `crumbs`, `wide`, plus the SEO props. Prose (h2, h3, p, ul, table) is styled inside it.
- JSON-LD: `breadcrumbs()` and `faqPage()` from `@/lib/seo/site`. The Organization, WebSite and LocalBusiness blocks are added on every page already.

## Data

- API: `import { api, attempt, call } from '@/lib/api/client'`. Paths include `/api/v1`. Types come from `@/lib/api/schema` (generated) and `@/lib/api/types`. Never write DTOs by hand and never invent fields. If the backend does not return a field, do not show it; note it for `docs/backend-gaps.md`.
- Server pages use `attempt()` (never throws). Islands use `call()` inside TanStack Query.
- Aliased schema fields are sent under the alias (the column name), for example `far_limit`, `approval_status`, `full_address`. Check the live API when in doubt: `curl -s 'https://360ghar.com/api/<path without /api/v1>'`.
- Do not send POST, PUT or DELETE requests to production while testing.

## Islands (React)

- Wrap every island root in `<QueryProvider>` (`@/lib/query`) and `<IslandBoundary locale>` (`@/ui/react/IslandBoundary`).
- Hydration: `client:load` only above the fold; otherwise `client:visible` or `client:idle`.
- The first client render must equal the server HTML. Read `window`, `localStorage`, dates and random values in `useEffect`, not during render.
- Skeletons: wrap in `<Delayed>` from `@/ui/react/Delayed` (150 ms) and match the final layout.
- Errors: `describeError(error, locale)` from `@/lib/api/errors` gives a title and body. 422 field errors are in `error.fields`.
- Forms: React Hook Form + Zod. Fields from `@/ui/react/Field` (`TextField`, `SelectField`, `TextAreaField`, `Check`). Show errors under the field.
- One `<Toaster />` per page at most (`@/ui/react/Toaster`); `toast(text, tone)` from any island.

## Text

- English and Hindi. Reuse the old translations in `src/i18n/locales/{en,hi}/*.json` through `getT(locale)` (Astro) or `pick()` plus `tFrom()` (islands). New strings: keep a small `{ en: {...}, hi: {...} }` object in your feature folder.
- Write plain, short sentences. No em dashes in new copy. No invented numbers, reviews or statistics.

## Design rules (short form)

- Soft paper. Rounded sheets (`.sheet`, `@/ui/Paper.astro`, `.soft-lift`) for cards; radius by role: `--radius-xs` 6 px (checkbox), `--radius-sm` 12 px (controls), `--radius-md` 16 px (menus), `--radius-lg` 22 px (cards, photos), `--radius-xl` 32 px (search sheet, bottom sheet). Hand-cut edges (`@/ui/CutBand.astro`, header strip, footer skyline, home scene) stay as the signature.
- Colours: tokens only (`kesar-*`, `mist-*`, `pine-*`, `ink-*`, `leaf/chili/haldi`). Text accents use `kesar-700` on white, never `kesar-500`. Neutral surfaces are `mist-*`, not `kesar-50/100`. The only dark fill is `pine-800`.
- Type: `font-display` (Sentient, Supreme fallback) for headings, prices and big numbers; system sans for everything else.
- Buttons: `.btn`, `.btn-primary` (one per view), `.btn-ink`, `.btn-quiet`. No outlined buttons. No filled-plus-outlined pairs. Links: `.link`.
- Icons: `@/ui/icons/Icon.astro` or `Icon.tsx` with names from `paths.ts`. No icon tiles or boxes behind icons.
- Do not use: small uppercase labels above headings (kickers), pill chips for metadata, gradients, glows, wide blurred or all-around shadows (use the `.shadow-paper*` classes), hover lift or scale on buttons, animated underlines, decorative quote marks, three-line headlines.
- Every touch target is 44 px or more. Text contrast meets WCAG 2.2 AA. Content is visible without animation. Respect `prefers-reduced-motion`.
- Mobile first from 360 px. No horizontal scroll.

## Checks per page

1. `pnpm typecheck` (runs `astro check` and `tsc`) and `pnpm lint` pass.
2. `pnpm test` passes. Add unit tests for any calculation or parsing logic (`*.test.ts` next to the code).
3. An e2e spec in `tests/e2e/` clicks every control at 360, 768 and 1440 px, runs `axe()`, and checks the page with `backendDown()` (see `tests/e2e/helpers.ts`). Call `hydrated(page)` before you click island controls.
4. Screenshots at 360, 768 and 1440 px, checked by eye.
