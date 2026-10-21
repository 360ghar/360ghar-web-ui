/**
 * The image provider for AI Design Studio: POST /api/v1/design-studio/generate.
 * The backend runs Agnes AI (agnes-image-2.5-flash). It is free and needs no
 * sign-in (the route is anonymous, so no token is required), and the backend
 * limits requests per IP. A 200 body is `{ image }`. A failure is the error
 * envelope with a code: QUOTA_EXCEEDED (429), SERVICE_UNAVAILABLE (503),
 * CONTENT_BLOCKED, GENERATION_FAILED, NO_IMAGE_RETURNED, TIMEOUT (422).
 */
import { api, call, timeoutMs } from '@/lib/api/client';
import { ApiError } from '@/lib/api/errors';
import type { components } from '@/lib/api/schema';

/** Image generation can take up to a minute; the backend also retries. */
const GENERATE_TIMEOUT_MS = 180_000;

type GenerateBody = components['schemas']['ImageGenRequest'];

async function generate(body: GenerateBody): Promise<string> {
  const data = await call(api.POST('/api/v1/design-studio/generate', { body, ...timeoutMs(GENERATE_TIMEOUT_MS) }));
  if (!data.image) throw new ApiError({ status: 422, code: 'NO_IMAGE_RETURNED', message: 'No image returned' });
  return data.image;
}

export const provider = {
  txt2img: (prompt: string) => generate({ mode: 'text-to-image', prompt }),
  img2img: (prompt: string, { base64, mimeType }: { base64: string; mimeType: string }) => generate({ mode: 'image-to-image', prompt, image: base64, mime_type: mimeType }),
};

export type ErrorKind = 'quota' | 'timeout' | 'network' | 'general';

/** Maps an API error (or a plain error) to an error state. */
export function classifyError(error: unknown, online = true): ErrorKind {
  if (error instanceof ApiError) {
    if (error.kind === 'rate_limited' || error.code === 'QUOTA_EXCEEDED') return 'quota';
    if (error.kind === 'timeout' || error.status === 504 || error.code === 'TIMEOUT') return 'timeout';
    if (error.kind === 'network' || !online) return 'network';
    return 'general';
  }
  return online ? 'general' : 'network';
}

/** File to base64 (without the data: prefix) plus its type. */
export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve({ base64: String(reader.result).split(',')[1] ?? '', mimeType: file.type });
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });
}
