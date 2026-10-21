import { api, call } from '@/lib/api/client';
import { collectPages } from '@/lib/api/pages';
import type { components } from '@/lib/api/schema';
import type { Property } from '@/lib/api/types';
import { citySlug, displayName, nearbyLocalities, type Locality } from './data';
import { homesIn, listedPlaces, liveHomes, type ListedPlace } from './live';

/** A circle-rate row that has a rate: the page shows rows with a rate only. */
type CircleRow = components['schemas']['CircleRateResponse'] & { rate_per_sqft: number };

/** Circle rates for a Gurugram sector or locality, exact name match (the API filter is a substring match). */
async function circleRates(l: Locality): Promise<CircleRow[]> {
  if (citySlug(l.city) !== 'gurgaon' || !['sector', 'locality', 'phase', 'road'].includes(l.entityType)) return [];
  const name = displayName(l.name);
  try {
    const rows = await collectPages((cursor) => call(api.GET('/api/v1/data-hub/circle-rates', { params: { query: { sector: name, limit: 100, ...(cursor ? { cursor } : {}) } } })));
    return rows.filter((r): r is CircleRow => r.sector.toLowerCase() === name.toLowerCase() && Boolean(r.slug) && (r.rate_per_sqft ?? 0) > 0);
  } catch {
    // The local data panel shows no circle rates when the API is down.
    return [];
  }
}

export type LocalityData = {
  homes: Property[];
  /** Other places with homes now, shown when this place has none. */
  listed: ListedPlace[];
  /** Live home count per nearby locality slug. */
  nearbyCounts: Record<string, number>;
  circle: CircleRow[];
  failed: boolean;
};

/** Live homes and data for a locality page. Never throws. */
export async function loadLocality(l: Locality): Promise<LocalityData> {
  const [all, circle] = await Promise.all([liveHomes(), circleRates(l)]);
  if (!all) return { homes: [], listed: [], nearbyCounts: {}, circle, failed: true };
  const homes = homesIn(l, all);
  const nearbyCounts = Object.fromEntries(nearbyLocalities(l).map((n) => [n.slug, homesIn(n, all).length]));
  const listed = homes.length ? [] : listedPlaces(all, citySlug(l.city)).filter((x) => x.locality !== l).slice(0, 4);
  return { homes, listed, nearbyCounts, circle, failed: false };
}
