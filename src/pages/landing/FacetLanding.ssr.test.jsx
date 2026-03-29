/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import FacetLanding from './FacetLanding';

function renderFacetLanding(location) {
  const helmetContext = {};

  renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={location}>
        <Routes>
          <Route path="/:citySlug/:intent/:type/:bhk" element={<FacetLanding />} />
          <Route path="/:citySlug/:intent/:type/budget/:budget" element={<FacetLanding />} />
        </Routes>
      </StaticRouter>
    </HelmetProvider>
  );

  return helmetContext.helmet;
}

describe('FacetLanding SSR metadata', () => {
  it('self-canonicalizes indexable BHK facet pages', () => {
    const helmet = renderFacetLanding('/gurgaon/buy/flats/2-bhk');

    expect(helmet.link.toString()).toContain('href="https://360ghar.com/gurgaon/buy/flats/2-bhk"');
    expect(helmet.meta.toString()).not.toContain('noindex,nofollow');
  });

  it('keeps budget facets canonicalized to the base landing and noindex', () => {
    const helmet = renderFacetLanding('/gurgaon/buy/flats/under-50-lakhs');

    expect(helmet.link.toString()).toContain('href="https://360ghar.com/gurgaon/buy/flats"');
    expect(helmet.meta.toString()).toContain('noindex,nofollow');
  });
});
