/**
 * Paper-cut vignettes for the property pages, in the language of the home
 * diorama (`src/features/home/diorama/gurugram.ts`): flat kesar layers,
 * seeded hand-cut edges, one short shadow per layer from the top left.
 */
import { makeTools, type Layer, type Pt } from '@/lib/paper/shapes';

/* ------------------------------------------------------------------ */
/* Map poster: a cut-paper street plan with a pin, under the map button */
/* ------------------------------------------------------------------ */

export const MAP_W = 800;
export const MAP_H = 320;

/** Seeded by the listing id, so each home gets its own street plan that never changes. */
export function mapScene(seed: number | string): Layer[] {
  const t = makeTools(`map-${seed}`, 1.2);
  const r = t.rand;
  // Column and row edges of the blocks. Roads run in the gaps.
  const xs = [-20, 150 + r() * 30, 330 + r() * 30, 520 + r() * 30, 690 + r() * 20, 830];
  const ys = [-20, 96 + r() * 20, 200 + r() * 20, 340];
  const lane = 16;
  const parkAt = [Math.floor(r() * 2) * 3 + 1, Math.floor(r() * 3)] as const;
  const plots: string[] = [];
  const roofs: string[] = [];
  let park = '';
  const trees: string[] = [];
  for (let c = 0; c < xs.length - 1; c += 1) {
    for (let w = 0; w < ys.length - 1; w += 1) {
      const x0 = xs[c]! + lane / 2;
      const x1 = xs[c + 1]! - lane / 2;
      const y0 = ys[w]! + lane / 2;
      const y1 = ys[w + 1]! - lane / 2;
      if (c === parkAt[0] && w === parkAt[1]) {
        park = t.rect(x0, y0, x1 - x0, y1 - y0);
        // Trees on a loose grid, so they spread over the whole park.
        for (let tx = x0 + 18; tx < x1 - 12; tx += 30)
          for (let ty = y0 + 18; ty < y1 - 12; ty += 28) if (r() < 0.7) trees.push(t.oct(tx + (r() - 0.5) * 10, ty + (r() - 0.5) * 8, 8 + r() * 4));
        continue;
      }
      // Each block is cut into two or three plots with a thin gap.
      const n = 2 + Math.floor(r() * 2);
      const pw = (x1 - x0 - (n - 1) * 6) / n;
      for (let k = 0; k < n; k += 1) {
        const px = x0 + k * (pw + 6);
        plots.push(t.rect(px, y0, pw, y1 - y0));
        // A building footprint on most plots, some with a courtyard cut out.
        if (r() < 0.8) {
          const bw = pw * (0.5 + r() * 0.3);
          const bh = (y1 - y0) * (0.45 + r() * 0.3);
          const bx = px + (pw - bw) / 2;
          const by = y0 + (y1 - y0 - bh) / 2;
          roofs.push(t.rect(bx, by, bw, bh) + (bw > 60 && bh > 40 && r() < 0.5 ? t.rect(bx + bw * 0.3, by + bh * 0.3, bw * 0.4, bh * 0.4) : ''));
        }
      }
    }
  }
  // The sector road: a wide diagonal band with a dashed centre line cut out.
  const road: Pt[] = [
    [-20, 262],
    [820, 58],
    [820, 92],
    [-20, 296],
  ];
  let dashes = '';
  for (let k = 0; k < 16; k += 1) {
    const x = -10 + k * 54;
    const y = 279 - (x + 20) * (204 / 840);
    dashes += t.path([
      [x, y - 1.6],
      [x + 26, y - 1.6 - 6.3],
      [x + 26, y + 1.6 - 6.3],
      [x, y + 1.6],
    ]);
  }
  return [
    { id: 'plots', fill: 'var(--color-kesar-100)', depth: 0, shadow: 'rgb(226 91 0 / 0.3)', cut: plots, solid: [] },
    { id: 'park', fill: 'var(--color-kesar-200)', depth: 0, shadow: 'rgb(226 91 0 / 0.25)', cut: [park], solid: [] },
    { id: 'trees', fill: 'var(--color-kesar-300)', depth: 0, shadow: 'rgb(181 70 0 / 0.3)', cut: [], solid: trees },
    { id: 'roofs', fill: 'var(--color-kesar-200)', depth: 0, shadow: 'rgb(181 70 0 / 0.35)', cut: roofs, solid: [] },
    { id: 'road', fill: 'var(--color-paper)', depth: 0, shadow: 'rgb(181 70 0 / 0.3)', cut: [t.path(road) + dashes], solid: [] },
  ];
}

/** The pin sits in the middle of the map poster, as its own layer so it casts the darkest shadow. */
export function mapPin(): Layer {
  const t = makeTools('map-pin', 0.5);
  const cx = MAP_W / 2;
  const tip = MAP_H / 2 + 26;
  const pin: Pt[] = [
    [cx, tip],
    [cx - 19, tip - 30],
    [cx - 22, tip - 46],
    [cx - 15, tip - 61],
    [cx, tip - 68],
    [cx + 15, tip - 61],
    [cx + 22, tip - 46],
    [cx + 19, tip - 30],
  ];
  return { id: 'pin', fill: 'var(--color-kesar-700)', depth: 0, shadow: 'rgb(94 33 0 / 0.45)', cut: [t.path(pin) + t.oct(cx, tip - 46, 8)], solid: [] };
}

/* ------------------------------------------------------------------ */
/* Building elevation: which floor the home is on                        */
/* ------------------------------------------------------------------ */

export const BLD_W = 120;
export const BLD_H = 168;

/** Drawing units from the ground line up to the band of the home's floor; the floor marker rises this far. */
export function buildingRise(floor: number, total: number): number {
  const floors = Math.max(1, Math.min(total, 40));
  return Math.max(0, Math.min(floor, floors - 1)) * Math.min(30, 126 / floors);
}

export function buildingScene(floor: number, total: number): Layer[] {
  const t = makeTools(`bld-${total}`, 0.5);
  const floors = Math.max(1, Math.min(total, 40));
  const at = Math.max(0, Math.min(floor, floors - 1));
  const groundY = 154;
  const fh = Math.min(30, 126 / floors);
  const x = 30;
  const w = 62;
  const top = groundY - floors * fh;
  // Windows per floor: tall slits on low-rise, small squares on towers.
  const cols = 3;
  const winW = 9;
  const gap = (w - cols * winW) / (cols + 1);
  const winH = Math.max(2, fh * 0.46);
  const windows = (row: number) => {
    const y = groundY - (row + 1) * fh + (fh - winH) / 2;
    // Towers: one slit per floor, so the floors can still be counted at a small size.
    if (fh < 10) return t.rect(x + 7, y, w - 14, winH);
    let d = '';
    for (let c = 0; c < cols; c += 1) d += t.rect(x + gap + c * (winW + gap), y, winW, winH);
    return d;
  };
  let body = t.path([
    [x - 3, top - 5],
    [x + w + 3, top - 5],
    [x + w + 3, top],
    [x + w, top],
    [x + w, groundY + 2],
    [x, groundY + 2],
    [x, top],
    [x - 3, top],
  ]);
  for (let row = 0; row < floors; row += 1) if (row !== at) body += windows(row);
  const bandY = groundY - (at + 1) * fh;
  const band = t.rect(x - 1, bandY + 0.6, w + 2, fh - 1.2) + windows(at);
  // A notched tag points at the home's floor from the right.
  const ty = bandY + fh / 2;
  const tag = t.path([
    [x + w + 6, ty],
    [x + w + 12, ty - 6],
    [x + w + 24, ty - 6],
    [x + w + 24, ty + 6],
    [x + w + 12, ty + 6],
  ]);
  const ground = t.path([
    [-4, groundY],
    [40, groundY - 1],
    [90, groundY + 1],
    [BLD_W + 4, groundY - 1],
    [BLD_W + 4, BLD_H + 4],
    [-4, BLD_H + 4],
  ]);
  return [
    { id: 'bld', fill: 'var(--color-kesar-200)', depth: 0, shadow: 'rgb(226 91 0 / 0.3)', cut: [body], solid: [] },
    { id: 'tree', fill: 'var(--color-kesar-300)', depth: 0, shadow: 'rgb(181 70 0 / 0.3)', cut: [], solid: [t.blob(14, groundY - 22, 11, 15, 9, 0.35), t.rect(12.6, groundY - 10, 3, 12)] },
    { id: 'home', fill: 'var(--color-kesar-500)', depth: 0, shadow: 'rgb(138 51 0 / 0.4)', cut: [band], solid: [tag] },
    { id: 'ground', fill: 'var(--color-kesar-700)', depth: 0, shadow: 'rgb(94 33 0 / 0.45)', cut: [ground], solid: [] },
  ];
}

/* ------------------------------------------------------------------ */
/* Empty tour: a room with a 360° camera on a tripod, not yet shot       */
/* ------------------------------------------------------------------ */

export const TOUR_W = 320;
export const TOUR_H = 200;

export function tourScene(): Layer[] {
  const t = makeTools('tour-room', 0.6);
  // The back wall has a window; Gurugram's towers show through it.
  const back = t.rect(62, 26, 196, 110) + t.rect(150, 44, 76, 58);
  let view = '';
  let vx = 146;
  for (const h of [30, 44, 22, 52, 34, 26]) {
    view += t.rect(vx, 104 - h, 12, h + 4);
    vx += 14;
  }
  const mullions = t.rect(186.5, 44, 3, 58) + t.rect(150, 71.5, 76, 3);
  const side =
    t.path([
      [-4, -4],
      [62, 26],
      [62, 136],
      [-4, 204],
    ]) +
    t.path([
      [258, 26],
      [324, -4],
      [324, 204],
      [258, 136],
    ]);
  const floor = t.path([
    [-4, 204],
    [62, 136],
    [258, 136],
    [324, 204],
  ]);
  // Tripod legs and the camera with two lenses.
  const legs = [
    t.path([
      [158, 104],
      [162, 104],
      [134, 180],
      [129, 180],
    ]),
    t.path([
      [158.5, 104],
      [161.5, 104],
      [162, 184],
      [158, 184],
    ]),
    t.path([
      [158, 104],
      [162, 104],
      [191, 180],
      [186, 180],
    ]),
  ];
  const camera = t.oct(160, 94, 11) + t.oct(160, 94, 4.2);
  // A cut arrow circling the camera: the 360° turn.
  // It sweeps three quarters of a flat ellipse round the tripod, then ends in a head.
  const ring: Pt[] = [];
  const inner: Pt[] = [];
  for (let k = 0; k <= 14; k += 1) {
    const a = ((120 + (k * 270) / 14) * Math.PI) / 180;
    ring.push([160 + Math.cos(a) * 52, 132 + Math.sin(a) * 15]);
    inner.push([160 + Math.cos(a) * 46, 132 + Math.sin(a) * 10.5]);
  }
  const [ex, ey] = ring[ring.length - 1]!;
  const [ix, iy] = inner[inner.length - 1]!;
  const arrow = t.path([...ring, [ex + 6, ey + 3], [(ex + ix) / 2 - 6, ey + 14], [ix - 8, iy + 1], ...inner.reverse()]);
  return [
    { id: 'view', fill: 'var(--color-kesar-200)', depth: 0, shadow: 'transparent', cut: [view], solid: [] },
    { id: 'wall', fill: 'var(--color-kesar-100)', depth: 0, shadow: 'rgb(226 91 0 / 0.25)', cut: [back], solid: [mullions] },
    { id: 'side', fill: 'var(--color-kesar-200)', depth: 0, shadow: 'rgb(226 91 0 / 0.3)', cut: [side], solid: [] },
    { id: 'floor', fill: 'var(--color-kesar-300)', depth: 0, shadow: 'rgb(181 70 0 / 0.3)', cut: [floor], solid: [] },
    { id: 'tripod', fill: 'var(--color-ink-800)', depth: 0, shadow: 'rgb(94 33 0 / 0.45)', cut: [camera], solid: legs },
    { id: 'turn', fill: 'var(--color-kesar-600)', depth: 0, shadow: 'rgb(94 33 0 / 0.45)', cut: [arrow], solid: [] },
  ];
}
