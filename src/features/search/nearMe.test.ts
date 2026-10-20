import { describe, expect, it } from 'vitest';
import { locationCopy } from '@/features/location/copy';
import { FALLBACK_CENTER } from '@/features/location/logic';
import { emptyFilters, parseFilters, toApiQuery, toSearchParams, withNearMe } from './filters';

const base = { ...emptyFilters(), purpose: 'rent' as const, bedrooms_min: 2, price_max: 40000 };

describe('withNearMe', () => {
  it('keeps the v1 start for a real fix: 5 km, sorted by distance, label as given', () => {
    const f = withNearMe(base, { lat: 28.4089, lng: 77.0418 }, 'Near me');
    expect(f).toMatchObject({ lat: 28.4089, lng: 77.0418, radius: 5, place: 'Near me', sort_by: 'distance' });
  });

  it('uses the fallback centre with an honest label and a wider start', () => {
    const label = locationCopy('en').approxPlace;
    const f = withNearMe(base, FALLBACK_CENTER, label, true);
    expect(f).toMatchObject({ lat: 28.4595, lng: 77.0266, radius: 10, place: 'Central Gurugram (approximate)', sort_by: 'distance' });
    expect(f.place).not.toMatch(/near me/i);
    expect(locationCopy('hi').approxPlace).toContain('अंदाज़न');
  });

  it('keeps a radius the person already chose, and every other filter', () => {
    const f = withNearMe({ ...base, radius: 20 }, FALLBACK_CENTER, 'x', true);
    expect(f.radius).toBe(20);
    expect(f).toMatchObject({ purpose: 'rent', bedrooms_min: 2, price_max: 40000 });
  });

  it('survives the URL: lat, lng, radius and place come back the same', () => {
    const f = withNearMe(base, FALLBACK_CENTER, locationCopy('en').approxPlace, true);
    const url = toSearchParams(f);
    expect(url.get('lat')).toBe('28.4595');
    expect(url.get('place')).toBe('Central Gurugram (approximate)');
    expect(parseFilters(url)).toMatchObject({ lat: 28.4595, lng: 77.0266, radius: 10, place: 'Central Gurugram (approximate)' });
  });

  it('sends lat, lng and radius to the API but never the label', () => {
    const q = toApiQuery(withNearMe(base, { lat: 28.4089, lng: 77.0418 }, 'Near me')) as Record<string, unknown>;
    expect(q).toMatchObject({ lat: 28.4089, lng: 77.0418, radius: 5, sort_by: 'distance', bedrooms_min: 2 });
    expect('place' in q).toBe(false);
  });
});
