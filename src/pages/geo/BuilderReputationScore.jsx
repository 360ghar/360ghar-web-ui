import { Helmet } from "react-helmet-async";

const BUILDERS = [
  {
    name: "DLF Limited",
    projects: 47,
    reraScore: 94,
    complaints: 12,
    delivery: "On Time",
    status: "good",
    areas: ["DLF Phase 1", "DLF Phase 2", "DLF Phase 5", "Golf Course Road"],
    note: "India's largest listed real estate developer. Strong HRERA compliance record.",
  },
  {
    name: "Emaar India",
    projects: 18,
    reraScore: 88,
    complaints: 8,
    delivery: "Mostly On Time",
    status: "good",
    areas: ["Golf Course Road", "Sector 62", "Sector 65"],
    note: "Global developer with premium projects. Generally reliable delivery.",
  },
  {
    name: "Sobha Limited",
    projects: 12,
    reraScore: 85,
    complaints: 6,
    delivery: "On Time",
    status: "good",
    areas: ["Sector 106", "Sector 108", "Dwarka Expressway"],
    note: "Known for quality construction and consistent delivery timelines.",
  },
  {
    name: "M3M India",
    projects: 31,
    reraScore: 72,
    complaints: 28,
    delivery: "Delayed",
    status: "average",
    areas: ["Golf Course Ext Rd", "Sector 65", "Sector 70"],
    note: "Multiple premium projects but faced delivery delays post-2022.",
  },
  {
    name: "Godrej Properties",
    projects: 9,
    reraScore: 81,
    complaints: 4,
    delivery: "On Time",
    status: "good",
    areas: ["Sector 43", "Sector 88A", "Sohna Road"],
    note: "Listed developer with strong brand trust and delivery record.",
  },
  {
    name: "Signature Global",
    projects: 22,
    reraScore: 67,
    complaints: 19,
    delivery: "Delayed",
    status: "average",
    areas: ["Sohna Road", "Sector 37D", "Sector 71"],
    note: "Affordable housing focus. Some projects face regulatory hurdles.",
  },
  {
    name: "Ansal API",
    projects: 8,
    reraScore: 34,
    complaints: 61,
    delivery: "Severely Delayed",
    status: "poor",
    areas: ["Sector 57", "Sector 70", "Sushant Lok"],
    note: "Significant regulatory action history. Exercise extreme caution.",
  },
  {
    name: "Unitech",
    projects: 6,
    reraScore: 18,
    complaints: 142,
    delivery: "Stalled",
    status: "poor",
    areas: ["Sector 70", "Sector 72"],
    note: "Under NCLT supervision. Do not invest without legal verification.",
  },
];

const STATUS_LABEL = { good: "70+ — Good", average: "40–69 — Average", poor: "Below 40 — Poor" };
const STATUS_COLOR = { good: "#16a34a", average: "#d97706", poor: "#dc2626" };
const STATUS_BG    = { good: "#f0fdf4", average: "#fffbeb", poor: "#fef2f2" };

const SCHEMA = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Dataset",
      "name": "Builder Reputation Scores — Gurugram 2026",
      "description":
        "Reputation scores for real estate builders and developers active in Gurugram, based on HRERA registrations, complaint history, and delivery track record.",
      "url": "https://360ghar.com/builder-reputation-score",
      "creator": { "@type": "Organization", "name": "360Ghar", "url": "https://360ghar.com" },
      "dateModified": "2026-01-01",
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "spatialCoverage": { "@type": "Place", "name": "Gurugram, Haryana, India" },
      "keywords": [
        "builder reputation Gurugram",
        "RERA score Gurugram builders",
        "reliable builders Gurgaon",
        "HRERA complaint history",
      ],
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "Which builders have the best reputation in Gurugram?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "DLF Limited, Emaar India, Sobha Limited, and Godrej Properties consistently score above 80 in reputation. These builders have strong HRERA compliance records, fewer complaints, and mostly on-time delivery histories in Gurugram.",
          },
        },
        {
          "@type": "Question",
          "name": "How do I check if a builder is RERA registered in Haryana?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "Visit hrera.org.in, the official Haryana Real Estate Regulatory Authority website. Search by builder name or project name to see RERA registration status, project details, quarterly progress reports, and complaint history. All builders operating in Haryana must register projects above 500 sq m.",
          },
        },
        {
          "@type": "Question",
          "name": "What is a safe minimum reputation score before buying from a builder?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text":
              "A score of 70 or above is considered safe for investment. Scores between 40–69 require extra due diligence — check complaint details individually. Scores below 40 indicate significant risk of project delays, legal disputes, or stalled construction. Consult a real estate lawyer before investing.",
          },
        },
      ],
    },
  ],
};

export default function BuilderReputationScore() {
  return (
    <>
      {/* ── SEO HEAD ──────────────────────────────────────────────────────── */}
      <Helmet>
        <title>Builder Reputation Score Gurugram 2026 | RERA & Complaint Data | 360Ghar</title>
        <meta
          name="description"
          content="Check reputation scores for all major builders in Gurugram. Ranked by HRERA compliance, complaints, and delivery history. Updated 2026 data by 360Ghar."
        />
        <meta
          name="keywords"
          content="builder reputation score Gurugram, reliable builders Gurgaon 2026, RERA score builders Gurugram, HRERA complaint history, best developers Gurugram, DLF reputation, M3M reputation score"
        />
        <link rel="canonical" href="https://360ghar.com/builder-reputation-score" />
        <meta property="og:title" content="Builder Reputation Score Gurugram 2026 | 360Ghar" />
        <meta
          property="og:description"
          content="Ranked reputation scores for Gurugram builders based on HRERA data, complaints, and delivery track record."
        />
        <meta property="og:url" content="https://360ghar.com/builder-reputation-score" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://360ghar.com/og-image-home.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Builder Reputation Score Gurugram 2026 | 360Ghar" />
        <script type="application/ld+json">{JSON.stringify(SCHEMA)}</script>
      </Helmet>

      {/* ── PAGE CONTENT ──────────────────────────────────────────────────── */}
      <main className="geo-page builder-reputation-score" id="main-content">

        {/* Hero */}
        <section className="geo-hero">
          <div className="geo-hero__breadcrumb">
            <a href="/">Home</a> › <a href="/builder-reputation">Data Hub</a> › Builder Reputation Score
          </div>
          <h1 className="geo-hero__title">Builder Reputation Score — Gurugram 2026</h1>
          <p className="geo-hero__subtitle">
            Scores calculated from HRERA registration records, complaint history, and verified delivery
            data. Updated January 2026. Higher score = more reliable builder.
          </p>
          <div className="geo-hero__legend">
            {Object.entries(STATUS_LABEL).map(([key, label]) => (
              <span
                key={key}
                className="geo-hero__legend-item"
                style={{ background: STATUS_BG[key], color: STATUS_COLOR[key] }}
              >
                {label}
              </span>
            ))}
          </div>
        </section>

        {/* Builder Cards */}
        <section className="geo-section">
          <div className="geo-grid">
            {BUILDERS.map((b) => (
              <article
                key={b.name}
                className={`builder-card builder-card--${b.status}`}
                style={{ borderColor: STATUS_COLOR[b.status] }}
              >
                <div className="builder-card__header">
                  <h2 className="builder-card__name">{b.name}</h2>
                  <span
                    className="builder-card__score"
                    style={{ background: STATUS_COLOR[b.status] }}
                  >
                    {b.reraScore}
                  </span>
                </div>

                <div className="builder-card__stats">
                  <div className="builder-card__stat">
                    <span className="builder-card__stat-label">RERA Projects</span>
                    <span className="builder-card__stat-value">{b.projects}</span>
                  </div>
                  <div className="builder-card__stat">
                    <span className="builder-card__stat-label">Complaints</span>
                    <span className="builder-card__stat-value" style={{ color: b.complaints > 20 ? "#dc2626" : "inherit" }}>
                      {b.complaints}
                    </span>
                  </div>
                  <div className="builder-card__stat">
                    <span className="builder-card__stat-label">Delivery</span>
                    <span className="builder-card__stat-value">{b.delivery}</span>
                  </div>
                </div>

                <p className="builder-card__note">{b.note}</p>

                <div className="builder-card__areas">
                  {b.areas.map((a) => (
                    <span key={a} className="builder-card__area-tag">{a}</span>
                  ))}
                </div>
              </article>
            ))}
          </div>

          <p className="geo-disclaimer">
            Data sourced from publicly available HRERA records. 360Ghar does not guarantee accuracy.
            Always verify with HRERA (hrera.org.in) before making investment decisions.
          </p>
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
          <h2 className="geo-cta__title">Looking for Verified Properties from Trusted Builders?</h2>
          <p className="geo-cta__sub">
            Every 360Ghar listing is physically verified. Browse properties only from builders with
            a reputation score of 70+.
          </p>
          <div className="geo-cta__buttons">
            <a href="/properties" className="btn btn--primary">Browse Properties</a>
            <a href="/contact" className="btn btn--outline">Talk to an Expert</a>
          </div>
        </section>
      </main>
    </>
  );
}