/**
 * Carpet, built-up and loading area from the super built-up area.
 * carpet = super × (100 − loading%) / 100
 * built-up = carpet × (1 + walls% / 100), never more than super
 * loading = super − carpet; common = super − built-up
 */
export function carpetAreas(superArea: number, loadingPct: number, wallsPct: number) {
  const s = Math.max(superArea, 0);
  const carpet = (s * (100 - loadingPct)) / 100;
  const builtUp = Math.min(carpet * (1 + wallsPct / 100), s);
  return { carpet, builtUp, loading: Math.max(s - carpet, 0), walls: builtUp - carpet, common: Math.max(s - builtUp, 0) };
}
