/**
 * Small paper-cut vignettes by theme, for menus, section openers, empty rows
 * and cards. Same language as the home diorama: flat kesar layers, hand-cut
 * edges, one short shadow per layer from a top-left light.
 *
 * Every vignette is 160 x 100. The seed changes the hand-cut jitter (and the
 * far skyline), so two vignettes of one theme on a page need not be twins.
 * The same theme and seed always give the same drawing.
 */
import { makeTools, type Layer, type Pt } from './shapes';

export const VIGNETTE_THEMES = [
  'home',
  'tower',
  'society',
  'office',
  'metro',
  'document',
  'calculator',
  'map',
  'key',
  'camera',
  'plot',
  'villa',
  'pg',
  'shop',
  'warehouse',
  'hospital',
  'mall',
  'school',
  'park',
] as const;
export type VignetteTheme = (typeof VIGNETTE_THEMES)[number];

export const VIGNETTE_W = 160;
export const VIGNETTE_H = 100;

const W = VIGNETTE_W;
const H = VIGNETTE_H;
/** Street level. */
const G = 82;

type Tools = ReturnType<typeof makeTools>;
type Tone = { fill: string; shadow: string };

const FAR: Tone = { fill: 'var(--color-kesar-200)', shadow: 'rgb(226 91 0 / 0.3)' };
const MID: Tone = { fill: 'var(--color-kesar-300)', shadow: 'rgb(181 70 0 / 0.35)' };
const MAIN: Tone = { fill: 'var(--color-kesar-500)', shadow: 'rgb(138 51 0 / 0.4)' };
const NEAR: Tone = { fill: 'var(--color-kesar-800)', shadow: 'rgb(47 15 2 / 0.45)' };
const SHEET: Tone = { fill: 'var(--color-paper)', shadow: 'rgb(138 51 0 / 0.3)' };
const LEAF: Tone = { fill: 'var(--color-kesar-700)', shadow: 'rgb(94 33 0 / 0.4)' };

const layer = (id: string, tone: Tone, cut: string[], solid: string[] = []): Layer => ({ id, depth: 0, ...tone, cut, solid });

/** Far towers with a few window holes. */
function far(t: Tools, base = 70): string {
  let d = '';
  let x = -4;
  while (x < W + 4) {
    const w = 9 + t.rand() * 9;
    const h = 10 + t.rand() * 26;
    d += t.rect(x, base - h, w, h + 40);
    if (w > 12 && h > 18) d += t.grid(x + 3, base - h + 4, 2, Math.floor((h - 8) / 6), 2, 3, w - 10, 3, 0.3);
    x += w + 1.5 + t.rand() * 3;
  }
  return d;
}

/** A ground sheet with a rough top edge. */
function ground(t: Tools, y = G, bump = 2): string {
  const pts: Pt[] = [[-4, y]];
  for (let x = 12; x < W; x += 16) pts.push([x, y - bump / 2 + t.rand() * bump]);
  pts.push([W + 4, y], [W + 4, H + 4], [-4, H + 4]);
  return t.path(pts);
}

/** A gulmohar: trunk plus a wide, rough canopy. Solid paths. */
function tree(t: Tools, cx: number, h: number, rx: number): string[] {
  return [t.rect(cx - 1.3, G - h * 0.7, 2.6, h * 0.7 + 1), t.blob(cx, G - h, rx, rx * 0.42, 14, 0.32)];
}

/** A hedge: a low, rough clump. Solid path. */
function bush(t: Tools, cx: number, rx: number): string {
  return t.blob(cx, G - 4, rx, 7.5, 22, 0.34);
}

/** A roof water tank on legs, as on every Gurugram house. */
function tank(t: Tools, x: number, y: number): string {
  return t.path([
    [x, y - 8],
    [x + 11, y - 8],
    [x + 11, y - 3],
    [x + 9.5, y - 3],
    [x + 9.5, y + 0.5],
    [x + 1.5, y + 0.5],
    [x + 1.5, y - 3],
    [x, y - 3],
  ]);
}

function home(seed: string): Layer[] {
  const t = makeTools(`v-home-${seed}`, 0.5);
  const bx = 46;
  const bw = 62;
  const top = 38;
  const body = t.rect(bx, top, bw, G + 1 - top) + t.grid(bx + 7, top + 8, 3, 2, 10, 8, 8, 8);
  return [
    layer('far', FAR, [far(t)]),
    layer('mid', MID, [ground(t)]),
    layer('main', MAIN, [body], [t.rect(bx - 2, top - 3, bw + 4, 4)]),
    layer('leaf', LEAF, [], [...tree(t, 132, 36, 17), bush(t, 22, 16)]),
    layer(
      'near',
      NEAR,
      // Front wall with a jali of small holes, and a pillar at the gate.
      [t.rect(112, 74, 40, 9) + t.grid(116, 77, 6, 1, 3, 3, 3.2, 0)],
      [tank(t, bx + 44, top - 3), t.rect(bx - 3, top + 18, bw + 6, 2.6), t.rect(bx + 26, 71, 10, 12), t.rect(109, 70, 5, 13)],
    ),
  ];
}

function tower(seed: string): Layer[] {
  const t = makeTools(`v-tower-${seed}`, 0.5);
  const x = 64;
  const w = 34;
  const top = 10;
  const main =
    t.path([
      [x, top + 10],
      [x + w, top],
      [x + w, G + 1],
      [x, G + 1],
    ]) + t.grid(x + 5, top + 18, 4, 7, 3, 4, 4, 2.6);
  const side = t.rect(102, 34, 24, 50) + t.grid(106, 40, 3, 5, 3, 3, 3.5, 4);
  const left = t.rect(30, 44, 26, 40) + t.grid(34, 50, 3, 4, 3, 3, 4, 4);
  return [
    layer('far', FAR, [far(t, 64)]),
    layer('mid', MID, [ground(t), side, left]),
    layer('main', MAIN, [main]),
    layer(
      'near',
      NEAR,
      [t.rect(56, 73, 50, 10) + t.grid(60, 76, 6, 1, 5, 4, 2.6, 0)],
    ),
    layer('leaf', LEAF, [], [bush(t, 20, 16), bush(t, 140, 18)]),
  ];
}

function society(seed: string): Layer[] {
  const t = makeTools(`v-society-${seed}`, 0.5);
  const block = (x: number, w: number, top: number) => {
    let d = t.rect(x, top, w, G + 1 - top) + tank(t, x + w - 16, top);
    for (let y = top + 7; y < G - 8; y += 9) d += t.rect(x + 4, y, w - 8, 2.2) + t.grid(x + 6, y + 4, Math.floor((w - 10) / 7), 1, 3, 2.6, 4, 0);
    return d;
  };
  return [
    layer('far', FAR, [far(t, 60)]),
    layer('mid', MID, [ground(t), block(12, 40, 34), block(108, 40, 38)]),
    layer('main', MAIN, [block(56, 48, 18)]),
    layer(
      'near',
      NEAR,
      // Society gate: two pillars and a beam with the name board cut in it.
      [t.rect(48, 52, 64, 7) + t.rect(62, 54.5, 36, 2)],
      [t.rect(50, 59, 6, 24), t.rect(104, 59, 6, 24), t.rect(58, 69, 44, 2.4)],
    ),
    layer('leaf', LEAF, [], [bush(t, 22, 16), bush(t, 140, 16)]),
  ];
}

function office(seed: string): Layer[] {
  const t = makeTools(`v-office-${seed}`, 0.5);
  const x = 38;
  const w = 84;
  const top = 22;
  let glass = t.rect(x, top, w, G + 1 - top);
  // Ribbon windows: long slits, one per floor.
  for (let y = top + 6; y < G - 10; y += 7) glass += t.rect(x + 5, y, w - 10, 3.4);
  return [
    layer('far', FAR, [far(t, 62)]),
    layer('mid', MID, [ground(t)]),
    layer('main', MAIN, [glass]),
    layer('leaf', LEAF, [], [...tree(t, 20, 32, 14), bush(t, 142, 16)]),
    layer(
      'near',
      NEAR,
      // Rooftop sign with slits for letters, and the entrance canopy on two posts.
      [t.rect(58, 12, 44, 8) + t.rect(62, 15, 8, 2.2) + t.rect(72, 15, 14, 2.2) + t.rect(88, 15, 10, 2.2)],
      [t.rect(62, 12 + 8, 2.4, 2.6), t.rect(96, 20, 2.4, 2.6), t.rect(64, 66, 32, 3), t.rect(66, 69, 2.4, 14), t.rect(92, 69, 2.4, 14)],
    ),
  ];
}

function metro(seed: string): Layer[] {
  const t = makeTools(`v-metro-${seed}`, 0.5);
  const beam = 58;
  const coach = (x: number, w: number, nose: boolean) => {
    const y = beam - 20;
    const outline: Pt[] = nose
      ? [
          [x, y],
          [x + w - 12, y],
          [x + w - 2, y + 8],
          [x + w, y + 19],
          [x, y + 19],
        ]
      : [
          [x, y + 1.5],
          [x + 1.5, y],
          [x + w - 1.5, y],
          [x + w, y + 1.5],
          [x + w, y + 19],
          [x, y + 19],
        ];
    return t.path(outline) + t.grid(x + 5, y + 4, Math.floor((w - (nose ? 18 : 8)) / 9), 1, 6, 6, 3, 0) + t.rect(x + 3, y + 13, w - (nose ? 10 : 6), 1.4);
  };
  return [
    layer('far', FAR, [far(t, 66)]),
    layer('mid', MID, [ground(t)]),
    layer('main', MAIN, [
      // Viaduct beam, two T piers, then the train on top.
      t.path([
        [-4, beam],
        [W + 4, beam - 3],
        [W + 4, beam + 6],
        [-4, beam + 10],
      ]),
      t.path([
        [30, beam + 9],
        [56, beam + 8],
        [48, beam + 15],
        [47, G + 1],
        [39, G + 1],
        [38, beam + 15],
      ]),
      t.path([
        [104, beam + 7],
        [130, beam + 6],
        [122, beam + 13],
        [121, G + 1],
        [113, G + 1],
        [112, beam + 13],
      ]),
      coach(14, 48, false) + coach(64, 48, false) + coach(114, 42, true),
    ]),
    layer('leaf', LEAF, [], [bush(t, 18, 18), bush(t, 80, 14), bush(t, 146, 16)]),
  ];
}

/** Maps (u, v) in 0..1 onto a tilted sheet with corners a (top left), b (top right) and d (bottom left). */
function sheet(a: Pt, b: Pt, d: Pt) {
  const at = (u: number, v: number): Pt => [a[0] + u * (b[0] - a[0]) + v * (d[0] - a[0]), a[1] + u * (b[1] - a[1]) + v * (d[1] - a[1])];
  const slit = (u1: number, u2: number, v: number, h: number): Pt[] => [at(u1, v), at(u2, v), at(u2, v + h), at(u1, v + h)];
  return { at, slit, outline: [at(0, 0), at(1, 0), at(1, 1), at(0, 1)] as Pt[] };
}

function documentScene(seed: string): Layer[] {
  const t = makeTools(`v-doc-${seed}`, 0.5);
  const back = sheet([30, 20], [90, 12], [38, 88]);
  const front = sheet([52, 14], [112, 10], [56, 90]);
  let page = t.path(front.outline) + t.path(front.slit(0.12, 0.66, 0.1, 0.05));
  for (const [v, u2] of [
    [0.26, 0.86],
    [0.34, 0.8],
    [0.42, 0.88],
    [0.5, 0.62],
  ] as const)
    page += t.path(front.slit(0.12, u2, v, 0.03));
  page += t.path(front.slit(0.12, 0.44, 0.84, 0.025));
  return [
    layer('desk', MID, [
      t.path([
        [-4, 64],
        [W + 4, 56],
        [W + 4, H + 4],
        [-4, H + 4],
      ]),
    ]),
    layer('back', { fill: 'var(--color-kesar-50)', shadow: SHEET.shadow }, [t.path(back.outline)]),
    layer('page', SHEET, [page]),
    layer(
      'near',
      NEAR,
      // A round office stamp on the page, and a pen beside it.
      [t.oct(94, 66, 11) + t.oct(94, 66, 8.4) + t.path([[88.6, 66.4], [90.6, 64.4], [92.6, 66.4], [97.6, 61.4], [99.6, 63.4], [92.6, 70.4]])],
      [
        t.path([
          [124, 26],
          [129, 24],
          [146, 76],
          [143, 82],
          [141, 78],
        ]),
      ],
    ),
  ];
}

function calculator(seed: string): Layer[] {
  const t = makeTools(`v-calc-${seed}`, 0.5);
  const paper = sheet([14, 22], [60, 16], [20, 90]);
  let loan = t.path(paper.outline);
  for (const v of [0.14, 0.26, 0.38, 0.5, 0.62]) loan += t.path(paper.slit(0.14, 0.82, v, 0.04));
  const coin = (x: number, y: number) =>
    t.path([
      [x + 3, y],
      [x + 21, y],
      [x + 24, y + 2],
      [x + 24, y + 4],
      [x + 21, y + 6],
      [x + 3, y + 6],
      [x, y + 4],
      [x, y + 2],
    ]);
  let coins = '';
  for (let k = 0; k < 5; k += 1) coins += coin(114 + (k % 2) * 1.2, 76 - k * 6.4);
  const body = t.rect(62, 12, 42, 72) + t.rect(67, 18, 32, 13) + t.rect(84, 21, 12, 7) + t.grid(67, 36, 4, 5, 6, 6, 2.7, 3);
  return [
    layer('desk', { fill: 'var(--color-kesar-200)', shadow: FAR.shadow }, [
      t.path([
        [-4, 70],
        [W + 4, 64],
        [W + 4, H + 4],
        [-4, H + 4],
      ]),
    ]),
    layer('paper', SHEET, [loan]),
    layer('coins', MAIN, [], [coins]),
    layer('body', NEAR, [body]),
  ];
}

function mapScene(seed: string): Layer[] {
  const t = makeTools(`v-map-${seed}`, 0.5);
  // A map folded in four, with a road and two parks cut out of it.
  const folds: Pt[] = [
    [18, 26],
    [50, 18],
    [82, 26],
    [114, 18],
    [142, 26],
    [142, 86],
    [114, 78],
    [82, 86],
    [50, 78],
    [18, 86],
  ];
  const road: Pt[] = [
    [24, 62],
    [50, 55],
    [80, 62],
    [108, 47],
    [136, 51],
  ];
  const strip: Pt[] = [...road.map(([x, y]) => [x, y - 1.8] as Pt), ...road.reverse().map(([x, y]) => [x, y + 1.8] as Pt)];
  const map = t.path(folds) + t.path(strip) + t.rect(30, 34, 12, 9) + t.rect(90, 64, 14, 8) + t.rect(60, 34, 7, 12);
  // Fold shading: the second and fourth panels are a shade darker.
  const shade = (x1: number, x2: number, up: boolean): string =>
    t.path(
      up
        ? [
            [x1, 18.6],
            [x2, 26.6],
            [x2, 85.4],
            [x1, 77.4],
          ]
        : [
            [x1, 26.6],
            [x2, 18.6],
            [x2, 77.4],
            [x1, 85.4],
          ],
    );
  const px = 102;
  const py = 14;
  const s = 1.5;
  const pin = t.path(
    [
      [12, 22],
      [5.2, 13.6],
      [4.8, 9],
      [6.6, 5],
      [10, 2.8],
      [14, 2.8],
      [17.4, 5],
      [19.2, 9],
      [18.8, 13.6],
    ].map(([x, y]) => [px + x! * s, py + y! * s] as Pt),
  ) + t.oct(px + 12 * s, py + 9.4 * s, 4.2);
  return [
    layer('ground', { fill: 'var(--color-kesar-200)', shadow: FAR.shadow }, [ground(t, 90, 1)]),
    layer('map', SHEET, [map]),
    layer('fold', { fill: 'var(--color-kesar-50)', shadow: 'transparent' }, [shade(50, 82, true), shade(114, 142, true)]),
    layer('pin', { fill: 'var(--color-kesar-700)', shadow: NEAR.shadow }, [pin]),
  ];
}

function key(seed: string): Layer[] {
  const t = makeTools(`v-key-${seed}`, 0.5);
  // A wall with a doorway; the door stands a little open.
  const wall = t.rect(-4, 4, W + 8, G - 3) + t.rect(60, 16, 42, G - 15);
  const door =
    t.path([
      [62, 17],
      [92, 22],
      [92, 78],
      [62, G + 1],
    ]) +
    t.path([
      [67, 25],
      [87, 28],
      [87, 46],
      [67, 45],
    ]) +
    t.path([
      [67, 52],
      [87, 52],
      [87, 72],
      [67, 75],
    ]);
  const bow = t.oct(40, 70, 10) + t.oct(40, 70, 4.6);
  const blade = t.path([
    [49, 67],
    [110, 67],
    [110, 74],
    [106, 74],
    [106, 78],
    [101, 78],
    [101, 74],
    [95, 74],
    [95, 77],
    [90, 77],
    [90, 74],
    [49, 74],
  ]);
  return [
    layer('wall', FAR, [wall]),
    layer('floor', MID, [ground(t, G + 1, 1)]),
    layer('door', MAIN, [door], [t.rect(84, 50, 4, 2.6)]),
    layer('plant', { fill: 'var(--color-kesar-700)', shadow: NEAR.shadow }, [], [
      t.path([
        [126, 70],
        [142, 70],
        [140, G + 1],
        [128, G + 1],
      ]),
      t.blob(134, 60, 12, 10, 12, 0.35),
    ]),
    layer('key', NEAR, [bow, blade]),
  ];
}

function camera(seed: string): Layer[] {
  const t = makeTools(`v-cam-${seed}`, 0.4);
  // The 360° ring: an ellipse band around the camera, with a gap for the arrow head.
  const ring = (rx: number, ry: number): Pt[] => {
    const pts: Pt[] = [];
    for (let k = 0; k <= 22; k += 1) {
      const a = (k / 24) * Math.PI * 2 + 0.3;
      pts.push([80 + Math.cos(a) * rx, 38 + Math.sin(a) * ry]);
    }
    return pts;
  };
  const outer = ring(52, 15);
  const inner = ring(48, 12).reverse();
  const band = t.path([...outer, ...inner]);
  const end = outer[outer.length - 1]!;
  const arrow = t.path([
    [end[0] - 3, end[1] - 5],
    [end[0] + 7, end[1] + 0.5],
    [end[0] - 1, end[1] + 7],
  ]);
  const head =
    t.path([
      [73, 20],
      [87, 20],
      [89, 22],
      [89, 50],
      [87, 52],
      [73, 52],
      [71, 50],
      [71, 22],
    ]) +
    t.oct(80, 32, 5.4) +
    t.oct(80, 32, 2.4);
  const legs = [
    t.rect(79, 52, 2.2, 14),
    t.path([
      [79, 64],
      [81, 64],
      [64, G + 1],
      [61, G + 1],
    ]),
    t.path([
      [79, 64],
      [81, 64],
      [99, G + 1],
      [96, G + 1],
    ]),
    t.rect(79.2, 64, 1.6, G - 63),
  ];
  return [
    layer('room', MID, [t.rect(12, 14, 34, 30) + t.grid(15, 17, 2, 2, 12.6, 11.6, 2.4, 2), ground(t, 74, 1)]),
    layer('ring', MAIN, [band + arrow]),
    layer('camera', NEAR, [head], legs),
  ];
}

/** Grass tuft: three quick cuts. Solid path. */
function tuft(t: Tools, x: number, y = G + 1): string {
  return t.path([
    [x, y],
    [x + 2, y - 7],
    [x + 4, y - 1.5],
    [x + 6, y - 9],
    [x + 7.5, y - 1.5],
    [x + 10, y - 6],
    [x + 11, y],
  ]);
}

function plot(seed: string): Layer[] {
  const t = makeTools(`v-plot-${seed}`, 0.5);
  // Corner stones of the plot and a rope between them, seen from the road.
  const stone = (x: number, y: number) =>
    t.path([
      [x, y],
      [x + 2, y - 3],
      [x + 5, y - 3],
      [x + 7, y],
      [x + 7, y + 7],
      [x, y + 7],
    ]);
  const rope = (x1: number, y1: number, x2: number, y2: number) =>
    t.path([
      [x1, y1],
      [x2, y2],
      [x2, y2 + 1.2],
      [x1, y1 + 1.2],
    ]);
  return [
    layer('far', FAR, [far(t, 66)]),
    layer('mid', MID, [ground(t, 70, 1.5), t.rect(-4, 40, 26, 32) + t.grid(2, 46, 2, 2, 5, 5, 6, 6), t.rect(136, 36, 28, 36) + t.grid(142, 42, 2, 3, 5, 5, 6, 4)]),
    layer(
      'board',
      MAIN,
      [
        // A blank board on two posts, with slits where the words would go.
        t.path([
          [88, 30],
          [130, 28],
          [131, 50],
          [89, 52],
        ]) +
          t.rect(95, 35, 28, 2.6) +
          t.rect(95, 41, 18, 2.6),
      ],
      [t.rect(95, 51, 3, 26), t.rect(121, 50, 3, 27)],
    ),
    layer('leaf', LEAF, [], [tuft(t, 40), tuft(t, 70, 90), tuft(t, 134, 88), bush(t, 150, 10)]),
    layer('near', NEAR, [], [stone(22, 76), stone(62, 70), stone(126, 70), stone(146, 86), rope(28, 77.5, 63, 71.5), rope(68, 71.5, 127, 71.5), rope(132, 72, 147, 87)]),
  ];
}

function villa(seed: string): Layer[] {
  const t = makeTools(`v-villa-${seed}`, 0.5);
  const body = t.rect(34, 44, 92, G + 1 - 44) + t.grid(42, 50, 4, 1, 12, 9, 9, 0) + t.grid(42, 64, 2, 1, 12, 10, 9, 0) + t.grid(98, 64, 1, 1, 14, 10, 0, 0);
  const upper = t.rect(50, 24, 60, 21) + t.grid(58, 29, 3, 1, 10, 9, 8, 0);
  return [
    layer('far', FAR, [far(t, 60)]),
    layer('mid', MID, [ground(t)]),
    layer('main', MAIN, [body, upper]),
    layer('leaf', LEAF, [], [...tree(t, 16, 40, 15), ...tree(t, 146, 34, 14)]),
    layer(
      'near',
      NEAR,
      // Pitched roofs, a porch on two columns, and the front gate.
      [t.rect(22, 73, 38, 10) + t.grid(25, 75, 6, 1, 3, 6, 3, 0), t.rect(100, 73, 38, 10) + t.grid(103, 75, 6, 1, 3, 6, 3, 0)],
      [
        t.path([
          [44, 25],
          [80, 12],
          [116, 25],
        ]),
        t.path([
          [28, 45],
          [132, 45],
          [124, 40],
          [36, 40],
        ]),
        t.rect(70, 60, 22, 3),
        t.rect(72, 63, 2.4, 20),
        t.rect(88, 63, 2.4, 20),
        t.rect(60, 70, 4, 13),
        t.rect(96, 70, 4, 13),
      ],
    ),
  ];
}

function pg(seed: string): Layer[] {
  const t = makeTools(`v-pg-${seed}`, 0.4);
  // A shared room: two beds, a window with bars, a desk and a cupboard.
  const bed = (x: number) =>
    t.path([
      [x, 60],
      [x + 3, 60],
      [x + 3, 66],
      [x + 44, 66],
      [x + 44, 62],
      [x + 47, 62],
      [x + 47, 84],
      [x + 44, 84],
      [x + 44, 78],
      [x + 3, 78],
      [x + 3, 84],
      [x, 84],
    ]);
  return [
    layer('wall', FAR, [t.rect(-4, 74, W + 8, 30), t.rect(58, 14, 44, 32) + t.grid(61, 17, 4, 1, 8.5, 26, 1.8, 0)]),
    layer('floor', MID, [ground(t, 84, 0.6)]),
    layer('beds', MAIN, [bed(8), bed(105)], [t.rect(58, 58, 44, 3), t.rect(60, 61, 2.4, 22), t.rect(97.6, 61, 2.4, 22)]),
    layer('sheets', SHEET, [], [t.rect(12, 60, 12, 5), t.rect(136, 62, 12, 5), t.rect(26, 67, 20, 10), t.rect(108, 67, 26, 10)]),
    layer('near', NEAR, [t.rect(134, 30, 22, 54) + t.rect(144.4, 34, 1.2, 46)], [t.rect(72, 52, 16, 6), t.rect(78, 44, 3, 8)]),
  ];
}

function shop(seed: string): Layer[] {
  const t = makeTools(`v-shop-${seed}`, 0.5);
  // A row of three shops: shutters half up, one awning, one signboard each.
  let row = '';
  for (const x of [8, 58, 108]) {
    row += t.rect(x, 34, 46, G + 1 - 34);
    for (let k = 0; k < 4; k += 1) row += t.rect(x + 5, 50 + k * 4, 36, 1.8);
  }
  const awning: [number, number][] = [
    [56, 38],
    [106, 38],
    [112, 48],
  ];
  for (let x = 112; x > 50; x -= 8) awning.push([x, 48], [x - 4, 52]);
  awning.push([50, 48]);
  return [
    layer('far', FAR, [far(t, 62)]),
    layer('mid', MID, [ground(t)]),
    layer('row', MAIN, [row]),
    layer(
      'near',
      NEAR,
      [
        t.rect(12, 38, 38, 8) + t.rect(16, 41, 20, 2),
        t.rect(62, 30, 38, 8) + t.rect(66, 33, 26, 2),
        t.rect(112, 38, 38, 8) + t.rect(116, 41, 14, 2),
        t.path(awning),
      ],
      [t.rect(64, 70, 34, 13), t.rect(70, 64, 8, 6), t.rect(82, 62, 10, 8)],
    ),
    layer('leaf', LEAF, [], [bush(t, 150, 10)]),
  ];
}

function warehouse(seed: string): Layer[] {
  const t = makeTools(`v-wh-${seed}`, 0.5);
  // A shed with a saw-tooth roof, two rolling shutters and a truck at the dock.
  const roof: [number, number][] = [[18, 40]];
  for (let x = 18; x < 142; x += 20) roof.push([x + 20, 26], [x + 20, 40]);
  roof.push([142, G + 1], [18, G + 1]);
  let shed = t.path(roof);
  for (const x of [30, 74]) {
    shed += t.rect(x, 52, 30, 30.5);
    for (let k = 0; k < 7; k += 1) shed += t.rect(x + 2, 54 + k * 4, 26, 1.6);
  }
  return [
    layer('far', FAR, [far(t, 60)]),
    layer('mid', MID, [ground(t)]),
    layer('shed', MAIN, [shed]),
    // The truck: box, cab with its window, two wheels.
    layer('near', NEAR, [t.rect(102, 56, 32, 21) + t.rect(106, 60, 24, 1.6), t.rect(136, 62, 13, 15) + t.rect(139, 64, 6, 5)], [t.oct(112, 79, 4), t.oct(141, 79, 4)]),
  ];
}

function hospital(seed: string): Layer[] {
  const t = makeTools(`v-hosp-${seed}`, 0.5);
  const x = 36;
  const w = 88;
  const body = t.rect(x, 26, w, G + 1 - 26) + t.grid(x + 7, 32, 7, 4, 7, 5, 4.2, 5);
  return [
    layer('far', FAR, [far(t, 60)]),
    layer('mid', MID, [ground(t)]),
    layer('main', { fill: 'var(--color-kesar-400)', shadow: MAIN.shadow }, [body]),
    // A white sign on the roof with the cross on it; the canopy over the doors.
    layer('sign', SHEET, [], [t.rect(66, 8, 28, 16)]),
    layer('cross', { fill: 'var(--color-kesar-600)', shadow: 'transparent' }, [], [t.rect(77.5, 10.5, 5, 11), t.rect(74.5, 13.5, 11, 5)]),
    layer('near', NEAR, [], [t.rect(58, 64, 44, 3), t.rect(60, 67, 2.4, 16), t.rect(97.6, 67, 2.4, 16), t.rect(70, 70, 20, 13)]),
    layer('leaf', LEAF, [], [bush(t, 18, 16), bush(t, 144, 14)]),
  ];
}

function mall(seed: string): Layer[] {
  const t = makeTools(`v-mall-${seed}`, 0.5);
  let box = t.rect(10, 38, 140, G + 1 - 38);
  for (let y = 46; y < 72; y += 8) box += t.rect(16, y, 44, 4) + t.rect(100, y, 44, 4);
  const atrium = t.path([
    [60, 22],
    [80, 14],
    [100, 22],
    [100, G + 1],
    [60, G + 1],
  ]) + t.grid(65, 26, 4, 5, 6, 7, 2.3, 3);
  return [
    layer('far', FAR, [far(t, 56)]),
    layer('mid', MID, [ground(t), box]),
    layer('atrium', MAIN, [atrium]),
    layer('near', NEAR, [t.rect(62, 58, 36, 7) + t.rect(66, 60.5, 28, 2)], [t.rect(56, 70, 48, 3), t.rect(66, 73, 28, 10)]),
    layer('leaf', LEAF, [], [bush(t, 16, 14), bush(t, 144, 14)]),
  ];
}

function school(seed: string): Layer[] {
  const t = makeTools(`v-school-${seed}`, 0.5);
  const body =
    t.path([
      [20, 42],
      [66, 42],
      [80, 24],
      [94, 42],
      [140, 42],
      [140, G + 1],
      [20, G + 1],
    ]) +
    t.grid(26, 50, 4, 2, 7, 7, 3.5, 5) +
    t.grid(99, 50, 4, 2, 7, 7, 3.5, 5) +
    t.oct(80, 36, 4) +
    t.rect(73, 60, 14, 22.5);
  return [
    layer('far', FAR, [far(t, 60)]),
    layer('mid', MID, [ground(t)]),
    layer('main', MAIN, [body]),
    layer('near', NEAR, [], [t.rect(150, 18, 1.8, 65), t.path([[151.8, 18], [158, 21], [151.8, 24]]), t.rect(78.6, 32.6, 2.8, 1.2), t.rect(79.4, 33.4, 1.2, 3.2)]),
    layer('leaf', LEAF, [], [...tree(t, 10, 30, 12), bush(t, 120, 12)]),
  ];
}

function park(seed: string): Layer[] {
  const t = makeTools(`v-park-${seed}`, 0.5);
  // A lawn with a walking path, gulmohar trees, a bench and a lamp.
  const path = t.path([
    [66, G - 12],
    [80, G - 12],
    [118, H + 4],
    [70, H + 4],
  ]);
  return [
    layer('far', FAR, [far(t, 58)]),
    layer('lawn', MID, [ground(t, G - 12, 2)]),
    layer('path', { fill: 'var(--color-kesar-100)', shadow: 'transparent' }, [path]),
    layer('leaf', LEAF, [], [...tree(t, 30, 46, 22), ...tree(t, 126, 50, 24), bush(t, 150, 10)]),
    layer(
      'near',
      NEAR,
      [],
      [
        // Bench: seat, back and two legs; the lamp beside the path.
        t.rect(34, 80, 26, 2.6),
        t.rect(34, 75, 26, 2),
        t.rect(36, 82, 2, 6),
        t.rect(56, 82, 2, 6),
        t.rect(98, 50, 1.8, 38),
        t.path([[96, 50], [104, 48], [104, 51], [97, 52]]),
      ],
    ),
  ];
}

const builders: Record<VignetteTheme, (seed: string) => Layer[]> = {
  home,
  tower,
  society,
  office,
  metro,
  document: documentScene,
  calculator,
  map: mapScene,
  key,
  camera,
  plot,
  villa,
  pg,
  shop,
  warehouse,
  hospital,
  mall,
  school,
  park,
};

const cache = new Map<string, Layer[]>();

export function vignetteLayers(theme: VignetteTheme, seed = '1'): Layer[] {
  const k = `${theme}:${seed}`;
  let layers = cache.get(k);
  if (!layers) {
    layers = builders[theme](seed);
    cache.set(k, layers);
  }
  return layers;
}

/** The PaperArt props that draw one vignette. Shared by PaperVignette.astro and PaperVignette.tsx. */
export function vignetteArt(theme: VignetteTheme, seed: string, frame: 'cut' | 'square' | 'none') {
  return {
    layers: vignetteLayers(theme, seed),
    width: VIGNETTE_W,
    height: VIGNETTE_H,
    bg: frame === 'none' ? null : 'var(--color-kesar-100)',
    cutEdge: frame === 'cut' ? `${theme}-${seed}` : undefined,
    shadow: [1.4, 2, 0.7] as [number, number, number],
  };
}
