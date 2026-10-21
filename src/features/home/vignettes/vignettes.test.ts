import { describe, expect, it } from 'vitest';
import { SIZE, TOP, vignetteLayers } from './vignettes';

/** Every layer path is absolute ("M x yL x y...Z"), so the numbers are x, y pairs. */
function topOf(name: Parameters<typeof vignetteLayers>[0]) {
  let min = Infinity;
  for (const l of vignetteLayers(name)) {
    for (const d of [...l.cut, ...l.solid]) {
      const n = d.match(/-?\d+(?:\.\d+)?/g)!.map(Number);
      for (let i = 1; i < n.length; i += 2) min = Math.min(min, n[i]!);
    }
  }
  return min;
}

describe('app vignette artboard', () => {
  it('starts just above the highest art, with no dead band over the phone', () => {
    const top = TOP.app!;
    const highest = topOf('app');
    expect(highest).toBeGreaterThanOrEqual(top);
    // Room for the 3 unit drop shadow only: at most 4 units of empty space, about 4 px at phone width.
    expect(highest - top).toBeLessThanOrEqual(4);
  });

  it('keeps the bottom edge where it was (y = 420)', () => {
    expect(TOP.app! + SIZE.app[1]).toBe(420);
  });
});
