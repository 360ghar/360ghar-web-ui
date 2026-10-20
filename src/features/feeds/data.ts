/**
 * URL sets for sitemaps and feeds. Every list keeps only pages that render
 * with index, follow, so the sitemaps agree with the pages' own robots tags.
 */
import { api, call } from '@/lib/api/client';
import { collectPages } from '@/lib/api/pages';
import type { Property } from '@/lib/api/types';
import { memo } from '@/lib/memo';
import { CITIES, INTENTS, TYPE_SEGMENTS, budgetsFor, isIndexable, landingFilters, parseLanding, type Facet, type Landing } from '@/features/landing/model';
import { INTENT_TYPES, LISTED_LOCALITIES, localitySlug, type Locality } from '@/features/localities/data';
import { PROJECTS } from '@/features/projects/catalog';
import type { SitemapEntry } from './xml';

// The list cursor is keyset on (sort value, id), so a page never repeats or skips a home. The id dedupe stays as a guard.
export const allProperties = () =>
  memo('feed-properties', 30 * 60_000, async () => {
    const homes = await collectPages((cursor) => call(api.GET('/api/v1/properties', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } })));
    return [...new Map(homes.map((p) => [p.id, p])).values()];
  });

export const allPosts = () =>
  memo('feed-posts', 30 * 60_000, () => collectPages((cursor) => call(api.GET('/api/v1/blog/posts', { params: { query: { limit: 100, ...(cursor ? { cursor } : {}) } } }))));

/**
 * The old site's curated list of indexable fixed pages (src/seo/indexationPolicy.js),
 * without the data hub pages: sitemap-datahub.xml lists those.
 */
const STATIC_PATHS = [
  '/', '/properties', '/about-us', '/contact', '/faq', '/project', '/blog', '/policies', '/policies/terms-of-service', '/policies/privacy-policy',
  '/policies/content-guidelines', '/policies/content-takedown-policy', '/policies/grievance-redressal-mechanism', '/refer-and-earn',
  '/gurugram-real-estate-guide', '/property-investment-gurugram', '/for-ai', '/ai-agent', '/localities', '/emi-calculator', '/area-converter',
  '/area-calculator', '/mofa-to-rera-converter', '/sq-ft-calculator', '/acre-in-gaj', '/loan-eligibility-calculator',
  '/capital-gains-tax-calculator', '/property-document-checklist', '/design-blueprint', '/vastu-checker', '/ai-design-studio', '/vs', '/vs/nobroker',
  '/vs/magicbricks', '/vs/99acres', '/vs/housing', '/vs/commonfloor', '/vs/proptiger', '/vs/squareyards', '/vs/nestaway', '/vs/zolo',
  '/vs/stanza-living', '/truth/nobroker-listings', '/truth/magicbricks-spam', '/truth/99acres-fake', '/truth/nestaway-collapse',
  '/truth/zolo-issues', '/careers', '/careers/content-creator-internship', '/careers/real-estate-agent', '/careers/founders-office-intern',
  '/celebrity-homes', '/nri-property-guide', '/landlord-not-returning-security-deposit', '/list-property-free', '/glossary', '/links',
  '/check-fake-listing', '/rent-receipt', '/near/cyber-city', '/near/udyog-vihar', '/near/golf-course-road-corporate',
  '/near/millennium-city-centre', '/near/medanta', '/near/artemis', '/near/sector-55-56-metro', '/near/dlf-cyber-park', '/near/ambience-mall',
  '/near/hero-honda-chowk',
];

export const staticEntries = (): SitemapEntry[] =>
  STATIC_PATHS.map((path) => ({ path, changefreq: path === '/' ? 'daily' : 'weekly', priority: path === '/' ? '1.0' : '0.7' }));

const CITY_NAMES: Record<string, string[]> = { gurgaon: ['gurgaon', 'gurugram'] };
const inCity = (p: Property, city: string) => (CITY_NAMES[city] ?? [CITIES[city]!.name.toLowerCase()]).some((n) => (p.city ?? '').toLowerCase().includes(n));

/**
 * Homes on a landing page, counted from the full list with the backend's own
 * rules (app/repositories/property_query_builder.py). One API call per page
 * took 1.3 s each, too slow for a function.
 */
export function landingCount(homes: Property[], l: Landing, facet?: Facet): number {
  const f = landingFilters(l, facet);
  return homes.filter(
    (p) =>
      inCity(p, l.city) &&
      p.purpose === f.purpose &&
      f.property_type.includes(p.property_type) &&
      (f.bedrooms_min === undefined || (p.bedrooms ?? -1) >= f.bedrooms_min) &&
      (f.bedrooms_max === undefined || (p.bedrooms ?? Infinity) <= f.bedrooms_max) &&
      (f.price_max === undefined || p.base_price <= f.price_max),
  ).length;
}

/** Landing pages the old sitemap listed, minus pages that are noindex now (0 homes). */
export function landingEntries(): Promise<SitemapEntry[]> {
  return memo('feed-landing-v3', 6 * 3600_000, async () => {
    const jobs: { path: string; landing: Landing; facet?: Facet; hub?: boolean }[] = [];
    for (const city of Object.keys(CITIES)) {
      for (const intent of INTENTS) {
        for (const seg of Object.keys(TYPE_SEGMENTS)) {
          const l = parseLanding(city, intent, seg);
          if (!l) continue;
          jobs.push({ path: l.path, landing: l });
          if (seg !== 'flats' || intent === 'pg') continue;
          for (const bhk of [1, 2, 3]) jobs.push({ path: `${l.path}/${bhk}-bhk`, landing: l, facet: { kind: 'bhk', bhk } });
          for (const key of budgetsFor(intent)) jobs.push({ path: `${l.path}/budget/${key}`, landing: l, facet: { kind: 'budget', key } });
        }
      }
    }
    const homes = await allProperties();
    // City hubs with no homes are noindex (src/pages/[city].astro), so they are left out.
    const pages: SitemapEntry[] = Object.keys(CITIES)
      .filter((c) => homes.some((p) => inCity(p, c)))
      .map((c) => ({ path: `/${c}`, changefreq: 'daily', priority: '0.9' }));
    for (const j of jobs) {
      if (!isIndexable(j.landing, j.facet, landingCount(homes, j.landing, j.facet))) continue;
      pages.push({ path: j.path, changefreq: 'weekly', priority: j.facet?.kind === 'bhk' ? '0.75' : '0.8' });
    }
    return pages;
  });
}

const NAME_HINT = /society|apartment|flat|residency|residential|heights|towers|enclave|vihar|kunj|sarovar|green|estate|riverside|complex|block|tower/i;
/** Localities that also get /buy and /rent pages in the sitemap (old rule). */
const hasIntentPages = (l: Locality) => INTENT_TYPES.has((l.entityType || '').toLowerCase()) || NAME_HINT.test(l.name);

/** Thin rows (scraped or seed-invented) are left out: their pages are noindex or redirect. */
export function localityEntries(): SitemapEntry[] {
  return LISTED_LOCALITIES.flatMap((l) => {
    const base = `/locality/${localitySlug(l)}`;
    const e: SitemapEntry[] = [{ path: base, lastmod: l.lastVerifiedAt, changefreq: 'weekly', priority: '0.7' }];
    if (hasIntentPages(l)) for (const i of ['buy', 'rent']) e.push({ path: `${base}/${i}`, lastmod: l.lastVerifiedAt, changefreq: 'weekly', priority: '0.65' });
    return e;
  });
}

export const projectEntries = (): SitemapEntry[] => PROJECTS.map((p) => ({ path: `/project/${p.slug}`, changefreq: 'weekly', priority: '0.7' }));
