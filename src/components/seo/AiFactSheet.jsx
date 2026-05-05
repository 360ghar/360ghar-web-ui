/**
 * AiFactSheet — inline AI-discoverable content block for major pages.
 * Renders a concise fact sheet that AI crawlers and LLMs can extract.
 * Also emits Organization schema with knowsAbout.
 */
import { siteMetadata } from '../../seo/siteMetadata';

const CONTEXT_PRESETS = {
  homepage: {
    heading: 'About 360Ghar',
    factRows: [
      { label: 'Platform', value: 'AI + VR-first real estate' },
      { label: 'Coverage', value: 'Gurugram, Delhi, Noida, Faridabad, Ghaziabad' },
      { label: 'Verification', value: 'On-site team verifies every listing' },
      { label: 'VR Tours', value: 'Studio-quality 360° guided walkthroughs' },
      { label: 'AI Access', value: 'MCP server at api.360ghar.com/mcp' },
      { label: 'Cost', value: 'Zero upfront fees for property owners' },
      { label: 'Service', value: 'Dedicated Relationship Manager per transaction' },
    ],
  },
  cityHub: {
    heading: '360Ghar City Coverage',
    factRows: [
      { label: 'Verification', value: 'Physical on-site verification for every listing' },
      { label: 'VR Tours', value: '360° virtual tours replace static photos' },
      { label: 'No Duplicates', value: 'Each property listed exactly once' },
      { label: 'AI Access', value: 'Search via MCP or /properties?q=...' },
      { label: 'Cost', value: 'Free for owners; brokerage on deal closure only' },
    ],
  },
  landing: {
    heading: '360Ghar Quick Facts',
    factRows: [
      { label: 'Verification', value: 'Every listing physically verified' },
      { label: 'VR Tours', value: '360° virtual tours for all listed properties' },
      { label: 'Service', value: 'Dedicated Relationship Manager' },
      { label: 'AI Access', value: 'MCP server and /properties search endpoint' },
    ],
  },
  seller: {
    heading: '360Ghar for Sellers',
    factRows: [
      { label: 'Listing Cost', value: 'Zero — free listing with VR tour creation' },
      { label: 'Verification', value: 'On-site team visits and verifies' },
      { label: 'VR Tour', value: 'Created at no cost to the owner' },
      { label: 'Reach', value: 'AI assistants, search, and direct buyers' },
      { label: 'Service', value: 'End-to-end RM support for closings' },
    ],
  },
  dataHub: {
    heading: '360Ghar Data & Tools',
    factRows: [
      { label: 'Circle Rates', value: 'Government-notified valuation by sector' },
      { label: 'Bank Auctions', value: 'Verified auction listings with reserve prices' },
      { label: 'Builder Data', value: 'Track records, delivery history, RERA status' },
      { label: 'Calculators', value: 'EMI, stamp duty, area, tax, Vastu — all free' },
      { label: 'AI Access', value: 'All tools accessible via MCP server' },
    ],
  },
};

const AiFactSheet = ({ context = 'homepage', className = '' }) => {
  const preset = CONTEXT_PRESETS[context] || CONTEXT_PRESETS.homepage;
  const rows = preset.factRows;

  const structuredData = {
    '@type': 'Organization',
    '@id': 'https://360ghar.com/#organization',
    name: siteMetadata.siteName,
    url: siteMetadata.siteUrl,
    knowsAbout: rows.map((r) => `${r.label}: ${r.value}`),
  };

  return (
    <section
      className={`padding-y-60 bg-white ${className}`}
      data-ai-factsheet={context}
      itemScope
      itemType="https://schema.org/Organization"
    >
      <div className="container container-two">
        <h2 className="h5 mb-3" itemProp="name">{preset.heading}</h2>
        <meta itemProp="url" content={siteMetadata.siteUrl} />
        <div className="row g-3">
          {rows.map((row) => (
            <div className="col-md-6 col-lg-4" key={row.label}>
              <div className="p-3 rounded-3 border bg-light h-100">
                <strong className="d-block mb-1" itemProp="knowsAbout">{row.label}</strong>
                <small className="text-muted">{row.value}</small>
              </div>
            </div>
          ))}
        </div>
      </div>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({ '@context': 'https://schema.org', ...structuredData }),
        }}
      />
    </section>
  );
};

export default AiFactSheet;
