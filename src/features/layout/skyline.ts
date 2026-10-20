/** Skyline silhouettes for the top edge of the footer and the foot of the phone menu: the street ends where the page ends. */
import { makeTools } from '@/lib/paper/shapes';

/**
 * Two layers of card: far glass towers with window holes (the page shows
 * through them, like lit windows), and a near row of sector blocks with roof
 * tanks that runs into the floor below. Both in a `width` x `height` box.
 * `windows = false` leaves the holes out, for small, pale strips.
 */
export function skylineLayers(seed = 'footer', width = 1600, height = 120, windows = true): { far: string; near: string } {
  const t = makeTools(`skyline-${seed}`, 0.7);
  const base = height;
  let far = '';
  let x = -10;
  while (x < width + 10) {
    const w = 34 + t.rand() * 40;
    const h = 44 + t.rand() * (height - 50);
    const crown = t.rand();
    if (crown > 0.72) {
      far += t.path([
        [x, base - h + 12],
        [x + w, base - h],
        [x + w, base + 2],
        [x, base + 2],
      ]);
    } else if (crown > 0.5) {
      far += t.path([
        [x + w * 0.3, base - h - 10],
        [x + w * 0.7, base - h - 10],
        [x + w * 0.7, base - h],
        [x + w, base - h],
        [x + w, base + 2],
        [x, base + 2],
        [x, base - h],
        [x + w * 0.3, base - h],
      ]);
    } else {
      far += t.rect(x, base - h, w, h + 2);
    }
    const cols = Math.max(1, Math.floor((w - 12) / 10));
    if (windows) far += t.grid(x + 7, base - h + 16, cols, Math.floor((h - 50) / 13), 4, 7, 6, 6, 0.55);
    x += w + 8 + t.rand() * 30;
  }

  let near = '';
  x = -10;
  while (x < width + 10) {
    const w = 60 + t.rand() * 70;
    const h = 14 + t.rand() * 26;
    near += t.rect(x, base - h, w, h + 2);
    if (t.rand() > 0.35) {
      const tx = x + 10 + t.rand() * (w - 40);
      near += t.path([
        [tx, base - h - 12],
        [tx + 20, base - h - 12],
        [tx + 20, base - h - 5],
        [tx + 17, base - h - 5],
        [tx + 17, base - h + 1],
        [tx + 3, base - h + 1],
        [tx + 3, base - h - 5],
        [tx, base - h - 5],
      ]);
    }
    x += w - 4;
  }
  return { far, near };
}
