import { describe, expect, it } from 'vitest';
import type { PropertyImage } from '@/lib/api/types';
import { cardPhotos, cardPlace } from './PropertyCardView';
import { floorPlanUrl, galleryPhotos } from './photos';

const img = (image_url: string, image_category: NonNullable<PropertyImage['image_category']>, display_order = 1) => ({ image_url, image_category, display_order, is_main_image: false, id: 1, property_id: 1, caption: null });

describe('card photos', () => {
  it('puts the main photo first, then one room of each kind, and skips bathrooms and entrances', () => {
    const p = {
      main_image_url: 'main.jpg',
      images: [
        img('main.jpg', 'exterior'),
        img('bath.jpg', 'bathroom'),
        img('door.jpg', 'entrance'),
        img('dining.jpg', 'hall', 2),
        img('living.jpg', 'hall', 1),
        img('bed.jpg', 'room'),
        img('balcony.jpg', 'balcony'),
        img('kitchen.jpg', 'kitchen'),
        img('other.jpg', 'others'),
      ],
    };
    expect(cardPhotos(p)).toEqual(['main.jpg', 'living.jpg', 'bed.jpg', 'kitchen.jpg']);
  });

  it('fills up with a second photo of a kind, and works without a main photo or images', () => {
    expect(cardPhotos({ main_image_url: 'm.jpg', images: [img('a.jpg', 'hall', 1), img('b.jpg', 'hall', 2)] })).toEqual(['m.jpg', 'a.jpg', 'b.jpg']);
    expect(cardPhotos({ main_image_url: 'm.jpg', images: null })).toEqual(['m.jpg']);
    expect(cardPhotos({ main_image_url: null, images: [] })).toEqual([]);
  });

  it('writes the place with the locality first', () => {
    expect(cardPlace({ locality: 'Palam Vihar', sub_locality: 'Block C, Palam Vihar', city: 'Gurugram' })).toBe('Palam Vihar, Block C');
    expect(cardPlace({ locality: null, sub_locality: null, city: 'Gurugram' })).toBe('Gurugram');
  });
});

describe('gallery and floor plan', () => {
  it('reads a card that holds only the photo fields, with no cast to a full listing', () => {
    const card = { main_image_url: 'm.jpg', images: [{ image_url: 'b.jpg', image_category: 'room' as const, display_order: 2 }, { image_url: 'a.jpg', image_category: 'hall' as const, display_order: 1 }] };
    expect(galleryPhotos(card).map((x) => x.url)).toEqual(['m.jpg', 'a.jpg', 'b.jpg']);
  });

  it('takes the floor plan from floor_plan_url, else the first floor_plans row', () => {
    const row = img('plan-row.jpg', 'others');
    expect(floorPlanUrl({ floor_plan_url: 'plan.jpg', floor_plans: [row] })).toBe('plan.jpg');
    expect(floorPlanUrl({ floor_plan_url: null, floor_plans: [row] })).toBe('plan-row.jpg');
    expect(floorPlanUrl({ floor_plan_url: '', floor_plans: [] })).toBeNull();
    expect(floorPlanUrl({ floor_plan_url: null, floor_plans: null })).toBeNull();
  });
});
