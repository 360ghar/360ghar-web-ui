import {
  indexableStaticRoutes,
  seedLandingPrerenderRoutes,
  seedLocalityPrerenderRoutes,
} from './indexationPolicy.js';

export const MARKDOWN_NAMESPACE_PREFIX = '/__markdown/';
export const MARKDOWN_CONTENT_TYPE = 'text/markdown; charset=utf-8';
export const MARKDOWN_INTERNAL_HEADER = 'x-360ghar-markdown-internal';
export const MARKDOWN_INTERNAL_HEADER_VALUE = '1';

export const markdownPublicRoutes = [
  ...new Set([
    ...indexableStaticRoutes,
    ...seedLocalityPrerenderRoutes,
    ...seedLandingPrerenderRoutes,
  ]),
];

const markdownRouteSet = new Set(markdownPublicRoutes);

export function requestAcceptsMarkdown(acceptHeader) {
  if (typeof acceptHeader !== 'string' || acceptHeader.length === 0) {
    return false;
  }

  return acceptHeader
    .toLowerCase()
    .split(',')
    .some((value) => value.trim().startsWith('text/markdown'));
}

export function shouldServeMarkdownRoute({ pathname, search = '' }) {
  if (typeof pathname !== 'string' || pathname.length === 0) {
    return false;
  }

  const normalizedPathname = pathname === '/hi' ? '/' : pathname.replace(/^\/hi\//, '/');
  return search.length === 0 && markdownRouteSet.has(normalizedPathname);
}

export function isInternalMarkdownPath(pathname) {
  return (
    typeof pathname === 'string' &&
    pathname.startsWith(MARKDOWN_NAMESPACE_PREFIX) &&
    !pathname.includes('..')
  );
}

export function getMarkdownAssetPath(route) {
  const normalizedRoute = route === '/hi' ? '/' : route.replace(/^\/hi\//, '/');

  if (normalizedRoute === '/') {
    return '/__markdown/index.md';
  }

  if (typeof normalizedRoute !== 'string' || !normalizedRoute.startsWith('/')) {
    throw new Error(`Expected an absolute route path, received: ${route}`);
  }

  if (normalizedRoute.includes('..')) {
    throw new Error(`Path traversal detected in route: ${route}`);
  }

  return `/__markdown${normalizedRoute.replace(/\/+$/, '')}/index.md`;
}

export function getMarkdownOutputPath(route) {
  return getMarkdownAssetPath(route).replace(/^\//, '');
}
