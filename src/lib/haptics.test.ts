import { describe, expect, it, vi } from 'vitest';
import { haptic } from './haptics';

const motion = (reduce: boolean) => () => ({ matches: reduce });

describe('haptic', () => {
  it('buzzes with the v1 patterns', () => {
    const vibrate = vi.fn(() => true);
    expect(haptic('tap', { navigator: { vibrate }, matchMedia: motion(false) })).toBe(true);
    expect(vibrate).toHaveBeenLastCalledWith([20]);
    expect(haptic('success', { navigator: { vibrate }, matchMedia: motion(false) })).toBe(true);
    expect(vibrate).toHaveBeenLastCalledWith([50, 100, 50]);
  });

  it('does nothing when vibrate is missing', () => {
    expect(haptic('tap', { navigator: {}, matchMedia: motion(false) })).toBe(false);
    expect(haptic('tap', {})).toBe(false);
  });

  it('does nothing when the person prefers reduced motion', () => {
    const vibrate = vi.fn(() => true);
    expect(haptic('success', { navigator: { vibrate }, matchMedia: motion(true) })).toBe(false);
    expect(vibrate).not.toHaveBeenCalled();
  });

  it('works without matchMedia, and never throws', () => {
    expect(haptic('tap', { navigator: { vibrate: () => true } })).toBe(true);
    expect(
      haptic('tap', {
        navigator: {
          vibrate: () => {
            throw new Error('blocked');
          },
        },
      }),
    ).toBe(false);
  });

  it('is safe with the real globals in Node', () => {
    expect(haptic('tap')).toBe(false);
  });
});
