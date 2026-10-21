// Old-URL check. Usage: node scripts/check-old-urls.mjs <base-url> <dir-with-the-old-sitemap-files>
// Get the old files with: git show <old-commit>:public/sitemap-static.xml > <dir>/sitemap-static.xml (and -landing, -projects, -blog, -datahub, -properties, -localities).
// Prints the status counts. 301 and 404 are counted, not followed; a 5xx or no answer is listed.
// Old URLs = every <loc> of the old static/landing/projects/blog/datahub/properties sitemaps,
// every 40th of localities, plus /hi variants of the static sitemap. No redirects followed.
import { readFileSync } from 'node:fs';
const [base, dir] = process.argv.slice(2);
const locs = (f) => [...readFileSync(`${dir}/${f}`, 'utf8').matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
const set = new Set();
for (const f of ['static', 'landing', 'projects', 'blog', 'datahub', 'properties']) locs(`sitemap-${f}.xml`).forEach((p) => set.add(p));
locs('sitemap-localities.xml').filter((_, i) => i % 40 === 0).forEach((p) => set.add(p));
locs('sitemap-static.xml').forEach((p) => set.add('/hi' + (p === '/' ? '' : p)));
const urls = [...set];
const tally = {}; const bad = [];
let i = 0;
await Promise.all(Array.from({ length: 6 }, async () => {
  while (i < urls.length) {
    const u = urls[i++];
    let s;
    for (let t = 0; t < 3; t++) { try { s = (await fetch(base + u, { redirect: 'manual', signal: AbortSignal.timeout(30_000) })).status; if (s < 500) break; } catch { s = 0; } }
    tally[s] = (tally[s] ?? 0) + 1;
    if (s >= 500 || s === 0) bad.push(u + ' ' + s);
  }
}));
console.log(JSON.stringify({ total: urls.length, tally, errors: bad.slice(0, 20) }));
