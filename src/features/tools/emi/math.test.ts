import { describe, expect, it } from 'vitest';
import { balanceAfter, crossoverYear, emi, prepayment, schedule, summary } from './math';

describe('emi', () => {
  it('matches the standard formula', () => {
    // ₹50 lakh at 8.5% for 20 years.
    expect(Math.round(emi(5_000_000, 8.5, 240))).toBe(43_391);
    // ₹10 lakh at 8.5% for 20 years (the page default).
    expect(Math.round(emi(1_000_000, 8.5, 240))).toBe(8_678);
  });

  it('handles a zero rate and bad input', () => {
    expect(emi(1_200_000, 0, 120)).toBe(10_000);
    expect(emi(0, 8.5, 240)).toBe(0);
    expect(emi(1_000_000, 8.5, 0)).toBe(0);
  });

  it('sums the totals', () => {
    const s = summary(5_000_000, 8.5, 20);
    expect(s.months).toBe(240);
    expect(Math.round(s.totalPayment)).toBe(Math.round(s.emi * 240));
    expect(Math.round(s.totalInterest / 1e5)).toBe(54); // about ₹54.1 lakh
    expect(Math.round(summary(5_000_000, 8.5, 30).totalInterest / 1e5)).toBe(88); // about ₹88.4 lakh
  });
});

describe('schedule', () => {
  it('has one row per year and pays the loan off', () => {
    const rows = schedule(1_000_000, 8.5, 20);
    expect(rows).toHaveLength(20);
    expect(rows.at(-1)!.balance).toBeLessThan(1);
    const paid = rows.reduce((a, r) => a + r.principal, 0);
    expect(Math.round(paid)).toBe(1_000_000);
    const interest = rows.reduce((a, r) => a + r.interest, 0);
    expect(Math.round(interest)).toBe(Math.round(summary(1_000_000, 8.5, 20).totalInterest));
  });

  it('puts most of the first year into interest', () => {
    const [first] = schedule(5_000_000, 8.5, 20);
    expect(first!.interest).toBeGreaterThan(first!.principal * 2.5);
  });
});

describe('prepayment', () => {
  it('shortens the tenure and saves interest', () => {
    const p = prepayment(1_000_000, 8.5, 20, 200_000, 12)!;
    expect(p.newMonths).toBeLessThan(240);
    expect(p.monthsSaved).toBe(240 - p.newMonths);
    expect(p.interestSaved).toBeGreaterThan(0);
    expect(Math.round(p.newTotalInterest + p.interestSaved)).toBe(Math.round(summary(1_000_000, 8.5, 20).totalInterest));
  });

  it('closes the loan when the prepayment covers the balance', () => {
    const owed = balanceAfter(1_000_000, 8.5, 20, 24);
    const p = prepayment(1_000_000, 8.5, 20, owed + 1, 24)!;
    expect(p.newMonths).toBe(24);
  });

  it('returns null for no prepayment or a month outside the tenure', () => {
    expect(prepayment(1_000_000, 8.5, 20, 0, 12)).toBeNull();
    expect(prepayment(1_000_000, 8.5, 20, 100_000, 0)).toBeNull();
    expect(prepayment(1_000_000, 8.5, 20, 100_000, 240)).toBeNull();
  });
});

describe('balanceAfter', () => {
  it('starts at the principal, matches the year rows and ends at zero', () => {
    const rows = schedule(1_000_000, 8.5, 20);
    expect(balanceAfter(1_000_000, 8.5, 20, 0)).toBe(1_000_000);
    expect(balanceAfter(1_000_000, 8.5, 20, 12)).toBeCloseTo(rows[0]!.balance, 6);
    expect(balanceAfter(1_000_000, 8.5, 20, 60)).toBeCloseTo(rows[4]!.balance, 6);
    expect(balanceAfter(1_000_000, 8.5, 20, 240)).toBe(0);
    expect(balanceAfter(1_000_000, 8.5, 20, 999)).toBe(0);
  });
});

describe('schedule with a prepayment', () => {
  it('keeps the lump sum apart and ends the loan sooner', () => {
    const base = schedule(1_000_000, 8.5, 20);
    const rows = schedule(1_000_000, 8.5, 20, { amount: 300_000, afterMonth: 12 });
    expect(rows[0]!.extra).toBe(300_000);
    expect(rows[0]!.principal).toBeCloseTo(base[0]!.principal, 6);
    expect(rows.length).toBeLessThan(base.length);
    const repaid = rows.reduce((s, r) => s + r.principal + r.extra, 0);
    expect(Math.round(repaid)).toBe(1_000_000);
    // Same months as prepayment() reports.
    const p = prepayment(1_000_000, 8.5, 20, 300_000, 12)!;
    expect(rows.length).toBe(Math.ceil(p.newMonths / 12));
  });

  it('finds the year the principal overtakes the interest', () => {
    expect(crossoverYear(schedule(1_000_000, 8.5, 20))).toBe(13);
    expect(crossoverYear(schedule(1_000_000, 1, 5))).toBe(1);
    expect(crossoverYear([])).toBeNull();
  });
});
