import { describe, expect, it } from 'vitest';
import type { PlaceHit } from '@/lib/maps';
import { areaLabel, exactArea, mergeSuggestions, normalizeArea, searchAreas } from './areaSearch';

const names = (list: ReturnType<typeof searchAreas>) => list.map((a) => a.name);

const google = (main: string, id = main): PlaceHit => ({ id, main, secondary: 'Gurugram, Haryana', prediction: {} });

describe('normalizeArea', () => {
  it('folds case, hyphens, extra spaces and "sec"', () => {
    expect(normalizeArea('  Sec-56 ')).toBe('sector 56');
    expect(normalizeArea('DLF_Phase 1')).toBe('dlf phase 1');
    expect(normalizeArea('Sector 56')).toBe('sector 56');
    expect(normalizeArea('Sec. 56')).toBe('sector 56');
  });

  it('keeps "sec" inside a longer word', () => {
    expect(normalizeArea('Section 8')).toBe('section 8');
  });
});

describe('searchAreas', () => {
  it('returns the popular places for an empty query', () => {
    expect(names(searchAreas(''))).toEqual(['Sector 56', 'DLF Phase 1', 'Golf Course Road', 'Sohna Road', 'Sector 54', 'Sushant Lok 1']);
  });

  it('ranks an exact sector first', () => {
    expect(names(searchAreas('sector 8'))[0]).toBe('Sector 8');
    expect(names(searchAreas('Sector 56'))[0]).toBe('Sector 56');
  });

  it('reads "sec" as "sector"', () => {
    expect(names(searchAreas('sec 56'))[0]).toBe('Sector 56');
  });

  it('puts the popular road before its extension', () => {
    expect(names(searchAreas('golf'))[0]).toBe('Golf Course Road');
  });

  it('orders phases naturally', () => {
    expect(names(searchAreas('dlf phase')).slice(0, 5)).toEqual(['DLF Phase 1', 'DLF Phase 2', 'DLF Phase 3', 'DLF Phase 4', 'DLF Phase 5']);
  });

  it('matches a word in the middle of a name', () => {
    expect(names(searchAreas('course'))).toContain('Golf Course Road');
  });

  it('matches an alias', () => {
    expect(names(searchAreas('dlf the aralias'))).toContain('DLF Aralias');
  });

  it('returns nothing for an unknown query', () => {
    expect(searchAreas('xyzzy')).toEqual([]);
  });

  it('marks sectors and phases for the locality filter, roads for q', () => {
    expect(searchAreas('sector 56')[0]?.filter).toBe('locality');
    expect(searchAreas('dlf phase 1')[0]?.filter).toBe('locality');
    expect(searchAreas('golf course road')[0]?.filter).toBe('q');
  });

  it('labels the type in both languages', () => {
    expect(areaLabel('sector', 'en')).toBe('Sector');
    expect(areaLabel('sector', 'hi')).toBe('सेक्टर');
    expect(searchAreas('sector 56', 'hi')[0]?.secondary).toBe('सेक्टर · गुरुग्राम');
  });
});

describe('exactArea', () => {
  it('resolves a whole name or alias for the hero submit', () => {
    expect(exactArea('sec 56')?.name).toBe('Sector 56');
    expect(exactArea('DLF The Aralias')?.name).toBe('DLF Aralias');
    expect(exactArea('sector')).toBeNull();
    expect(exactArea('2 bhk in sector 56')).toBeNull();
  });
});

describe('mergeSuggestions', () => {
  it('keeps local rows first and drops a Google row with the same name', () => {
    const merged = mergeSuggestions(searchAreas('sector 56'), [google('Sector 56'), google('Cyber Hub')]);
    expect(merged.map((x) => (x.kind === 'area' ? x.area.name : x.place.main))).toEqual(['Sector 56', 'Cyber Hub']);
  });

  it('respects the limit and keeps the Google tail only while there is room', () => {
    const local = searchAreas('sector 1');
    const merged = mergeSuggestions(local, [google('A'), google('B')], 3);
    expect(merged).toHaveLength(3);
    expect(merged.every((x) => x.kind === 'area')).toBe(true);
  });
});
