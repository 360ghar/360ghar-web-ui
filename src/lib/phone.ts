/** Email and Indian mobile number rules shared by the forms. */

/** Email check (same rule as the old site). */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** 10-digit Indian mobile number: starts with 6, 7, 8 or 9. */
export const MOBILE_RE = /^[6-9]\d{9}$/;

/**
 * The 10 digits of a number typed as "98765 43210", "+91 98765-43210", "919876543210"
 * or "09876543210". Null for any other length. Does not check the first digit.
 */
export function tenDigits(raw: string | null | undefined): string | null {
  let d = (raw ?? '').replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) d = d.slice(2);
  else if (d.length === 11 && d.startsWith('0')) d = d.slice(1);
  return d.length === 10 ? d : null;
}

/** A valid Indian mobile number as 10 digits, or '' when the input is not one. */
export function normalizeMobile(raw: string): string {
  const d = tenDigits(raw);
  return d && MOBILE_RE.test(d) ? d : '';
}

/** "+91XXXXXXXXXX" from 10 digits. */
export const toE164 = (mobile: string) => `+91${mobile}`;
