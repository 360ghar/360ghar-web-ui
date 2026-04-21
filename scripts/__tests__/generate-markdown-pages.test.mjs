import test from 'node:test';
import assert from 'node:assert/strict';

import {
  buildMarkdownDocument,
  getMarkdownBuildRoutes,
  getMarkdownOutputPath,
} from '../generate-markdown-pages.mjs';

test('getMarkdownBuildRoutes stays aligned to public canonical prerendered routes only', () => {
  const routes = getMarkdownBuildRoutes();

  assert.ok(routes.includes('/'));
  assert.ok(routes.includes('/for-ai'));
  assert.ok(routes.includes('/locality/dlf-phase-1-gurgaon'));
  assert.ok(routes.includes('/gurgaon/buy/flats'));
  assert.ok(!routes.includes('/login'));
  assert.ok(!routes.includes('/register'));
  assert.ok(!routes.includes('/account'));
});

test('getMarkdownOutputPath mirrors route segments under the private markdown namespace', () => {
  assert.equal(getMarkdownOutputPath('/'), '__markdown/index.md');
  assert.equal(getMarkdownOutputPath('/for-ai'), '__markdown/for-ai/index.md');
  assert.equal(getMarkdownOutputPath('/vs/nobroker'), '__markdown/vs/nobroker/index.md');
});

test('buildMarkdownDocument converts only main content and prepends page metadata', () => {
  const markdown = buildMarkdownDocument({
    route: '/for-ai',
    html: `<!doctype html>
      <html lang="en">
        <head>
          <title>For AI Assistants | 360Ghar</title>
          <meta name="description" content="Structured entry point for AI assistants.">
          <link rel="canonical" href="https://360ghar.com/for-ai">
        </head>
        <body>
          <header>Global navigation</header>
          <main>
            <h1>For AI Assistants</h1>
            <p>Use this page to discover structured resources.</p>
            <ul><li>llms.txt</li><li>ai.txt</li></ul>
          </main>
          <footer>Footer links</footer>
        </body>
      </html>`,
  });

  assert.match(markdown, /^---\n/);
  assert.match(markdown, /title: "For AI Assistants \| 360Ghar"/);
  assert.match(markdown, /canonical: "https:\/\/360ghar\.com\/for-ai"/);
  assert.match(markdown, /description: "Structured entry point for AI assistants\."/);
  assert.match(markdown, /# For AI Assistants/);
  assert.match(markdown, /Use this page to discover structured resources\./);
  assert.match(markdown, /- llms\.txt/);
  assert.doesNotMatch(markdown, /Global navigation/);
  assert.doesNotMatch(markdown, /Footer links/);
});
