/**
 * JSON-LD checks: required fields per type, nested types, URLs, dates, prices,
 * and schema.org rules the old validator missed (unknown types, top-level
 * SpeakableSpecification). Ported from the old site's validateStructuredData.js.
 * Pure TypeScript with no `@/` imports: scripts/validate-structured-data.mjs loads it with Node's type stripping.
 */

export type Issue = { message: string; path: string };
export type ValidationResult = { errors: Issue[]; warnings: Issue[]; isValid: boolean };
type Obj = Record<string, unknown>;

const REQUIRED: Record<string, string[]> = {
  Organization: ['@type', 'name'],
  RealEstateAgent: ['@type', 'name', 'url', 'telephone', 'address'],
  LocalBusiness: ['@type', 'name', 'url', 'address', 'telephone'],
  WebSite: ['@type', 'name', 'url'],
  WebPage: ['@type', 'url'],
  Product: ['@type', 'name', 'image', 'offers'],
  Offer: ['@type'],
  FAQPage: ['@type', 'mainEntity'],
  Question: ['@type', 'acceptedAnswer'],
  Answer: ['@type', 'text'],
  BreadcrumbList: ['@type', 'itemListElement'],
  ListItem: ['@type', 'position'],
  Person: ['@type', 'name'],
  Event: ['@type', 'name', 'startDate', 'endDate', 'eventAttendanceMode', 'eventStatus', 'image', 'location'],
  Place: ['@type'],
  PostalAddress: ['@type', 'addressCountry'],
  GeoCoordinates: ['@type', 'latitude', 'longitude'],
  ImageObject: ['@type', 'url'],
  VideoObject: ['@type', 'name', 'description', 'thumbnailUrl', 'uploadDate'],
  BlogPosting: ['@type', 'headline', 'image', 'datePublished', 'author', 'publisher'],
  Article: ['@type', 'headline', 'image', 'datePublished', 'author', 'publisher'],
  Course: ['@type', 'name', 'description', 'provider'],
  PodcastSeries: ['@type', 'name', 'publisher'],
  QAPage: ['@type', 'mainEntity'],
  SpeakableSpecification: ['@type', 'cssSelector'],
  JobPosting: ['@type', 'title', 'description', 'datePosted', 'validThrough', 'employmentType', 'hiringOrganization', 'jobLocation', 'baseSalary'],
  Review: ['@type', 'reviewBody', 'reviewRating'],
  AggregateRating: ['@type', 'ratingValue', 'reviewCount'],
  HowTo: ['@type', 'name', 'step'],
  HowToStep: ['@type', 'text'],
  SoftwareApplication: ['@type', 'name'],
  MobileApplication: ['@type', 'name'],
  ItemList: ['@type'],
  AggregateOffer: ['@type', 'lowPrice', 'highPrice', 'priceCurrency'],
};

/** Types that look like schema.org but are not. Each one is an error. */
const NOT_SCHEMA_ORG: Record<string, string> = {
  KnowledgePanel: 'KnowledgePanel is a Google product, not a schema.org type. Use Organization with sameAs and knowsAbout.',
};

const URL_PROPS = ['url', 'image', 'thumbnailUrl', 'downloadUrl', 'installUrl', 'contentUrl', 'embedUrl'];
const DATE_PROPS = ['startDate', 'endDate', 'datePublished', 'dateModified', 'dateCreated', 'uploadDate', 'datePosted', 'validThrough'];
/**
 * DateTime properties that must carry a timezone. Search Console reported both "missing a timezone"
 * and "Invalid datetime value" for a date-only `dateCreated` on an Answer, so it is checked here.
 */
const DATE_TIME_PROPS = ['dateCreated'];

const isObj = (v: unknown): v is Obj => !!v && typeof v === 'object' && !Array.isArray(v);
const typesOf = (s: Obj): string[] => (Array.isArray(s['@type']) ? (s['@type'] as string[]) : [String(s['@type'])]);
const isEmpty = (v: unknown) => v == null || v === '' || (Array.isArray(v) && v.length === 0);

/** Validate one schema object and everything nested in it. `top` marks a block that stands alone in a <script>; `nested` (set by the recursion) skips "recommended" warnings that only matter for a page's own Organization. */
export function validateSchema(schema: unknown, name = 'schema', top = false, nested = false): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const err = (message: string, path = name) => errors.push({ message, path });
  const warn = (message: string, path = name) => warnings.push({ message, path });

  if (!isObj(schema)) {
    err(`Schema "${name}" is not an object`);
    return { errors, warnings, isValid: false };
  }
  if (!schema['@type']) {
    if (!schema['@id'] || Object.keys(schema).length > 1) err('Missing @type property');
    return { errors, warnings, isValid: errors.length === 0 };
  }
  if (top && !schema['@context']) err('Top-level block has no @context', `${name}.@context`);

  const isRef = !!schema['@id'] && Object.keys(schema).every((k) => k === '@id' || k === '@type');
  for (const type of typesOf(schema)) {
    if (NOT_SCHEMA_ORG[type]) err(NOT_SCHEMA_ORG[type]!, `${name}.@type`);
    if (top && type === 'SpeakableSpecification') err('SpeakableSpecification must sit inside WebPage.speakable, not stand alone', `${name}.@type`);
    if (isRef) continue;
    for (const prop of REQUIRED[type] ?? []) {
      // isEmpty, not `in`: properties set to undefined (the `x || undefined` pattern) must be caught.
      if (isEmpty(schema[prop])) err(`Missing required property "${prop}" for type ${type}`, `${name}.${prop}`);
    }
    if (type === 'Organization' && !nested) {
      for (const p of ['description', 'url', 'logo']) if (!schema[p]) warn(`Missing recommended property "${p}" for Organization`, `${name}.${p}`);
    }
    // A breadcrumb step has a name and a link; a step of another ItemList needs one of the two.
    if (type === 'BreadcrumbList' && Array.isArray(schema.itemListElement)) {
      schema.itemListElement.forEach((li: unknown, i: number) => {
        for (const p of ['name', 'item']) if (isObj(li) && isEmpty(li[p])) err(`Missing required property "${p}" for a BreadcrumbList item`, `${name}.itemListElement[${i}].${p}`);
      });
    }
    if (type === 'ListItem' && !schema.name && !schema.item) err('ListItem must include a "name" or an "item" property');
    if (type === 'Question' && !schema.name && !schema.text) err('Question must include a "name" or "text" property');
    if (type === 'RealEstateAgent' && !schema.areaServed) warn('Missing recommended property "areaServed" for RealEstateAgent', `${name}.areaServed`);
    if (type === 'Event' && !schema.offers) warn('Missing recommended property "offers" for Event', `${name}.offers`);
    if (type === 'JobPosting') {
      const addr = (schema.jobLocation as Obj | undefined)?.address as Obj | undefined;
      if (!addr?.streetAddress) warn('Missing recommended property "streetAddress" in "jobLocation.address" for JobPosting', `${name}.jobLocation.address.streetAddress`);
      if (!addr?.postalCode) warn('Missing recommended property "postalCode" in "jobLocation.address" for JobPosting', `${name}.jobLocation.address.postalCode`);
    }
    if (type === 'Product') {
      if (!schema.offers && !schema.aggregateRating && !schema.review) err('Product must include at least one of offers, aggregateRating or review');
      const offers = Array.isArray(schema.offers) ? schema.offers : schema.offers ? [schema.offers] : [];
      offers.forEach((offer: unknown, i: number) => {
        for (const p of ['price', 'priceCurrency', 'availability']) {
          if (!isObj(offer) || offer[p] == null) err(`Missing required property "${p}" in Product offer`, `${name}.offers[${i}].${p}`);
        }
      });
    }
    if (type === 'VideoObject' && !schema.contentUrl && !schema.embedUrl) warn('Missing recommended property "contentUrl" or "embedUrl" for VideoObject');
    if (type === 'LocalBusiness' || type === 'RealEstateAgent') {
      if (!schema.geo) warn(`Missing recommended property "geo" for ${type}`, `${name}.geo`);
      if (!schema.image) warn(`Missing recommended property "image" for ${type}`, `${name}.image`);
    }
  }

  for (const [key, value] of Object.entries(schema)) {
    const items = Array.isArray(value) ? value : [value];
    items.forEach((item, i) => {
      if (isObj(item) && item['@type']) {
        const r = validateSchema(item, Array.isArray(value) ? `${name}.${key}[${i}]` : `${name}.${key}`, false, true);
        errors.push(...r.errors);
        warnings.push(...r.warnings);
      }
    });
  }

  for (const prop of URL_PROPS) {
    const list = Array.isArray(schema[prop]) ? (schema[prop] as unknown[]) : [schema[prop]];
    for (const url of list) {
      if (typeof url === 'string' && !/^https?:\/\//.test(url)) warn(`URL for "${prop}" is not absolute: ${url}`, `${name}.${prop}`);
    }
  }
  for (const prop of DATE_PROPS) {
    if (schema[prop] && Number.isNaN(new Date(String(schema[prop])).getTime())) err(`Invalid date format for "${prop}": ${String(schema[prop])}`, `${name}.${prop}`);
  }
  for (const prop of DATE_TIME_PROPS) {
    // A date-only value parses fine but carries no timezone, so Google rejects it as a DateTime.
    if (typeof schema[prop] === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(schema[prop])) {
      warn(`"${prop}" is a date with no timezone: use ISO 8601 with an offset (${schema[prop]}T00:00:00+05:30)`, `${name}.${prop}`);
    }
  }
  if (schema.price != null && (Number.isNaN(Number(schema.price)) || Number(schema.price) < 0)) err(`Invalid price value: ${String(schema.price)}`, `${name}.price`);
  if (schema.ratingValue != null) {
    const r = Number(schema.ratingValue);
    if (Number.isNaN(r) || r < 1 || r > 5) err(`Rating value must be between 1 and 5: ${String(schema.ratingValue)}`, `${name}.ratingValue`);
  }
  return { errors, warnings, isValid: errors.length === 0 };
}

/** Validate every top-level block of a page (an @graph is opened up). Also checks that @id values are not repeated with different types. */
export function validateBlocks(blocks: unknown[], name = 'page'): ValidationResult {
  const errors: Issue[] = [];
  const warnings: Issue[] = [];
  const seen = new Map<string, string>();
  blocks.forEach((b, i) => {
    const list = isObj(b) && Array.isArray(b['@graph']) ? (b['@graph'] as unknown[]) : [b];
    for (const item of list) {
      const path = `${name}[${i}]`;
      const r = validateSchema(item, path, !(isObj(b) && Array.isArray(b['@graph'])));
      errors.push(...r.errors);
      warnings.push(...r.warnings);
      if (isObj(item) && typeof item['@id'] === 'string' && item['@type'] && Object.keys(item).length > 2) {
        const sig = JSON.stringify(typesOf(item));
        const prev = seen.get(item['@id']);
        if (prev && prev !== sig) errors.push({ message: `@id ${item['@id']} is used for different types`, path });
        seen.set(item['@id'], sig);
      }
    }
  });
  return { errors, warnings, isValid: errors.length === 0 };
}

/** Read every <script type="application/ld+json"> of an HTML string. A block that is not valid JSON is a parse error. */
export function extractJsonLd(html: string): { blocks: unknown[]; parseErrors: string[] } {
  const blocks: unknown[] = [];
  const parseErrors: string[] = [];
  for (const m of html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)) {
    try {
      blocks.push(JSON.parse(m[1]!));
    } catch (e) {
      parseErrors.push((e as Error).message);
    }
  }
  return { blocks, parseErrors };
}

export function formatReport(name: string, r: ValidationResult): string {
  const lines = [`${r.isValid ? 'PASS' : 'FAIL'} ${name} (${r.errors.length} errors, ${r.warnings.length} warnings)`];
  for (const e of r.errors) lines.push(`  error: ${e.path}: ${e.message}`);
  for (const w of r.warnings) lines.push(`  warning: ${w.path}: ${w.message}`);
  return lines.join('\n');
}
