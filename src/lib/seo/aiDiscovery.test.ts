import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { CITIES, parseLanding } from '@/features/landing/model';
import { ALL_LOCALITIES, localitySlug } from '@/features/localities/data';
import { legacyRedirect } from '@/lib/redirects';
import { aiDiscoveryImportantPages, buildAiDiscoveryArtifacts } from './aiDiscovery';
import { englishPath, resolveRoute } from './routes';

const gen = buildAiDiscoveryArtifacts({ today: '2026-01-01' });

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
    expect(read('llms-full.txt')).toBe(gen.llmsFullTxt);
    const feed = JSON.parse(read('data/llm-feed.json')) as { metadata: { last_updated: string } };
    const generated = buildAiDiscoveryArtifacts({ today: feed.metadata.last_updated });
    expect(feed).toEqual(generated.llmFeed);
    expect(read('.well-known/ai.txt')).toBe(gen.aiTxt);
    expect(read('.well-known/api-catalog')).toBe(`${JSON.stringify(gen.apiCatalog, null, 2)}\n`);
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

  it('does not advertise HRERA or builder-reputation routes', () => {
    const all = [gen.llmsTxt, gen.llmsFullTxt, gen.aiTxt, JSON.stringify(gen.llmFeed)].join('\n');
    expect(aiDiscoveryImportantPages.map((page) => page.url)).not.toEqual(expect.arrayContaining([
      'https://360ghar.com/rera-projects',
      'https://360ghar.com/builder-reputation',
    ]));
    expect(all).not.toContain('https://360ghar.com/rera-projects');
    expect(all).not.toContain('https://360ghar.com/builder-reputation');
  });

  it('does not publish unsupported static price snapshots or verification claims', () => {
    const all = [gen.llmsTxt, gen.llmsFullTxt, JSON.stringify(gen.llmFeed)].join('\n');
    expect(gen.llmFeed).not.toHaveProperty('price_snapshots');
    expect(gen.llmsFullTxt).not.toContain('Approximate property price ranges from 360Ghar verified listings');
    expect(gen.llmsFullTxt).not.toContain('85 lakhs - 3.5 crore');
    expect(all).not.toMatch(/India's first|verified property listings|verified inventory|verification status/i);
  });

  it('does not advertise routes held for source review or noindex', () => {
    const heldPaths = [
      '/bank-auctions',
      '/auction-sources',
      '/zone-checker',
      '/regulatory-updates',
      '/landlord-not-returning-security-deposit',
      '/stamp-duty-calculator',
      '/circle-rates',
      '/gurugram-real-estate-guide',
      '/vs/commonfloor',
      '/vs/nestaway',
      '/truth/nobroker-listings',
      '/truth/magicbricks-spam',
      '/truth/99acres-fake',
      '/truth/nestaway-collapse',
      '/truth/zolo-issues',
    ];
    const pages = aiDiscoveryImportantPages.map((page) => new URL(page.url).pathname);
    const all = [gen.llmsTxt, gen.llmsFullTxt, JSON.stringify(gen.llmFeed)].join('\n');

    expect(pages).not.toEqual(expect.arrayContaining(heldPaths));
    for (const path of heldPaths) expect(all).not.toContain(`https://360ghar.com${path}`);
  });

  it('describes the Jamabandi tool as a record lookup', () => {
    const page = aiDiscoveryImportantPages.find((item) => item.url === 'https://360ghar.com/verify-ownership');

    expect(page?.title).toBe('Haryana Jamabandi Record Lookup');
    expect(gen.llmsFullTxt).toContain('Jamabandi record lookup');
    expect(gen.llmsFullTxt).not.toMatch(/Verify Ownership/);
  });

  it('describes financial and document tools within their stated scope', () => {
    const tools = gen.llmsFullTxt.split('## Data Hub Tools\n')[1]!.split('\n## Comparison Pages')[0]!;

    expect(tools).toContain('calculates a monthly payment from entered principal, rate and tenure; it does not compare lender rates or assess eligibility');
    expect(tools).toContain('converts the factors shown in the tool; local land-unit definitions can vary');
    expect(tools).toContain('a fixed 50% income-share assumption, not lender eligibility or approval');
    expect(tools).toContain('pre-tax arithmetic on sale price, purchase price and transfer expenses; it does not estimate income tax');
    expect(tools).toContain('a non-exhaustive list of prompts; the tool does not review documents or confirm title or legal compliance');
    expect(tools).not.toMatch(/interest rate comparison|complete checklist of documents|long-term and short-term capital gains tax|home loan eligibility based on income and obligations/i);
  });

  it('uses current page titles for estimates, worksheets and record lookup', () => {
    const title = (path: string) =>
      aiDiscoveryImportantPages.find((page) => new URL(page.url).pathname === path)?.title;

    expect(title('/emi-calculator')).toBe('Home Loan EMI Estimate');
    expect(title('/loan-eligibility-calculator')).toBe('Home Loan Estimate');
    expect(title('/capital-gains-tax-calculator')).toBe('Property Sale Gain Worksheet');
    expect(title('/property-document-checklist')).toBe('Property Document Prompts');
    expect(title('/verify-ownership')).toBe('Haryana Jamabandi Record Lookup');
  });

  it('labels the five configured markets as targets, not live coverage', () => {
    const metadata = gen.llmFeed.metadata as Record<string, unknown>;
    expect(metadata).toMatchObject({ target_markets: ['Gurugram', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad'] });
    expect(metadata).not.toHaveProperty('coverage');
  });

  it('does not publish unverified locality rankings or counts', () => {
    const metadata = gen.llmFeed.metadata as Record<string, unknown>;
    expect(gen.llmFeed).not.toHaveProperty('top_localities');
    expect(gen.llmFeed).not.toHaveProperty('top_societies');
    expect(metadata).not.toHaveProperty('total_localities');
    expect(metadata).not.toHaveProperty('total_societies');
    expect(gen.llmsFullTxt).toContain('Selected locality pages');
    expect(gen.llmsFullTxt).not.toContain('Top localities');
  });

  it('uses /hi and /locality/{slug}-{city}', () => {
    expect(gen.llmsTxt).toContain('https://360ghar.com/hi\n');
    expect(gen.llmsTxt).not.toContain('/hi/\n');
    const localityPages = gen.llmFeed.important_pages.filter((page) => page.category === 'locality');
    expect(localityPages).toHaveLength(5);
    for (const page of localityPages) expect(page.url).toMatch(/^https:\/\/360ghar\.com\/locality\/[a-z0-9-]+-[a-z-]+$/);
  });

  it('puts the date in the feed and nothing else depends on the clock', () => {
    expect(gen.llmFeed.metadata.last_updated).toBe('2026-01-01');
    const again = buildAiDiscoveryArtifacts({ today: '2026-01-01' });
    expect(again).toEqual(gen);
  });
});
