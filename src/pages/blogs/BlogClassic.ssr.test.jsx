/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { describe, expect, it } from 'vitest';

import BlogClassic from './BlogClassic';

describe('BlogClassic SSR', () => {
  it('renders a crawlable blog hub intro before client post fetching runs', () => {
    const html = renderToString(
      <HelmetProvider>
        <StaticRouter location="/blog">
          <BlogClassic />
        </StaticRouter>
      </HelmetProvider>
    );

    expect(html).toContain('Real Estate Guides for Gurugram and Delhi NCR');
    expect(html).toContain('Market reports');
  });
});
