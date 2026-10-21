import { describe, expect, it } from 'vitest';
import { FALLBACK_CENTER, TTL_MS, fromPosition, isFresh, parseFix, reasonFromCode, serializeFix } from './logic';

const NOW = 1_800_000_000_000;
const fix = { lat: 28.46, lng: 77.03, accuracy: 30, time: NOW - 1000 };

describe('location logic', () => {
  it('uses the Gurugram centre v1 used', () => {
    expect(FALLBACK_CENTER).toEqual({ lat: 28.4595, lng: 77.0266 });
  });

  it('is fresh for 24 hours, then stale', () => {
    expect(isFresh({ ...fix, time: NOW - (TTL_MS - 1) }, NOW)).toBe(true);
    expect(isFresh({ ...fix, time: NOW - TTL_MS }, NOW)).toBe(false);
    expect(isFresh({ ...fix, time: NOW + 5000 }, NOW)).toBe(false); // a clock set back must not extend the life
    expect(isFresh(null, NOW)).toBe(false);
  });

  it('round-trips through JSON and keeps only four fields', () => {
    const dirty = { ...fix, name: 'Sector 56', extra: 1 } as typeof fix;
    const json = JSON.stringify(serializeFix(dirty));
    expect(Object.keys(JSON.parse(json)).sort()).toEqual(['accuracy', 'lat', 'lng', 'time']);
    expect(parseFix(JSON.parse(json), NOW)).toEqual(fix);
    expect(serializeFix(null)).toBeNull();
  });

  it('drops expired, malformed and out-of-range values', () => {
    expect(parseFix({ ...fix, time: NOW - TTL_MS - 1 }, NOW)).toBeNull();
    expect(parseFix({ lat: '28', lng: 77, time: NOW }, NOW)).toBeNull();
    expect(parseFix({ lat: 91, lng: 77, time: NOW }, NOW)).toBeNull();
    expect(parseFix({ lat: 28, lng: 181, time: NOW }, NOW)).toBeNull();
    expect(parseFix({ lat: NaN, lng: 77, time: NOW }, NOW)).toBeNull();
    expect(parseFix({ lat: 28, lng: 77 }, NOW)).toBeNull();
    expect(parseFix(null, NOW)).toBeNull();
    expect(parseFix('x', NOW)).toBeNull();
  });

  it('treats a bad accuracy as unknown', () => {
    expect(parseFix({ ...fix, accuracy: -5 }, NOW)?.accuracy).toBeNull();
    expect(parseFix({ ...fix, accuracy: undefined }, NOW)?.accuracy).toBeNull();
  });

  it('maps browser error codes', () => {
    expect(reasonFromCode(1)).toBe('denied');
    expect(reasonFromCode(2)).toBe('unavailable');
    expect(reasonFromCode(3)).toBe('timeout');
    expect(reasonFromCode(undefined)).toBe('unavailable');
  });

  it('builds a fix from a browser position', () => {
    expect(fromPosition({ latitude: 1, longitude: 2, accuracy: 9 }, NOW)).toEqual({ lat: 1, lng: 2, accuracy: 9, time: NOW });
    expect(fromPosition({ latitude: 1, longitude: 2 }, NOW).accuracy).toBeNull();
  });
});
