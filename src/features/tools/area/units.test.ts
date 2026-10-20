import { describe, expect, it } from 'vitest';
import { convert, fmtArea, UNITS } from './units';

describe('convert', () => {
  it('uses the old site rates', () => {
    expect(convert(1, 'acre', 'gaj')).toBe(4840);
    expect(convert(1, 'acre', 'sq_ft')).toBe(43_560);
    expect(convert(360, 'sq_ft', 'gaj')).toBe(40);
    expect(convert(100, 'sq_mt', 'sq_ft')).toBeCloseTo(1076.39, 2);
    expect(convert(4840, 'gaj', 'acre')).toBe(1);
    expect(convert(1, 'kanal', 'marla')).toBe(20);
    expect(convert(1, 'bigha', 'acre')).toBeCloseTo(0.6198, 4);
  });

  it('round-trips every pair', () => {
    for (const a of UNITS) for (const b of UNITS) expect(convert(convert(7.5, a, b), b, a)).toBeCloseTo(7.5, 9);
  });

  it('has a rate for the old default target (the NaN bug)', () => {
    expect(Number.isNaN(convert(1, 'sq_ft', 'sq_yd'))).toBe(false);
    expect(convert(9, 'sq_ft', 'sq_yd')).toBe(1);
  });
});

describe('fmtArea', () => {
  it('groups and trims decimals', () => {
    expect(fmtArea(107_639)).toBe('1,07,639');
    expect(fmtArea(266.666666)).toBe('266.6667');
    expect(fmtArea(0)).toBe('0');
  });

  it('keeps small values readable', () => {
    expect(fmtArea(convert(1, 'sq_ft', 'hectare'))).toBe('0.00000929');
    expect(fmtArea(0.5)).toBe('0.5');
  });
});
