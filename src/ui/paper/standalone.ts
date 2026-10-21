/**
 * Paper art as a self-contained SVG file (served by src/pages/art, shown with
 * <img>). A separate file cannot see the page's CSS variables or its shared
 * shadow filters (PaperDefs), so the colours are written out and the markup
 * must carry its own filters (`ownFilters` on the renderers).
 */

/** The paper palette from global.css (the unit test keeps the two the same). */
export const PALETTE: Record<string, string> = {
  'kesar-50': '#fff4ec',
  'kesar-100': '#ffe2cc',
  'kesar-200': '#ffc8a0',
  'kesar-300': '#ffa766',
  'kesar-400': '#ff8a33',
  'kesar-500': '#ff6b00',
  'kesar-600': '#e25b00',
  'kesar-700': '#b54600',
  'kesar-800': '#8a3300',
  'kesar-900': '#5e2100',
  'kesar-950': '#2f0f02',
  'ink-950': '#0f1d19',
  'ink-800': '#2c403a',
  'ink-600': '#3c5148',
  'ink-400': '#7d9389',
  'ink-200': '#d3dfd9',
  'ink-100': '#e9f0ed',
  'mist-50': '#f5f9f7',
  'mist-100': '#e9f1ed',
  'mist-200': '#d6e5de',
  'mist-300': '#b7cdc3',
  'pine-700': '#2b5f54',
  'pine-800': '#1f4a41',
  'pine-900': '#143229',
  paper: '#ffffff',
};

/** Replaces each `var(--color-…)` of the palette with its colour. */
export const plainColors = (svg: string) => svg.replace(/var\(--color-([a-z0-9-]+)\)/g, (m, name: string) => PALETTE[name] ?? m);

/** Wraps rendered SVG markup as a file: a new root tag with the namespace, the viewBox and the aspect rule. */
export function svgFile(markup: string, viewBox: string, aspect?: string): string {
  const body = markup.replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
  return plainColors(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}"${aspect ? ` preserveAspectRatio="${aspect}"` : ''}>${body}</svg>`);
}
