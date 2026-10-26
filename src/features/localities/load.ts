import type { Property } from '@/lib/api/types';
import { citySlug, nearbyLocalities, type Locality } from './data';
import { homesIn, listedPlaces, liveHomes, type ListedPlace } from './live';

export type LocalityData = {
  homes: Property[];
  /** Other places with homes now, shown when this place has none. */
  listed: ListedPlace[];
  /** Live home count per nearby locality slug. */
  nearbyCounts: Record<string, number>;
  failed: boolean;
};

/** Live homes and data for a locality page. Never throws. */
export async function loadLocality(l: Locality): Promise<LocalityData> {
  const all = await liveHomes();
  if (!all) return { homes: [], listed: [], nearbyCounts: {}, failed: true };
  const homes = homesIn(l, all);
  const nearbyCounts = Object.fromEntries(nearbyLocalities(l).map((n) => [n.slug, homesIn(n, all).length]));
  const listed = homes.length ? [] : listedPlaces(all, citySlug(l.city)).filter((x) => x.locality !== l).slice(0, 4);
  return { homes, listed, nearbyCounts, failed: false };
}
