import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import type { Place } from '@/lib/maps';
import type { AreaSuggestion } from './areaSearch';

export type Purpose = 'rent' | 'buy' | 'pg';

/**
 * Builds the listing URL for a search. PG is rent with property_type=pg.
 * A picked Google place wins over a local area, and a local area wins over
 * the typed text.
 */
export function searchHref(locale: Locale, purpose: Purpose, text: string, place: Place | null = null, area: AreaSuggestion | null = null): string {
  const q = new URLSearchParams();
  q.set('purpose', purpose === 'pg' ? 'rent' : purpose);
  if (purpose === 'pg') q.set('property_type', 'pg');
  if (place) {
    q.set('lat', place.lat.toFixed(5));
    q.set('lng', place.lng.toFixed(5));
    q.set('radius', '10');
    q.set('place', place.name);
    q.set('sort_by', 'distance');
  } else if (area) {
    // Sectors, localities and phases use the exact locality field; the rest are a keyword.
    q.set(area.filter, area.name);
  } else if (text.trim()) {
    q.set('q', text.trim());
  }
  return `${localizePath('/properties', locale)}?${q}`;
}
