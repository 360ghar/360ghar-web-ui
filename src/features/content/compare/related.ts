import { COMPETITORS, type Competitor } from './competitors';

/**
 * The next `n` competitors after `slug`, wrapping around, so every page links
 * to different comparisons (the old pages always linked the first three).
 */
export function nextCompetitors(slug: string, n = 3, list: Competitor[] = COMPETITORS): Competitor[] {
  const i = list.findIndex((c) => c.slug === slug);
  const out: Competitor[] = [];
  for (let k = 1; out.length < Math.min(n, list.length - 1); k += 1) out.push(list[(i + k + list.length) % list.length]!);
  return out;
}
