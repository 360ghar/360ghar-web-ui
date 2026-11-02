import { defineMiddleware } from 'astro:middleware';
import { localeFromPath } from '@/lib/i18n/locale';
import { redirectLocation } from '@/lib/redirects';

// Security headers every response carried on Netlify (the /* rule in
// netlify.toml). Workers _headers applies only to static files, so Worker
// (SSR) responses set them here; static files get the same values from
// public/_headers.
const SECURITY_HEADERS: Record<string, string> = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'SAMEORIGIN',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=(self)',
};

// AI-discovery links advertised on the homepage. Netlify set this Link header on
// "/" (netlify.toml); _headers never touches Worker responses, so it is part of
// the SSR response now. The generated files themselves are static in public/.
const HOME_LINK_HEADER =
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json", ' +
  '</for-ai>; rel="service-doc"; type="text/html", ' +
  '</data/llm-feed.json>; rel="service-meta"; type="application/json", ' +
  '</.well-known/mcp/server-card.json>; rel="mcp-server", ' +
  '</.well-known/agent-skills/index.json>; rel="agent-skills", ' +
  '</llms.txt>; rel="llms-txt", ' +
  '</.well-known/openid-configuration>; rel="openid-configuration"';

function withResponseHeaders(response: Response, pathname: string): Response {
  for (const [name, value] of Object.entries(SECURITY_HEADERS)) response.headers.set(name, value);
  if (pathname === '/') response.headers.set('Link', HOME_LINK_HEADER);
  return response;
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname, search } = context.url;
  if (!context.isPrerendered && !pathname.startsWith('/_') && !pathname.startsWith('/api/')) {
    const location = redirectLocation(pathname, search);
    if (location) return withResponseHeaders(context.redirect(location, 301), pathname);
  }
  context.locals.locale = localeFromPath(pathname);
  return withResponseHeaders(await next(), pathname);
});
