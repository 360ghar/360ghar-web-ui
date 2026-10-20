/** Pure helpers for the sign-in flows. */
import type { Locale } from '@/lib/i18n/locale';
import { localizePath, stripLocale } from '@/lib/i18n/locale';
import { EMAIL_RE, normalizeMobile, toE164 } from '@/lib/phone';
import type { AuthStage } from './store';

export type Identifier = { kind: 'email'; value: string } | { kind: 'phone'; value: string; e164: string };

/** Accepts an email, or an Indian mobile number with or without +91 / 0. */
export function parseIdentifier(input: string): Identifier | null {
  const v = input.trim();
  if (v.includes('@')) return EMAIL_RE.test(v) ? { kind: 'email', value: v.toLowerCase() } : null;
  if (!/^\+?[\d\s()-]+$/.test(v)) return null;
  const d = normalizeMobile(v);
  return d ? { kind: 'phone', value: d, e164: toE164(d) } : null;
}

/** Password rule shared with the old site: 8+ characters, one capital letter, one digit. */
export function passwordProblems(pw: string): ('length' | 'upper' | 'digit')[] {
  const out: ('length' | 'upper' | 'digit')[] = [];
  if (pw.length < 8) out.push('length');
  if (!/[A-Z]/.test(pw)) out.push('upper');
  if (!/\d/.test(pw)) out.push('digit');
  return out;
}

/** Only same-site paths are allowed as a return target. */
export function safeNext(next: string | null | undefined, locale: Locale): string {
  if (!next || !next.startsWith('/') || next.startsWith('//') || next.startsWith('/\\')) return localizePath('/', locale);
  const bare = stripLocale(next.split(/[?#]/)[0] ?? '/');
  if (['/login', '/register', '/auth/callback', '/forgot-password', '/reset-password'].includes(bare)) return localizePath('/account', locale);
  return next;
}

/** Sign-in URL that returns to `next` (default: the current page, path and query). Browser only when `next` is omitted. */
export function loginHref(locale: Locale, next: string = window.location.pathname + window.location.search): string {
  return `${localizePath('/login', locale)}?next=${encodeURIComponent(next)}`;
}

/** Where to send a user after sign-in, from the backend auth stage. */
export function pathForStage(stage: AuthStage['stage'] | undefined, next: string, locale: Locale): string {
  if (stage === 'profile_completion') return `${localizePath('/profile-completion', locale)}?next=${encodeURIComponent(next)}`;
  if (stage === 'identifier_verification') return localizePath('/login', locale);
  return next;
}

/** Date-of-birth rule from the backend (app/schemas/user.py): age 18 to 120. */
export function dobProblem(dob: string, today = new Date()): 'required' | 'young' | 'old' | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dob)) return 'required';
  const [y, m, d] = dob.split('-').map(Number) as [number, number, number];
  let age = today.getFullYear() - y;
  if (today.getMonth() + 1 < m || (today.getMonth() + 1 === m && today.getDate() < d)) age -= 1;
  if (age < 18) return 'young';
  if (age > 120) return 'old';
  return null;
}

export function maskIdentifier(id: Identifier): string {
  if (id.kind === 'phone') return `+91 ${id.value.slice(0, 2)}******${id.value.slice(-2)}`;
  const [u, dom] = id.value.split('@') as [string, string];
  return `${u.slice(0, 2)}***@${dom}`;
}
