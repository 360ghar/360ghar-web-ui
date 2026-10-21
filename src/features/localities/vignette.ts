/**
 * Paper-cut place vignettes: a small diorama for each kind of place (sector,
 * society, project, township, locality, road, village, city, and the office,
 * metro, hospital, mall and industrial landmarks of the near pages).
 *
 * Same language as the home diorama (features/home/diorama/gurugram.ts):
 * flat kesar layers, far to near, each cut by hand with a seeded jitter and
 * one short shadow from a top-left light. The seed is the place slug, so each
 * place looks a little different and always the same on every render.
 *
 * Coordinate space: 1600 x 400. The street is at y = G. The subject sits in
 * the middle (x 440 to 1160), which is the part a phone shows.
 */
import { rng } from '@/lib/paper/cut';
import { makeTools, type Layer, type Pt } from '@/lib/paper/shapes';

export const VW = 1600;
export const VH = 400;
const G = 346;
const K = 374;
const B = VH + 10;

export type PlaceKind =
  | 'sector'
  | 'society'
  | 'project'
  | 'township'
  | 'locality'
  | 'road'
  | 'village'
  | 'city'
  | 'delhi'
  | 'noida'
  | 'faridabad'
  | 'ghaziabad'
  | 'office'
  | 'industrial'
  | 'metro'
  | 'hospital'
  | 'mall'
  | 'directory';

/** Entity type (localities.json) to vignette kind. */
export function kindForEntity(entityType: string): PlaceKind {
  const map: Record<string, PlaceKind> = { sector: 'sector', society: 'society', project: 'project', township: 'township', road: 'road', village: 'village', phase: 'locality', locality: 'locality' };
  return map[entityType] ?? 'locality';
}

/** Office landmark type (office-landmarks.json) to vignette kind. */
export function kindForLandmark(type: string, slug: string): PlaceKind {
  if (slug === 'hero-honda-chowk') return 'road';
  const map: Record<string, PlaceKind> = { it_hub: 'office', corporate: 'office', industrial: 'industrial', transit: 'metro', hospital: 'hospital', commercial: 'mall' };
  return map[type] ?? 'city';
}

type Tools = ReturnType<typeof makeTools>;
type Crown = 'flat' | 'slantL' | 'slantR' | 'step' | 'spire' | 'notch';
type Part = { cut: string[]; solid: string[] };

export type Scene = {
  layers: Layer[];
  /** A signboard with text cut into it (sector number). */
  sign?: { cx: number; cy: number; text: string };
  /** Pivot of the crane jib, for its slow sway. */
  pivot?: Pt;
};

const LAYERS = [
  { id: 'sky', fill: 'var(--color-kesar-50)', shadow: 'transparent' },
  { id: 'clouds', fill: 'var(--color-kesar-50)', shadow: 'transparent' },
  { id: 'far', fill: 'var(--color-kesar-200)', shadow: 'rgb(226 91 0 / 0.35)' },
  { id: 'mid', fill: 'var(--color-kesar-300)', shadow: 'rgb(181 70 0 / 0.35)' },
  { id: 'near', fill: 'var(--color-kesar-500)', shadow: 'rgb(138 51 0 / 0.4)' },
  { id: 'jib', fill: 'var(--color-kesar-500)', shadow: 'rgb(138 51 0 / 0.4)' },
  { id: 'street', fill: 'var(--color-kesar-700)', shadow: 'rgb(94 33 0 / 0.45)' },
  { id: 'kerb', fill: 'var(--color-kesar-900)', shadow: 'rgb(47 15 2 / 0.5)' },
] as const;

type LayerId = (typeof LAYERS)[number]['id'];

/* ------------------------------------------------------------------ */
/* Primitives. Each returns path data for one layer.                   */
/* ------------------------------------------------------------------ */

/**
 * A small straight cut (window, slit, slat) as a compact path: whole units,
 * nudged by up to one unit so a row does not look ruled. Small holes need no
 * corner jitter, and this keeps a scene near 10 KB.
 */
function hole(t: Tools, x: number, y: number, w: number, h: number): string {
  const nx = Math.round(x + (t.rand() - 0.5) * 2);
  const ny = Math.round(y + (t.rand() - 0.5) * 2);
  const W = Math.round(w);
  return `M${nx} ${ny}h${W}v${Math.round(h)}h${-W}z`;
}

/** Window holes centred in a box. */
function windows(t: Tools, x: number, w: number, y0: number, y1: number, cw: number, ch: number, gx: number, gy: number, skip: number) {
  const cols = Math.max(1, Math.floor((w - 16 + gx) / (cw + gx)));
  const rows = Math.max(1, Math.floor((y1 - y0 + gy) / (ch + gy)));
  const x0 = x + (w - (cols * (cw + gx) - gx)) / 2;
  let d = '';
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) if (!(skip > 0 && t.rand() < skip)) d += hole(t, x0 + c * (cw + gx), y0 + r * (ch + gy), cw, ch);
  return d;
}

function tower(t: Tools, x: number, w: number, top: number, crown: Crown, skip = 0.3): string {
  let o: Pt[];
  switch (crown) {
    case 'slantL':
      o = [[x, top + 30], [x + w, top], [x + w, B], [x, B]];
      break;
    case 'slantR':
      o = [[x, top], [x + w, top + 28], [x + w, B], [x, B]];
      break;
    case 'step':
      o = [[x + w * 0.3, top - 26], [x + w * 0.7, top - 26], [x + w * 0.7, top], [x + w, top], [x + w, B], [x, B], [x, top], [x + w * 0.3, top]];
      break;
    case 'spire':
      o = [[x + w / 2 - 2, top - 52], [x + w / 2 + 2, top - 52], [x + w / 2 + 3, top - 14], [x + w, top], [x + w, B], [x, B], [x, top], [x + w / 2 - 3, top - 14]];
      break;
    case 'notch':
      o = [[x, top], [x + w * 0.38, top], [x + w * 0.5, top + 18], [x + w * 0.62, top], [x + w, top], [x + w, B], [x, B]];
      break;
    default:
      o = [[x + w * 0.62, top - 32], [x + w * 0.66, top - 32], [x + w * 0.66, top], [x + w, top], [x + w, B], [x, B], [x, top], [x + w * 0.62, top]];
  }
  const y0 = top + (crown === 'slantL' || crown === 'slantR' ? 40 : 18);
  return t.path(o) + windows(t, x, w, y0, G - 22, 7, 12, 10, 12, skip);
}

/** Apartment slab with roof tanks and balcony bands, as on the home diorama. */
function slab(t: Tools, x: number, w: number, top: number, tanks = 1): string {
  let d = t.rect(x, top, w, B - top);
  for (let i = 0; i < tanks; i += 1) {
    const tx = x + 14 + i * ((w - 44) / Math.max(1, tanks));
    d += t.path([[tx, top - 20], [tx + 24, top - 20], [tx + 24, top - 7], [tx + 20, top - 7], [tx + 20, top + 1], [tx + 4, top + 1], [tx + 4, top - 7], [tx, top - 7]]);
  }
  const rows = Math.floor((G - top - 14) / 26);
  for (let r = 0; r < rows; r += 1) {
    const y = top + 14 + r * 26;
    d += hole(t, x + 10, y, w - 20, 4);
    d += windows(t, x, w, y + 9, y + 18, 10, 9, 14, 0, 0.45);
  }
  return d;
}

/** Builder floor: stilt parking, three or four floors, balconies, a tank. */
function builderFloor(t: Tools, x: number, w: number, floors: number): string {
  const fh = 30;
  const stilt = 24;
  const top = G - stilt - floors * fh;
  let d = t.rect(x, top, w, B - top);
  // Stilt bays, open to the street.
  const bay = (w - 12) / 3;
  for (let i = 0; i < 3; i += 1) d += t.rect(x + 6 + i * bay + 4, G - stilt + 4, bay - 8, stilt);
  for (let f = 0; f < floors; f += 1) {
    const y = top + f * fh;
    d += hole(t, x + 10, y + 7, 14, 13) + hole(t, x + w * 0.45, y + 7, 14, 13) + hole(t, x + w - 24, y + 7, 14, 13);
    d += hole(t, x + 8, y + fh - 7, w * 0.6, 3);
  }
  // Stair head and a water tank on the roof.
  d += t.rect(x + 8, top - 14, 26, 15);
  const tx = x + w - 38;
  d += t.path([[tx, top - 18], [tx + 24, top - 18], [tx + 24, top - 6], [tx + 20, top - 6], [tx + 20, top + 1], [tx + 4, top + 1], [tx + 4, top - 6], [tx, top - 6]]);
  return d;
}

/** Low house with a parapet, door, window and a roof tank (villages, old colonies). */
function house(t: Tools, x: number, w: number, h: number): string {
  const top = G - h;
  let d = t.rect(x, top, w, B - top);
  d += t.rect(x + w * 0.18, G - 34, 16, 34);
  d += t.rect(x + w * 0.55, top + 14, 18, 14);
  d += t.path([[x + w - 30, top - 16], [x + w - 8, top - 16], [x + w - 8, top - 4], [x + w - 12, top - 4], [x + w - 12, top + 1], [x + w - 26, top + 1], [x + w - 26, top - 4], [x + w - 30, top - 4]]);
  return d;
}

/** Two-storey villa with one pitched wing. */
function villa(t: Tools, x: number, w: number): string {
  const top = G - 66;
  let d = t.path([[x, B], [x, top], [x + w * 0.42, top], [x + w * 0.42, top - 22], [x + w * 0.71, top - 44], [x + w, top - 22], [x + w, B]]);
  d += t.rect(x + 10, top + 12, 16, 14) + t.rect(x + w * 0.52, top - 8, 16, 16) + t.rect(x + w * 0.52, top + 22, 26, 44);
  d += t.rect(x + 10, top + 40, 16, 14);
  return d;
}

function tree(t: Tools, p: Part, cx: number, h: number, rx: number) {
  const { trunk, canopy } = t.tree(cx, G, h, rx, {
    trunk: [-6, -4, -26, -22, -1, 3, 8, 5, 7],
    foot: 2,
    canopy: [22, 34, 18, 0.34],
    gaps: [[-0.4, 15, 7, 5, 5, 0.3], [0.34, 25, 8, 5, 5, 0.3]],
  });
  p.solid.push(trunk);
  p.cut.push(canopy);
}

/** A wide, lumpy canopy (peepal, banyan): overlapping lobes, each its own sheet, with leaf gaps. */
function canopy(t: Tools, p: Part, cx: number, cy: number, rx: number) {
  const lobes: [number, number, number, number][] = [[-0.55, 0.12, 0.5, 0.62], [0.5, 0.18, 0.52, 0.6], [-0.1, -0.22, 0.56, 0.66], [0.05, 0.3, 0.62, 0.5]];
  lobes.forEach(([dx, dy, sx, sy], i) => {
    const x = cx + dx * rx;
    const y = cy + dy * rx * 0.5;
    const gap = i === 2 ? t.blob(x - rx * 0.12, y - 4, 9, 6, 6, 0.3) + t.blob(x + rx * 0.2, y + 10, 8, 5, 6, 0.3) : '';
    p.cut.push(t.blob(x, y, rx * sx, rx * sy * 0.62, 22, 0.22) + gap);
  });
}

function lamp(t: Tools, p: Part, x: number, h = 142) {
  p.solid.push(t.path([[x - 2.5, G + 2], [x - 2.5, G - h], [x + 34, G - h - 11], [x + 40, G - h - 5], [x + 40, G - h + 1], [x + 23, G - h + 1], [x + 23, G - h - 2], [x + 2.5, G - h + 4], [x + 2.5, G + 2]]));
}

function shops(t: Tools, x: number, n: number, w = 92): string {
  let d = '';
  for (let i = 0; i < n; i += 1) {
    const sx = x + i * (w + 6);
    d += t.rect(sx, G - 74, w, 75);
    for (let k = 0; k < 5; k += 1) d += hole(t, sx + 10, G - 52 + k * 9, w - 20, 3);
    d += hole(t, sx + 12, G - 66, w - 24, 10);
  }
  return d;
}

/** Ground sheet with a rough top edge. */
function groundSheet(t: Tools, y: number, step: number, bump: number): string {
  const pts: Pt[] = [[-20, y]];
  for (let x = step / 2; x < VW; x += step) pts.push([x, y - bump / 2 + t.rand() * bump]);
  pts.push([VW + 20, y], [VW + 20, B], [-20, B]);
  return t.path(pts);
}

/** A zebu cow facing right, the home diorama's cow at scale `s`. */
function cow(t: Tools, x: number, s: number): string {
  const P: Pt[] = [[12, -58], [26, -66], [36, -76], [50, -66], [112, -62], [126, -70], [138, -78], [144, -88], [147, -78], [152, -90], [154, -76], [166, -62], [168, -52], [158, -50], [142, -58], [128, -44], [126, -26], [119, -26], [116, 0], [109, 0], [108, -24], [102, -24], [102, 0], [95, 0], [94, -26], [44, -26], [42, 0], [35, 0], [34, -24], [28, -24], [28, 0], [21, 0], [18, -30], [12, -44], [4, -20], [0, -22], [8, -50]];
  return t.path(P.map(([px, py]) => [x + px * s, G + py * s] as Pt));
}

/** Viaduct with piers and a three-coach train (Rapid Metro). */
function metroLine(t: Tools, beamTop: number, trainX: number): string[] {
  const out: string[] = [];
  let beam = t.path([[-20, beamTop], [VW + 20, beamTop - 6], [VW + 20, beamTop + 16], [VW - 10, beamTop + 22], [-20, beamTop + 28]]);
  for (let x = 12; x < VW; x += 48) beam += hole(t, x, beamTop - 9 - (x / VW) * 6, 4, 9);
  out.push(beam);
  for (const c of [150, 560, 970, 1380]) {
    const y0 = beamTop + 25 - (c / VW) * 6;
    out.push(t.path([[c - 44, y0], [c + 44, y0], [c + 20, y0 + 20], [c + 15, B], [c - 15, B], [c - 20, y0 + 20]]));
  }
  const coach = (x: number, w: number, nose: boolean) => {
    const y = beamTop - 50 - (x / VW) * 6;
    const o: Pt[] = nose ? [[x, y], [x + w - 26, y], [x + w - 5, y + 16], [x + w, y + 41], [x, y + 41]] : [[x, y + 3], [x + 3, y], [x + w - 3, y], [x + w, y + 3], [x + w, y + 41], [x, y + 41]];
    let d = t.path(o);
    d += windows(t, x + 6, w - (nose ? 30 : 12), y + 9, y + 22, 15, 13, 8, 0, 0);
    d += hole(t, x + w * 0.32, y + 7, 9, 28);
    if (!nose) d += hole(t, x + w * 0.7, y + 7, 9, 28);
    d += hole(t, x + 6, y + 30, w - (nose ? 24 : 12), 3);
    return d;
  };
  out.push(coach(trainX, 150, false) + coach(trainX + 156, 150, false) + coach(trainX + 312, 162, true));
  return out;
}

/**
 * Joins paths of one layer whose x ranges do not touch into one path, so a
 * layer is a few nodes instead of dozens. Shapes that overlap stay separate
 * (in one even-odd path an overlap would turn into a hole).
 */
function mergeDisjoint(ds: string[]): string[] {
  const span = (d: string): [number, number] => {
    const xs = [...d.matchAll(/[ML](-?[\d.]+) /g)].map((m) => Number(m[1]));
    return [Math.min(...xs), Math.max(...xs)];
  };
  let left = ds.map((d) => ({ d, s: span(d) })).sort((a, b) => a.s[0] - b.s[0]);
  const out: string[] = [];
  while (left.length) {
    let end = -Infinity;
    let group = '';
    const rest: typeof left = [];
    for (const x of left) {
      if (x.s[0] > end + 3) {
        group += x.d;
        end = x.s[1];
      } else rest.push(x);
    }
    out.push(group);
    left = rest;
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* Scenes.                                                             */
/* ------------------------------------------------------------------ */

export function placeScene(kind: PlaceKind, seed: string, signText?: string): Scene {
  const r = rng(`${kind}:${seed}`);
  const pick = <T>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const between = (a: number, b: number) => a + r() * (b - a);
  const T = Object.fromEntries(LAYERS.map((l) => [l.id, makeTools(`${kind}:${seed}:${l.id}`, l.id === 'sky' || l.id === 'clouds' ? 0.6 : 1)])) as Record<LayerId, Tools>;
  const P = Object.fromEntries(LAYERS.map((l): [LayerId, Part] => [l.id, { cut: [], solid: [] }])) as Record<LayerId, Part>;
  const scene: Scene = { layers: [] };

  /* Sky: a sun on one side, two cloud strips. */
  const sunLeft = r() < 0.35;
  const sx = sunLeft ? between(180, 420) : between(1180, 1420);
  const sun: Pt[] = [];
  for (let i = 0; i < 36; i += 1) {
    const a = (i / 36) * Math.PI * 2;
    sun.push([sx + Math.cos(a) * 64, 104 + Math.sin(a) * 64]);
  }
  P.sky.cut.push(T.sky.path(sun));
  P.clouds.cut.push(T.clouds.cloud(between(560, 760), between(52, 78), 190), T.clouds.cloud(between(1000, 1200), between(150, 180), 150), T.clouds.cloud(between(40, 200), between(170, 200), 170));

  /* Far layer: a low, seeded skyline across the whole width. */
  const farTops = kind === 'village' || kind === 'delhi' || kind === 'faridabad' ? [230, 290] : kind === 'city' || kind === 'office' || kind === 'noida' ? [70, 170] : [140, 240];
  // Faridabad draws the Aravalli ridge in this layer instead.
  for (let x = -10; x < VW && kind !== 'faridabad'; ) {
    const w = between(46, 104);
    P.far.cut.push(tower(T.far, x, w, between(farTops[0]!, farTops[1]!), pick(['flat', 'slantL', 'slantR', 'step', 'notch'] as const), 0.86));
    x += w + between(6, 44);
  }

  /* Street and kerb sheets. */
  P.street.cut.push(groundSheet(T.street, G, 80, 4));
  let kerb = groundSheet(T.kerb, K, 120, 5);
  for (let x = between(10, 60); x < VW; x += 170) kerb += hole(T.kerb, x, K + 16, 64, 4);
  P.kerb.cut.push(kerb);

  const trees = (xs: number[]) => xs.forEach((x) => tree(T.street, P.street, x, between(150, 196), between(62, 88)));

  switch (kind) {
    case 'sector': {
      // Sector blocks in rows, a sector signboard at the kerb, a lamp and gulmohar trees.
      for (let x = -20; x < VW; ) {
        const w = between(130, 200);
        P.mid.cut.push(slab(T.mid, x, w, between(170, 226), 1 + Math.floor(r() * 2)));
        x += w + between(14, 30);
      }
      P.near.cut.push(shops(T.near, 180, 3), shops(T.near, 1180, 2));
      // Signboard on two posts. The text is cut in by the component.
      const bx = 800;
      const by = 214;
      P.street.cut.push(T.street.path([[bx, by], [bx + 220, by - 3], [bx + 222, by + 58], [bx + 2, by + 60]]));
      P.street.solid.push(T.street.rect(bx + 22, by + 58, 7, G - by - 56), T.street.rect(bx + 192, by + 57, 7, G - by - 55));
      scene.sign = { cx: bx + 111, cy: by + 29, text: signText ?? '' };
      trees([560, 1120]);
      lamp(T.street, P.street, 1400);
      lamp(T.street, P.street, 120);
      break;
    }
    case 'society': {
      // Three or four twin towers behind a boundary wall with a gate and a guard booth.
      const n = r() < 0.5 ? 3 : 4;
      const tw = between(96, 118);
      const gap = between(46, 70);
      const span = n * tw + (n - 1) * gap;
      const crown = pick(['step', 'flat', 'notch'] as const);
      const top = between(66, 96);
      for (let i = 0; i < n; i += 1) P.mid.cut.push(tower(T.mid, 800 - span / 2 + i * (tw + gap), tw, top + (i % 2) * 8, crown, 0.2));
      trees([640, 960]);
      // Boundary wall with pillar caps, broken by the gate in the middle.
      const wallTop = G - 46;
      let wall = '';
      for (const [a, b] of [[-20, 730], [870, VW + 20]] as const) {
        wall += T.near.rect(a, wallTop, b - a, G - wallTop + 12);
        for (let x = a + 30; x < b - 10; x += 64) wall += T.near.rect(x, wallTop - 8, 14, 9);
      }
      P.near.cut.push(wall);
      // Gate: two pillars, a beam with a slit, and a boom barrier.
      P.near.cut.push(T.near.rect(716, wallTop - 58, 20, 104 + 12) + T.near.rect(864, wallTop - 58, 20, 104 + 12));
      P.near.cut.push(T.near.rect(708, wallTop - 76, 184, 20) + T.near.rect(724, wallTop - 70, 152, 4));
      P.near.solid.push(T.near.rect(736, G - 30, 104, 5));
      // Guard booth with a window.
      P.near.cut.push(T.near.path([[900, G - 68], [960, G - 68], [964, G - 60], [956, G - 60], [956, G + 8], [904, G + 8], [904, G - 60], [896, G - 60]]) + T.near.rect(914, G - 50, 30, 18));
      lamp(T.street, P.street, 300);
      lamp(T.street, P.street, 1300);
      break;
    }
    case 'project': {
      // Two finished towers, one tower under construction, a tower crane and a site hoarding.
      P.mid.cut.push(tower(T.mid, 470, 108, between(80, 110), 'slantR'), tower(T.mid, 1000, 118, between(70, 100), 'step'));
      // Frame under construction: slabs and columns, the top floors still open.
      const fx = 690;
      const fw = 220;
      const floors = 8;
      const fh = 24;
      const top = G - floors * fh;
      for (let f = 0; f <= floors; f += 1) P.mid.solid.push(T.mid.rect(fx - 6, top + f * fh, fw + 12, 5));
      for (let c = 0; c < 5; c += 1) {
        const cx = fx + (c * fw) / 4 - 3;
        const from = c === 0 || c === 4 ? top : top + fh * (c === 2 ? 0 : 1);
        P.mid.solid.push(T.mid.rect(cx, from, 7, G - from));
      }
      // Tower crane: lattice mast, jib with a counterweight, a hook on a line.
      const mx = 930;
      const mTop = 70;
      let mast = T.near.rect(mx, mTop, 16, G - mTop + 4);
      for (let y = mTop + 8; y < G - 12; y += 22) mast += T.near.path([[mx + 3, y], [mx + 13, y + 9], [mx + 3, y + 18]]);
      P.near.cut.push(mast);
      P.near.solid.push(T.near.path([[mx - 2, mTop], [mx + 8, mTop - 26], [mx + 18, mTop]]));
      let jib = T.jib.rect(mx - 150, mTop - 2, 470, 11);
      for (let x = mx - 140; x < mx + 300; x += 20) jib += T.jib.path([[x, mTop + 7], [x + 8, mTop], [x + 16, mTop + 7]]);
      P.jib.cut.push(jib);
      P.jib.solid.push(T.jib.rect(mx - 146, mTop + 8, 44, 22), T.jib.rect(mx + 20, mTop + 8, 20, 18));
      P.jib.solid.push(T.jib.path([[mx + 8, mTop - 26], [mx - 140, mTop], [mx - 138, mTop + 1], [mx + 8, mTop - 24], [mx + 300, mTop], [mx + 300, mTop + 1]]));
      P.jib.solid.push(T.jib.rect(mx + 240, mTop + 9, 2.5, 120), T.jib.path([[mx + 234, mTop + 128], [mx + 248, mTop + 128], [mx + 248, mTop + 140], [mx + 244, mTop + 146], [mx + 238, mTop + 140]]));
      scene.pivot = [mx + 8, mTop];
      // Site hoarding along the street, with cut stripes.
      let hoard = T.street.rect(420, G - 62, 740, 62);
      for (let x = 450; x < 1140; x += 64) hoard += T.street.path([[x, G - 50], [x + 22, G - 50], [x + 36, G - 14], [x + 14, G - 14]]);
      P.street.cut.push(hoard);
      trees([230, 1380]);
      break;
    }
    case 'township': {
      // Towers far back, villas and row houses in front, a clock tower, many trees.
      for (const x of [240, 1180, 1340]) P.mid.cut.push(tower(T.mid, x, between(80, 100), between(110, 150), pick(['flat', 'step', 'slantL'] as const)));
      // Clock tower of the club house.
      P.mid.cut.push(T.mid.path([[770, 120], [800, 92], [830, 120], [830, B], [770, B]]) + T.mid.oct(800, 146, 14) + T.mid.rect(784, 190, 32, 6));
      let row = '';
      for (let x = 430; x < 1160; x += 124) row += villa(T.near, x, 110);
      P.near.cut.push(row);
      trees([150, 400, 700, 1000, 1250, 1480]);
      break;
    }
    case 'locality': {
      // Builder floors in a row, a market strip, an auto-rickshaw and a gulmohar tree.
      for (let x = -30; x < VW; ) {
        const w = between(118, 150);
        P.mid.cut.push(builderFloor(T.mid, x, w, 3 + Math.floor(r() * 2)));
        x += w + between(8, 20);
      }
      P.near.cut.push(shops(T.near, 1010, 3));
      trees([520, 940]);
      lamp(T.street, P.street, 760);
      // Auto-rickshaw on the street, facing left (home diorama shape, smaller).
      const ax = 620;
      const ay = G + 26;
      P.street.cut.push(
        T.street.path([[ax + 3, ay - 13], [ax, ay - 25], [ax + 6, ay - 43], [ax + 13, ay - 46], [ax + 25, ay - 77], [ax + 47, ay - 84], [ax + 111, ay - 83], [ax + 123, ay - 77], [ax + 126, ay - 33], [ax + 123, ay - 13]]) +
          T.street.path([[ax + 28, ay - 71], [ax + 49, ay - 75], [ax + 50, ay - 44], [ax + 19, ay - 44]]) +
          T.street.path([[ax + 58, ay - 75], [ax + 113, ay - 74], [ax + 114, ay - 40], [ax + 58, ay - 40]]),
      );
      P.kerb.cut.push(T.kerb.oct(ax + 22, ay - 4, 12) + T.kerb.oct(ax + 22, ay - 4, 4.5), T.kerb.oct(ax + 104, ay - 4, 12) + T.kerb.oct(ax + 104, ay - 4, 4.5));
      break;
    }
    case 'road': {
      // A flyover with a bus and cars, shops and blocks below, lamps along the deck.
      for (let x = -20; x < VW; ) {
        const w = between(140, 210);
        P.mid.cut.push(slab(T.mid, x, w, between(150, 210)));
        x += w + between(16, 34);
      }
      const deck = 226;
      let d = T.near.path([[-20, deck], [VW + 20, deck - 6], [VW + 20, deck + 18], [-20, deck + 24]]);
      for (let x = 10; x < VW; x += 44) d += hole(T.near, x, deck - 8 - (x / VW) * 6, 4, 8);
      P.near.cut.push(d);
      for (const c of [260, 800, 1340]) P.near.cut.push(T.near.path([[c - 30, deck + 20], [c + 30, deck + 20], [c + 16, deck + 38], [c + 14, B], [c - 14, B], [c - 16, deck + 38]]));
      // Bus: body with a row of windows; two cars.
      const bx = 660;
      const by = deck - 44;
      P.near.cut.push(T.near.path([[bx, by + 4], [bx + 4, by], [bx + 200, by], [bx + 206, by + 8], [bx + 206, by + 40], [bx, by + 40]]) + T.near.grid(bx + 12, by + 8, 7, 1, 18, 14, 8, 0) + T.near.rect(bx + 186, by + 8, 12, 24));
      const car = (x: number) => T.near.path([[x, deck - 8], [x + 8, deck - 20], [x + 22, deck - 28], [x + 56, deck - 28], [x + 72, deck - 18], [x + 86, deck - 16], [x + 88, deck - 6], [x, deck - 6]]) + T.near.path([[x + 24, deck - 24], [x + 44, deck - 24], [x + 44, deck - 17], [x + 16, deck - 17]]);
      P.near.cut.push(car(460) + car(940) + car(1180));
      P.street.cut.push(shops(T.street, 520, 2), shops(T.street, 960, 2));
      for (const x of [340, 1120, 1480]) lamp(T.street, P.street, x, 110);
      break;
    }
    case 'village': {
      // Low houses, a peepal tree on a chabutra, a hand pump and a cow.
      let row = '';
      for (let x = 300; x < 1300; ) {
        const w = between(90, 130);
        row += house(T.mid, x, w, between(56, 84));
        x += w + between(10, 40);
      }
      P.mid.cut.push(row);
      const cx = 800;
      P.near.solid.push(T.near.path([[cx - 12, G - 20], [cx - 9, G - 120], [cx - 60, G - 160], [cx - 54, G - 166], [cx - 4, G - 136], [cx + 2, G - 176], [cx + 10, G - 174], [cx + 8, G - 130], [cx + 58, G - 162], [cx + 62, G - 156], [cx + 12, G - 116], [cx + 14, G - 20]]));
      canopy(T.near, P.near, cx, G - 196, 170);
      P.street.cut.push(T.street.path([[cx - 96, G - 22], [cx + 96, G - 22], [cx + 110, G + 2], [cx - 110, G + 2]]));
      P.street.solid.push(T.street.path([[1040, G], [1040, G - 50], [1034, G - 50], [1034, G - 58], [1062, G - 60], [1064, G - 54], [1048, G - 52], [1048, G]]));
      P.street.cut.push(cow(T.street, 1120, 0.62));
      trees([180, 1450]);
      break;
    }
    case 'city': {
      // Glass towers (Cyber City) behind sector blocks, the Rapid Metro in front.
      const crowns = ['spire', 'slantL', 'notch', 'step', 'slantR', 'flat'] as const;
      for (const x of [120, 300, 470, 640, 820, 1000, 1170, 1350]) P.mid.cut.push(tower(T.mid, x, between(92, 124), between(60, 140), pick(crowns), 0.25));
      P.near.cut.push(...metroLine(T.near, 262, 600));
      trees([300, 1260]);
      lamp(T.street, P.street, 820);
      break;
    }
    case 'delhi': {
      // Low government blocks, a domed hall and India Gate among old trees.
      for (const x of [60, 250, 1250, 1420]) P.mid.cut.push(slab(T.mid, x, between(140, 170), between(236, 262)));
      // Domed hall: a wide base, a drum and a dome with a finial.
      const dx = 1100;
      const dome: Pt[] = [];
      for (let i = 0; i <= 14; i += 1) dome.push([dx - 64 + (128 * i) / 14, 176 - Math.sin((i / 14) * Math.PI) * 58]);
      P.mid.cut.push(T.mid.path([[dx - 150, B], [dx - 150, 250], [dx - 80, 250], [dx - 80, 196], [dx - 70, 196], [dx - 70, 178], ...dome, [dx + 70, 178], [dx + 70, 196], [dx + 80, 196], [dx + 80, 250], [dx + 150, 250], [dx + 150, B]]) + windows(T.mid, dx - 150, 300, 266, G - 14, 14, 22, 12, 12, 0) + T.mid.rect(dx - 3, 104, 6, 16));
      // India Gate: an arch with a stepped attic and a small dome on top.
      const gx = 760;
      P.near.cut.push(
        T.near.path([[gx - 70, G + 4], [gx - 70, 150], [gx - 60, 150], [gx - 60, 138], [gx - 40, 138], [gx - 40, 124], [gx + 40, 124], [gx + 40, 138], [gx + 60, 138], [gx + 60, 150], [gx + 70, 150], [gx + 70, G + 4]]) +
          T.near.path([[gx - 28, G + 4], [gx - 28, 214], [gx - 20, 196], [gx - 8, 188], [gx + 8, 188], [gx + 20, 196], [gx + 28, 214], [gx + 28, G + 4]]) +
          hole(T.near, gx - 58, 162, 116, 5),
      );
      P.near.solid.push(T.near.path([[gx - 14, 125], [gx - 10, 112], [gx + 10, 112], [gx + 14, 125]]));
      trees([420, 560, 980, 1330]);
      lamp(T.street, P.street, 640);
      lamp(T.street, P.street, 900);
      break;
    }
    case 'noida': {
      // Tall residential towers packed along an expressway viaduct.
      const crowns = ['step', 'flat', 'notch', 'spire'] as const;
      for (let x = 60; x < VW - 40; ) {
        const w = between(78, 104);
        P.mid.cut.push(tower(T.mid, x, w, between(40, 120), pick(crowns), 0.45));
        x += w + between(34, 60);
      }
      const deck = 250;
      let d = T.near.path([[-20, deck], [VW + 20, deck - 5], [VW + 20, deck + 16], [-20, deck + 21]]);
      for (let x = 10; x < VW; x += 36) d += hole(T.near, x, deck - 8 - (x / VW) * 5, 4, 8);
      P.near.cut.push(d);
      for (const c of [300, 800, 1300]) P.near.cut.push(T.near.path([[c - 26, deck + 18], [c + 26, deck + 18], [c + 14, deck + 34], [c + 12, B], [c - 12, B], [c - 14, deck + 34]]));
      const car = (x: number) => T.near.path([[x, deck - 7], [x + 8, deck - 18], [x + 21, deck - 25], [x + 52, deck - 25], [x + 66, deck - 16], [x + 80, deck - 14], [x + 82, deck - 5], [x, deck - 5]]) + hole(T.near, x + 22, deck - 21, 20, 6);
      P.near.cut.push(car(520) + car(700) + car(1010));
      trees([180, 1450]);
      lamp(T.street, P.street, 560);
      lamp(T.street, P.street, 1060);
      break;
    }
    case 'faridabad': {
      // The Aravalli ridge behind the town, factory sheds with two chimneys, low blocks.
      const ridge: Pt[] = [[-20, B]];
      for (let x = -20; x <= VW + 20; x += 80) ridge.push([x, 190 + Math.sin(x / 210) * 34 + T.far.rand() * 22]);
      ridge.push([VW + 20, B]);
      P.far.cut.unshift(T.far.path(ridge));
      for (const x of [80, 1260, 1430]) P.mid.cut.push(slab(T.mid, x, between(140, 170), between(214, 240)));
      const pts: Pt[] = [[430, B]];
      for (let i = 0; i < 8; i += 1) pts.push([430 + i * 92, G - 64], [430 + i * 92, G - 100], [430 + (i + 1) * 92, G - 64]);
      pts.push([1166, B]);
      let sheds = T.mid.path(pts);
      for (let i = 0; i < 8; i += 1) sheds += hole(T.mid, 434 + i * 92, G - 94, 4, 26);
      P.mid.cut.push(sheds);
      for (const cx of [620, 980]) P.near.cut.push(T.near.path([[cx - 12, 92], [cx + 12, 92], [cx + 18, G - 96], [cx - 18, G - 96]]) + hole(T.near, cx - 10, 110, 20, 6) + hole(T.near, cx - 11, 126, 22, 5));
      trees([300, 1200, 1480]);
      lamp(T.street, P.street, 820);
      break;
    }
    case 'ghaziabad': {
      // Dense builder floors and houses, a tall overhead water tank, an auto-rickshaw.
      for (let x = -30; x < VW; ) {
        const w = between(110, 146);
        P.mid.cut.push(r() < 0.35 ? house(T.mid, x, w, between(70, 96)) : builderFloor(T.mid, x, w, 2 + Math.floor(r() * 3)));
        x += w + between(6, 16);
      }
      // Water tank: a wide drum on four legs with cross braces.
      const tx = 980;
      P.near.cut.push(T.near.path([[tx - 64, 96], [tx + 64, 96], [tx + 72, 112], [tx + 72, 150], [tx + 60, 162], [tx - 60, 162], [tx - 72, 150], [tx - 72, 112]]) + hole(T.near, tx - 60, 124, 120, 4));
      P.near.solid.push(T.near.path([[tx - 56, 160], [tx - 46, 160], [tx - 34, G + 2], [tx - 44, G + 2]]), T.near.path([[tx + 46, 160], [tx + 56, 160], [tx + 44, G + 2], [tx + 34, G + 2]]));
      P.near.solid.push(T.near.path([[tx - 50, 220], [tx + 50, 220], [tx + 48, 226], [tx - 48, 226]]), T.near.path([[tx - 42, 280], [tx + 42, 280], [tx + 40, 286], [tx - 40, 286]]));
      P.street.cut.push(shops(T.street, 420, 3));
      trees([300, 1300]);
      lamp(T.street, P.street, 760);
      break;
    }
    case 'office': {
      // A plaza of tall glass towers, two joined by a skywalk; lamps, trees and cars on the avenue.
      const crowns = ['spire', 'notch', 'step', 'slantL', 'slantR'] as const;
      const xs = [300, 470, 650, 860, 1060, 1230];
      const ws = xs.map(() => between(104, 136));
      xs.forEach((x, i) => P.mid.cut.push(tower(T.mid, x, ws[i]!, between(34, 110), pick(crowns), 0.15)));
      // Skywalk between the third and fourth towers, with a row of windows.
      const a = xs[2]! + ws[2]! - 6;
      const b = xs[3]! + 6;
      P.near.cut.push(T.near.rect(a, 172, b - a, 26) + windows(T.near, a, b - a, 179, 191, 10, 12, 7, 0, 0));
      P.near.cut.push(T.near.rect(a - 8, 166, b - a + 16, 6));
      const car = (x: number) => T.street.path([[x, G - 8], [x + 8, G - 20], [x + 22, G - 28], [x + 56, G - 28], [x + 72, G - 18], [x + 86, G - 16], [x + 88, G - 6], [x, G - 6]]) + T.street.path([[x + 24, G - 24], [x + 44, G - 24], [x + 44, G - 17], [x + 16, G - 17]]);
      P.street.cut.push(car(640) + car(900));
      trees([230, 1400]);
      lamp(T.street, P.street, 560);
      lamp(T.street, P.street, 1100);
      break;
    }
    case 'metro': {
      // Station box on the viaduct: platform roof, stairs to the street, a train at the platform.
      for (let x = -20; x < VW; ) {
        const w = between(140, 200);
        P.mid.cut.push(slab(T.mid, x, w, between(150, 210)));
        x += w + between(16, 34);
      }
      P.near.cut.push(...metroLine(T.near, 250, 590));
      // Canopy roof over the platform, on thin posts.
      P.near.cut.push(T.near.path([[520, 162], [1080, 158], [1100, 176], [500, 180]]));
      for (let x = 540; x <= 1060; x += 104) P.near.solid.push(T.near.rect(x, 178, 5, 26));
      // Stair block down to the street.
      P.near.cut.push(T.near.path([[1110, 276], [1180, 276], [1180, G + 4], [1110, G + 4]]) + T.near.grid(1118, 286, 3, 2, 14, 18, 8, 10));
      trees([300, 1400]);
      lamp(T.street, P.street, 1260);
      break;
    }
    case 'hospital': {
      // A wide block with a plus sign cut into its front tower, an entrance canopy, an ambulance.
      P.mid.cut.push(slab(T.mid, 200, 220, 180), slab(T.mid, 1200, 200, 170));
      let h = T.mid.rect(520, 150, 560, B - 150) + windows(T.mid, 520, 180, 170, G - 60, 12, 12, 12, 14, 0.2) + windows(T.mid, 900, 180, 170, G - 60, 12, 12, 12, 14, 0.2);
      h += T.mid.rect(710, 100, 180, 70);
      h += T.mid.path([[782, 110], [818, 110], [818, 124], [832, 124], [832, 150], [818, 150], [818, 164], [782, 164], [782, 150], [768, 150], [768, 124], [782, 124]]);
      h += windows(T.mid, 710, 180, 186, G - 70, 14, 14, 10, 12, 0.1);
      P.mid.cut.push(h);
      P.near.cut.push(T.near.path([[680, G - 74], [920, G - 76], [930, G - 62], [670, G - 60]]));
      P.near.solid.push(T.near.rect(690, G - 62, 6, 62), T.near.rect(904, G - 62, 6, 62));
      // Ambulance with a plus cut out.
      const ax = 980;
      P.street.cut.push(
        T.street.path([[ax, G - 8], [ax, G - 58], [ax + 118, G - 58], [ax + 118, G - 44], [ax + 142, G - 40], [ax + 156, G - 22], [ax + 156, G - 8]]) +
          T.street.path([[ax + 42, G - 50], [ax + 54, G - 50], [ax + 54, G - 40], [ax + 64, G - 40], [ax + 64, G - 28], [ax + 54, G - 28], [ax + 54, G - 18], [ax + 42, G - 18], [ax + 42, G - 28], [ax + 32, G - 28], [ax + 32, G - 40], [ax + 42, G - 40]]) +
          T.street.path([[ax + 124, G - 40], [ax + 140, G - 38], [ax + 148, G - 26], [ax + 124, G - 26]]),
      );
      P.kerb.cut.push(T.kerb.oct(ax + 30, G - 4, 12) + T.kerb.oct(ax + 30, G - 4, 4.5), T.kerb.oct(ax + 124, G - 4, 12) + T.kerb.oct(ax + 124, G - 4, 4.5));
      trees([400, 1450]);
      break;
    }
    case 'mall': {
      // A large box with a glass front, a curved canopy and banner slits; cars parked in front.
      P.mid.cut.push(tower(T.mid, 240, 110, 110, 'step'), tower(T.mid, 1260, 120, 120, 'slantL'));
      let m = T.mid.rect(440, 150, 720, B - 150);
      m += windows(T.mid, 640, 320, 196, G - 16, 26, 40, 8, 8, 0);
      for (const x of [480, 540, 1060, 1110]) m += T.mid.rect(x, 172, 18, 110);
      P.mid.cut.push(m);
      const arc: Pt[] = [];
      for (let i = 0; i <= 16; i += 1) arc.push([610 + i * 23.75, 176 - Math.sin((i / 16) * Math.PI) * 26]);
      P.near.cut.push(T.near.path([...arc, [990, 190], [610, 190]]));
      const car = (x: number) => T.street.path([[x, G - 8], [x + 8, G - 20], [x + 22, G - 28], [x + 56, G - 28], [x + 72, G - 18], [x + 86, G - 16], [x + 88, G - 6], [x, G - 6]]) + T.street.path([[x + 24, G - 24], [x + 44, G - 24], [x + 44, G - 17], [x + 16, G - 17]]);
      P.street.cut.push(car(560) + car(700) + car(900) + car(1040));
      for (const x of [480, 1120]) lamp(T.street, P.street, x);
      trees([200, 1460]);
      break;
    }
    case 'industrial': {
      // Saw-tooth sheds, a chimney, a truck at the gate.
      for (const x of [140, 1240]) P.mid.cut.push(slab(T.mid, x, 200, 190));
      let s = '';
      const pts: Pt[] = [[420, B]];
      for (let i = 0; i < 8; i += 1) pts.push([420 + i * 90, G - 70], [420 + i * 90, G - 110], [420 + (i + 1) * 90, G - 70]);
      pts.push([1140, B]);
      s += T.mid.path(pts);
      for (let i = 0; i < 8; i += 1) s += T.mid.rect(424 + i * 90, G - 104, 4, 30);
      for (let x = 450; x < 1120; x += 70) s += T.mid.rect(x, G - 50, 34, 24);
      P.mid.cut.push(s);
      P.near.cut.push(T.near.path([[986, 60], [1010, 60], [1016, G - 110], [980, G - 110]]) + T.near.rect(988, 80, 20, 6) + T.near.rect(986, 98, 24, 5));
      const tx = 660;
      P.street.cut.push(T.street.path([[tx, G - 8], [tx, G - 72], [tx + 150, G - 72], [tx + 150, G - 8]]) + T.street.path([[tx + 156, G - 8], [tx + 156, G - 52], [tx + 190, G - 52], [tx + 206, G - 30], [tx + 206, G - 8]]) + T.street.path([[tx + 164, G - 46], [tx + 186, G - 46], [tx + 196, G - 32], [tx + 164, G - 32]]));
      P.kerb.cut.push(T.kerb.oct(tx + 30, G - 4, 12) + T.kerb.oct(tx + 30, G - 4, 4.5), T.kerb.oct(tx + 180, G - 4, 12) + T.kerb.oct(tx + 180, G - 4, 4.5));
      trees([330, 1440]);
      break;
    }
    case 'directory': {
      // A sampler street, left to right: a village tree, builder floors, towers with a crane, a society gate.
      P.mid.cut.push(house(T.mid, 60, 110, 70) + house(T.mid, 180, 96, 58));
      P.mid.cut.push(builderFloor(T.mid, 330, 130, 3), builderFloor(T.mid, 470, 136, 4));
      P.mid.cut.push(tower(T.mid, 660, 104, 90, 'step', 0.2), tower(T.mid, 800, 104, 98, 'step', 0.2), tower(T.mid, 1150, 110, 120, 'slantR'));
      const mx = 1060;
      const mTop = 80;
      let mast = T.near.rect(mx, mTop, 14, G - mTop + 4);
      for (let y = mTop + 8; y < G - 12; y += 22) mast += T.near.path([[mx + 3, y], [mx + 11, y + 9], [mx + 3, y + 18]]);
      P.near.cut.push(mast);
      let jib = T.jib.rect(mx - 110, mTop - 2, 360, 10);
      for (let x = mx - 100; x < mx + 240; x += 20) jib += T.jib.path([[x, mTop + 6], [x + 8, mTop], [x + 16, mTop + 6]]);
      P.jib.cut.push(jib);
      P.jib.solid.push(T.jib.rect(mx - 106, mTop + 7, 36, 20), T.jib.rect(mx + 190, mTop + 8, 2.5, 90));
      scene.pivot = [mx + 7, mTop];
      // Society wall and gate in the middle.
      const wallTop = G - 40;
      P.near.cut.push(T.near.rect(620, wallTop, 150, 52) + T.near.rect(880, wallTop, 160, 52) + T.near.rect(762, wallTop - 50, 18, 102) + T.near.rect(870, wallTop - 50, 18, 102) + T.near.rect(754, wallTop - 66, 142, 18));
      P.near.solid.push(T.near.rect(780, G - 26, 80, 4));
      P.near.solid.push(T.near.path([[250, G - 20], [252, G - 110], [214, G - 140], [220, G - 145], [256, G - 124], [262, G - 150], [270, G - 148], [266, G - 118], [300, G - 138], [304, G - 132], [270, G - 106], [272, G - 20]]));
      canopy(T.near, P.near, 262, G - 164, 110);
      trees([1320, 1500]);
      lamp(T.street, P.street, 600);
      break;
    }
  }

  // Every layer is kept, even when empty, so the renderer's groups keep a fixed
  // order: the clouds are the 2nd group and the crane jib the 6th (Vignette.astro animates them).
  // Whole units are plenty: one unit is under a pixel at every size the scene is shown.
  const lean = (ds: string[]) => mergeDisjoint(ds).map((d) => d.replace(/-?\d+\.\d+/g, (n) => String(Math.round(Number(n)))));
  scene.layers = LAYERS.map((l) => ({ id: l.id, fill: l.fill, depth: 0, shadow: l.shadow, cut: lean(P[l.id].cut), solid: lean(P[l.id].solid) }));
  return scene;
}
