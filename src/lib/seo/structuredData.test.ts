import { describe, expect, it } from 'vitest';
import { generateLocalityStructuredData } from './structuredData';

describe('Place structured data', () => {
  const base = { name: 'Sector 1', city: 'Gurugram', slug: 'sector-1' };

  it('includes geo when latitude and longitude are zero', () => {
    expect(generateLocalityStructuredData({ ...base, lat: 0, lng: 0 })).toHaveProperty('geo', expect.objectContaining({ latitude: 0, longitude: 0 }));
    expect(generateLocalityStructuredData({ ...base, lat: 0, lng: 77.05 })).toHaveProperty('geo.latitude', 0);
  });

  it('omits geo when a coordinate is missing', () => {
    expect(generateLocalityStructuredData({ ...base, lat: 28.4 })).not.toHaveProperty('geo');
  });
});
