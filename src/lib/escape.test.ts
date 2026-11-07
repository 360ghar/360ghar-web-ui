import { describe, expect, it } from 'vitest';
import { escapeHtml, escapeXml } from './escape';

describe('escapers', () => {
  it('escapes markup characters for HTML, leaving apostrophes alone', () => {
    expect(escapeHtml(`<a href="x">Tom's & Jerry</a>`)).toBe(`&lt;a href=&quot;x&quot;&gt;Tom's &amp; Jerry&lt;/a&gt;`);
  });

  it('escapes all five characters for XML and turns null into empty text', () => {
    expect(escapeXml(`<a>'"&`)).toBe('&lt;a&gt;&apos;&quot;&amp;');
    expect(escapeXml(null)).toBe('');
    expect(escapeXml(undefined)).toBe('');
  });

  it('drops control characters XML 1.0 forbids and keeps tab, newline and carriage return', () => {
    expect(escapeXml('a\u000Bb\u0000c\u001Fd')).toBe('abcd');
    expect(escapeXml('a\tb\nc\rd')).toBe('a\tb\nc\rd');
  });

  it('drops lone surrogates and U+FFFE, and keeps valid pairs such as emoji', () => {
    expect(escapeXml('a\uD800b\uDC00c\uFFFEd')).toBe('abcd');
    expect(escapeXml('🏠 Gurugram')).toBe('🏠 Gurugram');
  });
});
