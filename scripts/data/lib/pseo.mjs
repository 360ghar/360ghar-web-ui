/**
 * Quality rules for programmatic pages. Port of the old pseo-quality-check.mjs,
 * but it checks what v2 really renders: the copy from src/features/landing/copy.ts,
 * the index rules of model.ts, the price files in src/data, and every locality.
 *
 * The functions are pure. The v2 code (TypeScript, with "@/" imports) is passed
 * in as `deps`, so the tests can use small fakes and the gate test
 * (scripts/__tests__/pseo-quality.gate.test.mjs) passes the real modules.
 *
 * `deps`: { CITIES, INTENTS, TYPE_SEGMENTS, parseLanding, parseBhk, budgetsFor,
 *           isIndexable, landingCopy, priceContext, typeContext, legacyRedirect,
 *           BUDGETS, localities, isScrapedName, isGeneratedSeed }
 */
import { checkLocalities } from './schema.mjs';

export const LIMITS = { titleMin: 30, titleMax: 70, descriptionMin: 80, descriptionMax: 260, faqMin: 3 };
const BHKS = [1, 2, 3, 4];
const LOCALES = ['en', 'hi'];

/** Every landing page that v2 links to: base pages plus BHK and budget facets. Amenity facets are noindex and not listed. */
export function listLandingPages(deps) {
  const pages = [];
  for (const city of Object.keys(deps.CITIES)) {
    for (const intent of deps.INTENTS) {
      for (const seg of intent === 'pg' ? ['flats'] : Object.keys(deps.TYPE_SEGMENTS)) {
        const landing = deps.parseLanding(city, intent, seg);
        if (!landing) continue;
        pages.push({ path: landing.path, landing, facet: undefined });
        if (intent !== 'pg') for (const bhk of BHKS) pages.push({ path: `${landing.path}/${bhk}-bhk`, landing, facet: { kind: 'bhk', bhk } });
        for (const key of deps.budgetsFor(intent)) pages.push({ path: `${landing.path}/budget/${key}`, landing, facet: { kind: 'budget', key } });
      }
    }
  }
  return pages;
}

/**
 * The old indexation rules (360ghar-web-ui src/seo/indexationPolicy.js), written out
 * again so that v2's `isIndexable` can be compared with them page by page.
 */
export function oldPolicyIndexable({ landing, facet }, approvedCities) {
  if (!approvedCities.includes(landing.city)) return false;
  if (!facet) return true;
  if (!['buy', 'rent'].includes(landing.intent)) return false;
  if (facet.kind === 'bhk') return facet.bhk <= 3;
  const budgets = ['gurgaon/buy/under-50-lakhs', 'gurgaon/buy/under-80-lakhs', 'gurgaon/buy/under-1-crore', 'gurgaon/rent/under-20k'];
  return budgets.includes(`${landing.city}/${landing.intent}/${facet.key}`);
}

const priceKey = (landing) => (landing.intent === 'pg' ? 'pg' : landing.intent);
const ctxOf = (deps, landing) => deps.typeContext?.[landing.city]?.[landing.intent === 'pg' ? 'rent' : landing.intent]?.[landing.type] ?? null;

/** Checks every landing page. Returns { pages, errors, warnings, summary }. */
export function checkLandingPages(deps, limits = LIMITS) {
  const pages = listLandingPages(deps);
  const errors = [];
  const warnings = [];
  const seen = { title: new Map(), description: new Map(), h1: new Map(), faq: new Map() };
  const approved = Object.keys(deps.CITIES);
  const rows = [];

  for (const page of pages) {
    const { path, landing, facet } = page;
    const row = { url: path, locales: {}, issues: [] };
    const err = (m) => {
      row.issues.push(`error: ${m}`);
      errors.push(`${path}: ${m}`);
    };
    const warn = (m) => {
      row.issues.push(`warning: ${m}`);
      warnings.push(`${path}: ${m}`);
    };

    for (const locale of LOCALES) {
      const c = deps.landingCopy(landing, facet, locale);
      row.locales[locale] = { titleLength: c.title.length, descriptionLength: c.description.length, faqs: c.faqs.length };
      if (!c.title || !c.description || !c.h1) err(`${locale}: empty title, description or heading`);
      if (c.title.length < limits.titleMin) err(`${locale}: title too short (${c.title.length}, min ${limits.titleMin})`);
      if (c.description.length < limits.descriptionMin) err(`${locale}: description too short (${c.description.length}, min ${limits.descriptionMin})`);
      if (locale === 'en') {
        if (c.title.length > limits.titleMax) warn(`title longer than ${limits.titleMax} characters (${c.title.length}): search results cut it`);
        if (c.description.length > limits.descriptionMax) warn(`description longer than ${limits.descriptionMax} characters (${c.description.length})`);
      }
      if (c.faqs.length < limits.faqMin) err(`${locale}: only ${c.faqs.length} FAQs (min ${limits.faqMin})`);
      for (const [field, value] of [['title', c.title], ['description', c.description], ['h1', c.h1], ['faq', c.faqs.map((f) => f.a).join('|')]]) {
        const key = `${locale}:${value}`;
        const first = seen[field].get(key);
        if (first) err(`${locale}: ${field === 'faq' ? 'FAQ answers' : field} identical to ${first}`);
        else seen[field].set(key, path);
      }
      if (/\{\{|\}\}|undefined|\bNaN\b/.test(`${c.title} ${c.description} ${c.h1}`)) err(`${locale}: unfilled template slot in title, description or heading`);
    }

    // Price context: the page shows the type's range, or the "default" one.
    const prices = deps.priceContext?.[landing.city]?.[priceKey(landing)];
    const range = prices?.[landing.type] ?? prices?.default ?? null;
    row.priceContext = prices?.[landing.type] ? 'type' : range ? 'default' : 'none';
    if (!range) err(`no price context for ${landing.city}/${priceKey(landing)}`);
    else if (row.priceContext === 'default' && !facet && landing.intent !== 'pg') warn(`price range is the city default: no range for ${landing.type}`);

    const ctx = ctxOf(deps, landing);
    row.typeContext = Boolean(ctx);
    if (!facet && !ctx && landing.intent !== 'pg') warn('no type notes (landingTypeContext.json): the page has only the listings and the FAQ');

    // Same indexation as the old site.
    const indexable = deps.isIndexable(landing, facet, 1);
    row.indexable = indexable;
    const old = oldPolicyIndexable(page, approved);
    if (indexable !== old) err(`indexable is ${indexable} in v2 and ${old} under the old policy`);
    rows.push(row);
  }

  const by = (f) => rows.filter(f).length;
  return {
    pages: rows,
    errors,
    warnings,
    summary: {
      pages: rows.length,
      indexable: by((r) => r.indexable),
      noindex: by((r) => !r.indexable),
      priceContext: { type: by((r) => r.priceContext === 'type'), default: by((r) => r.priceContext === 'default'), none: by((r) => r.priceContext === 'none') },
      withTypeNotes: by((r) => r.typeContext),
      // Pages of the base (no facet) kind that have neither a type range nor type notes.
      thinBase: pages.filter((p, i) => !p.facet && p.landing.intent !== 'pg' && rows[i].priceContext !== 'type' && !rows[i].typeContext).length,
    },
  };
}

/**
 * The old prune list. Each path must not be a live, indexable v2 page: it is a 301
 * to the canonical page, a 404, or noindex. Returns one row per path.
 */
export function checkPruneList(paths, deps) {
  const errors = [];
  const rows = [...new Set(paths)].map((raw) => {
    const to = deps.legacyRedirect(raw);
    if (to) {
      const again = deps.legacyRedirect(to);
      if (again) errors.push(`${raw}: redirect chain (${to} -> ${again})`);
      return { path: raw, outcome: `301 ${to}` };
    }
    const [city = '', intent = '', type = '', a = '', b = ''] = raw.split('/').filter(Boolean);
    const landing = deps.parseLanding(city, intent, type);
    if (!landing) return { path: raw, outcome: '404' };
    let facet;
    if (a) {
      const bhk = deps.parseBhk(a);
      if (bhk && landing.intent !== 'pg') facet = { kind: 'bhk', bhk };
      else if (a === 'budget' && deps.BUDGETS[b] && deps.budgetsFor(landing.intent).includes(b)) facet = { kind: 'budget', key: b };
      if (!facet) return { path: raw, outcome: '404' };
    }
    if (deps.isIndexable(landing, facet, 1)) {
      errors.push(`${raw}: still an indexable page in v2`);
      return { path: raw, outcome: 'indexable' };
    }
    return { path: raw, outcome: 'noindex' };
  });
  return { rows, errors };
}

/** Locality checks: hard errors (shape, duplicates) and content warnings (scraped and duplicate names). */
export function checkLocalityPages(deps) {
  const list = deps.localities;
  const errors = checkLocalities(list);
  const warnings = [];
  const scraped = list.filter((l) => deps.isScrapedName(l));
  const key = (l) => `${String(l.city).toLowerCase()}|${l.name.toLowerCase().replace(/^projects in /, '').replace(/\s+gurgaon$/, '').trim()}`;
  const groups = new Map();
  for (const l of list) (groups.get(key(l)) ?? groups.set(key(l), []).get(key(l))).push(l);
  const twins = [...groups.values()].filter((g) => g.length > 1);
  const scrapedWithTwin = scraped.filter((l) => groups.get(key(l)).length > 1);
  const digitsOnly = list.filter((l) => /^[\d\s.-]+$/.test(l.name));
  const generated = deps.isGeneratedSeed ? list.filter((l) => deps.isGeneratedSeed(l)) : [];
  if (scraped.length) warnings.push(`${scraped.length} localities are named "projects in ..." (scraped from search pages); ${scrapedWithTwin.length} of them have a plain twin`);
  if (twins.length - scrapedWithTwin.length > 0) warnings.push(`${twins.length - scrapedWithTwin.length} other names appear more than once in the same city`);
  if (generated.length) warnings.push(`${generated.length} localities match the names the old seed script made up ("Royal Apartments Sector 45", "HUDA Sector 12", ...): no source backs them`);
  if (digitsOnly.length) warnings.push(`${digitsOnly.length} names are only digits`);
  return {
    errors,
    warnings,
    summary: {
      total: list.length,
      scrapedNames: scraped.length,
      scrapedWithTwin: scrapedWithTwin.length,
      duplicateNameGroups: twins.length,
      generatedSeeds: generated.length,
      digitOnlyNames: digitsOnly.length,
      withParent: list.filter((l) => l.parentLocality).length,
      withNearby: list.filter((l) => l.contentBlocks?.nearby?.length).length,
    },
    examples: { scraped: scraped.slice(0, 5).map((l) => l.slug), generated: generated.slice(0, 5).map((l) => l.slug), twins: twins.slice(0, 5).map((g) => g.map((l) => l.slug)) },
  };
}

/** Runs all checks. `prune` is the list of old prune-list paths. */
export function runPseoCheck(deps, prune = []) {
  const landing = checkLandingPages(deps);
  const pruneResult = checkPruneList(prune, deps);
  const localities = checkLocalityPages(deps);
  const errors = [...landing.errors, ...pruneResult.errors, ...localities.errors];
  const warnings = [...landing.warnings, ...localities.warnings];
  return { landing, prune: pruneResult, localities, errors, warnings, ok: errors.length === 0 };
}
