/** Calendar dates as YYYY-MM-DD strings. No time zone shift: they are built from year, month and day. */

type YMD = { y: number; m: number; d: number };

const pad = (n: number) => String(n).padStart(2, '0');

/** "2026-04-01" -> { y: 2026, m: 4, d: 1 }. Does not check the input. */
export const parseIso = (iso: string): YMD => {
  const [y, m, d] = iso.split('-').map(Number) as [number, number, number];
  return { y, m, d };
};

/** Month is 1 to 12. */
export const formatIso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`;

/** Days in a month (month 1 to 12). */
export const daysIn = (y: number, m: number) => new Date(y, m, 0).getDate();

/** True for a real calendar date in YYYY-MM-DD form. */
export function isDate(iso: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return false;
  const { y, m, d } = parseIso(iso);
  return m >= 1 && m <= 12 && d >= 1 && d <= daysIn(y, m);
}

/** Today in the device time zone. */
export const todayIso = (now = new Date()) => formatIso(now.getFullYear(), now.getMonth() + 1, now.getDate());

/** Whole days from one date to another. Negative when `to` is earlier. */
export function daysBetween(from: string, to: string): number {
  const a = parseIso(from);
  const b = parseIso(to);
  return Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000);
}
