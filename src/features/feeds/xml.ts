/** XML builders for sitemaps and RSS feeds. */
import { SITE_URL } from '@/lib/seo/site';

export const esc = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

export type SitemapEntry = { path: string; lastmod?: string | null; changefreq?: 'daily' | 'weekly' | 'monthly'; priority?: string };

const day = (d?: string | null) => (d && !Number.isNaN(Date.parse(d)) ? new Date(d).toISOString().slice(0, 10) : null);

const hiPath = (p: string) => (p === '/' ? '/hi' : `/hi${p}`);

/** Sitemap protocol limits are 50,000 URLs and 50 MB per file. Stay under both. */
export const SITEMAP_MAX_URLS = 45_000;
export const SITEMAP_MAX_BYTES = 45 * 1024 * 1024;

const OPEN = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
const CLOSE = '\n</urlset>\n';

/** The English and the Hindi <url> of one path, each with hreflang alternates. */
function entryXml(e: SitemapEntry): string[] {
  const alts = [
    `    <xhtml:link rel="alternate" hreflang="en" href="${esc(SITE_URL + e.path)}"/>`,
    `    <xhtml:link rel="alternate" hreflang="hi" href="${esc(SITE_URL + hiPath(e.path))}"/>`,
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE_URL + e.path)}"/>`,
  ].join('\n');
  const lastmod = day(e.lastmod);
  const inner = `${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}${e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>\n` : ''}${e.priority ? `    <priority>${e.priority}</priority>\n` : ''}${alts}`;
  return [e.path, hiPath(e.path)].map((p) => `  <url>\n    <loc>${esc(SITE_URL + p)}</loc>\n${inner}\n  </url>`);
}

/** One urlset with the English and the Hindi URL of every path. */
export function urlset(entries: SitemapEntry[]): string {
  return `${OPEN}${entries.flatMap(entryXml).join('\n')}${CLOSE}`;
}

/** Split into files that each stay under the URL and byte limits. An English and its Hindi URL never split, so alternates stay in one file. */
export function urlsetPages(entries: SitemapEntry[], maxUrls = SITEMAP_MAX_URLS, maxBytes = SITEMAP_MAX_BYTES): string[] {
  const pages: string[] = [];
  let cur: string[] = [];
  let bytes = OPEN.length + CLOSE.length;
  const flush = () => {
    if (cur.length) pages.push(`${OPEN}${cur.join('\n')}${CLOSE}`);
    cur = [];
    bytes = OPEN.length + CLOSE.length;
  };
  for (const e of entries) {
    const xml = entryXml(e);
    const size = xml.reduce((n, u) => n + Buffer.byteLength(u) + 1, 0);
    if (cur.length && (cur.length + xml.length > maxUrls || bytes + size > maxBytes)) flush();
    cur.push(...xml);
    bytes += size;
  }
  flush();
  return pages.length ? pages : [urlset([])];
}

export function sitemapIndex(names: string[]): string {
  const items = names.map((n) => `  <sitemap>\n    <loc>${SITE_URL}/${n}</loc>\n  </sitemap>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
}

export type RssItem = { title: string; link: string; description?: string | null; date?: string | null };
export type Channel = { title: string; description: string; self: string; language: 'en-in' | 'hi-in'; link?: string };

const rfc822 = (d?: string | null) => (d && !Number.isNaN(Date.parse(d)) ? new Date(d).toUTCString() : null);

export function rss(ch: Channel, items: RssItem[]): string {
  const body = items
    .map((i) => {
      const date = rfc822(i.date);
      return `    <item>\n      <title>${esc(i.title)}</title>\n      <link>${esc(i.link)}</link>\n      <description>${esc(i.description)}</description>\n${date ? `      <pubDate>${date}</pubDate>\n` : ''}      <guid isPermaLink="true">${esc(i.link)}</guid>\n    </item>`;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${esc(ch.title)}</title>
    <link>${esc(ch.link ?? SITE_URL)}</link>
    <description>${esc(ch.description)}</description>
    <language>${ch.language}</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${esc(SITE_URL + ch.self)}" rel="self" type="application/rss+xml"/>
${body}
  </channel>
</rss>
`;
}

/** Response with a one-day CDN cache; errors are not cached. */
export function xmlResponse(body: string | null, type: 'application/xml' | 'application/rss+xml' = 'application/xml'): Response {
  if (body === null) return new Response('Feed is not available right now.', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Retry-After': '120' } });
  return new Response(body, {
    headers: {
      'Content-Type': `${type}; charset=utf-8`,
      'Cache-Control': 'public, max-age=3600',
      'Netlify-CDN-Cache-Control': 'public, durable, s-maxage=86400, stale-while-revalidate=86400',
    },
  });
}
