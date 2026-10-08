import { describe, expect, it } from 'vitest';
import { buildCareerApplicationMailto } from './careerApplicationEmail';

describe('buildCareerApplicationMailto', () => {
  it('prefills the application email with the requested applicant details', () => {
    const mailto = buildCareerApplicationMailto(
      'info@360ghar.com',
      "AI Generalist Intern",
    );
    const parsed = new URL(mailto);

    expect(parsed.protocol).toBe('mailto:');
    expect(parsed.pathname).toBe('info@360ghar.com');
    expect(parsed.searchParams.get('subject')).toBe(
      'Application for AI Generalist Intern - Career at 360Ghar',
    );

    const body = parsed.searchParams.get('body');
    expect(body).toContain('Current city:');
    expect(body).toContain('Availability for onsite work in Gurugram:');
    expect(body).toContain('How do you use AI tools, and approximately how much do you use them each day?');
  });
});
