/**
 * Owner and tenant AI tools: the listing writer, virtual staging and the rent agreement and legal notice drafters.
 * Their backend routes (POST /api/v1/ai/listing-draft, /design-studio/stage, /ai/legal-draft) ship with the backend
 * release, so the UI stays hidden until PUBLIC_AI_OWNER_TOOLS=true is set (netlify.toml, after the backend deploy).
 */
export const AI_OWNER_TOOLS = import.meta.env.PUBLIC_AI_OWNER_TOOLS === 'true';
