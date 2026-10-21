/**
 * Data hub URLs for /sitemap-datahub.xml (English paths; the sitemap adds /hi).
 * Only pages that render 200 with index,follow: the same slug and id rules as
 * the routes, so no 404 or noindex URL is listed. Never throws: a list that
 * fails is returned as far as it got and named in `skipped`.
 */
import type { SitemapEntry } from '@/features/feeds/xml';
import type { ItemOf, PageShape } from '@/lib/api/types';
import { memo } from '@/lib/memo';
import prices from '@/data/priceContext.json';
import { api, call } from '@/lib/api/client';
import { validSlug } from './route';

const TTL = 6 * 3600_000;

const FIXED: SitemapEntry[] = [
  { path: '/circle-rates', changefreq: 'monthly', priority: '0.8' },
  { path: '/rera-projects', changefreq: 'weekly', priority: '0.8' },
  { path: '/bank-auctions', changefreq: 'daily', priority: '0.8' },
  { path: '/stamp-duty-calculator', changefreq: 'monthly', priority: '0.9' },
  { path: '/verify-ownership', changefreq: 'monthly', priority: '0.7' },
  { path: '/zone-checker', changefreq: 'monthly', priority: '0.7' },
  { path: '/regulatory-updates', changefreq: 'daily', priority: '0.7' },
  { path: '/builder-reputation', changefreq: 'weekly', priority: '0.8' },
  { path: '/auction-sources', changefreq: 'monthly', priority: '0.6', lastmod: '2025-05-04' },
  { path: '/builder-reputation-score', changefreq: 'monthly', priority: '0.6', lastmod: '2026-01-01' },
  { path: '/tenant-demand-heatmap', changefreq: 'monthly', priority: '0.6', lastmod: '2026-01-01' },
  { path: '/best-sectors-investment-2026', changefreq: 'monthly', priority: '0.6', lastmod: '2026-01-01' },
  ...Object.keys(prices).map((city): SitemapEntry => ({ path: `/price-index/${city}`, changefreq: 'weekly', priority: '0.8' })),
];

/** Same rules as the detail routes. */
export const circlePath = (slug: string | null | undefined) => (validSlug(slug ?? undefined) ? `/circle-rate/${slug}` : null);
export const zonePath = (slug: string | null | undefined) => (validSlug(slug ?? undefined) ? `/zone-checker/${slug}` : null);
export const builderPath = (slug: string | null | undefined) => (validSlug(slug ?? undefined) ? `/builder-reputation/${slug}` : null);
/** Bank and court auctions have separate id spaces, so each kind has its own detail route. */
export const auctionPath = (id: number | string | null | undefined, kind: 'bank' | 'court' = 'bank') =>
  /^\d{1,9}$/.test(String(id ?? '')) ? (kind === 'court' ? `/bank-auctions/court/${id}` : `/bank-auctions/${id}`) : null;

/** One entry per valid, distinct path. */
export function detailEntries<T>(items: T[], path: (x: T) => string | null, lastmod: (x: T) => string | null | undefined, changefreq: SitemapEntry['changefreq'], priority: string): SitemapEntry[] {
  const seen = new Set<string>();
  const out: SitemapEntry[] = [];
  for (const x of items) {
    const p = path(x);
    if (!p || seen.has(p)) continue;
    seen.add(p);
    out.push({ path: p, lastmod: lastmod(x) ?? null, changefreq, priority });
  }
  return out;
}

/** Every page of a list. ponytail: capped at 50 pages of 100; a backend export is the upgrade when a list outgrows it. */
async function collect<P extends PageShape>(fetchPage: (cursor: string | null) => Promise<P>): Promise<{ items: ItemOf<P>[]; failed: boolean }> {
  const items: ItemOf<P>[] = [];
  let cursor: string | null = null;
  try {
    for (let i = 0; i < 50; i += 1) {
      const page = await fetchPage(cursor);
      items.push(...(page.items as ItemOf<P>[]));
      if (!page.has_more || !page.next_cursor) break;
      cursor = page.next_cursor;
    }
    return { items, failed: false };
  } catch {
    return { items, failed: true };
  }
}

/** A cached list; a failed fetch is not cached, and its partial rows are still used. */
async function list<P extends PageShape>(key: string, fetchPage: (cursor: string | null) => Promise<P>): Promise<{ items: ItemOf<P>[]; failed: boolean }> {
  let partial: ItemOf<P>[] = [];
  try {
    const items = await memo(`datahub-sitemap:${key}`, TTL, async () => {
      const r = await collect(fetchPage);
      if (r.failed) {
        partial = r.items;
        throw new Error(`${key} failed`);
      }
      return r.items;
    });
    return { items, failed: false };
  } catch {
    return { items: partial, failed: true };
  }
}

const page = (cursor: string | null) => ({ limit: 100, ...(cursor ? { cursor } : {}) });
const circleRows = (c: string | null) => call(api.GET('/api/v1/data-hub/circle-rates', { params: { query: page(c) } }));
const bankRows = (c: string | null) => call(api.GET('/api/v1/data-hub/auctions', { params: { query: page(c) } }));
const courtRows = (c: string | null) => call(api.GET('/api/v1/data-hub/auctions', { params: { query: { type: 'court', ...page(c) } } }));
const zoneRows = (c: string | null) => call(api.GET('/api/v1/data-hub/zoning', { params: { query: page(c) } }));
const builderRows = (c: string | null) => call(api.GET('/api/v1/data-hub/builders', { params: { query: page(c) } }));

export async function datahubSitemap(): Promise<{ entries: SitemapEntry[]; skipped: string[] }> {
  const [rates, bank, court, zones, builders] = await Promise.all([
    list('circle-rates', circleRows),
    list('auctions-bank', bankRows),
    list('auctions-court', courtRows),
    list('zoning', zoneRows),
    list('builders', builderRows),
  ]);
  const skipped = Object.entries({ 'circle-rates': rates, 'auctions-bank': bank, 'auctions-court': court, zoning: zones, builders })
    .filter(([, r]) => r.failed)
    .map(([k]) => k);
  if (skipped.length) console.warn(`[sitemap-datahub] incomplete lists: ${skipped.join(', ')}`);
  const entries = [
    ...FIXED,
    ...detailEntries(rates.items, (r) => circlePath(r.slug), (r) => r.updated_at, 'monthly', '0.7'),
    ...detailEntries([...bank.items, ...court.items], (a) => auctionPath(a.id, a.kind), (a) => a.updated_at, 'daily', '0.7'),
    ...detailEntries(zones.items, (z) => zonePath(z.slug), (z) => z.updated_at, 'monthly', '0.7'),
    ...detailEntries(builders.items, (b) => builderPath(b.slug), () => null, 'weekly', '0.7'),
  ];
  return { entries, skipped };
}

export async function datahubEntries(): Promise<SitemapEntry[]> {
  return (await datahubSitemap()).entries;
}
