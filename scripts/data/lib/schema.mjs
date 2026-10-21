/**
 * Shape checks for the files in src/data, written from what the loaders read:
 * src/features/localities/data.ts, src/features/landing/{model,LandingPage,CityHub}
 * and src/features/data-hub/charts.ts. Each `check*` returns a list of problems
 * (empty list = valid). The pipeline runs them before any `--write`; the unit
 * test scripts/__tests__/data-schema.test.mjs runs them on the files in src/data.
 */
import { ENTITY_TYPES, citySlug } from './entities.mjs';

export const CITY_SLUGS = ['gurgaon', 'delhi', 'noida', 'faridabad', 'ghaziabad'];
const PROPERTY_TYPES = ['apartment', 'villa', 'builder_floor', 'house', 'plot', 'penthouse', 'studio', 'office', 'shop', 'pg'];
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const isStr = (v) => typeof v === 'string' && v.trim().length > 0;
const isObj = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);

/** Adds a problem message to `out`, at most `limit` per rule so a bad file stays readable. */
function reporter(out, limit = 5) {
  const seen = new Map();
  return (rule, msg) => {
    const n = (seen.get(rule) ?? 0) + 1;
    seen.set(rule, n);
    if (n <= limit) out.push(msg);
    else if (n === limit + 1) out.push(`${rule}: more problems of this kind not shown`);
  };
}

export function checkLocalities(rows) {
  const out = [];
  if (!Array.isArray(rows)) return ['localities: not an array'];
  const bad = reporter(out);
  const full = new Set();
  const bare = new Set();
  rows.forEach((r, i) => {
    const at = `localities[${i}] (${r?.slug})`;
    if (!isObj(r)) return bad('row', `${at}: not an object`);
    if (!isStr(r.name) || r.name.trim().length < 3) bad('name', `${at}: name missing or shorter than 3 characters`);
    if (/^povp\s+[0-9a-z]+$/i.test(String(r.name ?? ''))) bad('placeholder', `${at}: placeholder name "${r.name}"`);
    if (!isStr(r.slug) || !SLUG.test(r.slug)) bad('slug', `${at}: slug is not URL safe`);
    if (!isStr(r.city) || !CITY_SLUGS.includes(citySlug(r.city))) bad('city', `${at}: unknown city "${r.city}"`);
    if (!ENTITY_TYPES.includes(r.entityType)) bad('entityType', `${at}: unknown entityType "${r.entityType}"`);
    if (isStr(r.entityType) && r.type !== r.entityType.charAt(0).toUpperCase() + r.entityType.slice(1)) bad('type', `${at}: type "${r.type}" does not match entityType "${r.entityType}"`);
    if (r.aliases !== undefined && !(Array.isArray(r.aliases) && r.aliases.every(isStr))) bad('aliases', `${at}: aliases must be a list of strings`);
    if (r.parentLocality !== undefined && typeof r.parentLocality !== 'string') bad('parent', `${at}: parentLocality must be a string`);
    if (r.geo != null && !(isObj(r.geo) && Number.isFinite(r.geo.lat) && Number.isFinite(r.geo.lng))) bad('geo', `${at}: geo must be null or {lat, lng}`);
    if (r.lastVerifiedAt !== undefined && !DATE.test(String(r.lastVerifiedAt))) bad('date', `${at}: lastVerifiedAt is not YYYY-MM-DD`);
    if (r.seo !== undefined && !(isObj(r.seo) && ['title', 'description', 'keywords'].every((k) => r.seo[k] === undefined || typeof r.seo[k] === 'string'))) bad('seo', `${at}: seo must hold strings`);
    if (r.contentBlocks !== undefined && !(isObj(r.contentBlocks) && (r.contentBlocks.nearby === undefined || (Array.isArray(r.contentBlocks.nearby) && r.contentBlocks.nearby.every(isStr))))) bad('blocks', `${at}: contentBlocks.nearby must be a list of strings`);
    const key = `${r.slug}-${citySlug(r.city)}`;
    if (full.has(key)) bad('dup', `${at}: duplicate URL slug "${key}"`);
    full.add(key);
    // The loader maps the bare slug to the first entry, so two entries must not share one.
    if (bare.has(r.slug)) bad('dupBare', `${at}: bare slug "${r.slug}" is used twice`);
    bare.add(r.slug);
  });
  return out;
}

/** Keys and order of an index row: the projection of a locality that `build-localities` writes. */
export const INDEX_KEYS = ['slug', 'name', 'city', 'entityType', 'type', 'lastVerifiedAt'];

export function checkLocalitiesIndex(index, localities) {
  const out = [];
  if (!Array.isArray(index)) return ['localities-index: not an array'];
  const bad = reporter(out);
  if (index.length !== localities.length) out.push(`localities-index: ${index.length} rows, localities has ${localities.length}`);
  const bySlug = new Map(localities.map((l) => [l.slug, l]));
  index.forEach((r, i) => {
    const at = `localities-index[${i}] (${r?.slug})`;
    if (JSON.stringify(Object.keys(r)) !== JSON.stringify(INDEX_KEYS)) bad('keys', `${at}: keys are ${Object.keys(r).join(',')}`);
    const l = bySlug.get(r.slug);
    if (!l) return bad('missing', `${at}: no locality with this slug`);
    for (const k of ['name', 'city', 'entityType', 'type']) if (r[k] !== l[k]) bad('field', `${at}: ${k} differs from localities.json`);
    if (i > 0 && index[i - 1].name.localeCompare(r.name) > 0) bad('order', `${at}: not sorted by name`);
  });
  return out;
}

/** `parseRange` is `parseRange` from src/features/data-hub/charts.ts. */
export function checkPriceContext(ctx, parseRange) {
  const out = [];
  if (!isObj(ctx)) return ['priceContext: not an object'];
  const bad = reporter(out);
  for (const [city, segs] of Object.entries(ctx)) {
    if (!CITY_SLUGS.includes(city)) bad('city', `priceContext.${city}: unknown city`);
    if (!isObj(segs)) {
      bad('seg', `priceContext.${city}: not an object`);
      continue;
    }
    for (const [seg, types] of Object.entries(segs)) {
      if (!['buy', 'rent', 'pg'].includes(seg)) bad('intent', `priceContext.${city}.${seg}: unknown intent`);
      if (!isObj(types) || !isStr(types.default)) bad('default', `priceContext.${city}.${seg}: needs a "default" range (landing pages fall back to it)`);
      for (const [type, range] of Object.entries(types ?? {})) {
        if (type !== 'default' && !PROPERTY_TYPES.includes(type)) bad('type', `priceContext.${city}.${seg}.${type}: unknown property type`);
        if (!isStr(range) || (parseRange && parseRange(range) === null)) bad('range', `priceContext.${city}.${seg}.${type}: range "${range}" cannot be read`);
      }
    }
  }
  return out;
}

/** `parseBand` is `parseBand` from src/features/landing/model.ts. */
export function checkLandingTypeContext(ctx, parseBand) {
  const out = [];
  if (!isObj(ctx)) return ['landingTypeContext: not an object'];
  const bad = reporter(out);
  for (const [city, intents] of Object.entries(ctx)) {
    if (!CITY_SLUGS.includes(city)) bad('city', `landingTypeContext.${city}: unknown city`);
    for (const [intent, types] of Object.entries(intents)) {
      if (!['buy', 'rent'].includes(intent)) bad('intent', `landingTypeContext.${city}.${intent}: unknown intent (PG pages read "rent")`);
      for (const [type, c] of Object.entries(types)) {
        const at = `landingTypeContext.${city}.${intent}.${type}`;
        if (!PROPERTY_TYPES.includes(type)) bad('type', `${at}: unknown property type`);
        if (c.topSocieties !== undefined && !(Array.isArray(c.topSocieties) && c.topSocieties.every(isStr))) bad('societies', `${at}: topSocieties must be a list of strings`);
        for (const k of ['typicalConfiguration', 'metroAccess', 'officeHubAccess', 'reraNote']) if (c[k] !== undefined && !isStr(c[k])) bad('text', `${at}: ${k} must be a string`);
        for (const b of c.priceBands ?? []) {
          if (!isStr(b.label) || !isStr(b.range) || !isStr(b.localities)) bad('band', `${at}: a price band needs label, range and localities`);
          else if (parseBand && parseBand(b.range) === null) bad('bandRange', `${at}: band range "${b.range}" cannot be read`);
        }
      }
    }
  }
  return out;
}

export function checkLandmarks(rows) {
  const out = [];
  if (!Array.isArray(rows)) return ['locality-landmarks: not an array'];
  const bad = reporter(out);
  const seen = new Set();
  rows.forEach((r, i) => {
    const at = `locality-landmarks[${i}] (${r?.slug})`;
    if (!isStr(r.slug) || !SLUG.test(r.slug)) bad('slug', `${at}: slug is not URL safe`);
    if (seen.has(r.slug)) bad('dup', `${at}: duplicate slug`);
    seen.add(r.slug);
    if (!Array.isArray(r.landmarks) || r.landmarks.some((l) => !isStr(l.name) || !isStr(l.type) || !isStr(l.distance))) bad('landmarks', `${at}: each landmark needs name, type and distance`);
  });
  return out;
}

export function checkOfficeLandmarks(rows) {
  const out = [];
  if (!Array.isArray(rows)) return ['office-landmarks: not an array'];
  const bad = reporter(out);
  const seen = new Set();
  rows.forEach((r, i) => {
    const at = `office-landmarks[${i}] (${r?.slug})`;
    if (!isStr(r.slug) || !SLUG.test(r.slug)) bad('slug', `${at}: slug is not URL safe`);
    if (seen.has(r.slug)) bad('dup', `${at}: duplicate slug`);
    seen.add(r.slug);
    if (!isStr(r.name) || !isStr(r.type) || !isStr(r.description)) bad('text', `${at}: name, type and description are required`);
    if (!CITY_SLUGS.includes(String(r.city).toLowerCase())) bad('city', `${at}: unknown city "${r.city}"`);
    if (!(Number.isFinite(r.lat) && Number.isFinite(r.lng))) bad('geo', `${at}: lat and lng must be numbers`);
  });
  return out;
}
