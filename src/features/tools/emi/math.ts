/**
 * Home loan EMI: EMI = P·r·(1+r)^n / ((1+r)^n − 1), r = annual % / 12 / 100,
 * n = years × 12. Same formula as the old site, plus a zero-rate case.
 */

export function emi(principal: number, annualRate: number, months: number): number {
  if (!(principal > 0) || !(months > 0)) return 0;
  const r = annualRate / 12 / 100;
  if (r <= 0) return principal / months;
  const f = (1 + r) ** months;
  return (principal * r * f) / (f - 1);
}

type EmiSummary = { emi: number; months: number; totalPayment: number; totalInterest: number };

export function summary(principal: number, annualRate: number, years: number): EmiSummary {
  const { months, e } = terms(principal, annualRate, years);
  const totalPayment = e * months;
  return { emi: e, months, totalPayment, totalInterest: Math.max(totalPayment - principal, 0) };
}

export type YearRow = { year: number; principal: number; interest: number; balance: number; extra: number };

/** Tenure in months, monthly rate and EMI for a loan. */
function terms(principal: number, annualRate: number, years: number) {
  const months = Math.round(years * 12);
  return { months, r: annualRate / 12 / 100, e: emi(principal, annualRate, months) };
}

/**
 * The shared monthly walk: one step per EMI until the loan is repaid or
 * `maxMonths` is reached. With `prepay`, the lump sum is paid with EMI number
 * `afterMonth` (the EMI stays the same, so the loan ends sooner).
 */
function* amortise(principal: number, { r, e }: { r: number; e: number }, maxMonths: number, prepay?: { amount: number; afterMonth: number }) {
  let balance = principal;
  for (let month = 1; month <= maxMonths && balance > 0.005; month++) {
    const interest = balance * r;
    const part = Math.min(e - interest, balance);
    balance -= part;
    const lump = prepay && month === prepay.afterMonth && prepay.amount > 0 ? Math.min(prepay.amount, balance) : 0;
    balance -= lump;
    yield { month, interest, part, lump, balance };
  }
}

/**
 * Year-by-year split of the payments, and the balance at the end of each year.
 * With `prepay`, a lump sum is paid with EMI number `afterMonth` (the EMI stays
 * the same, so the loan ends sooner). `extra` is that lump sum, kept out of
 * `principal` so a column of EMIs keeps its height.
 */
export function schedule(principal: number, annualRate: number, years: number, prepay?: { amount: number; afterMonth: number }): YearRow[] {
  const t = terms(principal, annualRate, years);
  if (!(t.e > 0)) return [];
  const rows: YearRow[] = [];
  for (const s of amortise(principal, t, Math.ceil(t.months / 12) * 12, prepay)) {
    const row = s.month % 12 === 1 ? rows[rows.push({ year: rows.length + 1, principal: 0, interest: 0, balance: 0, extra: 0 }) - 1]! : rows.at(-1)!;
    row.principal += s.part;
    row.interest += s.interest;
    row.extra += s.lump;
    row.balance = Math.max(s.balance, 0);
  }
  return rows;
}

/** First year in which the EMIs repay more principal than interest (null if never). */
export function crossoverYear(rows: YearRow[]): number | null {
  return rows.find((r) => r.principal > r.interest)?.year ?? null;
}

export type Prepayment = { newMonths: number; monthsSaved: number; interestSaved: number; newTotalInterest: number };

/**
 * One lump-sum prepayment paid together with EMI number `afterMonth`. The EMI
 * stays the same and the tenure gets shorter (the usual bank default).
 */
export function prepayment(principal: number, annualRate: number, years: number, amount: number, afterMonth: number): Prepayment | null {
  const t = terms(principal, annualRate, years);
  if (!(t.e > 0) || !(amount > 0) || afterMonth < 1 || afterMonth >= t.months) return null;
  let interestPaid = 0;
  let month = 0;
  for (const s of amortise(principal, t, t.months, { amount, afterMonth })) {
    interestPaid += s.interest;
    month = s.month;
  }
  const base = summary(principal, annualRate, years).totalInterest;
  return {
    newMonths: month,
    monthsSaved: Math.max(t.months - month, 0),
    interestSaved: Math.max(base - interestPaid, 0),
    newTotalInterest: interestPaid,
  };
}

/** Balance still owed after `afterMonth` EMIs (caps the prepayment input). */
export function balanceAfter(principal: number, annualRate: number, years: number, afterMonth: number): number {
  const t = terms(principal, annualRate, years);
  let balance = principal;
  for (const s of amortise(principal, t, Math.min(afterMonth, t.months))) balance = s.balance;
  return balance > 0.005 ? balance : 0;
}
