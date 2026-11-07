/**
 * Two escapers with two jobs. Both are browser-safe, so client code can import them.
 *
 * - `escapeHtml`: for HTML text and double-quoted attributes. Four characters.
 * - `escapeXml`: for sitemaps and RSS. Five characters (also `'`), and null or undefined become ''.
 *
 * They differ on purpose: escaping `'` in HTML would change the bytes of every page with an apostrophe in its text.
 */

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Characters XML 1.0 forbids: control characters (tab, newline and carriage return are allowed), U+FFFE and U+FFFF, and
// lone surrogates. With the `u` flag the surrogate range matches only unpaired halves, so emoji pass through.
// eslint-disable-next-line no-control-regex
const XML_FORBIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF\uD800-\uDFFF]/gu;

export const escapeXml = (s: unknown) =>
  String(s ?? '')
    .replace(XML_FORBIDDEN, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
