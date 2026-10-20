import { describe, expect, it } from 'vitest';
import { BANKS, eligibility, foirFor } from './math';

const base = { income: 50_000, emis: 0, expenses: 0, rate: 8.5, tenure: 20 };

describe('foirFor', () => {
  it('uses the income bands', () => {
    expect(foirFor(50_000)).toBe(0.5);
    expect(foirFor(50_001)).toBe(0.55);
    expect(foirFor(100_000)).toBe(0.55);
    expect(foirFor(100_001)).toBe(0.6);
    expect(foirFor(200_001)).toBe(0.65);
  });
});

describe('eligibility', () => {
  it('turns the allowed EMI into a loan amount', () => {
    const e = eligibility(base);
    expect(e.maxEmi).toBe(25_000);
    expect(Math.round(e.maxLoan / 1e5)).toBe(29); // about ₹28.8 lakh
    expect(Math.round(e.maxLoan)).toBe(2_880_771);
  });

  it('takes expenses off the income and EMIs off the allowed EMI', () => {
    const e = eligibility({ ...base, income: 100_000, expenses: 20_000, emis: 10_000 });
    expect(e.foir).toBe(0.55);
    expect(e.maxEmi).toBe(80_000 * 0.55 - 10_000);
  });

  it('is zero when obligations use up the allowance', () => {
    expect(eligibility({ ...base, emis: 30_000 })).toEqual({ foir: 0.5, maxEmi: 0, maxLoan: 0 });
    expect(eligibility({ ...base, expenses: 60_000 }).maxLoan).toBe(0);
  });

  it('handles a zero rate', () => {
    expect(eligibility({ ...base, rate: 0, tenure: 10 }).maxLoan).toBe(25_000 * 120);
  });

  it('gives a higher estimate for a bank with a higher FOIR', () => {
    const [sbi, , , , bob] = BANKS.map((b) => eligibility(base, b.foir).maxLoan);
    expect(bob!).toBeGreaterThan(sbi!);
  });
});
