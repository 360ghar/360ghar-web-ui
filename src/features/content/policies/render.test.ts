import { describe, expect, it } from 'vitest';
import { renderPolicy } from './render';

const md = `## Terms of Service

### 1. Acceptance of Terms

By using the **Services** you agree.

#### Details

- One
- Two

### 1. Acceptance of Terms

Write to grievance@360ghar.com.
<script>alert(1)</script>`;

describe('renderPolicy (markdown)', () => {
  const r = renderPolicy({ content: md, format: 'markdown', title: 'Terms of Service' });

  it('drops the heading that repeats the title and shifts levels to h2', () => {
    expect(r.html).not.toContain('Terms of Service</h');
    expect(r.html).toContain('<h2 id="1-acceptance-of-terms">1. Acceptance of Terms</h2>');
    expect(r.html).toContain('<h3 id="details">Details</h3>');
  });

  it('builds a table of contents with unique ids', () => {
    expect(r.toc).toEqual([
      { id: '1-acceptance-of-terms', text: '1. Acceptance of Terms' },
      { id: '1-acceptance-of-terms-2', text: '1. Acceptance of Terms' },
    ]);
  });

  it('keeps "**Label:** value" lines apart', () => {
    const out = renderPolicy({ content: '**Name:** A\n**Email:** b@c.in', format: 'markdown', title: 'x' }).html;
    expect(out).toBe('<p><strong>Name:</strong> A</p><p><strong>Email:</strong> <a href="mailto:b@c.in">b@c.in</a></p>');
  });

  it('keeps formatting, links e-mails and escapes HTML', () => {
    expect(r.html).toContain('<strong>Services</strong>');
    expect(r.html).toContain('<ul><li>One</li><li>Two</li></ul>');
    expect(r.html).toContain('<a href="mailto:grievance@360ghar.com">grievance@360ghar.com</a>.');
    expect(r.html).not.toContain('<script');
  });
});

describe('renderPolicy (html and json)', () => {
  it('sanitizes html and adds heading ids', () => {
    const r = renderPolicy({ content: '<h1>Privacy</h1><h2 onclick="x">Data we keep</h2><p>Hi<script>x</script></p>', format: 'html', title: 'Privacy' });
    expect(r.html).toBe('<h2 id="data-we-keep">Data we keep</h2><p>Hi</p>');
    expect(r.toc).toEqual([{ id: 'data-we-keep', text: 'Data we keep' }]);
  });

  it('shows json as escaped text', () => {
    expect(renderPolicy({ content: '{"a":"<b>"}', format: 'json', title: 'x' }).html).toBe('<pre>{&quot;a&quot;:&quot;&lt;b&gt;&quot;}</pre>');
  });
});
