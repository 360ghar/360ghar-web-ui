/** A simple, illustrative loan scenario using a fixed 50% income-share assumption. */
import { emi } from '../emi/math';

export const DEFAULT_INCOME_SHARE = 0.5;

type LoanInput = { income: number; emis: number; expenses: number; rate: number; tenure: number };
export type LoanScenario = { incomeShare: number; maxEmi: number; maxLoan: number };

export function estimateLoanScenario(i: LoanInput, incomeShare = DEFAULT_INCOME_SHARE): LoanScenario {
  const share = Math.min(Math.max(incomeShare, 0), 1);
  const maxEmi = Math.max(Math.max(i.income - i.expenses, 0) * share - i.emis, 0);
  if (!(maxEmi > 0)) return { incomeShare: share, maxEmi: 0, maxLoan: 0 };
  // EMI for ₹1 of loan; the loan is the EMI divided by it (handles a 0% rate too).
  const perRupee = emi(1, i.rate, Math.round(i.tenure * 12));
  return { incomeShare: share, maxEmi, maxLoan: perRupee > 0 ? maxEmi / perRupee : 0 };
}
