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
  if (url.pathname === '/api/v1/content/locality/sector-56' && url.searchParams.get('locale') === 'en')
    return json(200, {
      entity_type: 'locality', slug: 'sector-56', locale: 'en', indexable: true, generated_at: '2026-10-20T00:00:00Z', updated_at: '2026-10-20T00:00:00Z', data_as_of: '2026-10-18',
      body: { summary: 'Generated summary for the built check.', highlights: ['Generated highlight one'], faqs: [{ question: 'Generated question one?', answer: 'Generated answer one.' }], meta_description: 'Generated meta description.' },
      sources: [{ name: 'Check source', url: 'https://example.org/source', as_of: '2026-10-18' }],
    });
  if (url.pathname === '/api/v1/content/locality/sector-56' && url.searchParams.get('locale') === 'hi')
    return json(200, {
      entity_type: 'locality', slug: 'sector-56', locale: 'hi', indexable: true, generated_at: '2026-10-20T00:00:00Z', updated_at: '2026-10-20T00:00:00Z', data_as_of: '2026-10-18',
      body: { summary: 'सेक्टर 56 का बना हुआ सार।', highlights: ['पहली खास बात'], faqs: [{ question: 'पहला सवाल?', answer: 'पहला जवाब।' }], meta_description: 'बना हुआ विवरण।' },
      sources: [{ name: 'जाँच स्रोत', url: 'https://example.org/source', as_of: '2026-10-18' }],
    });
  if (url.pathname.startsWith('/api/v1/content/')) return json(404, { detail: 'not found' });
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
    // Check the badge links themselves (href values): the FlatMates JSON-LD holds the same store ids as text.
    const hrefs = [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1].replaceAll('&amp;', '&'));
    for (const url of ['https://play.google.com/store/apps/details?id=com.the360ghar.ghar360', 'https://play.google.com/store/apps/details?id=com.the360ghar.flatmates360', 'https://apps.apple.com/in/app/360-flatmates/id6771899300']) {
      if (!hrefs.includes(url)) failures.push(`dist/${file} has no badge link to ${url}`);
    }
  }
}

const expect = (ok, msg) => ok || failures.push(msg);

for (const prefix of ['', '/hi']) {
  const found = await get(`${prefix}/blog/built-output-check`);
  expect(found.status === 200, `${prefix}/blog/<slug>: expected 200, got ${found.status}`);
  expect(/s-maxage=[1-9]/.test(found.cdn ?? ''), `${prefix}/blog/<slug>: no Netlify-CDN-Cache-Control with s-maxage`);
  expect(found.body.includes('Built output check post'), `${prefix}/blog/<slug>: post title missing (catch-all 404 page?)`);
  const missing = await get(`${prefix}/blog/no-such-post`);
  expect(missing.status === 404, `${prefix}/blog/<unknown>: expected 404, got ${missing.status}`);
  expect(
    prefix ? missing.body.includes('यह पोस्ट नहीं मिली') : missing.body.includes('This post is not here'),
    `${prefix}/blog/<unknown>: expected the blog not-found state`,
  );
}

const policy = await get('/policies/privacy-policy');
expect(/s-maxage=[1-9]/.test(policy.cdn ?? ''), '/policies/<slug>: no Netlify-CDN-Cache-Control with s-maxage');
expect(policy.status === 200, `/policies/<slug>: expected 200, got ${policy.status}`);
expect(policy.body.includes('Policy body text.'), '/policies/<slug>: policy text missing (catch-all 404 page?)');

// The owner AI tools are off in this build (no PUBLIC_AI_OWNER_TOOLS): the drafter routes are real 404s, not in the tools list.
for (const path of ['/rent-agreement-drafter', '/legal-notice-drafter']) {
  const off = await get(path);
  expect(off.status === 404, `${path}: expected 404 with the flag off, got ${off.status}`);
}

// Generated content: shown, with FAQPage JSON-LD from the same data; a place without a block keeps the fixed FAQs.
const gen = await get('/locality/sector-56-gurgaon');
expect(gen.status === 200, `/locality/<slug>: expected 200, got ${gen.status}`);
expect(gen.body.includes('Generated summary for the built check.'), '/locality/<slug>: generated summary missing');
expect(gen.body.includes('Generated highlight one'), '/locality/<slug>: generated highlight missing');
expect(/"@type":"FAQPage".*Generated question one\?/s.test(gen.body), '/locality/<slug>: FAQPage JSON-LD does not carry the generated FAQ');
expect(gen.body.includes('Check source') && gen.body.includes('Updated'), '/locality/<slug>: provenance line missing');
expect(gen.body.includes('Generated meta description.'), '/locality/<slug>: meta description not from generated content');
const genHi = await get('/hi/locality/sector-56-gurgaon');
expect(genHi.status === 200 && genHi.body.includes('सेक्टर 56 का बना हुआ सार।') && /"@type":"FAQPage".*पहला सवाल\?/s.test(genHi.body), '/hi/locality/<slug>: Hindi generated summary or FAQPage missing');
const plain = await get('/locality/sector-57-gurgaon');
expect(plain.status === 200 && !plain.body.includes('Generated summary'), '/locality/<other>: should render without generated content');
expect(plain.body.includes('What are the circle rates in Sector 57?'), '/locality/<other>: the fixed FAQs are missing');

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}
console.log('built routes ok');
process.exit(0);
