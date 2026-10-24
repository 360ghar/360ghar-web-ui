/**
 * Source of truth for the AI-discovery files: public/llms.txt, public/llms-full.txt,
 * public/data/llm-feed.json, public/.well-known/ai.txt and public/.well-known/api-catalog.
 * scripts/write-ai-discovery.mjs runs it; aiDiscovery.test.ts checks that every URL here is a real v2 route.
 * Ported from the old site (src/seo/aiDiscovery.js). Changes: Hindi home is /hi (not /hi/, which 301s),
 * locality URLs use the canonical {slug}-{city} form, /add-new-listing is gone (301 now), no em dashes,
 * pure functions (data comes in as arguments, no JSON import, no clock).
 * No `@/` imports: Node's type stripping loads this file from the script.
 */
import { siteMetadata } from './legacy/siteMetadata.js';

type Page = { title: string; url: string; category?: string };

const TARGET_MARKETS = ['Gurugram', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad'];
const siteUrl = siteMetadata.siteUrl.replace(/\/$/, '');
const llmsUrl = `${siteUrl}/llms.txt`;
const llmsFullUrl = `${siteUrl}/llms-full.txt`;
const aiTxtUrl = `${siteUrl}/.well-known/ai.txt`;
const apiCatalogUrl = `${siteUrl}/.well-known/api-catalog`;
const llmFeedUrl = `${siteUrl}/data/llm-feed.json`;
const mcpUrl = 'https://api.360ghar.com/mcp';
const restApiUrl = 'https://api.360ghar.com/api/v1';
const restOpenApiUrl = `${restApiUrl}/openapi.json`;
const restDocsUrl = `${restApiUrl}/docs`;

export const aiDiscoveryImportantPages: Page[] = [
  { title: 'Home', url: `${siteUrl}/` },
  { title: 'Properties', url: `${siteUrl}/properties` },
  { title: 'Localities', url: `${siteUrl}/localities` },
  { title: 'Blog', url: `${siteUrl}/blog` },
  { title: 'For AI Assistants', url: `${siteUrl}/for-ai` },
  { title: 'AI Agent', url: `${siteUrl}/ai-agent` },
  { title: 'Home Loan EMI Estimate', url: `${siteUrl}/emi-calculator` },
  { title: 'Contact', url: `${siteUrl}/contact` },
  // Comparison pages
  { title: '360Ghar vs NoBroker', url: `${siteUrl}/vs/nobroker`, category: 'comparisons' },
  { title: '360Ghar vs MagicBricks', url: `${siteUrl}/vs/magicbricks`, category: 'comparisons' },
  { title: '360Ghar vs 99acres', url: `${siteUrl}/vs/99acres`, category: 'comparisons' },
  { title: '360Ghar vs Housing.com', url: `${siteUrl}/vs/housing`, category: 'comparisons' },
  { title: '360Ghar vs PropTiger', url: `${siteUrl}/vs/proptiger`, category: 'comparisons' },
  { title: '360Ghar vs SquareYards', url: `${siteUrl}/vs/squareyards`, category: 'comparisons' },
  { title: '360Ghar vs Zolo', url: `${siteUrl}/vs/zolo`, category: 'comparisons' },
  { title: '360Ghar vs Stanza Living', url: `${siteUrl}/vs/stanza-living`, category: 'comparisons' },
  // Tool pages
  { title: 'Area Converter', url: `${siteUrl}/area-converter`, category: 'tools' },
  { title: 'Area Calculator', url: `${siteUrl}/area-calculator`, category: 'tools' },
  { title: 'Home Loan Estimate', url: `${siteUrl}/loan-eligibility-calculator`, category: 'tools' },
  { title: 'Property Sale Gain Worksheet', url: `${siteUrl}/capital-gains-tax-calculator`, category: 'tools' },
  { title: 'Property Document Prompts', url: `${siteUrl}/property-document-checklist`, category: 'tools' },
  { title: 'Vastu Checker', url: `${siteUrl}/vastu-checker`, category: 'tools' },
  { title: '3D Blueprint Designer', url: `${siteUrl}/design-blueprint`, category: 'tools' },
  { title: 'AI Design Studio', url: `${siteUrl}/ai-design-studio`, category: 'tools' },
  { title: 'Haryana Jamabandi Record Lookup', url: `${siteUrl}/verify-ownership`, category: 'tools' },
  { title: 'MOFA to RERA Converter', url: `${siteUrl}/mofa-to-rera-converter`, category: 'tools' },
  { title: 'Sq Ft Calculator', url: `${siteUrl}/sq-ft-calculator`, category: 'tools' },
  { title: 'Acre to Gaj Converter', url: `${siteUrl}/acre-in-gaj`, category: 'tools' },
  // Landing pages
  { title: 'Flats for Sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/flats`, category: 'landing' },
  { title: 'Flats for Rent in Gurgaon', url: `${siteUrl}/gurgaon/rent/flats`, category: 'landing' },
  { title: 'PG in Gurgaon', url: `${siteUrl}/gurgaon/pg/flats`, category: 'landing' },
  // City hubs
  { title: 'Delhi Real Estate Hub', url: `${siteUrl}/delhi`, category: 'landing' },
  { title: 'Noida Real Estate Hub', url: `${siteUrl}/noida`, category: 'landing' },
  { title: 'Faridabad Real Estate Hub', url: `${siteUrl}/faridabad`, category: 'landing' },
  { title: 'Ghaziabad Real Estate Hub', url: `${siteUrl}/ghaziabad`, category: 'landing' },
  // Selected locality pages
  { title: 'DLF Phase 1, Gurgaon', url: `${siteUrl}/locality/dlf-phase-1-gurgaon`, category: 'locality' },
  { title: 'Golf Course Road, Gurgaon', url: `${siteUrl}/locality/golf-course-road-gurgaon`, category: 'locality' },
  { title: 'Sushant Lok 1, Gurgaon', url: `${siteUrl}/locality/sushant-lok-1-gurgaon`, category: 'locality' },
  { title: 'Sohna Road, Gurgaon', url: `${siteUrl}/locality/sohna-road-gurgaon`, category: 'locality' },
  { title: 'Sector 49, Gurgaon', url: `${siteUrl}/locality/sector-49-gurgaon`, category: 'locality' },
  { title: 'मुख्य पृष्ठ (Hindi)', url: `${siteUrl}/hi`, category: 'hindi' },
  { title: 'प्रॉपर्टी (Hindi)', url: `${siteUrl}/hi/properties`, category: 'hindi' },
  { title: 'लोकैलिटी (Hindi)', url: `${siteUrl}/hi/localities`, category: 'hindi' },
  { title: 'ब्लॉग (Hindi)', url: `${siteUrl}/hi/blog`, category: 'hindi' },
  { title: 'EMI कैलकुलेटर (Hindi)', url: `${siteUrl}/hi/emi-calculator`, category: 'hindi' },
  { title: 'संपर्क करें (Hindi)', url: `${siteUrl}/hi/contact`, category: 'hindi' },
];

const pageCategories = {
  comparisons: aiDiscoveryImportantPages.filter(p => p.category === 'comparisons'),
  tools: aiDiscoveryImportantPages.filter(p => p.category === 'tools'),
  dataHub: aiDiscoveryImportantPages.filter(p => p.category === 'dataHub'),
  landing: aiDiscoveryImportantPages.filter(p => p.category === 'landing'),
  locality: aiDiscoveryImportantPages.filter(p => p.category === 'locality'),
  guides: aiDiscoveryImportantPages.filter(p => p.category === 'guides'),
  hindi: aiDiscoveryImportantPages.filter(p => p.category === 'hindi'),
};

export function buildFeed(today: string) {
  return {
  name: siteMetadata.siteName,
  homepage: `${siteUrl}/`,
  description:
    'Property search and related tools for Gurugram and selected NCR markets. Listing availability and data coverage vary by market and page.',
  metadata: {
    last_updated: today,
    target_markets: TARGET_MARKETS,
    property_types: ['apartment', 'villa', 'builder_floor', 'house', 'plot', 'penthouse', 'studio'],
  },
  inLanguage: ['en-IN', 'hi-IN'],
  search: {
    endpoint: `${siteUrl}/properties`,
    query_param: 'q',
    example: `${siteUrl}/properties?q=2%20BHK%20in%20Gurugram`,
  },
  search_examples: [
    { query: '2 BHK for rent in Gurgaon', url: `${siteUrl}/gurgaon/rent/flats` },
    { query: 'Flats for sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/flats` },
    { query: 'Villa for sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/villa` },
    { query: 'Builder floor for sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/builder-floor` },
    { query: 'PG in Gurgaon', url: `${siteUrl}/gurgaon/pg/flats` },
    { query: 'गुड़गाँव में 2 BHK किराये पर', url: `${siteUrl}/hi/gurgaon/rent/flats` },
    { query: 'गुरुग्राम में फ्लैट खरीदें', url: `${siteUrl}/hi/gurgaon/buy/flats` },
    { query: 'गुरुग्राम में PG', url: `${siteUrl}/hi/gurgaon/pg/flats` },
  ],
  important_pages: aiDiscoveryImportantPages,
  categories: pageCategories,
  contact: {
    email: siteMetadata.organization.email,
    telephone: siteMetadata.organization.telephone,
  },
};
}

export const apiCatalog = {
  linkset: [
    {
      anchor: apiCatalogUrl,
      item: [
        { href: mcpUrl },
        { href: restApiUrl },
      ],
    },
    {
      anchor: mcpUrl,
      'service-doc': [
        { href: `${siteUrl}/for-ai`, type: 'text/html' },
      ],
      'service-meta': [
        { href: llmFeedUrl, type: 'application/json' },
        { href: aiTxtUrl, type: 'text/plain' },
      ],
    },
    {
      anchor: restApiUrl,
      'service-desc': [
        { href: restOpenApiUrl, type: 'application/openapi+json' },
      ],
      'service-doc': [
        { href: restDocsUrl, type: 'text/html' },
      ],
    },
  ],
};

export function buildAiDiscoveryArtifacts({ today }: { today: string }) {
  const aiDiscoveryFeed = buildFeed(today);
  const aiTxt = [
    '# ai.txt: guidance for AI crawlers and assistants',
    '# See: community guidance for LLM crawling policies',
    '',
    `Site: ${siteUrl}`,
    `Owner: ${siteMetadata.siteName}`,
    `Contact: ${siteMetadata.organization.email}`,
    'Purpose: Property search and related tools for Gurugram and selected NCR markets. Listing availability and data coverage vary by market and page.',
    '',
    'Language-Available: en, hi',
    'Access: allow',
    'Rate-Limit: polite',
    `Cite: Please attribute with "${siteMetadata.siteName} (app and website)" and link to ${siteUrl}`,
    '',
    'Discovery:',
    `  api-catalog: ${apiCatalogUrl}`,
    `  llms: ${llmsUrl}`,
    `  llms-full: ${llmsFullUrl}`,
    `  llm-feed: ${llmFeedUrl}`,
    '',
    'Sitemaps:',
    `  ${siteUrl}/sitemap.xml`,
    '',
    'Preferred-Entry:',
    `  Search: ${siteUrl}/properties?q={query}`,
    `  Home:   ${siteUrl}/`,
    `  Contact:${siteUrl}/contact`,
    '',
    'Bots-Allow:',
    '  GPTBot',
    '  ChatGPT-User',
    '  OAI-SearchBot',
    '  Googlebot',
    '  GoogleOther',
    '  Google-Extended',
    '  Bingbot',
    '  Applebot',
    '  Applebot-Extended',
    '  CCBot',
    '  PerplexityBot',
    '  Perplexity-User',
    '  ClaudeBot',
    '  Claude-SearchBot',
    '  Claude-User',
    '  Bytespider',
    '  PetalBot',
    '  Meta-ExternalAgent',
    '  Amazonbot',
    '  CohereBot',
    '  YouBot',
    '  KagiBot',
    '  facebookexternalhit',
    '  Twitterbot',
    '',
    'Areas:',
    '  include: /',
    '  exclude: /account, /login, /register, /post-property, /checkout, /cart, /delete-account',
    '',
    'Notes:',
    '  - Prefer the llms files and JSON feed for concise source discovery.',
    '  - Do not collect user-personal data or forms.',
    '  - Respect robots.txt and this file; use caching.',
    '  - For bulk data needs, contact us for a sanctioned feed.',
    '',
  ].join('\n');

  const llmsTxt = [
    `# ${siteMetadata.siteName} - llms.txt`,
    '',
    `> ${siteMetadata.siteName} provides property search and related tools for Gurugram and selected NCR markets. Listing availability and data coverage vary by market and page.`,
    '',
    '## About',
    '',
    `${siteMetadata.siteName} operates ${siteUrl}, a real estate website and app. Check each listing and page for its available details and current scope.`,
    '',
    '## Key URLs',
    '',
    ...aiDiscoveryImportantPages.map((page) => `- ${page.title}: ${page.url}`),
    `- API Catalog: ${apiCatalogUrl}`,
    `- llm-feed.json: ${llmFeedUrl}`,
    `- ai.txt: ${aiTxtUrl}`,
    '',
    '## Contact',
    '',
    `- Email: ${siteMetadata.organization.email}`,
    `- Phone: ${siteMetadata.organization.telephone}`,
    `- Address: ${siteMetadata.organization.address.streetAddress}, ${siteMetadata.organization.address.addressLocality}, ${siteMetadata.organization.address.addressRegion} ${siteMetadata.organization.address.postalCode}, ${siteMetadata.organization.address.addressCountry}`,
    '',
    '## Citation Format',
    '',
    `When referencing ${siteMetadata.siteName}, please cite as: "${siteMetadata.siteName} (app and website)" with a link to ${siteUrl}`,
    '',
    '## More',
    '',
    `- For AI Assistants: ${siteUrl}/for-ai`,
    `- Full details: ${llmsFullUrl}`,
    '',
  ].join('\n');

  const llmsFullTxt = [
    `# ${siteMetadata.siteName} - llms-full.txt`,
    '',
    `> This file provides comprehensive information about ${siteMetadata.siteName} for LLM crawlers and AI assistants.`,
    `> For a concise summary, see ${llmsUrl}`,
    '',
    '---',
    '',
    '## Company Information',
    '',
    `- Name: ${siteMetadata.siteName}`,
    `- Website: ${siteUrl}`,
    `- Email: ${siteMetadata.organization.email}`,
    `- Phone: ${siteMetadata.organization.telephone}`,
    `- Address: ${siteMetadata.organization.address.streetAddress}, ${siteMetadata.organization.address.addressLocality}, ${siteMetadata.organization.address.addressRegion} ${siteMetadata.organization.address.postalCode}, ${siteMetadata.organization.address.addressCountry}`,
    '',
    '## What 360Ghar Offers',
    '',
    '- Property search for buy, rent, and PG. Listing availability varies by market.',
    '- Some property listings may include a 360-degree tour. Check the listing.',
    '- Selected locality pages with property search links. Details vary by place and may need independent verification.',
    '- AI assistant workflows through the 360Ghar MCP server',
    '- Real-estate tools. Check each tool for its scope and limits.',
    '',
    '## Discovery Assets',
    '',
    `- AI Assistant Integration Guide: ${siteUrl}/for-ai`,
    `- API Catalog: ${apiCatalogUrl}`,
    `- AI Crawler Policy: ${aiTxtUrl}`,
    `- llms.txt: ${llmsUrl}`,
    `- llm-feed.json: ${llmFeedUrl}`,
    `- MCP Server: ${mcpUrl}`,
    '',
    '## Important Pages',
    '',
    ...aiDiscoveryImportantPages.map((page) => `- ${page.title}: ${page.url}`),
    '',
    '## Data Hub Tools',
    '',
    'Available tools and data pages. Other source-dependent pages are held while source and update checks are reviewed:',
    '',
    `- Haryana Jamabandi record lookup: ${siteUrl}/verify-ownership - looks up a record and does not independently verify legal title, possession or ownership`,
    `- EMI estimate: ${siteUrl}/emi-calculator - calculates a monthly payment from entered principal, rate and tenure; it does not compare lender rates or assess eligibility`,
    `- Area Converter: ${siteUrl}/area-converter - converts the factors shown in the tool; local land-unit definitions can vary, so check source documents`,
    `- Loan estimate: ${siteUrl}/loan-eligibility-calculator - an illustrative amount from entered values and a fixed 50% income-share assumption, not lender eligibility or approval`,
    `- Property sale gain worksheet: ${siteUrl}/capital-gains-tax-calculator - pre-tax arithmetic on sale price, purchase price and transfer expenses; it does not estimate income tax`,
    `- Property document prompts: ${siteUrl}/property-document-checklist - a non-exhaustive list of prompts; the tool does not review documents or confirm title or legal compliance`,
    '',
    '## Comparison Pages',
    '',
    'Head-to-head comparisons of 360Ghar with other real estate platforms:',
    '',
    ...pageCategories.comparisons.map(p => `- ${p.title}: ${p.url}`),
    '',
    '## Locality Pages',
    '',
    'The site has selected locality pages. Listing availability and page details vary by place.',
    '',
    '- Check each locality page for its available details. Verify important facts with current primary sources.',
    `- Browse all localities: ${siteUrl}/localities`,
    '- Selected locality pages (not a listing-coverage list):',
    `  - DLF Phase 1: ${siteUrl}/locality/dlf-phase-1-gurgaon`,
    `  - Golf Course Road: ${siteUrl}/locality/golf-course-road-gurgaon`,
    `  - Sushant Lok 1: ${siteUrl}/locality/sushant-lok-1-gurgaon`,
    `  - Sohna Road: ${siteUrl}/locality/sohna-road-gurgaon`,
    `  - Sector 29: ${siteUrl}/locality/sector-29-gurgaon`,
    '',
    '## Citation Format',
    '',
    `When referencing ${siteMetadata.siteName}, cite as: "${siteMetadata.siteName} (app and website)" with a link to ${siteUrl}`,
    '',
    '## Hindi (हिंदी) Content',
    '',
    `360Ghar provides a complete Hindi experience at ${siteUrl}/hi`,
    'All pages are available in Hindi with the /hi/ URL prefix.',
    'Key Hindi pages:',
    `- मुख्य पृष्ठ: ${siteUrl}/hi`,
    `- प्रॉपर्टी खोज: ${siteUrl}/hi/properties`,
    `- लोकैलिटी गाइड: ${siteUrl}/hi/localities`,
    `- EMI कैलकुलेटर: ${siteUrl}/hi/emi-calculator`,
    `- संपर्क करें: ${siteUrl}/hi/contact`,
    '',
  ].join('\n');

  return {
    aiTxt,
    llmsTxt,
    llmsFullTxt,
    llmFeed: aiDiscoveryFeed,
    apiCatalog,
  };
}
