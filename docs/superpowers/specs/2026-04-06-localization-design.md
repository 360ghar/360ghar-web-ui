# 360Ghar Localization Design Spec

**Date:** 2026-04-06
**Status:** Approved
**Scope:** Full i18n infrastructure + Hindi translation for all pages

---

## Context

360Ghar serves a primarily Hindi-speaking audience in Gurugram, yet the entire frontend is in English with zero i18n infrastructure. ~3,500+ hardcoded strings across ~250+ files. The SEO layer already emits `og:locale` for `hi_IN` and hreflang tags, but they all point to the same URL — the plumbing is partially there. Adding localization will significantly improve reach and SEO for Hindi-speaking users.

**Target:** English (default, no URL prefix) + Hindi (`/hi/` prefix). Architecture supports future languages.

---

## 1. Library: react-i18next

**Packages:** `i18next`, `react-i18next`, `i18next-http-backend`, `i18next-browser-languagedetector`

**Why over alternatives:**
- `t('key')` API is fastest for 3,500+ string migration
- Built-in lazy namespace loading (critical for 60+ routes)
- `<Trans>` component handles inline markup in translated strings
- Extraction tooling (`i18next-scanner`) essential for finding missing keys across 250+ files
- ~38KB gzip cost justified by avoiding custom tooling maintenance

---

## 2. Translation File Structure

```
src/i18n/
  index.js                # i18next initialization
  languageDetector.js     # URL-based language detection
  I18nLink.jsx            # <Link> + useI18nNavigate wrappers
  locales/
    en/
      common.json         # nav, footer, buttons, labels, trust badges
      home.json           # home page hero, sections, FAQ
      properties.json     # listings, details, filters
      projects.json       # project pages
      tools.json          # all tool pages
      data-hub.json       # circle rates, RERA, auctions, etc.
      account.json        # login, register, account management
      seo.json            # meta titles/descriptions per page
      forms.json          # Yup validation messages
      landing.json        # landing + facet landing
      compare.json        # vs pages
      truth.json          # truth pages
      policies.json       # policies, contact, FAQ page
      blog.json           # blog pages
    hi/
      (mirror of en/)
```

- ~14 files per language, ~250 keys each
- English bundled at build time (no runtime fetch for default language)
- Hindi loaded on demand via dynamic `import()`
- Initial page load: only `common.json` + page-specific namespace (~3-5KB gzip)

---

## 3. Routing & Language Detection

**URL contract:**
- English: `/about-us` (no prefix — preserves all existing SEO equity)
- Hindi: `/hi/about-us`

**App.jsx structure:**
```jsx
<Routes>
  <Route path="/hi/*" element={<LocaleGate locale="hi" />}>
    {/* All routeGroups with leading slash stripped */}
  </Route>
  <Route path="/*" element={<LocaleGate locale="en" />}>
    {/* All existing routeGroups unchanged */}
  </Route>
</Routes>
```

`<LocaleGate>` sets i18next language and provides locale context. No route definition duplication — the same 60+ route arrays are used in both trees.

**Language detection:** Custom detector reads URL path — `/hi/` prefix returns `'hi'`, otherwise `'en'`. Persisted to localStorage for return visits.

**I18nLink component** (`src/i18n/I18nLink.jsx`):
- Wraps `<Link>` from react-router-dom
- Prepends `/hi/` to destination when locale is Hindi
- `useI18nNavigate()` hook wraps `navigate()` similarly
- ESLint rule flags raw `<Link>` imports to enforce usage

**Programmatic routes** (`/:citySlug/:intent/:type`): The `/hi/` prefix disambiguates from city slugs since language codes (`en`, `hi`) don't collide with city slugs (`gurgaon`, `noida`).

---

## 4. Language Switcher Component

New component at `src/common/layout/LanguageSwitcher.jsx`:
- Toggle button (globe icon + "EN"/"HI" label)
- Reads current locale from Zustand store
- On click: strips/adds `/hi/` prefix from current path, navigates
- Persists preference to localStorage
- Sets `document.documentElement.lang` on change
- Triggers Devanagari font load when switching to Hindi
- Placed in Header (desktop) and MobileMenu

---

## 5. SEO Adaptation

**SEO component** (`src/common/SEO.jsx`) changes:
- Auto-generates hreflang alternates from current URL (no more hardcoded identical URLs)
- `en-in` → bare path, `hi-in` → `/hi/` prefixed, `x-default` → bare path
- Dynamic `og:locale` (`en_IN` or `hi_IN`)
- Dynamic `<html lang>` via Helmet
- Each page passes translated SEO props: `title={t('seo:about.title')}`

**Structured data** (`src/seo/structuredData.js`):
- Functions accept `locale` parameter
- Hindi variants use Hindi `name`/`description` fields in schema.org data
- Critical for Google rich results in Hindi

---

## 6. Sitemaps

All sitemap generators updated to emit `xhtml:link` hreflang alternates:

```xml
<url>
  <loc>https://360ghar.com/about-us</loc>
  <xhtml:link rel="alternate" hreflang="en" href="https://360ghar.com/about-us"/>
  <xhtml:link rel="alternate" hreflang="hi" href="https://360ghar.com/hi/about-us"/>
  <xhtml:link rel="alternate" hreflang="x-default" href="https://360ghar.com/about-us"/>
</url>
```

Each URL gets both language variants listed. Sitemap files roughly double in size. Dynamic sitemaps (properties, blog, projects) also produce Hindi variants.

---

## 7. Prerender Pipeline

- `generate-prerender-routes.mjs` doubles the route list — each route gets a `/hi/` variant
- Puppeteer injects locale into `__PRERENDER_INJECTED` per route
- Build time increases ~2-3 minutes for the prerender phase
- Prerendered `/hi/` pages get their own `index.html` in subdirectories
- Account/functional pages (`/hi/login`, `/hi/account`) work via SPA fallback but are not prerendered or in sitemaps

---

## 8. Data File Migration

Data files in `src/data/` mix text with JSX/icons. Strategy:

```js
// Before: { text: "Home", path: "/" }
// After:  { textKey: "nav.home", path: "/" }
```

Consuming components call `t(item.textKey)`. Longer content blocks move entirely to translation JSON; data files retain only non-text props (images, icons, paths).

---

## 9. Form Validation (Yup)

Yup schemas are defined at module scope, outside React components. Use `i18n.t()` (the non-hook API):

```js
import i18n from '../i18n';
phone: Yup.string().required(() => i18n.t('forms:phone.required'))
```

All validation messages go into `locales/{en,hi}/forms.json`.

---

## 10. Devanagari Font Support

- Add Noto Sans Devanagari subset (~15-20KB gzip)
- Activate via CSS `:lang(hi) { --body-font: 'Noto Sans Devanagari', ...; }`
- Lazy-load only when Hindi is selected
- Keep Cinzel for headings (brand identity preserved)
- Prerendered Hindi pages preload the font

---

## 11. Netlify Configuration

New rules needed:
```toml
# Hindi SPA fallback
[[redirects]]
  from = "/hi/*"
  to = "/hi/index.html"
  status = 200

# Cache translation JSON
[[headers]]
  for = "/assets/locales/*.json"
  [headers.values]
    Cache-Control = "public, max-age=86400, stale-while-revalidate=604800"

# gurugram redirect for Hindi
[[redirects]]
  from = "/hi/gurugram/*"
  to = "/hi/gurgaon/:splat"
  status = 301
```

---

## 12. Developer Workflow

**Adding a translatable string:**
1. Use `t('namespace:key')` in component
2. Add key to `src/i18n/locales/en/<namespace>.json`
3. Add Hindi translation to `src/i18n/locales/hi/<namespace>.json`

**Key extraction:** `npm run i18n:extract` runs `i18next-scanner` to find all `t()` calls and report missing keys.

**Dev mode:** `missingKeyHandler` logs console warnings for untranslated keys, falls back to English.

---

## 13. Implementation Sequence

### Phase 1: Infrastructure (2-3 days)
- Install i18next packages
- Create `src/i18n/index.js` with configuration
- Create `src/store/localeStore.js` (Zustand)
- Create `src/i18n/languageDetector.js`
- Create `src/i18n/I18nLink.jsx` + `useI18nNavigate`
- Create `LanguageSwitcher.jsx`
- Wrap app in `<I18nextProvider>` in `main.jsx`
- Modify `App.jsx` for dual route trees with `<LocaleGate>`
- Add Netlify redirect rules for `/hi/` SPA fallback
- Create empty translation JSON files for all namespaces

### Phase 2: Common Components (3-5 days)
- Extract strings from `src/data/CommonData.jsx` into `common.json`
- Translate `common.json` to Hindi
- Update `Header.jsx`, `Footer.jsx`, `NavMenu.jsx`, `MobileMenu.jsx`, `Breadcrumb.jsx`
- Replace `<Link>` with `<I18nLink>` in all layout components
- Add LanguageSwitcher to Header and MobileMenu

### Phase 3: Page-by-Page Translation (10-15 days)
Process each page group:
1. Home page → `home.json`
2. Property pages → `properties.json`
3. Project pages → `projects.json`
4. Tool pages → `tools.json`
5. Data hub pages → `data-hub.json`
6. Account pages → `account.json`
7. Landing/FacetLanding → `landing.json`
8. Comparison pages → `compare.json`
9. Truth pages → `truth.json`
10. Blog pages → `blog.json`
11. Policies/Contact/FAQ → `policies.json`

For each group: extract strings → add to en JSON → translate to hi JSON → update JSX → update SEO props.

### Phase 4: SEO & Build Pipeline (3-5 days)
- Update `<SEO>` component for auto hreflang generation
- Update structured data functions for Hindi variants
- Translate Yup validation messages
- Update all sitemap generators for hreflang alternates
- Update prerender route generator for bilingual routes
- Add Devanagari font loading
- Test prerender pipeline end-to-end

### Phase 5: QA & Polish (3-5 days)
- Visual QA for Hindi pages (text overflow, layout breaks)
- Verify hreflang alternates in all sitemaps
- Verify prerendered Hindi pages have correct `lang="hi"` and content
- Test language switcher across all pages
- Lighthouse audit for both languages
- ESLint rule enforcement for `<I18nLink>`

---

## 14. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Hindi text causes layout overflow (typically 20-40% longer) | Audit fixed-width containers; use `min-width` over `width`; test during extraction |
| Prerender build time doubles (~2-3 min extra) | Acceptable for CI; parallelize Puppeteer if needed |
| Devanagari font FOIT | Preload in prerendered pages; use `font-display: swap` |
| Developers forget I18nLink | ESLint rule flags raw `<Link>` imports |
| Translation keys diverge from code | `i18next-scanner` runs in CI; missing keys fail build |
| Netlify SPA fallback vs prerendered files | Static files served before redirects; prerendered HTML takes priority |

---

## Critical Files

| File | Change |
|---|---|
| `src/App.jsx` | Dual route trees with `<LocaleGate>` |
| `src/main.jsx` | `<I18nextProvider>` wrapper |
| `src/common/SEO.jsx` | Auto hreflang, dynamic `og:locale`, `<html lang>` |
| `src/seo/structuredData.js` | Accept `locale` param, Hindi schema variants |
| `src/data/CommonData.jsx` | `text` → `textKey` migration |
| `scripts/generate-prerender-routes.mjs` | Bilingual route generation |
| `scripts/generate-sitemaps.mjs` | hreflang alternates |
| `scripts/generate-dynamic-sitemaps.mjs` | hreflang for API-driven URLs |
| `netlify.toml` | `/hi/` SPA fallback + cache rules |
