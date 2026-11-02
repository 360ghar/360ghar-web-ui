/**
 * The two app deep-link files are owned by the backend (they bind the app
 * signatures to this domain). Netlify proxied them with netlify.toml 200-rewrites;
 * Workers _redirects cannot proxy external hosts, so the SSR endpoints under
 * src/pages/.well-known/ fetch and return them through this helper. The response
 * headers mirror the netlify.toml /.well-known/* rule (open CORS, one hour).
 */
const API_ORIGIN = (import.meta.env.API_ORIGIN as string | undefined) ?? 'https://api.360ghar.com';

export async function proxyWellKnown(file: string): Promise<Response> {
  let upstream: Response;
  try {
    upstream = await fetch(`${API_ORIGIN}/.well-known/${file}`);
  } catch {
    return new Response('The deep-link file is unavailable.', { status: 502, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
  }
  const headers = new Headers();
  headers.set('Content-Type', upstream.headers.get('Content-Type') ?? 'application/json');
  headers.set('Access-Control-Allow-Origin', '*');
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('Cloudflare-CDN-Cache-Control', 'public, s-maxage=3600');
  return new Response(upstream.body, { status: upstream.status, headers });
}
