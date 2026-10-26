/** Conversion factors used by this tool, with square feet as the base unit. */
import { formatNum } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';

export const SQFT_PER = {
  sq_ft: 1,
  sq_mt: 10.7639,
  sq_yd: 9,
  gaj: 9,
  acre: 43_560,
  hectare: 107_639,
  bigha: 27_000,
  guntha: 1_089,
  ground: 2_400,
  cent: 435.6,
  kanal: 5_445,
  marla: 272.25,
} as const;

export type Unit = keyof typeof SQFT_PER;
export const UNITS = Object.keys(SQFT_PER) as Unit[];

export function convert(value: number, from: Unit, to: Unit): number {
  return (value * SQFT_PER[from]) / SQFT_PER[to];
}

/**
 * Area for display: up to 4 decimals, Indian grouping. Values below 1 keep
 * 4 significant digits, so 1 sq ft in hectares is not shown as 0.
 */
export function fmtArea(n: number, locale: Locale = 'en'): string {
  if (!Number.isFinite(n)) return '–';
  if (n === 0) return '0';
  const opts: Intl.NumberFormatOptions = Math.abs(n) < 1 ? { maximumSignificantDigits: 4 } : { maximumFractionDigits: 4 };
  return formatNum(n, locale, opts);
}
