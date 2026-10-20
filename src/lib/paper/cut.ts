/**
 * Hand-cut paper edges.
 *
 * `cutPolygon` returns a CSS `clip-path: polygon(...)` value. Points sit at
 * percentages along each edge, and each point moves inward by a few pixels.
 * The result scales with the element but the wobble stays the same size in
 * pixels, like a sheet cut with scissors. The same seed always gives the same
 * edge, so server and client render the same shape.
 *
 * Content inside a cut sheet needs padding larger than `amp` (see "clear the cut").
 */

type CutOptions = {
  /** Largest inward offset in px. Default 2. */
  amp?: number;
  /** Points on the top and bottom edges. Default 9. */
  across?: number;
  /** Points on the left and right edges. Default 5. */
  down?: number;
};

/** mulberry32: small, fast, deterministic. */
export function rng(seed: number | string): () => number {
  let a = typeof seed === 'number' ? seed : hash(seed);
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const r2 = (n: number) => Math.round(n * 100) / 100;

export function cutPolygon(seed: number | string, options: CutOptions = {}): string {
  const { amp = 2, across = 9, down = 5 } = options;
  const rand = rng(seed);
  const off = () => r2(rand() * amp);
  // Spread points unevenly along an edge, as a hand cut would.
  const stops = (n: number) => {
    const out: number[] = [];
    for (let i = 1; i < n; i += 1) {
      const jitter = (rand() - 0.5) * (100 / n) * 0.6;
      out.push(r2((i * 100) / n + jitter));
    }
    return out;
  };

  const pts: string[] = [];
  // Top edge, left to right. Corners are cut slightly off square.
  pts.push(`${off()}px ${off()}px`);
  for (const p of stops(across)) pts.push(`${p}% ${off()}px`);
  pts.push(`calc(100% - ${off()}px) ${off()}px`);
  // Right edge, top to bottom.
  for (const p of stops(down)) pts.push(`calc(100% - ${off()}px) ${p}%`);
  pts.push(`calc(100% - ${off()}px) calc(100% - ${off()}px)`);
  // Bottom edge, right to left.
  for (const p of stops(across).reverse()) pts.push(`${p}% calc(100% - ${off()}px)`);
  pts.push(`${off()}px calc(100% - ${off()}px)`);
  // Left edge, bottom to top.
  for (const p of stops(down).reverse()) pts.push(`${off()}px ${p}%`);

  return `polygon(${pts.join(', ')})`;
}

/**
 * A torn or cut top edge for a full-width band, as an SVG path in a
 * `width` x `height` box. The band is filled below the edge.
 */
export function cutBandPath(seed: number | string, width = 1440, height = 24, segments = 36): string {
  const rand = rng(seed);
  const step = width / segments;
  let d = `M0 ${height}`;
  for (let i = 0; i <= segments; i += 1) {
    const x = r2(Math.min(width, i * step + (i > 0 && i < segments ? (rand() - 0.5) * step * 0.5 : 0)));
    const y = r2(height * 0.25 + rand() * height * 0.55);
    d += ` L${x} ${y}`;
  }
  d += ` L${width} ${height} Z`;
  return d;
}
