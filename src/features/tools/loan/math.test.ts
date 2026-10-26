import { describe, expect, it } from 'vitest';
import { DEFAULT_INCOME_SHARE, estimateLoanScenario } from './math';

const base = { income: 50_000, emis: 0, expenses: 0, rate: 8.5, tenure: 20 };

describe('estimateLoanScenario', () => {
  it('uses one explicit illustrative default share across income levels and accepts an override', () => {
    expect(DEFAULT_INCOME_SHARE).toBe(0.5);
    expect(estimateLoanScenario({ ...base, income: 100_000 }).incomeShare).toBe(0.5);
    expect(estimateLoanScenario({ ...base, income: 200_001 }).incomeShare).toBe(0.5);
    expect(estimateLoanScenario(base, 0.4).incomeShare).toBe(0.4);
  });

  it('turns the assumed EMI capacity into a loan scenario amount', () => {
    const e = estimateLoanScenario(base);
    expect(e.maxEmi).toBe(25_000);
    expect(Math.round(e.maxLoan / 1e5)).toBe(29); // about ₹28.8 lakh
    expect(Math.round(e.maxLoan)).toBe(2_880_771);
  });

  it('takes expenses off the income and EMIs off the allowed EMI', () => {
    const e = estimateLoanScenario({ ...base, income: 100_000, expenses: 20_000, emis: 10_000 });
    expect(e.incomeShare).toBe(0.5);
    expect(e.maxEmi).toBe(80_000 * 0.5 - 10_000);
  });

  it('is zero when obligations use up the allowance', () => {
    expect(estimateLoanScenario({ ...base, emis: 25_000 })).toEqual({ incomeShare: 0.5, maxEmi: 0, maxLoan: 0 });
    expect(estimateLoanScenario({ ...base, expenses: 60_000 }).maxLoan).toBe(0);
  });

  it('handles a zero rate', () => {
    expect(estimateLoanScenario({ ...base, rate: 0, tenure: 10 }).maxLoan).toBe(25_000 * 120);
  });

  it('clamps the scenario assumption to an income share between zero and one', () => {
    expect(estimateLoanScenario(base, -0.1).incomeShare).toBe(0);
    expect(estimateLoanScenario(base, 1.1).incomeShare).toBe(1);
  });
});
