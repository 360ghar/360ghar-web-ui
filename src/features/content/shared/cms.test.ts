import { describe, expect, it } from 'vitest';
import { decode, esc, sanitize, slugger, stripTags } from './cms';

describe('sanitize', () => {
  it('removes script and style elements with their content', () => {
    expect(sanitize('<p>a</p><script>alert(1)</script><STYLE>p{color:red}</STYLE><p>b</p>')).toBe('<p>a</p><p>b</p>');
  });

  it('removes on* handlers, style attributes and unknown attributes', () => {
    const out = sanitize('<p onclick="x()" style="color:red" class="lead">Hi</p><img src="https://a.test/a.png" onerror=alert(1) alt="A">');
    expect(out).toBe('<p class="lead">Hi</p><img src="https://a.test/a.png" alt="A" />');
  });

  it('removes javascript: and data: URLs, also when obfuscated', () => {
    for (const href of ['javascript:alert(1)', 'JaVaScRiPt:alert(1)', ' javascript:alert(1)', 'java\tscript:alert(1)', 'java&#x09;script:alert(1)', '&#106;avascript:alert(1)', 'data:text/html,x', 'vbscript:x', '//evil.test']) {
      expect(sanitize(`<a href="${href}">x</a>`)).toBe('<a>x</a>');
    }
  });

  it('removes iframes, svg, comments and forms', () => {
    expect(sanitize('<!--[if IE]><script>x</script><![endif]--><iframe src="https://e.test">t</iframe><svg onload=x><a xlink:href="javascript:x">y</a></svg><form action="/x"><input></form><p>z</p>')).toBe('<p>z</p>');
  });

  it('keeps safe links and forces rel on new-tab links', () => {
    expect(sanitize('<a href="https://360ghar.com/x?a=1&amp;b=2" target="_blank" rel="opener">x</a><a href="/policies" target="_top">p</a><a href="mailto:a@b.in">m</a>')).toBe(
      '<a href="https://360ghar.com/x?a=1&amp;b=2" target="_blank" rel="noopener noreferrer">x</a><a href="/policies">p</a><a href="mailto:a@b.in">m</a>',
    );
  });

  it('keeps headings with ids, lists and tables', () => {
    const html = '<h1>T</h1><h2 id="a">Title</h2><ol start="2"><li>x</li></ol><table><thead><tr><th scope="col">A</th></tr></thead><tbody><tr><td colspan="2">1</td></tr></tbody></table>';
    expect(sanitize(html)).toBe(html);
  });
});

describe('text helpers', () => {
  it('escapes and decodes', () => {
    expect(esc('a & "b" <c>')).toBe('a &amp; &quot;b&quot; &lt;c&gt;');
    expect(decode('&amp;lt; &#39;x&#39;')).toBe("&lt; 'x'");
    expect(stripTags('<b>Rent &amp; deposit</b> ')).toBe('Rent & deposit');
  });

  it('makes unique heading ids', () => {
    const slug = slugger();
    expect([slug('1. Terms'), slug('1. Terms'), slug('1. Terms'), slug('  ')]).toEqual(['1-terms', '1-terms-2', '1-terms-3', 'section']);
  });
});
