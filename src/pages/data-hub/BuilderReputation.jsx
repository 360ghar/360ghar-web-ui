import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import ScoreWheel from '../../components/data-hub/ScoreWheel';
import { dataHubService } from '../../services/dataHubService';

const PAGE_LIMIT = 20;

const FAQS = [
  {
    question: 'What is a good builder reputation score?',
    answer: 'A builder reputation score of 70 or above is considered good. This indicates the builder has a strong track record with HRERA-registered projects, minimal complaints, and timely delivery. Scores between 40 and 69 are average, suggesting some concerns around project delivery or complaints. Scores below 40 indicate poor reputation with multiple pending complaints or regulatory violations.',
  },
  {
    question: 'How is the builder reputation score calculated?',
    answer: 'The builder reputation score is calculated using data from HRERA (Haryana Real Estate Regulatory Authority) records. Key factors include the number of RERA-registered projects, complaint history, project completion status, on-time delivery record, and any penalties or regulatory actions. The scoring algorithm weights recent data more heavily to reflect current performance.',
  },
  {
    question: 'Why is it important to check a builder\'s reputation before buying?',
    answer: 'Checking a builder\'s reputation helps you avoid investing with developers who have a history of project delays, legal disputes, or poor construction quality. In Gurugram, where numerous projects have been delayed by years, a reputation check can save you from significant financial risk and emotional distress. It also helps you negotiate better terms with reputable builders.',
  },
  {
    question: 'What does RERA compliance mean for a builder?',
    answer: 'RERA compliance means the builder has registered all applicable projects with the Haryana Real Estate Regulatory Authority (HRERA) and follows the rules set by RERA. This includes maintaining a separate escrow account for each project (70% of funds), submitting quarterly updates on project progress, and adhering to the approved building plans. Non-compliance can result in penalties, project deregistration, or imprisonment.',
  },
  {
    question: 'How do I file a complaint against a builder in Haryana?',
    answer: 'You can file a complaint with HRERA through their official website (hrera.org.in) or by visiting the HRERA office in Panchkula or Gurugram. You need to fill out the complaint form, pay the prescribed fee (currently Rs. 1,000), and provide supporting documents like the allotment letter, payment receipts, and evidence of the grievance. HRERA typically disposes of complaints within 60 days.',
  },
];

// UX FIX (audit 3.15): removed the duplicate module-level SORT_OPTIONS; the
// component-level declaration below (inside BuilderReputation) is the one
// actually used and is i18n-aware.

const scoreColor = (score) => {
  if (score >= 70) return '#22c55e';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
};

const scoreBadgeStyle = (score) => ({
  background: score >= 70 ? '#dcfce7' : score >= 40 ? '#fef3c7' : '#fee2e2',
  color: scoreColor(score),
  padding: '3px 10px',
  borderRadius: 6,
  fontWeight: 700,
  fontSize: 14,
  display: 'inline-block',
  minWidth: 44,
  textAlign: 'center',
});

const BuilderReputation = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [builders, setBuilders] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const SORT_OPTIONS = [
    { value: 'score_desc', label: t('builderReputation.sortOptions.scoreDesc') },
    { value: 'name_asc', label: t('builderReputation.sortOptions.nameAsc') },
    { value: 'projects_desc', label: t('builderReputation.sortOptions.projectsDesc') },
    { value: 'complaints_desc', label: t('builderReputation.sortOptions.complaintsDesc') },
  ];

  // Fetch the first page (cursor=null) whenever search/sort changes.
  useEffect(() => {
    // CRITICAL FIX (audit 3.10): reset error/loading at the start of every
    // fetch so a previous failure doesn't persist after a successful retry.
    setLoading(true);
    setError(null);
    dataHubService.getBuilders({ search, sort_by: sortBy, limit: PAGE_LIMIT })
      .then((data) => {
        setBuilders(Array.isArray(data?.items) ? data.items : []);
        setNextCursor(data?.next_cursor ?? null);
        setHasMore(Boolean(data?.has_more));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, sortBy]);

  // Cursor "Load more": fetch the next page using the opaque cursor token.
  const handleLoadMore = async () => {
    if (!hasMore || !nextCursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const data = await dataHubService.getBuilders({ search, sort_by: sortBy, limit: PAGE_LIMIT, cursor: nextCursor });
      const items = Array.isArray(data?.items) ? data.items : [];
      setBuilders(prev => [...prev, ...items]);
      setNextCursor(data?.next_cursor ?? null);
      setHasMore(Boolean(data?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
  };

  return (
    <>
      <SEO
        title={tSeo('builderReputation.title')}
        description={tSeo('builderReputation.description')}
        keywords="builder reputation Gurugram, RERA score builder, Gurgaon developer complaints, HRERA builder check, builder score checker, reliable builders Gurgaon 360Ghar"
        canonical="/builder-reputation"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Builder Reputation', url: 'https://360ghar.com/builder-reputation' },
          ]),
          {
            '@type': 'ItemList',
            name: 'Builder Reputation Directory — Gurugram',
            description: 'Builder reputation scores based on HRERA registered projects and complaints.',
            url: 'https://360ghar.com/builder-reputation',
            numberOfItems: builders.length,
          },
          generateFaqStructuredData(FAQS),
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row mb-20">
              <div className="col-12">
                {/* AUDIT FIX (imp 3.19): consistent breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-20">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                    <li className="breadcrumb-item"><I18nLink to="/builder-reputation">Data Hub</I18nLink></li>
                    <li className="breadcrumb-item active">Builder Reputation</li>
                  </ol>
                  <a href="/builder-reputation-score">Builder Reputation Score</a>
                  <a href="/tenant-demand-heatmap">Tenant Demand Heatmap</a>
                </nav>
                <h1 className="fs-28 fw-600 mb-10">{t('builderReputation.title')}</h1>
                <p className="mb-0 color-text-3">
                  {t('builderReputation.description')}
                </p>
              </div>
            </div>

            {/* Search + Sort */}
            <div className="row mb-20 g-2 align-items-end">
              <div className="col-md-6 col-sm-12">
                <form onSubmit={handleSearchSubmit} className="d-flex gap-10">
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder={t('builderReputation.searchPlaceholder')}
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-main btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    {t('builderReputation.search')}
                  </button>
                </form>
              </div>
              <div className="col-md-4 col-sm-6">
                <select
                  className="form-select form-select-sm"
                  value={sortBy}
                  onChange={(e) => handleSortChange(e.target.value)}
                >
                  {SORT_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Score legend */}
            <div className="row mb-20">
              <div className="col-12">
                <div className="d-flex gap-20 flex-wrap" style={{ fontSize: 12, color: '#6b7280' }}>
                  <span>{t('builderReputation.scoreLegend.good')}</span>
                  <span>{t('builderReputation.scoreLegend.average')}</span>
                  <span>{t('builderReputation.scoreLegend.poor')}</span>
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="row g-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="col-lg-4 col-md-6 col-12">
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, background: '#fff' }}>
                      <div style={{ height: 16, background: '#e5e7eb', borderRadius: 4, marginBottom: 12, width: '70%' }}></div>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 8, width: '50%' }}></div>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '40%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-40">
                <p className="color-danger fs-16">{t('builderReputation.error')}</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">
                  {t('builderReputation.buildersFound', { count: builders.length, suffix: builders.length !== 1 ? 's' : '' })}
                </p>

                {builders.length === 0 ? (
                  <div className="text-center py-40">
                    <p className="fs-16 color-text-3">{t('builderReputation.noBuilders', { search: search ? t('builderReputation.noBuildersSearch', { search }) : '' })}</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="d-none d-md-block mb-30">
                      <div className="table-responsive">
                        <table className="table table-bordered" style={{ fontSize: 14 }}>
                          <thead className="table-light">
                            <tr>
                              <th>{t('builderReputation.tableHeaders.builderName')}</th>
                              <th className="text-center">{t('builderReputation.tableHeaders.projects')}</th>
                              <th className="text-center">{t('builderReputation.tableHeaders.complaints')}</th>
                              <th className="text-center">{t('builderReputation.tableHeaders.score')}</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {builders.map((builder) => {
                              const score = Math.round(builder.score ?? 0);
                              return (
                                <tr key={builder.slug || builder.id}>
                                  <td>
                                    <I18nLink
                                      to={`/builder-reputation/${builder.slug}`}
                                      style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}
                                    >
                                      {builder.name || t('builderReputation.unknownBuilder')}
                                    </I18nLink>
                                  </td>
                                  <td className="text-center">{builder.total_projects ?? '—'}</td>
                                  <td className="text-center">{builder.total_complaints ?? '—'}</td>
                                  <td className="text-center">
                                    <span style={scoreBadgeStyle(score)}>{score}</span>
                                  </td>
                                  <td>
                                    <I18nLink
                                      to={`/builder-reputation/${builder.slug}`}
                                      className="btn btn-sm btn-outline-secondary"
                                    >
                                      {t('builderReputation.viewProfile')}
                                    </I18nLink>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Mobile Card Grid */}
                    <div className="d-md-none row g-3 mb-30">
                      {builders.map((builder) => {
                        const score = Math.round(builder.score ?? 0);
                        return (
                          <div key={builder.slug || builder.id} className="col-12">
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
                              <div className="d-flex justify-content-between align-items-center mb-10">
                                <I18nLink
                                  to={`/builder-reputation/${builder.slug}`}
                                  style={{ fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' }}
                                >
                                  {builder.name || t('builderReputation.unknownBuilder')}
                                </I18nLink>
                                <ScoreWheel score={score} size={52} label="" />
                              </div>
                              <div className="d-flex gap-20">
                                <div>
                                  <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>{t('builderReputation.mobileLabels.projects')}</span>
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{builder.total_projects ?? '—'}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>{t('builderReputation.mobileLabels.complaints')}</span>
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{builder.total_complaints ?? '—'}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

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

            {/* Disclaimer */}
            <div className="row mt-30">
              <div className="col-12">
                <p style={{ fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  {t('builderReputation.disclaimer')}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-60">
          <div className="container">
            <h2 className="fs-24 fw-600 mb-20">Frequently Asked Questions</h2>
            <div className="accordion">
              {FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div className="accordion-item border-0 border-bottom" key={faq.question}>
                    <h3 className="accordion-header" id={`dhFaqHeading${idx}`}>
                      <button className={`accordion-button ${isOpen ? '' : 'collapsed'}`} type="button" aria-expanded={isOpen} onClick={() => setOpenFaqIndex(cur => cur === idx ? -1 : idx)}>{faq.question}</button>
                    </h3>
                    <div className={`accordion-collapse collapse ${isOpen ? 'show' : ''}`}><div className="accordion-body text-muted">{faq.answer}</div></div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">{t('builderReputation.cta.title')}</h2>
                <p className="mb-4">{t('builderReputation.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <I18nLink to="/properties" className="btn btn-white btn-main">{t('builderReputation.cta.browseProperties')}</I18nLink>
                  <I18nLink to="/contact" className="btn btn-outline-white">{t('builderReputation.cta.contactUs')}</I18nLink>
                  <a href="/best-sectors-investment-2026">Investment Guide 2026</a>
                  <a href="/tenant-demand-heatmap">Tenant Demand Heatmap</a>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default BuilderReputation;
