import { Helmet } from "react-helmet-async";

const AREAS = [
  {
    name: "DLF Phase 1",
    demandScore: 96,
    avgRent2bhk: 55000,
    vacancy: "2%",
    profile: "IT Professionals, Senior Executives",
    demandTrend: "↑ +8% YoY",
    topEmployers: ["Cyber City", "Unitech Cyber Park", "Vatika Business Park"],
    tier: "ultra-high",
  },
  {
    name: "Golf Course Road",
    demandScore: 94,
    avgRent2bhk: 65000,
    vacancy: "3%",
    profile: "MNC Employees, Expats",
    demandTrend: "↑ +11% YoY",
    topEmployers: ["DLF Cyber City", "Orchid Business Park"],
    tier: "ultra-high",
  },
  {
    name: "Sushant Lok 1",
    demandScore: 88,
    avgRent2bhk: 42000,
    vacancy: "4%",
    profile: "Mid-level IT, Families",
    demandTrend: "↑ +6% YoY",
    topEmployers: ["Udyog Vihar", "Cyber City (commute)"],
    tier: "high",
  },
  {
    name: "DLF Phase 2",
    demandScore: 85,
    avgRent2bhk: 48000,
    vacancy: "5%",
    profile: "IT Professionals, Young Families",
    demandTrend: "↑ +5% YoY",
    topEmployers: ["Cyber City", "Vatika Business Park"],
    tier: "high",
  },
  {
    name: "Sector 56",
    demandScore: 79,
    avgRent2bhk: 32000,
    vacancy: "6%",
    profile: "Mid-income IT, Servicemen",
    demandTrend: "↑ +4% YoY",
    topEmployers: ["Unitech Cyber Park", "Sector 44 offices"],
    tier: "high",
  },
  {
    name: "Sohna Road",
    demandScore: 72,
    avgRent2bhk: 28000,
    vacancy: "8%",
    profile: "Budget Tenants, Young Professionals",
    demandTrend: "→ Stable",
    topEmployers: ["Rajiv Chowk offices", "Udyog Vihar"],
    tier: "medium",
  },
  {
    name: "Dwarka Expressway",
    demandScore: 68,
    avgRent2bhk: 24000,
    vacancy: "10%",
    profile: "Budget Renters, Families near Airport",
    demandTrend: "↑ +14% YoY",
    topEmployers: ["Gurugram offices", "Delhi NCR (commute)"],
    tier: "medium",
  },
  {
    name: "New Gurugram (Sec 82–95)",
    demandScore: 61,
    avgRent2bhk: 20000,
    vacancy: "14%",
    profile: "Budget Segment, New Supply Area",
    demandTrend: "↑ +18% YoY",
    topEmployers: ["IMT Manesar", "Honda Plant area"],
    tier: "emerging",
  },
];

const TIER_LABEL = {
  "ultra-high": "Ultra High Demand",
  high: "High Demand",
  medium: "Moderate Demand",
  emerging: "Emerging — Fast Growing",
};
const TIER_COLOR = {
  "ultra-high": "#dc2626",
  high: "#d97706",
  medium: "#2563eb",
  emerging: "#7c3aed",
};

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "name": "Tenant Demand Heatmap — Gurugram 2026",
      "description":
        "Area-wise tenant demand scores, average rents, vacancy rates, and tenant profiles for residential localities in Gurugram, based on 360Ghar listing data.",
      "url": "https://360ghar.com/tenant-demand-heatmap",
      "creator": { "@type": "Organization", "name": "360Ghar", "url": "https://360ghar.com" },
      "dateModified": "2026-01-01",
      "spatialCoverage": { "@type": "Place", "name": "Gurugram, Haryana, India" },
      "keywords": [
        "high demand areas rent Gurugram",
        "where do IT professionals rent Gurgaon",
        "best areas for rental investment Gurugram",
        "tenant demand heatmap Gurugram 2026",
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Which areas in Gurugram have the highest tenant demand?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "DLF Phase 1, Golf Course Road, and Sushant Lok 1 have the highest tenant demand in Gurugram, with vacancy rates below 5%. These areas are popular with IT professionals and MNC employees working in Cyber City and Udyog Vihar. Average 2BHK rents range from ₹42,000 to ₹65,000 per month.",
          },
        },
        {
          "@type": "Question",
          "name": "Where do IT professionals typically rent in Gurugram?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "IT professionals in Gurugram predominantly rent in areas close to Cyber City and Udyog Vihar — specifically DLF Phase 1, DLF Phase 2, Golf Course Road, and Sushant Lok 1. These areas offer shorter commutes and premium housing stock. Mid-level IT employees often prefer Sector 56 and Sohna Road for more affordable options.",
          },
        },
        {
          "@type": "Question",
          "name": "Which Gurugram area gives the best rental yield?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "For rental yield (annual rent ÷ property price), Dwarka Expressway and New Gurugram sectors (82–95) currently offer the best yields at 4–5% annually due to lower property prices and rising rents. DLF Phase 1 and Golf Course Road offer the highest absolute rents but lower yields due to high property values.",
          },
        },
      ],
    },
  ],
};

export default function TenantDemandHeatmap() {
  return (
    <>
      <Helmet>
        <title>Tenant Demand Heatmap Gurugram 2026 — Area-wise Rental Data | 360Ghar</title>
        <meta
          name="description"
          content="Where do tenants most want to live in Gurugram? Area-wise demand scores, vacancy rates, average rents, and tenant profiles. 2026 data by 360Ghar."
        />
        <meta
          name="keywords"
          content="high demand areas rent Gurugram, where IT professionals rent Gurgaon, tenant demand heatmap Gurugram, best areas rental investment Gurugram 2026, vacancy rate Gurugram sectors"
        />
        <link rel="canonical" href="https://360ghar.com/tenant-demand-heatmap" />
        <meta property="og:title" content="Tenant Demand Heatmap Gurugram 2026 | 360Ghar" />
        <meta
          property="og:description"
          content="Area-wise tenant demand scores, average rents, and vacancy rates across Gurugram localities. Updated 2026."
        />
        <meta property="og:url" content="https://360ghar.com/tenant-demand-heatmap" />
        <meta property="og:image" content="https://360ghar.com/og-image-home.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(SCHEMA)}</script>
      </Helmet>

      <main className="geo-page tenant-demand-heatmap" id="main-content">

        {/* Hero */}
        <section className="geo-hero">
          <div className="geo-hero__breadcrumb">
            <a href="/">Home</a> › <a href="/">Data Hub</a> › Tenant Demand Heatmap
          </div>
          <h1 className="geo-hero__title">Tenant Demand Heatmap — Gurugram 2026</h1>
          <p className="geo-hero__subtitle">
            Area-by-area demand scores, vacancy rates, average rents, and tenant profiles across
            Gurugram — based on 360Ghar listing data and market research.
          </p>
          <div className="geo-hero__legend">
            {Object.entries(TIER_LABEL).map(([key, label]) => (
              <span key={key} className="geo-hero__legend-item" style={{ background: TIER_COLOR[key] + "20", color: TIER_COLOR[key] }}>
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Demand Cards */}
        <section className="geo-section">
          <div className="geo-grid">
            {AREAS.map((area) => (
              <article
                key={area.name}
                className={`demand-card demand-card--${area.tier}`}
                style={{ borderColor: TIER_COLOR[area.tier] }}
              >
                <div className="demand-card__header">
                  <h2 className="demand-card__name">{area.name}</h2>
                  <div
                    className="demand-card__score-ring"
                    style={{ borderColor: TIER_COLOR[area.tier], color: TIER_COLOR[area.tier] }}
                  >
                    {area.demandScore}
                  </div>
                </div>

                <span
                  className="demand-card__tier"
                  style={{ background: TIER_COLOR[area.tier] + "18", color: TIER_COLOR[area.tier] }}
                >
                  {TIER_LABEL[area.tier]}
                </span>

                <div className="demand-card__stats">
                  <div className="demand-card__stat">
                    <span className="demand-card__stat-label">Avg 2BHK Rent</span>
                    <strong className="demand-card__stat-value">
                      ₹{area.avgRent2bhk.toLocaleString("en-IN")}/mo
                    </strong>
                  </div>
                  <div className="demand-card__stat">
                    <span className="demand-card__stat-label">Vacancy Rate</span>
                    <strong className="demand-card__stat-value">{area.vacancy}</strong>
                  </div>
                  <div className="demand-card__stat">
                    <span className="demand-card__stat-label">YoY Trend</span>
                    <strong className="demand-card__stat-value">{area.demandTrend}</strong>
                  </div>
                </div>

                <p className="demand-card__profile">
                  <strong>Who rents here:</strong> {area.profile}
                </p>

                <div className="demand-card__employers">
                  <span className="demand-card__employers-label">Key employers nearby:</span>
                  {area.topEmployers.map((e) => (
                    <span key={e} className="demand-card__employer-tag">{e}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="geo-faq geo-section--alt">
          <div className="geo-section__inner">
            <h2 className="geo-section__heading">Frequently Asked Questions</h2>
            {SCHEMA["@graph"][1].mainEntity.map((q) => (
              <details key={q.name} className="geo-faq__item">
                <summary className="geo-faq__question">{q.name}</summary>
                <p className="geo-faq__answer">{q.acceptedAnswer.text}</p>
              </details>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="geo-cta">
          <h2 className="geo-cta__title">Ready to Invest in a High-Demand Area?</h2>
          <p className="geo-cta__sub">
            Browse verified properties in Gurugram's top-demand localities with 360° virtual tours.
          </p>
          <div className="geo-cta__buttons">
            <a href="/properties" className="btn btn--primary">Search Properties</a>
            <a href="/ai-agent" className="btn btn--outline">Ask AI Assistant</a>
          </div>
        </section>
      </main>
    </>
  );
}