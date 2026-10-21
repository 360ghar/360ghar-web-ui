import { describe, expect, it } from 'vitest';
import { KEY, loadGallery } from './gallery';

const store = (v: unknown) => ({ getItem: () => JSON.stringify(v), setItem: () => undefined, removeItem: () => undefined });

describe('loadGallery', () => {
  it('migrates the old site record and drops broken ones', () => {
    const list = loadGallery(
      store([
        { id: 1, imageUrl: 'u', prompt: 'p', settings: { designType: 'interior', roomType: 'kitchen', style: 'modern', generationMode: 'image-to-image' }, createdAt: 'x' },
        { id: 2, imageUrl: 'u' },
        { imageUrl: 'u' },
        null,
      ]),
    );
    expect(KEY).toBe('designGallery');
    expect(list).toHaveLength(2);
    expect(list[0]!.settings).toEqual({ mode: 'image', designType: 'interior', room: 'kitchen', style: 'modern' });
    expect(list[1]!.settings.mode).toBe('text');
  });
});
