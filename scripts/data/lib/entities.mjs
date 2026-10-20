/**
 * Entity normalisation for the locality pipeline. Port of the old site's
 * scripts/lib/entityNormalization.mjs. Same ids, slugs and collision rules, so
 * the output matches src/data/localities.json. Two fixes: the copy uses the
 * entity's own city (not "Gurgaon" for every row) and `canonicalUrl` uses the
 * v2 slug format `{slug}-{city}`.
 */

const CITY_ALIASES = { gurugram: 'gurgaon' };
const CITY_LABEL = { gurgaon: 'Gurgaon', delhi: 'Delhi', noida: 'Noida', faridabad: 'Faridabad', ghaziabad: 'Ghaziabad' };

export const ENTITY_TYPES = ['sector', 'locality', 'phase', 'road', 'village', 'colony', 'township', 'society', 'apartment', 'project', 'commercial', 'industrial'];

/** Lower case, no punctuation runs, "gurugram" written as "gurgaon". */
export function normalizeName(input) {
  return String(input || '')
    .toLowerCase()
    .replace(/[,/|]+/g, ' ')
    .replace(/\b(the)\b/g, ' ')
    .replace(/\bgurugram\b/g, 'gurgaon')
    .replace(/\s+/g, ' ')
    .trim();
}

/** URL slug of a name. */
export function slugifyEntity(name) {
  return normalizeName(name)
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

function normalizeEntityType(type) {
  const normalized = normalizeName(type);
  return ENTITY_TYPES.includes(normalized) ? normalized : 'locality';
}

export function normalizeCity(city) {
  const normalized = normalizeName(city);
  return CITY_ALIASES[normalized] || normalized || 'gurgaon';
}

/** Display name of a city ("gurugram" -> "Gurgaon", "delhi" -> "Delhi"). */
export const cityLabel = (city) => {
  const c = normalizeCity(city);
  return CITY_LABEL[c] ?? c.replace(/\b[a-z]/g, (m) => m.toUpperCase());
};

/** City part of a locality URL: "{slug}-{city}". Same rule as `citySlug` in src/features/localities/data.ts. */
export const citySlug = (city) => {
  const c = String(city || '').trim().toLowerCase();
  return c === 'gurugram' ? 'gurgaon' : c.replace(/\s+/g, '-');
};

/** Canonical id: `city::entityType::slug`. */
export function buildCanonicalId({ city, entityType, slug }) {
  return `${normalizeCity(city)}::${normalizeEntityType(entityType)}::${slug}`;
}

/** Guesses the entity type from words in the name. */
export function inferEntityType(name) {
  const n = normalizeName(name);
  if (/^sector\b/.test(n)) return 'sector';
  if (/\bphase\b/.test(n)) return 'phase';
  if (/\broad\b|\bexpressway\b|\bhighway\b|\bnh-?\d+\b|\bmg road\b|\bspr\b|\bnpr\b/.test(n)) return 'road';
  if (/\bvillage\b|\bgaon\b/.test(n)) return 'village';
  if (/\bcolony\b/.test(n)) return 'colony';
  if (/\btownship\b|\blok\b|\bcity\b|\bvihar\b/.test(n)) return 'township';
  if (/\bapartment\b|\bapartments\b|\bflat\b|\bflats\b/.test(n)) return 'apartment';
  if (/\bproject\b/.test(n)) return 'project';
  if (/\budyog\b|\bindustrial\b/.test(n)) return 'industrial';
  if (/\bmarket\b|\bcommercial\b|\bmall\b/.test(n)) return 'commercial';
  if (/\bresidency\b|\bheights\b|\btowers\b|\benclave\b|\bgardens\b|\bgreens\b|\bcourt\b|\bsociety\b|\bhome(s)?\b|\bvilla(s)?\b/.test(n)) return 'society';
  return 'locality';
}

function buildSeo(entity) {
  const city = cityLabel(entity.city);
  const label = entity.name;
  const entityWord = entity.entityType === 'society' || entity.entityType === 'apartment' ? 'apartments and societies' : 'properties';
  return {
    title: `${label} ${city} | ${entityWord} | 360Ghar`,
    description: `Explore verified real estate in ${label}, ${city}. Check prices, listings, locality insights, and 360Ghar virtual tours.`,
    keywords: [`${label} ${city}`, ...(city === 'Gurgaon' ? [`${label} Gurugram`] : []), `${label} properties`, `${label} real estate`].join(', '),
  };
}

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Merges raw records by canonical id: aliases, source coverage and urls are
 * unioned, confidence is the maximum. Slug clashes get the entity type as a
 * suffix, then a counter. Returns the rows sorted by slug.
 *
 * @param {Array<object>} records raw rows (`name` required)
 * @param {{ today?: string }} [opts] `today` sets the default `lastVerifiedAt` (for reproducible runs)
 */
export function mergeEntityRecords(records, opts = {}) {
  const defaultDate = opts.today ?? today();
  const groups = new Map();

  for (const record of records) {
    const rawName = String(record?.name || '').trim();
    if (!rawName) continue;
    const entityType = normalizeEntityType(record.entityType || inferEntityType(rawName));
    const city = record.city || 'Gurgaon';
    const slug = slugifyEntity(rawName);
    if (!slug) continue;
    const id = buildCanonicalId({ city, entityType, slug });

    const aliases = new Set([rawName, ...(record.aliases || [])].filter(Boolean));
    const sourceCoverage = new Set(record.sourceCoverage || []);
    const sourceUrls = new Set(record.sourceUrls || []);
    const confidence = Number.isFinite(record.confidence) ? Number(record.confidence) : 0.5;
    const normalizedCity = normalizeCity(city);

    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: rawName,
        slug,
        city: normalizedCity === 'gurgaon' ? 'Gurgaon' : normalizedCity,
        entityType,
        aliases,
        parentLocality: record.parentLocality || '',
        geo: record.geo || null,
        sourceCoverage,
        sourceUrls,
        confidence,
        lastVerifiedAt: record.lastVerifiedAt || defaultDate,
      });
      continue;
    }

    const existing = groups.get(id);
    for (const alias of aliases) existing.aliases.add(alias);
    for (const source of sourceCoverage) existing.sourceCoverage.add(source);
    for (const src of sourceUrls) existing.sourceUrls.add(src);
    existing.confidence = Math.max(existing.confidence, confidence);
    if (!existing.parentLocality && record.parentLocality) existing.parentLocality = record.parentLocality;
    if (!existing.geo && record.geo) existing.geo = record.geo;
    if (rawName.length < existing.name.length) existing.name = rawName;
    if (record.lastVerifiedAt && record.lastVerifiedAt > existing.lastVerifiedAt) existing.lastVerifiedAt = record.lastVerifiedAt;
  }

  const merged = [...groups.values()].map((entity, idx) => {
    const city = cityLabel(entity.city);
    return {
      ...entity,
      numericId: idx + 1,
      aliases: [...entity.aliases].sort(),
      sourceCoverage: [...entity.sourceCoverage].sort(),
      sourceUrls: [...entity.sourceUrls].sort(),
      seo: buildSeo(entity),
      description: `Find verified properties, pricing trends, and locality insights in ${entity.name}, ${city}.`,
      contentBlocks: {
        overview: `${entity.name} is a prominent ${entity.entityType} in ${city} with active demand from buyers, tenants, and investors.`,
        connectivity: `Compare access to metro corridors, Golf Course Road, Sohna Road, and Dwarka Expressway from ${entity.name}.`,
        marketSignals: `Track supply, demand, and listing activity in ${entity.name} on 360Ghar.`,
        nearby: [],
      },
      type: entity.entityType.charAt(0).toUpperCase() + entity.entityType.slice(1),
    };
  });

  // The first entity with a slug keeps it. Later ones get "-{type}", then "-{type}-{n}".
  const usedSlugs = new Set();
  for (const item of merged) {
    if (usedSlugs.has(item.slug)) {
      let candidate = `${item.slug}-${item.entityType}`;
      let counter = 1;
      while (usedSlugs.has(candidate)) {
        candidate = `${item.slug}-${item.entityType}-${counter}`;
        counter++;
      }
      item.slug = candidate;
      item.id = buildCanonicalId({ city: item.city, entityType: item.entityType, slug: candidate });
    }
    usedSlugs.add(item.slug);
  }
  for (const item of merged) item.canonicalUrl = `/locality/${item.slug}-${citySlug(item.city)}`;

  return merged.sort((a, b) => a.slug.localeCompare(b.slug));
}
