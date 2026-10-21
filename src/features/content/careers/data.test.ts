import { describe, expect, it } from 'vitest';
import { jobPosting, mailtoFor, OPEN_ROLES, openingBySlug, OPENINGS } from './data';

describe('careers data', () => {
  it('has the 5 old slugs; the developer role is closed', () => {
    expect(OPENINGS.map((o) => o.slug)).toEqual(['content-creator-internship', 'real-estate-agent', 'founders-office-intern', 'ai-generalist-intern', 'software-developer-intern']);
    expect(OPEN_ROLES.map((o) => o.slug)).not.toContain('software-developer-intern');
    expect(OPEN_ROLES.map((o) => o.slug)).toContain('ai-generalist-intern');
    expect(openingBySlug('nope')).toBeNull();
  });

  it('builds the mailto subject and a JobPosting without invented fields', () => {
    const o = openingBySlug('real-estate-agent')!;
    const mail = new URL(mailtoFor(o));
    expect(mail.pathname).toBe('info@360ghar.com');
    expect(mail.searchParams.get('subject')).toBe('Application for Real Estate Agent - Career at 360Ghar');
    const body = mail.searchParams.get('body');
    expect(body).toContain('I am applying for the Real Estate Agent internship.');
    expect(body).toContain('Current city:');
    expect(body).toContain('Availability for onsite work in Gurugram:');
    expect(body).toContain('How do you use AI tools, and approximately how much do you use them each day?');
    const jp = jobPosting(o, 'https://360ghar.com/careers/real-estate-agent');
    expect(jp.datePosted).toBe('2026-06-08');
    expect(jp).not.toHaveProperty('baseSalary');
    expect(jp).not.toHaveProperty('validThrough');
  });
});
