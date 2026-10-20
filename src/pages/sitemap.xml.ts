import type { APIRoute } from 'astro';
import { sitemapFileNames } from '@/features/feeds/sitemaps';
import { sitemapIndex, xmlResponse } from '@/features/feeds/xml';

export const prerender = false;

export const GET: APIRoute = async () => xmlResponse(sitemapIndex(await sitemapFileNames()));
