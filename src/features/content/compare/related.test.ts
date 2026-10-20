import { describe, expect, it } from 'vitest';
import { competitorBySlug, COMPETITORS } from './competitors';
import { nextCompetitors } from './related';
import { TRUTH_PAGES } from './truth';

describe('compare data', () => {
  it('has the 10 route slugs, and every truth page points to a competitor', () => {
    expect(COMPETITORS.map((c) => c.slug)).toEqual(['nobroker', 'magicbricks', '99acres', 'housing', 'commonfloor', 'proptiger', 'squareyards', 'nestaway', 'zolo', 'stanza-living']);
    for (const t of TRUTH_PAGES) expect(competitorBySlug(t.competitor)?.truth).toBe(t.slug);
    for (const c of COMPETITORS) expect(c.claims.every((x) => x.claim && x.reality)).toBe(true);
  });

  it('links the next three comparisons, wrapping around', () => {
    expect(nextCompetitors('nobroker').map((c) => c.slug)).toEqual(['magicbricks', '99acres', 'housing']);
    expect(nextCompetitors('stanza-living').map((c) => c.slug)).toEqual(['nobroker', 'magicbricks', '99acres']);
    expect(nextCompetitors('zolo').map((c) => c.slug)).not.toContain('zolo');
  });
});
