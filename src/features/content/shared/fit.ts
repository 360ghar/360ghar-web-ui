/**
 * Size cap for a display title, in cqi (per cent of the width of the title's
 * column), that keeps a title of this length to two lines of Supreme 700 with
 * `text-wrap: balance`. Measured on the 20 blog titles and the content page
 * titles at 360 to 1440 px, with about 5 % to spare. `null`: short enough.
 */
export function titleFit(text: string): number | null {
  const n = [...text.trim()].length;
  if (n <= 30) return null;
  if (n <= 40) return 8.4;
  if (n <= 50) return 6.9;
  if (n <= 60) return 6.3;
  return Math.round(((6.3 * 60) / n) * 10) / 10;
}
