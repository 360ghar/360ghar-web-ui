/** IndexNow helpers: read URLs from a sitemap index, batch them, POST them. The network function is injected for tests. */

const ENTITIES = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'" };
const decode = (s) => s.replace(/&(amp|lt|gt|quot|apos);/g, (m) => ENTITIES[m]);

/** <loc> values of a sitemap or sitemap index, XML entities decoded. */
export function extractLocs(xml) {
  return [...xml.matchAll(/<loc>\s*([\s\S]*?)\s*<\/loc>/gi)].map((m) => decode(m[1])).filter(Boolean);
}

/** Every page URL of a site, read from `<base>/sitemap.xml` and the sitemaps it lists. GET only. */
export async function urlsFromSitemapIndex(base, fetchImpl = fetch) {
  const root = base.replace(/\/+$/, '');
  const get = async (url) => {
    const res = await fetchImpl(url, { signal: AbortSignal.timeout(30_000), headers: { 'User-Agent': '360ghar-indexnow-script' } });
    if (!res.ok) throw new Error(`GET ${url} answered ${res.status}`);
    return res.text();
  };
  const children = extractLocs(await get(`${root}/sitemap.xml`)).filter((u) => /\.xml$/i.test(u));
  const urls = [];
  for (const child of children) urls.push(...extractLocs(await get(child)).filter((u) => !/\.xml$/i.test(u)));
  return urls;
}

/** Same-host, unique, valid URLs that match the optional filter. Order is kept. */
export function selectUrls(urls, { host, include, limit } = {}) {
  const seen = new Set();
  const out = [];
  for (const raw of urls) {
    let u;
    try {
      u = new URL(raw);
    } catch {
      continue;
    }
    if (host && u.hostname !== host) continue;
    if (include && !include.test(u.pathname)) continue;
    if (seen.has(u.href)) continue;
    seen.add(u.href);
    out.push(u.href);
    if (limit && out.length >= limit) break;
  }
  return out;
}

export function chunk(list, size) {
  const out = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

export function buildPayload({ host, key, keyLocation, urlList }) {
  return { host, key, keyLocation, urlList };
}

/** POST each batch. Returns { ok, failed } counts. Never throws for one bad batch. */
export async function submitBatches(batches, meta, { endpoint, fetchImpl = fetch, log = console.log } = {}) {
  let ok = 0;
  let failed = 0;
  for (const [i, urlList] of batches.entries()) {
    try {
      const res = await fetchImpl(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        body: JSON.stringify(buildPayload({ ...meta, urlList })),
        signal: AbortSignal.timeout(30_000),
      });
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
      ok += 1;
      log(`batch ${i + 1}/${batches.length}: ${urlList.length} URLs accepted (${res.status})`);
    } catch (e) {
      failed += 1;
      log(`batch ${i + 1}/${batches.length}: failed (${e.message})`);
    }
  }
  return { ok, failed };
}
