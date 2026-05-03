import { describe, expect, it } from 'vitest';

import {
  indexableStaticRoutes,
  isIndexableCitySlug,
  isIndexableFacetLanding,
  indexableBudgetFacets,
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

  it('indexes BHK facets for approved cities', () => {
    expect(isIndexableFacetLanding({ citySlug: 'gurgaon', intent: 'buy', bhk: '2-bhk' })).toBe(true);
    expect(isIndexableFacetLanding({ citySlug: 'gurgaon', intent: 'rent', bhk: '3-bhk' })).toBe(true);
    expect(isIndexableFacetLanding({ citySlug: 'gurgaon', intent: 'pg', bhk: '1-bhk' })).toBe(false);
    expect(isIndexableFacetLanding({ citySlug: 'mumbai', intent: 'buy', bhk: '2-bhk' })).toBe(false);
  });

  it('indexes enriched budget facets and rejects amenity facets', () => {
    expect(isIndexableFacetLanding({ citySlug: 'gurgaon', intent: 'buy', budget: 'under-50-lakhs' })).toBe(true);
    expect(isIndexableFacetLanding({ citySlug: 'gurgaon', intent: 'rent', budget: 'under-20k' })).toBe(true);
    expect(isIndexableFacetLanding({ citySlug: 'delhi', intent: 'buy', budget: 'under-50-lakhs' })).toBe(false);
    expect(isIndexableFacetLanding({ citySlug: 'gurgaon', intent: 'buy', amenity: 'parking' })).toBe(false);
  });

  it('defines indexable budget facets list', () => {
    expect(indexableBudgetFacets.length).toBeGreaterThan(0);
    expect(indexableBudgetFacets[0]).toHaveProperty('city');
    expect(indexableBudgetFacets[0]).toHaveProperty('intent');
    expect(indexableBudgetFacets[0]).toHaveProperty('budget');
  });

  it('includes city hub routes in seed landing prerender routes', () => {
    expect(seedLandingPrerenderRoutes).toEqual(
      expect.arrayContaining(['/gurgaon', '/delhi', '/noida', '/faridabad', '/ghaziabad'])
    );
  });

  it('includes expanded locality prerender routes', () => {
    expect(seedLocalityPrerenderRoutes.length).toBeGreaterThanOrEqual(9);
    expect(seedLocalityPrerenderRoutes).toEqual(
      expect.arrayContaining(['/locality/sohna-road-gurgaon', '/locality/sector-49-gurgaon'])
    );
  });

  it('includes BHK facet and cross-city landing prerender routes', () => {
    expect(seedLandingPrerenderRoutes).toEqual(
      expect.arrayContaining([
        '/gurgaon/buy/flats/2-bhk',
        '/gurgaon/buy/villa',
        '/delhi/buy/flats/2-bhk',
        '/faridabad/buy/flats',
        '/ghaziabad/buy/flats',
      ])
    );
  });
});
