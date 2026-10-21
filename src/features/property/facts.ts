/**
 * Facts and costs for the property page, from backend fields only.
 * Missing fields drop out; nothing is guessed.
 */
import { isPlaceholderPrice, PRICE_ON_REQUEST } from '@/features/search/prices';
import type { Property } from '@/lib/api/types';
import { areaSqft, formatNum, listingPrice } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { FACT_ICONS } from '@/ui/icons/amenities';
import type { IconName } from '@/ui/icons/paths';

export type Fact = { icon: IconName; label: string; value: string };
/** `amount` null: the listing has a stand-in price, shown as "Price on request". */
export type Cost = { key: string; label: string; amount: number | null; note?: string };

/** The headline price, or "Price on request" for a stand-in ₹10 Cr price (docs/backend-gaps.md, D8). */
export function headlinePrice(p: Property, locale: Locale = 'en') {
  return isPlaceholderPrice(p) ? { amount: PRICE_ON_REQUEST[locale], period: '', onRequest: true } : { ...listingPrice(p, locale), onRequest: false };
}

const FURNISH: Record<string, [string, string]> = {
  furnished: ['Furnished', 'फ़र्निश्ड'],
  semi_furnished: ['Semi-furnished', 'सेमी-फ़र्निश्ड'],
  unfurnished: ['Unfurnished', 'अनफ़र्निश्ड'],
};

const FACING: Record<string, [string, string]> = {
  park: ['Park', 'पार्क'],
  road: ['Road', 'सड़क'],
  pool: ['Pool', 'पूल'],
  garden: ['Garden', 'बगीचा'],
  east: ['East', 'पूर्व'],
  west: ['West', 'पश्चिम'],
  north: ['North', 'उत्तर'],
  south: ['South', 'दक्षिण'],
  'north-east': ['North-east', 'उत्तर-पूर्व'],
  'north-west': ['North-west', 'उत्तर-पश्चिम'],
  'south-east': ['South-east', 'दक्षिण-पूर्व'],
  'south-west': ['South-west', 'दक्षिण-पश्चिम'],
};

/**
 * What the home faces, from owner tags such as "park-facing". `features` is a
 * list of strings with no `facing` value (docs/backend-gaps.md, D12), so tags are
 * the only source. Unknown values are left out.
 */
export function facing(tags: readonly string[] | null | undefined, locale: Locale = 'en'): string | null {
  for (const tag of tags ?? []) {
    const m = /^([a-z-]+?)-facing$/.exec(tag.trim().toLowerCase());
    const hit = m ? FACING[m[1]!] : undefined;
    if (hit) return hit[locale === 'hi' ? 1 : 0];
  }
  return null;
}

export function floorLabel(floor: number | null | undefined, total: number | null | undefined, locale: Locale = 'en'): string | null {
  if (floor == null) return null;
  const hi = locale === 'hi';
  const f = floor === 0 ? (hi ? 'ग्राउंड' : 'Ground') : String(floor);
  if (!total) return f;
  return hi ? `${total} में से ${f}` : `${f} of ${total}`;
}

/** Display text from the backend with the em dashes of the seed data turned into commas. */
export const tidy = (s: string) => s.replace(/\s+[—–]\s+/g, ', ');

const AREA_TYPE_HI: Record<string, string> = { carpet: 'कारपेट', 'built-up': 'बिल्ट-अप', 'super built-up': 'सुपर बिल्ट-अप', plot: 'प्लॉट' };

/** The backend's area type ("Built-up Area") in the page's language: short ("built-up") or full ("Built-up Area"). */
export function areaTypeLabel(type: string | null | undefined, locale: Locale = 'en', full = false): string {
  const hi = locale === 'hi';
  const key = (type ?? '').toLowerCase().replace('area', '').trim();
  if (!key) return full ? (hi ? 'एरिया' : 'Area') : hi ? 'एरिया' : 'area';
  if (hi) return `${AREA_TYPE_HI[key] ?? key}${full ? ' एरिया' : ''}`;
  return full ? (type ?? '').trim() : key;
}

/** Headline numbers: bedrooms, bathrooms, area. */
export function mainFacts(p: Property, locale: Locale = 'en') {
  const hi = locale === 'hi';
  return [
    p.bedrooms ? { value: String(p.bedrooms), label: hi ? 'बेडरूम' : p.bedrooms === 1 ? 'Bedroom' : 'Bedrooms' } : null,
    p.bathrooms ? { value: String(p.bathrooms), label: hi ? 'बाथरूम' : p.bathrooms === 1 ? 'Bathroom' : 'Bathrooms' } : null,
    p.area_sqft
      ? { value: formatNum(p.area_sqft, locale), label: `${hi ? 'वर्ग फ़ुट' : 'sq ft'} ${areaTypeLabel(p.area_type, locale)}` }
      : null,
  ].filter((x): x is { value: string; label: string } => x !== null);
}

/** The scannable strip under the headline numbers. */
export function keyFacts(p: Property, locale: Locale = 'en'): Fact[] {
  const hi = locale === 'hi';
  const stay = p.purpose === 'short_stay';
  const out: (Fact | null)[] = [
    floorLabel(p.floor_number, p.total_floors, locale) ? { icon: FACT_ICONS.floor, label: hi ? 'फ़्लोर' : 'Floor', value: floorLabel(p.floor_number, p.total_floors, locale)! } : null,
    facing(p.tags, locale) ? { icon: FACT_ICONS.facing, label: hi ? 'सामने' : 'Facing', value: facing(p.tags, locale)! } : null,
    p.furnishing_level ? { icon: FACT_ICONS.furnishing, label: hi ? 'फ़र्निशिंग' : 'Furnishing', value: FURNISH[p.furnishing_level]?.[hi ? 1 : 0] ?? p.furnishing_level } : null,
    p.age_of_property != null ? { icon: FACT_ICONS.age, label: hi ? 'प्रॉपर्टी की उम्र' : 'Age', value: p.age_of_property === 0 ? (hi ? 'नई' : 'New') : `${p.age_of_property} ${hi ? 'साल' : p.age_of_property === 1 ? 'year' : 'years'}` } : null,
    p.parking_spaces ? { icon: FACT_ICONS.parking, label: hi ? 'पार्किंग' : 'Parking', value: String(p.parking_spaces) } : null,
    p.balconies ? { icon: FACT_ICONS.balcony, label: hi ? 'बालकनी' : p.balconies === 1 ? 'Balcony' : 'Balconies', value: String(p.balconies) } : null,
    stay && p.max_occupancy ? { icon: FACT_ICONS.guests, label: hi ? 'अधिकतम मेहमान' : 'Guests', value: String(p.max_occupancy) } : null,
    stay && p.minimum_stay_days && p.minimum_stay_days > 1
      ? { icon: FACT_ICONS.minimumStay, label: hi ? 'कम से कम ठहराव' : 'Minimum stay', value: `${p.minimum_stay_days} ${hi ? 'रात' : 'nights'}` }
      : null,
    !stay && p.purpose === 'rent' && p.minimum_stay_days && p.minimum_stay_days >= 30
      ? { icon: FACT_ICONS.minimumStay, label: hi ? 'कम से कम अवधि' : 'Minimum lease', value: `${Math.round(p.minimum_stay_days / 30)} ${hi ? 'महीने' : 'months'}` }
      : null,
  ];
  return out.filter((f): f is Fact => f !== null);
}

/**
 * Price per sq ft of a sale listing. The backend computes it from the sale price and
 * `area_sqft` (null without an area), so every client shows one number. The stand-in price has none.
 */
export function perSqft(p: Pick<Property, 'purpose' | 'base_price' | 'area_sqft' | 'price_per_sqft'>): number | null {
  if (p.purpose !== 'buy' || isPlaceholderPrice(p)) return null;
  return p.price_per_sqft ? Math.round(p.price_per_sqft) : null;
}

/** Monthly and one-time costs, plus the move-in total for rentals. */
export function costs(p: Property, locale: Locale = 'en') {
  const hi = locale === 'hi';
  // The price field depends on the purpose: rent is monthly_rent, a short stay is daily_rate. base_price is not either of them.
  const rent = p.purpose === 'rent' ? (p.monthly_rent ?? null) : null;
  const night = p.purpose === 'short_stay' ? (p.daily_rate ?? null) : null;
  const deposit = p.security_deposit ?? null;
  const months = rent && deposit && deposit % rent === 0 ? deposit / rent : null;
  const sqft = perSqft(p);

  const rows: Cost[] = [];
  if (p.purpose === 'buy') {
    const ask = isPlaceholderPrice(p);
    rows.push({ key: 'price', label: hi ? 'कीमत' : 'Price', amount: ask ? null : p.base_price });
    if (sqft || ask) rows.push({ key: 'sqft', label: hi ? 'प्रति वर्ग फ़ुट' : 'Per sq ft', amount: ask ? null : sqft!, note: areaSqft(p.area_sqft, locale) ?? undefined });
  }
  if (rent) rows.push({ key: 'rent', label: hi ? 'मासिक किराया' : 'Monthly rent', amount: rent });
  if (night) rows.push({ key: 'night', label: hi ? 'प्रति रात' : 'Per night', amount: night });
  if (p.maintenance_charges && p.purpose !== 'short_stay') rows.push({ key: 'maintenance', label: hi ? 'मेंटेनेंस, हर महीने' : 'Maintenance, each month', amount: p.maintenance_charges });
  if (deposit)
    rows.push({
      key: 'deposit',
      label: hi ? 'सिक्योरिटी डिपॉज़िट' : 'Security deposit',
      amount: deposit,
      note: months ? (hi ? `${months} महीने का किराया, लौटाया जाता है` : `${months} ${months === 1 ? "month's" : "months'"} rent, refundable`) : hi ? 'लौटाया जाता है' : 'Refundable',
    });
  if (p.setup_cost) rows.push({ key: 'setup', label: hi ? 'सेटअप खर्च' : 'Setup cost', amount: p.setup_cost });
  if (p.other_charges) rows.push({ key: 'other', label: p.other_charges_description || (hi ? 'अन्य शुल्क' : 'Other charges'), amount: p.other_charges });

  // What a tenant pays before the keys: first month, deposit and setup.
  const moveIn = rent
    ? [
        { key: 'rent', label: hi ? 'पहले महीने का किराया' : "First month's rent", amount: rent },
        ...(p.maintenance_charges ? [{ key: 'maintenance', label: hi ? 'पहले महीने का मेंटेनेंस' : "First month's maintenance", amount: p.maintenance_charges }] : []),
        ...(deposit ? [{ key: 'deposit', label: hi ? 'डिपॉज़िट' : 'Deposit', amount: deposit }] : []),
        ...(p.setup_cost ? [{ key: 'setup', label: hi ? 'सेटअप' : 'Setup', amount: p.setup_cost }] : []),
      ]
    : [];
  const moveInTotal = moveIn.length > 1 ? moveIn.reduce((s, x) => s + x.amount, 0) : null;
  return { rows, moveIn: moveInTotal ? moveIn : [], moveInTotal };
}
