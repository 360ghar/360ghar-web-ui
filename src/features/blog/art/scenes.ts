/**
 * Paper-cut vignettes for blog covers and content pages. Same language as the
 * home diorama (src/features/home/diorama/gurugram.ts): flat kesar layers,
 * light to dark from far to near, every vertex cut by hand with a seeded
 * jitter, one short shadow per layer from a top-left light.
 *
 * Coordinate space: 640 x 400 (16:10). The subject stays inside it. With
 * `wide`, the sky, skyline and ground run on to x = -440..1080, so a wide
 * strip (preserveAspectRatio "meet") shows more street on each side instead
 * of cropping the subject.
 *
 * The same scene name and seed give the same drawing on server and client.
 */
import { hash, rng } from '@/lib/paper/cut';
import { cloudPts, makeTools, trunkPts, type Layer, type Pt } from '@/lib/paper/shapes';

export const ART_W = 640;
export const ART_H = 400;

export type SceneName =
  | 'crane'
  | 'flyover'
  | 'coin'
  | 'mappin'
  | 'gate'
  | 'tolet'
  | 'room'
  | 'seal'
  | 'mandala'
  | 'toran'
  | 'tour'
  | 'keys'
  | 'postbox'
  | 'scale'
  | 'book'
  | 'plane'
  | 'bungalow'
  | 'desk'
  | 'chat'
  | 'question';

/** `id` is unique per scene, seed and size: it names the SVG filters. */
export type Art = { id: string; scene: SceneName; bg: string; layers: Layer[]; x0: number; x1: number };

type Env = { x0: number; x1: number };
type Tone = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 'paper';

/* Two tone ramps. 0 is the backdrop, 1 the sky sheet, 6 the nearest layer. */
const DAY = ['kesar-100', 'kesar-50', 'kesar-200', 'kesar-300', 'kesar-500', 'kesar-700', 'kesar-900'];
const DUSK = ['kesar-200', 'kesar-100', 'kesar-300', 'kesar-400', 'kesar-600', 'kesar-800', 'kesar-950'];
/* Shadow each tone casts on the layer behind it (tinted, as in the diorama). */
const SHADOW = ['rgb(226 91 0 / 0.22)', 'rgb(226 91 0 / 0.25)', 'rgb(226 91 0 / 0.35)', 'rgb(181 70 0 / 0.35)', 'rgb(138 51 0 / 0.4)', 'rgb(94 33 0 / 0.45)', 'rgb(47 15 2 / 0.5)'];
const PAPER_SHADOW = 'rgb(138 51 0 / 0.3)';

/* ------------------------------------------------------------------ */
/* Drawing kit: the shared jittered tools, mirrored when asked.        */
/* ------------------------------------------------------------------ */

function kit(seed: string, mirror: boolean, pal: string[], amp = 0.8) {
  const t = makeTools(seed, amp);
  const mx = (x: number) => (mirror ? ART_W - x : x);
  // Whole units are enough at card size and keep the markup small; the jitter still shows.
  const whole = (d: string) => d.replace(/-?\d+\.\d+/g, (m) => String(Math.round(Number(m))));
  const P = (pts: Pt[]) => whole(t.path(pts.map(([x, y]) => [mx(x), y] as Pt)));
  /** Not mirrored: for letters and glyphs. Place them with `mx`. */
  const U = (pts: Pt[]) => whole(t.path(pts));
  const box = (x: number, y: number, w: number, h: number): Pt[] => [
    [x, y],
    [x + w, y],
    [x + w, y + h],
    [x, y + h],
  ];
  const R = (x: number, y: number, w: number, h: number) => P(box(x, y, w, h));
  const G = (x: number, y: number, cols: number, rows: number, w: number, h: number, gx: number, gy: number, skip = 0) => {
    let d = '';
    for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) if (!(skip > 0 && t.rand() < skip)) d += R(x + c * (w + gx), y + r * (h + gy), w, h);
    return d;
  };
  const arc = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n: number): Pt[] => {
    const out: Pt[] = [];
    for (let i = 0; i <= n; i += 1) {
      const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
      out.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
    }
    return out;
  };
  const E = (cx: number, cy: number, rx: number, ry = rx, n = 36) => P(arc(cx, cy, rx, ry, 0, 360 - 360 / n, n - 1));
  /** A band between two ellipses, from angle a0 to a1 (degrees, 0 = right, 90 = down). */
  const band = (cx: number, cy: number, rx: number, ry: number, w: number, a0: number, a1: number, n = 28) =>
    P([...arc(cx, cy, rx, ry, a0, a1, n), ...arc(cx, cy, rx - w, ry - w * (ry / rx), a1, a0, n)]);
  /** A straight strip of width w, like a string or a pole. */
  const L = (x1: number, y1: number, x2: number, y2: number, w = 2) => {
    const len = Math.hypot(x2 - x1, y2 - y1) || 1;
    const nx = (-(y2 - y1) / len) * (w / 2);
    const ny = ((x2 - x1) / len) * (w / 2);
    return P([
      [x1 + nx, y1 + ny],
      [x2 + nx, y2 + ny],
      [x2 - nx, y2 - ny],
      [x1 - nx, y1 - ny],
    ]);
  };
  const rot = (pts: Pt[], cx: number, cy: number, deg: number): Pt[] => {
    const a = (deg * Math.PI) / 180;
    const c = Math.cos(a);
    const s = Math.sin(a);
    return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c] as Pt);
  };
  /** A rectangle turned by `deg` around (cx, cy). */
  const RR = (x: number, y: number, w: number, h: number, cx: number, cy: number, deg: number) => P(rot(box(x, y, w, h), cx, cy, deg));
  const star = (cx: number, cy: number, ro: number, ri: number, n: number, a0 = -90) => {
    const pts: Pt[] = [];
    for (let i = 0; i < n * 2; i += 1) {
      const a = ((a0 + (180 / n) * i) * Math.PI) / 180;
      const r = i % 2 === 0 ? ro : ri;
      pts.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
    }
    return P(pts);
  };
  const blob = (cx: number, cy: number, rx: number, ry: number, n: number, rough: number) => whole(t.blob(mx(cx), cy, rx, ry, n, rough));
  const layer = (id: string, tone: Tone, cut: string[], solid: string[] = []): Layer => ({
    id,
    fill: tone === 'paper' ? 'var(--color-paper)' : `var(--color-${pal[tone]})`,
    depth: 0,
    shadow: tone === 'paper' ? PAPER_SHADOW : (SHADOW[tone] ?? SHADOW[4]!),
    cut,
    solid,
  });
  return { rand: t.rand, mirror, mx, P, U, R, G, arc, E, band, L, rot, RR, star, blob, box, layer };
}

type Kit = ReturnType<typeof kit>;

/* ------------------------------------------------------------------ */
/* Shared parts: sky, skylines, ground, trees.                         */
/* ------------------------------------------------------------------ */

const cloud = (k: Kit, x: number, y: number, w: number) => k.P(cloudPts(x, y, w));

/** The sky sheet. The sun and clouds are cut out of it, so the backdrop shows through. */
function sky(k: Kit, e: Env, sun: [number, number, number] | null, clouds: [number, number, number][] = []) {
  let d = k.R(e.x0 - 12, -12, e.x1 - e.x0 + 24, ART_H + 24);
  if (sun) d += k.E(sun[0], sun[1], sun[2], sun[2], 40);
  for (const [x, y, w] of clouds) d += cloud(k, x, y, w);
  if (e.x0 < 0) d += cloud(k, -300, 120, 150) + cloud(k, 820, 80, 170);
  return k.layer('sky', 1, [d]);
}

/** Far towers with window strips, from x0 to x1, standing on `base`. */
function towers(k: Kit, x0: number, x1: number, base: number, minTop: number, maxTop: number, avoid?: [number, number]) {
  let d = '';
  let x = x0;
  while (x < x1) {
    const w = 38 + k.rand() * 46;
    const top = minTop + k.rand() * (maxTop - minTop);
    const inGap = avoid && x + w > avoid[0] && x < avoid[1];
    if (!inGap) {
      const crown = k.rand();
      const outline: Pt[] =
        crown < 0.25
          ? [
              [x, top + 18],
              [x + w, top],
              [x + w, base],
              [x, base],
            ]
          : crown < 0.45
            ? [
                [x + w / 2 - 2, top - 34],
                [x + w / 2 + 2, top - 34],
                [x + w / 2 + 3, top - 8],
                [x + w, top],
                [x + w, base],
                [x, base],
                [x, top],
                [x + w / 2 - 3, top - 8],
              ]
            : k.box(x, top, w, base - top);
      // Tall window strips, as on the glass towers of the diorama. Only down to the visible edge.
      const rows = Math.floor((Math.min(base, ART_H) - top - 30) / 34);
      d += k.P(outline) + k.G(x + 7, top + 20, Math.max(1, Math.floor((w - 10) / 11)), rows, 4, 24, 7, 10, 0.5);
    }
    x += w + 5 + k.rand() * 12;
  }
  return d;
}

/** Low sector blocks with balcony slits and water tanks. */
function blocks(k: Kit, x0: number, x1: number, base: number, minTop: number, maxTop: number) {
  let d = '';
  let x = x0;
  while (x < x1) {
    const w = 70 + k.rand() * 60;
    const top = minTop + k.rand() * (maxTop - minTop);
    d += k.R(x, top, w, base - top);
    d += k.P([
      [x + 12, top - 14],
      [x + 30, top - 14],
      [x + 30, top - 5],
      [x + 26, top - 5],
      [x + 26, top + 1],
      [x + 16, top + 1],
      [x + 16, top - 5],
      [x + 12, top - 5],
    ]);
    let floor = 0;
    for (let y = top + 12; y < Math.min(base, ART_H) - 18; y += 22, floor += 1) {
      d += k.R(x + 8, y, w - 16, 3);
      if (floor % 2 === 0) d += k.G(x + 12, y + 8, Math.floor((w - 20) / 17), 1, 8, 7, 9, 0, 0.4);
    }
    x += w + 8 + k.rand() * 10;
  }
  return d;
}

/** Ground sheet with a rough top edge. */
function ground(k: Kit, e: Env, y: number, bump = 3) {
  const pts: Pt[] = [[e.x0 - 12, y]];
  for (let x = e.x0 + 30; x < e.x1; x += 48) pts.push([x, y - bump / 2 + k.rand() * bump]);
  pts.push([e.x1 + 12, y], [e.x1 + 12, ART_H + 12], [e.x0 - 12, ART_H + 12]);
  return k.P(pts);
}

/** The near kerb with lane dashes cut out. */
function kerb(k: Kit, e: Env, y = 380) {
  let d = ground(k, e, y, 3);
  for (let x = e.x0 + 20; x < e.x1; x += 150) d += k.R(x, y + 11, 56, 4);
  return k.layer('kerb', 6, [d]);
}

/** A gulmohar tree: trunk (solid) and a rough canopy (solid). */
function tree(k: Kit, cx: number, g: number, h: number, rx: number) {
  return [
    k.P(trunkPts(cx, g, h, [-4, -3, -20, -17, -1, 2, 6, 3, 5])),
    k.blob(cx, g - h + 20, rx, 26, 22, 0.34),
  ];
}

/** Block letters for signs, 14 x 20 each, never mirrored. Returns solids. */
function letters(k: Kit, text: string, x: number, y: number, s = 1) {
  const out: string[] = [];
  const r = (a: number, b: number, w: number, h: number) => k.U(k.box(x + a * s, y + b * s, w * s, h * s));
  for (const ch of text) {
    if (ch === 'T') out.push(r(0, 0, 14, 4), r(5, 0, 4, 20));
    // A round O: the inner ring runs the other way, so it is a hole under the nonzero rule.
    if (ch === 'O') out.push(k.U(k.arc(x + 7 * s, y + 10 * s, 7.5 * s, 10.5 * s, 0, 350, 20)) + k.U(k.arc(x + 7 * s, y + 10 * s, 3.3 * s, 6.3 * s, 350, 0, 16)));
    if (ch === 'L') out.push(r(0, 0, 4, 20), r(0, 16, 12, 4));
    if (ch === 'E') out.push(r(0, 0, 4, 20), r(0, 0, 12, 4), r(0, 8, 10, 4), r(0, 16, 12, 4));
    if (ch === 'N')
      out.push(
        r(0, 0, 4, 20),
        r(10, 0, 4, 20),
        k.U([
          [x, y],
          [x + 4 * s, y],
          [x + 14 * s, y + 20 * s],
          [x + 10 * s, y + 20 * s],
        ]),
      );
    x += ch === ' ' ? 10 * s : (ch === 'L' || ch === 'E' ? 12 : 14) * s + 4 * s;
  }
  return out;
}

const letterWidth = (text: string) => [...text].reduce((w, ch) => w + (ch === ' ' ? 10 : ch === 'L' || ch === 'E' ? 16 : 18), 0) - 4;

/* ------------------------------------------------------------------ */
/* Scenes.                                                             */
/* ------------------------------------------------------------------ */

type Scene = (k: Kit, e: Env) => { layers: Layer[]; bg?: Exclude<Tone, 'paper'> };

/** A tower going up with a tower crane: new projects, market news. */
const crane: Scene = (k, e) => {
  const sunX = 440 + k.rand() * 90;
  const bx = 150;
  const top = 96;
  let site = k.R(bx, top, 112, 330);
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) site += k.R(bx + 8 + c * 34, top + 8 + r * 28, 28, 22);
  site += k.G(bx + 10, top + 104, 6, 9, 8, 10, 8, 8, 0.2);
  let mast = k.R(300, 64, 14, 350);
  for (let y = 76; y < 330; y += 14) mast += k.R(303, y, 8, 8);
  let jib = k.R(170, 62, 330, 9);
  for (let x = 184; x < 490; x += 16) if (x < 294 || x > 318) jib += k.P([[x, 64.5], [x + 10, 64.5], [x + 5, 69]]);
  let hoard = ground(k, e, 346, 4);
  for (const [a, b] of [
    [e.x0 - 12, 226],
    [292, e.x1 + 12],
  ] as const) {
    hoard += k.R(a, 314, b - a, 34);
    for (let x = a + 40; x < b - 20; x += 64) hoard += k.R(x, 318, 2, 26);
  }
  return {
    layers: [
      sky(k, e, [sunX, 96, 40], [
        [60, 70, 150],
        [360, 150, 120],
      ]),
      k.layer('far', 2, [towers(k, e.x0, e.x1, 412, 150, 250)]),
      k.layer('site', 3, [site, blocks(k, 500, e.x1, 412, 232, 262), ...(e.x0 < 0 ? [blocks(k, e.x0, 120, 412, 232, 270)] : [])]),
      k.layer(
        'crane',
        4,
        [mast, jib, k.R(314, 72, 20, 16) + k.R(320, 75, 10, 7), k.R(398, 176, 64, 9) + k.R(420, 179, 20, 3)],
        [
          k.P([[300, 64], [307, 34], [314, 64]]),
          k.R(180, 71, 34, 18),
          k.L(307, 36, 190, 63, 2),
          k.L(307, 36, 470, 63, 2),
          k.L(430, 71, 430, 150, 2),
          k.L(430, 150, 402, 177, 1.6),
          k.L(430, 150, 458, 177, 1.6),
          k.R(422, 70, 16, 5),
        ],
      ),
      k.layer('near', 5, [hoard], tree(k, 572, 346, 132, 50)),
      kerb(k, e, 384),
    ],
  };
};

/** An elevated expressway with a bus and a car: commutes and corridors. */
const flyover: Scene = (k, e) => {
  const yd = (x: number) => 226 - ((x - e.x0) / (e.x1 - e.x0)) * 20;
  let deck = k.P([
    [e.x0 - 12, yd(e.x0)],
    [e.x1 + 12, yd(e.x1)],
    [e.x1 + 12, yd(e.x1) + 18],
    [e.x0 - 12, yd(e.x0) + 24],
  ]);
  for (let x = e.x0 + 20; x < e.x1; x += 90) deck += k.R(x, yd(x) + 8, 40, 3);
  const posts: string[] = [];
  for (let x = e.x0; x < e.x1; x += 22) posts.push(k.R(x, yd(x) - 9, 4, 9));
  const piers: string[] = [];
  for (let c = e.x0 + 70; c < e.x1; c += 230) {
    const y0 = yd(c) + 20;
    piers.push(
      k.P([
        [c - 44, y0],
        [c + 44, y0],
        [c + 18, y0 + 22],
        [c + 14, ART_H + 12],
        [c - 14, ART_H + 12],
        [c - 18, y0 + 22],
      ]),
    );
  }
  const by = yd(240);
  const bus = k.R(180, by - 38, 124, 36) + k.G(190, by - 32, 5, 1, 16, 12, 6, 0) + k.R(292, by - 32, 6, 22) + k.R(186, by - 14, 112, 3);
  const cy = yd(420);
  const car =
    k.P([
      [382, cy - 4],
      [386, cy - 16],
      [400, cy - 18],
      [412, cy - 30],
      [440, cy - 30],
      [452, cy - 18],
      [462, cy - 15],
      [464, cy - 4],
    ]) +
    k.P([[416, cy - 26], [428, cy - 26], [428, cy - 19], [410, cy - 19]]) +
    k.P([[432, cy - 26], [440, cy - 26], [447, cy - 19], [432, cy - 19]]);
  const sign =
    k.R(454, 224, 126, 54) +
    k.P([
      [508, 232],
      [521, 246],
      [513, 246],
      [513, 268],
      [503, 268],
      [503, 246],
      [495, 246],
    ]) +
    k.R(532, 240, 34, 5) +
    k.R(532, 252, 26, 5) +
    k.R(532, 264, 30, 5);
  return {
    layers: [
      sky(k, e, [150 + k.rand() * 60, 96, 38], [
        [300, 64, 150],
        [470, 150, 110],
      ]),
      k.layer('far', 2, [towers(k, e.x0, e.x1, 412, 140, 230)]),
      k.layer('mid', 3, [blocks(k, e.x0, e.x1, 412, 256, 296)]),
      k.layer('deck', 4, [deck, bus, car], [...posts, ...piers, k.E(206, by, 8), k.E(282, by, 8), k.E(398, cy - 2, 6), k.E(448, cy - 2, 6)]),
      k.layer('near', 5, [ground(k, e, 350, 4), sign], [k.R(472, 276, 6, 76), k.R(556, 276, 6, 76), k.blob(110, 350, 70, 22, 20, 0.3)]),
      kerb(k, e, 384),
    ],
  };
};

/** A coin rising like the sun over the city: prices, budgets, returns. */
const coin: Scene = (k, e) => {
  const cx = 330;
  const cy = 176;
  const coinD = k.E(cx, cy, 96, 96, 56) + k.E(cx, cy, 86, 86, 52) + k.E(cx, cy, 82, 82, 52);
  // The rupee sign, never mirrored: two bars, a bowl, a leg.
  const x0 = k.mx(cx) - 30;
  const y0 = cy - 48;
  const g = (pts: Pt[]) => k.U(pts.map(([x, y]) => [x0 + x, y0 + y] as Pt));
  const bowl: Pt[] = [];
  for (let i = 0; i <= 12; i += 1) {
    const a = ((-90 + 15 * i) * Math.PI) / 180;
    bowl.push([18 + Math.cos(a) * 25, 25 + Math.sin(a) * 25]);
  }
  for (let i = 12; i >= 0; i -= 1) {
    const a = ((-90 + 15 * i) * Math.PI) / 180;
    bowl.push([18 + Math.cos(a) * 15, 25 + Math.sin(a) * 15]);
  }
  const rupee = [
    g([[0, 0], [60, 0], [60, 9], [0, 9]]),
    g([[0, 22], [60, 22], [60, 31], [0, 31]]),
    g(bowl),
    g([[0, 40], [20, 40], [20, 50], [0, 50]]),
    g([[3, 46], [18, 46], [58, 94], [41, 94]]),
  ];
  return {
    layers: [
      sky(k, e, null, [
        [40, 80, 130],
        [470, 60, 140],
        [500, 190, 100],
      ]),
      k.layer('coin', 2, [coinD]),
      k.layer('rupee', 4, [], rupee),
      k.layer('city', 3, [towers(k, e.x0, e.x1, 412, 232, 300)]),
      k.layer('near', 5, [ground(k, e, 350, 4)], [...tree(k, 90, 350, 120, 48), ...tree(k, 560, 350, 104, 42), k.blob(330, 350, 90, 16, 18, 0.3)]),
      kerb(k, e, 384),
    ],
  };
};

/** A sector map seen from above, with a pin: localities and sectors. */
const mappin: Scene = (k, e) => {
  const cols: number[] = [];
  for (let x = e.x0 - 12; x < e.x1 + 12; x += 96 + k.rand() * 50) cols.push(x);
  cols.push(e.x1 + 12);
  const rows = [-12, 118, 250, 336, ART_H + 12];
  const mainCol = cols.reduce((a, b) => (Math.abs(b - 236) < Math.abs(a - 236) ? b : a));
  let blocksD = '';
  let park: [number, number, number, number] | null = null;
  for (let r = 0; r < rows.length - 1; r += 1) {
    for (let c = 0; c < cols.length - 1; c += 1) {
      const gapX = (cols[c] === mainCol ? 12 : 7) as number;
      const gapX2 = (cols[c + 1] === mainCol ? 12 : 7) as number;
      const gapY = r === 1 ? 12 : 7;
      const gapY2 = r === 1 ? 12 : 7;
      const x = cols[c]! + gapX;
      const y = rows[r]! + (r === 2 ? 12 : gapY);
      const w = cols[c + 1]! - cols[c]! - gapX - gapX2;
      const h = rows[r + 1]! - rows[r]! - (r === 2 ? 12 : gapY) - (r === 1 ? 12 : gapY2);
      if (w < 30 || h < 30) continue;
      if (!park && r === 0 && cols[c]! > 0 && x + w < 200) {
        park = [x, y, w, h];
        continue;
      }
      blocksD += k.R(x, y, w, h);
      // Plot lines inside the block.
      if (w > 60) blocksD += k.R(x + w / 2 - 1, y + 6, 2, h - 12);
      if (h > 70) blocksD += k.R(x + 6, y + h / 2 - 1, w - 12, 2);
    }
  }
  const [px, py, pw, ph] = park ?? [20, 8, 140, 100];
  const trees: string[] = [];
  // A grove seen from above: overlapping canopies filling the park.
  const nT = Math.max(4, Math.round((pw * ph) / 2600));
  for (let i = 0; i < nT; i += 1) {
    const r = 11 + k.rand() * 9;
    trees.push(k.blob(px + r + k.rand() * (pw - 2 * r), py + r + k.rand() * (ph - 2 * r), r, r * 0.92, 12, 0.3));
  }
  const tipX = 392;
  const tipY = 250;
  const route: string[] = [];
  for (let x = 30; x < tipX - 14; x += 20) route.push(k.R(x, tipY - 2, 11, 4));
  const head: Pt[] = [];
  for (let i = 0; i <= 26; i += 1) {
    const a = ((140 + (260 * i) / 26) * Math.PI) / 180;
    head.push([tipX + Math.cos(a) * 32, tipY - 66 + Math.sin(a) * 32]);
  }
  const pin = k.P([...head, [tipX, tipY]]) + k.E(tipX, tipY - 66, 12, 12, 20);
  return {
    bg: 1,
    layers: [
      k.layer('blocks', 2, [blocksD]),
      k.layer('park', 3, [k.R(px, py, pw, ph)]),
      k.layer('trees', 4, [], [...trees, ...route]),
      k.layer('pin', 5, [pin]),
    ],
  };
};

/** A gated society: towers, the boundary wall and the main gate. */
const gate: Scene = (k, e) => {
  let society = '';
  const tops = [100, 80, 110, 86, 104];
  for (let i = 0; i < 5; i += 1) {
    const x = 36 + i * 120;
    const top = tops[i]! + k.rand() * 10;
    society += k.R(x, top, 84, 330);
    for (let y = top + 14, f = 0; y < 290; y += 22, f += 1) society += k.R(x + 8, y, 68, 4) + (f % 2 ? '' : k.G(x + 12, y + 9, 4, 1, 9, 7, 8, 0, 0.3));
  }
  const wall = (a: number, b: number) => k.R(a, 282, b - a, 70) + k.R(a + 4, 290, b - a - 8, 3);
  const bars: string[] = [];
  for (let x = 274; x < 366; x += 10) bars.push(k.R(x, 262, 3, 88));
  return {
    layers: [
      sky(k, e, [520, 92, 34], [
        [60, 60, 140],
        [300, 40, 120],
      ]),
      k.layer('far', 2, [society, ...(e.x0 < 0 ? [towers(k, e.x0, 20, 412, 120, 200), towers(k, 660, e.x1, 412, 120, 200)] : [])]),
      k.layer('trees', 3, [], [k.blob(140, 280, 70, 26, 22, 0.35), k.blob(470, 282, 60, 22, 20, 0.35), k.blob(640, 280, 70, 24, 20, 0.35), k.blob(-120, 280, 80, 24, 20, 0.35)]),
      k.layer(
        'wall',
        4,
        [wall(e.x0 - 12, 250), wall(390, e.x1 + 12), k.R(250, 226, 140, 24) + k.R(282, 234, 76, 7), k.R(404, 250, 60, 100) + k.R(418, 266, 32, 22)],
        [k.R(250, 226, 22, 124), k.R(368, 226, 22, 124), k.R(246, 218, 30, 10), k.R(364, 218, 30, 10), k.P([[398, 250], [434, 232], [470, 250]])],
      ),
      k.layer('near', 5, [ground(k, e, 350, 4)], [...bars, k.R(272, 272, 96, 4), k.R(272, 328, 96, 4), ...tree(k, 110, 350, 150, 60), ...tree(k, 568, 350, 128, 50)]),
      kerb(k, e, 384),
    ],
  };
};

/** A builder floor with a TO LET board on the gate: renting. */
const tolet: Scene = (k, e) => {
  let house = k.R(190, 120, 260, 300);
  for (const y of [132, 198]) {
    house += k.R(214, y + 6, 40, 28) + k.R(300, y + 6, 40, 28) + k.R(386, y + 6, 40, 28);
    house += k.G(206, y + 42, 22, 1, 3, 16, 7, 0);
  }
  house += k.R(300, 280, 40, 70) + k.R(214, 282, 50, 32) + k.R(376, 282, 50, 32);
  const parapet: string[] = [];
  for (let x = 190; x < 450; x += 20) parapet.push(k.R(x, 112, 10, 9));
  const wall = (a: number, b: number) => k.R(a, 300, b - a, 52) + k.R(a + 4, 307, b - a - 8, 3);
  const bars: string[] = [];
  for (let x = 252; x < 390; x += 11) bars.push(k.R(x, 300, 3, 52));
  const bx = 262;
  const bw = 116;
  const left = k.mirror ? ART_W - (bx + bw) : bx;
  const tw = letterWidth('TO LET');
  return {
    layers: [
      sky(k, e, [110, 88, 32], [
        [260, 60, 150],
        [480, 120, 110],
      ]),
      k.layer('far', 2, [blocks(k, e.x0, e.x1, 412, 150, 200)]),
      k.layer('house', 4, [house], [...parapet, k.R(400, 94, 30, 20), k.R(404, 112, 4, 8), k.R(422, 112, 4, 8)]),
      k.layer('near', 5, [ground(k, e, 350, 4), wall(e.x0 - 12, 238), wall(402, e.x1 + 12)], [k.R(238, 286, 14, 66), k.R(390, 286, 14, 66), ...bars, k.R(252, 300, 138, 5), ...tree(k, 90, 350, 140, 52)]),
      k.layer('board', 'paper', [k.U(k.box(left, 302, bw, 46))]),
      k.layer('letters', 5, [], letters(k, 'TO LET', left + (bw - tw * 1.1) / 2, 314, 1.1)),
      kerb(k, e, 384),
    ],
  };
};

/** A PG room: bed, study table, lamp, suitcase, the city in the window. */
const room: Scene = (k, e) => {
  const panes = k.R(360, 56, 96, 71) + k.R(464, 56, 96, 71) + k.R(360, 135, 96, 71) + k.R(464, 135, 96, 71);
  return {
    bg: 2,
    layers: [
      k.layer('city', 3, [towers(k, 340, 600, 230, 100, 170)]),
      k.layer('wall', 1, [k.R(e.x0 - 12, -12, e.x1 - e.x0 + 24, ART_H + 24) + panes + k.R(120, 92, 70, 50)]),
      k.layer('floor', 4, [ground(k, e, 336, 2)]),
      k.layer('rug', 3, [k.R(110, 346, 300, 18) + k.G(116, 350, 29, 1, 4, 10, 6, 0)]),
      k.layer(
        'furniture',
        5,
        [k.R(40, 256, 262, 30) + k.R(98, 260, 3, 22), k.R(500, 272, 80, 26) + k.R(526, 283, 28, 3)],
        [
          k.R(40, 196, 18, 140),
          k.R(40, 286, 262, 22),
          k.R(50, 306, 10, 30),
          k.R(284, 306, 10, 30),
          k.R(372, 262, 228, 10),
          k.R(382, 272, 10, 64),
          k.R(580, 272, 10, 64),
          k.R(400, 250, 24, 12),
          k.L(412, 250, 432, 208, 4),
          k.P([[416, 208], [450, 196], [460, 216], [428, 226]]),
          k.R(520, 226, 12, 36),
          k.R(534, 218, 12, 44),
          k.R(548, 232, 12, 30),
          k.L(250, -12, 250, 68, 2),
          k.E(250, 80, 9, 12, 16),
        ],
      ),
      k.layer(
        'suitcase',
        6,
        [k.R(300, 292, 50, 52) + k.R(312, 298, 3, 40) + k.R(335, 298, 3, 40)],
        [k.R(314, 278, 22, 5), k.R(314, 278, 4, 16), k.R(332, 278, 4, 16), k.E(308, 346, 4, 4, 10), k.E(342, 346, 4, 4, 10)],
      ),
    ],
  };
};

/**
 * The two desk scenes (seal, keys) in a wide strip: a folder stack at one end and
 * a mug and a pencil at the other, so the long desk has depth instead of an empty
 * field. They sit at |x - 320| > 400, outside the card and the phone crop.
 */
function deskEnds(k: Kit, e: Env): Layer[] {
  if (e.x0 >= 0) return [];
  const sheet = (x: number, y: number, w: number, h: number, deg: number) => k.RR(x, y, w, h, x + w / 2, y + h / 2, deg);
  return [
    k.layer('folderBack', 5, [sheet(-296, 110, 240, 190, 5), sheet(-284, 96, 76, 24, 5)]),
    k.layer('folderPapers', 'paper', [sheet(-284, 92, 212, 170, -3), sheet(-274, 102, 206, 164, 2)]),
    k.layer('folderInk', 2, [], [sheet(-256, 128, 120, 4, 2), sheet(-256, 144, 150, 4, 2), sheet(-256, 160, 96, 4, 2)]),
    k.layer('folderFront', 3, [sheet(-304, 186, 252, 124, 5)]),
    k.layer('mug', 'paper', [k.E(820, 140, 46, 46, 36), sheet(858, 128, 44, 24, 0)]),
    k.layer('coffee', 6, [k.E(820, 140, 35, 35, 32)]),
    k.layer('pencil', 5, [k.P(k.rot([[716, 318], [900, 318], [900, 332], [716, 332]], 808, 325, -10))]),
    k.layer('pencilTip', 'paper', [k.P(k.rot([[900, 318], [930, 325], [900, 332]], 808, 325, -10))]),
  ];
}

/** Papers on a desk with a seal and a pen: RERA, legal, agreements. */
const seal: Scene = (k, e) => {
  const tableRows = k.rand() < 0.5;
  // Text lines are printed on the sheets (solid strips), not cut through them.
  const aCx = 280;
  const aCy = 215;
  const a = k.RR(150, 60, 250, 310, aCx, aCy, -6);
  const aInk: string[] = [];
  for (let i = 0; i < 9; i += 1) aInk.push(k.RR(174, 96 + i * 22, 170 - (i % 3) * 30, 4, aCx, aCy, -6));
  const bCx = 360;
  const bCy = 200;
  const b = k.RR(232, 36, 256, 330, bCx, bCy, 3);
  const bInk: string[] = [k.RR(256, 64, 124, 10, bCx, bCy, 3)];
  for (let i = 0; i < (tableRows ? 5 : 8); i += 1) bInk.push(k.RR(256, 92 + i * 17, 208 - (i % 4) * 34, 4, bCx, bCy, 3));
  if (tableRows) {
    for (let r = 0; r < 4; r += 1) bInk.push(k.RR(256, 184 + r * 26, 208, 2, bCx, bCy, 3));
    for (const x of [256, 328, 400, 462]) bInk.push(k.RR(x, 184, 2, 80, bCx, bCy, 3));
  }
  bInk.push(k.P(k.rot([[260, 300], [276, 288], [284, 302], [300, 286], [306, 300], [322, 290], [323, 294], [306, 305], [300, 292], [284, 308], [276, 294], [261, 304]], bCx, bCy, 3)));
  const sx = 432;
  const sy = 298;
  const scallop: Pt[] = [];
  for (let i = 0; i < 36; i += 1) {
    const ang = (i / 36) * Math.PI * 2;
    const r = i % 2 === 0 ? 44 : 40;
    scallop.push([sx + Math.cos(ang) * r, sy + Math.sin(ang) * r]);
  }
  const sealD = k.P(scallop) + k.E(sx, sy, 34, 34, 32) + k.E(sx, sy, 30, 30, 32) + k.star(sx, sy, 17, 7, 5);
  const pcx = 150;
  const pcy = 330;
  const pen = (pts: Pt[]) => k.P(k.rot(pts, pcx, pcy, -26));
  return {
    bg: 2,
    layers: [
      ...deskEnds(k, e),
      k.layer('sheetA', 'paper', [a]),
      k.layer('inkA', 2, [], aInk),
      k.layer('sheetB', 'paper', [b]),
      k.layer('inkB', 2, [], bInk),
      k.layer(
        'ribbon',
        5,
        [],
        [k.P([[sx - 16, sy], [sx - 2, sy], [sx - 12, sy + 72], [sx - 20, sy + 62], [sx - 30, sy + 70]]), k.P([[sx + 2, sy], [sx + 16, sy], [sx + 30, sy + 70], [sx + 20, sy + 62], [sx + 12, sy + 72]])],
      ),
      k.layer('seal', 4, [sealD]),
      k.layer(
        'pen',
        6,
        [pen([[40, 322], [180, 322], [190, 326], [190, 334], [180, 338], [40, 338], [34, 330]]) + pen([[150, 324], [153, 324], [153, 336], [150, 336]])],
        [pen([[190, 324], [226, 330], [190, 336]]), pen([[56, 318], [120, 318], [120, 322], [56, 322]])],
      ),
    ],
  };
};

/** A vastu grid seen from above, a compass star and the rising sun in the east. */
const mandala: Scene = (k) => {
  const cx = 320;
  const cy = 206;
  const pts: Pt[] = [];
  for (let i = 0; i < 16; i += 1) {
    const ang = ((-90 + i * 22.5) * Math.PI) / 180;
    // Long points stop inside the strip crop (y 24 to 400).
    const r = i % 4 === 0 ? 174 : i % 2 === 0 ? 144 : 58;
    pts.push([cx + Math.cos(ang) * r, cy + Math.sin(ang) * r]);
  }
  let plot = k.R(212, 98, 216, 216);
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 3; c += 1) plot += k.R(224 + c * 68, 110 + r * 68, 56, 56);
  const rays: string[] = [];
  for (let i = 0; i < 8; i += 1) {
    const ang = (i / 8) * Math.PI * 2 + 0.39;
    const x = 574 + Math.cos(ang) * 46;
    const y = cy + Math.sin(ang) * 46;
    const x2 = 574 + Math.cos(ang) * 62;
    const y2 = cy + Math.sin(ang) * 62;
    rays.push(k.L(x, y, x2, y2, 6));
  }
  return {
    bg: 1,
    layers: [
      k.layer('star', 2, [k.P(pts)]),
      k.layer('plot', 3, [plot]),
      k.layer('home', 4, [k.P([[300, 226], [300, 204], [320, 186], [340, 204], [340, 226]]) + k.R(315, 212, 10, 14)], [k.E(574, cy, 34, 34, 30), ...rays]),
      k.layer('north', 5, [], [...letters(k, 'N', 63, 34), k.P([[70, 62], [80, 104], [70, 114], [60, 104]])]),
    ],
  };
};

/** A front door with a toran of mango leaves and a tulsi planter: new homes, vastu. */
const toran: Scene = (k, e) => {
  const door =
    k.R(258, 40, 62, 312) +
    k.R(266, 128, 46, 90) +
    k.R(266, 228, 46, 110) +
    (k.R(322, 40, 62, 312) + k.R(330, 128, 46, 90) + k.R(330, 228, 46, 110));
  const opening = k.P([[246, 352], [246, 134], ...k.arc(320, 134, 74, 70, 180, 360, 18).slice(1, -1), [394, 134], [394, 352]]);
  const wall = k.R(e.x0 - 12, -12, e.x1 - e.x0 + 24, ART_H + 24) + opening + k.R(468, 150, 26, 100) + k.R(500, 150, 26, 100) + k.R(532, 150, 26, 100) + k.R(410, 200, 36, 12);
  const leaves: string[] = [k.L(236, 108, 404, 108, 3)];
  for (let i = 0; i < 9; i += 1) {
    const x = 247 + i * 18.3;
    const len = 20 + (4 - Math.abs(i - 4)) * 3;
    leaves.push(k.P([[x - 5, 109], [x + 5, 109], [x + 1.5, 109 + len], [x, 113 + len], [x - 1.5, 109 + len]]));
    if (i < 8) leaves.push(k.E(x + 9, 115, 5, 5, 10));
  }
  return {
    bg: 2,
    layers: [
      k.layer('door', 4, [door], [k.R(310, 232, 4, 16), k.R(326, 232, 4, 16)]),
      k.layer('wall', 1, [wall]),
      k.layer('floor', 3, [ground(k, e, 350, 2)], [k.R(270, 352, 100, 8)]),
      k.layer('toran', 5, [], leaves),
      k.layer('flame', 4, [], [k.P([[500, 316], [506, 330], [500, 338], [494, 330]])]),
      k.layer(
        'near',
        6,
        [k.P([[110, 352], [104, 302], [176, 302], [170, 352]]) + k.R(112, 318, 56, 3)],
        [k.R(100, 294, 80, 10), k.L(140, 294, 140, 236, 3), k.blob(140, 272, 22, 18, 12, 0.3), k.blob(124, 250, 14, 13, 10, 0.3), k.blob(156, 246, 14, 15, 10, 0.3), k.blob(140, 228, 12, 13, 10, 0.3), k.P([[484, 338], [516, 338], [509, 352], [491, 352]])],
      ),
    ],
  };
};

/** A 360° camera on a tripod in a living room, with a ring around it: virtual tours. */
const tour: Scene = (k, e) => {
  const cx = 300;
  const cy = 190;
  const panes = k.R(60, 70, 76, 66) + k.R(144, 70, 76, 66) + k.R(60, 144, 76, 66) + k.R(144, 144, 76, 66);
  return {
    bg: 2,
    layers: [
      k.layer('city', 3, [towers(k, 40, 240, 230, 90, 170)]),
      k.layer('wall', 1, [k.R(e.x0 - 12, -12, e.x1 - e.x0 + 24, ART_H + 24) + panes]),
      k.layer('floor', 3, [ground(k, e, 334, 2)]),
      k.layer(
        'sofa',
        4,
        [k.R(392, 236, 216, 58) + k.R(498, 242, 3, 46), k.R(382, 294, 236, 26) + k.R(390, 300, 220, 2)],
        [k.R(370, 262, 24, 60), k.R(606, 262, 24, 60), k.R(392, 320, 8, 14), k.R(600, 320, 8, 14)],
      ),
      k.layer('ringBack', 5, [k.band(cx, cy, 150, 38, 11, 180, 360)]),
      k.layer(
        'camera',
        6,
        [k.R(286, 148, 28, 78) + k.E(300, 176, 9, 9, 20) + k.R(296, 204, 8, 3)],
        [k.L(300, 232, 236, 346, 5), k.L(300, 232, 300, 346, 4), k.L(300, 232, 364, 346, 5), k.R(290, 224, 20, 12)],
      ),
      k.layer('ringFront', 5, [k.band(cx, cy, 150, 38, 11, 0, 180)], [k.P([[cx - 162, cy + 2], [cx - 138, cy + 2], [cx - 150, cy - 18]])]),
    ],
  };
};

/** An envelope, a house key and its tag on a desk: deposits and handovers. */
const keys: Scene = (k, e) => {
  const ex = 300;
  const ey = 200;
  let env = k.RR(150, 104, 300, 196, ex, ey, -6);
  env += k.P(k.rot([[154, 108], [160, 108], [302, 206], [298, 210]], ex, ey, -6));
  env += k.P(k.rot([[440, 108], [446, 108], [302, 210], [298, 206]], ex, ey, -6));
  const kx = 420;
  const ky = 250;
  const key = (pts: Pt[]) => k.P(k.rot(pts, kx, ky, 24));
  const shaft = key([[446, 244], [600, 244], [600, 256], [590, 256], [590, 268], [578, 268], [578, 256], [566, 256], [566, 264], [556, 264], [556, 256], [446, 256]]);
  const bow = k.E(kx, ky, 30, 30, 32) + k.E(kx, ky, 16, 16, 24);
  return {
    bg: 2,
    layers: [
      ...deskEnds(k, e),
      k.layer('envelope', 'paper', [env]),
      k.layer('tag', 4, [k.P(k.rot([[250, 250], [330, 250], [330, 300], [250, 300], [232, 275]], 280, 275, 12)) + k.E(250, 266, 5, 5, 12)], [k.L(252, 268, 396, 250, 2)]),
      k.layer('key', 6, [bow, shaft]),
    ],
  };
};

/** A post box outside an office on a street: contact. */
const postbox: Scene = (k, e) => {
  const office = k.R(300, 120, 260, 300) + k.G(314, 134, 8, 6, 20, 18, 10, 8, 0.15) + k.R(390, 290, 80, 5) + k.R(400, 302, 60, 48);
  const box = k.R(140, 236, 60, 106) + k.R(152, 262, 36, 5) + k.R(156, 282, 28, 20);
  return {
    layers: [
      sky(k, e, [510, 84, 32], [
        [60, 60, 150],
        [380, 50, 120],
      ]),
      k.layer('far', 2, [towers(k, e.x0, e.x1, 412, 140, 230, [290, 570])]),
      k.layer('office', 3, [office], [k.R(420, 100, 40, 20)]),
      k.layer(
        'near',
        5,
        [ground(k, e, 350, 4), box],
        [k.P(k.arc(170, 236, 34, 24, 180, 360, 16)), k.R(134, 230, 72, 8), k.R(134, 340, 72, 10), ...tree(k, 56, 350, 150, 54), ...tree(k, 600, 350, 120, 40)],
      ),
      kerb(k, e, 384),
    ],
  };
};

/** A balance with a home on each pan: comparisons. */
const scale: Scene = (k, e) => {
  const pivot: Pt = [320, 116];
  const tilt = -5;
  const [l, r] = k.rot(
    [
      [166, 116],
      [474, 116],
    ],
    pivot[0],
    pivot[1],
    tilt,
  ) as [Pt, Pt];
  const pan = (p: Pt) => {
    const py = p[1] + 110;
    return { py, hang: [k.L(p[0], p[1], p[0] - 56, py, 2), k.L(p[0], p[1], p[0] + 56, py, 2)], bowl: k.P([[p[0] - 64, py], [p[0] + 64, py], ...k.arc(p[0], py, 64, 18, 0, 180, 14)]) };
  };
  const a = pan(l);
  const b = pan(r);
  const house = k.P([[l[0] - 32, a.py], [l[0] - 32, a.py - 38], [l[0], a.py - 64], [l[0] + 32, a.py - 38], [l[0] + 32, a.py]]) + k.R(l[0] - 7, a.py - 26, 14, 26) + k.R(l[0] - 24, a.py - 34, 10, 10);
  const tower = k.R(r[0] - 26, b.py - 72, 52, 72) + k.G(r[0] - 18, b.py - 64, 3, 4, 8, 9, 5, 7);
  // In a wide strip, windows at both ends show the city; the card view keeps a plain wall.
  const wideWall = e.x0 < 0 ? [k.layer('city', 3, [towers(k, -330, -120, 250, 80, 170), towers(k, 760, 970, 250, 80, 170)]), k.layer('wall', 1, [k.R(e.x0 - 12, -12, e.x1 - e.x0 + 24, ART_H + 24) + k.R(-320, 60, 90, 170) + k.R(-222, 60, 90, 170) + k.R(772, 60, 90, 170) + k.R(870, 60, 90, 170)])] : [];
  return {
    bg: e.x0 < 0 ? 2 : 1,
    layers: [
      ...wideWall,
      k.layer('items', 4, [house, tower]),
      k.layer('table', 5, [k.R(e.x0 - 12, 330, e.x1 - e.x0 + 24, 90) + k.R(e.x0, 342, e.x1 - e.x0, 3)]),
      k.layer(
        'balance',
        6,
        [],
        [k.R(316, 112, 8, 204), k.P([[280, 330], [292, 312], [348, 312], [360, 330]]), k.E(320, 104, 10, 10, 18), k.RR(162, 112, 316, 8, pivot[0], pivot[1], tilt), ...a.hang, ...b.hang, a.bowl, b.bowl],
      ),
    ],
  };
};

/** An open book with a bookmark and a pencil: the glossary. */
const book: Scene = (k) => {
  const lines = (x: number, y: number, n: number, w: number) => {
    let d = '';
    for (let i = 0; i < n; i += 1) d += k.R(x, y + i * 18, w - (i % 3 === 2 ? 50 : (i % 2) * 18), 4);
    return d;
  };
  const leftPage = k.P([[132, 70], [226, 60], [318, 66], [320, 336], [226, 330], [134, 340]]);
  // The letter A, cut out: outline, then the counter (fills again with evenodd).
  const ax = k.mx(170) - (k.mirror ? 36 : 0);
  const A = k.U([[ax, 130], [ax + 13, 92], [ax + 23, 92], [ax + 36, 130], [ax + 27, 130], [ax + 24, 120], [ax + 12, 120], [ax + 9, 130]]) + k.U([[ax + 14.5, 111], [ax + 18, 100], [ax + 21.5, 111]]);
  const pcx = 520;
  const pcy = 330;
  const pencil = (pts: Pt[]) => k.P(k.rot(pts, pcx, pcy, -64));
  return {
    bg: 2,
    layers: [
      k.layer('cover', 5, [], [k.R(116, 54, 408, 298)]),
      k.layer('pages', 'paper', [leftPage + A + lines(206, 100, 2, 90) + lines(152, 150, 9, 150), k.P([[322, 66], [414, 60], [508, 70], [506, 340], [414, 330], [320, 336]]) + k.R(344, 92, 140, 70) + lines(344, 184, 8, 144)]),
      k.layer('ribbon', 4, [], [k.P([[312, 330], [326, 330], [326, 386], [319, 377], [312, 386]])]),
      k.layer('pencil', 6, [pencil([[420, 326], [560, 326], [560, 336], [420, 336]]) + pencil([[540, 326], [543, 326], [543, 336], [540, 336]])], [pencil([[560, 326], [580, 331], [560, 336]])]),
    ],
  };
};

/** An aeroplane over the city and a suitcase on the kerb: NRI buyers. */
const plane: Scene = (k, e) => {
  const px = 430;
  const py = 108;
  const pl = (pts: Pt[]) => k.P(k.rot(pts.map(([x, y]) => [px + x, py + y] as Pt), px, py, -9));
  let body = pl([[-92, -7], [70, -9], [88, -5], [97, 0], [88, 5], [-80, 8], [-97, 2]]);
  for (let i = 0; i < 11; i += 1) body += pl([[-64 + i * 12, -3], [-58 + i * 12, -3], [-58 + i * 12, 1], [-64 + i * 12, 1]]);
  return {
    layers: [
      sky(k, e, [150, 96, 36], [
        [40, 170, 130],
        [470, 200, 100],
      ]),
      k.layer('plane', 4, [body], [pl([[-10, 3], [22, 3], [-28, 46], [-44, 46]]), pl([[0, -5], [16, -5], [-16, -30], [-27, -30]]), pl([[-80, -6], [-66, -6], [-86, -36], [-97, -36]]), pl([[-84, 3], [-72, 3], [-94, 15], [-103, 15]])]),
      k.layer('far', 2, [towers(k, e.x0, e.x1, 412, 200, 270)]),
      k.layer('mid', 3, [blocks(k, e.x0, e.x1, 412, 272, 306)]),
      k.layer('near', 5, [ground(k, e, 350, 4)], [...tree(k, 520, 350, 120, 48), k.blob(330, 350, 70, 16, 18, 0.3)]),
      k.layer('suitcase', 6, [k.R(130, 284, 58, 62) + k.R(144, 292, 3, 46) + k.R(171, 292, 3, 46)], [k.L(148, 284, 148, 248, 3), k.L(170, 284, 170, 248, 3), k.R(144, 244, 30, 6), k.E(140, 348, 4, 4, 10), k.E(178, 348, 4, 4, 10)]),
      kerb(k, e, 384),
    ],
  };
};

/** A sea-facing bungalow with a palm: celebrity homes. */
const bungalow: Scene = (k, e) => {
  const wave = (y: number, amp: number, phase: number) => {
    const pts: Pt[] = [];
    for (let x = e.x0 - 12; x <= e.x1 + 12; x += 20) pts.push([x, y + Math.sin(x / 26 + phase) * amp]);
    pts.push([e.x1 + 12, ART_H + 12], [e.x0 - 12, ART_H + 12]);
    return k.P(pts);
  };
  const land = k.P([[e.x0 - 12, ART_H + 12], [e.x0 - 12, 258], [360, 256], [392, 270], [430, 306], [452, ART_H + 12]]);
  // Ground floor: wide glass and a door. First floor: set back, with a balcony rail.
  const house =
    k.R(92, 186, 232, 72) + k.R(106, 200, 44, 44) + k.R(158, 200, 44, 44) + k.R(210, 200, 44, 44) + k.R(274, 206, 32, 52) +
    (k.R(132, 132, 164, 54) + k.R(146, 142, 52, 30) + k.R(210, 142, 30, 30) + k.R(250, 142, 30, 30));
  const rail = k.G(128, 170, 18, 1, 3, 12, 6, 0);
  const crownX = 396;
  const crownY = 168;
  const trunk: Pt[] = [];
  for (let i = 0; i <= 8; i += 1) {
    const t = i / 8;
    trunk.push([360 + (crownX - 360) * t * t + 8 * Math.sin(t * 3), 330 - (330 - crownY) * t]);
  }
  const fronds: string[] = [];
  for (const ang of [-160, -120, -70, -30, 10, 150]) {
    const a = (ang * Math.PI) / 180;
    const tx = crownX + Math.cos(a) * 72;
    const ty = crownY + Math.sin(a) * 40 + 24;
    const mxp = (crownX + tx) / 2;
    const myp = (crownY + ty) / 2 - 12;
    fronds.push(k.P([[crownX, crownY], [mxp, myp - 6], [tx, ty], [mxp, myp + 3]]));
  }
  return {
    layers: [
      sky(k, e, [500, 214, 42], [
        [80, 60, 150],
        [420, 90, 120],
      ]),
      k.layer('sea1', 2, [wave(236, 3, 0)]),
      k.layer('sea2', 3, [wave(270, 4, 1.4)]),
      k.layer('land', 4, [land]),
      k.layer('house', 5, [house], [k.R(80, 180, 256, 8), k.R(120, 124, 188, 9), k.R(124, 182, 176, 3), k.R(320, 248, 34, 10)]),
      k.layer('rail', 6, [], rail ? [rail] : []),
      k.layer('near', 6, [wave(344, 4, 2.6)], [k.P([...trunk.map(([x, y]) => [x - 5, y] as Pt), ...trunk.reverse().map(([x, y]) => [x + 5, y] as Pt)]), ...fronds, k.blob(560, 344, 60, 20, 16, 0.4), k.blob(620, 350, 40, 16, 14, 0.4)]),
    ],
  };
};

/** A work desk by a window: laptop, cutting chai, a plant, notes on the wall. */
const desk: Scene = (k, e) => {
  const panes = k.R(360, 50, 96, 66) + k.R(464, 50, 96, 66) + k.R(360, 124, 96, 66) + k.R(464, 124, 96, 66);
  const notes = [
    [96, 84, -6],
    [150, 96, 5],
    [110, 146, 3],
    [180, 150, -4],
  ] as const;
  return {
    bg: 2,
    layers: [
      k.layer('city', 3, [towers(k, 340, 600, 210, 80, 150)]),
      k.layer('wall', 1, [k.R(e.x0 - 12, -12, e.x1 - e.x0 + 24, ART_H + 24) + panes]),
      k.layer('notes', 'paper', notes.map(([x, y, d]) => k.RR(x, y, 40, 40, x + 20, y + 20, d) + k.RR(x + 7, y + 12, 26, 3, x + 20, y + 20, d) + k.RR(x + 7, y + 20, 18, 3, x + 20, y + 20, d))),
      k.layer('desk', 5, [k.R(440, 274, 108, 70) + k.R(452, 290, 84, 3) + k.R(452, 314, 84, 3)], [k.R(60, 262, 520, 12), k.R(80, 274, 12, 80), k.R(548, 274, 12, 80)]),
      k.layer('laptop', 4, [k.R(200, 184, 128, 76) + k.R(207, 191, 114, 62), k.P([[372, 262], [368, 230], [392, 230], [388, 262]]) + k.R(370, 242, 20, 3)], [k.P([[186, 256], [342, 256], [350, 262], [178, 262]])]),
      k.layer('plant', 6, [], [k.R(470, 230, 36, 32), k.P([[488, 230], [470, 196], [476, 194]]), k.P([[488, 230], [490, 184], [496, 186]]), k.P([[488, 230], [512, 200], [516, 205]]), k.P([[488, 230], [462, 214], [464, 208]])]),
    ],
  };
};

/** A phone with a chat about a home, over the city: the AI assistant. */
const chat: Scene = (k, e) => {
  const body: Pt[] = [...k.arc(264, 84, 22, 22, 180, 270, 5), ...k.arc(376, 84, 22, 22, 270, 360, 5), ...k.arc(376, 336, 22, 22, 0, 90, 5), ...k.arc(264, 336, 22, 22, 90, 180, 5)];
  const bubble = (x: number, y: number, w: number, h: number, tailLeft: boolean) =>
    k.R(x, y, w, h) + k.P(tailLeft ? [[x + 8, y + h], [x + 22, y + h], [x + 6, y + h + 10]] : [[x + w - 22, y + h], [x + w - 8, y + h], [x + w - 6, y + h + 10]]);
  return {
    layers: [
      sky(k, e, [520, 86, 30], [
        [60, 70, 140],
        [430, 170, 100],
      ]),
      k.layer('far', 2, [towers(k, e.x0, e.x1, 412, 150, 250)]),
      k.layer('mid', 3, [blocks(k, e.x0, e.x1, 412, 262, 300)]),
      k.layer('near', 5, [ground(k, e, 356, 4)], [...tree(k, 110, 356, 130, 50), ...tree(k, 560, 356, 116, 44)]),
      k.layer('phone', 6, [k.P(body)], [k.R(302, 70, 36, 5)]),
      k.layer('screen', 'paper', [k.R(254, 88, 132, 240)]),
      k.layer('bot', 3, [bubble(264, 102, 96, 38, true) + k.R(274, 112, 70, 4) + k.R(274, 124, 50, 4), k.R(264, 202, 104, 94) + k.P([[286, 262], [286, 238], [300, 226], [314, 238], [314, 262]]) + k.R(326, 234, 34, 4) + k.R(326, 246, 26, 4) + k.R(274, 272, 80, 4)]),
      k.layer('user', 4, [bubble(300, 156, 76, 28, false) + k.R(310, 166, 50, 4)], [k.R(264, 306, 112, 14)]),
    ],
  };
};

/** A signboard with a cut-out question mark: FAQ. */
const question: Scene = (k, e) => {
  const cx = 320;
  const cy = 170;
  const s = 2.4;
  const q = (pts: Pt[]) => k.U(pts.map(([x, y]) => [k.mx(cx) - 12 * s + x * s, cy - 20 * s + y * s] as Pt));
  const mark =
    q([[2, 10], [4, 4], [10, 0], [16, 0], [22, 4], [24, 10], [22, 16], [16, 21], [14, 24], [14, 29], [9, 29], [9, 23], [11, 18], [17, 13], [18, 10], [16, 6], [12, 5], [9, 7], [8, 11]]) +
    q([[9, 33], [14, 33], [14, 38], [9, 38]]);
  return {
    layers: [
      sky(k, e, [140, 90, 34], [
        [420, 70, 150],
        [60, 180, 110],
      ]),
      k.layer('far', 2, [towers(k, e.x0, e.x1, 412, 150, 250)]),
      k.layer('mid', 3, [blocks(k, e.x0, e.x1, 412, 262, 300)]),
      k.layer('near', 5, [ground(k, e, 350, 4), k.R(248, 96, 144, 140) + mark], [k.R(290, 236, 8, 116), k.R(342, 236, 8, 116), ...tree(k, 90, 350, 140, 52), ...tree(k, 560, 350, 120, 46)]),
      kerb(k, e, 384),
    ],
  };
};

const SCENES: Record<SceneName, Scene> = { crane, flyover, coin, mappin, gate, tolet, room, seal, mandala, toran, tour, keys, postbox, scale, book, plane, bungalow, desk, chat, question };
/* Scenes whose meaning depends on direction (north up, east right). */
const NO_MIRROR = new Set<SceneName>(['mandala']);

export const SCENE_NAMES = Object.keys(SCENES) as SceneName[];

/**
 * Draws a scene. The seed picks the light (day or dusk), whether the scene
 * is flipped left to right, and the small cuts, so posts with the same
 * scene still look different.
 */
export function paperArt(name: SceneName, seed: string, opts: { wide?: boolean; dusk?: boolean } = {}): Art {
  const r = rng(hash(`${name}:${seed}`));
  const dusk = opts.dusk ?? r() < 0.4;
  const mirror = !NO_MIRROR.has(name) && r() < 0.5;
  const pal = dusk ? DUSK : DAY;
  const e: Env = opts.wide ? { x0: -440, x1: 1080 } : { x0: -8, x1: 648 };
  const k = kit(`${name}:${seed}`, mirror, pal);
  const out = SCENES[name](k, e);
  // Both ranges are symmetric around the middle, so mirroring keeps them.
  const id = `sa${hash(`${name}:${seed}:${opts.wide ? 'w' : 'c'}:${dusk ? 'd' : 'n'}`).toString(36)}`;
  return { id, scene: name, bg: `var(--color-${pal[out.bg ?? 0]})`, layers: out.layers, x0: e.x0, x1: e.x1 };
}
