import { describe, expect, it, vi } from 'vitest';

vi.mock('@/lib/api/client', () => ({ apiUrl: (p: string) => `https://api.test${p}`, authedFetch: vi.fn() }));
const { authedFetch } = await import('@/lib/api/client');
const { filtersToParams, isSentence, sentenceHref } = await import('./nl');

const reply = (status: number, body: unknown) => vi.mocked(authedFetch).mockResolvedValueOnce(new Response(JSON.stringify(body), { status }));

describe('isSentence', () => {
  it('needs four words', () => {
    expect(isSentence('Sector 57')).toBe(false);
    expect(isSentence('  2 bhk for rent in sector 57 ')).toBe(true);
  });
});

describe('filtersToParams', () => {
  it('flattens scalars and arrays, ignores objects', () => {
    expect(filtersToParams({ purpose: 'rent', property_type: ['apartment', 'house'], bedrooms_min: 2, nested: { a: 1 }, none: null }).toString()).toBe('purpose=rent&property_type=apartment&property_type=house&bedrooms_min=2');
  });
});

describe('sentenceHref', () => {
  it('drops the inherited PG type when the sentence changes the purpose', async () => {
    reply(200, { filters: { purpose: 'buy', bedrooms_min: 2 } });
    const url = new URL((await sentenceHref('2 bhk to buy in sector 57', 'en', { purpose: 'rent', property_type: 'pg' })).href, 'https://x');
    expect(url.searchParams.get('purpose')).toBe('buy');
    expect(url.searchParams.has('property_type')).toBe(false);
  });
  it('uses the filters the backend returns, canonical and clamped', async () => {
    reply(200, { filters: { purpose: 'rent', bedrooms_min: 2, locality: 'Sector 57', evil: 'x' }, explanation: 'ok' });
    const r = await sentenceHref('2 bhk for rent in sector 57', 'en');
    expect(r.ai).toBe(true);
    const url = new URL(r.href, 'https://x');
    expect(url.pathname).toBe('/properties');
    expect(url.searchParams.get('purpose')).toBe('rent');
    expect(url.searchParams.get('locality')).toBe('Sector 57');
    expect(url.searchParams.has('evil')).toBe(false);
  });
  it('clamps out-of-range values and keeps what the person chose', async () => {
    reply(200, { filters: { bedrooms_min: 999, price_max: -5 } });
    const r = await sentenceHref('big home with lots of rooms please', 'en', { purpose: 'buy' });
    const url = new URL(r.href, 'https://x');
    expect(Number(url.searchParams.get('bedrooms_min'))).toBeLessThanOrEqual(20);
    expect(url.searchParams.get('purpose')).toBe('buy');
    reply(200, { filters: { purpose: 'rent' } });
    expect(new URL((await sentenceHref('flat for rent in sector 57', 'en', { purpose: 'buy' })).href, 'https://x').searchParams.get('purpose')).toBe('rent');
    reply(404, {});
    expect(new URL((await sentenceHref('flat near the metro please', 'en', { purpose: 'rent', property_type: 'pg' })).href, 'https://x').searchParams.get('property_type')).toBe('pg');
  });
  it('falls back to a keyword search when the route is missing, fails or says nothing', async () => {
    for (const make of [() => reply(404, { detail: 'nf' }), () => reply(200, { filters: {} }), () => vi.mocked(authedFetch).mockRejectedValueOnce(new Error('down'))]) {
      make();
      const r = await sentenceHref('flat near the metro in gurugram', 'hi');
      expect(r.ai).toBe(false);
      expect(r.href).toBe('/hi/properties?q=flat+near+the+metro+in+gurugram');
    }
  });
});
