import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALITY_TOTAL } from '@/features/home/load';
import { ALL_LOCALITIES, displayName, isGeneratedSeed, isNoindexLocality, isScrapedName, isThinLocality, LISTED_LOCALITIES, localitySlug, nearbyLocalities, resolveLocality } from './data';

describe('locality slugs', () => {
  it('resolves the canonical slug', () => {
    const r = resolveLocality('dlf-phase-1-gurgaon');
    expect(r?.locality.slug).toBe('dlf-phase-1');
    expect(r?.redirect).toBeNull();
  });

  it('redirects the bare slug', () => {
    expect(resolveLocality('dlf-phase-1')?.redirect).toBe('dlf-phase-1-gurgaon');
  });

  it('redirects old "-gurgaon" URLs of entities in other cities', () => {
    const other = ALL_LOCALITIES.find((l) => l.city.toLowerCase() !== 'gurgaon');
    expect(other).toBeTruthy();
    const r = resolveLocality(`${other!.slug}-gurgaon`);
    expect(r?.redirect).toBe(localitySlug(other!));
  });

  it('resolves a bare slug that itself ends in "-gurgaon"', () => {
    const r = resolveLocality('antriksh-gurgaon');
    expect(r?.locality.slug).toBe('antriksh-gurgaon');
    expect(r?.redirect).toBe('antriksh-gurgaon-gurgaon');
  });

  it('returns null for unknown slugs', () => {
    expect(resolveLocality('no-such-place-anywhere')).toBeNull();
  });

  it('title-cases lower-case names', () => {
    expect(displayName('dlf phase 1')).toBe('DLF Phase 1');
    expect(displayName('Sector 57')).toBe('Sector 57');
  });
});

describe('nearbyLocalities', () => {
  it('finds sibling phases, not unrelated sectors', async () => {
    const { nearbyLocalities } = await import('./data');
    const l = resolveLocality('dlf-phase-1-gurgaon')!.locality;
    const names = nearbyLocalities(l).map((x) => x.name.toLowerCase());
    expect(names.some((x) => x.startsWith('dlf phase'))).toBe(true);
    expect(names).not.toContain('102a');
  });
});

describe('scraped names', () => {
  it('finds the "projects in ..." entries', () => {
    expect(isScrapedName({ name: 'projects in golf course road' })).toBe(true);
    expect(isScrapedName({ name: 'Golf Course Road' })).toBe(false);
    expect(ALL_LOCALITIES.filter(isScrapedName)).toHaveLength(462);
  });
});

describe('generated seed names', () => {
  it('matches the names the old seed script made up, not real places', () => {
    for (const name of ['HUDA Sector 45', 'Housing Board Colony Sector 7', 'RWA Sector 50', 'Block C Sector 60', 'Sector 12 Extension', 'Royal Apartments Sector 45', 'Zenith Valley Sector 9']) expect(isGeneratedSeed({ name }), name).toBe(true);
    for (const name of ['Sector 57', 'DLF Phase 1', 'Sector 37D', 'Golf Course Road', 'Emerald Hills', 'Godrej Summit']) expect(isGeneratedSeed({ name }), name).toBe(false);
  });

  it('counts 710 in the data (100 housing board, 100 HUDA, 39 RWA, 156 block, 115 extension, 200 apartment names)', () => {
    expect(ALL_LOCALITIES.filter(isGeneratedSeed)).toHaveLength(710);
  });
});

describe('locality count', () => {
  // The home page links to /localities with this number. That page lists LISTED_LOCALITIES (2,043), so the home
  // constant should be 2043; until the home owner changes src/features/home/load.ts line 12 (3215), both pass.
  it('matches the home page constant (all rows or the listed rows)', () => {
    expect(LISTED_LOCALITIES.length).toBe(LOCALITY_TOTAL);
  });
});

describe('thin localities (owner decision 2026-09-29)', () => {
  it('splits the 3,215 rows: 462 scraped, 710 seed, no overlap, 1,172 thin, 2,043 listed', () => {
    const scraped = ALL_LOCALITIES.filter(isScrapedName);
    const seed = ALL_LOCALITIES.filter(isGeneratedSeed);
    expect(scraped).toHaveLength(462);
    expect(seed).toHaveLength(710);
    expect(scraped.filter(isGeneratedSeed)).toHaveLength(0);
    expect(ALL_LOCALITIES.filter(isThinLocality)).toHaveLength(1172);
    expect(LISTED_LOCALITIES).toHaveLength(2043);
    expect(LISTED_LOCALITIES.some(isThinLocality)).toBe(false);
  });

  it('isThinLocality is the union of the two helpers', () => {
    for (const name of ['projects in dlf phase 1', 'HUDA Sector 45', 'Royal Apartments Sector 45']) expect(isThinLocality({ name }), name).toBe(true);
    for (const name of ['DLF Phase 1', 'Sector 57', 'Golf Course Road']) expect(isThinLocality({ name }), name).toBe(false);
  });

  it('noindex when the place is unknown or thin, index otherwise', () => {
    expect(isNoindexLocality(null)).toBe(true);
    expect(isNoindexLocality(undefined)).toBe(true);
    expect(isNoindexLocality({ name: 'projects in golf course road' })).toBe(true);
    expect(isNoindexLocality({ name: 'HUDA Sector 45' })).toBe(true);
    expect(isNoindexLocality(resolveLocality('dlf-phase-1-gurgaon')!.locality)).toBe(false);
  });

  it('thin pages still resolve (a direct hit answers 200 or 301, never 404)', () => {
    const thin = ALL_LOCALITIES.find(isGeneratedSeed)!;
    expect(resolveLocality(localitySlug(thin))?.locality).toBe(thin);
  });

  it('nearby lists never contain a thin row', () => {
    for (const l of ALL_LOCALITIES) for (const n of nearbyLocalities(l, 12)) expect(isThinLocality(n), `${l.name} -> ${n.name}`).toBe(false);
  }, 30_000); // walks all 3,215 rows: close to the 5 s default on a busy machine
});

describe('locality evidence freshness', () => {
  it('does not use the shared lastVerifiedAt field as freshness or provenance', () => {
    for (const f of [
      'src/features/localities/LocalityPage.astro',
      'src/pages/locality/[slug].astro',
      'src/features/feeds/data.ts',
      'src/pages/rss/[feed].xml.ts',
    ]) {
      expect(readFileSync(f, 'utf8'), f).not.toContain('lastVerifiedAt');
    }
  });

  it('keeps source-backed generated dates for locality provenance and structured data', () => {
    const page = readFileSync('src/features/localities/LocalityPage.astro', 'utf8');
    const route = readFileSync('src/pages/locality/[slug].astro', 'utf8');
    expect(page).toContain('<Provenance date={generated.date} sources={generated.sources} />');
    expect(route).toContain('...(generated ? { dateModified: generated.date } : {})');
  });
});

describe('lists and links use LISTED_LOCALITIES', () => {
  const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
  const sources = walk('src').filter((f) => /\.(ts|tsx|astro)$/.test(f) && !/\.test\./.test(f));

  it('no file lists or links every row: ALL_LOCALITIES is only defined in data.ts', () => {
    const users = sources.filter((f) => /\bALL_LOCALITIES\b/.test(readFileSync(f, 'utf8')));
    expect(users).toEqual(['src/features/localities/data.ts']);
  });

  it('the pages that read the directory, city hub, sitemap, RSS and place lists use the listed rows', () => {
    for (const f of ['src/features/localities/DirectoryPage.astro', 'src/features/landing/CityHub.astro', 'src/features/feeds/data.ts', 'src/pages/rss/[feed].xml.ts', 'src/features/localities/live.ts']) {
      expect(readFileSync(f, 'utf8'), f).toContain('LISTED_LOCALITIES');
    }
  });

  it('the locality pages take their noindex flag from isNoindexLocality', () => {
    for (const f of ['src/pages/locality/[slug].astro', 'src/features/localities/LocalityIntentPage.astro']) expect(readFileSync(f, 'utf8'), f).toContain('noindex={isNoindexLocality(l)}');
  });
});
