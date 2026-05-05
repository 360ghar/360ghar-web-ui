import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import Pagination from '../../common/ui/Pagination';
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
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ search: '', status: '', property_type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  // RERA Verify widget state
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState(null); // null | { found: bool, project: object }
  const [verifying, setVerifying] = useState(false);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  useEffect(() => {
    const params = { page, limit: PAGE_LIMIT };
    if (filters.search) params.q = filters.search;
    if (filters.status) params.status = filters.status;
    if (filters.property_type) params.property_type = filters.property_type;

    dataHubService.getReraProjects(params)
      .then((data) => {
        setProjects(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setPage(1);
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
        title="RERA Projects Gurugram | Verified Builders | 360Ghar"
        description="Browse all RERA-registered real estate projects in Gurugram. Verify project registration numbers, check developer details, possession dates, and project status."
        keywords="RERA projects Gurugram, HRERA registered projects, builder RERA number, Haryana RERA, verified developers Gurgaon"
        canonical="/rera-projects"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'RERA Projects', url: 'https://360ghar.com/rera-projects' },
          ]),
          {
            '@type': 'ItemList',
            name: 'RERA Projects Gurugram',
            description: 'RERA-registered real estate projects in Gurugram.',
            url: 'https://360ghar.com/rera-projects',
            numberOfItems: total,
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
                <p className="mb-20 fs-14 color-text-3">{t('rera.projectsFound', { count: total, suffix: total !== 1 ? 's' : '' })}</p>
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

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
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
                <h2 className="cta-title mb-3">{t('rera.cta.title')}</h2>
                <p className="mb-4">{t('rera.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/properties" className="btn btn-white btn-main">{t('rera.cta.browseProperties')}</a>
                  <a href="/contact" className="btn btn-outline-white">{t('rera.cta.contactUs')}</a>
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
