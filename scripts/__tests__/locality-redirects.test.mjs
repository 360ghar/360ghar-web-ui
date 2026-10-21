import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { ALL_LOCALITIES, isScrapedName, isThinLocality, resolveLocality } from '@/features/localities/data';
import { legacyRedirect } from '@/lib/redirects';
import { isScrapedName as aiScraped, isThinLocalityName } from '../../src/lib/seo/aiDiscovery.ts';
import { baseName, buildRedirects, checkRedirects, findTwin, fullSlug } from '../data/lib/locality-redirects.mjs';

const map = JSON.parse(readFileSync('src/data/locality-redirects.json', 'utf8'));
const built = buildRedirects(ALL_LOCALITIES, isThinLocality, isScrapedName);
const row = (name, slug, city = 'Gurgaon', entityType = 'locality') => ({ name, slug, city, entityType });

describe('locality redirect map (src/data/locality-redirects.json)', () => {
  it('is what the script builds from the data (deterministic, up to date)', () => {
    expect(map).toEqual(built.map);
    expect(Object.keys(map)).toEqual([...Object.keys(map)].sort());
    expect(built).toMatchObject({ scraped: 462, withTwin: 289 });
    expect(built.withoutTwin).toHaveLength(173);
    expect(Object.keys(map)).toHaveLength(434);
  });

  it('passes every safety check: target exists and is not thin, no self, no chain, no loop', () => {
    expect(checkRedirects(map, ALL_LOCALITIES, isThinLocality)).toEqual([]);
    const targets = new Set(Object.values(map));
    for (const [from, to] of Object.entries(map)) {
      expect(from).not.toBe(to);
      expect(Object.hasOwn(map, to), `${from} -> ${to} is a chain`).toBe(false);
      const t = resolveLocality(to);
      expect(t?.redirect, `${to} resolves as it is`).toBeNull();
      expect(isThinLocality(t.locality), `${to} is thin`).toBe(false);
    }
    expect(targets.size).toBeGreaterThan(100);
  });

  it('every key resolves to a scraped row, and the twin is in the same city', () => {
    for (const [from, to] of Object.entries(map)) {
      const src = resolveLocality(from).locality;
      expect(isScrapedName(src), from).toBe(true);
      expect(resolveLocality(to).locality.city, from).toBe(src.city);
    }
  });

  it('covers every scraped row that has a twin, under every slug form the page accepts', () => {
    const withTwin = ALL_LOCALITIES.filter((l) => isScrapedName(l) && findTwin(l, ALL_LOCALITIES, isThinLocality));
    expect(withTwin).toHaveLength(289);
    for (const l of withTwin) {
      const full = fullSlug(l);
      expect(map[full], full).toBeDefined();
      // whichever form of the old URL was used, resolveLocality lands on this row or a row with the same twin
      for (const s of [full, l.slug, `${l.slug}-gurgaon`]) expect(map[s], s).toBe(map[full]);
    }
  }, 30_000); // walks the whole map: close to the 5 s default on a busy machine

  it('leaves seed rows and scraped rows without a twin alone', () => {
    for (const l of ALL_LOCALITIES.filter(isThinLocality)) {
      const inMap = Object.hasOwn(map, fullSlug(l));
      expect(inMap, l.name).toBe(isScrapedName(l) && !built.withoutTwin.includes(l));
    }
    expect(legacyRedirect('/locality/huda-sector-45-gurgaon')).toBeNull();
  });

  it('legacyRedirect gives one hop for every key, in both locales, and the target is not redirected again', () => {
    for (const [from, to] of Object.entries(map)) {
      for (const prefix of ['', '/hi']) {
        const hop = legacyRedirect(`${prefix}/locality/${from}`);
        expect(hop, from).toBe(`${prefix}/locality/${to}`);
        expect(legacyRedirect(hop), `${hop} chains`).toBeNull();
        const hop2 = legacyRedirect(`${prefix}/locality/${from}/rent`);
        expect(hop2, from).toBe(`${prefix}/locality/${to}/rent`);
        expect(legacyRedirect(hop2)).toBeNull();
      }
    }
  }, 30_000);
});

describe('twin matching', () => {
  const rows = [row('dlf phase 1', 'dlf-phase-1'), row('projects in dlf phase i', 'projects-in-dlf-phase-i'), row('mg road', 'mg-road'), row('mg road', 'mg-road-road', 'Gurgaon', 'road'), row('projects in mg road gurgaon', 'projects-in-mg-road-gurgaon'), row('sector 5', 'sector-5', 'Noida'), row('projects in sector 5', 'projects-in-sector-5')];
  const scraped = (r) => /^projects in /.test(r.name);
  const thin = (r) => scraped(r);

  it('strips the prefix, a trailing city word and reads roman numerals after "phase"', () => {
    expect(baseName('projects in DLF Phase IV')).toBe('dlf phase 4');
    expect(baseName('projects in mg road gurgaon')).toBe('mg road gurgaon');
    expect(findTwin(rows[1], rows, thin)?.twin.slug).toBe('dlf-phase-1');
  });

  it('prefers the slug that equals the name when there are several twins', () => {
    const t = findTwin(rows[4], rows, thin);
    expect(t.twin.slug).toBe('mg-road');
    expect(t.candidates).toBe(2);
  });

  it('never crosses cities', () => {
    expect(findTwin(rows[6], rows, thin)).toBeNull();
  });

  it('checkRedirects refuses a thin target, a chain, a self redirect and a missing target', () => {
    const t = (r) => scraped(r);
    const bad = { 'projects-in-dlf-phase-i-gurgaon': 'projects-in-mg-road-gurgaon-gurgaon' };
    expect(checkRedirects(bad, rows, t).join('|')).toMatch(/missing or thin/);
    expect(checkRedirects({ 'projects-in-dlf-phase-i-gurgaon': 'projects-in-dlf-phase-i-gurgaon' }, rows, t).join('|')).toMatch(/itself/);
    expect(checkRedirects({ 'projects-in-dlf-phase-i-gurgaon': 'mg-road-gurgaon', 'mg-road-gurgaon': 'dlf-phase-1-gurgaon' }, rows, t).join('|')).toMatch(/chain/);
    expect(checkRedirects({ 'projects-in-dlf-phase-i-gurgaon': 'nope-gurgaon' }, rows, t).join('|')).toMatch(/missing or thin/);
  });
});

describe('the script copies of the predicate', () => {
  it('aiDiscovery.ts (used by the script) agrees with data.ts on every row', () => {
    for (const l of ALL_LOCALITIES) {
      expect(aiScraped(l.name), l.name).toBe(isScrapedName(l));
      expect(isThinLocalityName(l.name), l.name).toBe(isThinLocality(l));
    }
  });
});
