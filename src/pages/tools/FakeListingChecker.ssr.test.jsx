/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { describe, expect, it } from 'vitest';

import FakeListingChecker from './FakeListingChecker';

describe('FakeListingChecker SSR', () => {
  it('renders the fake listing checker page inside a crawlable main element', () => {
    const html = renderToString(
      <HelmetProvider>
        <StaticRouter location="/check-fake-listing">
          <FakeListingChecker />
        </StaticRouter>
      </HelmetProvider>
    );

    expect(html).toContain('<main');
    expect(html).toContain('Check if a Property Listing is Fake');
  });
});
