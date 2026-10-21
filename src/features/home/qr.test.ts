import { describe, expect, it } from 'vitest';
import { PLAY_QR } from './qr';

/** Rebuilds the module grid from the path runs. */
function grid() {
  const { size, path } = PLAY_QR;
  const dark = Array.from({ length: size }, () => Array<boolean>(size).fill(false));
  for (const m of path.matchAll(/M(\d+) (\d+)h(\d+)v1h-\d+z/g)) {
    const [x, y, w] = [Number(m[1]), Number(m[2]), Number(m[3])];
    for (let i = 0; i < w; i += 1) dark[y]![x + i] = true;
  }
  return dark;
}

describe('PLAY_QR', () => {
  it('is a 37 module symbol whose path holds only runs inside the grid', () => {
    expect(PLAY_QR.size).toBe(37);
    const runs = [...PLAY_QR.path.matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g)];
    expect(runs.map((m) => m[0]).join('')).toHaveLength(PLAY_QR.path.length);
    for (const m of runs) {
      expect(Number(m[1]) + Number(m[3])).toBeLessThanOrEqual(PLAY_QR.size);
      expect(Number(m[2])).toBeLessThan(PLAY_QR.size);
      expect(m[3]).toBe(m[4]);
    }
  });

  it('has the three finder squares: a dark 7 by 7 ring, a light ring inside it and a dark 3 by 3 centre', () => {
    const g = grid();
    const n = PLAY_QR.size;
    for (const [ox, oy] of [
      [0, 0],
      [n - 7, 0],
      [0, n - 7],
    ] as const) {
      for (let y = 0; y < 7; y += 1) {
        for (let x = 0; x < 7; x += 1) {
          const ring = x === 0 || y === 0 || x === 6 || y === 6;
          const centre = x >= 2 && x <= 4 && y >= 2 && y <= 4;
          expect(g[oy + y]![ox + x], `${ox},${oy} at ${x},${y}`).toBe(ring || centre);
        }
      }
    }
  });
});
