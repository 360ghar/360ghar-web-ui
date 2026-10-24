import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { citySlug, validSlug } from './route';

const read = (path: string) => readFileSync(path, 'utf8');

const hreraPages = [
  'src/features/data-hub/ReraPage.astro',
  'src/features/data-hub/BuildersPage.astro',
  'src/features/data-hub/BuilderPage.astro',
  'src/features/data-hub/BuilderScorePage.astro',
];

describe('HRERA resource routes', () => {
  it('publishes the HRERA pages instead of holding them', () => {
    for (const page of hreraPages) {
      const source = read(page);
      expect(source, page).not.toContain('HreraNotice.astro');
      expect(source, page).not.toMatch(/\bDataHubHold\b/);
      expect(source, page).not.toMatch(/\bnoindex\b/);
    }
  });

  it('renders project and builder records with JSON-LD', () => {
    const directory = read('src/features/data-hub/ReraPage.astro');
    expect(directory).toMatch(/\bjsonLd\b/);
    expect(directory).toMatch(/itemListElement/);
    expect(directory).toMatch(/p\.project_name/);

    const builders = read('src/features/data-hub/BuildersPage.astro');
    expect(builders).toMatch(/\bjsonLd\b/);
    expect(builders).toMatch(/b\.builder_name/);

    const detail = read('src/features/data-hub/BuilderPage.astro');
    expect(detail).toMatch(/\bjsonLd\b/);
    expect(detail).toMatch(/b\.builder_score/);
    expect(detail).toMatch(/b\.total_complaints/);
  });

  it('fetches live HRERA data from the route files', () => {
    const reraRoute = read('src/pages/rera-projects.astro');
    expect(reraRoute).toMatch(/data-hub\/api/);
    expect(reraRoute).toMatch(/\breraPage\s*\(/);
    expect(reraRoute).toMatch(/\ballRera\b/);

    const builderRoute = read('src/pages/builder-reputation.astro');
    expect(builderRoute).toMatch(/data-hub\/api/);
    expect(builderRoute).toMatch(/\bbuildersPage\s*\(/);

    const builderDetail = read('src/pages/builder-reputation/[slug].astro');
    expect(builderDetail).toMatch(/data-hub\/api/);
    expect(builderDetail).toMatch(/\bbuilder\s*\(/);
  });

  it('keeps malformed builder detail slugs as 404s', () => {
    const route = read('src/pages/builder-reputation/[slug].astro');
    expect(validSlug('Bad Slug')).toBe(false);
    expect(validSlug('dlf-2')).toBe(true);
    expect(route).toContain('validSlug');
    // `settle` → `respond(..., { notFound: true })` sets the 404 in src/lib/cache.ts.
    expect(route).toMatch(/\bsettle\s*\(/);
  });

  it('turns every district the registers file into a segment the route accepts', () => {
    // Delhi's districts are mostly multi-word. The route gates its city segment
    // with `validSlug`, which rejects a space, so a raw city would make the page
    // 404 on the link the site itself emits.
    const filed = [
      'Gurugram', 'Panipat', 'Faridabad', 'Rewari', 'Fatehabad', 'Sonipat',
      'New Delhi', 'South West Delhi', 'South Delhi', 'North West Delhi', 'Central Delhi',
      'East Delhi', 'North Delhi', 'West Delhi', 'Shahdara', 'North East Delhi', 'South East Delhi',
    ];

    for (const city of filed) {
      const segment = citySlug(city);
      expect(validSlug(segment), `${city} -> ${segment}`).toBe(true);
      expect(segment, city).not.toContain(' ');
      expect(segment, city).not.toContain('%');
    }
  });

  it('slugifies a multi-word district the way the URL needs it', () => {
    expect(citySlug('New Delhi')).toBe('new-delhi');
    expect(citySlug('South West Delhi')).toBe('south-west-delhi');
    expect(citySlug('  gUrUgRaM  ')).toBe('gurugram');
    expect(citySlug('Shahdara')).toBe('shahdara');
  });

  it('builds the micro-market canonical URL from the slug, not the raw city', () => {
    const page = read('src/features/projects/MicroMarketPage.astro');
    // A raw `market.city` here would put a literal space in `path`, which is the
    // canonical URL and the og:url, and the route would reject it on the way back in.
    expect(page).toContain('citySlug(market.city)');
    expect(page).not.toContain('market.city.toLowerCase()');
  });

  it('points every HRERA surface at the live portal host', () => {
    const dead = 'hrera.haryana.gov.in';

    // The old host no longer resolves, so no HRERA surface may link to it.
    for (const path of [...hreraPages, 'src/pages/rera-projects.astro', 'src/features/data-hub/api.ts']) {
      expect(read(path), path).not.toContain(dead);
    }
  });
});
