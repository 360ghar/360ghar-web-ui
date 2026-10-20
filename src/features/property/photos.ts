import type { Property, PropertyImage } from '@/lib/api/types';
import { imageUrl, srcSet } from '@/lib/format';

/** Room groups for the viewer, in walk-through order. */
export const PHOTO_GROUPS = ['hall', 'room', 'kitchen', 'bathroom', 'balcony', 'terrace', 'entrance', 'exterior', 'others'] as const;
export type PhotoGroup = (typeof PHOTO_GROUPS)[number];

/**
 * The room group of a photo: its `image_category`, or for "others" a group
 * read from the caption ("Guest Bedroom", "Exterior Front" are filed as others).
 */
export function photoGroup(category: string | null | undefined, caption: string | null | undefined): PhotoGroup {
  const c = (category ?? '').toLowerCase();
  if (c === 'garden' || c === 'parking') return 'exterior';
  if (c && c !== 'others' && (PHOTO_GROUPS as readonly string[]).includes(c)) return c as PhotoGroup;
  const t = (caption ?? '').toLowerCase();
  if (/bed ?room/.test(t)) return 'room';
  if (/kitchen/.test(t)) return 'kitchen';
  if (/bath|toilet/.test(t)) return 'bathroom';
  if (/living|dining|hall/.test(t)) return 'hall';
  if (/balcon/.test(t)) return 'balcony';
  if (/terrace/.test(t)) return 'terrace';
  if (/entrance|foyer|door/.test(t)) return 'entrance';
  if (/exterior|facade|street|colony|building|view/.test(t)) return 'exterior';
  return 'others';
}

type GalleryPhoto = { url: string; caption: string | null; group: PhotoGroup };

/** What the gallery reads of a listing: a full `Property`, or a card that holds only the photo fields. */
type PhotoSource = Pick<Property, 'main_image_url'> & {
  images?: (Pick<PropertyImage, 'image_url' | 'image_category'> & Partial<Pick<PropertyImage, 'caption' | 'is_main_image' | 'display_order'>>)[] | null;
};

/**
 * Gallery photos: the main image first, then room by room (living, bedrooms,
 * kitchen...), in the owner's order within a room. No repeats, no 360° tour links.
 */
export function galleryPhotos(p: PhotoSource): GalleryPhoto[] {
  const rank = (g: PhotoGroup) => PHOTO_GROUPS.indexOf(g);
  const images = [...(p.images ?? [])]
    .map((i) => ({ url: i.image_url, caption: i.caption?.trim() || null, group: photoGroup(i.image_category, i.caption), main: Boolean(i.is_main_image), order: i.display_order ?? 99 }))
    .sort((a, b) => Number(b.main) - Number(a.main) || rank(a.group) - rank(b.group) || a.order - b.order);
  const hit = images.find((i) => i.url === p.main_image_url);
  const main = p.main_image_url ? [{ url: p.main_image_url, caption: hit?.caption ?? null, group: hit?.group ?? ('exterior' as PhotoGroup) }] : [];
  return [...main, ...images.map(({ url, caption, group }) => ({ url, caption, group }))].filter(
    (x, i, arr) => arr.findIndex((y) => y.url === x.url) === i && !/kuula\.co/.test(x.url),
  );
}

/** The floor plan image: `floor_plan_url`, else the first row of `floor_plans` (the API keeps floor plan rows out of `images`). */
export const floorPlanUrl = (p: Pick<Property, 'floor_plan_url' | 'floor_plans'>): string | null => p.floor_plan_url || p.floor_plans?.[0]?.image_url || null;

/**
 * Same widths and sizes as the gallery's main image and the listing cards, for <link rel="preload">.
 * The main photo is the first slide of the phone strip (86% wide) and half the mosaic from 768 px.
 */
export const GALLERY_SIZES = '(min-width: 768px) 50vw, 86vw';
export const GALLERY_WIDTHS = [480, 768, 1024, 1440];
export const CARD_SIZES = '(min-width: 1280px) 22rem, (min-width: 768px) 45vw, 92vw';

export const galleryPreload = (url: string) => ({ src: imageUrl(url, 1024)!, srcset: srcSet(url, GALLERY_WIDTHS), sizes: GALLERY_SIZES });
export const cardPreload = (url: string) => ({ src: imageUrl(url, 640)!, srcset: srcSet(url, [320, 480, 640, 960]), sizes: CARD_SIZES });
