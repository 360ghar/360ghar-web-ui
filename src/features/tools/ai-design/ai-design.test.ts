import { afterEach, describe, expect, it, vi } from 'vitest';
import { addDesign, loadGallery, MAX, removeDesign, writeGallery, type Design } from './gallery';
import { buildPrompt, buildReimaginePrompt, ROOMS, STYLES } from './prompts';
import { ApiError } from '@/lib/api/errors';
import { classifyError, provider } from './provider';

describe('prompts', () => {
  it('builds the text-to-image prompt like the old site', () => {
    expect(buildPrompt({ designType: 'interior', room: 'pooja-room', style: 'traditional-indian', custom: ' brass diya ' })).toBe(
      'Interior design of a Pooja Room, traditional Indian design with rich warm colors, carved wooden furniture, ethnic patterns, brass accents, jaali work, brass diya, Professional architectural visualization, high quality, photorealistic, well-lit, detailed textures, 8K resolution',
    );
    expect(buildPrompt({ designType: 'exterior', room: 'facade', style: 'modern', custom: '' })).toMatch(/^Exterior design of a House Facade, modern minimalist/);
  });

  it('keeps the room and adds the style and notes for image-to-image', () => {
    const p = buildReimaginePrompt({ style: 'japanese', custom: 'keep the plants' });
    expect(p).toContain('Do NOT add, remove, or relocate');
    expect(p).toContain('6. Apply a Japanese design');
    expect(p.split('\n').at(-1)).toBe('Additional user instructions: keep the plants');
    expect(buildReimaginePrompt({ style: 'none', custom: '' })).not.toContain('6. Apply');
  });

  it('has 10 interior rooms, 7 exterior spaces and 12 styles with Hindi labels', () => {
    expect(ROOMS.interior).toHaveLength(10);
    expect(ROOMS.exterior).toHaveLength(7);
    expect(STYLES).toHaveLength(12);
    expect(STYLES.every((s) => s.label.hi && s.desc.hi)).toBe(true);
  });
});

describe('classifyError', () => {
  it('maps API errors to a kind', () => {
    expect(classifyError(new ApiError({ status: 429, code: 'RATE_LIMITED', message: 'slow down' }))).toBe('quota');
    expect(classifyError(new ApiError({ status: 0, code: 'TIMEOUT', message: 'timed out' }))).toBe('timeout');
    expect(classifyError(new ApiError({ status: 504, code: 'TIMEOUT', message: 'timed out' }))).toBe('timeout');
    expect(classifyError(new ApiError({ status: 0, code: 'NETWORK', message: 'offline' }))).toBe('network');
    expect(classifyError(new ApiError({ status: 422, code: 'GENERATION_FAILED', message: 'no image' }))).toBe('general');
    expect(classifyError(new ApiError({ status: 429, code: 'QUOTA_EXCEEDED', message: 'quota' }))).toBe('quota');
    expect(classifyError(new ApiError({ status: 422, code: 'TIMEOUT', message: 'The image took too long' }))).toBe('timeout');
    expect(classifyError(new ApiError({ status: 503, code: 'SERVICE_UNAVAILABLE', message: 'busy' }))).toBe('general');
    expect(classifyError(new Error('boom'), false)).toBe('network');
    expect(classifyError(new Error('boom'))).toBe('general');
  });
});

function memory(limit = Infinity) {
  const data = new Map<string, string>();
  return {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => {
      if (v.length > limit) throw new DOMException('full', 'QuotaExceededError');
      data.set(k, v);
    },
    removeItem: (k: string) => void data.delete(k),
  };
}

const design = (id: number, size = 10): Design => ({
  id,
  imageUrl: `data:image/jpeg;base64,${'a'.repeat(size)}`,
  prompt: 'p',
  settings: { mode: 'text', designType: 'interior', room: 'bedroom', style: 'modern' },
  createdAt: '2026-09-27T00:00:00.000Z',
});

describe('gallery', () => {
  it('adds new designs on top and keeps at most 20', () => {
    const store = memory();
    for (let i = 1; i <= 25; i++) addDesign(store, design(i));
    const list = loadGallery(store);
    expect(list).toHaveLength(MAX);
    expect(list[0]!.id).toBe(25);
    expect(list.at(-1)!.id).toBe(6);
  });

  it('drops the oldest designs when storage is full', () => {
    const store = memory(1200);
    for (let i = 1; i <= 5; i++) addDesign(store, design(i, 300));
    const list = loadGallery(store);
    expect(list.length).toBeLessThan(5);
    expect(list[0]!.id).toBe(5);
  });

  it('removes one design and survives bad data', () => {
    const store = memory();
    writeGallery(store, [design(1), design(2)]);
    expect(removeDesign(store, 1).map((d) => d.id)).toEqual([2]);
    store.setItem('designGallery', '{not json');
    expect(loadGallery(store)).toEqual([]);
  });
});

describe('provider: POST /api/v1/design-studio/generate stays anonymous', () => {
  afterEach(() => vi.unstubAllGlobals());
  const ok = (body: unknown) => new Response(JSON.stringify(body), { status: 200, headers: { 'content-type': 'application/json' } });

  it('sends snake_case mime_type and the image for image-to-image, with no sign-in', async () => {
    const fetchMock = vi.fn(async (_req: Request) => ok({ image: 'data:image/png;base64,AAA' }));
    vi.stubGlobal('fetch', fetchMock);
    expect(await provider.img2img('make it modern', { base64: 'QUJD', mimeType: 'image/png' })).toBe('data:image/png;base64,AAA');
    const req = fetchMock.mock.calls[0]![0];
    expect(req.headers.get('authorization')).toBeNull();
    expect(await req.json()).toEqual({ mode: 'image-to-image', prompt: 'make it modern', image: 'QUJD', mime_type: 'image/png' });
  });

  it('text-to-image sends only mode and prompt', async () => {
    const fetchMock = vi.fn(async (_req: Request) => ok({ image: 'data:image/png;base64,BBB' }));
    vi.stubGlobal('fetch', fetchMock);
    await provider.txt2img('a calm study');
    expect(await fetchMock.mock.calls[0]![0].json()).toEqual({ mode: 'text-to-image', prompt: 'a calm study' });
  });

  it('a failure is the error envelope with a code, read by classifyError', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response(JSON.stringify({ error: { code: 'QUOTA_EXCEEDED', message: 'The image service is at its limit. Try again later.' } }), { status: 429, headers: { 'content-type': 'application/json' } })),
    );
    const e = await provider.txt2img('a calm study').catch((x: unknown) => x);
    expect(e).toBeInstanceOf(ApiError);
    expect(e).toMatchObject({ code: 'QUOTA_EXCEEDED', status: 429 });
    expect(classifyError(e)).toBe('quota');
  });
});
