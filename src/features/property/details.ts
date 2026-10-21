/**
 * The short "More details" list. Type, purpose, area type and floor are
 * already in the headline and key facts, so they are not repeated here.
 * Backend enums become words; empty fields drop out.
 */
import type { Property } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n/locale';

const KITCHEN: Record<string, [string, string]> = {
  vegetarian: ['Vegetarian', 'शाकाहारी'],
  non_vegetarian: ['Non-vegetarian', 'मांसाहारी'],
  eggetarian: ['Eggetarian', 'अंडाहारी'],
  any: ['No restriction', 'कोई पाबंदी नहीं'],
};

const VENTILATION: Record<string, [string, string]> = {
  good: ['Good', 'अच्छी'],
  average: ['Average', 'ठीक-ठाक'],
  poor: ['Poor', 'कमज़ोर'],
};

/** `snake_case` to "Snake case" for values with no label of their own. */
const words = (s: string) => {
  const t = s.replaceAll('_', ' ').trim();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const pick = (map: Record<string, [string, string]>, v: string, locale: Locale) => map[v]?.[locale === 'hi' ? 1 : 0] ?? words(v);

export function detailRows(p: Property, locale: Locale, dates: { availableFrom: string | null; updated: string | null }): [string, string | number][] {
  const hi = locale === 'hi';
  const rows: [string, string | number | null | undefined][] = [
    [hi ? 'स्थिति' : 'Status', p.is_available ? null : hi ? 'उपलब्ध नहीं' : 'Not available'],
    [hi ? 'कब से उपलब्ध' : 'Available from', dates.availableFrom],
    [hi ? 'बिल्डर' : 'Builder', p.builder_name],
    [hi ? 'रसोई के नियम' : 'Kitchen rules', p.kitchen_type ? pick(KITCHEN, p.kitchen_type, locale) : null],
    [hi ? 'हवा आना-जाना' : 'Ventilation', p.ventilation_type ? pick(VENTILATION, p.ventilation_type, locale) : null],
    [hi ? 'खिड़कियाँ' : 'Windows', p.windows_count],
    [hi ? 'अधिकतम लोग' : 'Max occupancy', p.purpose === 'short_stay' ? null : p.max_occupancy],
    [hi ? 'अपडेट' : 'Updated', dates.updated],
    [hi ? 'लिस्टिंग आईडी' : 'Listing ID', `#${p.id}`],
  ];
  return rows.filter(([, v]) => v !== null && v !== undefined && v !== '') as [string, string | number][];
}
