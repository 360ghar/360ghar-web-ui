import { describe, expect, it, vi } from 'vitest';
import type { Property } from '@/lib/api/types';

vi.mock('@/features/feeds/data', () => ({ allProperties: async () => [] }));

const { ALL_LOCALITIES, isThinLocality, landmarksFor, resolveLocality } = await import('./data');
const { bestPhoto, homesIn, listedPlaces, summarize } = await import('./live');
const { placeScene } = await import('./vignette');

let id = 0;
const home = (p: Partial<Property>) => ({ id: (id += 1), city: 'Gurugram', purpose: 'buy', property_type: 'apartment', base_price: 1e7, created_at: `2026-01-${10 + id}`, ...p }) as Property;
const place = (slug: string) => resolveLocality(slug)!.locality;

describe('homesIn', () => {
  const homes = [
    home({ locality: 'Sector 8' }),
    home({ locality: 'Sector 85' }),
    home({ locality: 'Sector 84', sub_locality: 'Sector 8' }),
    home({ locality: 'Palam Vihar', title: 'Ansal Plaza view', full_address: 'Block C, near Ansal Plaza, Gurugram' }),
  ];

  it('matches a sector exactly, not by substring', () => {
    expect(homesIn(place('sector-8-gurgaon'), homes).map((h) => h.locality)).toEqual(['Sector 84', 'Sector 8']);
  });

  it('ignores "near X" parts of the address for projects', () => {
    const found = homesIn(place('ansal-plaza-gurgaon'), homes);
    // The title names it; the "near Ansal Plaza" address part alone would not.
    expect(found).toHaveLength(1);
    expect(homesIn(place('ansal-plaza-gurgaon'), [home({ locality: 'Palam Vihar', title: 'Flat', full_address: 'near Ansal Plaza' })])).toHaveLength(0);
  });

  it('keeps homes of other cities out', () => {
    expect(homesIn(place('sector-8-gurgaon'), [home({ locality: 'Sector 8', city: 'Noida' })])).toHaveLength(0);
  });
});

describe('summarize', () => {
  it('counts by purpose and gives the middle half of real prices', () => {
    const s = summarize([
      home({ purpose: 'buy', base_price: 9e6, area_sqft: 1200 }),
      home({ purpose: 'buy', base_price: 1.2e7, area_sqft: 1400 }),
      home({ purpose: 'buy', base_price: 1.5e7, area_sqft: 1500 }),
      home({ purpose: 'buy', base_price: 2e7, area_sqft: 1800 }),
      // Placeholder: exactly ₹10 Cr on 1,560 sq ft (₹64,103 per sq ft). Counted, not priced.
      home({ purpose: 'buy', base_price: 1e8, area_sqft: 1560 }),
      home({ purpose: 'rent', base_price: 1, monthly_rent: 30000 }),
      home({ purpose: 'short_stay', base_price: 1, daily_rate: 2200 }),
    ]);
    expect(s.total).toBe(7);
    expect(s.buy).toEqual({ n: 5, min: 9e6, lo: 1.125e7, hi: 1.625e7 });
    // Fewer than 3 prices: only the lowest.
    expect(s.rent).toEqual({ n: 1, min: 30000, lo: null, hi: null });
    expect(s.stay?.min).toBe(2200);
  });

  it('keeps a real ₹10 Cr home (large area) in the prices, and prices nothing when every price is a stand-in', () => {
    const big = summarize([home({ base_price: 1e8, area_sqft: 4850 }), home({ base_price: 9e7, area_sqft: 4000 }), home({ base_price: 8e7, area_sqft: 3900 })]);
    expect(big.buy?.hi).toBeGreaterThan(8.9e7);
    expect(summarize([home({ base_price: 1e8, area_sqft: 1560 })]).buy).toEqual({ n: 1, min: null, lo: null, hi: null });
  });
});

describe('bestPhoto', () => {
  const img = (caption: string, image_category: string, url: string) => ({ caption, image_category, image_url: url }) as never;
  it('prefers the building and the view, and never repeats a photo', () => {
    const a = home({ main_image_url: 'door.jpg', images: [img('Building Exterior', 'exterior', 'door.jpg'), img('Exterior Front', 'others', 'front.jpg'), img('Kitchen', 'kitchen', 'k.jpg')] });
    const b = home({ main_image_url: 'door2.jpg', images: [img('Exterior Front', 'others', 'front.jpg'), img('Street View', 'exterior', 'view.jpg')] });
    const used = new Set<string>();
    expect(bestPhoto([a], used)).toBe('front.jpg');
    expect(bestPhoto([b], used)).toBe('view.jpg');
    expect(bestPhoto([home({ main_image_url: null, images: [] })], used)).toBeNull();
  });
});

describe('listedPlaces', () => {
  it('groups homes under their locality, most homes first, each with its own photo', () => {
    const a = home({ locality: 'Palam Vihar', main_image_url: 'a.jpg' });
    const b = home({ locality: 'Palam Vihar', main_image_url: 'b.jpg' });
    const c = home({ locality: 'Sector 85', main_image_url: 'a.jpg' });
    const out = listedPlaces([a, b, c], 'gurgaon', new Set(['b.jpg']));
    expect(out.map((x) => [x.locality.slug, x.homes.length])).toEqual([
      ['palam-vihar', 2],
      ['sector-85', 1],
    ]);
    expect(out[0]!.photo).toBe('a.jpg');
    // a.jpg is taken, so Sector 85 has no photo left rather than a repeat.
    expect(out[1]!.photo).toBeNull();
  });
});

describe('listedPlaces and thin localities', () => {
  it('never lists a scraped or seed-invented place, even when a home names it', () => {
    const homes = ALL_LOCALITIES.filter(isThinLocality).map((l) => home({ locality: l.name, city: l.city }));
    expect(homes.length).toBe(1172);
    expect(listedPlaces(homes, 'gurgaon')).toEqual([]);
  });
});

describe('landmarksFor', () => {
  it('finds landmarks stored under "{slug}-{city}" keys', () => {
    expect(landmarksFor(place('mg-road-gurgaon')).length).toBeGreaterThan(0);
    expect(landmarksFor(place('dwarka-delhi')).length).toBeGreaterThan(0);
    expect(landmarksFor(place('sector-56-gurgaon')).length).toBeGreaterThan(0);
  });
});

describe('placeScene', () => {
  it('is the same for the same seed and differs between seeds', () => {
    const a = JSON.stringify(placeScene('sector', 'sector-56'));
    expect(JSON.stringify(placeScene('sector', 'sector-56'))).toBe(a);
    expect(JSON.stringify(placeScene('sector', 'sector-57'))).not.toBe(a);
  });

  it('draws every kind', () => {
    for (const k of ['sector', 'society', 'project', 'township', 'locality', 'road', 'village', 'city', 'office', 'industrial', 'metro', 'hospital', 'mall', 'directory'] as const) {
      expect(placeScene(k, 'x').layers.length).toBeGreaterThan(4);
    }
  });
});
