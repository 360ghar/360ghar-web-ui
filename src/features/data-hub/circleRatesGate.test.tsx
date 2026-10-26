import { readFileSync } from 'node:fs';
import { createElement, type ComponentType } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import CircleRates from './CircleRates';

const CircleRatesView = CircleRates as ComponentType<Record<string, unknown>>;
const staleData = {
  initialFilters: {},
  initialPage: {
    items: [
      {
        id: 42,
        sector: 'Sector 45',
        colony: null,
        property_type: 'residential',
        rate_per_sqyd: 12345,
        rate_per_sqft: 1371,
        revision_year: 2024,
        effective_date: '2024-01-01',
        slug: 'gurugram-sector-45-residential',
      },
    ],
    has_more: false,
    next_cursor: null,
    limit: 20,
    total: 1,
  },
  sectors: ['Sector 45'],
};

const source = (name: string) => readFileSync(new URL(name, import.meta.url), 'utf8');

describe('circle rate publication gate', () => {
  it('hides stale numeric data in English', () => {
    const html = renderToStaticMarkup(createElement(CircleRatesView, { locale: 'en', ...staleData }));

    expect(html).toContain('Circle rates unavailable');
    expect(html).toContain('Current rates are not published because the applicable dated official schedule could not be confirmed');
    expect(html).not.toMatch(/12,345|1,371|Sector 45|2024|<table|<input/);
  });

  it('hides stale numeric data in Hindi', () => {
    const html = renderToStaticMarkup(createElement(CircleRatesView, { locale: 'hi', ...staleData }));

    expect(html).toContain('सर्कल रेट उपलब्ध नहीं हैं');
    expect(html).toContain('लागू होने वाली तारीख़-सहित आधिकारिक दर-सूची की पुष्टि नहीं हो सकी, इसलिए मौजूदा दरें प्रकाशित नहीं हैं');
    expect(html).not.toMatch(/12,345|1,371|Sector 45|2024|<table|<input/);
  });

  it('noindexes the directory and omits its rate schema', () => {
    const directory = source('./CircleRatesPage.astro');

    expect(directory).toMatch(/noindex/);
    expect(directory).not.toMatch(/jsonLd=|generateToolSchema|RateSkyline|howTo=/);
  });

  it('noindexes details and omits rate-derived output', () => {
    const detail = source('./CircleRatePage.astro');

    expect(detail).toMatch(/noindex/);
    expect(detail).not.toMatch(/rate_per_sq(?:yd|ft)|revision_year|effective_date|RateSkyline|StampDuty|faqs=/);
  });

  it('does not fetch circle-rate data from the held directory or detail routes', () => {
    const directoryRoute = source('../../pages/circle-rates.astro');
    const detailRoute = source('../../pages/circle-rate/[slug].astro');

    expect(directoryRoute).not.toMatch(/allCircleRates|circleRatesPage|circleSectors/);
    expect(detailRoute).not.toMatch(/from ['"]@\/features\/data-hub\/api['"]/);
    expect(detailRoute).not.toMatch(/\b(?:safe|circleRate|circleRatesOfType|circleRatesPage)\s*\(/);
  });
});
