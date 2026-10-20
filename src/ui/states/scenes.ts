/**
 * Small paper scenes for empty, error, not-found and offline states.
 * Same language as the home diorama: flat kesar layers, hand-cut edges,
 * one short shadow per layer from a top-left light. 320 x 200 each.
 *
 * Five layers, far to near: sky (sun and clouds), Cyber City towers, sector
 * blocks and ground, the subject of the scene, and the near kerb.
 */
import { makeTools, type CloudProfile, type Layer, type Pt } from '@/lib/paper/shapes';

export type SceneName = 'empty' | 'error' | 'notFound' | 'offline';

const W = 320;
const H = 200;

type Tools = ReturnType<typeof makeTools>;

const SKY = { fill: 'var(--color-kesar-100)', shadow: 'transparent' };
const FAR = { fill: 'var(--color-kesar-200)', shadow: 'rgb(226 91 0 / 0.28)' };
const MID = { fill: 'var(--color-kesar-300)', shadow: 'rgb(181 70 0 / 0.34)' };
const MAIN = { fill: 'var(--color-kesar-600)', shadow: 'rgb(138 51 0 / 0.4)' };
const NEAR = { fill: 'var(--color-kesar-800)', shadow: 'rgb(47 15 2 / 0.45)' };

const layer = (id: string, tone: { fill: string; shadow: string }, cut: string[], solid: string[] = []): Layer => ({ id, depth: 0, ...tone, cut, solid });

const CLOUD: CloudProfile = [[0, 7], [0.2, 2], [0.38, 4], [0.55, -3], [0.76, 1], [1, 7]];

/** Sun and two cloud strips, cut from pale card. */
function sky(t: Tools, sx: number, sy: number): Layer {
  const sun: Pt[] = [];
  for (let i = 0; i < 20; i += 1) {
    const a = (i / 20) * Math.PI * 2;
    sun.push([sx + Math.cos(a) * 20, sy + Math.sin(a) * 20]);
  }
  return layer('sky', SKY, [], [t.path(sun), t.cloud(34, 40, 70, CLOUD), t.cloud(sx - 60, sy + 16, 58, CLOUD)]);
}

/** Far towers with window holes. */
const SKYLINE = { heights: [34, 58, 44, 76, 50, 38, 66, 46, 30, 56, 40], slant: true, drop: 60, inset: 10 };

/** A sector apartment block: balcony slits, windows and a roof tank. */
function block(t: Tools, x: number, w: number, top: number, base: number): string {
  let d = t.rect(x, top, w, base - top + 4);
  d += t.path([
    [x + w - 20, top - 10],
    [x + w - 6, top - 10],
    [x + w - 6, top - 4],
    [x + w - 8, top - 4],
    [x + w - 8, top + 1],
    [x + w - 18, top + 1],
    [x + w - 18, top - 4],
    [x + w - 20, top - 4],
  ]);
  for (let y = top + 8; y < base - 10; y += 13) {
    d += t.rect(x + 5, y, w - 10, 2.6);
    d += t.grid(x + 8, y + 5, Math.floor((w - 12) / 10), 1, 5, 4, 5, 0, 0.3);
  }
  return d;
}

function ground(t: Tools, y: number, bump = 3): string {
  const pts: Pt[] = [[-4, y]];
  for (let x = 20; x < W; x += 30) pts.push([x, y - bump / 2 + t.rand() * bump]);
  pts.push([W + 4, y], [W + 4, H + 4], [-4, H + 4]);
  return t.path(pts);
}

/** Grass tuft cut with three quick strokes. */
const tuft = (t: Tools, x: number, y: number) =>
  t.path([
    [x, y],
    [x + 4, y - 14],
    [x + 8, y - 3],
    [x + 12, y - 18],
    [x + 15, y - 3],
    [x + 20, y - 12],
    [x + 22, y],
  ]);

/** "Khali plot": an empty plot between two blocks, a blank board and a young tree in its guard. */
function empty(): Layer[] {
  const t = makeTools('empty-3', 0.6);
  return [
    sky(t, 256, 48),
    layer('far', FAR, [t.skyline(124, SKYLINE)]),
    layer('mid', MID, [ground(t, 150, 4), block(t, 6, 74, 72, 150), block(t, 244, 72, 66, 150)]),
    layer(
      'plot',
      MAIN,
      [
        // Signboard with two slits where the text would go.
        t.path([
          [116, 82],
          [204, 78],
          [206, 118],
          [118, 121],
        ]) +
          t.rect(130, 92, 60, 4) +
          t.rect(130, 104, 38, 4),
      ],
      [t.rect(132, 118, 6, 44), t.rect(184, 116, 6, 46), tuft(t, 212, 160), tuft(t, 96, 158)],
    ),
    layer(
      'near',
      NEAR,
      [
        ground(t, 178, 2) +
          // Tree guard: a cage of bars around a sapling.
          t.rect(50, 144, 22, 36) +
          t.grid(53, 147, 4, 1, 2.6, 30, 2.6, 0),
      ],
      [t.rect(60, 124, 2.6, 22), t.blob(61, 118, 15, 11, 14, 0.4), tuft(t, 262, 180), tuft(t, 22, 180)],
    ),
  ];
}

/** "Tuta board": a building left half-built, a sign hanging by one chain, a cone and a barricade. */
function error(): Layer[] {
  const t = makeTools('error-3', 0.6);
  // A bare concrete frame: columns and slabs, every bay open.
  const frame = t.rect(196, 58, 104, 96) + t.grid(202, 64, 4, 4, 20, 17, 5, 5);
  const crane =
    t.path([
      [174, 44],
      [180, 20],
      [186, 44],
      [300, 44],
      [300, 49],
      [186, 49],
      [186, 150],
      [178, 150],
      [178, 49],
      [150, 49],
      [150, 44],
    ]) +
    t.grid(179.5, 56, 1, 8, 5, 7, 0, 5);
  return [
    sky(t, 90, 44),
    layer('far', FAR, [t.skyline(122, SKYLINE)]),
    layer('mid', MID, [ground(t, 152, 4), frame, crane], [t.rect(268, 49, 2, 26), t.rect(263, 75, 12, 8)]),
    layer(
      'sign',
      MAIN,
      [
        // The sign swings from its left chain; the right chain snapped. "!" cut out.
        t.path([
          [92, 70],
          [150, 84],
          [140, 124],
          [82, 110],
        ]) +
          t.path([
            [114, 84],
            [124, 86],
            [119, 104],
            [111, 102],
          ]) +
          t.path([
            [108, 107],
            [117, 109],
            [115, 117],
            [106, 115],
          ]),
      ],
      [
        // Frame: two posts and a top bar, and the one chain that holds.
        t.rect(70, 54, 6, 104),
        t.rect(160, 54, 6, 104),
        t.rect(66, 50, 104, 6),
        t.path([
          [92, 56],
          [95, 56],
          [95, 71],
          [92, 71],
        ]),
        t.path([
          [150, 56],
          [153, 56],
          [153, 64],
          [150, 64],
        ]),
      ],
    ),
    layer(
      'near',
      NEAR,
      [
        ground(t, 178, 2) +
          // Traffic cone with two stripes cut out.
          t.path([
            [226, 178],
            [240, 126],
            [250, 126],
            [264, 178],
          ]) +
          t.path([
            [235, 144],
            [255, 144],
            [257, 152],
            [233, 152],
          ]) +
          t.path([
            [231, 162],
            [259, 162],
            [261, 170],
            [229, 170],
          ]),
        // Barricade: a striped bar on two legs.
        t.rect(14, 150, 84, 12) +
          t.path([
            [22, 152],
            [30, 152],
            [24, 160],
            [16, 160],
          ]) +
          t.path([
            [42, 152],
            [50, 152],
            [44, 160],
            [36, 160],
          ]) +
          t.path([
            [62, 152],
            [70, 152],
            [64, 160],
            [56, 160],
          ]) +
          t.path([
            [82, 152],
            [90, 152],
            [84, 160],
            [76, 160],
          ]),
      ],
      [t.rect(20, 162, 5, 18), t.rect(86, 162, 5, 18), t.rect(218, 176, 54, 5)],
    ),
  ];
}

/** Knife-cut digits, 14 x 20. A hole inside a hole fills again (evenodd): that gives the counters. */
function digit(t: Tools, ch: '4' | '0', x: number, y: number): string {
  if (ch === '0') {
    return (
      t.path([
        [x + 3, y],
        [x + 11, y],
        [x + 14, y + 3],
        [x + 14, y + 17],
        [x + 11, y + 20],
        [x + 3, y + 20],
        [x, y + 17],
        [x, y + 3],
      ]) +
      t.path([
        [x + 5.2, y + 4.2],
        [x + 8.8, y + 4.2],
        [x + 9.6, y + 5],
        [x + 9.6, y + 15],
        [x + 8.8, y + 15.8],
        [x + 5.2, y + 15.8],
        [x + 4.4, y + 15],
        [x + 4.4, y + 5],
      ])
    );
  }
  return (
    t.path([
      [x + 7.4, y],
      [x + 12, y],
      [x + 12, y + 12],
      [x + 14, y + 12],
      [x + 14, y + 15.6],
      [x + 12, y + 15.6],
      [x + 12, y + 20],
      [x + 8, y + 20],
      [x + 8, y + 15.6],
      [x, y + 15.6],
      [x, y + 12],
    ]) +
    t.path([
      [x + 4.4, y + 12],
      [x + 8, y + 12],
      [x + 8, y + 5.6],
    ])
  );
}

/** "Sector 404": the road runs out at a milestone that reads 404. */
function notFound(): Layer[] {
  const t = makeTools('nf-3', 0.6);
  const d = makeTools('nf-digits', 0.2);
  // Milestone: a slab with an arched top; the top band is a separate cut.
  const stone = (x: number, y: number, w: number, h: number) =>
    t.path([
      [x, y + 14],
      [x + w * 0.16, y + 4],
      [x + w * 0.38, y],
      [x + w * 0.62, y],
      [x + w * 0.84, y + 4],
      [x + w, y + 14],
      [x + w, y + h],
      [x, y + h],
    ]);
  const mx = 184;
  const my = 84;
  return [
    sky(t, 70, 46),
    layer('far', FAR, [t.skyline(120, SKYLINE)]),
    layer(
      'mid',
      MID,
      [
        ground(t, 146, 4) +
          // The road narrows toward the horizon and stops short of it.
          t.path([
            [-4, 204],
            [128, 150],
            [150, 150],
            [120, 204],
          ]) +
          t.rect(72, 182, 16, 3) +
          t.rect(114, 164, 10, 3),
        block(t, 250, 66, 70, 146),
      ],
      [tuft(t, 160, 150)],
    ),
    layer('stone', MAIN, [stone(mx, my, 62, 90) + digit(d, '4', mx + 8, my + 38) + digit(d, '0', mx + 24, my + 38) + digit(d, '4', mx + 40, my + 38)]),
    layer(
      'cap',
      { fill: 'var(--color-kesar-50)', shadow: 'rgb(138 51 0 / 0.35)' },
      [],
      [
        t.path([
          [mx + 2, my + 14],
          [mx + 62 * 0.17, my + 5],
          [mx + 62 * 0.38, my + 1.6],
          [mx + 62 * 0.62, my + 1.6],
          [mx + 62 * 0.83, my + 5],
          [mx + 60, my + 14],
          [mx + 60, my + 28],
          [mx + 2, my + 28],
        ]),
      ],
    ),
    layer(
      'near',
      NEAR,
      [
        ground(t, 180, 2) +
          // A direction sign on a pole points back the way you came.
          t.path([
            [40, 70],
            [112, 70],
            [112, 96],
            [40, 96],
            [24, 83],
          ]) +
          t.path([
            [56, 81],
            [92, 81],
            [92, 85],
            [56, 85],
          ]),
      ],
      [t.rect(72, 94, 7, 88), tuft(t, 250, 182), tuft(t, 12, 182)],
    ),
  ];
}

/** "Kati patang": a kite caught on the power lines above a rooftop. Used when the connection drops. */
function offline(): Layer[] {
  const t = makeTools('off-3', 0.5);
  const wire = (y1: number, y2: number, sag: number): string =>
    t.path([
      [34, y1],
      [110, y1 + sag * 0.8],
      [170, y1 + sag],
      [240, (y1 + y2) / 2 + sag * 0.6],
      [292, y2],
      [292, y2 + 2],
      [240, (y1 + y2) / 2 + sag * 0.6 + 2],
      [170, y1 + sag + 2],
      [110, y1 + sag * 0.8 + 2],
      [34, y1 + 2],
    ]);
  // A pole with two cross-arms and their insulators.
  const pole = (x: number, top: number) =>
    t.rect(x - 3, top, 6, 160) + t.rect(x - 16, top + 10, 32, 4) + t.rect(x - 12, top + 24, 24, 4) + t.rect(x - 15, top + 4, 3, 6) + t.rect(x + 12, top + 4, 3, 6);
  // A bird on the wire: body, head and tail in one cut.
  const bird = (x: number, y: number) =>
    t.path([
      [x, y],
      [x + 3, y - 5],
      [x + 7, y - 6],
      [x + 9, y - 9],
      [x + 12, y - 8],
      [x + 11, y - 5],
      [x + 13, y - 2],
      [x + 18, y + 1],
      [x + 10, y + 1],
    ]);
  return [
    sky(t, 262, 40),
    layer('far', FAR, [t.skyline(150, SKYLINE)]),
    layer('lines', { fill: 'var(--color-kesar-700)', shadow: 'rgb(94 33 0 / 0.4)' }, [pole(34, 40), pole(292, 30)], [wire(52, 42, 18), wire(66, 56, 16), bird(84, 62), bird(214, 58)]),
    layer(
      'kite',
      { fill: 'var(--color-kesar-500)', shadow: 'rgb(138 51 0 / 0.4)' },
      [
        // The kite, with its spine and spar cut out.
        t.path([
          [178, 30],
          [210, 64],
          [180, 112],
          [150, 66],
        ]) +
          t.path([
            [178, 36],
            [181, 36],
            [181, 104],
            [178, 104],
          ]) +
          t.path([
            [156, 66],
            [204, 64],
            [204, 67],
            [156, 69],
          ]),
      ],
      [
        // Tail ribbons, then the snapped string.
        t.path([
          [176, 110],
          [186, 110],
          [172, 132],
          [184, 150],
          [178, 152],
          [164, 132],
        ]),
        t.path([
          [182, 112],
          [184, 112],
          [230, 150],
          [228, 152],
        ]),
      ],
    ),
    layer(
      'near',
      NEAR,
      [
        // Rooftop parapet with drain holes, a water tank and a dish.
        t.path([
          [-4, 168],
          [324, 162],
          [324, 204],
          [-4, 204],
        ]) +
          t.rect(20, 176, 30, 4) +
          t.rect(70, 175, 30, 4) +
          t.rect(120, 174, 30, 4),
      ],
      [
        t.path([
          [252, 164],
          [296, 164],
          [296, 140],
          [292, 136],
          [256, 136],
          [252, 140],
        ]),
        t.rect(266, 130, 16, 6),
        t.path([
          [196, 150],
          [216, 138],
          [222, 148],
          [206, 156],
        ]),
        t.rect(208, 154, 3, 10),
      ],
    ),
  ];
}

const builders: Record<SceneName, () => Layer[]> = { empty, error, notFound, offline };
const cache = new Map<SceneName, Layer[]>();

export function sceneLayers(name: SceneName): Layer[] {
  let layers = cache.get(name);
  if (!layers) {
    layers = builders[name]();
    cache.set(name, layers);
  }
  return layers;
}

export const SCENE_W = W;
export const SCENE_H = H;
