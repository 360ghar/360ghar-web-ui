// Canonical city → URL-slug mapping for locality pages.
//
// Gurugram localities are published under the "gurgaon" slug for historical/SEO
// reasons (existing indexed URLs and the LocalityTemplate canonical builder
// both use it). The directory link, the canonical <link>, and the
// LocalityTemplate lookup MUST all derive the city suffix the SAME way —
// deriving it independently in three places is exactly what broke every
// non-Gurgaon locality link (directory emitted `-ghaziabad`, template only
// stripped `-gurgaon`).
export const cityToSlug = (city) =>
  (city || 'gurugram')
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace('gurugram', 'gurgaon');

// Full URL slug for a locality entry, e.g. "dlf-phase-1-gurgaon" /
// "crossing-republik-ghaziabad".
export const buildLocalitySlug = (loc) => `${loc.slug}-${cityToSlug(loc.city)}`;
