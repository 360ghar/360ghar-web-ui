import { getT } from '@/i18n';
import { api, attempt } from '@/lib/api/client';
import type { PropertyPage } from '@/lib/api/types';
import type { Property } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n/locale';
import { memo } from '@/lib/memo';
import { faqPage } from '@/lib/seo/site';
import { capped } from './cap';
import { homeFacts } from './facts';

/** Entries in src/data/localities.json. The home chunk skips the 600 KB index for one number; data.test.ts checks it. */
export const LOCALITY_TOTAL = 2043;

export type HomeData = Awaited<ReturnType<typeof loadHome>>;

/**
 * Localities for the spotlight: the API `locality` value and the locality page.
 * The counts and photos come from the API on each render; a locality with no
 * homes is left out. ponytail: fixed list, pick by facet counts when R15 exists.
 */
const SPOTLIGHT = [
  { name: 'Palam Vihar', hi: 'पालम विहार', href: '/locality/palam-vihar-gurgaon' },
  { name: 'Sector 85', hi: 'सेक्टर 85', href: '/locality/sector-85-gurgaon' },
  { name: 'Sector 84', hi: 'सेक्टर 84', href: '/locality/sector-84-gurgaon' },
  { name: 'Sector 67', hi: 'सेक्टर 67', href: '/locality/sector-67-gurgaon' },
] as const;

/** A cold render waits at most this long for a count or a locality (the API call itself may take 6 s and retry). */
const CAP_MS = 2_000;
const TTL_MS = 10 * 60_000;

/**
 * A GET cached per function instance for 10 minutes (`memo`, which shares one
 * in-flight call between renders) and capped at 2 s. A failure is not cached,
 * and a capped or failed call gives `{ data: null, error: true }`, so the page
 * hides that number instead of waiting for it.
 */
async function cached<T>(key: string, call: () => Promise<{ data: T; error: null } | { data: null; error: unknown }>) {
  const data = await capped(
    memo(`home:${key}`, TTL_MS, async () => {
      const r = await call();
      if (r.error) throw r.error; // not cached
      return r.data;
    }),
    CAP_MS,
  );
  return { data, error: data === null };
}

const page = (r: { data?: PropertyPage | null }) => r.data;
/** The `total` of a one-row list call, or null when the call failed or the total is missing or zero. */
export const totalOf = (r: { data?: { total?: number | null } | null }): number | null => {
  const n = r.data?.total;
  return typeof n === 'number' && n > 0 ? n : null;
};

/** The lead home: the first one with a main photo and at least five photos. */
function pickLead(homes: Property[]) {
  return homes.find((p) => p.main_image_url && (p.images?.length ?? 0) >= 5) ?? null;
}

/** Loads everything the home page needs in parallel. Never throws. */
export async function loadHome(locale: Locale) {
  const t = getT(locale);
  const [recs, total, posts, ...places] = await Promise.all([
    attempt(api.GET('/api/v1/properties/recommendations', { params: { query: { limit: 9 } } })),
    attempt(api.GET('/api/v1/properties', { params: { query: { limit: 1, include_total: true } } })),
    attempt(api.GET('/api/v1/blog/posts', { params: { query: { limit: 3 } } })),
    // The spotlight localities: count and one photo each. Same cache and cap.
    ...SPOTLIGHT.map((l) =>
      cached(`locality:${l.name}`, () =>
        attempt(api.GET('/api/v1/properties', { params: { query: { limit: 1, include_total: true, sort_by: 'newest', locality: l.name } } })),
      ),
    ),
  ]);
  const faqs = Array.from({ length: 10 }, (_, i) => ({ q: t(`home:structuredFaq.q${i + 1}`), a: t(`home:structuredFaq.a${i + 1}`) })).filter(
    (f) => f.q && f.a,
  );
  const all = page(recs)?.items ?? [];
  const lead = pickLead(all);
  const localities = SPOTLIGHT.map((l, i) => {
    const p = page(places[i]!);
    return { ...l, count: p?.total ?? 0, home: p?.items?.[0] ?? null };
  })
    .filter((l) => l.count > 0)
    .sort((a, b) => b.count - a.count);
  const count = page(total)?.total ?? null;
  return {
    lead,
    homes: all.filter((p) => p !== lead).slice(0, 8),
    count,
    localities,
    facts: homeFacts(locale),
    // Preserve the stats shape for the dev-only map study, but never expose
    // counts for Data Hub records while their sources are held.
    stats: { circle: null, rera: null, auctions: null },
    posts: (posts.data?.items ?? []).slice(0, 3),
    homesError: recs.error,
    faqs,
    faqSchema: faqPage(faqs),
    failed: Boolean(recs.error || total.error || places.some((p) => p.error)),
  };
}
