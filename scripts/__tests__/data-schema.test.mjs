/**
 * Every JSON file in src/data must have the shape that the loaders read. The
 * checks are in scripts/data/lib/schema.mjs (the pipeline runs them before a
 * --write). This test also reads the files through the real loaders.
 */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseRange } from '@/features/data-hub/charts';
import { ALL_LOCALITIES, landmarksFor, localitySlug, resolveLocality } from '@/features/localities/data';
import { displayName, isThinLocalityName } from '@/features/localities/thin';
import { buildAreaIndex } from '../data/lib/area-index.mjs';
import { INDEX_KEYS, checkAreaIndex, checkLandingTypeContext, checkLandmarks, checkLocalities, checkLocalitiesIndex, checkOfficeLandmarks, checkPriceContext } from '../data/lib/schema.mjs';

const dir = path.join(process.cwd(), 'src', 'data');
const read = (name) => JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));

describe('src/data files', () => {
  it('covers every json file in the folder', () => {
    const known = ['area-index.json', 'landingTypeContext.json', 'localities-index.json', 'localities.json', 'locality-landmarks.json', 'locality-redirects.json', 'office-landmarks.json', 'priceContext.json'];
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
    // A new data file needs a check in scripts/data/lib/schema.mjs and a line here (locality-redirects.json: locality-redirects.test.mjs).
    expect(files.sort()).toEqual(known);
  });

  it('localities.json is valid', () => {
    expect(checkLocalities(read('localities.json'))).toEqual([]);
  });

  it('localities-index.json matches localities.json', () => {
    expect(checkLocalitiesIndex(read('localities-index.json'), read('localities.json'))).toEqual([]);
  });

  it('area-index.json is valid and matches its source', () => {
    expect(checkAreaIndex(read('area-index.json'), read('localities.json'), isThinLocalityName)).toEqual([]);
  });

  it('area-index.json is up to date with localities.json', () => {
    expect(buildAreaIndex(read('localities.json'), { isThin: isThinLocalityName, display: displayName })).toEqual(read('area-index.json'));
  });

  it('priceContext.json is valid and every range is readable by the charts', () => {
    expect(checkPriceContext(read('priceContext.json'), parseRange)).toEqual([]);
  });

  it('landingTypeContext.json is valid and carries no withheld price bands', () => {
    expect(checkLandingTypeContext(read('landingTypeContext.json'))).toEqual([]);
  });

  it('the landmark files are valid', () => {
    expect(checkLandmarks(read('locality-landmarks.json'))).toEqual([]);
    expect(checkOfficeLandmarks(read('office-landmarks.json'))).toEqual([]);
  });
});

describe('locality loader on the real data', () => {
  it('resolves every entity by its canonical slug, without a redirect', () => {
    for (const l of ALL_LOCALITIES) {
      const r = resolveLocality(localitySlug(l));
      expect(r?.locality, localitySlug(l)).toBe(l);
      expect(r?.redirect).toBeNull();
    }
  });

  it('resolves every bare slug', () => {
    for (const l of ALL_LOCALITIES) {
      const r = resolveLocality(l.slug);
      expect(r, l.slug).not.toBeNull();
      // A slug that ends in "-gurgaon" can equal the canonical URL of another entity, which then wins.
      expect(r.locality.slug === l.slug || localitySlug(r.locality) === l.slug, l.slug).toBe(true);
    }
  });

  it('returns landmarks as lists for every entity', () => {
    for (const l of ALL_LOCALITIES) expect(Array.isArray(landmarksFor(l))).toBe(true);
  });
});

describe('the checks catch bad data', () => {
  const good = () => JSON.parse(JSON.stringify(read('localities.json').slice(0, 5)));

  it('flags a duplicate slug, a bad city and a placeholder name', () => {
    const rows = good();
    rows[1].slug = rows[0].slug;
    rows[2].city = 'mumbai';
    rows[3].name = 'povp 01y6f0';
    const problems = checkLocalities(rows).join('\n');
    expect(problems).toMatch(/duplicate URL slug/);
    expect(problems).toMatch(/unknown city/);
    expect(problems).toMatch(/placeholder/);
  });

  it('flags an index row that differs from its locality', () => {
    const loc = good();
    const index = loc.map((l) => ({ slug: l.slug, name: l.name, city: l.city, entityType: l.entityType, type: l.type, lastVerifiedAt: l.lastVerifiedAt })).sort((a, b) => a.name.localeCompare(b.name));
    expect(checkLocalitiesIndex(index, loc)).toEqual([]);
    index[0].city = 'delhi';
    expect(checkLocalitiesIndex(index, loc).join()).toMatch(/city differs/);
    expect(INDEX_KEYS).toHaveLength(6);
  });

  it('flags an unreadable price range and a missing default', () => {
    const bad = { gurgaon: { buy: { apartment: 'on request' }, rent: { default: '10,000 - 20,000/month' } } };
    const problems = checkPriceContext(bad, parseRange).join('\n');
    expect(problems).toMatch(/needs a "default"/);
    expect(problems).toMatch(/cannot be read/);
  });
});
