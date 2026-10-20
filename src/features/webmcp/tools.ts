/**
 * The WebMCP tools of 360Ghar: what an AI agent in the browser may do on the
 * site. Each function takes the raw tool input (untrusted, from an agent),
 * checks it, and returns a plain JSON result. None of them throws:
 *
 *   { ok: true, ... }                      success
 *   { ok: false, error: { code, message } } a problem the agent can read and act on
 *
 * Reuse: the search filter model (`features/search/filters`), the EMI maths
 * (`features/tools/emi/math`), the API client and the auth store. Nothing
 * here is a copy.
 *
 * Booking a visit never happens from a tool call (see `scheduleVisit`).
 */
import { initAuth, useAuthStore } from '@/features/auth/store';
import { loginHref } from '@/features/auth/flows';
import { visitDayFromParam } from '@/features/property/visitDay';
import { parseFilters, toApiQuery, toSearchParams } from '@/features/search/filters';
import { summary } from '@/features/tools/emi/math';
import { api, call } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import { purposePrice } from '@/lib/format';
import { localeFromPath, localizePath, type Locale } from '@/lib/i18n/locale';

export type ToolError = { ok: false; error: { code: string; message: string; [k: string]: unknown } };
export type ToolResult = { ok: true; [k: string]: unknown } | ToolError;

const fail = (code: string, message: string, extra: Record<string, unknown> = {}): ToolError => ({ ok: false, error: { code, message, ...extra } });

const rec = (v: unknown): Record<string, unknown> => (typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {});

/** A number from a number or a numeric string. Anything else is undefined. */
function toNum(v: unknown): number | undefined {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() !== '' ? Number(v) : NaN;
  return Number.isFinite(n) ? n : undefined;
}

const site = () => ({
  origin: typeof location === 'undefined' ? 'https://360ghar.com' : location.origin,
  locale: (typeof location === 'undefined' ? 'en' : localeFromPath(location.pathname)) as Locale,
});

function apiFailure(error: unknown): ToolError {
  if (error instanceof ApiError) return fail('api_error', error.message, { status: error.status, retryable: error.retryable });
  return fail('api_error', 'The 360Ghar API could not be reached.', { retryable: true });
}

const PURPOSES = ['buy', 'rent', 'pg'];
const SEARCH_LIMIT = 10;

export async function searchProperties(input: unknown): Promise<ToolResult> {
  const i = rec(input);
  const sp = new URLSearchParams();
  if (typeof i.query === 'string' && i.query.trim()) sp.set('q', i.query.trim());
  if (typeof i.city === 'string' && i.city.trim()) sp.set('city', i.city.trim());
  if (i.purpose !== undefined) {
    if (typeof i.purpose !== 'string' || !PURPOSES.includes(i.purpose)) return fail('invalid_input', 'purpose must be one of: buy, rent, pg.');
    sp.set('purpose', i.purpose);
  }
  for (const [field, min] of [['price_max', 1], ['bedrooms_min', 0]] as const) {
    if (i[field] === undefined || i[field] === null) continue;
    const n = toNum(i[field]);
    if (n === undefined || n < min) return fail('invalid_input', `${field} must be a number of ${min} or more.`);
    sp.set(field, String(field === 'bedrooms_min' ? Math.floor(n) : n));
  }

  // parseFilters clamps every value to the API limits, so a bad input cannot cause a 422.
  const filters = parseFilters(sp);
  try {
    const page = await call(api.GET('/api/v1/properties', { params: { query: toApiQuery(filters, { limit: SEARCH_LIMIT, total: true }) } }));
    const { origin, locale } = site();
    const results = page.items.map((p) => ({
      id: p.id,
      title: p.title,
      purpose: p.purpose,
      property_type: p.property_type,
      price_inr: purposePrice(p),
      bedrooms: p.bedrooms ?? null,
      bathrooms: p.bathrooms ?? null,
      area_sqft: p.area_sqft ?? null,
      locality: p.locality ?? null,
      city: p.city ?? null,
      url: `${origin}${localizePath(`/property/${p.id}`, locale)}`,
    }));
    const query = toSearchParams(filters).toString();
    return {
      ok: true,
      total: page.total ?? null,
      count: results.length,
      results,
      search_url: `${origin}${localizePath('/properties', locale)}${query ? `?${query}` : ''}`,
    };
  } catch (error) {
    return apiFailure(error);
  }
}

const DAY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Today's date as YYYY-MM-DD in the browser's time zone. */
function todayLocal(now = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${p(now.getMonth() + 1)}-${p(now.getDate())}`;
}

function validDay(s: string): boolean {
  const m = DAY.exec(s);
  if (!m) return false;
  const d = new Date(Date.UTC(+m[1]!, +m[2]! - 1, +m[3]!));
  return d.getUTCFullYear() === +m[1]! && d.getUTCMonth() === +m[2]! - 1 && d.getUTCDate() === +m[3]!;
}

/**
 * Prepares a visit request. It does NOT book.
 *
 * The old site's tool did not book either: it only returned instructions.
 * Here it checks the input, checks that the user is signed in and that the
 * property exists and is available, then hands back the property page (with
 * `?visit_date=` when the day is one the form offers). The
 * booking form on that page needs the user to pick a time and press the
 * button, so the user always sees and confirms what is booked. Nothing is
 * sent to POST /visits from this file.
 */
export async function scheduleVisit(input: unknown): Promise<ToolResult> {
  const i = rec(input);
  const id = toNum(i.property_id);
  if (id === undefined || !Number.isInteger(id) || id < 1) return fail('invalid_input', 'property_id must be a positive whole number.');
  const day = typeof i.scheduled_date === 'string' ? i.scheduled_date.trim() : '';
  if (!validDay(day)) return fail('invalid_input', 'scheduled_date must be a real date in the format YYYY-MM-DD.');
  if (day < todayLocal()) return fail('invalid_input', 'scheduled_date must be today or a later day.');
  const notes = typeof i.special_requirements === 'string' ? i.special_requirements.trim().slice(0, 500) : '';

  const { origin, locale } = site();
  const path = localizePath(`/property/${id}`, locale);

  await initAuth().catch(() => undefined);
  if (useAuthStore.getState().status !== 'authed') {
    return fail('sign_in_required', 'The user must sign in to 360Ghar before a visit can be requested. Ask the user to sign in, then try again.', {
      sign_in_url: `${origin}${loginHref(locale, path)}`,
    });
  }

  try {
    const property = await call(api.GET('/api/v1/properties/{property_id}', { params: { path: { property_id: id } } }));
    if (!property.is_available) return fail('property_unavailable', 'This property is no longer available.', { property_id: id });
    // The page preselects the day only when it is inside the days its form offers (today and the next six).
    const prefilled = visitDayFromParam(day) !== null;
    return {
      ok: true,
      booked: false,
      status: 'user_confirmation_required',
      message: prefilled
        ? `No visit is booked yet. Ask the user to open the property page: ${day} is already selected. They pick a time and press "Request this visit".`
        : `No visit is booked yet. Ask the user to open the property page, pick a day and a time, and press "Request this visit". The wanted day ${day} is outside the days the form offers (today and the next 6 days).`,
      confirm_url: `${origin}${path}${prefilled ? `?visit_date=${encodeURIComponent(day)}` : ''}`,
      property: { id, title: property.title },
      requested_date: day,
      ...(notes ? { special_requirements: notes } : {}),
    };
  } catch (error) {
    if (error instanceof ApiError && error.kind === 'not_found') return fail('property_not_found', `No property with id ${id}.`, { property_id: id });
    return apiFailure(error);
  }
}

export async function calculateEmi(input: unknown): Promise<ToolResult> {
  const i = rec(input);
  const principal = toNum(i.principal);
  const rate = toNum(i.rate);
  const years = toNum(i.tenure_years);
  if (principal === undefined || principal <= 0 || principal > 1e11) return fail('invalid_input', 'principal must be a loan amount in INR, more than 0.');
  if (rate === undefined || rate < 0 || rate > 100) return fail('invalid_input', 'rate must be the yearly interest rate in percent, from 0 to 100.');
  if (years === undefined || years <= 0 || years > 50) return fail('invalid_input', 'tenure_years must be more than 0 and at most 50.');
  const s = summary(principal, rate, years);
  return {
    ok: true,
    currency: 'INR',
    emi: Math.round(s.emi),
    months: s.months,
    total_payment: Math.round(s.totalPayment),
    total_interest: Math.round(s.totalInterest),
  };
}
