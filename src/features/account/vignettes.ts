/**
 * Paper vignettes for the account, sign-in and post-property screens. Same
 * language as the home diorama and the state scenes: flat kesar layers,
 * hand-cut edges from fixed seeds, one short shadow per layer (top-left light).
 *
 * Empty states are 320 x 200. The post-property house is 200 x 120 and is
 * built one layer per wizard step.
 */
import { makeTools, type Layer, type Pt } from '@/lib/paper/shapes';

export type VignetteName = 'saved' | 'visits' | 'listings' | 'door' | 'posted';
export type Scene = { w: number; h: number; layers: Layer[] };

const W = 320;
const H = 200;
const SKY = 'rgb(226 91 0 / 0.3)';
const MID = 'rgb(181 70 0 / 0.35)';
const NEAR = 'rgb(94 33 0 / 0.4)';

const SKYLINE = { heights: [30, 52, 40, 66, 46, 34, 60, 42, 28, 50, 38], slant: false, drop: 80, inset: 8 };
const skyline = (seed: string, base: number) => makeTools(seed, 0.6).skyline(base, SKYLINE);

function ground(seed: string, y: number, bump = 3, w = W, h = H): string {
  const t = makeTools(seed, 0.5);
  const pts: Pt[] = [[-4, y]];
  for (let x = 20; x < w; x += 30) pts.push([x, y - bump / 2 + t.rand() * bump]);
  pts.push([w + 4, y], [w + 4, h + 4], [-4, h + 4]);
  return t.path(pts);
}

/** Grass cut with a few quick strokes. */
function tuft(t: ReturnType<typeof makeTools>, x: number, y: number): string {
  return t.path([[x, y + 1], [x + 4, y - 14], [x + 8, y - 3], [x + 12, y - 18], [x + 15, y - 3], [x + 20, y - 12], [x + 22, y + 1]]);
}

/** A heart outline (parametric), for cut-outs and tags. */
function heart(t: ReturnType<typeof makeTools>, cx: number, cy: number, s: number): string {
  const pts: Pt[] = [];
  for (let i = 0; i < 28; i += 1) {
    const a = (i / 28) * Math.PI * 2;
    const x = 16 * Math.sin(a) ** 3;
    const y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a));
    pts.push([cx + (x * s) / 16, cy + (y * s) / 16]);
  }
  return t.path(pts);
}

/** A small house facade: gable roof, windows and a door, as one sheet. */
function gable(t: ReturnType<typeof makeTools>, x: number, w: number, top: number, peak: number, base: number): string {
  let d = t.path([
    [x, base],
    [x, top],
    [x - 6, top],
    [x + w / 2, peak],
    [x + w + 6, top],
    [x + w, top],
    [x + w, base],
  ]);
  d += t.rect(x + 9, top + 12, 13, 12) + t.rect(x + w - 22, top + 12, 13, 12);
  d += t.rect(x + w / 2 - 8, base - 26, 16, 24);
  return d;
}

/** "Pasand ke ghar": a lane of houses, a heart cut in the middle gable. */
function saved(): Layer[] {
  const t = makeTools('acct-saved', 0.6);
  const middle = gable(t, 124, 72, 96, 58, 152) + heart(t, 160, 80, 9);
  return [
    { id: 's1', fill: 'var(--color-kesar-200)', depth: 0, shadow: SKY, cut: [skyline('acct-saved-sky', 124)], solid: [] },
    {
      id: 's2',
      fill: 'var(--color-kesar-300)',
      depth: 0,
      shadow: MID,
      cut: [ground('acct-saved-ground', 150, 4), gable(t, 44, 62, 106, 78, 152), middle, t.rect(222, 100, 62, 52) + t.grid(230, 110, 3, 2, 10, 10, 8, 10) + t.rect(240, 88, 22, 13)],
      solid: [],
    },
    {
      id: 's3',
      fill: 'var(--color-kesar-700)',
      depth: 0,
      shadow: NEAR,
      cut: [ground('acct-saved-kerb', 178, 2)],
      solid: [tuft(t, 22, 178), tuft(t, 282, 178), t.blob(206, 176, 14, 8, 9, 0.3), heart(t, 160, 124, 7)],
    },
  ];
}

/** A wall calendar with the visit day ringed, and a house down the road. */
function visits(): Layer[] {
  const t = makeTools('acct-visits', 0.6);
  let leaf = t.path([
    [92, 38],
    [212, 36],
    [214, 140],
    [94, 142],
  ]);
  // Ring holes, the month slit, then a 6 x 3 grid of day windows.
  leaf += t.oct(122, 48, 4) + t.oct(184, 47, 4) + t.rect(112, 60, 82, 8);
  leaf += t.grid(106, 80, 6, 3, 10, 9, 7, 8);
  // A ring drawn round the visit day in one quick, uneven stroke.
  const ring = t.blob(163, 101, 14, 11.5, 24, 0.05) + t.blob(163, 101, 10.5, 8.5, 24, 0.05);
  const hut = t.path([[250, 180], [250, 152], [244, 152], [270, 132], [296, 152], [290, 152], [290, 180]]) + t.rect(264, 160, 12, 18);
  return [
    { id: 'v1', fill: 'var(--color-kesar-200)', depth: 0, shadow: SKY, cut: [skyline('acct-visits-sky', 128)], solid: [] },
    {
      id: 'v2',
      fill: 'var(--color-kesar-300)',
      depth: 0,
      shadow: MID,
      cut: [ground('acct-visits-ground', 152, 4), leaf],
      solid: [t.rect(120, 30, 4, 20), t.rect(182, 29, 4, 20)],
    },
    {
      id: 'v3',
      fill: 'var(--color-kesar-700)',
      depth: 0,
      shadow: NEAR,
      cut: [ground('acct-visits-kerb', 178, 2), ring, hut],
      solid: [tuft(t, 36, 178), tuft(t, 214, 178)],
    },
  ];
}

/** A house with a "to let" board hung from a bracket. */
function listings(): Layer[] {
  const t = makeTools('acct-listings', 0.6);
  let house = t.path([
    [66, 152],
    [66, 98],
    [58, 98],
    [118, 58],
    [178, 98],
    [170, 98],
    [170, 152],
  ]);
  house += t.rect(80, 108, 20, 18) + t.rect(136, 108, 20, 18) + t.rect(109, 120, 18, 30);
  let board = t.path([
    [212, 104],
    [262, 102],
    [263, 132],
    [213, 134],
  ]);
  board += t.rect(222, 112, 30, 4) + t.rect(222, 121, 20, 4);
  return [
    { id: 'l1', fill: 'var(--color-kesar-200)', depth: 0, shadow: SKY, cut: [skyline('acct-listings-sky', 126)], solid: [] },
    { id: 'l2', fill: 'var(--color-kesar-300)', depth: 0, shadow: MID, cut: [ground('acct-listings-ground', 150, 4), house], solid: [] },
    {
      id: 'l3',
      fill: 'var(--color-kesar-700)',
      depth: 0,
      shadow: NEAR,
      cut: [ground('acct-listings-kerb', 178, 2), board],
      solid: [
        t.rect(270, 82, 6, 98),
        t.rect(206, 82, 70, 5),
        t.rect(219, 86, 2.5, 17),
        t.rect(253, 86, 2.5, 16),
        tuft(t, 30, 178),
        t.blob(186, 176, 12, 7, 8, 0.3),
      ],
    },
  ];
}

/** A front door, slightly open, with a toran of paper flags above it. */
function door(): Layer[] {
  const t = makeTools('acct-door', 0.6);
  let wall = t.rect(52, 58, 216, 104);
  wall += t.rect(134, 90, 52, 72);
  wall += t.rect(76, 90, 32, 30) + t.rect(212, 90, 32, 30);
  wall += t.grid(80, 94, 3, 3, 6, 6, 4, 4) + t.grid(216, 94, 3, 3, 6, 6, 4, 4);
  const flags: string[] = [];
  for (let i = 0; i < 7; i += 1) {
    const x = 126 + i * 10;
    flags.push(t.path([[x, 80], [x + 9, 80], [x + 4.5, 90]]));
  }
  return [
    { id: 'd1', fill: 'var(--color-kesar-200)', depth: 0, shadow: SKY, cut: [skyline('acct-door-sky', 70)], solid: [] },
    { id: 'd2', fill: 'var(--color-kesar-300)', depth: 0, shadow: MID, cut: [wall, ground('acct-door-ground', 162, 2)], solid: [] },
    {
      id: 'd3',
      fill: 'var(--color-kesar-700)',
      depth: 0,
      shadow: NEAR,
      cut: [
        // Door leaf, turned a little inward, with its handle cut out.
        t.path([
          [137, 93],
          [166, 97],
          [166, 158],
          [137, 162],
        ]) + t.rect(157, 124, 3, 7),
        ground('acct-door-kerb', 178, 2),
      ],
      solid: [
        t.rect(122, 78, 76, 2),
        ...flags,
        // Step slab and a potted plant.
        t.rect(124, 160, 72, 6),
        t.path([[98, 162], [118, 162], [116, 148], [100, 148]]),
        t.path([[107, 149], [96, 124], [104, 130], [108, 116], [112, 130], [120, 124], [109, 149]]),
      ],
    },
  ];
}

/* ------------------------------------------------------------------ */
/* The post-property house, built one layer per step.                  */
/* ------------------------------------------------------------------ */

export const HOUSE_W = 200;
export const HOUSE_H = 120;

/**
 * Six layers, back to front, in wizard order: 0 what (plot), 1 where (pin),
 * 2 details (walls), 3 price (roof), 4 photos (gulmohar tree), 5 contact
 * (door and flag). `placed` layers are coloured; the rest show as a faint
 * template of the piece still to be placed.
 */
export function houseLayers(placed: number): (Layer & { placed: boolean; step: number })[] {
  const t = makeTools('post-house', 0.5);
  const g = 104;
  const walls = t.rect(62, 62, 76, g - 62 + 2) + t.rect(72, 72, 16, 14) + t.rect(112, 72, 16, 14);
  const roof = t.path([
    [52, 64],
    [100, 30],
    [148, 64],
  ]);
  const pin =
    t.path([
      [166, 40],
      [158, 30],
      [157, 20],
      [162, 12],
      [170, 10],
      [178, 12],
      [183, 20],
      [182, 30],
      [174, 40],
      [170, 50],
    ]) + t.oct(170, 23, 4.5);
  const tree =
    t.blob(30, 60, 22, 15, 16, 0.35) +
    t.blob(22, 56, 3.5, 2.5, 6, 0.3) +
    t.blob(38, 64, 3, 2, 6, 0.3);
  const trunk = t.path([[28, g], [29, 70], [22, 64], [24, 62], [31, 67], [33, 62], [35, 63], [33, 70], [34, g]]);
  const doorPath = t.rect(92, 80, 16, g - 80) + t.rect(103, 90, 2, 4);
  const flag = t.path([[99, 30], [101, 30], [101, 14], [114, 18], [101, 22], [101, 30]]);
  const plot = ground('post-house-plot', g, 2, HOUSE_W, HOUSE_H) + t.rect(150, g + 4, 30, 2) + t.rect(20, g + 8, 40, 2);
  const stakes = t.rect(56, g - 10, 3, 12) + t.rect(141, g - 10, 3, 12);
  const pieces = [
    { step: 1, id: 'h-pin', fill: 'var(--color-kesar-600)', shadow: 'rgb(138 51 0 / 0.4)', cut: [pin], solid: [t.rect(169, 48, 2, g - 48)] },
    { step: 4, id: 'h-tree', fill: 'var(--color-kesar-700)', shadow: NEAR, cut: [tree], solid: [trunk] },
    { step: 2, id: 'h-walls', fill: 'var(--color-kesar-300)', shadow: MID, cut: [walls], solid: [] },
    { step: 3, id: 'h-roof', fill: 'var(--color-kesar-600)', shadow: 'rgb(138 51 0 / 0.4)', cut: [roof], solid: [] },
    { step: 5, id: 'h-door', fill: 'var(--color-kesar-800)', shadow: 'rgb(47 15 2 / 0.4)', cut: [doorPath, flag], solid: [] },
    { step: 0, id: 'h-plot', fill: 'var(--color-kesar-700)', shadow: NEAR, cut: [plot], solid: [stakes] },
  ];
  return pieces.map((p) => ({ ...p, depth: 0, placed: p.step <= placed }));
}

/** The finished house on a street, with the flag up. Success state. */
function posted(): Layer[] {
  const t = makeTools('acct-posted', 0.6);
  let house = t.path([
    [104, 156],
    [104, 100],
    [94, 100],
    [160, 56],
    [226, 100],
    [216, 100],
    [216, 156],
  ]);
  house += t.rect(118, 110, 22, 18) + t.rect(180, 110, 22, 18) + t.rect(150, 122, 20, 34);
  const flag = t.path([[158, 56], [161, 56], [161, 30], [184, 36], [161, 44], [161, 56]]);
  return [
    { id: 'p1', fill: 'var(--color-kesar-200)', depth: 0, shadow: SKY, cut: [skyline('acct-posted-sky', 130)], solid: [] },
    { id: 'p2', fill: 'var(--color-kesar-300)', depth: 0, shadow: MID, cut: [ground('acct-posted-ground', 154, 4), house], solid: [] },
    {
      id: 'p3',
      fill: 'var(--color-kesar-700)',
      depth: 0,
      shadow: NEAR,
      cut: [
        ground('acct-posted-kerb', 178, 2),
        flag,
        // Gulmohar: a wide canopy with a few leaf gaps.
        t.blob(62, 112, 34, 18, 22, 0.34) + t.blob(50, 108, 5, 3, 6, 0.3) + t.blob(74, 116, 4, 3, 6, 0.3) + t.blob(64, 102, 3.5, 2.5, 6, 0.3),
      ],
      solid: [
        t.path([[59, 180], [60, 132], [44, 122], [47, 120], [61, 127], [63, 118], [66, 119], [65, 132], [67, 180]]),
        tuft(t, 244, 178),
        tuft(t, 280, 178),
      ],
    },
  ];
}

const builders: Record<VignetteName, () => Layer[]> = { saved, visits, listings, door, posted };
const cache = new Map<VignetteName, Scene>();

export function vignette(name: VignetteName): Scene {
  let s = cache.get(name);
  if (!s) {
    s = { w: W, h: H, layers: builders[name]() };
    cache.set(name, s);
  }
  return s;
}
