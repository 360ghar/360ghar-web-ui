import { describe, expect, it } from 'vitest';

import { realEstateStructuredData } from './structuredData';

describe('realEstateStructuredData.website', () => {
  it('uses the live property search route for SearchAction', () => {
    expect(realEstateStructuredData.website.potentialAction.target.urlTemplate)
      .toBe('https://360ghar.com/properties?q={search_term_string}&city=gurgaon');
  });
});
