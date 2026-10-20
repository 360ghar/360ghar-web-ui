/**
 * Live homes for place pages, matched on the server from the full list of
 * homes (one cached call, shared with the sitemaps). The API's `locality`
 * filter is a substring match ("Sector 8" also returns Sector 85), so the
 * place pages match names exactly here instead.
 */
import type { Property, PropertyImage } from '@/lib/api/types';
import { allProperties } from '@/features/feeds/data';
import { isPlaceholderPrice, percentile } from '@/features/search/prices';
import { LISTED_LOCALITIES, citySlug, type Locality } from './data';

/** Every live home, or null when the backend is down. Never throws. */
export async function liveHomes(): Promise<Property[] | null> {
  try {
    return await allProperties();
  } catch {
    return null;
  }
}

const norm = (s: string | null | undefined) => ` ${(s ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()} `;
const AREA_TYPES = new Set(['locality', 'sector', 'phase']);
const sameCity = (p: Property, l: Locality) => citySlug(p.city ?? '') === citySlug(l.city);

/** Address parts that say where the home is, without "near X" parts. */
function placeText(p: Property): string {
  const parts = [p.title, p.sub_locality, ...(p.full_address ?? '').split(',')].filter((x) => x && !/^\s*near\b/i.test(x));
  return norm(parts.join(' , '));
}

/**
 * Homes in a place. Sectors, localities and phases match the home's locality
 * or sub-locality exactly. Projects, societies, roads and the rest match
 * their name as a whole phrase in the title or address.
 * ponytail: phrase match; a place id on each listing would be exact.
 */
export function homesIn(l: Locality, homes: Property[]): Property[] {
  const names = [l.name, ...(l.aliases ?? [])].map(norm);
  return homes
    .filter((p) => {
      if (!sameCity(p, l)) return false;
      if (names.includes(norm(p.locality)) || names.includes(norm(p.sub_locality))) return true;
      if (AREA_TYPES.has(l.entityType)) return false;
      const text = placeText(p);
      return names.some((n) => n.trim().length >= 6 && text.includes(n));
    })
    .sort(newestFirst);
}

export const newestFirst = (a: Property, b: Property) => (b.created_at ?? '').localeCompare(a.created_at ?? '');

/**
 * Homes of one purpose: how many, the lowest real price, and the middle half
 * of the prices (25th to 75th percentile) once at least 3 real prices exist.
 * Stand-in prices (isPlaceholderPrice, D8) are counted but not priced.
 */
export type Range = { n: number; min: number | null; lo: number | null; hi: number | null };

function range(homes: Property[], price: (p: Property) => number | null | undefined, placeholder: (p: Property) => boolean = () => false): Range | null {
  if (!homes.length) return null;
  const v = homes
    .filter((p) => !placeholder(p))
    .map(price)
    .filter((x): x is number => typeof x === 'number' && Number.isFinite(x) && x > 0)
    .sort((a, b) => a - b);
  return { n: homes.length, min: v[0] ?? null, lo: v.length >= 3 ? percentile(v, 25) : null, hi: v.length >= 3 ? percentile(v, 75) : null };
}

export type Summary = { total: number; buy: Range | null; rent: Range | null; stay: Range | null };

/** Counts and price ranges by purpose, from the homes themselves. */
export function summarize(homes: Property[]): Summary {
  const of = (purpose: Property['purpose']) => homes.filter((p) => p.purpose === purpose);
  return {
    total: homes.length,
    buy: range(of('buy'), (p) => p.base_price, isPlaceholderPrice),
    rent: range(of('rent'), (p) => p.monthly_rent),
    stay: range(of('short_stay'), (p) => p.daily_rate),
  };
}

/**
 * How telling a photo is of a place, lower is better. The captions are more
 * reliable than image_category here: files captioned "Building Exterior"
 * (category exterior) mostly show the flat's front door, while "Exterior Front"
 * and "Street View" show the building and the view from the balcony.
 */
function photoRank(i: PropertyImage): number {
  const c = (i.caption ?? '').toLowerCase();
  if (/exterior front|facade|arrival court|skyline|colony view/.test(c)) return 0;
  if (/street view|balcony exterior/.test(c)) return 1;
  if (/balcony|terrace/.test(c)) return 2;
  if (/living room/.test(c)) return 3;
  if (i.image_category === 'hall') return 4;
  if (i.image_category === 'exterior') return 5;
  return 9;
}

/**
 * The most telling photo among some homes (newest first) that is not in `used`.
 * The pick is added to `used`, so cards on one page never repeat a photo.
 */
export function bestPhoto(homes: Property[], used: Set<string>): string | null {
  const all = homes.flatMap((p, n) => [...(p.images ?? []).map((i) => ({ url: i.image_url, rank: photoRank(i), n })), { url: p.main_image_url ?? '', rank: 8, n }]);
  const pick = all.filter((x) => x.url && !used.has(x.url)).sort((a, b) => a.rank - b.rank || a.n - b.n)[0];
  if (!pick) return null;
  used.add(pick.url);
  return pick.url;
}

export type ListedPlace = { locality: Locality; homes: Property[]; photo: string | null };

/**
 * Places that have live homes now, most homes first. Each home counts once,
 * under the area entity (sector, locality, phase) that matches its locality.
 * `used` holds the photo URLs already on the page; each place gets its own photo.
 */
export function listedPlaces(homes: Property[], city = 'gurgaon', used: Set<string> = new Set()): ListedPlace[] {
  const areas = new Map<string, Locality>();
  for (const l of LISTED_LOCALITIES) if (AREA_TYPES.has(l.entityType) && citySlug(l.city) === city && !areas.has(norm(l.name))) areas.set(norm(l.name), l);
  const groups = new Map<Locality, Property[]>();
  for (const p of homes) {
    const l = areas.get(norm(p.locality));
    if (l && sameCity(p, l)) groups.set(l, [...(groups.get(l) ?? []), p]);
  }
  return [...groups]
    .map(([locality, hs]) => ({ locality, homes: [...hs].sort(newestFirst) }))
    .sort((a, b) => b.homes.length - a.homes.length || a.locality.name.localeCompare(b.locality.name))
    .map((x) => ({ ...x, photo: bestPhoto(x.homes, used) }));
}
