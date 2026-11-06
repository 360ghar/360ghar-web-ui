/**
 * Title and description of the property page. Only claims the listing data
 * backs: a tour is named only when the listing has one, and nothing says
 * "verified" (no such field, docs/backend-gaps.md R12).
 */
import type { Property } from '@/lib/api/types';
import { areaSqft, homeKind } from '@/lib/format';
import type { Locale } from '@/lib/i18n/locale';
import { headlinePrice, tidy } from './facts';

const PURPOSE: Record<Property['purpose'], [string, string]> = {
  buy: ['for Sale', 'बिक्री के लिए'],
  rent: ['for Rent', 'किराये के लिए'],
  short_stay: ['Short Stay', 'कम समय का ठहराव'],
};

export function propertyMeta(p: Property, locale: Locale) {
  const hi = locale === 'hi';
  const heading = homeKind(p, locale);
  const where = p.locality ?? p.city;
  // A listing with no real price names its area instead of "Price on request" (on request implies an area).
  const price = headlinePrice(p, locale);
  const second = price.onRequest ? areaSqft(p.area_sqft, locale)! : price.amount;
  // Many listings share type, locality, price and description text, so the listing ID keeps each title and description unique.
  const id = `ID ${p.id}`;
  const title = [`${heading} ${PURPOSE[p.purpose][hi ? 1 : 0]}${where ? (hi ? `, ${where}` : ` in ${where}`) : ''}`, second, id, '360Ghar'].join(' | ');
  const lead = clip(tidy(p.description ?? p.title).replace(/\s+/g, ' ').trim(), 150);
  const tour = p.virtual_tour_url ? (hi ? ' 360° वर्चुअल टूर उपलब्ध है।' : ' A 360° tour is available.') : '';
  const area = p.area_sqft ? ` ${areaSqft(p.area_sqft, locale)}.` : '';
  const listing = hi ? ` लिस्टिंग ID ${p.id}।` : ` Listing ID ${p.id}.`;
  return { title, description: `${lead}${/[.।!?…]$/.test(lead) ? '' : hi ? '।' : '.'}${tour}${area}${listing}` };
}

/** Cut at the last word boundary before `max` and end with "…", so no word is cut in half. */
function clip(text: string, max: number): string {
  if (text.length <= max) return text;
  const space = text.lastIndexOf(' ', max);
  return `${text.slice(0, space > max / 2 ? space : max).replace(/[\s,;:.—–-]+$/, '')}…`;
}
