import { api, attempt } from '@/lib/api/client';
import type { ApiError } from '@/lib/api/errors';
import { isPlaceholderPrice } from '@/features/search/prices';
import type { Property, PropertyDetail } from '@/lib/api/types';

/** `peers`: homes of the same type for sale in the same locality, for the price context. */
type PropertyData = { property: PropertyDetail | null; error: ApiError | null; similar: Property[]; peers: Property[] };

/** Loads one property, a few similar homes and its locality peers. Never throws. */
export async function loadProperty(id: number): Promise<PropertyData> {
  const res = await attempt(api.GET('/api/v1/properties/{property_id}', { params: { path: { property_id: id } } }));
  const property = res.data;
  if (!property) return { property: null, error: res.error, similar: [], peers: [] };
  // A stand-in price says nothing about the home, so similar homes are not matched on it.
  // base_price is the sale price: rent and short-stay homes are priced by monthly_rent / nightly_rate, so no range for them.
  const price = property.purpose !== 'buy' || isPlaceholderPrice(property) ? null : property.base_price;
  const [sim, peers] = await Promise.all([
    attempt(
      api.GET('/api/v1/properties', {
        params: {
          query: {
            limit: 5,
            purpose: property.purpose,
            property_type: [property.property_type],
            ...(property.city ? { city: property.city } : {}),
            ...(price ? { price_min: Math.round(price * 0.7), price_max: Math.round(price * 1.3) } : {}),
            sort_by: 'newest',
          },
        },
      }),
    ),
    property.purpose === 'buy' && property.locality
      ? attempt(api.GET('/api/v1/properties', { params: { query: { limit: 50, purpose: 'buy', property_type: [property.property_type], locality: property.locality } } }))
      : Promise.resolve(null),
  ]);
  const similar = (sim.data?.items ?? []).filter((p) => p.id !== id).slice(0, 4);
  return { property, error: null, similar, peers: peers?.data?.items ?? [] };
}

/**
 * Dev only, so states no live listing shows can be seen and tested:
 * `?_tour=https://...` puts a 360° tour on a listing (no live listing has one yet,
 * docs/backend-gaps.md), `?_unavailable=1` marks it as no longer available.
 * Production builds drop this code (import.meta.env.DEV is false).
 */
export function withDevTour<T extends Property>(p: T | null, url: URL): T | null {
  if (!import.meta.env.DEV || !p) return p;
  const tour = url.searchParams.get('_tour');
  const out = tour && /^https:\/\//.test(tour) ? { ...p, virtual_tour_url: tour } : p;
  return url.searchParams.get('_unavailable') === '1' ? { ...out, is_available: false } : out;
}
