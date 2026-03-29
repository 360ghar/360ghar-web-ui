/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import Landing from './Landing';

function renderLanding(location) {
  const helmetContext = {};

  renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={location}>
        <Routes>
          <Route path="/:citySlug/:intent/:type" element={<Landing />} />
        </Routes>
      </StaticRouter>
    </HelmetProvider>
  );

  return helmetContext.helmet;
}

describe('Landing SSR metadata', () => {
  it('keeps approved market base landings indexable', () => {
    const helmet = renderLanding('/gurgaon/buy/flats');

    expect(helmet.title.toString()).toContain('Gurgaon');
    expect(helmet.meta.toString()).not.toContain('noindex');
  });

  it('marks unsupported market base landings as noindex', () => {
    const helmet = renderLanding('/mumbai/buy/flats');

    expect(helmet.title.toString()).toContain('Mumbai');
    expect(helmet.meta.toString()).toContain('noindex,nofollow');
  });

  it('canonicalizes apartment aliases to the flats route', () => {
    const helmet = renderLanding('/gurgaon/rent/apartments');

    expect(helmet.link.toString()).toContain('href="https://360ghar.com/gurgaon/rent/flats"');
  });
});
