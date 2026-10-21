import { describe, expect, it } from 'vitest';
import prices from '@/data/priceContext.json';
import { logPos, median, niceCeil, parseRange } from './charts';

describe('parseRange', () => {
  it('reads lakh and crore ranges', () => {
    expect(parseRange('85 lakhs - 3.5 crore')).toEqual([8_500_000, 35_000_000]);
    expect(parseRange('1.5 - 6 crore')).toEqual([15_000_000, 60_000_000]);
    expect(parseRange('40 lakhs - 80 lakhs')).toEqual([4_000_000, 8_000_000]);
  });

  it('reads monthly rents', () => {
    expect(parseRange('15,000 - 85,000/month')).toEqual([15_000, 85_000]);
    expect(parseRange('12,000 - 1 lakh/month')).toEqual([12_000, 100_000]);
    expect(parseRange('1.5 - 5 lakh/month')).toEqual([150_000, 500_000]);
  });

  it('rejects text it cannot read', () => {
    expect(parseRange('on request')).toBeNull();
    expect(parseRange('5 crore - 1 crore')).toBeNull();
  });

  it('reads every range in priceContext.json', () => {
    for (const city of Object.values(prices)) for (const seg of Object.values(city)) for (const v of Object.values(seg as Record<string, string>)) expect(parseRange(v), v).not.toBeNull();
  });
});

describe('helpers', () => {
  it('median, niceCeil, logPos', () => {
    expect(median([3, 1, 2])).toBe(2);
    expect(median([4, 1, 2, 3])).toBe(2.5);
    expect(median([])).toBeNull();
    expect(niceCeil(222_624)).toBe(250_000);
    expect(niceCeil(1_000)).toBe(1_000);
    expect(logPos(100, 10, 1000)).toBeCloseTo(0.5);
  });
});
