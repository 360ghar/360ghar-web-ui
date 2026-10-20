import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';

export const SITE_URL = 'https://360ghar.com';
export const SITE_NAME = '360Ghar';
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image-home.jpg`;
export const TWITTER = '@360ghar';

export function absoluteUrl(pathOrUrl: string): string {
  if (/^https?:\/\//.test(pathOrUrl)) return pathOrUrl;
  return `${SITE_URL}${pathOrUrl.startsWith('/') ? '' : '/'}${pathOrUrl}`;
}

/** Canonical URL for an English path in a locale. No trailing slash, no query. */
export function canonicalFor(path: string, locale: Locale): string {
  const clean = (path.split(/[?#]/)[0] ?? '/').replace(/\/+$/, '') || '/';
  return absoluteUrl(localizePath(clean, locale));
}

/** Serialises JSON-LD safely for a <script> tag. */
export function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}

export function breadcrumbs(items: { name: string; path: string }[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: canonicalFor(it.path, locale),
    })),
  };
}

export function faqPage(items: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}
