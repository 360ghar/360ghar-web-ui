/**
 * What is near a listing: straight-line distances from its coordinates to the
 * city's job hubs, landmarks listed for its locality, and its locality page.
 * All from `src/data/*.json`; read on the server only.
 */
import index from '@/data/localities-index.json';
import { citySlug, isThinLocality } from '@/features/localities/data';
import landmarks from '@/data/locality-landmarks.json';
import offices from '@/data/office-landmarks.json';

export type Hub = { name: string; type: string; km: number };
export type Landmark = { name: string; type: string; distance: string };

const slug = (s: string) => s.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const rad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * rad;
  const dLng = (b.lng - a.lng) * rad;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(h));
}

/** The `n` nearest job, transit and hospital hubs, nearest first. Gurugram only. */
export function nearestHubs(lat: number | null | undefined, lng: number | null | undefined, n = 5): Hub[] {
  if (lat == null || lng == null) return [];
  return (offices as { name: string; type: string; lat: number; lng: number }[])
    .map((o) => ({ name: o.name, type: o.type, km: Math.round(distanceKm({ lat, lng }, o) * 10) / 10 }))
    // Hubs farther than 40 km are in another city: the listing is not in Gurugram.
    .filter((h) => h.km <= 40)
    .sort((a, b) => a.km - b.km)
    .slice(0, n);
}

const LANDMARKS = new Map((landmarks as { slug: string; landmarks: Landmark[] }[]).map((l) => [l.slug, l.landmarks]));

/** Landmarks listed for the locality, when the data has them. The file keys some places by "{slug}-{city}" (mg-road-gurgaon). */
export function localityLandmarks(locality: string | null | undefined, city?: string | null): Landmark[] {
  if (!locality) return [];
  const s = slug(locality);
  return LANDMARKS.get(s) ?? (city ? LANDMARKS.get(`${s}-${citySlug(city)}`) : undefined) ?? [];
}

type Entry = { slug: string; name: string; city: string; entityType: string };
// Thin (scraped or invented) localities are noindex and delisted: never link them.
// Names repeat across entity types (a locality and a road, a society and its project): keep the row whose slug is the plain name.
const GURGAON = new Map<string, string>();
for (const e of index as Entry[]) {
  if (e.city !== 'Gurgaon' || isThinLocality(e)) continue;
  const key = e.name.toLowerCase();
  if (!GURGAON.has(key) || e.slug === slug(e.name)) GURGAON.set(key, e.slug);
}

/** Path of the locality page (`/locality/{slug}-gurgaon`), or null when there is none. */
export function localityPath(locality: string | null | undefined, city: string | null | undefined): string | null {
  if (!locality || !/^(gurugram|gurgaon)$/i.test(city ?? '')) return null;
  const s = GURGAON.get(locality.trim().toLowerCase());
  return s ? `/locality/${s}-gurgaon` : null;
}
