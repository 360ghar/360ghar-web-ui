import { describe, expect, it } from 'vitest';
import { capitalGains, CII, ciiFor, exemption, fromOldFy, fyLabel, fyOf, isDate, isLongTerm, monthsBetween, regimeFor, type CgInput } from './math';

const base: CgInput = {
  sale: 5_000_000,
  purchase: 2_000_000,
  expenses: 50_000,
  bought: '2015-06-01',
  sold: '2025-06-01',
  slab: 30,
  asset: 'house',
  newHouse: 0,
  bonds: 0,
};

describe('dates and CII', () => {
  it('finds the financial year', () => {
    expect(fyOf('2024-04-01')).toBe(2024);
    expect(fyOf('2025-03-31')).toBe(2024);
    expect(fyLabel(2024)).toBe('2024-25');
    expect(fyLabel(2099)).toBe('2099-00');
  });

  it('looks up the CII, with a fallback for years not notified yet', () => {
    expect(ciiFor(2015)).toBe(254);
    expect(ciiFor(2024)).toBe(363);
    expect(ciiFor(2025)).toBe(376);
    expect(ciiFor(2026)).toBe(376);
    expect(ciiFor(2026, 390)).toBe(390);
    expect(ciiFor(1999)).toBe(100);
    expect(Object.keys(CII)).toHaveLength(25);
  });

  it('checks dates and maps old FY links', () => {
    expect(isDate('2024-02-29')).toBe(true);
    expect(isDate('2023-02-29')).toBe(false);
    expect(isDate('2024-13-01')).toBe(false);
    expect(fromOldFy('2015-2016')).toBe('2015-04-01');
    expect(fromOldFy('2015-2017')).toBeUndefined();
    expect(fromOldFy('1990-1991')).toBeUndefined();
  });
});

describe('holding period', () => {
  it('is long term only after more than 24 months', () => {
    expect(isLongTerm('2022-04-01', '2024-04-01')).toBe(false);
    expect(isLongTerm('2022-04-01', '2024-04-02')).toBe(true);
    expect(isLongTerm('2020-02-29', '2022-02-28')).toBe(false);
    expect(isLongTerm('2020-02-29', '2022-03-01')).toBe(true);
    expect(monthsBetween('2022-04-15', '2024-04-14')).toBe(23);
    expect(monthsBetween('2022-04-15', '2024-04-15')).toBe(24);
  });

  it('picks the rule from the dates', () => {
    expect(regimeFor('2023-01-01', '2024-06-01')).toBe('short');
    expect(regimeFor('2015-06-01', '2024-07-22')).toBe('old');
    expect(regimeFor('2015-06-01', '2024-07-23')).toBe('choice');
    expect(regimeFor('2024-07-23', '2026-08-01')).toBe('new');
  });
});

describe('capitalGains', () => {
  it('computes both rules for a house bought before 23 July 2024', () => {
    const r = capitalGains(base);
    expect(r.regime).toBe('choice');
    // 12.5% on 50,00,000 - 50,000 - 20,00,000 = 29,50,000
    expect(r.plain!.gain).toBe(2_950_000);
    expect(r.plain!.tax).toBe(368_750);
    // Indexed cost = 20,00,000 x 376 / 254
    expect(Math.round(r.indexed!.cost)).toBe(2_960_630);
    expect(Math.round(r.indexed!.tax)).toBe(Math.round((4_950_000 - (2_000_000 * 376) / 254) * 0.2));
    expect(r.pay).toBe(r.plain);
  });

  it('pays 20% with indexation when that is lower', () => {
    const r = capitalGains({ ...base, sale: 3_500_000, bought: '2005-06-01' });
    expect(r.indexed!.tax).toBeLessThan(r.plain!.tax);
    expect(r.pay).toBe(r.indexed);
  });

  it('uses only 20% with indexation for sales before 23 July 2024', () => {
    const r = capitalGains({ ...base, sold: '2024-06-01' });
    expect(r.regime).toBe('old');
    expect(r.plain).toBeNull();
    expect(Math.round(r.indexed!.cost)).toBe(Math.round((2_000_000 * 363) / 254));
  });

  it('uses only 12.5% for property bought on or after 23 July 2024', () => {
    const r = capitalGains({ ...base, bought: '2024-08-01', sold: '2026-09-01', saleCii: 400 });
    expect(r.regime).toBe('new');
    expect(r.indexed).toBeNull();
    expect(r.pay.rate).toBe(0.125);
  });

  it('taxes a short-term gain at the slab and gives no exemptions', () => {
    const r = capitalGains({ ...base, bought: '2024-01-01', sold: '2025-06-01', slab: 20, newHouse: 5_000_000 });
    expect(r.regime).toBe('short');
    expect(r.pay.tax).toBe(2_950_000 * 0.2);
    expect(r.pay.exemption).toBe(0);
  });

  it('flags a loss and charges no tax', () => {
    const r = capitalGains({ ...base, sale: 1_500_000 });
    expect(r.loss).toBe(true);
    expect(r.pay.tax).toBe(0);
  });
});

describe('exemptions', () => {
  const net = 4_950_000;
  it('Section 54 covers up to the gain, and counts the new house up to ₹10 crore', () => {
    expect(exemption(2_000_000, net, { asset: 'house', newHouse: 1_500_000, bonds: 0 })).toBe(1_500_000);
    expect(exemption(2_000_000, net, { asset: 'house', newHouse: 9_000_000, bonds: 0 })).toBe(2_000_000);
    expect(exemption(200_000_000, 300_000_000, { asset: 'house', newHouse: 150_000_000, bonds: 0 })).toBe(100_000_000);
  });

  it('Section 54EC is capped at ₹50 lakh', () => {
    expect(exemption(8_000_000, 10_000_000, { asset: 'house', newHouse: 0, bonds: 7_000_000 })).toBe(5_000_000);
  });

  it('Section 54F is in proportion to the net sale money invested', () => {
    expect(exemption(2_000_000, 4_000_000, { asset: 'land', newHouse: 2_000_000, bonds: 0 })).toBe(1_000_000);
    expect(exemption(2_000_000, 4_000_000, { asset: 'land', newHouse: 4_000_000, bonds: 0 })).toBe(2_000_000);
  });

  it('never exceeds the gain and is zero for a loss', () => {
    expect(exemption(1_000_000, net, { asset: 'house', newHouse: 800_000, bonds: 800_000 })).toBe(1_000_000);
    expect(exemption(-10, net, { asset: 'house', newHouse: 800_000, bonds: 0 })).toBe(0);
  });

  it('reduces the tax in both rules', () => {
    const r = capitalGains({ ...base, bonds: 1_000_000 });
    expect(r.plain!.exemption).toBe(1_000_000);
    expect(r.plain!.tax).toBe((2_950_000 - 1_000_000) * 0.125);
    expect(r.plain!.taxBefore).toBe(368_750);
  });
});
