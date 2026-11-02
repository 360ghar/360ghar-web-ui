import type { APIRoute } from 'astro';
import { proxyWellKnown } from '@/lib/well-known';

export const prerender = false;

/** Android app deep links. Proxied from the backend (was a netlify.toml 200-rewrite). */
export const GET: APIRoute = () => proxyWellKnown('assetlinks.json');
