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

  return search.length === 0 && markdownRouteSet.has(pathname);
}

export function isInternalMarkdownPath(pathname) {
  return (
    typeof pathname === 'string' &&
    pathname.startsWith(MARKDOWN_NAMESPACE_PREFIX) &&
    !pathname.includes('..')
  );
}

export function getMarkdownAssetPath(route) {
  if (route === '/') {
    return '/__markdown/index.md';
  }

  if (typeof route !== 'string' || !route.startsWith('/')) {
    throw new Error(`Expected an absolute route path, received: ${route}`);
  }

  if (route.includes('..')) {
    throw new Error(`Path traversal detected in route: ${route}`);
  }

  return `/__markdown${route.replace(/\/+$/, '')}/index.md`;
}

export function getMarkdownOutputPath(route) {
  return getMarkdownAssetPath(route).replace(/^\//, '');
}
