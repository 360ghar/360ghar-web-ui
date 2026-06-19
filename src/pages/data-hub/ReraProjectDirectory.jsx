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
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';
import { dataHubService } from '../../services/dataHubService';

const PROPERTY_TYPES = ['residential', 'commercial', 'mixed', 'plotted'];
const STATUS_OPTIONS = ['registered', 'expired', 'lapsed'];
const PAGE_LIMIT = 12;

const FAQS = [
  {
    question: 'Is RERA registration mandatory in Haryana?',
    answer: 'Yes, RERA registration is mandatory for all real estate projects in Haryana where the land area exceeds 500 square metres or the number of apartments exceeds 8. Even ongoing projects that have not received a completion certificate must register with HRERA. Projects by government authorities and those on very small plots are exempt, but these exemptions are narrow and must be verified.',
  },
  {
    question: 'Is it safe to buy a property that is not RERA registered?',
    answer: 'Buying a non-RERA registered project carries significant risk. Unregistered projects may lack the consumer protections that RERA provides, such as escrow accounts (70% of funds) for construction, mandatory quarterly progress updates, and access to the RERA complaint mechanism. If a project should be registered but is not, the developer may face penalties, and buyers could face difficulties with delivery timelines and quality.',
  },
  {
    question: 'How can I verify a RERA project in Haryana?',
    answer: 'You can verify a RERA project on the HRERA website (hrera.org.in) by searching the project name or registration number. Check that the registration number format matches the official pattern (e.g., HRERA-PKL-GGM-XXXX-XXX). You can also use our Quick RERA Verify tool above to instantly check any registration number. Always cross-verify the project status, developer details, and possession dates on the HRERA portal.',
  },
  {
    question: 'What rights do buyers have under RERA in Haryana?',
    answer: 'Under RERA, buyers have the right to: (1) Receive possession as per the agreement date, with compensation for delays. (2) Access project information including sanctioned plans, approvals, and quarterly progress updates. (3) Claim refund with interest if the developer fails to deliver. (4) File complaints with HRERA for any violation, with disputes resolved within 60 days. (5) 5-year structural defect warranty from the developer.',
  },
  {
    question: 'How do I file a RERA complaint in Haryana?',
    answer: 'File a complaint on the HRERA website (hrera.org.in) by registering as a complainant, filling out the complaint form, paying the fee (Rs. 1,000 for individuals), and uploading supporting documents (allotment letter, payment receipts, communication with the developer). HRERA benches in Panchkula and Gurugram hear cases. The authority aims to dispose of complaints within 60 days of the hearing.',
  },
  {
    question: 'What is the difference between RERA and HRERA?',
    answer: 'RERA (Real Estate Regulatory Authority) is the central Act passed by Parliament in 2016. HRERA is the Haryana state implementation of RERA, with offices in Panchkula and Gurugram. HRERA enforces RERA provisions specifically for Haryana, including project registration, agent registration, and complaint resolution.',
  },
  {
    question: 'Can a RERA registered project still be delayed?',
    answer: 'Yes, RERA registration does not guarantee on-time delivery. However, RERA gives buyers strong protections: developers must pay interest for every month of delay, buyers can claim full refunds, and HRERA can impose penalties up to 10% of the project cost. The quarterly progress reporting requirement also increases transparency.',
  },
  {
    question: 'What is the RERA registration fee for developers in Haryana?',
    answer: 'In Haryana, the RERA registration fee for residential projects is Rs. 10 per square metre for projects up to 1,000 sq m, and Rs. 15 per square metre for larger projects. For commercial projects, the fee is Rs. 20 per square metre. The registration is valid for 5 years or until the project completion certificate is issued, whichever is earlier.',
  },
  {
    question: 'What happens when a RERA registration expires?',
    answer: 'When a RERA registration expires, the developer cannot legally sell or market units in that project. Buyers should verify that the registration is active before making any payment. If a project\'s registration has expired, the developer must apply for renewal with HRERA, providing updated project details and compliance documents. Buying from an expired-registration project offers no RERA protections.',
  },
];

const HOW_TO_STEPS = [
  { name: 'Search for a Project', text: 'Use the search bar to find a specific project by name, developer, or RERA registration number. You can also filter by property type (residential, commercial, mixed) and registration status.' },
  { name: 'Verify RERA Registration', text: 'Use the Quick RERA Verify tool to instantly check if a registration number is valid. Cross-verify the number format (e.g., HRERA-PKL-GGM-XXXX-XXX) and check the project status on the official HRERA portal.' },
  { name: 'Review Project Details', text: 'Check the project card for key information: developer name, total units, possession date, and registration status. Registered projects are marked with a green badge for easy identification.' },
  { name: 'File a Complaint if Needed', text: 'If you encounter issues with a RERA-registered project, file a complaint on hrera.org.in. Pay the Rs. 1,000 fee, upload supporting documents, and HRERA aims to resolve disputes within 60 days.' },
];

const statusBadgeStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'registered' || s === 'active') {
    return { background: '#dcfce7', color: '#166534', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 };
  }
  if (s === 'expired' || s === 'lapsed') {
    return { background: '#fee2e2', color: '#991b1b', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 };
  }
  return { background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: 4, fontSize: 12, fontWeight: 600 };
};

const ReraProjectDirectory = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [projects, setProjects] = useState([]);
  const [nextCursor, setNextCursor] = useState(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filters, setFilters] = useState({ search: '', status: '', property_type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // RERA Verify widget state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // null | { found: bool, project: object }
  const [verifying, setVerifying] = useState(false);

  // Fetch the first page (cursor=null) whenever filters change. Replaces the
  // list and resets cursor state.
  useEffect(() => {
    const params = { limit: PAGE_LIMIT };
    if (filters.search) params.q = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.property_type) params.property_type = filters.property_type;

    setLoading(true);
    setError(null);
    dataHubService.getReraProjects(params)
      .then((data) => {
        setProjects(Array.isArray(data?.items) ? data.items : []);
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
      const params = { limit: PAGE_LIMIT, cursor: nextCursor };
      if (filters.search) params.q = filters.search;
      if (filters.status) params.status = filters.status;
      if (filters.property_type) params.property_type = filters.property_type;
      const data = await dataHubService.getReraProjects(params);
      const items = Array.isArray(data?.items) ? data.items : [];
      setProjects(prev => [...prev, ...items]);
      setNextCursor(data?.next_cursor ?? null);
      setHasMore(Boolean(data?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setLoadingMore(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  const handleVerify = async () => {
    const num = verifyInput.trim();
    if (!num) return;
    setVerifying(true);
    setVerifyResult(null);
    try {
      const data = await dataHubService.verifyRera(num);
      setVerifyResult({ found: data.valid === true, project: data });
    } catch {
      setVerifyResult({ found: false, project: null });
    } finally {
      setVerifying(false);
    }
  };

  return (
    <>
      <SEO
        title={tSeo('reraProjectDirectory.title')}
        description={tSeo('reraProjectDirectory.description')}
        keywords="RERA projects Gurugram, HRERA registered projects, builder RERA number, Haryana RERA, verified developers Gurgaon"
        canonical="/rera-projects"
        structuredData={[
          generateToolSchema(toolSchemas.reraProjects),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'RERA Projects', url: 'https://360ghar.com/rera-projects' },
          ]),
          {
            '@type': 'ItemList',
            name: 'RERA Projects Gurugram',
            description: 'RERA-registered real estate projects in Gurugram.',
            url: 'https://360ghar.com/rera-projects',
            numberOfItems: projects.length,
          },
          generateFaqStructuredData(FAQS),
          generateHowToStructuredData({
            name: 'How to Verify RERA Projects in Haryana',
            description: 'Step-by-step guide to finding and verifying RERA registered projects in Haryana.',
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
            <div className="row mb-20">
              <div className="col-12">
                <h1 className="fs-28 fw-600 mb-10">{t('rera.title')}</h1>
                <p className="mb-0 color-text-3">
                  {t('rera.description')}
                </p>
              </div>
            </div>

            {/* RERA Verify Widget */}
            <div className="row mb-30">
              <div className="col-lg-8">
                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 10, padding: '20px 24px' }}>
                  <h3 className="fs-18 fw-600 mb-10">{t('rera.quickVerify')}</h3>
                  <p className="fs-14 color-text-3 mb-15">{t('rera.quickVerifyDesc')}</p>
                  <div className="d-flex gap-10 flex-wrap">
                    <input
                      type="text"
                      className="form-control"
                      style={{ maxWidth: 320 }}
                      placeholder={t('rera.placeholder')}
                      value={verifyInput}
                      onChange={(e) => { setVerifyInput(e.target.value); setVerifyResult(null); }}
                      onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    />
                    <button
                      className="btn btn-main"
                      onClick={handleVerify}
                      disabled={verifying || !verifyInput.trim()}
                    >
                      {verifying ? t('rera.verifying') : t('rera.verify')}
                    </button>
                  </div>
                  {verifyResult && (
                    <div style={{ marginTop: 14 }}>
                      {verifyResult.found ? (
                        <div style={{ background: '#dcfce7', border: '1px solid #86efac', borderRadius: 8, padding: '12px 16px' }}>
                          <p style={{ margin: 0, color: '#166534', fontWeight: 600, fontSize: 14 }}>
                            {t('rera.verified', { name: verifyResult.project?.project_name || t('rera.unnamedProject') })}
                          </p>
                          {verifyResult.project?.developer_name && (
                            <p style={{ margin: '4px 0 0', color: '#166534', fontSize: 13 }}>
                              {t('rera.developer', { name: verifyResult.project.developer_name })}
                            </p>
                          )}
                        </div>
                      ) : (
                        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 8, padding: '12px 16px' }}>
                          <p style={{ margin: 0, color: '#991b1b', fontWeight: 600, fontSize: 14 }}>
                            {t('rera.notFound')}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="row mb-20 g-2">
              <div className="col-md-5 col-sm-12">
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder={t('rera.searchPlaceholder')}
                  value={filters.search}
                  onChange={(e) => handleFilterChange('search', e.target.value)}
                />
              </div>
              <div className="col-md-3 col-sm-6">
                <select
                  className="form-select form-select-sm"
                  value={filters.status}
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                >
                  <option value="">{t('rera.allStatuses')}</option>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s} value={s} style={{ textTransform: 'capitalize' }}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-3 col-sm-6">
                <select
                  className="form-select form-select-sm"
                  value={filters.property_type}
                  onChange={(e) => handleFilterChange('property_type', e.target.value)}
                >
                  <option value="">{t('rera.allPropertyTypes')}</option>
                  {PROPERTY_TYPES.map(pt => (
                    <option key={pt} value={pt} style={{ textTransform: 'capitalize' }}>{pt.charAt(0).toUpperCase() + pt.slice(1)}</option>
                  ))}
                </select>
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
                <p className="color-danger fs-16">{t('rera.error')}</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">{t('rera.projectsFound', { count: projects.length, suffix: projects.length !== 1 ? 's' : '' })}</p>
                {projects.length === 0 ? (
                  <div className="text-center py-40">
                    <p className="fs-16 color-text-3">{t('rera.noResults')}</p>
                  </div>
                ) : (
                  <div className="row g-3 mb-30">
                    {projects.map((project) => (
                      <div key={project.id || project.rera_number} className="col-lg-4 col-md-6 col-12">
                        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, background: '#fff', height: '100%' }}>
                          <div className="d-flex justify-content-between align-items-start mb-10">
                            <span style={statusBadgeStyle(project.status)}>
                              {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : t('rera.unknown')}
                            </span>
                            {project.property_type && (
                              <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>{project.property_type}</span>
                            )}
                          </div>
                          <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#111827' }}>
                            {project.project_name || t('rera.unnamedProject')}
                          </h3>
                          {project.developer_name && (
                            <p style={{ margin: '0 0 10px', fontSize: 13, color: '#6b7280' }}>{project.developer_name}</p>
                          )}
                          {project.rera_number && (
                            <p style={{ margin: '0 0 10px', fontFamily: 'monospace', fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4, wordBreak: 'break-all' }}>
                              {project.rera_number}
                            </p>
                          )}
                          <div className="d-flex gap-20 flex-wrap">
                            {project.total_units != null && (
                              <div>
                                <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>{t('rera.units')}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{project.total_units}</span>
                              </div>
                            )}
                            {project.possession_date && (
                              <div>
                                <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>{t('rera.possession')}</span>
                                <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                                  {new Date(project.possession_date).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
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
          </div>
        </section>

        {/* Educational Content */}
        <section className="pb-60">
          <div className="container">
            <div className="row g-4">
              <div className="col-lg-4">
                <div className="p-4 bg-light rounded-3 border h-100">
                  <h2 className="h5 mb-3">Understanding RERA in India</h2>
                  <p className="fs-14 color-text-3 mb-2">
                    RERA (Real Estate Regulatory Authority) was enacted in 2016 to protect homebuyers and bring transparency to the real estate sector. It is mandatory for all projects exceeding 500 square metres or involving 8 or more apartments.
                  </p>
                  <ul className="fs-14 color-text-3 mb-0" style={{ paddingLeft: 18 }}>
                    <li className="mb-1">Developers must deposit 70% of collected funds in an escrow account dedicated to construction costs.</li>
                    <li className="mb-1">Quarterly progress updates on construction are mandatory and must be filed with the authority.</li>
                    <li className="mb-1">Developers provide a 5-year warranty on structural defects from the date of possession.</li>
                    <li>Registration can be revoked if the developer violates any RERA provisions.</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="p-4 bg-light rounded-3 border h-100">
                  <h2 className="h5 mb-3">How to Verify a RERA Registration Number</h2>
                  <p className="fs-14 color-text-3 mb-2">
                    Every RERA-registered project has a unique registration number following the format: HRERA-[CITY]-[DISTRICT]-[NUMBER]-[SEQUENCE].
                  </p>
                  <ol className="fs-14 color-text-3 mb-0" style={{ paddingLeft: 18 }}>
                    <li className="mb-1"><strong>Check the number format</strong> &mdash; ensure it matches the official HRERA pattern (e.g., HRERA-PKL-GGM-1234-567).</li>
                    <li className="mb-1"><strong>Search on hrera.org.in</strong> &mdash; enter the registration number in the official HRERA project search.</li>
                    <li className="mb-1"><strong>Verify developer details</strong> &mdash; confirm the developer name, address, and project details match what you have been told.</li>
                    <li><strong>Check project status</strong> &mdash; look for registered, expired, or lapsed status. Only registered projects are legally allowed to market and sell.</li>
                  </ol>
                </div>
              </div>
              <div className="col-lg-4">
                <div className="p-4 bg-light rounded-3 border h-100">
                  <h2 className="h5 mb-3">Buyer Rights Under RERA</h2>
                  <p className="fs-14 color-text-3 mb-2">
                    RERA grants homebuyers several important legal protections when dealing with registered projects.
                  </p>
                  <ul className="fs-14 color-text-3 mb-0" style={{ paddingLeft: 18 }}>
                    <li className="mb-1"><strong>Right to information</strong> &mdash; access to sanctioned plans, approvals, and quarterly construction progress reports.</li>
                    <li className="mb-1"><strong>Right to possession on time</strong> &mdash; compensation for every month of delay beyond the agreed date.</li>
                    <li className="mb-1"><strong>Right to refund with interest</strong> &mdash; claim a full refund if the developer fails to deliver.</li>
                    <li className="mb-1"><strong>Right to file complaints</strong> &mdash; disputes resolved by HRERA within 60 days of hearing.</li>
                    <li><strong>Right to 5-year warranty</strong> &mdash; structural defect warranty from the developer from the date of possession.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="pb-60">
          <div className="container">
            <ToolFaq faqs={FAQS} heading="RERA Project FAQs" />
          </div>
        </section>

        {/* Related Tools */}
        <section className="pb-60">
          <div className="container">
            <ToolRelatedLinks
              heading="Related Tools"
              links={[
                { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-file-invoice-dollar' },
                { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                { to: '/loan-eligibility-calculator', label: 'Loan Eligibility', icon: 'fas fa-clipboard-check' },
                { to: '/bank-auctions', label: 'Bank Auctions', icon: 'fas fa-gavel' },
              ]}
            />
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">{t('rera.cta.title')}</h2>
                <p className="mb-4">{t('rera.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <I18nLink to="/properties" className="btn btn-white btn-main">{t('rera.cta.browseProperties')}</I18nLink>
                  <I18nLink to="/contact" className="btn btn-outline-white">{t('rera.cta.contactUs')}</I18nLink>
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

export default ReraProjectDirectory;
