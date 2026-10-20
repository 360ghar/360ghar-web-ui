import { describe, expect, it } from 'vitest';
import { checkLandingPages, checkLocalityPages, checkPruneList, listLandingPages, oldPolicyIndexable, runPseoCheck } from '../data/lib/pseo.mjs';

// A small landing model: two cities, three intents, two types.
const CITIES = { gurgaon: { name: 'Gurgaon' }, delhi: { name: 'Delhi' } };
const TYPE_SEGMENTS = { flats: 'apartment', villa: 'villa' };
const parseLanding = (city, intent, type) => {
  if (!CITIES[city] || !['buy', 'rent', 'pg'].includes(intent)) return null;
  if (intent === 'pg') return type === 'flats' ? { city, intent, typeSegment: 'flats', type: 'pg', path: `/${city}/pg/flats` } : null;
  return TYPE_SEGMENTS[type] ? { city, intent, typeSegment: type, type: TYPE_SEGMENTS[type], path: `/${city}/${intent}/${type}` } : null;
};
const BUDGETS = { 'under-20k': { purpose: 'rent' }, 'under-1-crore': { purpose: 'buy' } };
const budgetsFor = (intent) => Object.entries(BUDGETS).filter(([, b]) => b.purpose === (intent === 'buy' ? 'buy' : 'rent')).map(([k]) => k);
const isIndexable = (l, facet) => {
  if (!facet) return true;
  if (l.intent === 'pg') return false;
  if (facet.kind === 'bhk') return facet.bhk <= 3;
  return ['gurgaon/rent/under-20k', 'gurgaon/buy/under-1-crore'].includes(`${l.city}/${l.intent}/${facet.key}`);
};
const landingCopy = (l, facet) => {
  const tag = `${l.type} ${l.intent} ${l.city} ${facet ? JSON.stringify(facet) : ''}`;
  return {
    title: `${tag} - a long enough title for the check`,
    description: `${tag}. This description is long enough to pass the minimum length rule of the quality check.`,
    h1: tag,
    faqs: [1, 2, 3].map((n) => ({ q: `q${n}`, a: `a${n} ${tag}` })),
  };
};
const priceContext = { gurgaon: { buy: { default: '1 - 2 crore', apartment: '2 - 3 crore' }, rent: { default: '10,000 - 20,000/month' }, pg: { default: '5,000 - 9,000/month' } }, delhi: { buy: { default: '1 - 2 crore' }, rent: { default: '9,000 - 19,000/month' }, pg: { default: '4,000 - 8,000/month' } } };
const legacyRedirect = (p) => (p.startsWith('/gurgaon/pg/') && p !== '/gurgaon/pg/flats' ? '/gurgaon/pg/flats' : null);
const deps = () => ({
  CITIES, INTENTS: ['buy', 'rent', 'pg'], TYPE_SEGMENTS, parseLanding, parseBhk: (s) => Number(s.match(/^(\d)-bhk$/)?.[1]) || null, budgetsFor, isIndexable, landingCopy, priceContext: structuredClone(priceContext), typeContext: {}, legacyRedirect, BUDGETS,
  localities: [{ name: 'Sector 5', slug: 'sector-5', city: 'Gurgaon', entityType: 'sector', type: 'Sector' }],
  isScrapedName: (l) => /^projects in /i.test(l.name),
  isGeneratedSeed: (l) => /^huda sector \d+$/i.test(l.name),
});

describe('landing page list', () => {
  it('lists base pages and BHK and budget facets, and PG pages only for flats', () => {
    const paths = listLandingPages(deps()).map((p) => p.path);
    expect(paths).toContain('/gurgaon/buy/flats');
    expect(paths).toContain('/gurgaon/buy/villa/4-bhk');
    expect(paths).toContain('/delhi/rent/villa/budget/under-20k');
    expect(paths).toContain('/gurgaon/pg/flats');
    expect(paths).toContain('/gurgaon/pg/flats/budget/under-20k');
    expect(paths.some((p) => p.startsWith('/gurgaon/pg/villa'))).toBe(false);
    expect(paths.some((p) => /pg\/flats\/\d-bhk/.test(p))).toBe(false);
  });
});

describe('landing page checks', () => {
  it('passes good pages', () => {
    const r = checkLandingPages(deps());
    expect(r.errors).toEqual([]);
    expect(r.summary.priceContext.none).toBe(0);
    expect(r.summary.indexable + r.summary.noindex).toBe(r.summary.pages);
  });

  it('fails a short title, a short description and identical copy on two pages', () => {
    const d = deps();
    d.landingCopy = (l, facet) => ({ ...landingCopy(l, facet), title: l.type === 'villa' ? 'Villas' : landingCopy(l, facet).title, description: l.city === 'delhi' ? 'Short' : landingCopy(l, facet).description, h1: 'Same heading' });
    const errors = checkLandingPages(d).errors.join('\n');
    expect(errors).toMatch(/title too short/);
    expect(errors).toMatch(/description too short/);
    expect(errors).toMatch(/h1 identical to/);
    expect(errors).toMatch(/title identical to/);
  });

  it('fails when a city has no price context, and warns when only the default exists', () => {
    const d = deps();
    delete d.priceContext.delhi.rent;
    expect(checkLandingPages(d).errors.join('\n')).toMatch(/no price context for delhi\/rent/);
    const w = checkLandingPages(deps()).warnings.join('\n');
    expect(w).toMatch(/city default: no range for villa/);
  });

  it('fails an unfilled template slot and too few FAQs', () => {
    const d = deps();
    d.landingCopy = (l, f) => ({ ...landingCopy(l, f), title: `{{city}} ${landingCopy(l, f).title}`, faqs: [{ q: 'q', a: 'a' }] });
    const errors = checkLandingPages(d).errors.join('\n');
    expect(errors).toMatch(/unfilled template slot/);
    expect(errors).toMatch(/only 1 FAQs/);
  });

  it('fails when v2 indexation differs from the old policy', () => {
    const d = deps();
    d.isIndexable = () => true;
    expect(checkLandingPages(d).errors.join('\n')).toMatch(/indexable is true in v2 and false under the old policy/);
  });

  it('old policy: BHK 1-3 and four budgets are indexable, PG facets and 4 BHK are not', () => {
    const l = (city, intent) => ({ city, intent });
    const yes = (page) => oldPolicyIndexable(page, ['gurgaon']);
    expect(yes({ landing: l('gurgaon', 'buy') })).toBe(true);
    expect(yes({ landing: l('gurgaon', 'buy'), facet: { kind: 'bhk', bhk: 3 } })).toBe(true);
    expect(yes({ landing: l('gurgaon', 'buy'), facet: { kind: 'bhk', bhk: 4 } })).toBe(false);
    expect(yes({ landing: l('gurgaon', 'pg'), facet: { kind: 'bhk', bhk: 1 } })).toBe(false);
    expect(yes({ landing: l('gurgaon', 'rent'), facet: { kind: 'budget', key: 'under-20k' } })).toBe(true);
    expect(yes({ landing: l('gurgaon', 'rent'), facet: { kind: 'budget', key: 'under-10k' } })).toBe(false);
    expect(yes({ landing: l('delhi', 'buy') })).toBe(false);
  });
});

describe('prune list', () => {
  it('accepts 301, 404 and noindex outcomes', () => {
    const r = checkPruneList(['/gurgaon/pg/villa', '/gurgaon/buy/villa/4-bhk', '/nowhere/buy/flats', '/gurgaon/buy/moon/2-bhk', '/gurgaon/pg/villa'], deps());
    expect(r.errors).toEqual([]);
    expect(r.rows.map((x) => x.outcome)).toEqual(['301 /gurgaon/pg/flats', 'noindex', '404', '404']);
  });

  it('fails an entry that is still an indexable page, and a redirect chain', () => {
    const d = deps();
    expect(checkPruneList(['/gurgaon/buy/villa/2-bhk', '/gurgaon/rent/flats'], d).errors).toEqual(['/gurgaon/buy/villa/2-bhk: still an indexable page in v2', '/gurgaon/rent/flats: still an indexable page in v2']);
    d.legacyRedirect = (p) => (p === '/a' ? '/b' : p === '/b' ? '/c' : null);
    expect(checkPruneList(['/a'], d).errors[0]).toMatch(/redirect chain/);
  });
});

describe('locality checks', () => {
  it('reports scraped names with their twins as warnings, not errors', () => {
    const d = deps();
    d.localities = [
      { name: 'Golf Course Road', slug: 'golf-course-road', city: 'Gurgaon', entityType: 'road', type: 'Road' },
      { name: 'projects in golf course road', slug: 'projects-in-golf-course-road', city: 'Gurgaon', entityType: 'locality', type: 'Locality' },
      { name: 'projects in nowhere', slug: 'projects-in-nowhere', city: 'Gurgaon', entityType: 'locality', type: 'Locality' },
      { name: 'HUDA Sector 45', slug: 'huda-sector-45', city: 'Gurgaon', entityType: 'locality', type: 'Locality' },
    ];
    const r = checkLocalityPages(d);
    expect(r.errors).toEqual([]);
    expect(r.summary).toMatchObject({ total: 4, scrapedNames: 2, scrapedWithTwin: 1, generatedSeeds: 1 });
    expect(r.warnings.join('\n')).toMatch(/1 localities match the names the old seed script made up/);
    expect(r.warnings[0]).toMatch(/2 localities are named "projects in/);
  });

  it('fails placeholder names and duplicate slugs', () => {
    const d = deps();
    d.localities = [
      { name: 'povp 01y6f0', slug: 'povp-01y6f0', city: 'Gurgaon', entityType: 'project', type: 'Project' },
      { name: 'Sector 5', slug: 'sector-5', city: 'Gurgaon', entityType: 'sector', type: 'Sector' },
      { name: 'Sector Five', slug: 'sector-5', city: 'Gurgaon', entityType: 'sector', type: 'Sector' },
    ];
    const errors = checkLocalityPages(d).errors.join('\n');
    expect(errors).toMatch(/placeholder/);
    expect(errors).toMatch(/duplicate URL slug/);
  });

  it('runPseoCheck combines the three parts', () => {
    const r = runPseoCheck(deps(), ['/gurgaon/pg/villa']);
    expect(r.errors).toEqual([]);
    expect(r.ok).toBe(true);
    expect(r.landing.summary.pages).toBeGreaterThan(0);
    expect(r.prune.rows).toHaveLength(1);
  });
});
