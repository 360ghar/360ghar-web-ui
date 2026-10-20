/**
 * Speakable selectors for text pages (src/layouts/Content.astro). They must match the layout markup:
 * `.content-h1` is the page h1 and `.content-lead` is the one-line lead (only rendered when a lead is given).
 * speakable.test.ts reads Content.astro to check both class names still exist.
 */
export const CONTENT_SPEAKABLE = { heading: '.content-h1', lead: '.content-lead' } as const;

/** Selectors for one Content page. None for a noindex page (app-like pages such as delete-account). */
export function contentSpeakable(hasLead: boolean, noindex = false): string[] | undefined {
  if (noindex) return undefined;
  return hasLead ? [CONTENT_SPEAKABLE.heading, CONTENT_SPEAKABLE.lead] : [CONTENT_SPEAKABLE.heading];
}
