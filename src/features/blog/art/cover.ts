/**
 * Which cover a blog post gets.
 *
 * Rule: a cover URL under `/seed/blogs/` is a seed placeholder. Every one of
 * them is 64 x 64 px (Cloudinary fl_getinfo, 2026-09-28; backend-gaps D1), so
 * it blurs when shown large. Those posts, and posts with no cover, get a
 * paper-cut scene instead. Any other cover URL is shown as the photo.
 */
import type { BlogPost } from '@/lib/api/types';
import { hash } from '@/lib/paper/cut';
import type { SceneName } from './scenes';

export const hasRealCover = (url: string | null | undefined): url is string => Boolean(url) && !/\/seed\/blogs\//.test(url ?? '');

/* Topic words first: they say more than the category. Earlier rules fit better. */
const TOPICS: [RegExp, SceneName[]][] = [
  [/\b360\b|virtual tour|walkthrough/i, ['tour']],
  [/new (apartment|home|flat)|griha|move in|interior/i, ['toran']],
  [/vastu/i, ['mandala', 'toran']],
  [/\bpg\b|flatmate|co-?living|hostel|short stay|hotel/i, ['room']],
  [/expressway|commut|corridor|metro|highway/i, ['flyover']],
  [/school|gated|famil|communit|societ/i, ['gate']],
  [/rera|legal|lease|agreement|registry|stamp duty|circle rate|document/i, ['seal']],
  [/deposit|landlord/i, ['keys']],
  [/industrial|construction|launch|upcoming|develop/i, ['crane']],
  [/yield|invest|budget|lakh|afford|price|cost|\broi\b/i, ['coin']],
  [/\brent|tenant|to-let/i, ['tolet']],
  [/sector|locality|neighbou?rhood|gurgaon|gurugram/i, ['mappin']],
];

const CATEGORY: [RegExp, SceneName[]][] = [
  [/vastu|design|interior|construction|home-improvement/, ['toran', 'mandala']],
  [/legal|rera|buying/, ['seal', 'keys']],
  [/market|finance|pricing|invest/, ['crane', 'coin', 'flyover']],
  [/rent/, ['tolet', 'room', 'keys']],
  [/neighbou?rhood|lifestyle|living|locality/, ['mappin', 'gate']],
];

type CoverPost = Pick<BlogPost, 'slug' | 'title'> & Partial<Pick<BlogPost, 'categories' | 'tags'>>;

/** Every scene that fits the post, best first: title words, then tags, then the category. */
function coverCandidates(post: CoverPost): SceneName[] {
  const n = hash(post.slug);
  // Within one rule the slug picks the order, so two vastu posts need not match.
  const turn = (list: SceneName[]) => list.map((_, i) => list[(i + n) % list.length]!);
  const words = (text: string) => TOPICS.filter(([re]) => re.test(text)).flatMap(([, list]) => turn(list));
  const tags = (post.tags ?? []).map((t) => t.name).join(' ');
  const cat = post.categories?.[0]?.slug ?? '';
  const byCat = CATEGORY.find(([re]) => re.test(cat))?.[1] ?? [];
  return [...new Set([...words(post.title ?? ''), ...words(tags), ...turn(byCat), 'tolet', 'crane', 'gate'] as SceneName[])];
}

export const coverScene = (post: CoverPost): SceneName => coverCandidates(post)[0]!;

/**
 * Scenes for a list of posts in order. Each post takes its best scene that
 * the previous three cards do not use, so no card repeats its neighbour or
 * the card above it in a three-column grid.
 */
export function coverScenes(posts: CoverPost[]): SceneName[] {
  const out: SceneName[] = [];
  for (const p of posts) {
    const c = coverCandidates(p);
    const recent = out.slice(-3);
    out.push(c.find((s) => !recent.includes(s)) ?? c[0]!);
  }
  return out;
}
