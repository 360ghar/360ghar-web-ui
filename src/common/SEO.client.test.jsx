import { cleanup, render } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import SEO from './SEO';
import useLocaleStore from '../store/localeStore';

function renderSeo() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/properties']}>
        <SEO
          title="Verified Properties | 360Ghar"
          description="Verified property search page."
          canonical="/properties"
        />
      </MemoryRouter>
    </HelmetProvider>
  );
}

describe('SEO client head sync', () => {
  beforeEach(() => {
    document.title = '';
    document.head.querySelectorAll('[data-rh]').forEach((node) => node.remove());
    useLocaleStore.setState({ locale: 'en' });
  });

  afterEach(() => {
    cleanup();
    document.head.querySelectorAll('[data-rh]').forEach((node) => node.remove());
  });

  it('flushes route title and canonical link immediately for prerender readiness', () => {
    renderSeo();

    expect(document.title).toBe('Verified Properties | 360Ghar');
    expect(document.querySelector('link[rel="canonical"]')?.getAttribute('href')).toBe(
      'https://360ghar.com/properties'
    );
  });
});
