import { describe, expect, it } from 'vitest';
import { daysBetween, daysIn, formatIso, isDate, parseIso, todayIso } from './dates';

describe('dates', () => {
  it('parses and formats', () => {
    expect(parseIso('2026-04-01')).toEqual({ y: 2026, m: 4, d: 1 });
    expect(formatIso(2026, 4, 1)).toBe('2026-04-01');
  });
  it('knows the days in a month', () => {
    expect(daysIn(2024, 2)).toBe(29);
    expect(daysIn(2023, 2)).toBe(28);
    expect(daysIn(2026, 12)).toBe(31);
  });
  it('checks real dates', () => {
    expect(isDate('2024-02-29')).toBe(true);
    expect(isDate('2023-02-29')).toBe(false);
    expect(isDate('2024-13-01')).toBe(false);
    expect(isDate('2024-1-01')).toBe(false);
  });
  it('gives the local date, not the UTC date', () => {
    expect(todayIso(new Date(2026, 4, 1, 0, 5))).toBe('2026-05-01');
  });
  it('counts days between dates', () => {
    expect(daysBetween('2026-03-10', '2026-03-11')).toBe(1);
    expect(daysBetween('2026-03-10', '2026-03-10')).toBe(0);
    expect(daysBetween('2026-03-10', '2026-03-01')).toBe(-9);
    expect(daysBetween('2023-12-31', '2024-03-01')).toBe(61);
  });
});
