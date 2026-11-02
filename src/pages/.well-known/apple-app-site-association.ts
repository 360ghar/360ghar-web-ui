import type { APIRoute } from 'astro';
import { proxyWellKnown } from '@/lib/well-known';

export const prerender = false;

/** iOS app deep links (AASA). Proxied from the backend (was a netlify.toml 200-rewrite). */
export const GET: APIRoute = () => proxyWellKnown('apple-app-site-association');
