/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { describe, expect, it } from 'vitest';

import LocalitiesDirectory from './LocalitiesDirectory';

describe('LocalitiesDirectory SSR', () => {
  it('renders crawlable locality hub content instead of a loading spinner', () => {
    const html = renderToString(
      <HelmetProvider>
        <StaticRouter location="/localities">
          <LocalitiesDirectory />
        </StaticRouter>
      </HelmetProvider>
    );

    expect(html).toContain('Explore Gurugram Localities with Verified Insights');
    expect(html).not.toContain('Loading...');
  });
});
