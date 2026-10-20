/**
 * Home loan eligibility from FOIR (fixed obligation to income ratio), same
 * rules as the old site:
 *   max EMI  = (income − other expenses) × FOIR − existing EMIs
 *   max loan = present value of that EMI over the tenure.
 */
import { emi } from '../emi/math';

/** FOIR by monthly income band. */
export function foirFor(income: number): number {
  if (income > 200_000) return 0.65;
  if (income > 100_000) return 0.6;
  if (income > 50_000) return 0.55;
  return 0.5;
}

/** Fixed FOIR per bank (estimates carried over from the old site). */
export const BANKS = [
  { name: 'SBI', foir: 0.5 },
  { name: 'HDFC Bank', foir: 0.55 },
  { name: 'ICICI Bank', foir: 0.55 },
  { name: 'Axis Bank', foir: 0.5 },
  { name: 'Bank of Baroda', foir: 0.6 },
] as const;

type LoanInput = { income: number; emis: number; expenses: number; rate: number; tenure: number };
export type Eligibility = { foir: number; maxEmi: number; maxLoan: number };

export function eligibility(i: LoanInput, foir = foirFor(i.income)): Eligibility {
  const maxEmi = Math.max(i.income - i.expenses, 0) * foir - i.emis;
  if (!(maxEmi > 0)) return { foir, maxEmi: 0, maxLoan: 0 };
  // EMI for ₹1 of loan; the loan is the EMI divided by it (handles a 0% rate too).
  const perRupee = emi(1, i.rate, Math.round(i.tenure * 12));
  return { foir, maxEmi, maxLoan: perRupee > 0 ? maxEmi / perRupee : 0 };
}
