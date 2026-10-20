import { loadHome } from '@/features/home/load';
import { galleryPhotos, type PhotoGroup } from '@/features/property/photos';
import { isPlaceholderPrice } from '@/features/search/prices';
import { toListingItem, type ListingItem } from '@/features/search/listingItem';
import { api, attempt } from '@/lib/api/client';
import type { Property } from '@/lib/api/types';
import type { Locale } from '@/lib/i18n/locale';

/** Rooms of the doorway, in the order you walk in. */
// The living room opens: "entrance" photos are often filed wrongly (a bathroom tagged as the entrance).
const WALK: PhotoGroup[] = ['hall', 'room', 'kitchen', 'balcony', 'bathroom'];
export type Room = { group: PhotoGroup; url: string };

/** One photo per room, in walk order. */
export function roomsOf(p: Property): Room[] {
  const photos = galleryPhotos(p);
  return WALK.flatMap((group) => {
    const hit = photos.find((ph) => ph.group === group);
    return hit ? [{ group, url: hit.url }] : [];
  });
}

/**
 * Home data plus what the lab heroes need: up to 100 homes with a location
 * (the sector map) and the homes with the most rooms photographed (the doorway).
 * Never throws: a failed call gives empty lists, and the page falls back to the diorama.
 */
export async function loadLab(locale: Locale) {
  const [home, list] = await Promise.all([
    loadHome(locale),
    attempt(api.GET('/api/v1/properties', { params: { query: { limit: 100, include_total: true, sort_by: 'newest' } } })),
  ]);
  const all = list.data?.items ?? [];
  const byRooms = all
    .map((p) => ({ p, rooms: roomsOf(p) }))
    .filter((x) => x.rooms.length >= 4 && !isPlaceholderPrice(x.p))
    // Homes for sale first (most of the listings), then the most rooms photographed.
    .sort((a, b) => Number(b.p.purpose === 'buy') - Number(a.p.purpose === 'buy') || b.rooms.length - a.rooms.length);
  const mapped: ListingItem[] = all.map(toListingItem).filter((p) => typeof p.latitude === 'number' && typeof p.longitude === 'number');
  return { ...home, door: byRooms[0] ?? null, walks: byRooms.slice(1, 4), mapped };
}

export type LabData = Awaited<ReturnType<typeof loadLab>>;
