import {
  getMarkdownAssetPath,
  isInternalMarkdownPath,
  MARKDOWN_CONTENT_TYPE,
  MARKDOWN_INTERNAL_HEADER,
  MARKDOWN_INTERNAL_HEADER_VALUE,
  requestAcceptsMarkdown,
  shouldServeMarkdownRoute,
} from '../src/seo/markdownRoutes.js';

function appendVary(headers, value) {
  const current = headers.get('Vary');
  if (!current) {
    headers.set('Vary', value);
    return;
  }

  const values = current
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);

  if (!values.some((entry) => entry.toLowerCase() === value.toLowerCase())) {
    values.push(value);
  }

  headers.set('Vary', values.join(', '));
}

function notFoundResponse() {
  return new Response('Not found', {
    status: 404,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Robots-Tag': 'noindex, nofollow',
    },
  });
}

const LOCALE_COOKIE = '__locale';
const LOCALE_REDIRECTED = 'redirected';

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  // Well-known paths and markdown-internal paths skip all processing
  if (url.pathname.startsWith('/.well-known')) {
    return context.next();
  }

  if (isInternalMarkdownPath(url.pathname)) {
    if (request.headers.get(MARKDOWN_INTERNAL_HEADER) !== MARKDOWN_INTERNAL_HEADER_VALUE) {
      return notFoundResponse();
    }
    return env.ASSETS.fetch(request);
  }

  // Locale redirect: Hindi-speaking first-time visitors on non-Hindi paths
  if (!url.pathname.startsWith('/hi')) {
    const cookie = request.headers.get('Cookie') || '';
    const hasLocaleCookie = cookie.includes(`${LOCALE_COOKIE}=`);
    if (!hasLocaleCookie) {
      const acceptLang = request.headers.get('Accept-Language') || '';
      // Only redirect when Hindi is the primary (first) language tag
      const firstTag = acceptLang.split(',')[0].split(';')[0].trim();
      if (/^hi(?:[-_]|$)/i.test(firstTag)) {
        const hindiPath = url.pathname === '/' ? '/hi' : `/hi${url.pathname}`;
        return new Response(null, {
          status: 302,
          headers: {
            Location: hindiPath + (url.search || ''),
            'Set-Cookie': `${LOCALE_COOKIE}=${LOCALE_REDIRECTED}; Path=/; Max-Age=31536000; SameSite=Lax`,
          },
        });
      }
    }
  }

  // Markdown serving for AI crawlers (works for both en and /hi/ routes)
  if (!requestAcceptsMarkdown(request.headers.get('Accept'))) {
    return context.next();
  }

  if (!shouldServeMarkdownRoute({ pathname: url.pathname, search: url.search })) {
    return context.next();
  }

  const assetUrl = new URL(getMarkdownAssetPath(url.pathname), url.origin);
  const assetRequest = new Request(assetUrl.toString(), {
    headers: {
      [MARKDOWN_INTERNAL_HEADER]: MARKDOWN_INTERNAL_HEADER_VALUE,
    },
  });
  const assetResponse = await env.ASSETS.fetch(assetRequest);

  if (!assetResponse.ok) {
    return context.next();
  }

  const headers = new Headers(assetResponse.headers);
  headers.set('Content-Type', MARKDOWN_CONTENT_TYPE);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  appendVary(headers, 'Accept');

  if (!headers.has('Cache-Control')) {
    headers.set('Cache-Control', 'public, max-age=0, must-revalidate');
  }

  return new Response(assetResponse.body, {
    status: assetResponse.status,
    statusText: assetResponse.statusText,
    headers,
  });
}
