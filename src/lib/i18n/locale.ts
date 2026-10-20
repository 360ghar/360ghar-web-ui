export type Locale = 'en' | 'hi';

/** The locale comes from the URL only: /hi and /hi/* are Hindi. */
export function localeFromPath(pathname: string): Locale {
  return pathname === '/hi' || pathname.startsWith('/hi/') ? 'hi' : 'en';
}

/** Removes the /hi prefix. Always returns a path that starts with "/". */
export function stripLocale(pathname: string): string {
  if (pathname === '/hi') return '/';
  if (pathname.startsWith('/hi/')) return pathname.slice(3);
  return pathname || '/';
}

/** Builds the path for a locale from an English path. No trailing slash. */
export function localizePath(path: string, locale: Locale): string {
  const clean = stripLocale(path.split(/[?#]/)[0] ?? '/');
  const rest = path.slice((path.split(/[?#]/)[0] ?? '').length);
  if (locale === 'en') return clean + rest;
  return (clean === '/' ? '/hi' : `/hi${clean}`) + rest;
}

/** `localizePath` with the locale filled in: `const L = localizer(locale); L('/about')`. */
export const localizer = (locale: Locale) => (path: string) => localizePath(path, locale);

/** Picks the copy for a locale. `hi` must have the same shape as `en`, so a missing or extra key fails typecheck. */
export const byLocale = <T>(locale: Locale, copy: { en: T; hi: NoInfer<T> }): T => copy[locale];
