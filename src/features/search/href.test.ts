import { describe, expect, it } from 'vitest';
import { searchHref } from './href';
import type { AreaSuggestion, AreaType } from './areaSearch';

const area = (name: string, filter: AreaSuggestion['filter'], type: AreaType = 'sector'): AreaSuggestion => ({
  name,
  type,
  label: '',
  secondary: '',
  filter,
  source: 'local',
});

const parsed = (href: string) => new URL(href, 'https://360ghar.com');

describe('searchHref', () => {
  it('sends a sector to the exact locality filter', () => {
    const url = parsed(searchHref('en', 'rent', 'sector 56', null, area('Sector 56', 'locality')));
    expect(url.pathname).toBe('/properties');
    expect(url.searchParams.get('purpose')).toBe('rent');
    expect(url.searchParams.get('locality')).toBe('Sector 56');
    expect(url.searchParams.get('q')).toBeNull();
  });

  it('sends a road to the keyword filter', () => {
    const url = parsed(searchHref('en', 'buy', 'golf', null, area('Golf Course Road', 'q', 'road')));
    expect(url.searchParams.get('q')).toBe('Golf Course Road');
    expect(url.searchParams.get('locality')).toBeNull();
    expect(url.searchParams.get('purpose')).toBe('buy');
  });

  it('lets a picked Google place win over a local area', () => {
    const url = parsed(searchHref('en', 'rent', 'sector 56', { lat: 28.4595, lng: 77.0266, name: 'Cyber Hub' }, area('Sector 56', 'locality')));
    expect(url.searchParams.get('lat')).toBe('28.45950');
    expect(url.searchParams.get('lng')).toBe('77.02660');
    expect(url.searchParams.get('radius')).toBe('10');
    expect(url.searchParams.get('place')).toBe('Cyber Hub');
    expect(url.searchParams.get('sort_by')).toBe('distance');
    expect(url.searchParams.get('q')).toBeNull();
    expect(url.searchParams.get('locality')).toBeNull();
  });

  it('trims plain text into q', () => {
    const url = parsed(searchHref('en', 'rent', ' 2 bhk near metro '));
    expect(url.searchParams.get('q')).toBe('2 bhk near metro');
  });

  it('keeps the PG mapping and the Hindi path', () => {
    const url = parsed(searchHref('hi', 'pg', '', null));
    expect(url.pathname).toBe('/hi/properties');
    expect(url.searchParams.get('purpose')).toBe('rent');
    expect(url.searchParams.get('property_type')).toBe('pg');
  });
});
