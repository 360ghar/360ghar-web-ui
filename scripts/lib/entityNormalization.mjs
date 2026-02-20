const CITY_ALIASES = {
  gurugram: "gurgaon",
};

const ENTITY_TYPES = [
  "sector",
  "locality",
  "phase",
  "road",
  "village",
  "colony",
  "township",
  "society",
  "apartment",
  "project",
  "commercial",
  "industrial",
];

/**
 * Normalizes a name by converting to lowercase, removing punctuation,
 * normalizing city name variants (gurugram → gurgaon), and cleaning whitespace.
 * @param {string} input - The raw name to normalize
 * @returns {string} The normalized name
 */
export function normalizeName(input) {
  return String(input || "")
    .toLowerCase()
    .replace(/[,/|]+/g, " ")
    .replace(/\b(the)\b/g, " ")
    .replace(/\bgurugram\b/g, "gurgaon")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Converts a name to a URL-friendly slug by normalizing and replacing
 * special characters with hyphens.
 * @param {string} name - The name to slugify
 * @returns {string} The URL-friendly slug
 */
export function slugifyEntity(name) {
  return normalizeName(name)
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function normalizeEntityType(type) {
  const normalized = normalizeName(type);
  if (ENTITY_TYPES.includes(normalized)) return normalized;
  return "locality";
}

function normalizeCity(city) {
  const normalized = normalizeName(city);
  return CITY_ALIASES[normalized] || normalized || "gurgaon";
}

/**
 * Builds a canonical ID for an entity in the format: city::entityType::slug
 * @param {Object} params - The entity parameters
 * @param {string} params.city - The city name
 * @param {string} params.entityType - The type of entity
 * @param {string} params.slug - The URL-friendly slug
 * @returns {string} The canonical ID
 */
export function buildCanonicalId({ city, entityType, slug }) {
  return `${normalizeCity(city)}::${normalizeEntityType(entityType)}::${slug}`;
}

function inferEntityType(name) {
  const n = normalizeName(name);
  if (/^sector\b/.test(n)) return "sector";
  if (/\bphase\b/.test(n)) return "phase";
  if (/\broad\b|\bexpressway\b|\bhighway\b|\bnh-?\d+\b|\bmg road\b|\bspr\b|\bnpr\b/.test(n)) return "road";
  if (/\bvillage\b|\bgaon\b/.test(n)) return "village";
  if (/\bcolony\b/.test(n)) return "colony";
  if (/\btownship\b|\blok\b|\bcity\b|\bvihar\b/.test(n)) return "township";
  if (/\bapartment\b|\bapartments\b|\bflat\b|\bflats\b/.test(n)) return "apartment";
  if (/\bproject\b/.test(n)) return "project";
  if (/\budyog\b|\bindustrial\b/.test(n)) return "industrial";
  if (/\bmarket\b|\bcommercial\b|\bmall\b/.test(n)) return "commercial";
  if (/\bresidency\b|\bheights\b|\btowers\b|\benclave\b|\bgardens\b|\bgreens\b|\bcourt\b|\bsociety\b|\bhome(s)?\b|\bvilla(s)?\b/.test(n)) return "society";
  return "locality";
}

function buildSeo(entity) {
  const cityLabel = entity.city || "Gurgaon";
  const label = entity.name;
  const entityWord = entity.entityType === "society" || entity.entityType === "apartment" ? "apartments and societies" : "properties";
  return {
    title: `${label} Gurgaon | ${entityWord} | 360Ghar`,
    description: `Explore verified real estate in ${label}, ${cityLabel}. Check prices, listings, locality insights, and 360Ghar virtual tours.`,
    keywords: `${label} Gurgaon, ${label} Gurugram, ${label} properties, ${label} real estate`,
  };
}

/**
 * Merges entity records by canonical ID, combining aliases, source coverage,
 * and URLs. Resolves slug collisions by appending entity type and counter.
 * @param {Array<Object>} records - Array of entity records to merge
 * @param {string} records[].name - The entity name
 * @param {string} [records[].city] - The city name (defaults to Gurgaon)
 * @param {string} [records[].entityType] - The entity type (defaults to inferred)
 * @param {Array<string>} [records[].aliases] - Alternative names for the entity
 * @param {Array<string>} [records[].sourceCoverage] - Data sources covering this entity
 * @param {Array<string>} [records[].sourceUrls] - Source URLs for this entity
 * @param {number} [records[].confidence] - Confidence score (0-1)
 * @param {string} [records[].parentLocality] - Parent locality name
 * @param {Object} [records[].geo] - Geographic coordinates
 * @param {string} [records[].lastVerifiedAt] - Last verification date (ISO format)
 * @returns {Array<Object>} Merged and deduplicated entities with SEO data
 */
export function mergeEntityRecords(records) {
  const groups = new Map();

  for (const record of records) {
    const rawName = String(record?.name || "").trim();
    if (!rawName) continue;
    const entityType = normalizeEntityType(record.entityType || inferEntityType(rawName));
    const city = record.city || "Gurgaon";
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
        city: normalizedCity === "gurgaon" ? "Gurgaon" : normalizedCity,
        entityType,
        canonicalUrl: `/locality/${slug}-gurgaon`,
        aliases,
        parentLocality: record.parentLocality || "",
        geo: record.geo || null,
        sourceCoverage,
        sourceUrls,
        confidence,
        lastVerifiedAt: record.lastVerifiedAt || new Date().toISOString().slice(0, 10),
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
    if (record.lastVerifiedAt && record.lastVerifiedAt > existing.lastVerifiedAt) {
      existing.lastVerifiedAt = record.lastVerifiedAt;
    }
  }

  const merged = [...groups.values()]
    .map((entity, idx) => ({
      ...entity,
      numericId: idx + 1,
      aliases: [...entity.aliases].sort(),
      sourceCoverage: [...entity.sourceCoverage].sort(),
      sourceUrls: [...entity.sourceUrls].sort(),
      seo: buildSeo(entity),
      description: `Find verified properties, pricing trends, and locality insights in ${entity.name}, Gurgaon.`,
      contentBlocks: {
        overview: `${entity.name} is a prominent ${entity.entityType} in Gurgaon with active demand from buyers, tenants, and investors.`,
        connectivity: `Compare access to metro corridors, Golf Course Road, Sohna Road, and Dwarka Expressway from ${entity.name}.`,
        marketSignals: `Track supply, demand, and listing activity in ${entity.name} on 360Ghar.`,
        nearby: [],
      },
      type: entity.entityType.charAt(0).toUpperCase() + entity.entityType.slice(1),
    }));

  // Track slugs that have been claimed (first entity with a slug keeps it)
  const usedSlugs = new Set();

  for (const item of merged) {
    if (usedSlugs.has(item.slug)) {
      // Collision detected - append entity type
      let candidate = `${item.slug}-${item.entityType}`;
      let counter = 1;
      // If still colliding, add a counter suffix
      while (usedSlugs.has(candidate)) {
        candidate = `${item.slug}-${item.entityType}-${counter}`;
        counter++;
      }
      item.slug = candidate;
      item.canonicalUrl = `/locality/${candidate}-gurgaon`;
      item.id = buildCanonicalId({ city: item.city, entityType: item.entityType, slug: candidate });
    }
    usedSlugs.add(item.slug);
  }

  return merged.sort((a, b) => a.slug.localeCompare(b.slug));
}
