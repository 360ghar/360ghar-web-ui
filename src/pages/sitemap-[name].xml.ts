/** The sitemaps listed in /sitemap.xml and robots.txt. A long one continues in sitemap-<name>-2.xml. */
import type { APIRoute } from 'astro';
import { parseSitemapName, SITEMAPS } from '@/features/feeds/sitemaps';
import { urlsetPages, xmlResponse } from '@/features/feeds/xml';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const target = parseSitemapName(params.name);
  if (!target) return new Response('Not found', { status: 404 });
  try {
    const page = urlsetPages(await SITEMAPS[target.name]!())[target.page - 1];
    return page ? xmlResponse(page) : new Response('Not found', { status: 404 });
  } catch {
    return xmlResponse(null);
  }
};
