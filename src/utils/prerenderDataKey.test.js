import { describe, it, expect } from 'vitest';
import { buildRequestKey } from './prerenderDataKey';

describe('buildRequestKey', () => {
  it('lowercases the method and keeps the path', () => {
    expect(buildRequestKey({ method: 'GET', url: '/properties/' })).toBe('get /properties');
  });

  it('strips a trailing slash (except root)', () => {
    expect(buildRequestKey({ url: '/properties/recommendations/' })).toBe(
      'get /properties/recommendations'
    );
    expect(buildRequestKey({ url: '/' })).toBe('get /');
  });

  it('strips the baseURL prefix so keys are stable across config', () => {
    const a = buildRequestKey({ url: '/properties/?limit=6', baseURL: '/api' });
    const b = buildRequestKey({ url: '/api/properties/?limit=6', baseURL: '/api' });
    const c = buildRequestKey({ url: '/properties/?limit=6' });
    expect(a).toBe(b);
    expect(a).toBe(c);
  });

  it('sorts query params so order does not change the key', () => {
    const a = buildRequestKey({ url: '/properties/?limit=12&sort_by=newest' });
    const b = buildRequestKey({ url: '/properties/?sort_by=newest&limit=12' });
    expect(a).toBe(b);
    expect(a).toBe('get /properties?limit=12&sort_by=newest');
  });

  it('handles repeated params (arrays) deterministically', () => {
    const a = buildRequestKey({ url: '/properties/?property_type=apartment&property_type=pg' });
    const b = buildRequestKey({ url: '/properties/?property_type=pg&property_type=apartment' });
    expect(a).toBe(b);
    expect(a).toBe('get /properties?property_type=apartment&property_type=pg');
  });

  it('drops the hash fragment', () => {
    expect(buildRequestKey({ url: '/about-us#team' })).toBe('get /about-us');
  });

  it('keeps only path+search for absolute URLs', () => {
    const key = buildRequestKey({ url: 'https://api.example.com/blog/posts?limit=25' });
    expect(key).toBe('get /blog/posts?limit=25');
  });

  it('defaults method to get and empty url to root', () => {
    expect(buildRequestKey({})).toBe('get /');
  });

  it('does not strip near-prefix baseURL matches', () => {
    expect(buildRequestKey({ url: '/apiary/properties?limit=6', baseURL: '/api' })).toBe(
      'get /apiary/properties?limit=6'
    );
  });
});
