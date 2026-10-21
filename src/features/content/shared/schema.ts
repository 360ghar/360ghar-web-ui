/** JSON-LD helpers for the content pages. Only real fields; dates are fixed, never render time. */
import type { Locale } from '@/lib/i18n/locale';
import { breadcrumbs, canonicalFor, DEFAULT_OG_IMAGE, SITE_NAME, SITE_URL } from '@/lib/seo/site';
import { shared } from './text';

type Crumb = { name: string; path: string };

/** Home plus the given items: the visible breadcrumbs and their BreadcrumbList. */
export function trail(locale: Locale, items: Crumb[]) {
  const all = [{ name: shared(locale).home, path: '/' }, ...items];
  return { crumbs: all, ld: breadcrumbs(all, locale) };
}

const LOGO = `${SITE_URL}/assets/images/logo/logo.png`;
const ORG = { '@type': 'Organization', name: SITE_NAME, url: SITE_URL };

export function article(a: { headline: string; description: string; path: string; locale: Locale; published: string; modified?: string }) {
  const url = canonicalFor(a.path, a.locale);
  return {
    '@type': 'Article',
    headline: a.headline,
    description: a.description,
    url,
    image: DEFAULT_OG_IMAGE,
    inLanguage: a.locale === 'hi' ? 'hi-IN' : 'en-IN',
    author: ORG,
    publisher: { ...ORG, logo: { '@type': 'ImageObject', url: LOGO } },
    datePublished: a.published,
    dateModified: a.modified ?? a.published,
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
  };
}

export function howTo(name: string, description: string, steps: readonly { name: string; text: string }[]) {
  return {
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
  };
}

export function webPage(p: { name: string; description: string; path: string; locale: Locale; type?: string }) {
  return {
    '@type': p.type ?? 'WebPage',
    name: p.name,
    description: p.description,
    url: canonicalFor(p.path, p.locale),
    inLanguage: p.locale === 'hi' ? 'hi-IN' : 'en-IN',
    isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
  };
}
