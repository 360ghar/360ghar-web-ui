/**
 * Pure rules for the saved location. No browser calls here, so they are
 * unit-tested. The saved value holds only what a search needs: lat, lng, the
 * accuracy the browser reported, and when it was taken.
 */

/** v1 kept a fix for 24 hours (`LOCATION_MAX_AGE_MS`). */
export const TTL_MS = 24 * 60 * 60 * 1000;

/** The centre v1 used when it could not find the visitor (Gurugram). */
export const FALLBACK_CENTER = { lat: 28.4595, lng: 77.0266 } as const;

export type Fix = { lat: number; lng: number; accuracy: number | null; time: number };

export type FailReason = 'denied' | 'unavailable' | 'timeout' | 'unsupported';

/** GeolocationPositionError codes: 1 denied, 2 unavailable, 3 timeout. */
export function reasonFromCode(code: number | undefined): FailReason {
  return code === 1 ? 'denied' : code === 3 ? 'timeout' : 'unavailable';
}

export function isFresh(fix: Fix | null | undefined, now: number): fix is Fix {
  return Boolean(fix) && now - fix!.time >= 0 && now - fix!.time < TTL_MS;
}

/**
 * Reads a value from storage. Anything odd (wrong types, out of range, from the
 * future, older than the TTL) gives null, so a bad or tampered value never
 * reaches a search URL.
 */
export function parseFix(value: unknown, now: number): Fix | null {
  if (!value || typeof value !== 'object') return null;
  const v = value as Record<string, unknown>;
  const { lat, lng, time } = v;
  if (typeof lat !== 'number' || typeof lng !== 'number' || typeof time !== 'number') return null;
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || !Number.isFinite(time)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  const accuracy = typeof v.accuracy === 'number' && Number.isFinite(v.accuracy) && v.accuracy >= 0 ? v.accuracy : null;
  const fix: Fix = { lat, lng, accuracy, time };
  return isFresh(fix, now) ? fix : null;
}

/** What goes to storage: exactly the four fields, nothing else. */
export function serializeFix(fix: Fix | null): Fix | null {
  return fix ? { lat: fix.lat, lng: fix.lng, accuracy: fix.accuracy, time: fix.time } : null;
}

/** Turns a browser position into a fix taken at `now`. */
export function fromPosition(p: { latitude: number; longitude: number; accuracy?: number }, now: number): Fix {
  return { lat: p.latitude, lng: p.longitude, accuracy: typeof p.accuracy === 'number' ? p.accuracy : null, time: now };
}
