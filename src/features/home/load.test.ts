import { describe, expect, it, vi } from 'vitest';
import { COPY } from './copy';
import { loadHome, totalOf } from './load';

describe('totalOf', () => {
  it('reads the total of a list call', () => {
    expect(totalOf({ data: { total: 183 } })).toBe(183);
  });

  it('gives null when the call failed or the total is not a usable number', () => {
    expect(totalOf({ data: null })).toBeNull();
    expect(totalOf({})).toBeNull();
    expect(totalOf({ data: { total: null } })).toBeNull();
    expect(totalOf({ data: { total: 0 } })).toBeNull();
  });
});

describe('home Data Hub counts', () => {
  const toolLinks = (toolsets: readonly { tools: readonly { href: string }[] }[]) =>
    toolsets.flatMap((set) => set.tools);

  it('does not fetch or expose counts for held Data Hub pages', async () => {
    const requestedPaths: string[] = [];
    const fetch = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      requestedPaths.push(new URL(input instanceof Request ? input.url : String(input)).pathname);
      return new Response(JSON.stringify({ items: [], total: 3 }), {
        headers: { 'content-type': 'application/json' },
      });
    });

    try {
      const home = await loadHome('en');

      expect(requestedPaths).not.toContain('/api/v1/data-hub/rera-projects');
      expect(requestedPaths).not.toContain('/api/v1/data-hub/circle-rates');
      expect(requestedPaths).not.toContain('/api/v1/data-hub/auctions');
      expect(home.stats).toEqual({ circle: null, rera: null, auctions: null });
      expect(home).not.toHaveProperty('localityTotal');
    } finally {
      fetch.mockRestore();
    }
  });

  it('does not attach stale counts to held checks in English or Hindi', () => {
    for (const tools of [toolLinks(COPY.en.toolsets), toolLinks(COPY.hi.toolsets)]) {
      for (const href of ['/circle-rates', '/rera-projects', '/bank-auctions']) {
        const tool = tools.find((item) => item.href === href);
        expect(tool).toBeDefined();
        expect(tool).not.toHaveProperty('stat');
      }
    }
  });
});
