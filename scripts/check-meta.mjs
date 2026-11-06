/**
 * Checks that every page has its own <title> and meta description.
 *
 *   node scripts/check-meta.mjs [base-url] [--per-sitemap=N]
 *
 * Reads every sitemap from <base-url>/sitemap.xml (N URLs from each, default 300; 0 = all),
 * fetches the pages and fails on:
 *   - a sitemap that does not answer 200, an empty sitemap index, and a page that does not answer 200
 *   - a missing or empty title or description
 *   - two indexable pages with the same title or the same description
 * Titles over 70 and descriptions outside 50-170 characters are printed as warnings.
 */
const args = process.argv.slice(2);
const base = (args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4321').replace(/\/$/, '');
const perSitemap = Number(args.find((a) => a.startsWith('--per-sitemap='))?.split('=')[1] ?? 300);
if (!Number.isInteger(perSitemap) || perSitemap < 0) {
  console.error('--per-sitemap must be a whole number, 0 or more');
  process.exit(2);
}

const decode = (s) =>
  s.replace(/&(#x?[\da-f]+|amp|lt|gt|quot|apos|#39);/gi, (m, e) =>
    e[0] === '#' ? String.fromCodePoint(Number.parseInt(e.slice(e[1] === 'x' ? 2 : 1), e[1] === 'x' ? 16 : 10)) : { amp: '&', lt: '<', gt: '>', quot: '"', apos: "'" }[e.toLowerCase()] ?? m,
  );
const locs = (xml) => [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => {
  const u = new URL(decode(m[1]));
  return u.pathname + u.search;
});
const text = async (path) => {
  const res = await fetch(base + path, { redirect: 'manual', signal: AbortSignal.timeout(30_000) });
  return { status: res.status, body: await res.text() };
};
/** The URLs of a sitemap; exits when it does not answer 200, so a broken feed cannot pass. A child sitemap may be empty. */
const sitemapLocs = async (path) => {
  const { status, body } = await text(path);
  if (status !== 200) {
    console.error(`error ${path}: HTTP ${status}`);
    process.exit(1);
  }
  return locs(body);
};

const sitemaps = await sitemapLocs('/sitemap.xml');
if (!sitemaps.length) {
  console.error('error /sitemap.xml lists no sitemaps');
  process.exit(1);
}
const paths = new Set();
for (const sitemap of sitemaps) {
  const all = await sitemapLocs(sitemap);
  (perSitemap ? all.slice(0, perSitemap) : all).forEach((p) => paths.add(p));
}

const rows = [];
const queue = [...paths];
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (let path = queue.shift(); path; path = queue.shift()) {
      // SSR pages answer 503 when an API call fails under load, so retry a 5xx twice before it counts.
      let { status, body } = await text(path);
      for (let n = 1; status >= 500 && n <= 2; n++) {
        await new Promise((r) => setTimeout(r, 1000 * n));
        ({ status, body } = await text(path));
      }
      if (status !== 200) {
        rows.push({ path, status });
        continue;
      }
      const head = body.slice(0, body.indexOf('</head>'));
      const title = decode(/<title>([\s\S]*?)<\/title>/.exec(head)?.[1] ?? '').trim();
      const description = decode(/<meta name="description" content="([^"]*)"/.exec(head)?.[1] ?? '').trim();
      const noindex = /<meta name="robots" content="[^"]*noindex/.test(head);
      rows.push({ path, status, title, description, noindex });
    }
  }),
);

const errors = [];
const warnings = [];
for (const r of rows) {
  if (r.status !== 200) errors.push(`${r.path}: HTTP ${r.status}`);
  else {
    if (!r.title) errors.push(`${r.path}: no <title>`);
    if (!r.description) errors.push(`${r.path}: no meta description`);
    if (r.title.length > 70) warnings.push(`${r.path}: title is ${r.title.length} chars`);
    if (r.description && (r.description.length < 50 || r.description.length > 170)) warnings.push(`${r.path}: description is ${r.description.length} chars`);
  }
}
for (const key of ['title', 'description']) {
  const seen = new Map();
  for (const r of rows.filter((x) => x.status === 200 && !x.noindex && x[key])) seen.set(r[key], [...(seen.get(r[key]) ?? []), r.path]);
  for (const [value, where] of seen) if (where.length > 1) errors.push(`same ${key} on ${where.join(', ')}: "${value}"`);
}

for (const w of warnings) console.warn(`warn  ${w}`);
for (const e of errors) console.error(`error ${e}`);
console.log(`${rows.length} pages checked, ${errors.length} errors, ${warnings.length} warnings`);
process.exit(errors.length ? 1 : 0);
