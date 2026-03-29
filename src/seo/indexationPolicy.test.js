import { describe, expect, it } from 'vitest';

import {
  indexableStaticRoutes,
  isIndexableCitySlug,
  noindexPrerenderRoutes,
  seedLandingPrerenderRoutes,
  seedLocalityPrerenderRoutes,
} from './indexationPolicy.js';

describe('indexationPolicy', () => {
  it('keeps only approved market slugs indexable', () => {
    expect(isIndexableCitySlug('gurgaon')).toBe(true);
    expect(isIndexableCitySlug('gurugram')).toBe(true);
    expect(isIndexableCitySlug('delhi')).toBe(true);
    expect(isIndexableCitySlug('noida')).toBe(true);
    expect(isIndexableCitySlug('mumbai')).toBe(false);
    expect(isIndexableCitySlug('pune')).toBe(false);
  });

  it('keeps static indexable routes aligned to real hub pages', () => {
    expect(indexableStaticRoutes).toContain('/circle-rates');
    expect(indexableStaticRoutes).toContain('/stamp-duty-calculator');
    expect(indexableStaticRoutes).toContain('/rera-projects');
    expect(indexableStaticRoutes).not.toContain('/buy-property-gurugram');
    expect(indexableStaticRoutes).not.toContain('/virtual-property-tours');
  });

  it('tracks noindex/auth prerender routes and seed GEO routes explicitly', () => {
    expect(noindexPrerenderRoutes).toEqual(
      expect.arrayContaining(['/login', '/register', '/account', '/delete-account', '/post-property'])
    );
    expect(seedLocalityPrerenderRoutes).toEqual(
      expect.arrayContaining(['/locality/dlf-phase-1-gurgaon', '/locality/golf-course-road-gurgaon'])
    );
    expect(seedLandingPrerenderRoutes).toEqual(
      expect.arrayContaining(['/gurgaon/buy/flats', '/noida/rent/flats'])
    );
  });
});
