import type { Property } from '@/lib/api/types';
import { canonicalFor } from '@/lib/seo/site';
import type { Locale } from '@/lib/i18n/locale';

/** ItemList JSON-LD for a page of listings. */
export function listingItemList(name: string, items: Pick<Property, 'id' | 'title'>[], locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: items.length,
    itemListElement: items.slice(0, 12).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: canonicalFor(`/property/${p.id}`, locale),
      name: p.title,
    })),
  };
}
