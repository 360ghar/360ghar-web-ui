import { describe, expect, it } from 'vitest';
import { cardPhotos } from '@/features/property/PropertyCardView';
import { partial } from '@/lib/api/testing';
import type { Amenity, Property, PropertyImage } from '@/lib/api/types';
import { toAmenityOption, toListingItem } from './listingItem';

const img = (image_url: string, image_category: NonNullable<PropertyImage['image_category']>, display_order: number): PropertyImage => ({
  image_url,
  image_category,
  display_order,
  is_main_image: false,
  id: display_order,
  property_id: 1,
  caption: 'Room',
});

const home = partial<Property>({
  id: 182,
  title: '3BHK builder floor in Palam Vihar',
  description: 'A long text the card never shows.',
  property_type: 'builder_floor',
  purpose: 'buy',
  base_price: 18_648_000,
  monthly_rent: null,
  daily_rate: null,
  price_per_sqft: 10_080,
  bedrooms: 3,
  bathrooms: 3,
  area_sqft: 1850,
  furnishing_level: 'semi_furnished',
  locality: 'Palam Vihar',
  sub_locality: 'Block C',
  city: 'Gurugram',
  latitude: 28.5112,
  longitude: 77.0469,
  distance_km: null,
  main_image_url: 'main.jpg',
  virtual_tour_url: null,
  liked: true,
  owner_name: 'Not for the page',
  images: [
    img('main.jpg', 'exterior', 1),
    img('bath.jpg', 'bathroom', 2),
    img('dining.jpg', 'hall', 4),
    img('living.jpg', 'hall', 3),
    img('bed2.jpg', 'room', 6),
    img('bed1.jpg', 'room', 5),
    img('door.jpg', 'entrance', 7),
    img('tour.jpg', 'others', 8),
  ],
});

describe('listing item for the results island', () => {
  const item = toListingItem(home);

  it('keeps only the strip photos, with their url and room, and the same strip as the full home', () => {
    expect(item.images).toEqual([
      { image_url: 'living.jpg', image_category: 'hall' },
      { image_url: 'bed1.jpg', image_category: 'room' },
      { image_url: 'dining.jpg', image_category: 'hall' },
    ]);
    expect(cardPhotos(item)).toEqual(cardPhotos(home));
  });

  it('keeps the photo count of the full home and the fields the card, map and buttons read', () => {
    expect(item.photo_count).toBe(8);
    expect(item).toMatchObject({ id: 182, purpose: 'buy', base_price: 18_648_000, area_sqft: 1850, latitude: 28.5112, longitude: 77.0469, liked: true, furnishing_level: 'semi_furnished' });
    expect(item).not.toHaveProperty('description');
    expect(item).not.toHaveProperty('owner_name');
  });

  it('works for a home with no photos', () => {
    const bare = toListingItem({ ...home, main_image_url: null, images: null } as Property);
    expect(bare.images).toEqual([]);
    expect(bare.photo_count).toBe(0);
  });

  it('cuts an amenity to its id and name', () => {
    expect(toAmenityOption({ id: 4, title: 'Lift', icon: 'lift', category: 'building', is_active: true } as Amenity)).toEqual({ id: 4, title: 'Lift' });
  });
});
