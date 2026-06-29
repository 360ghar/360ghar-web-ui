/* @vitest-environment node */

import { renderToString } from 'react-dom/server';
import { HelmetProvider } from 'react-helmet-async';
import { StaticRouter } from 'react-router-dom/server';
import { describe, expect, it, beforeEach } from 'vitest';

import SEO from './SEO';
import useLocaleStore from '../store/localeStore';

function renderSeo({ location, locale, canonical }) {
  const helmetContext = {};

  useLocaleStore.setState({ locale });

  renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={location}>
        <SEO title="Test Title" description="Test Description" canonical={canonical} />
      </StaticRouter>
    </HelmetProvider>
  );

  return helmetContext.helmet;
}

describe('SEO localized metadata', () => {
  beforeEach(() => {
    useLocaleStore.setState({ locale: 'en' });
  });

  it('forces the canonical to the English path for Hindi routes', () => {
    const helmet = renderSeo({
      location: '/hi/about-us',
      locale: 'hi',
      canonical: '/about-us',
    });

    expect(helmet.link.toString()).toContain('rel="canonical" href="https://360ghar.com/about-us"');
  });

  it('derives hreflang alternates from the canonical target', () => {
    const helmet = renderSeo({
      location: '/hi/gurgaon/rent/apartments',
      locale: 'hi',
      canonical: '/gurgaon/rent/flats',
    });

    const links = helmet.link.toString();

    expect(links).toContain('rel="alternate" hrefLang="en" href="https://360ghar.com/gurgaon/rent/flats"');
    expect(links).toContain('rel="alternate" hrefLang="hi" href="https://360ghar.com/hi/gurgaon/rent/flats"');
  });
});
