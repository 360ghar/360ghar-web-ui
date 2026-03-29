/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { describe, expect, it } from 'vitest';

import Property from './Property';

describe('Property SSR', () => {
  it('renders a crawlable property hub intro above the client listings experience', () => {
    const html = renderToString(
      <HelmetProvider>
        <StaticRouter location="/properties">
          <Property />
        </StaticRouter>
      </HelmetProvider>
    );

    expect(html).toContain('Verified Property Search in Gurugram');
    expect(html).toContain('Popular property searches');
  });
});
