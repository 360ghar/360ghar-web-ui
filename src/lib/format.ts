/**
 * Formatting for prices, areas and property labels. Indian number style:
 * lakh (L) and crore (Cr) for sale prices, full rupees for rent.
 */
import type { Locale } from '@/lib/i18n/locale';
import type { Property, PropertyType } from '@/lib/api/types';

/** The Intl locale tag for a site locale. */
export const intlLocale = (locale: Locale): 'hi-IN' | 'en-IN' => (locale === 'hi' ? 'hi-IN' : 'en-IN');

const nfCache = new Map<string, Intl.NumberFormat>();
const dfCache = new Map<string, Intl.DateTimeFormat>();

/** Number in Indian digit grouping. Formatters are cached per locale and options. */
export function formatNum(n: number, locale: Locale = 'en', opts?: Intl.NumberFormatOptions): string {
  const key = `${locale}${opts ? JSON.stringify(opts) : ''}`;
  let f = nfCache.get(key);
  if (!f) nfCache.set(key, (f = new Intl.NumberFormat(intlLocale(locale), opts)));
  return f.format(n);
}

/** A date from a Date, an ISO string or a timestamp. Formatters are cached per locale and options. */
export function formatDate(d: Date | string | number, locale: Locale = 'en', opts?: Intl.DateTimeFormatOptions): string {
  const key = `${locale}${opts ? JSON.stringify(opts) : ''}`;
  let f = dfCache.get(key);
  if (!f) dfCache.set(key, (f = new Intl.DateTimeFormat(intlLocale(locale), opts)));
  return f.format(typeof d === 'object' ? d : new Date(d));
}

/**
 * A calendar date from the API (`YYYY-MM-DD`, for example `available_from`). It has no time, so it is
 * shown as that day in every time zone; `formatDate` would move it a day back west of UTC.
 */
export const formatDateOnly = (iso: string, locale: Locale = 'en', opts?: Intl.DateTimeFormatOptions): string =>
  formatDate(iso, locale, { ...opts, timeZone: 'UTC' });

const WHOLE = { maximumFractionDigits: 0 };
const inr = (n: number, locale: Locale) => formatNum(n, locale, WHOLE);

/** Parses what a person types: "12,50,000" -> 1250000. Empty or invalid -> null. */
export function parseNumber(raw: string): number | null {
  const clean = raw.replace(/[,\s₹%]/g, '');
  if (clean === '' || clean === '.' || clean === '-') return null;
  const n = Number(clean);
  return Number.isFinite(n) ? n : null;
}

/** 8500000 -> "₹85 L", 12500000 -> "₹1.25 Cr", 45000 -> "₹45,000". */
export function compactPrice(value: number, locale: Locale = 'en'): string {
  const cr = locale === 'hi' ? 'करोड़' : 'Cr';
  const l = locale === 'hi' ? 'लाख' : 'L';
  if (value >= 1e7) return `₹${trim(value / 1e7)} ${cr}`;
  if (value >= 1e5) return `₹${trim(value / 1e5)} ${l}`;
  return `₹${inr(value, locale)}`;
}

function trim(n: number): string {
  return n.toFixed(n >= 100 ? 0 : 2).replace(/\.?0+$/, '');
}

export function rupees(value: number, locale: Locale = 'en'): string {
  return `₹${inr(value, locale)}`;
}

type Priced = { purpose: string; base_price: number; monthly_rent?: number | null; daily_rate?: number | null };

/**
 * The price a buyer or tenant pays. The price field depends on the purpose: buy is
 * `base_price`, rent is `monthly_rent`, short stay is `daily_rate`. `base_price` is not a rent or a
 * nightly rate, so it is never a stand-in for them. Null when the field for the purpose is empty.
 */
export const purposePrice = (p: Priced): number | null =>
  p.purpose === 'rent' ? (p.monthly_rent ?? null) : p.purpose === 'short_stay' ? (p.daily_rate ?? null) : p.base_price;

/** `purposePrice`, or 0 when empty. Callers that sort or sum drop the zeros. */
export const askPrice = (p: Priced): number => purposePrice(p) ?? 0;

const PRICE_ON_REQUEST_LABEL = { en: 'Price on request', hi: 'कीमत पूछने पर' } as const;

/** The headline price for a listing, with its period. A rent or a short stay without its price reads "Price on request". */
export function listingPrice(p: Priced, locale: Locale = 'en') {
  const perMonth = locale === 'hi' ? '/माह' : '/month';
  const perDay = locale === 'hi' ? '/दिन' : '/night';
  const v = purposePrice(p);
  if (p.purpose === 'rent' || p.purpose === 'short_stay') {
    if (v === null) return { amount: PRICE_ON_REQUEST_LABEL[locale], period: '' };
    return { amount: rupees(v, locale), period: p.purpose === 'rent' ? perMonth : perDay };
  }
  return { amount: compactPrice(p.base_price, locale), period: '' };
}

export function areaSqft(value: number | null | undefined, locale: Locale = 'en'): string | null {
  if (!value) return null;
  return `${inr(value, locale)} ${locale === 'hi' ? 'वर्ग फ़ुट' : 'sq ft'}`;
}

const TYPE_LABEL: Record<PropertyType, [string, string]> = {
  house: ['Independent house', 'स्वतंत्र मकान'],
  apartment: ['Apartment', 'अपार्टमेंट'],
  builder_floor: ['Builder floor', 'बिल्डर फ़्लोर'],
  room: ['Room', 'कमरा'],
  villa: ['Villa', 'विला'],
  plot: ['Plot', 'प्लॉट'],
  condo: ['Condo', 'कॉन्डो'],
  penthouse: ['Penthouse', 'पेंटहाउस'],
  studio: ['Studio', 'स्टूडियो'],
  loft: ['Loft', 'लॉफ़्ट'],
  pg: ['PG', 'पीजी'],
  flatmate: ['Flatmate', 'फ़्लैटमेट'],
  office: ['Office', 'ऑफ़िस'],
  shop: ['Shop', 'दुकान'],
  warehouse: ['Warehouse', 'गोदाम'],
};

export function typeLabel(t: PropertyType, locale: Locale = 'en'): string {
  return TYPE_LABEL[t]?.[locale === 'hi' ? 1 : 0] ?? t;
}

export function bhkLabel(bedrooms: number | null | undefined, type: PropertyType): string | null {
  if (!bedrooms || ['plot', 'office', 'shop', 'warehouse', 'pg', 'room', 'flatmate'].includes(type)) return null;
  return `${bedrooms} BHK`;
}

/** The place line for a card: locality, city. */
export function placeLine(p: Pick<Property, 'locality' | 'sub_locality' | 'city'>): string {
  return [p.sub_locality || p.locality, p.city].filter(Boolean).join(', ');
}

/** Cloudinary delivery URL with width, format and quality set. Other hosts pass through. */
export function imageUrl(url: string | null | undefined, width: number): string | undefined {
  if (!url) return undefined;
  if (!url.includes('res.cloudinary.com') || !url.includes('/upload/')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,c_limit,w_${width}/`);
}

export function srcSet(url: string | null | undefined, widths: number[]): string | undefined {
  if (!url || !url.includes('res.cloudinary.com')) return undefined;
  return widths.map((w) => `${imageUrl(url, w)} ${w}w`).join(', ');
}

/** "3 BHK Apartment": the BHK and type words of a listing on one line. */
export const homeKind = (p: Pick<Property, 'bedrooms' | 'property_type'>, locale: Locale = 'en') =>
  [bhkLabel(p.bedrooms, p.property_type), typeLabel(p.property_type, locale)].filter(Boolean).join(' ');
