import { describe, expect, it } from 'vitest';
import { jobPosting, mailtoFor, OPEN_ROLES, openingBySlug, OPENINGS } from './data';

describe('careers data', () => {
  it('has the 4 old slugs; the developer role is closed', () => {
    expect(OPENINGS.map((o) => o.slug)).toEqual(['content-creator-internship', 'real-estate-agent', 'founders-office-intern', 'software-developer-intern']);
    expect(OPEN_ROLES.map((o) => o.slug)).not.toContain('software-developer-intern');
    expect(openingBySlug('nope')).toBeNull();
  });

  it('builds the mailto subject and a JobPosting without invented fields', () => {
    const o = openingBySlug('real-estate-agent')!;
    expect(mailtoFor(o)).toBe('mailto:info@360ghar.com?subject=Application%20for%20Real%20Estate%20Agent%20-%20Career%20at%20360Ghar');
    const jp = jobPosting(o, 'https://360ghar.com/careers/real-estate-agent');
    expect(jp.datePosted).toBe('2026-06-08');
    expect(jp).not.toHaveProperty('baseSalary');
    expect(jp).not.toHaveProperty('validThrough');
  });
});
