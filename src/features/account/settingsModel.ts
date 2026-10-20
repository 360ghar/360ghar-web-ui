/**
 * Pure helpers and strings for the account Notifications, Preferences and
 * Saved alerts tabs. No React here, so the unit tests stay small.
 */
import { parseNumber } from '@/lib/format';
import type { components } from '@/lib/api/schema';

type S = components['schemas'];
export type Prefs = S['UserPreferences'];
export type PrefsPatch = S['UserPreferencesPatch'];
export type Alert = S['AuctionAlertResponse'];

/** The form holds text only. Empty text means "no preference". */
export type PrefValues = {
  purpose: string;
  property_type: string[];
  budget_min: string;
  budget_max: string;
  bedrooms_min: string;
  bedrooms_max: string;
  area_min: string;
  area_max: string;
  location_preference: string;
  max_distance_km: string;
};

const str = (n: number | null | undefined) => (n == null ? '' : String(n));

export function prefsToValues(p: Prefs | null | undefined): PrefValues {
  return {
    purpose: p?.purpose ?? '',
    property_type: p?.property_type ?? [],
    budget_min: str(p?.budget_min),
    budget_max: str(p?.budget_max),
    bedrooms_min: str(p?.bedrooms_min),
    bedrooms_max: str(p?.bedrooms_max),
    area_min: str(p?.area_min),
    area_max: str(p?.area_max),
    location_preference: (p?.location_preference ?? []).join(', '),
    max_distance_km: str(p?.max_distance_km),
  };
}

/**
 * Builds the PUT body. Every key is sent: the backend removes a key sent as
 * null, so a cleared field clears the stored value.
 */
export function valuesToPatch(v: PrefValues): PrefsPatch {
  const places = v.location_preference
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return {
    purpose: (v.purpose || null) as PrefsPatch['purpose'],
    property_type: v.property_type.length ? (v.property_type as PrefsPatch['property_type']) : null,
    budget_min: parseNumber(v.budget_min),
    budget_max: parseNumber(v.budget_max),
    bedrooms_min: parseNumber(v.bedrooms_min),
    bedrooms_max: parseNumber(v.bedrooms_max),
    area_min: parseNumber(v.area_min),
    area_max: parseNumber(v.area_max),
    location_preference: places.length ? places : null,
    max_distance_km: parseNumber(v.max_distance_km),
  };
}

/** A short line that says what an alert watches: "HDFC Bank · Gurugram · Plot". */
export function alertParts(a: Alert, type: (v: string) => string, money: (n: number) => string, any: string, keyword: string): { title: string; detail: string } {
  const title = [a.bank_name, a.city, a.property_type ? type(a.property_type) : null].filter(Boolean).join(' · ') || any;
  const price =
    a.min_price != null && a.max_price != null
      ? `${money(a.min_price)} – ${money(a.max_price)}`
      : a.min_price != null
        ? `≥ ${money(a.min_price)}`
        : a.max_price != null
          ? `≤ ${money(a.max_price)}`
          : '';
  return { title, detail: [a.keyword ? `${keyword}: ${a.keyword}` : '', price].filter(Boolean).join(' · ') };
}

export const NOTIFICATION_KEYS = ['push_notifications', 'email_notifications', 'sms_notifications', 'promotional_emails'] as const;
