/** Amenities grouped by the backend's `category`, in a fixed order; no category goes last as "More". */
import type { Locale } from '@/lib/i18n/locale';

type Amenity = { id: number; title: string; icon?: string | null; category?: string | null };

const NAMES: Record<string, [string, string]> = {
  safety: ['Safety', 'सुरक्षा'],
  convenience: ['Convenience', 'सुविधाएँ'],
  services: ['Services', 'सेवाएँ'],
  utilities: ['Utilities', 'उपयोगिताएँ'],
  recreation: ['Recreation', 'मनोरंजन'],
  accessibility: ['Accessibility', 'पहुँच'],
};
const ORDER = Object.keys(NAMES);

const words = (s: string) => s.replaceAll('_', ' ').replace(/^./, (c) => c.toUpperCase());
const rank = (k: string) => (k === '' ? 99 : ORDER.includes(k) ? ORDER.indexOf(k) : 50);

export function amenityGroups<T extends Amenity>(amenities: readonly T[], locale: Locale): { name: string; items: T[] }[] {
  const hi = locale === 'hi';
  const groups = new Map<string, T[]>();
  for (const a of amenities) groups.set(a.category ?? '', [...(groups.get(a.category ?? '') ?? []), a]);
  return [...groups]
    .sort(([a], [b]) => rank(a) - rank(b))
    .map(([k, items]) => ({ name: k === '' ? (hi ? 'अन्य' : 'More') : (NAMES[k]?.[hi ? 1 : 0] ?? words(k)), items }));
}
