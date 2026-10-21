import { describe, expect, it } from 'vitest';
import type { ListingItem as Property } from './listingItem';
import { partial } from '@/lib/api/testing';
import { groupHomes, layoutMap, niceScale, TAG_H } from './mapLayout';

const home = (id: number, locality: string, lat: number, lng: number, base_price = 1e7) => partial<Property>({ id, locality, latitude: lat, longitude: lng, base_price, purpose: 'buy' });
const price = (p: Property) => p.base_price;

describe('paper map', () => {
  const homes = [
    home(1, 'Palam Vihar', 28.51, 77.04, 2e7),
    home(2, 'Palam Vihar', 28.512, 77.045, 1.4e7),
    home(3, 'Sector 85', 28.4, 76.95),
    home(4, 'Sector 84', 28.402, 76.99),
    home(5, 'Sector 43', 28.46, 77.08),
    { ...home(6, 'Nowhere', 0, 0), latitude: null },
  ];

  it('groups homes with a location by locality and keeps the lowest price', () => {
    const g = groupHomes(homes, price);
    expect(g.map((x) => x.name).sort()).toEqual(['Palam Vihar', 'Sector 43', 'Sector 84', 'Sector 85']);
    expect(g.find((x) => x.name === 'Palam Vihar')!.min).toBe(1.4e7);
  });

  it('keeps north up and east right, inside the padded box', () => {
    const { blocks } = layoutMap(groupHomes(homes, price), 800, 500, { top: 60, right: 20, bottom: 50, left: 20 });
    const c = (n: string) => blocks.find((b) => b.group.name === n)!.dots[0]!;
    expect(c('Palam Vihar')[1]).toBeLessThan(c('Sector 85')[1]); // north is higher
    expect(c('Sector 43')[0]).toBeGreaterThan(c('Sector 85')[0]); // east is to the right
    for (const b of blocks) for (const [x, y] of b.dots) {
      expect(x).toBeGreaterThanOrEqual(20);
      expect(x).toBeLessThanOrEqual(780);
      expect(y).toBeGreaterThanOrEqual(60);
      expect(y).toBeLessThanOrEqual(450);
    }
  });

  it('merges tags that would overlap on a narrow box, and keeps them apart on a wide one', () => {
    const narrow = layoutMap(groupHomes(homes, price), 320, 360, { top: 60, right: 20, bottom: 50, left: 20 });
    const wide = layoutMap(groupHomes(homes, price), 1400, 900, { top: 60, right: 20, bottom: 50, left: 20 });
    expect(narrow.tags.length).toBeLessThan(wide.tags.length);
    expect(narrow.tags.flatMap((t) => t.groups).length).toBe(4);
    for (const t of narrow.tags) {
      expect(t.x - t.w / 2).toBeGreaterThanOrEqual(0);
      expect(t.x + t.w / 2).toBeLessThanOrEqual(320);
      expect(t.y - TAG_H).toBeGreaterThanOrEqual(0);
    }
  });

  it('picks a round scale bar that fits', () => {
    expect(niceScale(40, 100)).toEqual({ km: 2, px: 80 });
    expect(niceScale(0, 100)).toBeNull();
  });
});
