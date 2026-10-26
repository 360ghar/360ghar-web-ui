/** /rss/{blog,properties,localities}.xml and their /rss/hi-*.xml twins. */
import type { APIRoute } from 'astro';
import { SITE_URL } from '@/lib/seo/site';
import { FEED_DEFS } from '@/features/feeds/defs';
import { allPosts, allProperties } from '@/features/feeds/data';
import { LISTED_LOCALITIES, displayName, localitySlug } from '@/features/localities/data';
import { rss, xmlResponse, type Channel, type RssItem } from '@/features/feeds/xml';
import { placeLine, typeLabel } from '@/lib/format';

export const prerender = false;

type Slug = keyof typeof FEED_DEFS;
const base = (hi: boolean) => `${SITE_URL}${hi ? '/hi' : ''}`;

const ITEMS: Record<Slug, (hi: boolean) => Promise<RssItem[]> | RssItem[]> = {
  blog: async (hi) =>
    (await allPosts()).filter((p) => p.slug).map((p) => ({ title: p.title, link: `${base(hi)}/blog/${p.slug}`, description: p.excerpt, date: p.published_at ?? p.created_at })),
  properties: async (hi) =>
    (await allProperties()).map((p) => ({
      title: p.title,
      link: `${base(hi)}/property/${p.id}`,
      description: p.description || `${typeLabel(p.property_type, hi ? 'hi' : 'en')} · ${placeLine(p)}`,
      date: p.created_at ?? p.updated_at,
    })),
  localities: (hi) =>
    LISTED_LOCALITIES.filter((l) => l.entityType === 'locality').map((l) => ({
      title: displayName(l.name),
      link: `${base(hi)}/locality/${localitySlug(l)}`,
      description: `${l.type} in ${l.city}`,
    })),
};

export const GET: APIRoute = async ({ params }) => {
  const name = params.feed ?? '';
  const hi = name.startsWith('hi-');
  const slug = hi ? name.slice(3) : name;
  if (!Object.hasOwn(FEED_DEFS, slug)) return new Response('Not found', { status: 404 });
  const [title, description] = FEED_DEFS[slug as Slug][hi ? 'hi' : 'en'];
  const ch: Channel = { title, description, self: `/rss/${name}.xml`, language: hi ? 'hi-in' : 'en-in', link: base(hi) };
  try {
    return xmlResponse(rss(ch, await ITEMS[slug as Slug](hi)), 'application/rss+xml');
  } catch {
    return xmlResponse(null);
  }
};
