import { describe, expect, it } from 'vitest';
import { makeTools } from '@/lib/paper/shapes';
import { compactPath } from './compact';

/** Absolute points of each subpath, read the way a browser reads the path. */
function points(d: string): number[][][] {
  const toks = d.match(/[MLZmlz]|-?(?:\d+\.?\d*|\.\d+)/g) ?? [];
  const subs: number[][][] = [];
  let cmd = '';
  let [cx, cy, sx, sy] = [0, 0, 0, 0];
  for (let i = 0; i < toks.length; ) {
    const t = toks[i]!;
    if (/[MLml]/.test(t)) {
      cmd = t;
      i += 1;
      continue;
    }
    if (/[Zz]/.test(t)) {
      [cx, cy] = [sx, sy];
      i += 1;
      continue;
    }
    const [a, b] = [Number(t), Number(toks[i + 1])];
    i += 2;
    const rel = cmd === 'm' || cmd === 'l';
    [cx, cy] = rel ? [cx + a, cy + b] : [a, b];
    if (cmd === 'M' || cmd === 'm') {
      subs.push([]);
      [sx, sy] = [cx, cy];
      cmd = rel ? 'l' : 'L';
    }
    subs.at(-1)!.push([Math.round(cx * 1000) / 1000, Math.round(cy * 1000) / 1000]);
  }
  return subs;
}

describe('compactPath', () => {
  it('keeps every point of the paper tools output', () => {
    const t = makeTools('compact-test');
    const d = t.rect(10, 20, 30, 40) + t.grid(100, 200, 4, 3, 7, 12, 10, 12, 0.3) + t.blob(50, 50, 20, 10, 12, 0.3);
    const c = compactPath(d);
    expect(points(c)).toEqual(points(d));
    expect(c.length).toBeLessThan(d.length * 0.8);
  });

  it('writes short numbers and leaves out repeated letters', () => {
    expect(compactPath('M10 10L20 10L20 20L10 20ZM30 10L40 10.5L40 20Z')).toBe('M10 10l10 0 0 10-10 0zm20 0 10 .5 0 9.5z');
    expect(compactPath('M0.5 0.5L1 0.25')).toBe('M.5.5l.5-.25');
  });

  it('rounds to the asked precision without drift', () => {
    const c = compactPath('M0.4 0.4L1.4 1.4L2.4 2.4L3.6 3.6Z', 0);
    expect(points(c)).toEqual([[[0, 0], [1, 1], [2, 2], [4, 4]]]);
  });

  it('returns other paths unchanged', () => {
    for (const d of ['M0 0C1 1 2 2 3 3Z', 'm0 0l1 1z', 'M0 0A5 5 0 0 1 10 10', '']) expect(compactPath(d)).toBe(d);
  });
});
