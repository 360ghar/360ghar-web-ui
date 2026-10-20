import type { AstroGlobal } from 'astro';
import { cachePage, respond } from '@/lib/cache';
import { localeFromPath, localizePath } from '@/lib/i18n/locale';
import { parseFilters, type Filters } from '@/features/search/filters';
import { loadFirstPage } from '@/features/search/load';
import { listingMatch, localitySlug, resolveLocality } from './data';

/**
 * Data, redirect and status for /locality/:slug/:intent. Call from the route
 * file; it returns a Response for a redirect.
 */
export async function loadLocalityIntent(Astro: AstroGlobal) {
  const locale = localeFromPath(Astro.url.pathname);
  const intentRaw = (Astro.params.intent ?? '').toLowerCase();
  const found = resolveLocality(Astro.params.slug ?? '');
  const intent = intentRaw === 'rent' ? 'rent' : intentRaw === 'buy' ? 'buy' : null;

  // Old URLs: bare or "-gurgaon" slugs, and any other intent word, land on the canonical page.
  if (found && (found.redirect || !intent)) {
    return Astro.redirect(localizePath(`/locality/${found.redirect ?? localitySlug(found.locality)}/${intent ?? 'buy'}`, locale) + Astro.url.search, 301);
  }

  const l = found?.locality ?? null;
  let first = null;
  let filters: Filters | null = null;
  if (l && intent) {
    filters = { ...parseFilters(Astro.url.searchParams), purpose: intent, ...listingMatch(l) };
    first = await loadFirstPage(filters);
    cachePage(Astro, 'hour', { error: Boolean(first.error) });
  } else {
    respond(Astro, 'hour', { notFound: true });
  }
  return { l, intent, first, filters };
}
