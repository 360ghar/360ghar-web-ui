import { describe, expect, it } from 'vitest';
import { AI_FEED_DESCRIPTION, AI_PAGES } from './discovery';

describe('AI DataFeed pages', () => {
  it('does not advertise routes held for source review', () => {
    const paths = AI_PAGES.map(([, path]) => path);
    const heldPaths = [
        '/gurugram-real-estate-guide',
        '/bank-auctions',
        '/rera-projects',
        '/builder-reputation',
        '/zone-checker',
        '/regulatory-updates',
        '/circle-rates',
        '/hi/circle-rates',
        '/stamp-duty-calculator',
        '/landlord-not-returning-security-deposit',
        '/vs/commonfloor',
        '/vs/nestaway',
        '/truth/nobroker-listings',
        '/truth/magicbricks-spam',
        '/truth/99acres-fake',
        '/truth/nestaway-collapse',
        '/truth/zolo-issues',
    ];
    expect(paths.filter((path) => heldPaths.includes(path))).toEqual([]);
  });

  it('uses current, scoped names for calculator and record-lookup pages', () => {
    const title = (path: string) => AI_PAGES.find(([, pagePath]) => pagePath === path)?.[0];

    expect(title('/emi-calculator')).toBe('Home Loan EMI Estimate');
    expect(title('/loan-eligibility-calculator')).toBe('Home Loan Estimate');
    expect(title('/capital-gains-tax-calculator')).toBe('Property Sale Gain Worksheet');
    expect(title('/property-document-checklist')).toBe('Property Document Prompts');
    expect(title('/verify-ownership')).toBe('Haryana Jamabandi Record Lookup');
  });

  it('does not claim verified listings, universal tours, or market-wide coverage', () => {
    expect(AI_FEED_DESCRIPTION).not.toMatch(/India's first|verified listings|360° virtual tours/i);
    expect(AI_FEED_DESCRIPTION).toMatch(/Listing availability and data coverage vary/i);
  });
});
