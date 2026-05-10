/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { describe, expect, it } from 'vitest';

import PolicyDetails from './PolicyDetails';

describe('PolicyDetails SSR', () => {
  it('renders policy detail pages inside a crawlable main element', () => {
    const html = renderToString(
      <HelmetProvider>
        <StaticRouter location="/policies/terms-of-service">
          <PolicyDetails />
        </StaticRouter>
      </HelmetProvider>
    );

    expect(html).toContain('<main');
    expect(html).toContain('policy-wrapper');
  });
});
