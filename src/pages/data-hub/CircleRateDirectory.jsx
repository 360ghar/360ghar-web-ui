import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { dataHubService } from '../../services/dataHubService';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';

const FAQS = [
  {
    question: 'What are circle rates in Gurugram?',
    answer: 'Circle rates (also called DLC rates or collector rates) are the minimum property valuation rates set by the Haryana government for each sector and colony. They are used to calculate stamp duty on property registrations. No property sale can be registered below the circle rate for that area.',
  },
  {
    question: 'How are circle rates different from market rates?',
    answer: 'Circle rates are government-set minimum values used for stamp duty calculation, while market rates are the actual prices at which properties are bought and sold. Market rates are typically 20-50% higher than circle rates in prime areas. Circle rates serve as a floor price for registration purposes.',
  },
  {
    question: 'Do circle rates affect stamp duty?',
    answer: 'Yes, stamp duty is calculated on the higher of the circle rate or the actual transaction value. If you buy a property below the circle rate, you still pay stamp duty based on the circle rate. This ensures the government collects a minimum amount of stamp duty on every property transaction.',
  },
  {
    question: 'How often are circle rates revised in Haryana?',
    answer: 'Circle rates in Haryana are revised periodically by the IGRS (Inspector General of Registration and Stamps), typically every 1-2 years. Revisions usually happen at the start of the financial year in April, though interim revisions can happen if there are significant market changes. The government issues gazette notifications when new rates come into effect.',
  },
  {
    question: 'Can I buy property below the circle rate?',
    answer: 'No, you cannot legally register a property below the circle rate. The Sub-Registrar will refuse to register the transaction if the declared value is below the applicable circle rate. Under Section 50C of the Income Tax Act, the difference between circle rate and actual price is taxable as income for the seller. You can negotiate the actual purchase price, but stamp duty will always be calculated on the circle rate value.',
  },
  {
    question: 'What is the difference between circle rate, ready reckoner rate, and collector rate?',
    answer: 'These are all names for the same thing — the minimum property valuation set by the government for stamp duty purposes. In Maharashtra it\'s called "ready reckoner rate," in Haryana and Delhi it\'s "circle rate," and in some states it\'s "collector rate." All serve the same function of preventing under-valuation of properties.',
  },
  {
    question: 'How do I check the circle rate for a specific locality in Gurugram?',
    answer: 'You can check circle rates for Gurugram localities on this page by selecting Gurugram from the city dropdown. The rates are updated regularly from official government sources. You can also check the Haryana Revenue Department\'s website or visit the local Sub-Registrar\'s office for the latest rates.',
  },
];

import StampDutyWidget from '../../components/data-hub/StampDutyWidget';

const HOW_TO_STEPS = [
  {
    name: 'Select Your City',
    text: 'Choose the city or district where the property is located from the dropdown menu. Circle rates vary significantly between cities and even between localities within the same city.',
  },
  {
    name: 'Browse Localities',
    text: 'Browse through the list of localities in the selected city. Each locality has its own circle rate based on infrastructure, connectivity, and development status.',
  },
  {
    name: 'Check Rate Per Unit',
    text: 'View the circle rate per square foot or square meter for your selected locality. Note that rates differ for residential, commercial, and agricultural properties.',
  },
  {
    name: 'Calculate Stamp Duty',
    text: 'Use the circle rate to calculate your stamp duty obligation. Stamp duty is computed on the higher of the actual transaction value or the circle rate value.',
  },
];

const CircleRateDirectory = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [rates, setRates] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({ sector: '', property_type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sectors for dropdown
  useEffect(() => {
    dataHubService.getCircleRateSectors()
      .then(setSectors)
      .catch(() => {});
  }, []);

  // Fetch the first page (cursor=null) whenever filters change.
  useEffect(() => {
    // CRITICAL FIX (audit 3.9): reset error/loading at the start of every
    // fetch so a previous failure doesn't persist after a successful retry.
    setLoading(true);
    setError(null);
    dataHubService.getCircleRates({ ...filters, limit: 20 })
      .then((data) => {
        setRates(Array.isArray(data?.items) ? data.items : []);
        setNextCursor(data?.next_cursor ?? null);
        setHasMore(Boolean(data?.has_more));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters]);

  // Cursor "Load more": fetch the next page using the opaque cursor token.
  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await dataHubService.getCircleRates({ ...filters, limit: 20, cursor: nextCursor });
      const items = Array.isArray(data?.items) ? data.items : [];
      setRates(prev => [...prev, ...items]);
      setNextCursor(data?.next_cursor ?? null);
      setHasMore(Boolean(data?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setLoadingMore(false);
    }
  };

  const PROPERTY_TYPES = ['residential', 'commercial', 'plot', 'industrial'];

  return (
    <>
      <SEO
        title={tSeo('circleRateDirectory.title')}
        description={tSeo('circleRateDirectory.description')}
        keywords="Gurugram circle rates, DLC rates Gurugram, IGRS Haryana rates, stamp duty circle rate, sector wise circle rate Gurgaon 2026"
        canonical="/circle-rates"
        structuredData={[
          generateToolSchema(toolSchemas.circleRates),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Circle Rates', url: 'https://360ghar.com/circle-rates' },
          ]),
          {
            '@type': 'ItemList',
            name: 'Gurugram Circle Rates (DLC Rates)',
            description: 'Official circle rates for all sectors in Gurugram.',
            url: 'https://360ghar.com/circle-rates',
            numberOfItems: rates.length,
          },
          generateFaqStructuredData(FAQS),
          generateHowToStructuredData({
            name: 'How to Look Up Circle Rates in Haryana',
            description: 'Step-by-step guide to finding circle rates for your property and calculating stamp duty obligations.',
            steps: HOW_TO_STEPS,
          }),
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />
        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row">
              <div className="col-12">
                {/* AUDIT FIX (imp 3.19): consistent breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-20">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                    <li className="breadcrumb-item"><I18nLink to="/circle-rates">Data Hub</I18nLink></li>
                    <li className="breadcrumb-item active">Circle Rates</li>
                  </ol>
                </nav>
                <h1 className="fs-28 fw-600 mb-10">{t('circleRates.title')}</h1>
                <p className="mb-30 color-text-3">{t('circleRates.description')}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="row mb-20">
              <div className="col-md-4 col-sm-6 mb-10">
                <select className="form-select form-select-sm"
                  value={filters.sector}
                  onChange={(e) => { setFilters(f => ({ ...f, sector: e.target.value })); }}>
                  <option value="">{t('circleRates.allSectors')}</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-sm-6 mb-10">
                <select className="form-select form-select-sm"
                  value={filters.property_type}
                  onChange={(e) => { setFilters(f => ({ ...f, property_type: e.target.value })); }}>
                  <option value="">{t('circleRates.allPropertyTypes')}</option>
                  {PROPERTY_TYPES.map(pt => <option key={pt} value={pt} style={{ textTransform: 'capitalize' }}>{pt}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <p>{t('circleRates.loading')}</p>
            ) : error ? (
              <p className="color-danger">{t('circleRates.error')}</p>
            ) : (
              <>
                <p className="mb-15 fs-14 color-text-3">{t('circleRates.ratesFound', { count: rates.length })}</p>
                <div className="table-responsive mb-30">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>{t('circleRates.tableHeaders.sector')}</th>
                        <th>{t('circleRates.tableHeaders.colony')}</th>
                        <th>{t('circleRates.tableHeaders.propertyType')}</th>
                        <th>{t('circleRates.tableHeaders.ratePerSqYd')}</th>
                        <th>{t('circleRates.tableHeaders.ratePerSqFt')}</th>
                        <th>{t('circleRates.tableHeaders.year')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-20">{t('circleRates.noResults')}</td></tr>
                      ) : rates.map((rate) => (
                        <tr key={rate.id}>
                          <td>{rate.sector}</td>
                          <td>{rate.colony || '—'}</td>
                          <td style={{ textTransform: 'capitalize' }}>{rate.property_type}</td>
                          <td>{rate.rate_per_sqyd ? `₹${Number(rate.rate_per_sqyd).toLocaleString('en-IN')}` : '—'}</td>
                          <td>{rate.rate_per_sqft ? `₹${Number(rate.rate_per_sqft).toLocaleString('en-IN')}` : '—'}</td>
                          <td>{rate.revision_year}</td>
                          <td>
                            <I18nLink to={`/circle-rate/${rate.slug}`} className="btn-sm">{t('circleRates.tableHeaders.view')}</I18nLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Cursor-based Load more */}
                {hasMore && (
                  <div className="text-center mt-3">
                    <button
                      type="button"
                      className="btn btn-outline-main"
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                    >
                      {loadingMore ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                          Loading...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus me-1"></i> Load More
                        </>
                      )}
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Stamp Duty Widget */}
            <div className="row mt-20">
              <div className="col-lg-6">
                <h3 className="fs-20 fw-600 mb-15">{t('circleRates.quickCalc')}</h3>
                <StampDutyWidget />
              </div>
            </div>

            {/* AUDIT FIX (imp 3.12): historical circle rate trend (illustrative) */}
            <div className="mt-5">
              <h2 className="h4 mb-3">{t('circleRates.historicalTitle', 'Circle Rate Trend (Illustrative)')}</h2>
              <p className="text-muted small">{t('circleRates.historicalDesc', 'Indicative year-on-year movement of circle rates in prime Gurugram sectors. Actual rates vary by sector and property type; refer to the table above for current values.')}</p>
              {(() => {
                const trend = [
                  { year: '2021', index: 78 },
                  { year: '2022', index: 84 },
                  { year: '2023', index: 90 },
                  { year: '2024', index: 95 },
                  { year: '2025', index: 100 },
                  { year: '2026', index: 104 },
                ];
                return (
                  <div className="d-flex align-items-end gap-3" style={{ height: 160, padding: '0 8px' }}>
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

            {/* Educational Content Sections */}
            <div className="mt-5">
              <h2 className="h4 mb-3">What Are Circle Rates?</h2>
              <p>
                Circle rates, also known as ready reckoner rates or collector rates, are the <strong>minimum property
                valuation rates set by the state government</strong> for each locality, sector, and colony. These rates
                serve as the floor price for property registration and stamp duty calculations across Haryana.
              </p>
              <p>
                The primary purpose of circle rates is to <strong>prevent under-reporting of property transaction
                values</strong> and ensure fair collection of stamp duty revenue. When a property is registered, the
                stamp duty is calculated on whichever is higher — the actual transaction value or the applicable circle
                rate for that area.
              </p>
              <p className="mb-0">
                Circle rates are typically <strong>20–40% lower than actual market rates</strong> in most areas. In
                premium localities like DLF Phase 1–5 and Golf Course Road in Gurugram, the gap between circle rates
                and market rates can be even wider. This difference is an important factor for buyers to understand, as
                it directly affects stamp duty obligations, home loan eligibility, and capital gains tax calculations.
              </p>
            </div>

            <div className="mt-5">
              <h2 className="h4 mb-3">How Circle Rates Affect Property Buyers</h2>
              <div className="row g-4">
                <div className="col-md-6 col-lg-3">
                  <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                    <h3 className="h6 text-main">
                      <i className="fas fa-file-invoice-dollar me-2" />
                      Stamp Duty Calculation
                    </h3>
                    <p className="small mb-0">
                      Stamp duty is computed on the higher of the circle rate or the actual sale price. A higher circle
                      rate means higher stamp duty even if you negotiated a lower purchase price.
                    </p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                    <h3 className="h6 text-main">
                      <i className="fas fa-university me-2" />
                      Home Loan Eligibility
                    </h3>
                    <p className="small mb-0">
                      Banks use circle rates as a reference point when valuing a property for loan sanction. If the
                      circle rate is significantly below the market rate, the sanctioned loan amount may be lower than
                      expected.
                    </p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                    <h3 className="h6 text-main">
                      <i className="fas fa-chart-line me-2" />
                      Capital Gains Tax
                    </h3>
                    <p className="small mb-0">
                      Under Section 50C of the Income Tax Act, if a property is sold below the circle rate, the
                      difference is treated as income for the seller. Buyers should be aware of this when negotiating
                      below-circle-rate deals.
                    </p>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                    <h3 className="h6 text-main">
                      <i className="fas fa-receipt me-2" />
                      Registration Fees
                    </h3>
                    <p className="small mb-0">
                      Registration charges are also calculated based on the higher of the circle rate or transaction
                      value. This adds to the total acquisition cost of the property beyond just the purchase price.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <h2 className="h4 mb-3">Circle Rate Trends in Haryana (2024–2026)</h2>
              <p>
                Circle rates across Haryana have followed a <strong>general upward trend in urban areas</strong> over
                the past few years, reflecting infrastructure development, metro expansion, and growing demand for
                residential and commercial properties.
              </p>
              <p>
                In <strong>Gurugram, premium localities such as DLF Phase 1–5, Golf Course Road, and Cyber City</strong> command
                the highest circle rates in the state. These areas have seen consistent rate increases driven by
                proximity to commercial hubs, high-quality social infrastructure, and strong resale demand.
              </p>
              <p>
                <strong>Emerging areas like New Gurugram (Sectors 76–95), Dwarka Expressway, and Southern Peripheral
                Road</strong> have experienced faster rate increases in percentage terms as infrastructure catches up
                with development. Buyers looking for appreciation potential often target these zones.
              </p>
              <p className="mb-0">
                The Haryana government may <strong>temporarily freeze or moderate circle rate increases</strong> during
                economic downturns or to stimulate real estate activity. For instance, during the post-pandemic period,
                several states kept rates unchanged to encourage property transactions. Always check the latest gazette
                notification for the most current rates before making a purchase decision.
              </p>
            </div>

            <ToolFaq faqs={FAQS} heading="Circle Rate FAQs" />

            <ToolRelatedLinks
              heading="Related Tools"
              links={[
                { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-file-invoice-dollar' },
                { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                { to: '/loan-eligibility-calculator', label: 'Loan Eligibility', icon: 'fas fa-clipboard-check' },
              ]}
            />
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default CircleRateDirectory;
