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

describe('homepage vignette evidence', () => {
  it('uses a neutral document scene instead of a verification seal', () => {
    expect(SIZE).toHaveProperty('review');

    const ids = vignetteLayers('review').map((layer) => layer.id);
    expect(ids).toContain('review-paper');
    expect(ids).toContain('review-empty-checklist');
    expect(ids).not.toContain('review-verification-seal');
  });

  it('shows a property listing preview instead of rent status', () => {
    const ids = vignetteLayers('owners').map((layer) => layer.id);
    expect(ids).toContain('owner-listing-preview');
    expect(ids).not.toContain('owner-rent-ledger');
  });

  it('keeps the app illustration to property discovery details', () => {
    const ids = vignetteLayers('app').map((layer) => layer.id);
    expect(ids).toContain('app-listing-card');
    expect(ids).not.toContain('app-manager-chat');
    expect(ids).not.toContain('app-verification-seal');
  });
});
