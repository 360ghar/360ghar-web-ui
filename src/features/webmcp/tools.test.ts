import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ApiError } from '@/lib/api/errors';

// No network: the API client and the auth store are replaced. `fetch` is a spy that must stay unused.
const get = vi.fn();
const post = vi.fn();
const del = vi.fn();
vi.mock('@/lib/api/client', () => ({ api: { GET: (...a: unknown[]) => get(...a), POST: (...a: unknown[]) => post(...a), DELETE: (...a: unknown[]) => del(...a), PUT: (...a: unknown[]) => post(...a), PATCH: (...a: unknown[]) => post(...a) }, call: (p: Promise<unknown>) => p }));

let status: 'unknown' | 'anon' | 'authed' = 'authed';
vi.mock('@/features/auth/store', () => ({ initAuth: () => Promise.resolve(), useAuthStore: { getState: () => ({ status }) } }));

const fetchSpy = vi.fn();
vi.stubGlobal('fetch', fetchSpy);

const { calculateEmi, scheduleVisit, searchProperties } = await import('./tools');

const property = (id: number, extra: Record<string, unknown> = {}) => ({ id, title: `Home ${id}`, purpose: 'rent', property_type: 'apartment', base_price: 0, monthly_rent: 30000, bedrooms: 2, bathrooms: 2, area_sqft: 1000, locality: 'Sector 57', city: 'Gurugram', is_available: true, ...extra });

const tomorrow = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

beforeEach(() => {
  vi.clearAllMocks();
  status = 'authed';
});

describe('search_properties', () => {
  it('turns the input into the same API query the listing page uses', async () => {
    get.mockResolvedValue({ items: [property(1), property(2, { purpose: 'buy', base_price: 8_500_000 })], total: 37, has_more: true });
    const r = await searchProperties({ query: '2 BHK', city: 'gurgaon', purpose: 'rent', price_max: '40000', bedrooms_min: 2.9 });
    const [path, opts] = get.mock.calls[0]!;
    expect(path).toBe('/api/v1/properties');
    expect(opts.params.query).toMatchObject({ q: '2 BHK', city: 'gurgaon', purpose: 'rent', price_max: 40000, bedrooms_min: 2, limit: 10, include_total: true });
    expect(r).toMatchObject({ ok: true, total: 37, count: 2 });
    if (!r.ok) return;
    const [a, b] = r.results as { price_inr: number; url: string }[];
    expect(a).toMatchObject({ id: 1, price_inr: 30000, url: 'https://360ghar.com/property/1', locality: 'Sector 57' });
    expect(b?.price_inr).toBe(8_500_000);
    expect(r.search_url).toBe('https://360ghar.com/properties?purpose=rent&q=2+BHK&city=gurgaon&price_max=40000&bedrooms_min=2');
  });

  it('treats the pg purpose like the search page (rent plus the pg type)', async () => {
    get.mockResolvedValue({ items: [], total: 0 });
    await searchProperties({ purpose: 'pg' });
    expect(get.mock.calls[0]![1].params.query).toMatchObject({ purpose: 'rent', property_type: ['pg'] });
  });

  it('works with no input at all', async () => {
    get.mockResolvedValue({ items: [] });
    for (const input of [undefined, null, 'text', [], 5]) expect(await searchProperties(input)).toMatchObject({ ok: true, count: 0, total: null });
  });

  it('rejects bad input without calling the API', async () => {
    for (const input of [{ purpose: 'lease' }, { purpose: 5 }, { price_max: 'lots' }, { price_max: 0 }, { bedrooms_min: -1 }]) {
      expect(await searchProperties(input)).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
    }
    expect(get).not.toHaveBeenCalled();
  });

  it('turns an API failure into a readable error', async () => {
    get.mockRejectedValue(new ApiError({ status: 503, code: 'HTTP_503', message: 'Service Unavailable' }));
    expect(await searchProperties({ query: 'x' })).toMatchObject({ ok: false, error: { code: 'api_error', status: 503, retryable: true } });
    get.mockRejectedValue(new TypeError('boom'));
    expect(await searchProperties({})).toMatchObject({ ok: false, error: { code: 'api_error' } });
  });
});

describe('schedule_visit', () => {
  it('asks the user to sign in when signed out, and does not call the API', async () => {
    status = 'anon';
    const r = await scheduleVisit({ property_id: '12', scheduled_date: tomorrow() });
    expect(r).toMatchObject({ ok: false, error: { code: 'sign_in_required', sign_in_url: 'https://360ghar.com/login?next=%2Fproperty%2F12' } });
    expect(get).not.toHaveBeenCalled();
    expect(post).not.toHaveBeenCalled();
  });

  it('never books: a signed-in call returns the property page to confirm on', async () => {
    get.mockResolvedValue(property(12));
    const day = tomorrow();
    const r = await scheduleVisit({ property_id: '12', scheduled_date: day, special_requirements: '  ground floor  ' });
    expect(get).toHaveBeenCalledWith('/api/v1/properties/{property_id}', { params: { path: { property_id: 12 } } });
    expect(r).toEqual({
      ok: true,
      booked: false,
      status: 'user_confirmation_required',
      message: expect.stringContaining(`${day} is already selected`),
      confirm_url: `https://360ghar.com/property/12?visit_date=${day}`,
      property: { id: 12, title: 'Home 12' },
      requested_date: day,
      special_requirements: 'ground floor',
    });
    expect(post).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('links without visit_date when the day is beyond the days the form offers', async () => {
    get.mockResolvedValue(property(12));
    const d = new Date();
    d.setDate(d.getDate() + 30);
    const far = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const r = await scheduleVisit({ property_id: '12', scheduled_date: far });
    expect(r).toMatchObject({ ok: true, booked: false, confirm_url: 'https://360ghar.com/property/12', requested_date: far });
    expect(String((r as unknown as { message: string }).message)).toContain('outside the days the form offers');
  });

  it('accepts a numeric property_id', async () => {
    get.mockResolvedValue(property(7));
    expect(await scheduleVisit({ property_id: 7, scheduled_date: tomorrow() })).toMatchObject({ ok: true, property: { id: 7 } });
  });

  it('validates the input first', async () => {
    const day = tomorrow();
    for (const input of [
      {},
      { property_id: 'abc', scheduled_date: day },
      { property_id: '1.5', scheduled_date: day },
      { property_id: '0', scheduled_date: day },
      { property_id: '1' },
      { property_id: '1', scheduled_date: '2026-02-30' },
      { property_id: '1', scheduled_date: '01/10/2030' },
      { property_id: '1', scheduled_date: '2020-01-01' },
      { property_id: '1', scheduled_date: `${tomorrow()}&next=//evil.example` },
      { property_id: '1', scheduled_date: '"><script>alert(1)</script>' },
      { property_id: '1', scheduled_date: '2030-01-01#x' },
      { property_id: '1', scheduled_date: ['2030-01-01'] },
    ]) {
      expect(await scheduleVisit(input), JSON.stringify(input)).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
    }
    expect(get).not.toHaveBeenCalled();
  });

  it('reports a missing or unavailable property', async () => {
    get.mockRejectedValueOnce(new ApiError({ status: 404, code: 'HTTP_404', message: 'Not found' }));
    expect(await scheduleVisit({ property_id: '99', scheduled_date: tomorrow() })).toMatchObject({ ok: false, error: { code: 'property_not_found' } });
    get.mockResolvedValueOnce(property(5, { is_available: false }));
    expect(await scheduleVisit({ property_id: '5', scheduled_date: tomorrow() })).toMatchObject({ ok: false, error: { code: 'property_unavailable' } });
    get.mockRejectedValueOnce(new ApiError({ status: 0, code: 'NETWORK', message: 'offline' }));
    expect(await scheduleVisit({ property_id: '5', scheduled_date: tomorrow() })).toMatchObject({ ok: false, error: { code: 'api_error' } });
    expect(post).not.toHaveBeenCalled();
  });
});

describe('calculate_emi', () => {
  it('uses the calculator math', async () => {
    // 10 lakh at 8.5 % for 20 years: EMI 8,678.
    const r = await calculateEmi({ principal: 1_000_000, rate: 8.5, tenure_years: 20 });
    expect(r).toMatchObject({ ok: true, currency: 'INR', emi: 8678, months: 240 });
    if (!r.ok) return;
    // The formula written out again, as a check on the shared function.
    const rm = 0.085 / 12;
    const exact = (1_000_000 * rm * (1 + rm) ** 240) / ((1 + rm) ** 240 - 1);
    expect(r.total_payment).toBe(Math.round(exact * 240));
    expect(r.total_interest).toBe((r.total_payment as number) - 1_000_000);
  });

  it('handles a zero rate and numeric strings', async () => {
    expect(await calculateEmi({ principal: '120000', rate: '0', tenure_years: 1 })).toMatchObject({ ok: true, emi: 10000, total_interest: 0, months: 12 });
  });

  it('rejects bad input', async () => {
    for (const input of [undefined, {}, { principal: 0, rate: 8, tenure_years: 5 }, { principal: 1e5, rate: -1, tenure_years: 5 }, { principal: 1e5, rate: 101, tenure_years: 5 }, { principal: 1e5, rate: 8, tenure_years: 0 }, { principal: 1e5, rate: 8, tenure_years: 80 }, { principal: 'x', rate: 8, tenure_years: 5 }, { principal: NaN, rate: 8, tenure_years: 5 }]) {
      expect(await calculateEmi(input), JSON.stringify(input)).toMatchObject({ ok: false, error: { code: 'invalid_input' } });
    }
  });
});
