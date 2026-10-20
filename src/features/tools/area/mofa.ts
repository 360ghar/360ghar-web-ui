/**
 * MOFA and RERA carpet area. RERA carpet counts internal partition walls that
 * MOFA left out, so it is usually 5 to 8% larger. The old tool used 6%; the
 * page lets the person change it. The result is rounded to whole sq ft and the
 * difference comes from the rounded value, as before.
 */
export type Direction = 'mofa_to_rera' | 'rera_to_mofa';

export function convertCarpet(value: number, direction: Direction, upliftPct = 6) {
  const f = 1 + upliftPct / 100;
  const result = Math.round(direction === 'mofa_to_rera' ? value * f : value / f);
  return { result, delta: result - Math.round(value) };
}
