import { describe, expect, it } from 'vitest';

import {
  getMarkdownAssetPath,
  markdownPublicRoutes,
  requestAcceptsMarkdown,
  shouldServeMarkdownRoute,
} from './markdownRoutes.js';

describe('markdownRoutes', () => {
  it('tracks only public prerendered routes for markdown negotiation', () => {
    expect(markdownPublicRoutes).toEqual(
      expect.arrayContaining([
        '/',
        '/for-ai',
        '/locality/dlf-phase-1-gurgaon',
        '/gurgaon/buy/flats',
      ])
    );

    expect(markdownPublicRoutes).not.toEqual(
      expect.arrayContaining(['/login', '/register', '/account', '/delete-account'])
    );
  });

  it('maps canonical routes to deterministic internal markdown asset paths', () => {
    expect(getMarkdownAssetPath('/')).toBe('/__markdown/index.md');
    expect(getMarkdownAssetPath('/for-ai')).toBe('/__markdown/for-ai/index.md');
    expect(getMarkdownAssetPath('/vs/nobroker')).toBe('/__markdown/vs/nobroker/index.md');
  });

  it('serves markdown only for supported canonical public routes without query params', () => {
    expect(shouldServeMarkdownRoute({ pathname: '/for-ai', search: '' })).toBe(true);
    expect(shouldServeMarkdownRoute({ pathname: '/login', search: '' })).toBe(false);
    expect(shouldServeMarkdownRoute({ pathname: '/for-ai/', search: '' })).toBe(false);
    expect(shouldServeMarkdownRoute({ pathname: '/properties', search: '?q=2%20bhk' })).toBe(false);
  });

  it('recognizes Accept headers that explicitly negotiate markdown', () => {
    expect(requestAcceptsMarkdown('text/markdown')).toBe(true);
    expect(requestAcceptsMarkdown('text/html, text/markdown;q=0.9')).toBe(true);
    expect(requestAcceptsMarkdown('text/html,application/xhtml+xml')).toBe(false);
    expect(requestAcceptsMarkdown(null)).toBe(false);
  });
});
