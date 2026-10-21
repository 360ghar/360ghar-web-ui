/**
 * Pure helpers for the data hub pages: dates in IST, the auction countdown,
 * the stamp-duty base value, FAR area and score bands. Unit tests: format.test.ts.
 */
import { daysBetween } from '@/lib/dates';
import { formatDate, parseNumber } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';

const IST = 'Asia/Kolkata';

/** Keeps only rows whose sector equals `sector` (the backend matches substrings). */
export function exactSector<T extends { sector: string }>(items: T[], sector: string): T[] {
  const want = sector.trim().toLowerCase();
  return items.filter((x) => x.sector.trim().toLowerCase() === want);
}

/** "2026-03-10" or an ISO timestamp -> "10 Mar 2026", always in IST. */
export function fmtDate(iso: string | null | undefined, locale: Locale, month: 'short' | 'long' = 'short'): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return formatDate(d, locale, { day: 'numeric', month, year: 'numeric', timeZone: IST });
}

/** Today's date in IST as YYYY-MM-DD. */
export function todayIst(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: IST, year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

/** Whole days from today (IST) to a YYYY-MM-DD date. 0 is today, negative is past. */
export function daysUntil(date: string | null | undefined, now: Date = new Date()): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}/.test(date)) return null;
  return daysBetween(todayIst(now), date.slice(0, 10));
}

export function countdownText(days: number | null, locale: Locale): string | null {
  if (days === null) return null;
  const hi = locale === 'hi';
  if (days < 0) return hi ? 'नीलामी हो चुकी है' : 'This auction has ended';
  if (days === 0) return hi ? 'नीलामी आज है' : 'The auction is today';
  if (days === 1) return hi ? 'कल नीलामी है' : '1 day to go';
  return hi ? `${days} दिन बाकी` : `${days} days to go`;
}

/**
 * Stamp duty is charged on the higher of the deal value and the circle-rate
 * value (area x rate). The backend does not apply this rule (backend-gaps R7),
 * so the page sends the higher value.
 */
export function dutyBase(deal: number, areaSqyd?: number | null, ratePerSqyd?: number | null): { value: number; byCircle: boolean; circleValue: number | null } {
  const circleValue = areaSqyd && ratePerSqyd && areaSqyd > 0 && ratePerSqyd > 0 ? Math.round(areaSqyd * ratePerSqyd) : null;
  if (circleValue !== null && circleValue > deal) return { value: circleValue, byCircle: true, circleValue };
  return { value: deal, byCircle: false, circleValue };
}

/** Stamp duty rates by state and buyer, as on the old site (Delhi row corrected: 6% men, 4% women). */
export const STATE_RATES = [
  { state: 'Haryana', buyer: 'male', rate: 7 },
  { state: 'Haryana', buyer: 'female', rate: 5 },
  { state: 'Delhi', buyer: 'male', rate: 6 },
  { state: 'Delhi', buyer: 'female', rate: 4 },
  { state: 'Uttar Pradesh', buyer: 'male', rate: 7 },
  { state: 'Rajasthan', buyer: 'male', rate: 5 },
] as const;

export const duty = (value: number, ratePct: number) => Math.round((value * ratePct) / 100);

/** Buildable floor area = plot area x FAR. */
export function farArea(plot: number, far: number): number | null {
  if (!(plot > 0) || !(far > 0)) return null;
  return Math.round(plot * far);
}

export type Band = 'good' | 'average' | 'poor';
/** Score bands used by the old site: 70+ good, 40-69 average, below 40 poor. */
export const scoreBand = (score: number): Band => (score >= 70 ? 'good' : score >= 40 ? 'average' : 'poor');

/** A positive number from a text field, or null. Accepts "85,00,000". */
export function parseAmount(raw: string): number | null {
  const n = parseNumber(raw);
  return n !== null && n > 0 ? n : null;
}
