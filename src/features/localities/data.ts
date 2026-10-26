/**
 * Locality entities (static data from the old site: src/data/localities.json,
 * 3,215 entries). The backend has no locality model (docs/backend-gaps.md M8),
 * so this file is read on the server only and never shipped to the browser.
 */
import raw from '@/data/localities.json';
import landmarksRaw from '@/data/locality-landmarks.json';
import { displayName, isGeneratedSeedName, isScrapedName as isScrapedNameOf } from './thin';

export { displayName };

export type Locality = {
  name: string;
  slug: string;
  city: string;
  entityType: string;
  type: string;
  parentLocality?: string;
  geo?: { lat: number; lng: number } | null;
  seo?: { title?: string; description?: string; keywords?: string };
  description?: string;
  contentBlocks?: { overview?: string; connectivity?: string; marketSignals?: string; nearby?: string[] };
  aliases?: string[];
};

type Landmark = { name: string; type: string; distance: string };

const ALL = raw as unknown as Locality[];
const LANDMARKS = new Map((landmarksRaw as { slug: string; landmarks: Landmark[] }[]).map((l) => [l.slug, l.landmarks]));

export const citySlug = (city: string) => {
  const c = city.trim().toLowerCase();
  return c === 'gurugram' ? 'gurgaon' : c.replace(/\s+/g, '-');
};

/** Canonical URL slug: "{slug}-{city}". */
export const localitySlug = (l: Pick<Locality, 'slug' | 'city'>) => `${l.slug}-${citySlug(l.city)}`;

const byFull = new Map<string, Locality>();
const byBare = new Map<string, Locality>();
for (const l of ALL) {
  byFull.set(localitySlug(l), l);
  if (!byBare.has(l.slug)) byBare.set(l.slug, l);
}

export type Resolved = { locality: Locality; redirect: string | null } | null;

/**
 * Finds a locality from a URL slug. Old URLs used "{slug}-gurgaon" for every
 * entity and also the bare slug; both redirect to the canonical slug.
 */
export function resolveLocality(urlSlug: string): Resolved {
  const s = urlSlug.toLowerCase();
  const exact = byFull.get(s);
  if (exact) return { locality: exact, redirect: null };
  // A slug that itself ends in "-gurgaon" (235 entries) is tried as it is before the suffix is cut.
  const hit = byBare.get(s) ?? byBare.get(s.endsWith('-gurgaon') ? s.slice(0, -'-gurgaon'.length) : s);
  if (hit) return { locality: hit, redirect: localitySlug(hit) };
  return null;
}

/** Landmarks with distances. The file keys some places by "{slug}-{city}" (mg-road-gurgaon, dwarka-delhi, sector-62-noida). */
export const landmarksFor = (l: Locality) => LANDMARKS.get(l.slug) ?? LANDMARKS.get(localitySlug(l)) ?? LANDMARKS.get(`${l.slug.replace(/-sector$/, '')}-${citySlug(l.city)}`) ?? [];

/** Well-known Gurugram localities, used to fill related links and the city hub. */
export const POPULAR = ['dlf-phase-1', 'dlf-phase-2', 'dlf-phase-3', 'dlf-phase-4', 'dlf-phase-5', 'golf-course-road', 'sohna-road', 'sushant-lok-1', 'sector-56', 'palam-vihar', 'mg-road', 'sector-49'];

/**
 * Up to `n` related entities in the same city: listed neighbours first, then
 * the same parent, then names that share the first two words (other DLF
 * phases), then a short list of popular localities.
 */
export function nearbyLocalities(l: Locality, n = 8): Locality[] {
  const out: Locality[] = [];
  const add = (x: Locality | undefined) => {
    if (x && !isThinLocality(x) && x.slug !== l.slug && x.city === l.city && !out.includes(x) && out.length < n) out.push(x);
  };
  const names = new Set((l.contentBlocks?.nearby ?? []).map((x) => x.toLowerCase()));
  const prefix = l.name.toLowerCase().split(/\s+/).slice(0, 2).join(' ');
  for (const x of ALL) if (names.has(x.name.toLowerCase())) add(x);
  if (l.parentLocality) for (const x of ALL) if (x.parentLocality === l.parentLocality) add(x);
  if (prefix.split(' ').length === 2 && !/^\d/.test(prefix)) for (const x of ALL) if (x.name.toLowerCase().startsWith(`${prefix} `) || x.name.toLowerCase() === prefix) add(x);
  for (const slug of POPULAR) add(byBare.get(slug));
  return out;
}

/**
 * Names scraped from search pages: "projects in dlf phase 1". 462 of the 3,215 entries are like this
 * (444 are localities), 289 have a real twin in the same city ("dlf phase 1"; src/data/locality-redirects.json).
 * Pages exist for all of them (their URLs are old and indexed); see isThinLocality for how they are treated.
 */
export const isScrapedName = (l: Pick<Locality, 'name'>) => isScrapedNameOf(l.name);


/**
 * Entries that the old site's seed script made up (scripts/generate_localities.js of the old repo: loops over
 * sector numbers and random "adjective + noun" names, "to reach 1000+"). 710 of the 3,215 entries match, and
 * their overview text is one template. No source backs them. Pages exist for all of them; this lets a caller
 * treat them as unverified (noindex, out of the sitemap, or removed once the owner decides).
 */
export const isGeneratedSeed = (l: Pick<Locality, 'name'>) => isGeneratedSeedName(l.name);

/**
 * Thin rows: scraped or seed-invented (owner decision 2026-09-29). Their pages still answer 200 (or 301 to the
 * real twin, see src/data/locality-redirects.json) but carry noindex and are not listed or linked anywhere,
 * including the sitemap. Undo: make this return false.
 */
export const isThinLocality = (l: Pick<Locality, 'name'>) => isScrapedName(l) || isGeneratedSeed(l);

/** A locality page is noindex when the place is unknown or thin. Shared by the page and the intent page. */
export const isNoindexLocality = (l: Pick<Locality, 'name'> | null | undefined) => !l || isThinLocality(l);

/** Rows that are listed and linked: everything except the thin ones. Pages exist for all of `ALL_LOCALITIES`. */
export const LISTED_LOCALITIES = ALL.filter((l) => !isThinLocality(l));

/** Entity types that get /buy and /rent intent pages (as in the old sitemap). */
export const INTENT_TYPES = new Set(['society', 'project', 'locality', 'sector', 'township', 'phase']);

export const TYPE_LABEL: Record<string, [string, string]> = {
  project: ['Project', 'प्रोजेक्ट'],
  sector: ['Sector', 'सेक्टर'],
  locality: ['Locality', 'लोकेलिटी'],
  society: ['Society', 'सोसाइटी'],
  village: ['Village', 'गाँव'],
  road: ['Road', 'रोड'],
  township: ['Township', 'टाउनशिप'],
  phase: ['Phase', 'फ़ेज़'],
};

/** Listing query for an entity: localities and sectors match the locality field, others match by text. */
export function listingMatch(l: Locality): { locality?: string; q?: string } {
  return l.entityType === 'locality' || l.entityType === 'sector' || l.entityType === 'phase' ? { locality: displayName(l.name) } : { q: displayName(l.name) };
}

export const ALL_LOCALITIES = ALL;
