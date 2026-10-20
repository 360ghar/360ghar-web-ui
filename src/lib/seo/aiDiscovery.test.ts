import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import priceContext from '@/data/priceContext.json';
import localitiesIndex from '@/data/localities-index.json';
import landmarks from '@/data/locality-landmarks.json';
import { CITIES, parseLanding } from '@/features/landing/model';
import { ALL_LOCALITIES, isGeneratedSeed as originalSeed, isScrapedName as originalScraped, isThinLocality as originalThin, localitySlug } from '@/features/localities/data';
import { legacyRedirect } from '@/lib/redirects';
import { buildAiDiscoveryArtifacts, isGeneratedSeed, isScrapedName, isThinLocalityName, rankLocalities, type LandmarkEntry, type LocalityIndexEntry, type PriceContext } from './aiDiscovery';
import { englishPath, resolveRoute } from './routes';

const INDEX = localitiesIndex as LocalityIndexEntry[];
const LANDMARKS = landmarks as LandmarkEntry[];
const gen = buildAiDiscoveryArtifacts({ priceContext: priceContext as PriceContext, localitiesIndex: INDEX, landmarks: LANDMARKS, today: '2026-01-01' });

const HOST = '360ghar.com';
/** Hosts the files may link to besides this site: the API and MCP server, the agent-skills schema, and the Supabase auth server named in the OAuth discovery files. */
const EXTERNAL_HOSTS = new Set(['api.360ghar.com', 'schemas.agentskills.io']);
const externalOk = (host: string) => EXTERNAL_HOSTS.has(host) || host.endsWith('.supabase.co');

const walk = (dir: string): string[] => readdirSync(dir).flatMap((n) => (statSync(join(dir, n)).isDirectory() ? walk(join(dir, n)) : [join(dir, n)]));
const read = (rel: string) => readFileSync(join('public', rel), 'utf8');

/** Every file that lists site URLs: the five generated files (as committed) and the other .well-known files. */
const FILES = ['llms.txt', 'llms-full.txt', 'data/llm-feed.json', '.well-known/ai.txt', '.well-known/api-catalog'];
const wellKnown = walk('public/.well-known').map((f) => f.replace(/^public\//, ''));

const urlsIn = (text: string) => [...new Set([...text.matchAll(/https?:\/\/[^\s"'<>)`\\]+/g)].map((m) => m[0].replace(/[.,;]+$/, '')))];

const localitySlugs = new Set(ALL_LOCALITIES.map(localitySlug));

/** Empty string when the URL is fine, else the reason it is not. */
function problem(url: string): string {
  const u = new URL(url);
  if (u.hostname !== HOST) return externalOk(u.hostname) ? '' : `host ${u.hostname} is not allowed`;
  const path = u.pathname;
  if (path.length > 1 && path.endsWith('/')) return 'trailing slash (301)';
  // Files in public/ (llms.txt, /.well-known/*) are served as they are, before any redirect rule.
  if (path !== '/' && existsSync(join('public', path)) && statSync(join('public', path)).isFile()) return '';
  const redirect = legacyRedirect(path);
  if (redirect) return `redirects (301) to ${redirect}`;
  const route = resolveRoute(path);
  if (!route) return 'no route in src/pages';
  const parts = englishPath(path).split('/').filter(Boolean);
  if (route.file.startsWith('[city]') && !CITIES[parts[0]!]) return 'unknown city';
  if (parts[0] === 'locality' && parts.length === 2 && !localitySlugs.has(parts[1]!)) return 'unknown locality slug';
  if (route.file.startsWith('[city]/') && !parseLanding(parts[0]!, parts[1]!, parts[2] ?? '')) return 'not a landing page';
  return '';
}

describe('AI-discovery files list only real routes', () => {
  for (const rel of [...FILES, ...wellKnown.filter((f) => !FILES.includes(f))]) {
    it(`public/${rel}`, () => {
      const bad = urlsIn(read(rel))
        .filter((u) => !u.includes('{'))
        .map((u) => [u, problem(u)] as const)
        .filter(([, why]) => why);
      expect(bad).toEqual([]);
    });
  }

  it('the generated output passes the same check', () => {
    const text = [gen.llmsTxt, gen.llmsFullTxt, gen.aiTxt, JSON.stringify(gen.llmFeed), JSON.stringify(gen.apiCatalog)].join('\n');
    const bad = urlsIn(text)
      .filter((u) => !u.includes('{'))
      .map((u) => [u, problem(u)] as const)
      .filter(([, why]) => why);
    expect(bad).toEqual([]);
  });

  it('the checker rejects a removed route, a 301 and an unknown locality', () => {
    expect(problem('https://360ghar.com/property-sidebar')).toMatch(/301/);
    expect(problem('https://360ghar.com/hi/')).toMatch(/trailing slash/);
    expect(problem('https://360ghar.com/locality/not-a-place-gurgaon')).toBe('unknown locality slug');
    expect(problem('https://360ghar.com/atlantis/buy/flats')).toBe('unknown city');
    expect(problem('https://example.com/x')).toMatch(/not allowed/);
    expect(problem('https://360ghar.com/emi-calculator')).toBe('');
  });
});

describe('the committed files are the generator output', () => {
  it('llms.txt, ai.txt and api-catalog match. If this fails, run: pnpm ai:discovery --write', () => {
    expect(read('llms.txt')).toBe(gen.llmsTxt);
    expect(read('.well-known/ai.txt')).toBe(gen.aiTxt);
    expect(read('.well-known/api-catalog')).toBe(`${JSON.stringify(gen.apiCatalog, null, 2)}\n`);
  });

  it('the feed top_localities list is the ranked list (so a data change shows up here)', () => {
    const feed = JSON.parse(read('data/llm-feed.json')) as { top_localities: unknown[] };
    expect(feed.top_localities).toEqual(gen.llmFeed.top_localities);
  });

  it('the feed and llms-full.txt carry the same important pages', () => {
    const feed = JSON.parse(read('data/llm-feed.json')) as { important_pages: { url: string }[] };
    expect(feed.important_pages.map((p) => p.url)).toEqual(gen.llmFeed.important_pages.map((p) => p.url));
    for (const p of gen.llmFeed.important_pages) expect(read('llms-full.txt')).toContain(p.url);
  });
});

describe('generator output', () => {
  it('has no em dash and no removed route', () => {
    const all = [gen.llmsTxt, gen.llmsFullTxt, gen.aiTxt, JSON.stringify(gen.llmFeed)].join('\n');
    expect(all).not.toContain('—');
    expect(all).not.toContain('add-new-listing');
    expect(all).not.toContain('property-sidebar');
  });

  it('uses /hi and /locality/{slug}-{city}', () => {
    expect(gen.llmsTxt).toContain('https://360ghar.com/hi\n');
    expect(gen.llmsTxt).not.toContain('/hi/\n');
    const top = gen.llmFeed.top_localities as { url: string; slug: string }[];
    expect(top).toHaveLength(50);
    for (const l of top) expect(l.url).toMatch(/^https:\/\/360ghar\.com\/locality\/[a-z0-9-]+-[a-z-]+$/);
  });

  it('puts the date in the feed and nothing else depends on the clock', () => {
    expect(gen.llmFeed.metadata.last_updated).toBe('2026-01-01');
    const again = buildAiDiscoveryArtifacts({ priceContext: priceContext as PriceContext, localitiesIndex: INDEX, landmarks: LANDMARKS, today: '2026-01-01' });
    expect(again).toEqual(gen);
  });
});

describe('top_localities ranking', () => {
  const top = gen.llmFeed.top_localities as { name: string; slug: string; city: string; entityType: string; url: string }[];
  const row = (name: string, entityType: string, city = 'Gurgaon'): LocalityIndexEntry => ({ name, slug: name.toLowerCase().replace(/\s+/g, '-'), city, entityType });

  it('the copies of isScrapedName and isGeneratedSeed agree with the originals on every row', () => {
    for (const l of ALL_LOCALITIES) {
      expect(isScrapedName(l.name), l.name).toBe(originalScraped(l));
      expect(isGeneratedSeed(l.name), l.name).toBe(originalSeed(l));
    }
  });

  it('the copy of isThinLocality (scraped or seed-invented) agrees with the original on every row', () => {
    for (const l of ALL_LOCALITIES) expect(isThinLocalityName(l.name), l.name).toBe(originalThin(l));
    expect(ALL_LOCALITIES.filter((l) => isThinLocalityName(l.name))).toHaveLength(1172);
  });

  it('the feed counts and lists only listed places: 2,043 localities, no thin society', () => {
    const meta = gen.llmFeed.metadata as unknown as { total_localities: number; total_societies: number };
    expect(meta.total_localities).toBe(2043);
    expect(meta.total_societies).toBe(INDEX.filter((l) => l.entityType === 'society' && !isThinLocalityName(l.name)).length);
    const societies = gen.llmFeed.top_societies as { name: string }[];
    expect(societies).toHaveLength(20);
    for (const l of societies) expect(originalThin(l), l.name).toBe(false);
  });

  it('lists 50 real places: no project or society, no scraped or made-up name, nothing that starts with a digit', () => {
    expect(top).toHaveLength(50);
    for (const l of top) {
      expect(['road', 'phase', 'township', 'locality', 'sector', 'village'], l.name).toContain(l.entityType);
      expect(l.name, l.name).toMatch(/^[A-Za-z]/);
      expect(originalScraped(l) || originalSeed(l), l.name).toBe(false);
      expect(l.city, l.name).toMatch(/^[A-Z]/);
    }
    expect(top.map((l) => l.name)).not.toContain('1000 trees sai kripa floors 10');
  });

  it('puts the places with curated landmark data first, then roads, then phases', () => {
    const curated = new Set(LANDMARKS.map((l) => l.slug));
    const firstUncurated = top.findIndex((l) => !curated.has(l.slug) && !curated.has(`${l.slug}-${l.city.toLowerCase()}`));
    expect(top.slice(0, 3).map((l) => l.name)).toEqual(['Golf Course Road', 'Sohna Road', 'DLF Phase 1']);
    expect(firstUncurated).toBeGreaterThan(20);
    expect(top.slice(firstUncurated).every((l) => !curated.has(l.slug))).toBe(true);
  });

  it('ranks by landmarks, then type, then city order, then name (fixture)', () => {
    const rows = [row('Zeta Village', 'village'), row('Beta Nagar', 'locality', 'delhi'), row('Alpha Nagar', 'locality'), row('Alpha Road', 'road', 'noida'), row('Curated Colony', 'locality', 'noida'), row('Bad Project', 'project'), row('37B', 'locality'), row('projects in beta', 'locality'), row('Block A Sector 41', 'sector')];
    const out = rankLocalities(rows, { landmarks: [{ slug: 'curated-colony', city: 'noida' }], cityOrder: ['gurgaon', 'delhi', 'noida'] });
    expect(out.map((l) => l.name)).toEqual(['Curated Colony', 'Alpha Road', 'Alpha Nagar', 'Beta Nagar', 'Zeta Village']);
  });

  it('limits the list', () => {
    expect(rankLocalities(INDEX, { landmarks: LANDMARKS }, 5)).toHaveLength(5);
  });
});
