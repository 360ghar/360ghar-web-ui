import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearSavedLists, saveList } from './infinite';

afterEach(() => vi.unstubAllGlobals());

describe('clearSavedLists', () => {
  it('removes the lists saved for Back and nothing else', () => {
    const disk = new Map([
      ['360ghar:list:/properties?q=a', '{}'],
      ['360ghar:list:/blog', '{}'],
      ['oauth:next', '/'],
      ['360ghar:post-draft', '{}'],
    ]);
    vi.stubGlobal('sessionStorage', {
      get length() {
        return disk.size;
      },
      key: (i: number) => [...disk.keys()][i] ?? null,
      removeItem: (k: string) => void disk.delete(k),
    });
    clearSavedLists();
    expect([...disk.keys()].sort()).toEqual(['360ghar:post-draft', 'oauth:next']);
  });

  it('does not throw when storage is blocked', () => {
    vi.stubGlobal('sessionStorage', {
      get length(): number {
        throw new Error('blocked');
      },
    });
    expect(() => clearSavedLists()).not.toThrow();
  });
});

describe('saveList', () => {
  const saved = { v: 1, at: 0, pages: [], params: [], y: 0 };
  const store = () => {
    const disk = new Map<string, string>();
    vi.stubGlobal('sessionStorage', { setItem: (k: string, v: string) => void disk.set(k, v) });
    return disk;
  };

  it('saves a list for Back', () => {
    const disk = store();
    expect(saveList('/properties?q=a', saved, false)).toBe(true);
    expect([...disk.keys()]).toEqual(['360ghar:list:/properties?q=a']);
  });

  it('saves nothing once the page has seen a no-store response', () => {
    const disk = store();
    expect(saveList('/properties?q=a', saved, true)).toBe(false);
    expect(disk.size).toBe(0);
  });

  it('does not throw when storage is full or blocked', () => {
    vi.stubGlobal('sessionStorage', {
      setItem: () => {
        throw new Error('full');
      },
    });
    expect(saveList('/blog', saved, false)).toBe(false);
  });
});
