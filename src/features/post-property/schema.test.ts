import { describe, expect, it } from 'vitest';
import { PRICE_MAX, formSchema, makeFormSchema, suggestTitle, toCard, toPayload, toUpdatePayload } from './schema';

const base = {
  purpose: 'rent',
  property_type: 'apartment',
  full_address: 'Tower 4, Signature Global, Sector 85',
  city: 'Gurugram',
  locality: 'Sector 85',
  title: '2 BHK Apartment for rent in Sector 85',
  owner_name: 'Asha Rao',
  owner_phone: '9810467231',
  monthly_rent: '32000',
  bedrooms: '2',
  terms: true,
} as const;

describe('post property schema', () => {
  it('builds a backend payload for a rental', () => {
    const r = formSchema.safeParse(base);
    expect(r.success).toBe(true);
    const p = toPayload(r.data!);
    expect(p).toMatchObject({ purpose: 'rent', base_price: 32000, monthly_rent: 32000, owner_contact: '+919810467231', bedrooms: 2 });
    expect(p.daily_rate).toBeUndefined();
  });

  it('needs rent for rent listings (backend rule)', () => {
    const r = formSchema.safeParse({ ...base, monthly_rent: '' });
    expect(r.success).toBe(false);
    expect(r.error!.issues.some((i) => i.path[0] === 'monthly_rent')).toBe(true);
  });

  it('forces PG and flatmate to rent (backend rule)', () => {
    const r = formSchema.safeParse({ ...base, property_type: 'pg', purpose: 'buy', sale_price: '100' });
    expect(r.success).toBe(false);
    expect(r.error!.issues.some((i) => i.path[0] === 'purpose')).toBe(true);
  });

  it('uses the sale price for base_price and drops rooms for plots', () => {
    const r = formSchema.safeParse({ ...base, purpose: 'buy', property_type: 'plot', sale_price: '9500000', monthly_rent: '' });
    expect(r.success).toBe(true);
    const p = toPayload(r.data!);
    expect(p.base_price).toBe(9500000);
    expect(p.bedrooms).toBeUndefined();
    expect(p.monthly_rent).toBeUndefined();
  });

  it('suggests a title', () => {
    expect(suggestTitle({ bedrooms: '3', property_type: 'builder_floor', purpose: 'buy', locality: 'Palam Vihar' }, 'Builder floor')).toBe('3 BHK Builder floor for sale in Palam Vihar');
  });
});

describe('edit mode', () => {
  const edited = {
    purpose: 'short_stay', property_type: 'apartment', full_address: 'Tower B, Sector 56', city: 'Gurugram', daily_rate: '2500',
    title: '2 BHK Apartment in Sector 56', balconies: '2', images: [], amenity_ids: [],
  };
  it('does not ask for the owner fields or the terms again', () => {
    expect(makeFormSchema(true).safeParse(edited).success).toBe(true);
    expect(formSchema.safeParse(edited).success).toBe(false);
  });
  it('sends the fields PropertyUpdate takes, and an empty photo list', () => {
    const p = toUpdatePayload(makeFormSchema(true).parse(edited) as never);
    // The owner is not asked again, so the owner fields are not sent.
    for (const k of ['owner_name', 'owner_contact']) expect(p).not.toHaveProperty(k);
    // PropertyUpdate takes these now, so an edit keeps them.
    expect(p).toMatchObject({ base_price: 2500, daily_rate: 2500, balconies: 2, image_urls: [], main_image_url: null, title: '2 BHK Apartment in Sector 56' });
  });

  it('sends null for an emptied field and [] for no amenities, so the backend clears them', () => {
    const p = toUpdatePayload(makeFormSchema(true).parse({ ...edited, purpose: 'rent', monthly_rent: '32000', daily_rate: '', balconies: '', description: '', available_from: '', furnishing_level: '', security_deposit: '' }) as never);
    expect(p).toMatchObject({ monthly_rent: 32000, daily_rate: null, balconies: null, description: null, available_from: null, furnishing_level: null, security_deposit: null, parking_spaces: null, amenity_ids: [] });
  });

  it('never sends null for a field the backend cannot clear', () => {
    const p = toUpdatePayload(makeFormSchema(true).parse({ ...edited, purpose: 'rent', monthly_rent: '32000' }) as never);
    for (const k of ['title', 'property_type', 'purpose', 'base_price', 'status', 'is_available', 'country', 'minimum_stay_days'] as const) expect(p[k] ?? 'unset').not.toBeNull();
    // A sale listing has no rent: the stale rent is cleared. A rent listing keeps its rent.
    expect(toUpdatePayload(makeFormSchema(true).parse({ ...edited, purpose: 'buy', sale_price: '9500000' }) as never).monthly_rent).toBeNull();
    expect(p.monthly_rent).toBe(32000);
  });

  it('sends PG preferences only for PG and flatmate listings, and clears them when emptied', () => {
    const pg = { ...edited, purpose: 'rent', property_type: 'pg', monthly_rent: '9000', daily_rate: '' };
    const filled = toUpdatePayload(makeFormSchema(true).parse({ ...pg, gender_preference: 'female', sharing_type: 'shared_room', kitchen_type: 'vegetarian', ventilation_type: 'good', windows_count: '2', max_occupancy: '3' }) as never);
    expect(filled).toMatchObject({ gender_preference: 'female', sharing_type: 'shared_room', kitchen_type: 'vegetarian', ventilation_type: 'good', windows_count: 2, max_occupancy: 3 });
    const emptied = toUpdatePayload(makeFormSchema(true).parse({ ...pg, gender_preference: '', sharing_type: '' }) as never);
    expect(emptied).toMatchObject({ gender_preference: null, sharing_type: null, kitchen_type: null, windows_count: null });
    // A flat has no such fields: nothing is sent for them, so no empty preference is stored.
    const flat = toUpdatePayload(makeFormSchema(true).parse({ ...edited, purpose: 'rent', monthly_rent: '1', daily_rate: '', gender_preference: 'male' }) as never);
    for (const k of ['gender_preference', 'sharing_type', 'kitchen_type', 'ventilation_type', 'windows_count', 'max_occupancy']) expect(flat).not.toHaveProperty(k);
  });
});

describe('PG and flatmate create', () => {
  const pg = { ...base, property_type: 'pg', monthly_rent: '9000', gender_preference: 'male', sharing_type: 'private_room', kitchen_type: 'any', ventilation_type: 'average', windows_count: '2', max_occupancy: '2', setup_cost: '1500', other_charges: '500', other_charges_description: 'Water' } as const;
  it('sends the preference and charge fields of the PropertyCreate contract', () => {
    const p = toPayload(formSchema.parse(pg));
    expect(p).toMatchObject({ gender_preference: 'male', sharing_type: 'private_room', kitchen_type: 'any', ventilation_type: 'average', windows_count: 2, max_occupancy: 2, setup_cost: 1500, other_charges: 500, other_charges_description: 'Water' });
  });
  it('does not send PG preferences for a flat, or charges for a sale', () => {
    const flat = toPayload(formSchema.parse({ ...pg, property_type: 'apartment' }));
    for (const k of ['gender_preference', 'sharing_type', 'kitchen_type', 'windows_count']) expect(flat).not.toHaveProperty(k);
    const sale = toPayload(formSchema.parse({ ...pg, property_type: 'apartment', purpose: 'buy', sale_price: '9500000' }));
    for (const k of ['setup_cost', 'other_charges', 'other_charges_description']) expect(sale).not.toHaveProperty(k);
  });
  it('rejects a value that is not a backend enum value', () => {
    expect(formSchema.safeParse({ ...pg, gender_preference: 'other' }).success).toBe(false);
    expect(formSchema.safeParse({ ...pg, kitchen_type: 'jain' }).success).toBe(false);
  });
});

describe('post property limits and formats', () => {
  it('takes condo and loft, which the backend and search allow', () => {
    for (const property_type of ['condo', 'loft']) expect(formSchema.safeParse({ ...base, property_type }).success, property_type).toBe(true);
  });
  it('uses the backend maximum for every price, on create and update', () => {
    expect(formSchema.safeParse({ ...base, purpose: 'buy', property_type: 'plot', sale_price: String(PRICE_MAX) }).success).toBe(true);
    expect(formSchema.safeParse({ ...base, purpose: 'buy', property_type: 'plot', sale_price: '10000000000' }).success).toBe(false);
    expect(formSchema.safeParse({ ...base, monthly_rent: String(PRICE_MAX) }).success).toBe(true);
    expect(formSchema.safeParse({ ...base, monthly_rent: '10000000000' }).success).toBe(false);
  });
  it('takes whole numbers where the backend field is an integer, and decimals for the area', () => {
    for (const k of ['bedrooms', 'bathrooms', 'balconies', 'parking_spaces', 'floor_number', 'total_floors', 'age_of_property', 'windows_count', 'max_occupancy']) {
      expect(formSchema.safeParse({ ...base, [k]: '2.5' }).success, `${k} 2.5`).toBe(false);
      expect(formSchema.safeParse({ ...base, [k]: '2' }).success, `${k} 2`).toBe(true);
    }
    expect(formSchema.safeParse({ ...base, area_sqft: '1650.5' }).success).toBe(true);
  });
  it('takes available_from as YYYY-MM-DD only', () => {
    expect(formSchema.safeParse({ ...base, available_from: '2026-11-01' }).success).toBe(true);
    expect(formSchema.safeParse({ ...base, available_from: '' }).success).toBe(true);
    expect(formSchema.safeParse({ ...base, available_from: '01/11/2026' }).success).toBe(false);
    expect(formSchema.safeParse({ ...base, available_from: '2026-11-01T00:00:00Z' }).success).toBe(false);
    expect(toPayload(formSchema.parse({ ...base, available_from: '2026-11-01' })).available_from).toBe('2026-11-01');
  });
});

describe('toCard (live preview)', () => {
  it('waits for a property type', () => {
    expect(toCard({ purpose: 'rent' }, 0)).toBeNull();
  });

  it('maps the form to the listing card, with the first photo as the cover', () => {
    const card = toCard({ ...base, area_sqft: '1650', images: ['https://res.cloudinary.com/x/image/upload/a.jpg', 'https://b'] } as never, 7);
    expect(card).toMatchObject({ id: 7, property_type: 'apartment', purpose: 'rent', base_price: 32000, monthly_rent: 32000, daily_rate: null, bedrooms: 2, area_sqft: 1650, locality: 'Sector 85' });
    expect(card?.main_image_url).toBe('https://res.cloudinary.com/x/image/upload/a.jpg');
  });

  it('uses the right price for each purpose and drops rooms for plots', () => {
    expect(toCard({ purpose: 'buy', property_type: 'plot', sale_price: '8500000', bedrooms: '3' }, 0)).toMatchObject({ base_price: 8500000, monthly_rent: null, bedrooms: null });
    expect(toCard({ purpose: 'short_stay', property_type: 'studio', daily_rate: '2200' }, 0)).toMatchObject({ base_price: 2200, daily_rate: 2200 });
    // No price yet, or text in a number field: 0, which the preview shows as "not added".
    expect(toCard({ purpose: 'rent', property_type: 'room', monthly_rent: 'abc' }, 0)?.base_price).toBe(0);
  });
});
