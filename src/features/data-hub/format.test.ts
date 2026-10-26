import { describe, expect, it } from 'vitest';
import { countdownText, daysUntil, exactSector, farArea, fmtDate, parseAmount, scoreBand, todayIst } from './format';
import { AUCTION, CIRCLE, GAZETTE, readParams, writeParams } from './params';

describe('exactSector', () => {
  it('drops substring matches from the backend', () => {
    const rows = [{ sector: 'Sector 1' }, { sector: 'Sector 10' }, { sector: 'Sector 102' }, { sector: 'sector 1 ' }];
    expect(exactSector(rows, 'Sector 1')).toEqual([{ sector: 'Sector 1' }, { sector: 'sector 1 ' }]);
  });
});

describe('dates in IST', () => {
  it('formats a date-only string on the same day in any server time zone', () => {
    expect(fmtDate('2026-03-10', 'en')).toBe('10 Mar 2026');
    expect(fmtDate(null, 'en')).toBeNull();
    expect(fmtDate('not a date', 'en')).toBeNull();
  });

  it('computes today in IST', () => {
    // 20:00 UTC on 9 March is 01:30 IST on 10 March.
    expect(todayIst(new Date('2026-03-09T20:00:00Z'))).toBe('2026-03-10');
  });

  it('counts whole days to the auction date', () => {
    const now = new Date('2026-03-09T20:00:00Z');
    expect(daysUntil('2026-03-10', now)).toBe(0);
    expect(daysUntil('2026-03-15', now)).toBe(5);
    expect(daysUntil('2026-03-01', now)).toBe(-9);
    expect(daysUntil(null, now)).toBeNull();
    expect(daysUntil('soon', now)).toBeNull();
  });

  it('words the countdown', () => {
    expect(countdownText(-1, 'en')).toBe('This auction has ended');
    expect(countdownText(0, 'en')).toBe('The auction is today');
    expect(countdownText(1, 'en')).toBe('1 day to go');
    expect(countdownText(12, 'hi')).toBe('12 दिन बाकी');
    expect(countdownText(null, 'en')).toBeNull();
  });
});

describe('FAR, scores and amounts', () => {
  it('multiplies plot area by FAR', () => {
    expect(farArea(2000, 2.49)).toBe(4980);
    expect(farArea(0, 2)).toBeNull();
    expect(farArea(100, Number.NaN)).toBeNull();
  });

  it('bands scores like the old site', () => {
    expect(scoreBand(70)).toBe('good');
    expect(scoreBand(69.9)).toBe('average');
    expect(scoreBand(40)).toBe('average');
    expect(scoreBand(39)).toBe('poor');
  });

  it('parses rupee amounts with Indian commas', () => {
    expect(parseAmount('85,00,000')).toBe(8_500_000);
    expect(parseAmount('₹ 1200')).toBe(1200);
    expect(parseAmount('')).toBeNull();
    expect(parseAmount('-5')).toBeNull();
    expect(parseAmount('abc')).toBeNull();
  });
});

describe('URL filters', () => {
  it('keeps only known and valid values', () => {
    const sp = new URLSearchParams('property_type=villa&sector=Sector%2045&utm_source=x');
    expect(readParams(sp, CIRCLE)).toEqual({ sector: 'Sector 45' });
    expect(readParams(new URLSearchParams('type=bogus'), GAZETTE)).toEqual({});
    expect(readParams(new URLSearchParams('type=policy'), GAZETTE)).toEqual({ type: 'policy' });
  });

  it('parses numbers and dates', () => {
    const sp = new URLSearchParams('min_price=100000&max_price=-1&date_from=2026-02-30x&date_to=2026-06-01&type=court');
    expect(readParams(sp, AUCTION)).toEqual({ min_price: 100000, date_to: '2026-06-01', type: 'court' });
    // A day that does not exist is dropped, not rolled into the next month.
    expect(readParams(new URLSearchParams('date_from=2026-02-30'), AUCTION)).toEqual({});
  });

  it('writes a stable query string in spec order', () => {
    expect(writeParams({ type: 'court', city: 'Gurgaon', min_price: 0 }, AUCTION)).toBe('city=Gurgaon&type=court&min_price=0');
    expect(writeParams({}, AUCTION)).toBe('');
  });
});
