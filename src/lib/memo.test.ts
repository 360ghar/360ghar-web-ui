import { describe, expect, it, vi } from 'vitest';
import { memo } from './memo';

describe('memo', () => {
  it('runs fn once for concurrent calls', async () => {
    const fn = vi.fn(async () => 'v');
    const [a, b] = await Promise.all([memo('concurrent', 1000, fn), memo('concurrent', 1000, fn)]);
    expect([a, b]).toEqual(['v', 'v']);
    expect(fn).toHaveBeenCalledTimes(1);
    await memo('concurrent', 1000, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('does not cache a rejection', async () => {
    const fn = vi.fn().mockRejectedValueOnce(new Error('down')).mockResolvedValueOnce('ok');
    await expect(memo('reject', 1000, fn)).rejects.toThrow('down');
    await expect(memo('reject', 1000, fn)).resolves.toBe('ok');
    expect(fn).toHaveBeenCalledTimes(2);
  });
});
