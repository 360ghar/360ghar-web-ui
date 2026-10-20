import { describe, expect, it } from 'vitest';
import { activeCount, legacySearchRedirect, parseFilters, toApiQuery, toSearchParams } from './filters';

const p = (s: string) => parseFilters(new URLSearchParams(s));

describe('parseFilters', () => {
  it('reads canonical params', () => {
    const f = p('purpose=rent&property_type=apartment&property_type=villa&price_max=30000&bedrooms_min=2&sort_by=price_low');
    expect(f).toMatchObject({ purpose: 'rent', property_type: ['apartment', 'villa'], price_max: 30000, bedrooms_min: 2, sort_by: 'price_low' });
  });

  it('maps legacy aliases from the old site', () => {
    const f = p('intent=pg&type=flats&bhk=2&budget=under-20k&min_price=5000&latitude=28.4&longitude=77.0&radius_km=5&searchKeyword=golf');
    expect(f.purpose).toBe('rent');
    expect(f.property_type).toEqual(['apartment', 'pg']);
    expect(f.bedrooms_min).toBe(2);
    expect(f.bedrooms_max).toBe(2);
    expect(f.price_min).toBe(5000);
    expect(f.price_max).toBe(20000);
    expect(f).toMatchObject({ lat: 28.4, lng: 77, radius: 5, q: 'golf' });
  });

  it('treats 4+ BHK as open ended and commercial as three types', () => {
    expect(p('bhk=4').bedrooms_max).toBeUndefined();
    expect(p('type=commercial').property_type).toEqual(['office', 'shop', 'warehouse']);
  });

  it('clamps values to backend limits and drops junk', () => {
    const f = p('bathrooms_max=40&area_max=999999&floor_number_max=500&radius=0&lat=28&lng=77&guests=99&furnishing=luxury&sort_by=nope&check_in=tomorrow');
    expect(f.bathrooms_max).toBe(10);
    expect(f.area_max).toBe(100000);
    expect(f.floor_number_max).toBe(100);
    expect(f.radius).toBe(1);
    expect(f.guests).toBe(20);
    expect(f.furnishing).toEqual([]);
    expect(f.sort_by).toBeUndefined();
    expect(f.check_in).toBeUndefined();
  });

  it('reads every backend move_in value and drops any other', () => {
    for (const v of ['immediate', 'within_1_week', 'within_2_weeks', 'this_month', 'within_1_month', 'next_month', 'within_2_months', 'within_3_months', 'flexible']) expect(p(`move_in=${v}`).move_in).toBe(v);
    // Old flatmates names are not backend values: they are dropped, never read as a real value.
    for (const v of ['within_a_week', 'two_months', 'three_months', 'immediately']) expect(p(`move_in=${v}`).move_in).toBeUndefined();
  });

  it('maps old price sort names and ignores distance sort without a location', () => {
    expect(p('sort_by=price_asc').sort_by).toBe('price_low');
    expect(p('sort_by=distance').sort_by).toBeUndefined();
  });
});

describe('round trip', () => {
  it('writes canonical, stable URLs', () => {
    const f = p('bhk=2&intent=rent&type=apartments&place=Sector%2057&lat=28.42&lng=77.07');
    expect(toSearchParams(f).toString()).toBe('purpose=rent&property_type=apartment&place=Sector+57&lat=28.42&lng=77.07&radius=10&bedrooms_min=2&bedrooms_max=2');
    expect(parseFilters(toSearchParams(f))).toEqual(f);
  });

  it('never sends the place label to the API and defaults the sort', () => {
    const q = toApiQuery(p('place=Sector%2057&lat=28.42&lng=77.07'), { limit: 12, total: true }) as Record<string, unknown>;
    expect(q.place).toBeUndefined();
    expect(q.sort_by).toBe('distance');
    expect(q.include_total).toBe(true);
    expect((toApiQuery(p('')) as Record<string, unknown>).sort_by).toBe('newest');
  });

  it('sends only keys the properties route declares, from a spec that is checked at build time', async () => {
    const spec = JSON.parse(await (await import('node:fs/promises')).readFile('openapi/openapi.json', 'utf8')) as {
      paths: Record<string, { get: { parameters: { name: string }[] } }>;
    };
    const declared = new Set(spec.paths['/api/v1/properties']!.get.parameters.map((x) => x.name));
    const f = p(
      'purpose=rent&property_type=apartment&q=golf&place=Sector%2057&lat=28.42&lng=77.07&city=Gurugram&locality=DLF&pincode=122001&price_min=1&price_max=9&bedrooms_min=1&bedrooms_max=3&bathrooms_min=1&bathrooms_max=3&area_min=1&area_max=9&furnishing=furnished&amenities=Gym&features=lift&parking_spaces_min=1&floor_number_min=1&floor_number_max=9&age_max=5&has_lift=true&gender_preference=any&sharing_type=private_room&move_in=immediate&available_from=2026-11-01&check_in=2026-11-01&check_out=2026-11-03&guests=2&sort_by=newest',
    );
    const q = toApiQuery(f, { limit: 12, cursor: 'abc', total: true });
    for (const k of Object.keys(q)) expect(declared.has(k), k).toBe(true);
    expect(q).toMatchObject({ cursor: 'abc', include_total: true, limit: 12 });
  });

  it('drops empty lists and a lone stay date', () => {
    const q = toApiQuery(p('check_in=2026-11-01&purpose=rent')) as Record<string, unknown>;
    expect(q.property_type).toBeUndefined();
    expect(q.furnishing).toBeUndefined();
    expect(q.check_in).toBeUndefined();
    expect(q.check_out).toBeUndefined();
    expect(toApiQuery(p('check_in=2026-11-01&check_out=2026-11-03'))).toMatchObject({ check_in: '2026-11-01', check_out: '2026-11-03' });
  });

  it('counts active filters', () => {
    expect(activeCount(p(''))).toBe(0);
    expect(activeCount(p('purpose=buy&bhk=3&amenities=Gym&amenities=Parking'))).toBe(4);
  });
});

describe('legacySearchRedirect', () => {
  it('redirects old names and keeps tracking params', () => {
    const sp = new URLSearchParams('intent=rent&bhk=2&utm_source=wa');
    expect(legacySearchRedirect(sp, parseFilters(sp))).toBe('purpose=rent&bedrooms_min=2&bedrooms_max=2&utm_source=wa');
  });
  it('leaves canonical URLs alone', () => {
    const sp = new URLSearchParams('purpose=rent&utm_source=wa');
    expect(legacySearchRedirect(sp, parseFilters(sp))).toBeNull();
  });
});
