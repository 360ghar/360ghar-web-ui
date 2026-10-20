/**
 * Small paper-cut vignettes for the home page, in the language of the street
 * diorama: flat kesar layers, hand-cut edges from fixed seeds, one short shadow
 * per layer from a top-left light. Steps are 320 x 200; the owners scene is
 * 480 x 300 and has no background, because it sits on an orange sheet. The app is 360 wide and 392 tall, starting at y = 28 (see TOP).
 */
import { makeTools, type Layer, type Pt } from '@/lib/paper/shapes';

export type VignetteName = 'tour' | 'verify' | 'visit' | 'owners' | 'app';

export const SIZE: Record<VignetteName, [number, number]> = {
  tour: [320, 200],
  verify: [320, 200],
  visit: [320, 200],
  owners: [480, 300],
  app: [360, 392],
};

/**
 * Where the artboard starts, when it is below y = 0. The app drawing has no art above y = 30.7 (the phone's top corner;
 * the sun and the seal start at 32), so the artboard starts at 28 and there is no dead band above the phone.
 * The drawing's coordinates stay as they are; only the viewBox moves.
 */
export const TOP: Partial<Record<VignetteName, number>> = { app: 28 };

type Tools = ReturnType<typeof makeTools>;

const L = (id: string, fill: string, shadow: string, cut: string[], solid: string[] = []): Layer => ({ id, fill, depth: 0, shadow, cut, solid });

const FAR = 'var(--color-kesar-200)';
const MID = 'var(--color-kesar-300)';
const NEAR = 'var(--color-kesar-700)';
const S_FAR = 'rgb(226 91 0 / 0.28)';
const S_MID = 'rgb(181 70 0 / 0.32)';
const S_NEAR = 'rgb(94 33 0 / 0.4)';
/** White paper: the kit's sheet tint. Every tint here matches a shared `pc-m*` filter, so the vignettes draw no filters of their own. */
const S_SHEET = 'rgb(138 51 0 / 0.3)';

/** Rotates points about a centre, in degrees. */
const turn = (pts: Pt[], cx: number, cy: number, deg: number): Pt[] => {
  const a = (deg * Math.PI) / 180;
  const c = Math.cos(a);
  const s = Math.sin(a);
  return pts.map(([x, y]) => [cx + (x - cx) * c - (y - cy) * s, cy + (x - cx) * s + (y - cy) * c]);
};

const box = (x: number, y: number, w: number, h: number, k = 0): Pt[] =>
  k
    ? [
        [x + k, y],
        [x + w - k, y],
        [x + w, y + k],
        [x + w, y + h - k],
        [x + w - k, y + h],
        [x + k, y + h],
        [x, y + h - k],
        [x, y + k],
      ]
    : [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ];

/** A floor line with a slightly rough top edge, filled to the bottom. */
function floor(t: Tools, y: number, w: number, h: number): string {
  const pts: Pt[] = [[-4, y]];
  for (let x = 24; x < w; x += 32) pts.push([x, y - 1 + t.rand() * 2]);
  pts.push([w + 4, y], [w + 4, h + 4], [-4, h + 4]);
  return t.path(pts);
}

/** A tick cut out of a seal: a thick check mark as one polygon. */
const tick = (t: Tools, x: number, y: number, s: number) =>
  t.path([
    [x - s * 0.55, y - s * 0.02],
    [x - s * 0.3, y - s * 0.27],
    [x - s * 0.1, y - s * 0.07],
    [x + s * 0.34, y - s * 0.5],
    [x + s * 0.58, y - s * 0.26],
    [x - s * 0.1, y + s * 0.42],
  ]);

/** A rosette seal: points alternate between two radii, like pinking shears. */
function seal(t: Tools, cx: number, cy: number, r: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 28; i += 1) {
    const a = (i / 28) * Math.PI * 2;
    const k = i % 2 ? r * 0.88 : r;
    pts.push([cx + Math.cos(a) * k, cy + Math.sin(a) * k]);
  }
  return t.path(pts) + tick(t, cx, cy, r * 0.9);
}

/** "Walk through from home": a sofa, and a phone that shows a room with the 360 ring. */
function tour(): Layer[] {
  const t = makeTools('v-tour', 0.5);
  const cx = 222;
  const cy = 104;
  const r = (pts: Pt[]) => t.path(turn(pts, cx, cy, -7));
  // The 360 ring: an elliptic band with a gap and an arrowhead at its end.
  const ring: Pt[] = [];
  for (let i = 0; i <= 20; i += 1) {
    const a = (0.12 + (i / 20) * 1.7) * Math.PI;
    ring.push([cx + Math.cos(a) * 24, 160 + Math.sin(a) * 7]);
  }
  for (let i = 20; i >= 0; i -= 1) {
    const a = (0.12 + (i / 20) * 1.7) * Math.PI;
    ring.push([cx + Math.cos(a) * 20, 160 + Math.sin(a) * 4.5]);
  }
  const end = (0.12 + 1.7) * Math.PI;
  const ex = cx + Math.cos(end) * 22;
  const ey = 160 + Math.sin(end) * 6;
  return [
    L('t1', FAR, S_FAR, [
      // Window with four panes, and the floor.
      t.path(box(22, 26, 74, 68)) + t.path(box(30, 34, 26, 24)) + t.path(box(62, 34, 26, 24)) + t.path(box(30, 62, 26, 24)) + t.path(box(62, 62, 26, 24)),
      floor(t, 176, 320, 200),
    ]),
    L('t2', NEAR, S_NEAR, [
      // Sofa: back, seat and arms, with two seams cut in the back.
      t.path([
        [18, 104],
        [24, 96],
        [134, 96],
        [140, 104],
        [140, 128],
        [18, 128],
      ]) +
        t.rect(56, 102, 3, 22) +
        t.rect(98, 102, 3, 22),
      t.path(box(4, 118, 26, 52, 6)),
      t.path(box(128, 118, 26, 52, 6)),
      t.rect(20, 132, 118, 30),
    ], [t.rect(12, 168, 6, 9), t.rect(140, 168, 6, 9)]),
    L('t3', 'var(--color-kesar-900)', 'rgb(47 15 2 / 0.45)', [r(box(180, 20, 84, 168, 12))]),
    L('t4', 'var(--color-paper)', S_SHEET, [r(box(187, 30, 70, 142, 4))]),
    L('t5', 'var(--color-kesar-500)', 'rgb(138 51 0 / 0.3)', [
      // The room on the screen: a door, a window and the floor line.
      r(box(196, 84, 22, 62)) + r(box(212, 112, 3, 4)),
      r(box(226, 64, 22, 26)) + r(box(229, 67, 7, 9)) + r(box(238, 67, 7, 9)) + r(box(229, 79, 7, 9)) + r(box(238, 79, 7, 9)),
      r(box(191, 146, 62, 3)),
      r(ring),
      r([
        [ex - 1, ey - 7],
        [ex + 9, ey + 1],
        [ex - 2, ey + 6],
      ]),
    ]),
  ];
}

/** "We check it first": a builder floor, a 360 camera on a tripod, and a seal. */
function verify(): Layer[] {
  const t = makeTools('v-verify', 0.5);
  let house = t.path([
    [44, 60],
    [196, 60],
    [196, 180],
    [44, 180],
  ]);
  // Three floors: a balcony slit and windows on each, a door at the bottom.
  for (let f = 0; f < 3; f += 1) {
    const y = 70 + f * 34;
    house += t.grid(56, y, 4, 1, 22, 16, 13, 0);
    if (f < 2) house += t.rect(52, y + 22, 136, 3);
  }
  house += t.rect(106, 144, 26, 36);
  return [
    L('v1', FAR, S_FAR, [floor(t, 180, 320, 200)]),
    L('v2', MID, S_MID, [house + t.rect(38, 52, 164, 9)], [t.rect(60, 40, 22, 13), t.rect(150, 44, 16, 9)]),
    L('v3', NEAR, S_NEAR, [
      // The camera: a slim body with a round lens, on a pole and three legs.
      t.path(box(248, 58, 16, 30, 3)) + t.oct(256, 70, 4.5),
    ], [
      t.rect(254.5, 88, 3, 56),
      t.path([
        [255, 142],
        [258, 142],
        [236, 192],
        [231, 190],
      ]),
      t.path([
        [255, 142],
        [258, 142],
        [259, 193],
        [254, 193],
      ]),
      t.path([
        [255, 142],
        [258, 142],
        [284, 190],
        [279, 192],
      ]),
    ]),
    L('v4', 'var(--color-kesar-500)', 'rgb(138 51 0 / 0.35)', [seal(t, 206, 50, 26)]),
  ];
}

/** "Visit once, with help": an open door, a calendar with one day marked, and the keys. */
function visit(): Layer[] {
  const t = makeTools('v-visit', 0.5);
  const days: string[] = [];
  for (let r = 0; r < 3; r += 1) for (let c = 0; c < 4; c += 1) if (!(r === 1 && c === 2)) days.push(t.rect(206 + c * 16, 64 + r * 15, 9, 8));
  return [
    L('s1', FAR, S_FAR, [floor(t, 180, 320, 200)]),
    // Wall with a doorway cut out, so the light room shows through.
    L('s2', MID, S_MID, [t.path(box(70, 22, 118, 158)) + t.path(box(96, 42, 66, 138))]),
    L('s3', NEAR, S_NEAR, [
      // The door, swung open on its left hinge, with a knob hole.
      t.path([
        [96, 42],
        [124, 52],
        [124, 172],
        [96, 180],
      ]) + t.oct(117, 114, 2.5),
      // Key ring, bow with a hole, shaft and teeth; a tag on the ring.
      t.oct(46, 150, 12) + t.oct(46, 150, 8),
      t.oct(62, 166, 9) + t.oct(62, 166, 3.5),
      t.path([
        [68, 172],
        [72, 168],
        [102, 194],
        [98, 198],
      ]),
      t.path(turn(box(18, 150, 20, 30, 3), 28, 165, 18)) + t.oct(26, 157, 2.5),
    ], [t.rect(88, 188, 12, 5), t.rect(94, 182, 8, 5)]),
    L('s4', 'var(--color-paper)', S_SHEET, [t.path(box(198, 34, 70, 82)) + days.join('')]),
    L('s5', 'var(--color-kesar-500)', 'rgb(138 51 0 / 0.3)', [t.rect(198, 34, 70, 20), t.oct(242.5, 83, 7) + t.oct(242.5, 83, 4)], [t.rect(214, 28, 4, 12), t.rect(248, 28, 4, 12)]),
  ];
}

/**
 * Owners: a builder floor with a "to let" board in front, and the owner app on
 * a phone: a rent ledger where three rows are paid (tick) and one is due (ring).
 * Drawn for the deep kesar owners band: light house, dark ground.
 */
function owners(): Layer[] {
  const t = makeTools('v-owners', 0.6);
  let house = t.path(box(30, 74, 228, 188));
  for (let f = 0; f < 4; f += 1) {
    const y = 88 + f * 42;
    house += t.grid(46, y, 5, 1, 26, 20, 16, 0);
    if (f < 3) house += t.rect(40, y + 28, 208, 4);
  }
  house += t.rect(126, 222, 34, 40);
  const rows: string[] = [t.rect(336, 102, 56, 9)];
  const ticks: string[] = [];
  const due: string[] = [];
  for (let i = 0; i < 4; i += 1) {
    const y = 134 + i * 32;
    rows.push(t.rect(336, y, 60, 5), t.rect(336, y + 10, 36, 4));
    if (i === 2) due.push(t.oct(420, y + 7, 8.5) + t.oct(420, y + 7, 5));
    else ticks.push(tick(t, 420, y + 8, 17));
  }
  const tint = 'rgb(47 15 2 / 0.45)';
  return [
    L('o1', 'var(--color-kesar-300)', tint, [house + t.rect(22, 64, 244, 11)], [t.rect(52, 48, 30, 17), t.rect(200, 52, 22, 13)]),
    // A cut strip of ground with slanted ends, so it sits on the band as paper.
    L('o2', 'var(--color-kesar-950)', tint, [
      t.path([
        [14, 262],
        [120, 260],
        [250, 263],
        [470, 261],
        [462, 280],
        [300, 282],
        [150, 279],
        [24, 281],
      ]),
    ], [t.rect(229, 206, 6, 58)]),
    // The "to let" board: two slits where the words would be.
    L('o3', 'var(--color-paper)', tint, [t.path(turn(box(196, 176, 72, 40, 2), 232, 196, -4)) + t.path(turn(box(206, 188, 46, 5), 232, 196, -4)) + t.path(turn(box(206, 199, 30, 5), 232, 196, -4))]),
    L('o4', 'var(--color-ink-950)', tint, [t.path(box(314, 70, 132, 224, 14))]),
    L('o5', 'var(--color-paper)', S_SHEET, [t.path(box(322, 84, 116, 196, 5))]),
    L('o6', 'var(--color-kesar-700)', S_SHEET, [...due], [...rows, ...ticks]),
  ];
}

/**
 * The app: a phone that shows one home card (photo of a house, price, two
 * lines, a strip of three photos), a chat bubble from the relationship manager
 * and a verified seal. Two flat blocks and a sun sit behind it. No background,
 * so it can sit on the app sheet and rise above its top edge.
 */
function app(): Layer[] {
  const t = makeTools('v-app', 0.5);
  const cx = 198;
  const cy = 214;
  const r = (pts: Pt[]) => t.path(turn(pts, cx, cy, -6));
  // The house on the phone photo: roof and walls, with two windows and a door left solid.
  const house: Pt[] = [
    [150, 150],
    [197, 108],
    [244, 150],
    [236, 150],
    [236, 184],
    [158, 184],
    [158, 150],
  ];
  const strip = [0, 1, 2].map((i) => r(box(133 + i * 45, 300, 39, 39, 5)));
  let blocks = t.path(box(8, 236, 62, 170));
  blocks += t.grid(18, 250, 3, 6, 10, 12, 6, 12);
  return [
    L('p1', FAR, S_FAR, [blocks, floor(t, 404, 360, 420)], []),
    L('p2', MID, S_MID, [t.oct(66, 66, 30), t.path(box(292, 292, 62, 116)) + t.grid(300, 304, 3, 5, 9, 11, 6, 11)]),
    L('p3', 'var(--color-ink-950)', 'rgb(20 45 38 / 0.4)', [r(box(112, 36, 172, 346, 22))]),
    L('p4', 'var(--color-paper)', S_SHEET, [r(box(121, 52, 154, 314, 10))]),
    // The photo of the home card, with the house cut out of it as a light shape.
    L('p5', MID, S_MID, [r(box(131, 66, 134, 128, 8)) + r(house) + r(box(178, 160, 12, 24)) + r(box(164, 158, 10, 10)) + r(box(212, 158, 10, 10))]),
    L('p6', NEAR, S_NEAR, [r(box(131, 208, 70, 14, 3)), r(box(131, 232, 112, 7, 3)), r(box(131, 246, 86, 7, 3)), r(box(131, 266, 64, 22, 5))]),
    L('p7', FAR, S_FAR, strip),
    // The relationship manager's chat bubble, with three lines cut out of it.
    L('p8', 'var(--color-kesar-500)', 'rgb(138 51 0 / 0.35)', [
      t.path([
        [222, 304],
        [326, 304],
        [332, 310],
        [332, 358],
        [326, 364],
        [262, 364],
        [244, 384],
        [246, 364],
        [228, 364],
        [222, 358],
      ]) +
        t.rect(238, 318, 78, 6) +
        t.rect(238, 331, 62, 6) +
        t.rect(238, 344, 44, 6),
    ]),
    L('p9', 'var(--color-kesar-700)', 'rgb(94 33 0 / 0.4)', [seal(t, 122, 58, 26)]),
  ];
}

export function vignetteLayers(name: VignetteName): Layer[] {
  return { tour, verify, visit, owners, app }[name]();
}
