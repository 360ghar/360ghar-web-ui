/** Status and cache headers for data hub detail routes. */
import type { AstroGlobal } from 'astro';
import { cachePage, respond, type CacheTier } from '@/lib/cache';
import type { Loaded } from './api';

export type PageState = 'ok' | 'missing' | 'down';

/** No result (bad slug) or a 404 from the API is "missing"; any other error, a 422 included, is "down". */
export const stateOf = (r: Loaded<unknown> | null): PageState =>
  !r ? 'missing' : r.error === null ? 'ok' : r.error.kind === 'not_found' ? 'missing' : 'down';

export function settle(astro: Pick<AstroGlobal, 'response'>, state: PageState, tier: CacheTier) {
  respond(astro, state === 'missing' ? 'short' : tier, { notFound: state === 'missing', error: state === 'down' });
}

/**
 * Status and cache headers for a list route. A failed `primary` result (the list the page is built
 * from) gives 503. Any failed result gives the short cache; `secondary` ones keep the status 200.
 */
export function settleList(astro: Pick<AstroGlobal, 'response'>, tier: CacheTier, primary: Loaded<unknown> | null, ...secondary: Loaded<unknown>[]) {
  if (primary?.error) astro.response.status = 503;
  cachePage(astro, tier, { error: [primary, ...secondary].some((r) => r?.error) });
}

/** Slugs are lower-case words joined by hyphens. Anything else is a 404 without an API call. */
export const validSlug = (s: string | undefined): s is string => Boolean(s && /^[a-z0-9][a-z0-9-]{0,119}$/.test(s));

/**
 * The URL segment for a city. A canonical city keeps the spaces its register filed — Delhi's
 * districts are "New Delhi" and "South West Delhi" — and a path segment cannot hold a space
 * without percent-encoding it, so the words are joined with hyphens. `validSlug` then accepts
 * the result, which it would not accept for the space form. The backend matches either spelling,
 * so this only decides which one the site links and puts in the canonical URL.
 */
export const citySlug = (city: string): string =>
  city
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
