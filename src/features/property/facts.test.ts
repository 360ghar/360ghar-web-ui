import { describe, expect, it } from 'vitest';
import { partial } from '@/lib/api/testing';
import type { Property, PropertyImage } from '@/lib/api/types';
import { areaTypeLabel, costs, facing, floorLabel, headlinePrice, keyFacts, perSqft, tidy } from './facts';
import { distanceKm, localityLandmarks, localityPath, nearestHubs } from './nearby';

const base = partial<Property>({ id: 1, title: 't', property_type: 'apartment', purpose: 'buy', base_price: 18_648_000, area_sqft: 1850, price_per_sqft: 10080 });

describe('property facts', () => {
  it('reads facing from tags and ignores unknown values', () => {
    expect(facing(['vastu-compliant', 'park-facing'])).toBe('Park');
    expect(facing(['road-facing'], 'hi')).toBe('सड़क');
    expect(facing(['north-east-facing'])).toBe('North-east');
    expect(facing(['sea-facing'])).toBeNull();
    expect(facing(null)).toBeNull();
  });

  it('labels floors', () => {
    expect(floorLabel(2, 4)).toBe('2 of 4');
    expect(floorLabel(0, 4)).toBe('Ground of 4');
    expect(floorLabel(12, 20, 'hi')).toBe('20 में से 12');
    expect(floorLabel(null, 4)).toBeNull();
  });

  it('keeps only facts the listing has', () => {
    const f = keyFacts({ ...base, floor_number: 2, total_floors: 4, tags: ['park-facing'], age_of_property: 12, parking_spaces: 0, balconies: 1 } as Property);
    expect(f.map((x) => `${x.label}: ${x.value}`)).toEqual(['Floor: 2 of 4', 'Facing: Park', 'Age: 12 years', 'Balcony: 1']);
  });

  it('computes price per sq ft from the price shown', () => {
    // The backend computes it; the client shows that number and does not divide itself.
    expect(perSqft({ ...base, price_per_sqft: 10080.4 })).toBe(10080);
    expect(perSqft({ ...base, base_price: 100_000_000, area_sqft: 3000, price_per_sqft: 33333.33 })).toBe(33333);
    expect(perSqft({ ...base, price_per_sqft: null })).toBeNull();
    expect(perSqft({ ...base, purpose: 'rent', price_per_sqft: 40 })).toBeNull();
  });

  it('adds up the move-in cost of a rental', () => {
    const c = costs({ ...base, purpose: 'rent', monthly_rent: 74_250, security_deposit: 148_500, maintenance_charges: 4200 } as Property);
    expect(c.rows.find((r) => r.key === 'deposit')?.note).toBe("2 months' rent, refundable");
    expect(c.moveInTotal).toBe(74_250 + 4200 + 148_500);
    expect(costs(base).moveInTotal).toBeNull();
  });

  it('shows "Price on request" for the ₹10 Cr stand-in price', () => {
    const stand = { ...base, base_price: 100_000_000, area_sqft: 1375 } as Property;
    expect(headlinePrice(stand)).toEqual({ amount: 'Price on request', period: '', onRequest: true });
    expect(headlinePrice(stand, 'hi').amount).toBe('कीमत पूछने पर');
    expect(headlinePrice(base)).toMatchObject({ amount: '₹1.86 Cr', onRequest: false });
    expect(perSqft(stand)).toBeNull();
    expect(costs(stand).rows.filter((r) => r.key === 'price' || r.key === 'sqft').map((r) => r.amount)).toEqual([null, null]);
  });

  it('tidies seed-data dashes', () => {
    expect(tidy('Godrej Nest — 2BHK Apartment')).toBe('Godrej Nest, 2BHK Apartment');
  });
});

describe('nearby', () => {
  it('measures straight-line distance', () => {
    // Cyber City to Millennium City Centre Metro is about 7 km.
    expect(Math.round(distanceKm({ lat: 28.4947, lng: 77.0887 }, { lat: 28.4595, lng: 77.0266 }))).toBe(7);
  });

  it('lists the nearest hubs first, and none outside Gurugram', () => {
    const hubs = nearestHubs(28.5112, 77.0469, 3);
    expect(hubs).toHaveLength(3);
    expect(hubs[0]!.km).toBeLessThanOrEqual(hubs[1]!.km);
    expect(nearestHubs(19.07, 72.87)).toEqual([]);
    expect(nearestHubs(null, 77)).toEqual([]);
  });

  it('finds locality landmarks and pages', () => {
    expect(localityLandmarks('Palam Vihar').length).toBeGreaterThan(0);
    expect(localityLandmarks('Sector 85')).toEqual([]);
    expect(localityPath('Palam Vihar', 'Gurugram')).toBe('/locality/palam-vihar-gurgaon');
    expect(localityPath('Palam Vihar', 'Mumbai')).toBeNull();
  });
});

describe('photo groups', async () => {
  const { galleryPhotos, photoGroup } = await import('./photos');
  it('files "others" by caption', () => {
    expect(photoGroup('others', 'Guest Bedroom')).toBe('room');
    expect(photoGroup('others', 'Exterior Front')).toBe('exterior');
    expect(photoGroup('hall', 'Dining Room')).toBe('hall');
    expect(photoGroup(null, 'Aurelia Master Reference Grid')).toBe('others');
  });

  it('puts the main photo first, then room by room', () => {
    const img = (url: string, image_category: NonNullable<PropertyImage['image_category']>, display_order: number, is_main_image = false) =>
      partial<PropertyImage>({ image_url: url, caption: url, image_category, display_order, is_main_image });
    const p = partial<Property>({ main_image_url: 'ext', images: [img('bath', 'bathroom', 1), img('ext', 'exterior', 2, true), img('bed', 'room', 3), img('liv', 'hall', 4), img('kuula.co/x', 'hall', 5)] });
    expect(galleryPhotos(p).map((x) => x.url)).toEqual(['ext', 'liv', 'bed', 'bath']);
  });
});

describe('area type label', () => {
  it('translates the backend area type for Hindi pages', () => {
    expect(areaTypeLabel('Built-up Area', 'en')).toBe('built-up');
    expect(areaTypeLabel('Built-up Area', 'en', true)).toBe('Built-up Area');
    expect(areaTypeLabel('Built-up Area', 'hi')).toBe('बिल्ट-अप');
    expect(areaTypeLabel('Super Built-up Area', 'hi', true)).toBe('सुपर बिल्ट-अप एरिया');
    expect(areaTypeLabel(null, 'hi', true)).toBe('एरिया');
    expect(areaTypeLabel(null, 'en')).toBe('area');
  });
});
