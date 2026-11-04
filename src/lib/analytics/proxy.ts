/**
 * Same-origin proxy for PostHog. Ad and tracking blockers drop requests to
 * *.posthog.com, which hides a large share of visitors. Requests to
 * /rel/* go through the Worker to PostHog instead (posthog.com/docs/advanced/proxy/cloudflare).
 */
export const PH_PROXY = '/rel';

const HOST = (import.meta.env.PUBLIC_POSTHOG_HOST as string | undefined) ?? 'https://us.i.posthog.com';
/** PostHog Cloud serves the SDK, toolbar and remote config from a separate assets host. */
const ASSET_HOST = HOST.replace(/\/\/(\w+)\.i\.posthog\.com/, '//$1-assets.i.posthog.com');
/** The app (toolbar, links in the SDK) lives on <region>.posthog.com. */
export const PH_UI_HOST = HOST.replace(/\/\/(\w+)\.i\.posthog\.com/, '//$1.posthog.com');

export async function proxyPostHog(request: Request, pathname: string, search: string): Promise<Response> {
  let path = pathname.slice(PH_PROXY.length) || '/';
  const isAsset = path.startsWith('/static/') || path.startsWith('/array/');
  // The client strips trailing slashes (see rewriteRequestPath in ./index); PostHog's API paths end in one.
  if (!isAsset && !path.endsWith('/')) path += '/';
  const headers = new Headers(request.headers);
  headers.delete('cookie');
  headers.delete('host');
  // Capture v1 sends the project token as a Bearer header; strip any other credential.
  if (!headers.get('authorization')?.startsWith('Bearer phc_')) headers.delete('authorization');
  // PostHog geolocates from this, not from the Worker's own address.
  const ip = request.headers.get('cf-connecting-ip');
  if (ip) headers.set('x-forwarded-for', ip);
  const hasBody = request.method !== 'GET' && request.method !== 'HEAD';
  const res = await fetch(`${isAsset ? ASSET_HOST : HOST}${path}${search}`, {
    method: request.method,
    headers,
    body: hasBody ? await request.arrayBuffer() : undefined,
  });
  // A fresh Response: the upstream one has immutable headers, and the middleware adds its own.
  return new Response(res.body, { status: res.status, headers: res.headers });
}
