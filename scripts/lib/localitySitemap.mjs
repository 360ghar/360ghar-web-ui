function escapeXml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const SITE_URL = process.env.SITE_URL || 'https://360ghar.com';

const INTENT_ENABLED_TYPES = new Set([
  'society', 'project', 'locality', 'sector', 'township', 'phase',
]);
const INTENTS = ['buy', 'rent'];

function buildAlternates(enPath) {
  const base = SITE_URL.replace(/\/$/, '');
  return [
    `<xhtml:link rel="alternate" hreflang="en" href="${base}${enPath}" />`,
    `<xhtml:link rel="alternate" hreflang="hi" href="${base}/hi${enPath === '/' ? '' : enPath}" />`,
    `<xhtml:link rel="alternate" hreflang="x-default" href="${base}${enPath}" />`,
  ].map(a => `    ${a}`).join('\n');
}

function shouldIncludeIntentPages(entity) {
  if (INTENT_ENABLED_TYPES.has((entity.entityType || '').toLowerCase())) return true;
  const name = (entity.name || '').toLowerCase();
  if (/society|apartment|flat|residency|residential|heights|towers|enclave|vihar|kunj|sarovar|green|estate|riverside|complex|block|tower/i.test(name)) return true;
  return false;
}

export function buildLocalitySitemapXml(siteUrl, entities) {
  const base = String(siteUrl || SITE_URL).replace(/\/$/, '');
  const xmlHeader = '<?xml version="1.0" encoding="UTF-8"?>';
  const urls = entities
    .filter((item) => item?.canonicalUrl)
    .flatMap((item) => {
      const enPath = item.canonicalUrl;
      const hiPath = `/hi${enPath}`;
      const lastmod = item.lastVerifiedAt ? escapeXml(item.lastVerifiedAt) : null;
      const alts = buildAlternates(enPath);
      const commonInner = `${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n${alts}\n  `;
      const pageUrls = [
        `  <url>\n    <loc>${escapeXml(`${base}${enPath}`)}</loc>\n${commonInner}</url>`,
        `  <url>\n    <loc>${escapeXml(`${base}${hiPath}`)}</loc>\n${commonInner}</url>`,
      ];

      if (shouldIncludeIntentPages(item)) {
        for (const intent of INTENTS) {
          const intentEnPath = `${enPath}/${intent}`;
          const intentHiPath = `/hi${intentEnPath}`;
          const intentAlts = buildAlternates(intentEnPath);
          const intentInner = `${lastmod ? `    <lastmod>${lastmod}</lastmod>\n` : ''}    <changefreq>weekly</changefreq>\n    <priority>0.65</priority>\n${intentAlts}\n  `;
          pageUrls.push(
            `  <url>\n    <loc>${escapeXml(`${base}${intentEnPath}`)}</loc>\n${intentInner}</url>`,
            `  <url>\n    <loc>${escapeXml(`${base}${intentHiPath}`)}</loc>\n${intentInner}</url>`,
          );
        }
      }

      return pageUrls;
    });

  return [xmlHeader, '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">', ...urls, "</urlset>", ""].join("\n");
}
