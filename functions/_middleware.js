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

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);

  if (isInternalMarkdownPath(url.pathname)) {
    if (request.headers.get(MARKDOWN_INTERNAL_HEADER) !== MARKDOWN_INTERNAL_HEADER_VALUE) {
      return notFoundResponse();
    }
    return env.ASSETS.fetch(request);
  }

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
