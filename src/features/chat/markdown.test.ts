import { describe, expect, it } from 'vitest';
import { renderMarkdown } from './markdown';

describe('renderMarkdown', () => {
  it('escapes HTML', () => {
    const html = renderMarkdown('<img src=x onerror=alert(1)> **bold**');
    expect(html).not.toContain('<img');
    expect(html).toContain('&lt;img');
    expect(html).toContain('<strong>bold</strong>');
  });

  it('renders lists and safe links only', () => {
    const html = renderMarkdown('Homes:\n- [Sector 57](/property/12)\n- [bad](javascript:alert(1))');
    expect(html).toContain('<ul>');
    expect(html).toContain('<a href="/property/12">Sector 57</a>');
    // The bad link stays as plain text: no link is made.
    expect(html).not.toMatch(/href="javascript:/);
    expect(html).not.toContain('>bad</a>');
  });
});
