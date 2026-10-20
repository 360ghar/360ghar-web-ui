/**
 * Unique ids for SVG filters in server-rendered paper art. Two scenes on one
 * page must not share a filter id: a filter inside a hidden SVG (a closed menu)
 * does not apply to a visible one that points at it.
 */
let n = 0;

export function paperUid(prefix = 'pa'): string {
  n = (n + 1) % 1_000_000;
  return `${prefix}${n.toString(36)}`;
}
