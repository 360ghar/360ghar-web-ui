import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { capped } from './cap';

const later = <T>(ms: number, value: T) => new Promise<T>((resolve) => setTimeout(() => resolve(value), ms));

describe('capped', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('returns the value when it arrives before the cap', async () => {
    const r = capped(later(500, 'ok'), 2000);
    await vi.advanceTimersByTimeAsync(500);
    await expect(r).resolves.toBe('ok');
    expect(vi.getTimerCount()).toBe(0); // the cap timer is cleared
  });

  it('gives the fallback at the cap, not later, when the promise is slow', async () => {
    const r = capped(later(6000, 'slow'), 2000);
    let done = false;
    void r.then(() => (done = true));
    await vi.advanceTimersByTimeAsync(1999);
    expect(done).toBe(false);
    await vi.advanceTimersByTimeAsync(1);
    await expect(r).resolves.toBeNull();
    expect(done).toBe(true);
  });

  it('gives the fallback when the promise rejects, at once', async () => {
    await expect(capped(Promise.reject(new Error('down')), 2000)).resolves.toBeNull();
    await expect(capped(Promise.reject(new Error('down')), 2000, 0)).resolves.toBe(0);
  });

  it('lets the slow promise finish in the background', async () => {
    let finished = false;
    const slow = later(6000, 'x').then((v) => {
      finished = true;
      return v;
    });
    const r = capped(slow, 2000);
    await vi.advanceTimersByTimeAsync(2000);
    await expect(r).resolves.toBeNull();
    expect(finished).toBe(false);
    await vi.advanceTimersByTimeAsync(4000);
    expect(finished).toBe(true);
  });
});
