// Escape special XML characters to prevent breaking the sitemap
function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function buildLocalitySitemapXml(siteUrl, entities) {
  const base = String(siteUrl || "https://360ghar.com").replace(/\/$/, "");
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urls = entities
    .filter((item) => item?.canonicalUrl)
    .map((item) => {
      const url = escapeXml(`${base}${item.canonicalUrl}`);
      const lastmod = escapeXml(item.lastVerifiedAt || new Date().toISOString().slice(0, 10));
      return `  <url>\n    <loc>${url}</loc>\n    <lastmod>${lastmod}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>`;
    });

  return [xmlHeader, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, "</urlset>", ""].join("\n");
}
