/**
 * Owner AI helpers (flagged, see lib/flags): the listing writer and virtual staging.
 *  - POST /api/v1/ai/listing-draft { image_urls (up to 8), details } -> { title, description }
 *  - POST /api/v1/design-studio/stage { image_url } -> { image_url } of a copy marked "Virtually staged"
 * Replies are read loosely; a reply without the text or the image is a failure.
 */
import { postJson } from '@/lib/api/client';

export type Failure = 'rate' | 'unavailable' | 'failed';
const reason = (status: number): Failure => (status === 429 ? 'rate' : status === 404 || status === 405 || status === 501 ? 'unavailable' : 'failed');
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const ok = (status: number) => status >= 200 && status < 300;

export const MAX_DRAFT_PHOTOS = 8;

export function parseListing(json: unknown): { title: string; description: string } | null {
  const o = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>;
  const title = str(o.title);
  const description = str(o.description);
  return title && description ? { title: title.slice(0, 200), description: description.slice(0, 5000) } : null;
}

export async function listingDraft(imageUrls: string[], details: Record<string, unknown>): Promise<{ title: string; description: string } | { failure: Failure }> {
  const { status, json } = await postJson('/api/v1/ai/listing-draft', { image_urls: imageUrls.slice(0, MAX_DRAFT_PHOTOS), details });
  const draft = ok(status) ? parseListing(json) : null;
  return draft ?? { failure: ok(status) ? 'failed' : reason(status) };
}

export function parseStaged(json: unknown): string | null {
  const o = (json && typeof json === 'object' ? json : {}) as Record<string, unknown>;
  const url = str(o.image_url) ?? str(o.url) ?? str(o.staged_url);
  return url && /^https:\/\//.test(url) ? url : null;
}

export async function stagePhoto(imageUrl: string): Promise<{ url: string } | { failure: Failure }> {
  const { status, json } = await postJson('/api/v1/design-studio/stage', { image_url: imageUrl }, 120_000);
  const parsed = ok(status) ? parseStaged(json) : null;
  // A reply that hands back the same photo staged nothing.
  const url = parsed && parsed !== imageUrl ? parsed : null;
  return url ? { url } : { failure: ok(status) ? 'failed' : reason(status) };
}

/** What the writer is told about the home: only filled fields, so the text never rests on a guess. */
export function listingDetails(v: Record<string, unknown>): Record<string, unknown> {
  const keys = ['purpose', 'property_type', 'locality', 'city', 'bedrooms', 'bathrooms', 'balconies', 'parking_spaces', 'area_sqft', 'furnishing_level', 'floor_number', 'total_floors', 'age_of_property'];
  return Object.fromEntries(keys.flatMap((k) => (v[k] === undefined || v[k] === null || v[k] === '' ? [] : [[k, v[k]]])));
}
