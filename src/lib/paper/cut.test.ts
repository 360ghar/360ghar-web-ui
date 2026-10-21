import { describe, expect, it } from 'vitest';
import { cutBandPath, cutPolygon, rng } from './cut';

describe('cutPolygon', () => {
  it('is deterministic for a seed', () => {
    expect(cutPolygon('card-1')).toBe(cutPolygon('card-1'));
    expect(cutPolygon('card-1')).not.toBe(cutPolygon('card-2'));
  });

  it('keeps every offset inside the amplitude', () => {
    const poly = cutPolygon(7, { amp: 3 });
    const px = [...poly.matchAll(/([\d.]+)px/g)].map((m) => Number(m[1]));
    expect(px.length).toBeGreaterThan(8);
    for (const v of px) expect(v).toBeLessThanOrEqual(3);
  });

  it('keeps percentage stops inside 0-100 and in order on the top edge', () => {
    const poly = cutPolygon('order', { across: 12 });
    const top = poly
      .slice(8, -1)
      .split(', ')
      .slice(1, 12)
      .map((p) => Number(p.split('%')[0]));
    for (let i = 1; i < top.length; i += 1) expect(top[i]!).toBeGreaterThan(top[i - 1]!);
    for (const v of top) expect(v).toBeGreaterThan(0);
    for (const v of top) expect(v).toBeLessThan(100);
  });
});

describe('cutBandPath', () => {
  it('starts and ends on the band floor', () => {
    const d = cutBandPath('band', 100, 20, 10);
    expect(d.startsWith('M0 20')).toBe(true);
    expect(d.endsWith('L100 20 Z')).toBe(true);
  });
});

describe('rng', () => {
  it('returns values in [0, 1)', () => {
    const r = rng(1);
    for (let i = 0; i < 1000; i += 1) {
      const v = r();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});
