import { describe, expect, it } from 'vitest';
import { helpText, parseArgs } from './args.mjs';
import { chunk, extractLocs, selectUrls, submitBatches, urlsFromSitemapIndex } from './indexnow.mjs';

const INDEX = '<sitemapindex><sitemap><loc>https://360ghar.com/sitemap-static.xml</loc></sitemap><sitemap><loc>https://360ghar.com/sitemap-blog.xml</loc></sitemap></sitemapindex>';
const STATIC = '<urlset><url><loc>https://360ghar.com/</loc></url><url><loc>https://360ghar.com/hi</loc></url><url><loc>https://360ghar.com/a?x=1&amp;y=2</loc></url></urlset>';
const BLOG = '<urlset><url><loc>https://360ghar.com/blog/one</loc></url><url><loc>https://360ghar.com/</loc></url></urlset>';
const fakeFetch = (routes) => async (url) => (routes[url] ? { ok: true, status: 200, text: async () => routes[url] } : { ok: false, status: 404, statusText: 'Not Found', text: async () => '' });

describe('extractLocs', () => {
  it('decodes entities and skips empty locs', () => {
    expect(extractLocs(STATIC)).toEqual(['https://360ghar.com/', 'https://360ghar.com/hi', 'https://360ghar.com/a?x=1&y=2']);
    expect(extractLocs('<loc> </loc>')).toEqual([]);
  });
});

describe('urlsFromSitemapIndex', () => {
  it('reads the index, then each sitemap, and skips nested .xml entries', async () => {
    const f = fakeFetch({ 'https://360ghar.com/sitemap.xml': INDEX, 'https://360ghar.com/sitemap-static.xml': STATIC, 'https://360ghar.com/sitemap-blog.xml': BLOG });
    const urls = await urlsFromSitemapIndex('https://360ghar.com/', f);
    expect(urls).toHaveLength(5);
    expect(urls).toContain('https://360ghar.com/blog/one');
  });
  it('fails clearly on a bad status', async () => {
    await expect(urlsFromSitemapIndex('https://360ghar.com', fakeFetch({}))).rejects.toThrow(/answered 404/);
  });
});

describe('selectUrls', () => {
  const list = ['https://360ghar.com/a', 'https://360ghar.com/a', 'https://other.com/b', 'not a url', 'https://360ghar.com/blog/x', 'https://360ghar.com/hi/blog/x'];
  it('keeps same-host, valid, unique URLs in order', () => {
    expect(selectUrls(list, { host: '360ghar.com' })).toEqual(['https://360ghar.com/a', 'https://360ghar.com/blog/x', 'https://360ghar.com/hi/blog/x']);
  });
  it('filters by path and limit', () => {
    expect(selectUrls(list, { host: '360ghar.com', include: /^\/blog/ })).toEqual(['https://360ghar.com/blog/x']);
    expect(selectUrls(list, { host: '360ghar.com', limit: 1 })).toEqual(['https://360ghar.com/a']);
  });
});

describe('submitBatches', () => {
  it('POSTs the IndexNow payload per batch and counts failures', async () => {
    const calls = [];
    const f = async (url, init) => {
      calls.push({ url, body: JSON.parse(init.body), method: init.method });
      return calls.length === 2 ? { ok: false, status: 429, statusText: 'Too Many' } : { ok: true, status: 200, statusText: 'OK' };
    };
    const batches = chunk(['u1', 'u2', 'u3'], 1);
    const r = await submitBatches(batches, { host: '360ghar.com', key: 'k', keyLocation: 'https://360ghar.com/k.txt' }, { endpoint: 'https://e/IndexNow', fetchImpl: f, log: () => {} });
    expect(r).toEqual({ ok: 2, failed: 1 });
    expect(calls[0]).toEqual({ url: 'https://e/IndexNow', method: 'POST', body: { host: '360ghar.com', key: 'k', keyLocation: 'https://360ghar.com/k.txt', urlList: ['u1'] } });
  });
});

describe('parseArgs', () => {
  const spec = { go: { type: 'boolean', default: false, help: 'g' }, n: { type: 'number', default: 3, help: 'n' }, name: { type: 'string', help: 's' } };
  it('reads flags, values and =values', () => {
    expect(parseArgs(['--go', '--n', '5', '--name=a=b'], spec)).toMatchObject({ go: true, n: 5, name: 'a=b' });
    expect(parseArgs([], spec)).toMatchObject({ go: false, n: 3 });
  });
  it('rejects unknown flags and missing values', () => {
    expect(() => parseArgs(['--nope'], spec)).toThrow(/Unknown option/);
    expect(() => parseArgs(['--n'], spec)).toThrow(/needs a value/);
    expect(() => parseArgs(['--n', 'x'], spec)).toThrow(/needs a number/);
  });
  it('handles inline booleans, option-like values and blank numbers', () => {
    expect(parseArgs(['--go=false'], spec).go).toBe(false);
    expect(() => parseArgs(['--go=maybe'], spec)).toThrow(/true or false/);
    expect(() => parseArgs(['--name', '--go'], spec)).toThrow(/needs a value/);
    expect(() => parseArgs(['--n='], spec)).toThrow(/needs a number/);
    expect(() => parseArgs(['--n=Infinity'], spec)).toThrow(/needs a number/);
  });
  it('prints help', () => {
    expect(helpText('x', 'does x', spec)).toMatch(/--go\s+g/);
  });
});
