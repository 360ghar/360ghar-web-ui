import { describe, expect, it } from 'vitest';
import { listingDetails, parseListing, parseStaged } from './ai';

describe('owner AI replies', () => {
  it('needs both a title and a description, and keeps the photo flags it knows', () => {
    const flags = [{ code: 'blurry', photo: 1, note: 'Photo 2 is blurred.' }, { code: 'few_photos', photo: null, note: 'Add more.' }, { code: 'made_up', photo: 0, note: 'x' }];
    expect(parseListing({ title: ' 3 BHK in Sector 57 ', description: 'Bright home.', rooms: [], flags })).toEqual({
      title: '3 BHK in Sector 57',
      description: 'Bright home.',
      flags: [{ code: 'blurry', photo: 1, note: 'Photo 2 is blurred.' }, { code: 'few_photos', photo: null, note: 'Add more.' }],
    });
    expect(parseListing({ title: 'x' })).toBeNull();
    expect(parseListing(null)).toBeNull();
  });
  it('takes the staged image only as a JPEG data URL marked staged', () => {
    expect(parseStaged({ image: 'data:image/jpeg;base64,AAAA', staged: true, watermark: 'Virtually staged' })).toBe('data:image/jpeg;base64,AAAA');
    expect(parseStaged({ image: 'data:image/jpeg;base64,AAAA' })).toBeNull();
    expect(parseStaged({ image: 'https://x/y.jpg', staged: true })).toBeNull();
    expect(parseStaged({})).toBeNull();
  });
  it('sends only the hints the backend accepts', () => {
    expect(
      listingDetails({ city: 'Gurugram', bedrooms: '3', bathrooms: '', balconies: 2, locality: undefined, property_type: 'builder_floor', purpose: 'rent', furnishing_level: 'semi_furnished', area_sqft: '1200', floor_number: 2 }),
    ).toEqual({ city: 'Gurugram', bedrooms: 3, property_type: 'builder_floor', purpose: 'rent', furnishing: 'semi_furnished', area_sqft: 1200 });
    expect(listingDetails({ property_type: 'castle', bedrooms: 99, area_sqft: 0 })).toEqual({});
  });
});
