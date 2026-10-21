/**
 * Shared paper shadows. Every page renders these filters once (PaperDefs in
 * the base layout), so a scene points at `url(#pc-m3)` instead of carrying its
 * own copy of the same drop shadow.
 *
 * Tints are the paper palette's shadows, far to near. Sizes are in SVG user
 * units, so they scale with the drawing: `s` for 160-unit vignettes, `m` for
 * 320-unit state scenes, `l` for large scenes (1600 units).
 */

const SHADOW_TINTS = [
  'rgb(226 91 0 / 0.3)', // 1 far: towers on the sky
  'rgb(181 70 0 / 0.35)', // 2 mid: blocks and ground
  'rgb(138 51 0 / 0.4)', // 3 main: the subject
  'rgb(94 33 0 / 0.45)', // 4 leaf: trees, the street
  'rgb(47 15 2 / 0.45)', // 5 near: the kerb, dark props
  'rgb(138 51 0 / 0.3)', // 6 sheet: white paper
] as const;

type ShadowSize = 's' | 'm' | 'l';
export type Shadow = readonly [dx: number, dy: number, blur: number];

export const SHADOW_SIZES: Record<ShadowSize, Shadow> = {
  s: [1.4, 2, 0.7],
  m: [2, 3, 1.1],
  l: [3, 4, 1.4],
};

export const SHARED_SHADOWS = (Object.keys(SHADOW_SIZES) as ShadowSize[]).flatMap((size) =>
  SHADOW_TINTS.map((color, i) => ({ id: `pc-${size}${i + 1}`, color, shadow: SHADOW_SIZES[size] })),
);

type Rgba = [number, number, number, number];

function parse(color: string): Rgba | null {
  const m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)\s*(?:[/,]\s*([\d.]+))?\s*\)$/.exec(color.trim());
  return m ? [Number(m[1]), Number(m[2]), Number(m[3]), m[4] === undefined ? 1 : Number(m[4])] : null;
}

const TINTS = SHADOW_TINTS.map((c) => parse(c)!);

/**
 * The shared filter id for a layer shadow, or null when no shared filter is
 * close enough (then the art draws its own). A tint matches when each colour
 * channel is within 6 and the alpha within 0.05; the size must match exactly.
 */
export function sharedShadowId(color: string, shadow: Shadow): string | null {
  const size = (Object.keys(SHADOW_SIZES) as ShadowSize[]).find((k) => SHADOW_SIZES[k].every((v, i) => v === shadow[i]));
  const c = parse(color);
  if (!size || !c) return null;
  let best = -1;
  let bestAlpha = Infinity;
  TINTS.forEach((tint, i) => {
    const near = tint.slice(0, 3).every((v, k) => Math.abs(v - c[k]!) <= 6);
    const da = Math.abs(tint[3] - c[3]);
    if (near && da <= 0.051 && da < bestAlpha) {
      best = i;
      bestAlpha = da;
    }
  });
  return best < 0 ? null : `pc-${size}${best + 1}`;
}
