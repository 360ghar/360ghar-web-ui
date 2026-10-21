/**
 * Rent receipt rules, dates and amount in words.
 *
 * Dates are YYYY-MM-DD strings built from local year, month and day. The old
 * page used toISOString(), which is UTC, so in India (UTC+5:30) the first of
 * the month became the last day of the month before.
 */
import { daysIn, formatIso } from '@/lib/dates';

export { todayIso } from '@/lib/dates';

export type Mode = 'upi' | 'bank_transfer' | 'cheque' | 'cash';
export const MODES: Mode[] = ['upi', 'bank_transfer', 'cheque', 'cash'];

export const PAN_RE = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
/** Landlord PAN is needed when the yearly rent is more than ₹1 lakh. */
export const panRequired = (monthly: number) => monthly * 12 > 100_000;
/** A ₹1 revenue stamp is needed on a cash receipt above ₹5,000. */
export const stampRequired = (mode: Mode, monthly: number) => mode === 'cash' && monthly > 5_000;

const pad = (n: number) => String(n).padStart(2, '0');

/** First and last day of a month (month 1 to 12). */
export function monthPeriod(y: number, m: number) {
  return { start: formatIso(y, m, 1), end: formatIso(y, m, daysIn(y, m)) };
}

/** The year the current financial year (April to March) starts. */
export const fyStart = (now = new Date()) => (now.getMonth() >= 3 ? now.getFullYear() : now.getFullYear() - 1);

/** The 12 months of a financial year, April first. */
export function fyMonths(start: number): { y: number; m: number }[] {
  return Array.from({ length: 12 }, (_, i) => {
    const m = ((3 + i) % 12) + 1;
    return { y: m >= 4 ? start : start + 1, m };
  });
}

/** "2026-04-01" -> "01 April 2026". Built from the parts, so no time zone shift. */
export function formatDate(iso: string): string {
  const parts = iso.split('-').map(Number);
  if (parts.length !== 3 || parts.some((n) => !Number.isFinite(n))) return '';
  const [y, m, d] = parts as [number, number, number];
  return new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(y, m - 1, d));
}

/** A short receipt number, "RR-" plus 5 characters. */
export const receiptBase = (now = Date.now()) => `RR-${now.toString(36).toUpperCase().slice(-5)}`;

/** Receipt numbers in a batch: RR-XXXXX-01 to RR-XXXXX-12. */
export const batchNumber = (base: string, i: number) => `${base}-${pad(i + 1)}`;

type BatchItem = { number: string; start: string; end: string; date: string };

/** One receipt per month of the financial year, dated the last day of the month. */
export function batch(base: string, fy: number): BatchItem[] {
  return fyMonths(fy).map(({ y, m }, i) => {
    const p = monthPeriod(y, m);
    return { number: batchNumber(base, i), start: p.start, end: p.end, date: p.end };
  });
}

const ONES = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function belowThousand(n: number): string {
  const out: string[] = [];
  if (n >= 100) {
    out.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
    if (n > 0) out.push('and');
  }
  if (n >= 20) out.push(n % 10 ? `${TENS[Math.floor(n / 10)]} ${ONES[n % 10]}` : TENS[Math.floor(n / 10)]!);
  else if (n > 0) out.push(ONES[n]!);
  return out.join(' ');
}

/** Indian system: 12345678 -> "One Crore Twenty Three Lakh Forty Five Thousand Six Hundred and Seventy Eight". */
export function numberToWords(value: number): string {
  const n = Math.floor(Math.abs(value));
  if (n === 0) return 'Zero';
  const parts: string[] = [];
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1e3;
  if (crore) parts.push(`${numberToWords(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  return (value < 0 ? 'Minus ' : '') + parts.join(' ');
}

/** 25000.5 -> "Rupees Twenty Five Thousand and Fifty Paise Only". Empty for 0. */
export function rupeesInWords(amount: number): string {
  if (!(amount > 0)) return '';
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  return `Rupees ${numberToWords(rupees)}${paise ? ` and ${numberToWords(paise)} Paise` : ''} Only`;
}
