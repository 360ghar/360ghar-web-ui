import { describe, expect, it } from 'vitest';
import { amenityGroups } from './amenityGroups';

const a = (id: number, title: string, category?: string | null) => ({ id, title, category });

describe('amenity groups', () => {
  it('orders the groups and keeps the items in order', () => {
    const g = amenityGroups([a(1, 'Gym', 'recreation'), a(2, 'Guard', 'safety'), a(3, 'Lift', 'convenience'), a(4, 'CCTV', 'safety')], 'en');
    expect(g.map((x) => x.name)).toEqual(['Safety', 'Convenience', 'Recreation']);
    expect(g[0]!.items.map((x) => x.title)).toEqual(['Guard', 'CCTV']);
  });

  it('puts no category last as "More" and words an unknown category', () => {
    const g = amenityGroups([a(1, 'Pet area', null), a(2, 'Solar', 'green_energy'), a(3, 'Guard', 'safety')], 'en');
    expect(g.map((x) => x.name)).toEqual(['Safety', 'Green energy', 'More']);
  });

  it('names groups in Hindi', () => {
    expect(amenityGroups([a(1, 'x', 'safety'), a(2, 'y')], 'hi').map((x) => x.name)).toEqual(['सुरक्षा', 'अन्य']);
  });
});
