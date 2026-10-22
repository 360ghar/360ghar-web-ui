/**
 * Owner AI helpers (flagged, see lib/flags): the listing writer and virtual staging. Shapes are those of the backend
 * (360ghar-backend docs/openapi.json, branch feat/ai-owner-tools), written by hand because the synced contract does not have
 * these routes yet:
 *  - POST /api/v1/ai/listing-draft { photos: [{ url }] (1 to 8), hints } -> { title, description, rooms, flags }.
 *    Sign-in required, 3 per minute, model latency about 70 s.
 *  - POST /api/v1/design-studio/stage { image (base64), mime_type, room_type, style } -> { image (a JPEG data URL with the
 *    visible "Virtually staged" band), staged: true, watermark }. 5 per minute per IP.
 * Replies are read defensively; a reply without the text or the image is a failure.
 */
import { api, call, multipart, postJson, timeoutMs, UPLOAD_TIMEOUT_MS } from '@/lib/api/client';
import { FURNISHING_LEVELS, PROPERTY_TYPES } from '@/lib/api/enums';
import { formNum } from './schema';

export type Failure = 'rate' | 'unavailable' | 'failed';
const reason = (status: number): Failure => (status === 429 ? 'rate' : status === 404 || status === 405 || status === 501 || status === 503 ? 'unavailable' : 'failed');
const str = (v: unknown) => (typeof v === 'string' && v.trim() ? v.trim() : null);
const ok = (status: number) => status >= 200 && status < 300;
const obj = (json: unknown) => (json && typeof json === 'object' ? json : {}) as Record<string, unknown>;

export const MAX_DRAFT_PHOTOS = 8;

export const FLAG_CODES = ['blurry', 'dark', 'people_visible', 'text_or_watermark', 'not_a_property', 'duplicate_photo', 'low_resolution', 'few_photos', 'no_exterior_or_entrance'] as const;
export type FlagCode = (typeof FLAG_CODES)[number];
/** A photo problem the model found. `photo` is the 0-based index in the request, or null for the whole set. */
export type ListingFlag = { code: FlagCode; photo: number | null; note: string };
export type ListingDraft = { title: string; description: string; flags: ListingFlag[] };

export function parseListing(json: unknown): ListingDraft | null {
  const o = obj(json);
  const title = str(o.title);
  const description = str(o.description);
  if (!title || !description) return null;
  const flags = (Array.isArray(o.flags) ? o.flags : []).flatMap((f): ListingFlag[] => {
    const x = obj(f);
    const code = FLAG_CODES.find((c) => c === x.code);
    return code ? [{ code, photo: typeof x.photo === 'number' && Number.isInteger(x.photo) && x.photo >= 0 ? x.photo : null, note: str(x.note) ?? '' }] : [];
  });
  return { title: title.slice(0, 200), description: description.slice(0, 5000), flags };
}

export async function listingDraft(imageUrls: string[], hints: Record<string, unknown>): Promise<ListingDraft | { failure: Failure }> {
  const photos = imageUrls.slice(0, MAX_DRAFT_PHOTOS).map((url) => ({ url }));
  // The model reads up to 8 photos: about 70 s for 3.
  const { status, json } = await postJson('/api/v1/ai/listing-draft', { photos, ...(Object.keys(hints).length ? { hints } : {}) }, 150_000);
  const draft = ok(status) ? parseListing(json) : null;
  return draft ?? { failure: ok(status) ? 'failed' : reason(status) };
}

/** What the writer is told about the home (backend ListingHints): only filled fields that the backend accepts, so the text never rests on a guess. */
export function listingDetails(v: Record<string, unknown>): Record<string, unknown> {
  const text = (k: string) => (typeof v[k] === 'string' && (v[k] as string).trim() ? (v[k] as string).trim().slice(0, 100) : undefined);
  // The form holds numbers as typed, so "3" is read as 3.
  const count = (k: string) => {
    const n = formNum(v[k]);
    return n !== undefined && Number.isInteger(n) && n >= 0 && n <= 50 ? n : undefined;
  };
  const sqft = formNum(v.area_sqft);
  const area = sqft !== undefined && sqft > 0 && sqft <= 1_000_000 ? sqft : undefined;
  const one = <T extends string>(list: readonly T[], x: unknown) => list.find((i) => i === x);
  const hints = {
    property_type: one(PROPERTY_TYPES, v.property_type),
    purpose: one(['buy', 'rent', 'short_stay'] as const, v.purpose),
    city: text('city'),
    locality: text('locality'),
    bedrooms: count('bedrooms'),
    bathrooms: count('bathrooms'),
    area_sqft: area,
    furnishing: one(FURNISHING_LEVELS, v.furnishing_level),
  };
  return Object.fromEntries(Object.entries(hints).filter(([, x]) => x !== undefined));
}

export const STAGE_ROOMS = ['living_room', 'bedroom', 'dining_room', 'kitchen', 'study', 'balcony'] as const;
export const STAGE_STYLES = ['modern', 'minimalist', 'scandinavian', 'traditional_indian', 'contemporary'] as const;
export type StageRoom = (typeof STAGE_ROOMS)[number];
export type StageStyle = (typeof STAGE_STYLES)[number];

/** The staged image: a JPEG data URL. Anything else is not the backend's answer. */
export function parseStaged(json: unknown): string | null {
  const o = obj(json);
  const image = str(o.image);
  return o.staged === true && image && /^data:image\/jpeg;base64,/.test(image) ? image : null;
}

const toBase64 = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(blob);
  });

/** The backend takes at most 5 MB: every photo is re-encoded as a JPEG of at most 1600 px on its long side. */
async function boundedJpeg(blob: Blob): Promise<Blob> {
  try {
    const bitmap = await createImageBitmap(blob);
    const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(bitmap.width * scale));
    canvas.height = Math.max(1, Math.round(bitmap.height * scale));
    canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const out = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    return out ?? blob;
  } catch {
    return blob;
  }
}

/**
 * Stages one photo and stores the result as a new photo of the listing (the backend returns the image itself, not a URL;
 * a data URL cannot be saved on a listing). Resolves to the stored photo's URL.
 */
export async function stagePhoto(imageUrl: string, room: StageRoom, style: StageStyle): Promise<{ url: string } | { failure: Failure }> {
  let image: string;
  let mime: string | undefined;
  try {
    const res = await fetch(imageUrl);
    if (!res.ok) return { failure: 'failed' };
    const blob = await boundedJpeg(await res.blob());
    // A photo that could not be re-encoded and is still too large is not sent.
    if (blob.size > 5_000_000) return { failure: 'failed' };
    mime = ['image/jpeg', 'image/png', 'image/webp'].includes(blob.type) ? blob.type : undefined;
    image = await toBase64(blob);
  } catch {
    return { failure: 'failed' };
  }
  const { status, json } = await postJson('/api/v1/design-studio/stage', { image, ...(mime ? { mime_type: mime } : {}), room_type: room, style }, 150_000);
  if (!ok(status)) return { failure: reason(status) };
  const staged = parseStaged(json);
  if (!staged) return { failure: 'failed' };
  try {
    const blob = await (await fetch(staged)).blob();
    const fd = new FormData();
    fd.append('files', new File([blob], 'staged.jpg', { type: 'image/jpeg' }));
    // Same folder as the wizard's own uploads.
    fd.append('folder_type', 'generic');
    fd.append('visibility', 'public');
    const data = await call(api.POST('/api/v1/upload/batch', { ...multipart(fd), ...timeoutMs(UPLOAD_TIMEOUT_MS) }));
    const url = data.items.find((i) => i.status === 'uploaded' && i.result)?.result?.public_url;
    return url ? { url } : { failure: 'failed' };
  } catch {
    return { failure: 'failed' };
  }
}
