/**
 * Two escapers with two jobs. Both are browser-safe, so client code can import them.
 *
 * - `escapeHtml`: for HTML text and double-quoted attributes. Four characters.
 * - `escapeXml`: for sitemaps and RSS. Five characters (also `'`), and null or undefined become ''.
 *
 * They differ on purpose: escaping `'` in HTML would change the bytes of every page with an apostrophe in its text.
 */

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// Control characters XML 1.0 forbids (tab, newline and carriage return are allowed). One would make a feed unparseable.
// eslint-disable-next-line no-control-regex
const XML_FORBIDDEN = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g;

export const escapeXml = (s: unknown) =>
  String(s ?? '')
    .replace(XML_FORBIDDEN, '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
