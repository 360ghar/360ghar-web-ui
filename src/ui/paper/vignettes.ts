/**
 * Paper-cut vignettes: one small scene per tool and data hub page, in the
 * language of the home diorama (flat kesar layers, seeded hand-cut vertices,
 * one short shadow per layer from a top-left light). Holes are cut with fill-rule evenodd.
 *
 * Canvas 240 x 150, with 30 px of spare paper at each side (the card view
 * shows it, the phone view crops it). Objects stand on y = 134. `ground` is
 * kept apart, so a vignette can stand on the tool desk without it.
 */
import { makeTools, type Pt } from '@/lib/paper/shapes';
import type { ToolKey } from '@/features/tools/registry';

export const VW = 240;
export const VH = 150;
/** Spare paper at each side. */
export const VPAD = 30;
const G = 134;

type VLayer = { id: string; fill: string; shadow: string; cut: string[]; solid: string[] };
export type Vignette = { layers: VLayer[]; ground: string };

const FAR = { fill: 'var(--color-kesar-200)', shadow: 'rgb(226 91 0 / 0.3)' };
const MID = { fill: 'var(--color-kesar-400)', shadow: 'rgb(181 70 0 / 0.35)' };
const HOT = { fill: 'var(--color-kesar-500)', shadow: 'rgb(138 51 0 / 0.4)' };
const NEAR = { fill: 'var(--color-kesar-700)', shadow: 'rgb(94 33 0 / 0.4)' };
const DEEP = { fill: 'var(--color-kesar-800)', shadow: 'rgb(47 15 2 / 0.4)' };

type T = ReturnType<typeof makeTools>;

const layer = (id: string, tone: { fill: string; shadow: string }, cut: string[], solid: string[] = []): VLayer => ({ id, ...tone, cut, solid });

/** A near-round polygon (coins, knobs, lenses). */
const disc = (t: T, cx: number, cy: number, rx: number, ry = rx, n = 22) => {
  const pts: Pt[] = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    pts.push([cx + Math.cos(a) * rx, cy + Math.sin(a) * ry]);
  }
  return t.path(pts);
};

/** A straight strip from one point to another, `w` wide (pens, handles, strings). */
const strip = (t: T, [x1, y1]: Pt, [x2, y2]: Pt, w: number) => {
  const len = Math.hypot(x2 - x1, y2 - y1) || 1;
  const nx = (-(y2 - y1) / len) * (w / 2);
  const ny = ((x2 - x1) / len) * (w / 2);
  return t.path([
    [x1 + nx, y1 + ny],
    [x2 + nx, y2 + ny],
    [x2 - nx, y2 - ny],
    [x1 - nx, y1 - ny],
  ]);
};

/** A knife-cut tick mark with its corner at (x, y). */
const tick = (t: T, x: number, y: number, s = 1) =>
  t.path([
    [x - 7 * s, y - 6 * s],
    [x - 2 * s, y - 1 * s],
    [x + 8 * s, y - 12 * s],
    [x + 11 * s, y - 9 * s],
    [x - 2 * s, y + 4 * s],
    [x - 10 * s, y - 3 * s],
  ]);

/** A notary seal: a serrated ring. */
const seal = (t: T, cx: number, cy: number, r: number) => {
  const pts: Pt[] = [];
  for (let i = 0; i < 32; i += 1) {
    const a = (i / 32) * Math.PI * 2;
    const k = i % 2 ? 0.86 : 1;
    pts.push([cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]);
  }
  return t.path(pts);
};

/** Pavement with a rough top edge. */
function ground(seed: string): string {
  const t = makeTools(`${seed}-g`, 0.5);
  const pts: Pt[] = [[-VPAD - 4, G]];
  for (let x = -VPAD + 16; x < VW + VPAD; x += 28) pts.push([x, G - 1 + t.rand() * 2.5]);
  pts.push([VW + VPAD + 4, G], [VW + VPAD + 4, VH + 4], [-VPAD - 4, VH + 4]);
  return t.path(pts);
}

/** A small gabled house: body, roof, door and window holes. */
const house = (t: T, x: number, w: number, h: number, base = G) =>
  t.path([
    [x, base],
    [x, base - h],
    [x - 6, base - h],
    [x + w / 2, base - h - w * 0.52],
    [x + w + 6, base - h],
    [x + w, base - h],
    [x + w, base],
  ]) +
  t.rect(x + w * 0.4, base - h * 0.55, w * 0.2, h * 0.55 - 0.5) +
  t.rect(x + w * 0.12, base - h * 0.8, w * 0.18, h * 0.22) +
  t.rect(x + w * 0.7, base - h * 0.8, w * 0.18, h * 0.22);

/** A floor plan: an outline with rooms cut as wall gaps. */
const plan = (t: T, x: number, y: number, w: number, h: number, wall = 4) =>
  t.rect(x, y, w, h) +
  t.rect(x + wall, y + wall, w * 0.55 - wall * 1.5, h * 0.5 - wall * 1.5) +
  t.rect(x + w * 0.55 + wall / 2, y + wall, w * 0.45 - wall * 1.5, h * 0.5 - wall * 1.5) +
  t.rect(x + wall, y + h * 0.5 + wall / 2, w * 0.35 - wall * 1.5, h * 0.5 - wall * 1.5) +
  t.rect(x + w * 0.35 + wall / 2, y + h * 0.5 + wall / 2, w * 0.65 - wall * 1.5, h * 0.5 - wall * 1.5);

/* ------------------------------------------------------------------ */

function emi(): Vignette {
  const t = makeTools('vg-emi', 0.7);
  // A wall calendar: two binder tabs, a header band and the days cut out.
  const cal = t.rect(34, 26, 112, 102) + t.grid(44, 56, 6, 4, 11, 10, 6, 7);
  const coins = [0, 1, 2, 3].map((i) => {
    const y = G - 8 - i * 9;
    return t.rect(160, y - 2, 52, 10) + t.rect(162, y + 2.5, 48, 1.6);
  });
  coins.push(disc(t, 186, G - 37, 26, 6));
  return {
    ground: ground('emi'),
    layers: [
      layer('a', FAR, [cal], [t.rect(56, 18, 7, 14), t.rect(118, 18, 7, 14)]),
      // Paid days are filled on the near sheet, over their holes.
      layer('b', HOT, coins, [t.rect(44, 56, 11, 10), t.rect(61, 56, 11, 10), t.rect(78, 56, 11, 10)]),
      layer('c', NEAR, [disc(t, 150, G - 15, 15, 15) + disc(t, 150, G - 15, 9, 9)], [tick(t, 97, 64, 0.62)]),
    ],
  };
}

function loan(): Vignette {
  const t = makeTools('vg-loan', 0.7);
  const bow = disc(t, 176, 58, 22) + disc(t, 176, 58, 10);
  const key =
    t.path([
      [170, 76],
      [182, 76],
      [182, G - 2],
      [170, G - 2],
    ]) +
    t.rect(182, 104, 14, 7) +
    t.rect(182, 116, 10, 7);
  return {
    ground: ground('loan'),
    layers: [
      layer('a', FAR, [house(t, 38, 86, 58)]),
      layer('b', HOT, [bow, key]),
      layer('c', NEAR, [], [t.blob(24, G - 6, 18, 9, 12, 0.3), t.blob(140, G - 5, 14, 7, 10, 0.3)]),
    ],
  };
}

function capitalGains(): Vignette {
  const t = makeTools('vg-cg', 0.6);
  const beam = strip(t, [48, 50], [192, 40], 6);
  const pan = (cx: number, y: number) =>
    t.path([
      [cx - 30, y],
      [cx + 30, y],
      [cx + 22, y + 10],
      [cx - 22, y + 10],
    ]);
  return {
    ground: ground('cg'),
    layers: [
      layer('a', FAR, [disc(t, 214, 20, 13, 13, 24)]),
      layer(
        'b',
        MID,
        [
          beam +
            t.rect(117, 36, 6, 90) +
            t.path([
              [98, G],
              [104, 122],
              [136, 122],
              [142, G],
            ]),
        ],
        [strip(t, [52, 50], [34, 96], 1.6), strip(t, [52, 50], [70, 96], 1.6), strip(t, [188, 41], [170, 86], 1.6), strip(t, [188, 41], [206, 86], 1.6)],
      ),
      layer(
        'c',
        NEAR,
        [pan(52, 96), pan(188, 86), house(t, 40, 24, 16, 96)],
        [t.rect(176, 76, 24, 10), t.rect(178, 67, 20, 8), disc(t, 120, 34, 7)],
      ),
    ],
  };
}

function stampDuty(): Vignette {
  const t = makeTools('vg-stamp', 0.6);
  let deed = t.rect(30, 30, 108, 102);
  for (let i = 0; i < 5; i += 1) deed += t.rect(42, 44 + i * 11, i === 4 ? 44 : 84, 3.5);
  return {
    ground: ground('stamp'),
    layers: [
      layer('a', FAR, [deed]),
      layer('b', HOT, [seal(t, 108, 106, 18) + disc(t, 108, 106, 11)], [disc(t, 108, 106, 6)]),
      layer(
        'c',
        NEAR,
        [
          disc(t, 190, 42, 12) +
            t.rect(184, 52, 12, 30) +
            t.path([
              [166, 82],
              [214, 82],
              [218, 102],
              [162, 102],
            ]) +
            t.rect(160, 102, 60, 8),
        ],
      ),
    ],
  };
}

function rentReceipt(): Vignette {
  const t = makeTools('vg-rent', 0.5);
  const top = 18;
  const pts: Pt[] = [
    [56, top],
    [150, top],
  ];
  // A torn zigzag foot, the receipt silhouette.
  for (let x = 150; x > 56; x -= 8) pts.push([x, 120], [x - 4, 126]);
  pts.push([56, 120]);
  let receipt = t.path(pts);
  for (let i = 0; i < 4; i += 1) receipt += t.rect(68, 34 + i * 12, i % 2 ? 46 : 70, 3.5);
  receipt += t.rect(68, 94, 70, 8);
  return {
    ground: ground('rent'),
    layers: [
      layer('a', FAR, [receipt]),
      layer('b', HOT, [], [t.rect(96, 94, 42, 8)]),
      layer(
        'c',
        NEAR,
        [
          t.path([
            [150, 124],
            [206, 44],
            [216, 51],
            [160, 131],
          ]) +
            t.path([
              [150, 124],
              [160, 131],
              [146, 136],
            ]),
        ],
        [t.rect(204, 44, 4, 16)],
      ),
    ],
  };
}

function areaConverter(): Vignette {
  const t = makeTools('vg-area', 0.7);
  const plot = t.path([
    [24, 116],
    [66, 62],
    [214, 62],
    [196, 116],
  ]);
  let tape = t.rect(74, 112, 132, 9);
  for (let x = 80; x < 204; x += 8) tape += t.rect(x, 112, 1.6, x % 16 === 0 ? 5 : 3);
  return {
    ground: ground('area'),
    layers: [
      layer('a', FAR, [plot]),
      layer('b', HOT, [disc(t, 60, 114, 17) + disc(t, 60, 114, 6), tape]),
      layer(
        'c',
        NEAR,
        [],
        [
          t.rect(212, 30, 3, 34),
          t.path([
            [215, 30],
            [232, 36],
            [215, 42],
          ]),
          t.rect(64, 50, 3, 14),
        ],
      ),
    ],
  };
}

function carpet(): Vignette {
  const t = makeTools('vg-carpet', 0.5);
  return {
    ground: '',
    layers: [
      layer('a', FAR, [t.rect(24, 14, 192, 122) + t.rect(172, 14, 30, 30)]),
      layer('b', MID, [t.rect(42, 28, 150, 96)]),
      layer('c', NEAR, [plan(t, 58, 42, 118, 68, 4)]),
    ],
  };
}

function sqFt(): Vignette {
  const t = makeTools('vg-sqft', 0.4);
  const rows = 4;
  const cols = 6;
  const at = (c: number, r: number): Pt => {
    const k = r / rows;
    const y = 58 + 62 * k;
    const x0 = 62 - 42 * k;
    const x1 = 178 + 42 * k;
    return [x0 + ((x1 - x0) * c) / cols, y];
  };
  const tile = (c: number, r: number, dy = 0) => {
    const g = 1.4;
    const [a, b, cc, d] = [at(c, r), at(c + 1, r), at(c + 1, r + 1), at(c, r + 1)];
    return t.path([
      [a[0] + g, a[1] + g + dy],
      [b[0] - g, b[1] + g + dy],
      [cc[0] - g, cc[1] - g + dy],
      [d[0] + g, d[1] - g + dy],
    ]);
  };
  const floor: string[] = [];
  for (let r = 0; r < rows; r += 1) for (let c = 0; c < cols; c += 1) if (!(r === 2 && c === 3)) floor.push(tile(c, r));
  let ruler = t.rect(26, 128, 188, 10);
  for (let x = 32; x < 212; x += 9) ruler += t.rect(x, 128, 1.6, (x - 32) % 27 === 0 ? 6 : 3.5);
  return {
    ground: '',
    layers: [layer('a', FAR, [], floor), layer('b', HOT, [], [tile(3, 2, -12)]), layer('c', NEAR, [ruler])],
  };
}

function acreInGaj(): Vignette {
  const t = makeTools('vg-acre', 0.6);
  let field = t.path([
    [0, 128],
    [40, 70],
    [200, 70],
    [240, 128],
  ]);
  for (let i = 0; i < 7; i += 1) {
    const x0 = 48 + i * 22;
    const x1 = 8 + i * 36;
    field += t.path([
      [x0, 74],
      [x0 + 5, 74],
      [x1 + 12, 126],
      [x1 + 3, 126],
    ]);
  }
  return {
    ground: ground('acre'),
    layers: [
      layer('a', FAR, [t.blob(70, 76, 90, 26, 18, 0.2) + t.blob(190, 78, 70, 20, 16, 0.2)]),
      layer('b', MID, [field]),
      layer('c', NEAR, [house(t, 180, 34, 24, 70)], [t.rect(14, 104, 3, 26), t.rect(34, 104, 3, 26), t.rect(12, 110, 28, 3)]),
    ],
  };
}

function mofa(): Vignette {
  const t = makeTools('vg-mofa', 0.5);
  return {
    ground: '',
    layers: [
      layer('a', FAR, [plan(t, 20, 46, 78, 68, 3)]),
      layer('b', MID, [plan(t, 138, 30, 88, 96, 6)]),
      layer('c', NEAR, [
        t.path([
          [104, 76],
          [118, 76],
          [118, 68],
          [132, 80],
          [118, 92],
          [118, 84],
          [104, 84],
        ]),
      ]),
    ],
  };
}

function checklist(): Vignette {
  const t = makeTools('vg-check', 0.6);
  let paper = t.rect(72, 34, 96, 94);
  for (let i = 0; i < 3; i += 1) paper += t.rect(104, 52 + i * 24, 52, 4);
  return {
    ground: ground('check'),
    layers: [
      layer('a', FAR, [
        t.path([
          [46, 36],
          [138, 22],
          [154, 118],
          [62, 132],
        ]),
      ]),
      layer('b', HOT, [t.rect(62, 22, 116, 110)], [t.rect(98, 14, 44, 14)]),
      layer('c', { fill: 'var(--color-kesar-50)', shadow: 'rgb(138 51 0 / 0.35)' }, [paper]),
      layer('d', NEAR, [], [tick(t, 88, 58, 0.72), tick(t, 88, 82, 0.72), t.rect(80, 100, 14, 3)]),
    ],
  };
}

function fakeListing(): Vignette {
  const t = makeTools('vg-fake', 0.6);
  let sheet = t.rect(28, 24, 118, 104);
  sheet += house(t, 46, 34, 22, 78);
  for (let i = 0; i < 3; i += 1) sheet += t.rect(40, 90 + i * 10, i === 2 ? 48 : 90, 3.5);
  return {
    ground: ground('fake'),
    layers: [
      layer('a', FAR, [sheet]),
      layer('b', NEAR, [disc(t, 156, 66, 32) + disc(t, 156, 66, 23), strip(t, [178, 90], [210, G - 4], 11)]),
      layer('c', HOT, [], [t.rect(152, 50, 8, 20), t.rect(152, 75, 8, 7)]),
    ],
  };
}

function ownership(): Vignette {
  const t = makeTools('vg-own', 0.8);
  const parcels = [
    t.path([
      [20, 22],
      [92, 18],
      [86, 70],
      [24, 76],
    ]),
    t.path([
      [98, 18],
      [168, 22],
      [160, 64],
      [92, 70],
    ]),
    t.path([
      [174, 22],
      [222, 26],
      [218, 84],
      [166, 70],
    ]),
    t.path([
      [24, 82],
      [86, 76],
      [90, 130],
      [18, 128],
    ]),
    t.path([
      [166, 76],
      [218, 90],
      [222, 130],
      [160, 128],
    ]),
  ];
  const mine = t.path([
    [92, 76],
    [160, 70],
    [154, 128],
    [96, 130],
  ]);
  // A map pin: one teardrop outline with a round hole.
  const drop: Pt[] = [[124, 94]];
  for (let i = 0; i <= 16; i += 1) {
    const a = ((240 - (i * 300) / 16) * Math.PI) / 180;
    drop.push([124 + Math.cos(a) * 15, 58 - Math.sin(a) * 15]);
  }
  const pin = t.path(drop) + disc(t, 124, 57, 6);
  return {
    ground: '',
    layers: [layer('a', FAR, [], parcels), layer('b', HOT, [mine]), layer('c', NEAR, [pin])],
  };
}

function aiDesign(): Vignette {
  const t = makeTools('vg-ai', 0.6);
  const wall = t.rect(10, 10, 220, 110) + t.rect(128, 26, 60, 50) + t.rect(40, 34, 40, 30);
  const sofa =
    t.path([
      [40, 94],
      [44, 80],
      [136, 80],
      [140, 94],
      [150, 94],
      [150, 120],
      [30, 120],
      [30, 94],
    ]) +
    t.rect(52, 100, 36, 2.5) +
    t.rect(92, 100, 36, 2.5);
  return {
    ground: ground('ai'),
    layers: [
      layer('a', FAR, [wall], [t.rect(157, 26, 2.5, 50), t.rect(128, 50, 60, 2.5)]),
      layer(
        'b',
        MID,
        [
          t.path([
            [190, 58],
            [214, 58],
            [220, 78],
            [184, 78],
          ]),
        ],
        [t.rect(200, 78, 3, 52), t.rect(192, 128, 20, 4), t.blob(58, 50, 12, 10, 10, 0.3)],
      ),
      layer('c', NEAR, [sofa], [t.rect(36, 120, 5, 10), t.rect(140, 120, 5, 10)]),
    ],
  };
}

function blueprint(): Vignette {
  const t = makeTools('vg-bp', 0.5);
  const floor = t.path([
    [120, 70],
    [206, 104],
    [120, 138],
    [34, 104],
  ]);
  const left =
    t.path([
      [34, 104],
      [34, 40],
      [120, 6],
      [120, 70],
    ]) +
    t.path([
      [56, 96],
      [56, 62],
      [74, 55],
      [74, 89],
    ]);
  const right =
    t.path([
      [120, 70],
      [120, 6],
      [206, 40],
      [206, 104],
    ]) +
    t.path([
      [148, 44],
      [180, 57],
      [180, 76],
      [148, 63],
    ]);
  const bed =
    t.path([
      [120, 96],
      [156, 110],
      [134, 119],
      [98, 105],
    ]) +
    t.path([
      [98, 105],
      [134, 119],
      [134, 126],
      [98, 112],
    ]);
  return {
    ground: '',
    layers: [layer('a', FAR, [floor]), layer('b', MID, [left]), layer('c', HOT, [right]), layer('d', NEAR, [bed])],
  };
}

function vastu(): Vignette {
  const t = makeTools('vg-vastu', 0.5);
  const cx = 120;
  const cy = 76;
  const star: Pt[] = [];
  for (let i = 0; i < 16; i += 1) {
    const a = (i / 16) * Math.PI * 2 - Math.PI / 2;
    const r = i % 4 === 0 ? 50 : i % 2 === 0 ? 30 : 13;
    star.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r]);
  }
  return {
    ground: '',
    layers: [
      layer('a', FAR, [plan(t, 44, 16, 152, 122, 5)]),
      layer('b', HOT, [t.path(star) + disc(t, cx, cy, 5)]),
      layer('c', NEAR, [], [
        t.path([
          [cx - 7, 20],
          [cx, 6],
          [cx + 7, 20],
        ]),
      ]),
    ],
  };
}

/* ------------------------------------------------------------------ */
/* Data hub pages.                                                    */
/* ------------------------------------------------------------------ */

/** A price tag on a string, hung from (x, y). */
const tag = (t: T, x: number, y: number) =>
  t.path([
    [x - 12, y + 14],
    [x, y + 4],
    [x + 12, y + 14],
    [x + 12, y + 40],
    [x - 12, y + 40],
  ]) + disc(t, x, y + 13, 3);

function circleRates(): Vignette {
  const t = makeTools('vg-cr', 0.8);
  const blocks: string[] = [];
  const xs = [18, 76, 134, 184];
  const ys = [20, 64, 106];
  for (const x of xs) for (const y of ys) if (!(x === 134 && y === 64)) blocks.push(t.rect(x, y, x === 184 ? 40 : 50, y === 106 ? 26 : 36));
  return {
    ground: '',
    layers: [
      layer('a', FAR, [], blocks),
      layer('b', HOT, [], [t.rect(134, 64, 50, 36)]),
      layer('c', NEAR, [tag(t, 160, 34)], [strip(t, [160, 24], [160, 38], 1.4)]),
    ],
  };
}

function rera(): Vignette {
  const t = makeTools('vg-rera', 0.6);
  const tower = t.rect(40, 44, 70, G - 44) + t.grid(48, 52, 4, 6, 10, 9, 5, 5, 0.25);
  const frame = t.rect(116, 70, 54, G - 70) + t.grid(122, 76, 3, 4, 12, 9, 4, 4.5) + t.rect(116, 60, 54, 4);
  const crane =
    t.rect(184, 20, 6, G - 20) +
    t.path([
      [120, 20],
      [226, 20],
      [226, 26],
      [120, 26],
    ]) +
    t.rect(212, 26, 12, 12);
  return {
    ground: ground('rera'),
    layers: [
      layer('a', FAR, [tower]),
      layer('b', MID, [frame]),
      layer('c', NEAR, [crane], [strip(t, [140, 26], [140, 52], 1.4), t.rect(134, 52, 12, 6)]),
    ],
  };
}

function auctions(): Vignette {
  const t = makeTools('vg-auc', 0.6);
  // The gavel: a head, a handle down to the right, and the sound block.
  const head = t.path([
    [118, 44],
    [160, 20],
    [172, 40],
    [130, 64],
  ]);
  return {
    ground: ground('auc'),
    layers: [
      layer('a', FAR, [house(t, 24, 72, 50)]),
      layer('b', HOT, [head + t.rect(136, 36, 3, 18)], [strip(t, [152, 44], [206, 112], 7)]),
      layer('c', NEAR, [
        t.path([
          [110, 112],
          [176, 112],
          [180, G],
          [106, G],
        ]),
      ]),
    ],
  };
}

function sources(): Vignette {
  const t = makeTools('vg-src', 0.5);
  const screen = t.rect(44, 18, 152, 92) + t.rect(52, 26, 136, 76);
  const page = house(t, 70, 40, 26, 86) + t.rect(128, 40, 48, 4) + t.rect(128, 52, 36, 4) + t.rect(128, 64, 44, 4);
  return {
    ground: ground('src'),
    layers: [
      layer('a', FAR, [], [t.rect(52, 26, 136, 76)]),
      layer('b', MID, [page]),
      layer(
        'c',
        NEAR,
        [screen],
        [
          t.path([
            [108, 110],
            [132, 110],
            [138, G],
            [102, G],
          ]),
        ],
      ),
    ],
  };
}

function zones(): Vignette {
  const t = makeTools('vg-zone', 0.6);
  const b = (x: number, w: number, h: number) => t.rect(x, G - h, w, h) + t.grid(x + 7, G - h + 8, Math.floor((w - 10) / 12), Math.floor((h - 14) / 14), 6, 8, 6, 6);
  return {
    ground: ground('zone'),
    layers: [
      layer('a', FAR, [b(26, 44, 40)]),
      layer('b', MID, [b(80, 50, 70)]),
      layer('c', HOT, [b(140, 44, 104)]),
      layer(
        'd',
        NEAR,
        [],
        [
          t.rect(204, 30, 3, G - 30),
          t.path([
            [198, 38],
            [205.5, 26],
            [213, 38],
          ]),
          t.rect(198, G - 3, 16, 3),
        ],
      ),
    ],
  };
}

function gazette(): Vignette {
  const t = makeTools('vg-gz', 0.6);
  let paper = t.rect(54, 24, 132, 102) + t.rect(66, 36, 108, 12);
  for (let c = 0; c < 3; c += 1) for (let r = 0; r < 5; r += 1) paper += t.rect(66 + c * 38, 58 + r * 11, 32, 3.5);
  return {
    ground: ground('gz'),
    layers: [
      layer('a', FAR, [
        t.path([
          [34, 40],
          [150, 20],
          [166, 118],
          [50, 132],
        ]),
      ]),
      layer('b', { fill: 'var(--color-kesar-50)', shadow: 'rgb(138 51 0 / 0.35)' }, [paper]),
      layer('c', HOT, [], [t.rect(66, 36, 64, 12)]),
      layer('d', NEAR, [], [disc(t, 120, 24, 6), strip(t, [120, 24], [124, 34], 2)]),
    ],
  };
}

function builders(): Vignette {
  const t = makeTools('vg-bld', 0.6);
  const hat =
    t.path([
      [132, 110],
      [136, 90],
      [150, 78],
      [170, 76],
      [188, 84],
      [196, 104],
      [198, 110],
    ]) +
    t.path([
      [118, 110],
      [212, 110],
      [212, 118],
      [118, 118],
    ]);
  return {
    ground: ground('bld'),
    layers: [
      layer('a', FAR, [t.rect(26, 30, 50, G - 30) + t.grid(34, 38, 3, 6, 9, 9, 6, 6, 0.2), t.rect(84, 58, 40, G - 58) + t.grid(91, 66, 2, 4, 9, 9, 7, 6)]),
      layer('b', HOT, [hat + t.rect(162, 80, 4, 30)]),
      layer('c', NEAR, [], [t.rect(128, 118, 76, 4)]),
    ],
  };
}

function builderScore(): Vignette {
  const t = makeTools('vg-bs', 0.5);
  const tw = (x: number, h: number) => t.rect(x, G - h, 30, h) + t.grid(x + 6, G - h + 8, 2, Math.floor((h - 14) / 13), 6, 7, 6, 6);
  let ruler = t.rect(196, 20, 12, G - 20);
  for (let y = 26; y < G - 4; y += 9) ruler += t.rect(196, y, (y - 26) % 27 === 0 ? 7 : 4, 1.6);
  return {
    ground: ground('bs'),
    layers: [
      layer('a', FAR, [tw(36, 60)]),
      layer('b', MID, [tw(80, 86)]),
      layer('c', HOT, [tw(124, 108)]),
      layer('d', NEAR, [ruler]),
    ],
  };
}

function tenant(): Vignette {
  const t = makeTools('vg-ten', 0.6);
  const row = t.rect(20, 54, 140, G - 54) + t.grid(30, 64, 5, 3, 16, 14, 11, 10);
  const lit = [t.rect(30, 64, 16, 14), t.rect(84, 64, 16, 14), t.rect(57, 88, 16, 14), t.rect(111, 88, 16, 14), t.rect(30, 112, 16, 14), t.rect(138, 64, 16, 14)];
  return {
    ground: ground('ten'),
    layers: [
      layer('a', FAR, [row], [t.rect(14, 48, 152, 8)]),
      layer('b', HOT, [], lit),
      layer('c', NEAR, [t.rect(176, 60, 50, 32) + t.rect(184, 70, 34, 4) + t.rect(184, 78, 22, 4)], [t.rect(184, 92, 4, G - 92), t.rect(214, 92, 4, G - 92)]),
    ],
  };
}

function bestSectors(): Vignette {
  const t = makeTools('vg-best', 0.6);
  // A folded map: four panels that zigzag in depth.
  const panel = (x: number, dy: number) =>
    t.path([
      [x, 30 + dy],
      [x + 46, 30 - dy],
      [x + 46, 118 - dy],
      [x, 118 + dy],
    ]);
  const drop: Pt[] = [[150, 86]];
  for (let i = 0; i <= 16; i += 1) {
    const a = ((240 - (i * 300) / 16) * Math.PI) / 180;
    drop.push([150 + Math.cos(a) * 14, 52 - Math.sin(a) * 14]);
  }
  return {
    ground: '',
    layers: [
      layer('a', FAR, [], [panel(28, 6), panel(120, 6)]),
      layer('b', MID, [], [panel(74, -6), panel(166, -6)]),
      layer('c', NEAR, [t.path(drop) + disc(t, 150, 51, 5.5)], [strip(t, [44, 96], [104, 70], 3), strip(t, [104, 70], [150, 88], 3)]),
    ],
  };
}

function priceIndex(): Vignette {
  const t = makeTools('vg-pi', 0.6);
  return {
    ground: ground('pi'),
    layers: [
      layer('a', FAR, [house(t, 30, 64, 44)], []),
      layer('b', MID, [house(t, 116, 52, 34)]),
      layer('c', NEAR, [tag(t, 196, 40)], [strip(t, [184, 66], [196, 44], 1.4)]),
    ],
  };
}

type HubArt = 'circleRates' | 'rera' | 'auctions' | 'sources' | 'zones' | 'gazette' | 'builders' | 'builderScore' | 'tenant' | 'bestSectors' | 'priceIndex';
export type VignetteKey = ToolKey | HubArt;

const BUILDERS: Record<VignetteKey, () => Vignette> = {
  emi,
  loanEligibility: loan,
  capitalGains,
  stampDuty,
  rentReceipt,
  areaConverter,
  areaCalculator: carpet,
  sqFt,
  acreInGaj,
  mofaToRera: mofa,
  propertyChecklist: checklist,
  fakeListing,
  verifyOwnership: ownership,
  aiDesignStudio: aiDesign,
  designBlueprint: blueprint,
  vastu,
  circleRates,
  rera,
  auctions,
  sources,
  zones,
  gazette,
  builders,
  builderScore,
  tenant,
  bestSectors,
  priceIndex,
};

const cache = new Map<VignetteKey, Vignette>();

export function vignette(key: VignetteKey): Vignette {
  let v = cache.get(key);
  if (!v) {
    v = BUILDERS[key]();
    cache.set(key, v);
  }
  return v;
}

/** Colour of the ground strip, so pages can match it. */
export const GROUND = DEEP;
