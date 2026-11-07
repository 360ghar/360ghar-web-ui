/**
 * Two escapers with two jobs. Both are browser-safe, so client code can import them.
 *
 * - `escapeHtml`: for HTML text and double-quoted attributes. Four characters.
 * - `escapeXml`: for sitemaps and RSS. Five characters (also `'`), and null or undefined become ''.
 *
 * They differ on purpose: escaping `'` in HTML would change the bytes of every page with an apostrophe in its text.
 */

export const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const escapeXml = (s: unknown) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
