import { describe, expect, it } from 'vitest';
import type { Property } from '@/lib/api/types';
import { partial } from '@/lib/api/testing';
import { propertyMeta } from './seo';

const base = partial<Property>({ id: 1, title: 'Sunny flat', property_type: 'apartment', purpose: 'buy', bedrooms: 3, base_price: 18_648_000, area_sqft: 1850 });

describe('property meta', () => {
  it('uses the locality, then the city, and never invents a city', () => {
    expect(propertyMeta({ ...base, locality: 'Palam Vihar', city: 'Gurugram' } as Property, 'en').title).toContain('in Palam Vihar');
    expect(propertyMeta({ ...base, city: 'Noida' } as Property, 'en').title).toContain('in Noida');
    expect(propertyMeta(base, 'en').title).not.toContain(' in ');
  });

  it('names a tour only when the listing has one', () => {
    expect(propertyMeta(base, 'en').description).not.toContain('360°');
    expect(propertyMeta({ ...base, virtual_tour_url: 'https://x.test/t' } as Property, 'en').description).toContain('A 360° tour is available.');
  });

  it('cuts a long description at a word, with an ellipsis', () => {
    const description = 'A practical park-facing home in New Gurgaon with good light, efficient planning and a quiet lane that most buyers in this sector ask for first, close to the metro.';
    const d = propertyMeta({ ...base, description } as Property, 'en').description;
    expect(d).toBe('A practical park-facing home in New Gurgaon with good light, efficient planning and a quiet lane that most buyers in this sector ask for first, close… 1,850 sq ft.');
    expect(d).not.toMatch(/\w\.\s1,850/);
    expect(propertyMeta({ ...base, description: 'Short and done.' } as Property, 'en').description).toBe('Short and done. 1,850 sq ft.');
  });

  it('never says verified and labels short stays', () => {
    const m = propertyMeta({ ...base, purpose: 'short_stay' } as Property, 'en');
    expect(m.title).toContain('Short Stay');
    expect(m.description.toLowerCase()).not.toContain('verified');
    expect(propertyMeta(base, 'hi').description).not.toContain('वेरिफाइड');
  });
});
