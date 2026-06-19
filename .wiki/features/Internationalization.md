# Internationalization

360Ghar ships a bilingual (English / Hindi) experience using **i18next** with a custom URL-path language detector. Hindi content lives under `/hi/*` and is statically bundled so crawlers see fully translated HTML on prerendered pages. The locale is derived solely from the URL path - there is no localStorage or cookie divergence - which keeps canonical URLs SEO-correct.

## Key Files

| File | Role |
|------|------|
| `src/i18n/index.js` | i18next initialization, resource registration |
| `src/i18n/languageDetector.js` | URL-path detector (`/hi/*` -> `hi`) |
| `src/i18n/I18nLink.jsx` | `I18nLink`, `I18nNavLink`, `useI18nNavigate`, `localizePath`, `stripLocalePrefix` |
| `src/i18n/locales/en/*.json` | 14 English namespace files |
| `src/i18n/locales/hi/*.json` | 14 Hindi namespace files |
| `src/store/localeStore.js` | `locale` + `setLocale` Zustand store |
| `src/main.jsx` | Imports `./i18n` before React renders |

## Stack

| Package | Version | Purpose |
|---------|---------|---------|
| `i18next` | ^26.0.3 | Core i18n framework |
| `react-i18next` | ^17.0.2 | React bindings (`useTranslation`) |
| `i18next-browser-languagedetector` | ^8.2.1 | (installed; replaced by custom detector) |
| `i18next-http-backend` | ^3.0.4 | (installed; resources are bundled statically instead) |

Hindi (`hi`) was added in commit `2d374a3`.

## Initialization (`src/i18n/index.js`)

14 namespaces are registered: `common`, `home`, `properties`, `projects`, `tools`, `data-hub`, `account`, `seo`, `forms`, `landing`, `compare`, `truth`, `policies`, `blog`.

Both English and Hindi translations are **statically imported** (not lazy-loaded). Trade-off documented in the source: ~40-80KB gzipped for all 14 namespaces x 2 languages. This is intentional so crawlers see Hindi content on `/hi/*` prerendered pages without a client-side fetch. If `/hi/` routes are added to prerendering, the second language could be revisited as a lazy chunk.

```js
i18n
  .use({ type: 'languageDetector', async: false, detect: urlPathDetector.lookup, cacheUserLanguage: urlPathDetector.cacheUserLanguage })
  .use(initReactI18next)
  .init({
    resources: { en: enResources, hi: hiResources },
    fallbackLng: 'en',
    supportedLngs: ['en', 'hi'],
    ns: namespaces,
    defaultNS: 'common',
    load: 'currentOnly',
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: (lngs, ns, key) => console.warn(`[i18n] Missing key: ${ns}:${key} for [${lngs.join(', ')}]`),
  });
```

## Language Detection (`languageDetector.js`)

The custom detector reads **only** the URL path:

- `/hi` or `/hi/*` -> `'hi'`
- everything else -> `'en'`

`cacheUserLanguage` is intentionally a no-op: the URL path is the sole source of truth. This avoids localStorage diverging from the actual detected language and breaking canonical URLs.

## Routing Helpers (`I18nLink.jsx`)

`localizePath(path, locale)` prepends `/hi` to a path when locale is Hindi, handling root, relative, and full URLs (external URLs are passed through). `stripLocalePrefix(path)` removes the `/hi/` prefix to get the canonical English path.

| Export | Purpose |
|--------|---------|
| `I18nLink` | Localization-aware `<Link>` |
| `I18nNavLink` | Localization-aware `<NavLink>` |
| `useI18nNavigate()` | Returns a `navigate` that prepends `/hi/` |
| `localizePath(path, locale)` | Prepend `/hi` for Hindi |
| `stripLocalePrefix(path)` | Remove `/hi/` prefix |

These helpers read from `localeStore` (Zustand), which is kept in sync with the detected locale on route changes in `App.jsx`. The repo enforces `react-router-dom`'s `Link`/`NavLink`/`useNavigate` are not imported directly outside `I18nLink.jsx` (an ESLint `no-restricted-imports` rule).

## Translation File Structure

```
src/i18n/locales/
  en/
    common.json
    home.json
    properties.json
    projects.json
    tools.json
    data-hub.json
    account.json
    seo.json
    forms.json
    landing.json
    compare.json
    truth.json
    policies.json
    blog.json
  hi/
    (mirror of en/)
```

## Usage in Components

```jsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation('properties'); // namespace
  return <h1>{t('search.title')}</h1>;
};

// With interpolation
t('landing:landingFaqs.q1', { facetLower: 'flats', city: 'Gurgaon' });

// Multiple namespaces
const { t: tCommon } = useTranslation('common');
```

`react.useSuspense: true` means components suspend until translations are ready; combined with the static import this is effectively instant.

## Hindi-Specific Patterns

The landing page FAQ builders (`buildLandingFaqs`, `buildFacetFaqs` in `Landing.jsx` / `FacetLanding.jsx`) pass Hindi-specific verb variables (`hindiAction`, `hindiBuyRent`, `hindiDocSuffix`) into the same translation keys, so a single key works for both languages with correct grammar.

## Cross-References

- [SEO & Programmatic](../features/SEO-Programmatic) - hreflang alternates and Hindi sitemap entries
- [State Management](../state/State-Management) - `localeStore`
- [Build Pipeline](../build/Build-Pipeline) - prerendering of `/hi/*` routes
