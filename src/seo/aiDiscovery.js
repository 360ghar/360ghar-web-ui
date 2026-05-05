import { siteMetadata } from './siteMetadata.js';
import priceContext from '../data/priceContext.json' with { type: 'json' };

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

export const aiDiscoveryImportantPages = [
  { title: 'Home', url: `${siteUrl}/` },
  { title: 'Properties', url: `${siteUrl}/properties` },
  { title: 'Localities', url: `${siteUrl}/localities` },
  { title: 'Blog', url: `${siteUrl}/blog` },
  { title: 'For AI Assistants', url: `${siteUrl}/for-ai` },
  { title: 'AI Agent', url: `${siteUrl}/ai-agent` },
  { title: 'Gurugram Real Estate Guide', url: `${siteUrl}/gurugram-real-estate-guide` },
  { title: 'EMI Calculator', url: `${siteUrl}/emi-calculator` },
  { title: 'Stamp Duty Calculator', url: `${siteUrl}/stamp-duty-calculator` },
  { title: 'Circle Rates', url: `${siteUrl}/circle-rates` },
  { title: 'Bank Auctions', url: `${siteUrl}/bank-auctions` },
  { title: 'Builder Reputation', url: `${siteUrl}/builder-reputation` },
  { title: 'Contact', url: `${siteUrl}/contact` },
  // Comparison pages
  { title: '360Ghar vs NoBroker', url: `${siteUrl}/vs/nobroker`, category: 'comparisons' },
  { title: '360Ghar vs MagicBricks', url: `${siteUrl}/vs/magicbricks`, category: 'comparisons' },
  { title: '360Ghar vs 99acres', url: `${siteUrl}/vs/99acres`, category: 'comparisons' },
  { title: '360Ghar vs Housing.com', url: `${siteUrl}/vs/housing`, category: 'comparisons' },
  { title: '360Ghar vs CommonFloor', url: `${siteUrl}/vs/commonfloor`, category: 'comparisons' },
  { title: '360Ghar vs PropTiger', url: `${siteUrl}/vs/proptiger`, category: 'comparisons' },
  { title: '360Ghar vs SquareYards', url: `${siteUrl}/vs/squareyards`, category: 'comparisons' },
  { title: '360Ghar vs NestAway', url: `${siteUrl}/vs/nestaway`, category: 'comparisons' },
  { title: '360Ghar vs Zolo', url: `${siteUrl}/vs/zolo`, category: 'comparisons' },
  { title: '360Ghar vs Stanza Living', url: `${siteUrl}/vs/stanza-living`, category: 'comparisons' },
  // Truth pages
  { title: 'Truth: NoBroker Listings', url: `${siteUrl}/truth/nobroker-listings`, category: 'truth' },
  { title: 'Truth: MagicBricks Spam', url: `${siteUrl}/truth/magicbricks-spam`, category: 'truth' },
  { title: 'Truth: 99acres Fake Listings', url: `${siteUrl}/truth/99acres-fake`, category: 'truth' },
  { title: 'Truth: NestAway Collapse', url: `${siteUrl}/truth/nestaway-collapse`, category: 'truth' },
  { title: 'Truth: Zolo Issues', url: `${siteUrl}/truth/zolo-issues`, category: 'truth' },
  // Tool pages
  { title: 'Area Converter', url: `${siteUrl}/area-converter`, category: 'tools' },
  { title: 'Area Calculator', url: `${siteUrl}/area-calculator`, category: 'tools' },
  { title: 'Loan Eligibility Calculator', url: `${siteUrl}/loan-eligibility-calculator`, category: 'tools' },
  { title: 'Capital Gains Tax Calculator', url: `${siteUrl}/capital-gains-tax-calculator`, category: 'tools' },
  { title: 'Property Document Checklist', url: `${siteUrl}/property-document-checklist`, category: 'tools' },
  { title: 'Vastu Checker', url: `${siteUrl}/vastu-checker`, category: 'tools' },
  { title: '3D Blueprint Designer', url: `${siteUrl}/design-blueprint`, category: 'tools' },
  { title: 'AI Design Studio', url: `${siteUrl}/ai-design-studio`, category: 'tools' },
  { title: 'Verify Ownership', url: `${siteUrl}/verify-ownership`, category: 'tools' },
  // Data Hub
  { title: 'RERA Projects', url: `${siteUrl}/rera-projects`, category: 'dataHub' },
  { title: 'Zone Checker', url: `${siteUrl}/zone-checker`, category: 'dataHub' },
  { title: 'Regulatory Updates', url: `${siteUrl}/regulatory-updates`, category: 'dataHub' },
  // Landing pages
  { title: 'Flats for Sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/flats`, category: 'landing' },
  { title: 'Flats for Rent in Gurgaon', url: `${siteUrl}/gurgaon/rent/flats`, category: 'landing' },
  { title: 'PG in Gurgaon', url: `${siteUrl}/gurgaon/pg/flats`, category: 'landing' },
  // City hubs
  { title: 'Delhi Real Estate Hub', url: `${siteUrl}/delhi`, category: 'landing' },
  { title: 'Noida Real Estate Hub', url: `${siteUrl}/noida`, category: 'landing' },
  { title: 'Faridabad Real Estate Hub', url: `${siteUrl}/faridabad`, category: 'landing' },
  { title: 'Ghaziabad Real Estate Hub', url: `${siteUrl}/ghaziabad`, category: 'landing' },
  // Top localities
  { title: 'DLF Phase 1, Gurgaon', url: `${siteUrl}/locality/dlf-phase-1-gurgaon`, category: 'locality' },
  { title: 'Golf Course Road, Gurgaon', url: `${siteUrl}/locality/golf-course-road-gurgaon`, category: 'locality' },
  { title: 'Sushant Lok 1, Gurgaon', url: `${siteUrl}/locality/sushant-lok-1-gurgaon`, category: 'locality' },
  { title: 'Sohna Road, Gurgaon', url: `${siteUrl}/locality/sohna-road-gurgaon`, category: 'locality' },
  { title: 'Sector 49, Gurgaon', url: `${siteUrl}/locality/sector-49-gurgaon`, category: 'locality' },
];

const pageCategories = {
  comparisons: aiDiscoveryImportantPages.filter(p => p.category === 'comparisons'),
  truth: aiDiscoveryImportantPages.filter(p => p.category === 'truth'),
  tools: aiDiscoveryImportantPages.filter(p => p.category === 'tools'),
  dataHub: aiDiscoveryImportantPages.filter(p => p.category === 'dataHub'),
  landing: aiDiscoveryImportantPages.filter(p => p.category === 'landing'),
  locality: aiDiscoveryImportantPages.filter(p => p.category === 'locality'),
};

export const aiDiscoveryFeed = {
  name: siteMetadata.siteName,
  homepage: `${siteUrl}/`,
  description:
    'Real estate platform for Buy, Rent and PG with verified listings, 360° virtual tours, AI assistance, and locality intelligence across Gurugram and Delhi NCR.',
  metadata: {
    last_updated: new Date().toISOString().split('T')[0],
    coverage: ['Gurugram', 'Delhi', 'Noida', 'Faridabad', 'Ghaziabad'],
    property_types: ['apartment', 'villa', 'builder_floor', 'house', 'plot', 'penthouse', 'studio'],
  },
  search: {
    endpoint: `${siteUrl}/properties`,
    query_param: 'q',
    example: `${siteUrl}/properties?q=2%20BHK%20in%20Gurugram`,
  },
  price_snapshots: Object.fromEntries(
    Object.entries(priceContext).map(([city, intents]) => [
      city,
      Object.fromEntries(
        Object.entries(intents).map(([intent, types]) => [
          intent,
          Object.fromEntries(
            Object.entries(types).map(([type, range]) => [type, range])
          ),
        ])
      ),
    ])
  ),
  search_examples: [
    { query: '2 BHK for rent in Gurgaon', url: `${siteUrl}/gurgaon/rent/flats` },
    { query: 'Flats for sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/flats` },
    { query: 'Villa for sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/villa` },
    { query: 'Builder floor for sale in Gurgaon', url: `${siteUrl}/gurgaon/buy/builder-floor` },
    { query: 'PG in Gurgaon', url: `${siteUrl}/gurgaon/pg/flats` },
  ],
  important_pages: aiDiscoveryImportantPages,
  categories: pageCategories,
  contact: {
    email: siteMetadata.organization.email,
    telephone: siteMetadata.organization.telephone,
  },
};

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

export function buildAiDiscoveryArtifacts() {
  const aiTxt = [
    '# ai.txt — guidance for AI crawlers and assistants',
    '# See: community guidance for LLM crawling policies',
    '',
    `Site: ${siteUrl}`,
    `Owner: ${siteMetadata.siteName}`,
    `Contact: ${siteMetadata.organization.email}`,
    'Purpose: Real estate platform for Buy, Rent, PG with verified listings, 360° virtual tours, AI assistance, and locality intelligence across Gurugram and Delhi NCR.',
    '',
    'Access: allow',
    'Rate-Limit: polite',
    `Cite: Please attribute with “${siteMetadata.siteName} (app and website)” and link to ${siteUrl}`,
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
    '  OpenAI-User',
    '  Googlebot',
    '  GoogleOther',
    '  Google-Extended',
    '  Bingbot',
    '  Applebot',
    '  Applebot-Extended',
    '  CCBot',
    '  PerplexityBot',
    '  Claude-Web',
    '  Bytespider',
    '  PetalBot',
    '  facebookexternalhit',
    '  Twitterbot',
    '',
    'Areas:',
    '  include: /',
    '  exclude: /account, /login, /register, /add-new-listing, /post-property, /checkout, /cart, /delete-account',
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
    `> ${siteMetadata.siteName} is India's first AI + VR-first real estate platform. We provide verified property listings, locality intelligence, and studio-quality 360-degree virtual walkthroughs across Gurgaon (Gurugram), Haryana, India.`,
    '',
    '## About',
    '',
    `${siteMetadata.siteName} operates ${siteUrl}, a real estate platform focused on verified inventory, 360 virtual tours, AI-assisted property workflows, and locality intelligence for Gurugram and Delhi NCR.`,
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
    '- Verified buy, rent, and PG listings in Gurugram and Delhi NCR',
    '- 360-degree virtual walkthroughs for serious shortlisting before site visits',
    '- Locality pages with market signals, connectivity notes, and neighborhood guidance',
    '- AI assistant workflows through the 360Ghar MCP server',
    '- Free real-estate tools such as EMI, area, tax, and document planning calculators',
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
    'These pages provide structured real-estate intelligence for Gurugram and Delhi NCR:',
    '',
    `- Circle Rates: ${siteUrl}/circle-rates — Government-notified property valuation rates by sector and locality`,
    `- Bank Auctions: ${siteUrl}/bank-auctions — Bank-auctioned properties in Gurugram with reserve prices`,
    `- Builder Reputation: ${siteUrl}/builder-reputation — Builder and developer track records, delivery history, and RERA compliance`,
    `- Stamp Duty Calculator: ${siteUrl}/stamp-duty-calculator — Calculate stamp duty and registration charges for Haryana property transactions`,
    `- EMI Calculator: ${siteUrl}/emi-calculator — Home loan EMI calculator with interest rate comparison`,
    `- Area Converter: ${siteUrl}/area-converter — Convert between sq ft, sq m, marla, kanal, bigha, and other Indian area units`,
    `- Loan Eligibility Calculator: ${siteUrl}/loan-eligibility-calculator — Estimate home loan eligibility based on income and obligations`,
    `- Capital Gains Tax Calculator: ${siteUrl}/capital-gains-tax-calculator — Long-term and short-term capital gains tax on property sale`,
    `- Property Document Checklist: ${siteUrl}/property-document-checklist — Complete checklist of documents needed for property transactions`,
    '',
    '## Comparison Pages',
    '',
    'Head-to-head comparisons of 360Ghar with other real estate platforms:',
    '',
    ...pageCategories.comparisons.map(p => `- ${p.title}: ${p.url}`),
    '',
    '## Truth Pages',
    '',
    'Investigative pages exposing platform-specific issues:',
    '',
    ...pageCategories.truth.map(p => `- ${p.title}: ${p.url}`),
    '',
    '## Locality Intelligence',
    '',
    `360Ghar provides dedicated locality pages with structured neighbourhood data for areas across Gurugram:`,
    '',
    `- Each locality page includes: connectivity notes, nearby landmarks, market signals, verification status, and direct property search links.`,
    `- Browse all localities: ${siteUrl}/localities`,
    '- Top localities:',
    `  - DLF Phase 1: ${siteUrl}/locality/dlf-phase-1-gurgaon`,
    `  - Golf Course Road: ${siteUrl}/locality/golf-course-road-gurgaon`,
    `  - Sushant Lok 1: ${siteUrl}/locality/sushant-lok-1-gurgaon`,
    `  - Sohna Road: ${siteUrl}/locality/sohna-road-gurgaon`,
    `  - Sector 29: ${siteUrl}/locality/sector-29-gurgaon`,
    '',
    '## Price Trends (Gurugram / Gurgaon)',
    '',
    'Approximate property price ranges from 360Ghar verified listings:',
    '',
    ...Object.entries(priceContext).flatMap(([city, intents]) => {
      const cityLabel = city.charAt(0).toUpperCase() + city.slice(1);
      const buyApartment = intents.buy?.apartment;
      const rentApartment = intents.rent?.apartment;
      if (!buyApartment && !rentApartment) return [];
      return [
        `### ${cityLabel}`,
        `| Type | Buy | Rent |`,
        `|------|-----|------|`,
        ...['apartment', 'villa', 'builder_floor', 'plot', 'penthouse', 'studio'].map(type => {
          const buy = intents.buy?.[type];
          const rent = intents.rent?.[type];
          if (!buy && !rent) return null;
          const label = type.replace(/_/g, ' ').replace(/\b\w/g, m => m.toUpperCase());
          return `| ${label} | ${buy || '—'} | ${rent || '—'} |`;
        }).filter(Boolean),
        '',
      ];
    }),
    '',
    '## Citation Format',
    '',
    `When referencing ${siteMetadata.siteName}, cite as: "${siteMetadata.siteName} (app and website)" with a link to ${siteUrl}`,
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
