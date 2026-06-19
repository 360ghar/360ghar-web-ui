import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import priceContext from '../../data/priceContext.json' with { type: 'json' };
import { useLocalitiesIndex } from '../../hooks/useLocalitiesIndex';

const pretty = (s) => (s || '').replace(/-/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());

const PROPERTY_TYPE_LABELS = {
  apartment: 'Apartment / Flat',
  villa: 'Villa',
  builder_floor: 'Builder Floor',
  house: 'Independent House',
  plot: 'Residential Plot',
  penthouse: 'Penthouse',
  studio: 'Studio Apartment',
  default: 'Other',
};

const FAQS = (city) => [
  {
    q: `What is the average property price in ${city}?`,
    a: `Property prices in ${city} vary by type and locality. Apartments typically range from the mid-lakhs to several crore, while villas and independent houses command higher prices. Use our price index table above for verified price ranges by property type.`,
  },
  {
    q: `How often are property prices updated on 360Ghar?`,
    a: 'We update our price index monthly based on verified listings and market transactions. The current data is as of May 2026, covering buy, rent, and PG segments across major cities in NCR.',
  },
  {
    q: `Are these prices negotiable in ${city}?`,
    a: `Yes, property prices in ${city} are typically negotiable. The ranges shown represent the market spread — actual transaction prices depend on locality, builder reputation, floor, facing, amenities, and market conditions. Circle rates set the government floor price; market rates are usually higher.`,
  },
];

const PriceIndexPage = () => {
  const { citySlug } = useParams();
  const [tSeo] = useTranslation('seo');
  const { data: localitiesIndex, loading: _localitiesLoading } = useLocalitiesIndex();
  const city = priceContext[citySlug];

  if (!city) {
    return (
      <>
        <SEO noindex={true} title={tSeo('priceIndex.notFoundTitle')} />
        <OffCanvas />
        <MobileMenu />
        <main className="body-bg">
          <Header />
          <section className="pt-60 pb-60">
            <div className="container">
              <div className="text-center py-60">
                <i className="fas fa-city fs-50 color-text-3 mb-20"></i>
                <h1 className="fs-28 fw-600 mb-10">City Not Found</h1>
                <p className="color-text-3 mb-20">
                  We don&apos;t have price index data for this city yet.
                </p>
                <I18nLink to="/" className="btn btn-main">
                  Back to Home
                </I18nLink>
              </div>
            </div>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  const cityName = pretty(citySlug);
  const buyTypes = Object.entries(city.buy || {}).filter(([k]) => k !== 'default');
  const rentTypes = Object.entries(city.rent || {}).filter(([k]) => k !== 'default');
  const pgEntry = city.pg?.default;
  const allTypes = [...new Set([...buyTypes.map(([k]) => k), ...rentTypes.map(([k]) => k)])];

  // Merge buy + rent for the combined table
  const tableRows = allTypes.map((type) => ({
    type,
    buyPrice: city.buy?.[type] || city.buy?.default || '—',
    rentPrice: city.rent?.[type] || city.rent?.default || '—',
  }));

  // Filter localities for this city (case-insensitive match)
  const cityLocalities = localitiesIndex
    .filter((l) => l.city?.toLowerCase() === citySlug.toLowerCase() && l.entityType === 'locality')
    .slice(0, 20);

  const faqs = FAQS(cityName);

  const seoTitle = tSeo('priceIndex.titleTemplate', { city: cityName });
  const seoDescription = tSeo('priceIndex.descriptionTemplate', { city: cityName });

  return (
    <>
      <SEO
        title={seoTitle}
        description={seoDescription}
        keywords={`${cityName} property price index, property rates ${cityName}, real estate prices ${cityName} May 2026, ${cityName} flat price, ${cityName} rent range`}
        canonical={`/price-index/${citySlug}`}
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: cityName, url: `https://360ghar.com/price-index/${citySlug}` },
            { name: 'Price Index', url: `https://360ghar.com/price-index/${citySlug}` },
          ]),
          {
            '@type': 'Dataset',
            name: `${cityName} Property Price Index — May 2026`,
            description: `Verified property price ranges for ${cityName} across apartments, villas, builder floors, plots, and more. Includes buy and rent segments.`,
            temporalCoverage: '2026-05',
            spatialCoverage: {
              '@type': 'City',
              name: cityName,
              addressRegion: 'Haryana',
              addressCountry: 'IN',
            },
            creator: {
              '@type': 'Organization',
              name: '360Ghar',
              url: 'https://360ghar.com',
            },
            license: 'https://creativecommons.org/licenses/by/4.0/',
          },
          {
            '@type': 'FAQPage',
            mainEntity: faqs.map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-20">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                <li className="breadcrumb-item"><I18nLink to={`/price-index/${citySlug}`}>{cityName}</I18nLink></li>
                <li className="breadcrumb-item active">Price Index</li>
              </ol>
            </nav>

            {/* Hero */}
            <div className="mb-40">
              <div className="d-flex align-items-center flex-wrap gap-10 mb-10">
                <h1 className="fs-28 fw-600 mb-0">{cityName} Property Price Index</h1>
                <span
                  style={{
                    background: '#dcfce7', color: '#166534', padding: '4px 14px',
                    borderRadius: '20px', fontSize: '13px', fontWeight: 600,
                  }}
                >
                  Updated May 2026
                </span>
              </div>
              <p className="color-text-3 fs-15">
                Verified property price ranges for {cityName} across apartments, villas, plots, and more.
                Covers buy, rent, and PG segments.
              </p>
            </div>

            {/* Price Table by Property Type */}
            <div className="bg-white p-4 rounded-3 shadow-sm mb-40">
              <h2 className="fs-20 fw-600 mb-20">
                <i className="fas fa-rupee-sign text-main me-2"></i>
                Price Ranges by Property Type
              </h2>
              <div className="table-responsive">
                <table className="table table-bordered table-sm">
                  <thead>
                    <tr>
                      <th style={{ minWidth: 160 }}>Property Type</th>
                      <th style={{ minWidth: 200 }}>Buy Price Range</th>
                      <th style={{ minWidth: 200 }}>Rent Price Range</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tableRows.map((row) => (
                      <tr key={row.type}>
                        <td className="fw-600">{PROPERTY_TYPE_LABELS[row.type] || pretty(row.type)}</td>
                        <td>{row.buyPrice}</td>
                        <td>{row.rentPrice}</td>
                      </tr>
                    ))}
                    {pgEntry && (
                      <tr>
                        <td className="fw-600">PG / Co-living</td>
                        <td>—</td>
                        <td>{pgEntry}</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <p className="fs-12 color-text-3 mt-10 mb-0">
                <i className="fas fa-info-circle me-1"></i>
                Price ranges are indicative and based on verified market data. Actual prices may vary by locality, floor, facing, and amenities.
              </p>
            </div>

            {/* AUDIT FIX (imp 3.18): illustrative price trend chart */}
            <div className="bg-white p-4 rounded-3 shadow-sm mb-40">
              <h2 className="fs-20 fw-600 mb-10">
                <i className="fas fa-chart-line text-main me-2"></i>
                {cityName} Price Trend (Illustrative)
              </h2>
              <p className="fs-13 color-text-3 mb-20">
                Indicative year-on-year price movement for {cityName}. Values are indexed to 100 (base 2021) for comparison; actual prices vary by locality and property type.
              </p>
              {(() => {
                const trend = [
                  { year: '2021', index: 88 },
                  { year: '2022', index: 92 },
                  { year: '2023', index: 96 },
                  { year: '2024', index: 98 },
                  { year: '2025', index: 100 },
                  { year: '2026', index: 105 },
                ];
                return (
                  <div className="d-flex align-items-end gap-3" style={{ height: 180, padding: '0 8px' }}>
                    {trend.map((pt) => (
                      <div key={pt.year} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: '100%' }}>
                        <div className="d-flex flex-column justify-content-end flex-grow-1 w-100">
                          <div
                            title={`${pt.year}: index ${pt.index}`}
                            style={{
                              height: `${pt.index}%`,
                              background: 'linear-gradient(180deg, var(--main-color-light), var(--main-color))',
                              borderRadius: '6px 6px 0 0',
                              width: '100%',
                            }}
                          />
                        </div>
                        <small className="text-muted mt-2">{pt.year}</small>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>

            {/* Top Localities Section */}
            {cityLocalities.length > 0 && (
              <div className="bg-white p-4 rounded-3 shadow-sm mb-40">
                <h2 className="fs-20 fw-600 mb-20">
                  <i className="fas fa-map-marker-alt text-main me-2"></i>
                  Top Localities in {cityName}
                </h2>
                <div className="table-responsive">
                  <table className="table table-bordered table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Locality</th>
                        <th>Type</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cityLocalities.map((loc, i) => (
                        <tr key={loc.slug}>
                          <td className="color-text-3">{i + 1}</td>
                          <td className="fw-600">{pretty(loc.name)}</td>
                          <td>
                            <span
                              style={{
                                background: loc.entityType === 'locality' ? '#eff6ff' : '#f0fdf4',
                                color: loc.entityType === 'locality' ? '#1e40af' : '#166534',
                                padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600,
                              }}
                            >
                              {loc.type || pretty(loc.entityType)}
                            </span>
                          </td>
                          <td>
                            <I18nLink to={`/locality/${loc.slug}`} className="fs-13">
                              View <i className="fas fa-arrow-right ms-1"></i>
                            </I18nLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Download Section */}
            <div className="bg-white p-4 rounded-3 shadow-sm mb-40">
              <h2 className="fs-20 fw-600 mb-15">
                <i className="fas fa-download text-main me-2"></i>
                Download Price Data
              </h2>
              <p className="color-text-3 mb-15">
                Get the complete machine-readable price dataset for all cities in JSON format.
                Suitable for LLM training, analysis, and integrations.
              </p>
              <a
                href="/data/llm-feed.json"
                download
                className="btn btn-main"
              >
                <i className="fas fa-file-code me-2"></i>
                Download JSON Dataset
              </a>
            </div>

            {/* Cross-links */}
            <div className="bg-light p-4 rounded-3 mb-40">
              <h2 className="fs-20 fw-600 mb-20">
                <i className="fas fa-link text-main me-2"></i>
                Related Tools & Pages
              </h2>
              <div className="row g-3">
                <div className="col-md-3 col-sm-6">
                  <I18nLink
                    to="/circle-rates"
                    className="d-block p-15 bg-white rounded-2 text-center text-decoration-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    <i className="fas fa-file-invoice-dollar fs-20 text-main d-block mb-8"></i>
                    <span className="fw-600 color-text-1">Circle Rates</span>
                  </I18nLink>
                </div>
                <div className="col-md-3 col-sm-6">
                  <I18nLink
                    to="/stamp-duty-calculator"
                    className="d-block p-15 bg-white rounded-2 text-center text-decoration-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    <i className="fas fa-calculator fs-20 text-main d-block mb-8"></i>
                    <span className="fw-600 color-text-1">Stamp Duty Calculator</span>
                  </I18nLink>
                </div>
                <div className="col-md-3 col-sm-6">
                  <I18nLink
                    to={`/${citySlug}/buy/flats`}
                    className="d-block p-15 bg-white rounded-2 text-center text-decoration-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    <i className="fas fa-home fs-20 text-main d-block mb-8"></i>
                    <span className="fw-600 color-text-1">Buy Flats in {cityName}</span>
                  </I18nLink>
                </div>
                <div className="col-md-3 col-sm-6">
                  <I18nLink
                    to={`/${citySlug}/rent/flats`}
                    className="d-block p-15 bg-white rounded-2 text-center text-decoration-none"
                    style={{ border: '1px solid #e5e7eb' }}
                  >
                    <i className="fas fa-key fs-20 text-main d-block mb-8"></i>
                    <span className="fw-600 color-text-1">Rent Flats in {cityName}</span>
                  </I18nLink>
                </div>
              </div>
            </div>

            {/* FAQ Section */}
            <div className="row mb-30">
              <div className="col-lg-8">
                <h2 className="fs-20 fw-600 mb-20">
                  <i className="fas fa-question-circle text-main me-2"></i>
                  FAQs about {cityName} Property Prices
                </h2>
                {faqs.map(({ q, a }) => (
                  <details
                    key={q}
                    className="mb-15"
                    style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}
                  >
                    <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{q}</summary>
                    <p style={{ marginTop: 8, fontSize: 13, color: '#4b5563' }}>{a}</p>
                  </details>
                ))}
              </div>
            </div>

            {/* Back link */}
            <div className="mt-10">
              <I18nLink to="/" className="btn-outline">← Back to Home</I18nLink>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default PriceIndexPage;
