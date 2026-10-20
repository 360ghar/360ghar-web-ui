/**
 * Capital gains tax on the sale of land or a building in India.
 *
 * - Long term: held for more than 24 months.
 * - Sold before 23 July 2024: 20% on the gain after indexation (CII).
 * - Sold on or after 23 July 2024: 12.5% without indexation. For property
 *   bought before 23 July 2024, a resident individual or HUF can pay 20% with
 *   indexation instead, so they pay the lower of the two.
 * - Short term: the gain is taxed at the slab rate.
 * - Exemptions (long term only): Section 54 (house sold, new house bought,
 *   new-house cost counted up to ₹10 crore), Section 54F (other asset sold,
 *   exemption in proportion to the net sale money invested, up to ₹10 crore),
 *   Section 54EC (bonds, up to ₹50 lakh).
 * Cess, surcharge and the slab of the rest of the income are not computed.
 */
import { daysIn, formatIso, parseIso } from '@/lib/dates';

export { isDate } from '@/lib/dates';

/** Cost Inflation Index by financial year (key = the year the FY starts). CBDT notifications. */
export const CII: Record<number, number> = {
  2001: 100,
  2002: 105,
  2003: 109,
  2004: 113,
  2005: 117,
  2006: 122,
  2007: 129,
  2008: 137,
  2009: 148,
  2010: 167,
  2011: 184,
  2012: 200,
  2013: 220,
  2014: 240,
  2015: 254,
  2016: 264,
  2017: 272,
  2018: 280,
  2019: 289,
  2020: 301,
  2021: 317,
  2022: 331,
  2023: 348,
  2024: 363,
  2025: 376,
};
export const LATEST_CII_FY = 2025;
export const FIRST_DATE = '2001-04-01';
/** The day the 12.5% rule starts (Finance (No. 2) Act, 2024). */
const CUTOFF = '2024-07-23';
const CAP_54EC = 5_000_000;
const CAP_54 = 100_000_000;

/** The year a financial year starts: 2024-07-23 -> 2024, 2025-02-10 -> 2024. */
export function fyOf(iso: string): number {
  const { y, m } = parseIso(iso);
  return m >= 4 ? y : y - 1;
}

/** 2024 -> "2024-25". */
export const fyLabel = (fy: number) => `${fy}-${String((fy + 1) % 100).padStart(2, '0')}`;

/** "2015-2016" (old share links) -> "2015-04-01". */
export function fromOldFy(raw: string): string | undefined {
  const m = raw.match(/^(\d{4})-(\d{4})$/);
  if (!m || Number(m[2]) !== Number(m[1]) + 1 || CII[Number(m[1])] === undefined) return undefined;
  return `${m[1]}-04-01`;
}

/** Whole months from one date to another (a month counts when its day is reached). */
export function monthsBetween(from: string, to: string): number {
  const a = parseIso(from);
  const b = parseIso(to);
  let months = (b.y - a.y) * 12 + (b.m - a.m);
  if (b.d < Math.min(a.d, daysIn(b.y, b.m))) months -= 1;
  return months;
}

/** Long term when the sale comes after the day the 24th month ends. */
export function isLongTerm(bought: string, sold: string): boolean {
  const a = parseIso(bought);
  const m = a.m - 1 + 24;
  const y = a.y + Math.floor(m / 12);
  const mm = (m % 12) + 1;
  const end = formatIso(y, mm, Math.min(a.d, daysIn(y, mm)));
  return sold > end;
}

type Regime = 'short' | 'old' | 'new' | 'choice';

/** Which rule applies to a long-term sale (dates compare as strings). */
export function regimeFor(bought: string, sold: string): Regime {
  if (!isLongTerm(bought, sold)) return 'short';
  if (sold < CUTOFF) return 'old';
  if (bought >= CUTOFF) return 'new';
  return 'choice';
}

export type CgInput = {
  sale: number;
  purchase: number;
  expenses: number;
  bought: string;
  sold: string;
  /** Slab rate in %, for short-term gains. */
  slab: number;
  asset: 'house' | 'land';
  /** Invested in a new house (Section 54 for a house, 54F otherwise). */
  newHouse: number;
  /** Invested in 54EC bonds. */
  bonds: number;
  /** CII for the sale year when it is not in the table yet. */
  saleCii?: number;
};

export type Calc = { rate: number; cost: number; gain: number; exemption: number; taxable: number; tax: number; taxBefore: number };

export type CgResult = {
  regime: Regime;
  longTerm: boolean;
  months: number;
  net: number;
  ciiBuy: number;
  ciiSale: number;
  /** 12.5% without indexation (null when it does not apply to this sale). */
  plain: Calc | null;
  /** 20% with indexation (null when it does not apply to this sale). */
  indexed: Calc | null;
  /** Short term at the slab rate. */
  short: Calc | null;
  /** The calculation the tax is paid on. */
  pay: Calc;
  loss: boolean;
};

export function ciiFor(fy: number, fallback?: number): number {
  return CII[fy] ?? (fy > LATEST_CII_FY ? (fallback ?? CII[LATEST_CII_FY]!) : CII[2001]!);
}

/** Exemption for a positive long-term gain. */
export function exemption(gain: number, net: number, i: Pick<CgInput, 'asset' | 'newHouse' | 'bonds'>): number {
  if (!(gain > 0)) return 0;
  const house = Math.min(Math.max(i.newHouse, 0), CAP_54);
  const s54 = i.asset === 'house' ? Math.min(house, gain) : net > 0 ? Math.min((gain * house) / net, gain) : 0;
  const s54ec = Math.min(Math.max(i.bonds, 0), CAP_54EC, gain);
  return Math.min(s54 + s54ec, gain);
}

function calc(rate: number, cost: number, net: number, exempt: boolean, i: CgInput): Calc {
  const gain = net - cost;
  const ex = exempt ? exemption(gain, net, i) : 0;
  const taxable = Math.max(gain - ex, 0);
  return { rate, cost, gain, exemption: ex, taxable, tax: taxable * rate, taxBefore: Math.max(gain, 0) * rate };
}

export function capitalGains(i: CgInput): CgResult {
  const regime = regimeFor(i.bought, i.sold);
  const longTerm = regime !== 'short';
  const net = i.sale - i.expenses;
  const ciiBuy = ciiFor(fyOf(i.bought));
  const ciiSale = ciiFor(fyOf(i.sold), i.saleCii);
  const indexedCost = (i.purchase * ciiSale) / ciiBuy;
  const plain = regime === 'new' || regime === 'choice' ? calc(0.125, i.purchase, net, true, i) : null;
  const indexed = regime === 'old' || regime === 'choice' ? calc(0.2, indexedCost, net, true, i) : null;
  const short = regime === 'short' ? calc(i.slab / 100, i.purchase, net, false, i) : null;
  const pay = short ?? (plain && indexed ? (indexed.tax < plain.tax ? indexed : plain) : (plain ?? indexed)!);
  return { regime, longTerm, months: monthsBetween(i.bought, i.sold), net, ciiBuy, ciiSale, plain, indexed, short, pay, loss: pay.gain < 0 };
}
