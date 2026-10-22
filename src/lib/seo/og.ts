/**
 * Share-card image from the backend (GET /api/v1/og/{kind}/{slug}, a 302 to the card). The live API may not
 * have the route yet, so it is used only when OG_FROM_API=true (set in netlify.toml once the backend is deployed).
 * Without it pages keep their own photo or the site default.
 */
const ORIGIN = (import.meta.env.API_ORIGIN as string | undefined) ?? 'https://api.360ghar.com';

export function apiOgImage(kind: 'locality' | 'property' | 'post', slug: string): string | null {
  return import.meta.env.OG_FROM_API === 'true' ? `${ORIGIN}/api/v1/og/${kind}/${encodeURIComponent(slug)}` : null;
}
