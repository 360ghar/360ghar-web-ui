import { api, attempt, call } from '@/lib/api/client';
import type { ListingPage } from '@/features/search/listingItem';
import type { ApiError } from '@/lib/api/errors';
import type { Amenity } from '@/lib/api/types';
import { fetchAmenities } from '@/lib/api/amenities';
import { memo } from '@/lib/memo';
import { toApiQuery, toSearchParams, type Filters } from './filters';
import { toAmenityOption, toListingItem, type AmenityOption } from './listingItem';

export async function loadAmenities(): Promise<Amenity[]> {
  try {
    return await memo('amenities', 6 * 3600_000, fetchAmenities);
  } catch {
    return [];
  }
}

export type FirstPage = { page: ListingPage | null; error: ApiError | null; amenities: AmenityOption[] };

/**
 * Page 1 for a listing, rendered on the server. Never throws. The homes and
 * amenities are cut to what the results island reads: they go into the HTML.
 */
export async function loadFirstPage(filters: Filters): Promise<FirstPage> {
  const [res, amenities] = await Promise.all([
    attempt(api.GET('/api/v1/properties', { params: { query: toApiQuery(filters, { limit: 12, total: true }) } })),
    loadAmenities(),
  ]);
  const page = res.data;
  return { page: page ? { ...page, items: page.items.map(toListingItem) } : null, error: res.error, amenities: amenities.map(toAmenityOption) };
}

/**
 * How many homes are listed in all (no filters), for the listing header.
 * Kept for 10 minutes per server instance; an unfiltered page 1 passes its own total.
 */
async function loadInventoryTotal(known?: number | null): Promise<number | null> {
  try {
    return await memo('inventory-total', 10 * 60_000, async () => {
      if (typeof known === 'number') return known;
      const d = await call(api.GET('/api/v1/properties', { params: { query: { limit: 1, include_total: true } } }));
      return d.total;
    });
  } catch {
    return null;
  }
}

/** Page 1 and the header total. A filtered search counts all homes in parallel; an unfiltered page 1 is that count. */
export async function loadListing(filters: Filters) {
  const unfiltered = toSearchParams(filters).toString() === '';
  const [first, all] = await Promise.all([loadFirstPage(filters), unfiltered ? null : loadInventoryTotal()]);
  return { first, inventory: unfiltered ? await loadInventoryTotal(first.page?.total) : all };
}
