/** Illustrative area arithmetic using a user-entered assumption. */
export type Direction = 'mofa_to_rera' | 'rera_to_mofa';

export function convertCarpet(value: number, direction: Direction, upliftPct?: number) {
  if (upliftPct === undefined || !Number.isFinite(upliftPct) || upliftPct < 0 || upliftPct > 100) {
    return { result: Number.NaN, delta: Number.NaN };
  }
  const f = 1 + upliftPct / 100;
  const result = Math.round(direction === 'mofa_to_rera' ? value * f : value / f);
  return { result, delta: result - Math.round(value) };
}
