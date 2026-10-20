/** Index of the RSS feeds (same channel as the old site). */
import type { APIRoute } from 'astro';
import { SITE_URL } from '@/lib/seo/site';
import { FEED_DEFS } from '@/features/feeds/defs';
import { rss, xmlResponse } from '@/features/feeds/xml';

export const prerender = false;

const FEEDS = (['en', 'hi'] as const).flatMap((lang) =>
  Object.entries(FEED_DEFS).map(([slug, def]) => {
    const [title, description] = def[lang];
    return { title: lang === 'hi' ? `${title} (Hindi)` : title, link: `${SITE_URL}/rss/${lang === 'hi' ? 'hi-' : ''}${slug}.xml`, description };
  }),
);

export const GET: APIRoute = () =>
  xmlResponse(
    rss(
      { title: '360Ghar - All Feeds', description: 'Index of all 360Ghar RSS feeds: blog, properties, and localities', self: '/rss.xml', language: 'en-in' },
      FEEDS,
    ),
    'application/rss+xml',
  );
