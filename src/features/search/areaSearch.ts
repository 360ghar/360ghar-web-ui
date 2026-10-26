/**
 * Offline autocomplete for Gurugram areas in the search boxes. The list is
 * generated from the old site's locality data (src/data/area-index.json, 431
 * clean rows, ~27 KB) so suggestions appear before Google answers, and keep
 * working when the Maps key is missing or the network is down.
 *
 * Matching is the same shape as the locality intent pages: sectors, localities
 * and phases filter on the exact `locality` field; societies, roads, townships
 * and villages go through the keyword `q` (see features/localities/data.ts).
 */
import raw from '@/data/area-index.json';
import type { Locale } from '@/lib/i18n/locale';
import type { PlaceHit } from '@/lib/maps';

export type AreaType = 'sector' | 'locality' | 'society' | 'township' | 'phase' | 'road' | 'village';

type File = {
  v: number;
  popular: string[];
  areas: { n: string; t: AreaType; a?: string[] }[];
};

type Indexed = { area: File['areas'][number]; key: string; aliases: string[] };

export type AreaSuggestion = {
  name: string;
  type: AreaType;
  label: string;
  secondary: string;
  filter: 'locality' | 'q';
  source: 'local';
};

export type Suggestion = { kind: 'area'; area: AreaSuggestion } | { kind: 'place'; place: PlaceHit };

const DATA = raw as unknown as File;
const LIMIT = 6;
const LOCALITY_TYPES = new Set<AreaType>(['sector', 'locality', 'phase']);

const LABELS: Record<AreaType, [string, string]> = {
  sector: ['Sector', 'सेक्टर'],
  locality: ['Locality', 'लोकेलिटी'],
  society: ['Society', 'सोसाइटी'],
  road: ['Road', 'रोड'],
  village: ['Village', 'गाँव'],
  township: ['Township', 'टाउनशिप'],
  phase: ['Phase', 'फ़ेज़'],
};

/** Lower case, no diacritics, no hyphens, and "sec" reads as "sector". */
export function normalizeArea(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/\bsec\.?(?=\s|$)/g, 'sector')
    .replace(/\s+/g, ' ')
    .trim();
}

const INDEXED: Indexed[] = DATA.areas.map((area) => ({
  area,
  key: normalizeArea(area.n),
  aliases: (area.a ?? []).map(normalizeArea),
}));
const BY_KEY = new Map(INDEXED.map((entry) => [entry.key, entry]));
const BY_ALIAS = new Map<string, Indexed>();
for (const entry of INDEXED) for (const alias of entry.aliases) if (!BY_ALIAS.has(alias)) BY_ALIAS.set(alias, entry);
const POPULAR = DATA.popular.map((name) => BY_KEY.get(normalizeArea(name))).filter((x): x is Indexed => Boolean(x));
const POPULAR_KEYS = new Set(POPULAR.map((entry) => entry.key));

export function areaLabel(type: AreaType, locale: Locale = 'en'): string {
  const pair = LABELS[type];
  return locale === 'hi' ? pair[1] : pair[0];
}

/** 0 is the best match. `null` means the row does not match at all. */
function rank(entry: Indexed, query: string): number | null {
  if (entry.key === query) return 0;
  if (entry.key.startsWith(query)) return 1;
  const words = entry.key.split(' ');
  if (words.some((_, i) => words.slice(i).join(' ').startsWith(query))) return 2;
  if (entry.aliases.some((alias) => alias === query)) return 3;
  if (entry.aliases.some((alias) => alias.startsWith(query))) return 4;
  if (entry.key.includes(query)) return 5;
  if (entry.aliases.some((alias) => alias.includes(query))) return 6;
  return null;
}

function suggestion(entry: Indexed, locale: Locale): AreaSuggestion {
  const label = areaLabel(entry.area.t, locale);
  return {
    name: entry.area.n,
    type: entry.area.t,
    label,
    secondary: `${label} · ${locale === 'hi' ? 'गुरुग्राम' : 'Gurugram'}`,
    filter: LOCALITY_TYPES.has(entry.area.t) ? 'locality' : 'q',
    source: 'local',
  };
}

/**
 * Up to `limit` suggestions. An empty query returns the six popular areas, so
 * focusing the field shows something useful.
 */
export function searchAreas(query: string, locale: Locale = 'en', limit = LIMIT): AreaSuggestion[] {
  const q = normalizeArea(query);
  if (!q) return POPULAR.slice(0, limit).map((entry) => suggestion(entry, locale));
  const found: { entry: Indexed; rank: number }[] = [];
  for (const entry of INDEXED) {
    const r = rank(entry, q);
    if (r !== null) found.push({ entry, rank: r });
  }
  // A popular place wins a tie ("golf" reaches Golf Course Road before its extension).
  const popularity = (entry: Indexed) => (POPULAR_KEYS.has(entry.key) ? 0 : 1);
  found.sort(
    (a, b) =>
      a.rank - b.rank ||
      popularity(a.entry) - popularity(b.entry) ||
      a.entry.area.n.localeCompare(b.entry.area.n, 'en', { numeric: true }) ||
      a.entry.area.n.length - b.entry.area.n.length,
  );
  return found.slice(0, limit).map((x) => suggestion(x.entry, locale));
}

/**
 * A whole query that is exactly an area name or alias ("sec 56" included).
 * The hero form uses it on submit, so pressing Enter without opening the list
 * still lands on the locality instead of a keyword that cannot match.
 */
export function exactArea(query: string, locale: Locale = 'en'): AreaSuggestion | null {
  const key = normalizeArea(query);
  if (!key) return null;
  const entry = BY_KEY.get(key) ?? BY_ALIAS.get(key);
  return entry ? suggestion(entry, locale) : null;
}

/**
 * Local rows first, then Google places whose main text is not already a local
 * name. Google answers a different question (landmarks, addresses), so it
 * fills the remaining slots rather than replacing the local list.
 */
export function mergeSuggestions(local: AreaSuggestion[], google: PlaceHit[], limit = LIMIT): Suggestion[] {
  const names = new Set(local.map((area) => normalizeArea(area.name)));
  const out: Suggestion[] = local.slice(0, limit).map((area) => ({ kind: 'area', area }));
  for (const place of google) {
    if (out.length >= limit) break;
    if (names.has(normalizeArea(place.main))) continue;
    out.push({ kind: 'place', place });
  }
  return out;
}
