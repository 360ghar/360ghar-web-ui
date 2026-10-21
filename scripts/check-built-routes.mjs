/**
 * Runs the BUILT Netlify function (after `pnpm build`) the way Netlify does: Node without
 * require(esm). A CommonJS dependency that requires an ESM-only package then throws on import,
 * and Astro answers with the catch-all 404 (this is how every /blog/<slug> broke in production).
 * The blog API is mocked, so the check does not depend on live data.
 *
 *   node scripts/check-built-routes.mjs
 */
import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath, pathToFileURL } from 'node:url';

const fn = fileURLToPath(new URL('../.netlify/v1/functions/ssr/ssr.mjs', import.meta.url));

if (process.argv[2] !== '--child') {
  if (!existsSync(fn)) {
    console.error('Run `pnpm build` first: .netlify/v1/functions/ssr/ssr.mjs is missing.');
    process.exit(1);
  }
  const r = spawnSync(process.execPath, [fileURLToPath(import.meta.url), '--child'], {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --no-experimental-require-module --no-experimental-detect-module`.trim() },
  });
  process.exit(r.status ?? 1);
}

const post = {
  id: 1,
  slug: 'built-output-check',
  title: 'Built output check post',
  content: '<h2>Heading</h2><p>Body text.</p>',
  excerpt: 'Body text.',
  active: true,
  created_at: '2026-10-01T00:00:00Z',
  categories: [],
  tags: [],
};
const realFetch = globalThis.fetch;
globalThis.fetch = async (input, init) => {
  const url = new URL(typeof input === 'string' ? input : (input.url ?? input));
  if (url.hostname !== 'api.360ghar.com') return realFetch(input, init);
  const json = (status, body) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
  if (url.pathname === '/api/v1/pages/privacy-policy/public') return json(200, { unique_name: 'privacy-policy', title: 'Privacy Policy', format: 'html', content: '<h2>Policy heading</h2><p>Policy body text.</p>', updated_at: '2026-10-01T00:00:00Z' });
  if (url.pathname === '/api/v1/blog/posts/built-output-check') return json(200, post);
  if (url.pathname.startsWith('/api/v1/blog/posts/')) return json(404, { detail: 'not found' });
  if (url.pathname === '/api/v1/blog/posts') return json(200, { items: [post], next_cursor: null });
  return json(404, { detail: 'not mocked' });
};

const handler = (await import(pathToFileURL(fn).href)).default;
const get = async (path) => {
  const res = await handler(new Request(`https://360ghar.com${path}`), { ip: '127.0.0.1' });
  return { status: res.status, body: await res.text(), cdn: res.headers.get('netlify-cdn-cache-control') };
};

const failures = [];

// /app and /hi/app are prerendered (static output, not function routes): check the generated files.
for (const file of ['app.html', 'hi/app.html']) {
  const path = new URL(`../dist/${file}`, import.meta.url);
  if (!existsSync(path)) failures.push(`dist/${file} is missing`);
  else {
    const html = readFileSync(path, 'utf8');
    for (const needle of ['com.the360ghar.ghar360', 'com.the360ghar.flatmates360', 'id6771899300']) if (!html.includes(needle)) failures.push(`dist/${file} has no link with ${needle}`);
  }
}

const expect = (ok, msg) => ok || failures.push(msg);

for (const prefix of ['', '/hi']) {
  const found = await get(`${prefix}/blog/built-output-check`);
  expect(found.status === 200, `${prefix}/blog/<slug>: expected 200, got ${found.status}`);
  expect(Boolean(found.cdn), `${prefix}/blog/<slug>: no Netlify-CDN-Cache-Control header`);
  expect(found.body.includes('Built output check post'), `${prefix}/blog/<slug>: post title missing (catch-all 404 page?)`);
  const missing = await get(`${prefix}/blog/no-such-post`);
  expect(missing.status === 404, `${prefix}/blog/<unknown>: expected 404, got ${missing.status}`);
  expect(
    prefix ? missing.body.includes('यह पोस्ट नहीं मिली') : missing.body.includes('This post is not here'),
    `${prefix}/blog/<unknown>: expected the blog not-found state`,
  );
}

const policy = await get('/policies/privacy-policy');
expect(Boolean(policy.cdn), '/policies/<slug>: no Netlify-CDN-Cache-Control header');
expect(policy.status === 200, `/policies/<slug>: expected 200, got ${policy.status}`);
expect(policy.body.includes('Policy body text.'), '/policies/<slug>: policy text missing (catch-all 404 page?)');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('built routes ok');
process.exit(0);
