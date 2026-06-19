import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import { dataHubService } from '../../services/dataHubService';

const LAND_USE_COLORS = {
  residential: { bg: '#198754' },
  commercial:  { bg: '#0d6efd' },
  mixed:       { bg: '#6f42c1' },
  industrial:  { bg: '#fd7e14' },
  institutional: { bg: '#0dcaf0' },
};

const PAGE_SIZE = 12;
const COLONY_PAGE_SIZE = 10;

const FAQS = [
  {
    question: 'What is CLU in Gurugram?',
    answer: 'CLU stands for Change of Land Use. It is an approval from the Town and Country Planning Department, Haryana, that allows conversion of land from one use (e.g., agricultural) to another (e.g., residential or commercial). Without CLU approval, you cannot legally develop or construct on land that is zoned differently from your intended use. CLU applications involve fees, documentation, and compliance with the Master Plan.',
  },
  {
    question: 'Can I convert residential property to commercial in Gurugram?',
    answer: 'Yes, but you need CLU approval from the Department of Town and Country Planning (DTCP), Haryana. The process involves submitting an application with the current property documents, proposed commercial use details, and applicable fees. Approval depends on the Master Plan zoning of the area. Properties on designated commercial belts or mixed-use zones have a higher chance of approval. Conversion in purely residential zones is typically denied.',
  },
  {
    question: 'How do I check the zoning status of a property in Gurugram?',
    answer: 'You can check zoning status through the Haryana DTCP portal or by visiting the DTCP office in Gurugram. The Master Plan 2031 (and the upcoming Master Plan 2041) classifies all sectors into zones like residential, commercial, industrial, and institutional. You can also use our Zone Checker tool above to look up land use, FAR, and height restrictions for specific sectors.',
  },
  {
    question: 'What is MCG approval and is it different from DTCP?',
    answer: 'MCG (Municipal Corporation of Gurugram) approval is required for building plan sanctions, occupation certificates, and property tax within MCG limits. DTCP (Department of Town and Country Planning) handles land use zoning and CLU approvals. They are separate authorities. For most construction projects, you need both DTCP zoning clearance and MCG building plan approval. Licensed colonies get DTCP approval, while MCG handles infrastructure and civic permissions.',
  },
  {
    question: 'What is the difference between R-zone and S-zone in Haryana?',
    answer: 'In Haryana zoning terminology, R-zone (Residential zone) designates areas primarily for residential development, including plotted housing, group housing, and mixed-use along designated commercial belts. S-zone (Special zone) typically refers to areas with special development regulations, often near SEZs, industrial corridors, or areas requiring environmental clearances. S-zone may allow mixed development but with stricter density and height controls. Always verify the specific development norms for your zone with DTCP.',
  },
];

const LandUseBadge = ({ landUse, t }) => {
  const key = landUse?.toLowerCase() || 'unknown';
  const config = LAND_USE_COLORS[key] || { bg: '#6c757d' };
  return (
    <span
      style={{ background: config.bg, color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}
    >
      {t(`zoneChecker.landUse.${key}`)}
    </span>
  );
};

const StatusBadge = ({ status }) => {
  const s = (status || '').toLowerCase();
  let bg = '#6c757d';
  if (s === 'approved') bg = '#198754';
  else if (s === 'pending') bg = '#ffc107';
  else if (s === 'rejected') bg = '#dc3545';
  return (
    <span style={{ background: bg, color: s === 'pending' ? '#000' : '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </span>
  );
};

const ZoneChecker = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [zones, setZones] = useState([]);
  const [zoneNextCursor, setZoneNextCursor] = useState(null);
  const [zoneHasMore, setZoneHasMore] = useState(false);
  const [zoneLoadingMore, setZoneLoadingMore] = useState(false);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const [colonies, setColonies] = useState([]);
  const [colonyNextCursor, setColonyNextCursor] = useState(null);
  const [colonyHasMore, setColonyHasMore] = useState(false);
  const [colonyLoadingMore, setColonyLoadingMore] = useState(false);
  const [coloniesLoading, setColoniesLoading] = useState(true);
  const [coloniesError, setColoniesError] = useState(false);

  // AUDIT FIX (imp 3.16): FAR calculator inputs (plot size + FAR -> buildable area).
  const [farPlotSize, setFarPlotSize] = useState(2000);
  const [farValue, setFarValue] = useState(1.75);
  const farBuildable = useMemo(() => Math.round(farPlotSize * farValue), [farPlotSize, farValue]);

  // Debounce search input — resets the zone list to the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch zoning data — first page (cursor=null) whenever the debounced
  // search changes. Replaces the list and resets cursor state.
  useEffect(() => {
    setZonesLoading(true);
    setZonesError(false);
    dataHubService
      .getZoningData({ search: debouncedSearch, limit: PAGE_SIZE })
      .then((res) => {
        setZones(Array.isArray(res?.items) ? res.items : []);
        setZoneNextCursor(res?.next_cursor ?? null);
        setZoneHasMore(Boolean(res?.has_more));
      })
      .catch(() => setZonesError(true))
      .finally(() => setZonesLoading(false));
  }, [debouncedSearch]);

  // Cursor "Load more" for zones.
  const handleLoadMoreZones = async () => {
    if (!zoneHasMore || !zoneNextCursor || zoneLoadingMore) return;
    setZoneLoadingMore(true);
    try {
      const res = await dataHubService.getZoningData({ search: debouncedSearch, limit: PAGE_SIZE, cursor: zoneNextCursor });
      const items = Array.isArray(res?.items) ? res.items : [];
      setZones(prev => [...prev, ...items]);
      setZoneNextCursor(res?.next_cursor ?? null);
      setZoneHasMore(Boolean(res?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setZoneLoadingMore(false);
    }
  };

  // Fetch colony approvals — first page on mount.
  useEffect(() => {
    setColoniesLoading(true);
    setColoniesError(false);
    dataHubService
      .getColonyApprovals({ limit: COLONY_PAGE_SIZE })
      .then((res) => {
        setColonies(Array.isArray(res?.items) ? res.items : []);
        setColonyNextCursor(res?.next_cursor ?? null);
        setColonyHasMore(Boolean(res?.has_more));
      })
      .catch(() => setColoniesError(true))
      .finally(() => setColoniesLoading(false));
  }, []);

  // Cursor "Load more" for colonies.
  const handleLoadMoreColonies = async () => {
    if (!colonyHasMore || !colonyNextCursor || colonyLoadingMore) return;
    setColonyLoadingMore(true);
    try {
      const res = await dataHubService.getColonyApprovals({ limit: COLONY_PAGE_SIZE, cursor: colonyNextCursor });
      const items = Array.isArray(res?.items) ? res.items : [];
      setColonies(prev => [...prev, ...items]);
      setColonyNextCursor(res?.next_cursor ?? null);
      setColonyHasMore(Boolean(res?.has_more));
    } catch {
      // Silently ignore; user can retry via Load More.
    } finally {
      setColonyLoadingMore(false);
    }
  };

  return (
    <>
      <SEO
        title={tSeo('zoneChecker.title')}
        description={tSeo('zoneChecker.description')}
        keywords="zone checker Gurugram, land use Gurugram, FAR Gurgaon, Master Plan Haryana, sector zoning Gurugram, residential commercial zone"
        canonical="/zone-checker"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Zone Checker', url: 'https://360ghar.com/zone-checker' },
          ]),
          {
            '@type': 'SoftwareApplication',
            name: 'Zone Checker Gurugram',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web Browser',
            offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
            description: 'Check zoning regulations for Gurugram sectors. View land use classification, FAR, maximum height, and setback rules from Haryana Master Plan.',
            keywords: 'zone checker Gurugram, land use Gurugram, FAR Gurgaon, Master Plan Haryana',
            author: { '@type': 'Organization', name: '360Ghar' },
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
            {/* Page heading */}
            <div className="row mb-30">
              <div className="col-12">
                {/* AUDIT FIX (imp 3.19): consistent breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-20">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                    <li className="breadcrumb-item"><I18nLink to="/zone-checker">Data Hub</I18nLink></li>
                    <li className="breadcrumb-item active">Zone Checker</li>
                  </ol>
                </nav>
                <h1 className="fs-28 fw-600 mb-10">{t('zoneChecker.title')}</h1>
                <p className="color-text-3 mb-20">
                  {t('zoneChecker.description')}
                </p>

                {/* Search */}
                {/* AUDIT FIX (3.13): make the clear button wrap cleanly on mobile */}
                <div className="col-lg-4 col-md-6 ps-0">
                  <div className="input-group zone-checker-search-group" style={{ flexWrap: 'nowrap' }}>
                    <span className="input-group-text bg-white">
                      <i className="fas fa-search color-text-3"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder={t('zoneChecker.searchPlaceholder')}
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className="btn btn-outline-secondary zone-checker-clear-btn" type="button" onClick={() => setSearch('')} aria-label="Clear search" style={{ flexShrink: 0 }}>
                        <i className="fas fa-times"></i>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Zone Cards Grid */}
            {zonesLoading ? (
              <div className="text-center py-50">
                <div className="spinner-border text-main" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
                <p className="mt-10 color-text-3">{t('zoneChecker.loading')}</p>
              </div>
            ) : zonesError ? (
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                {t('zoneChecker.error')}
              </div>
            ) : zones.length === 0 ? (
              <div className="text-center py-40">
                <i className="fas fa-map-marked-alt fs-40 color-text-3 mb-15"></i>
                <p className="color-text-3">{t('zoneChecker.noZones', { search: debouncedSearch ? t('zoneChecker.noZonesSearch', { search: debouncedSearch }) : '' })}</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">{t('zoneChecker.zonesFound', { count: zones.length, suffix: zones.length !== 1 ? 's' : '' })}</p>
                <div className="row g-3 mb-30">
                  {zones.map((zone) => (
                    <div key={zone.id || zone.slug} className="col-lg-4 col-md-6 col-12">
                      <div className="bg-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-10">
                          <h3 className="fs-16 fw-600 mb-0">{zone.sector_name || zone.sector}</h3>
                          <LandUseBadge landUse={zone.primary_land_use || zone.land_use} t={t} />
                        </div>
                        <div className="row g-2 mt-auto">
                          <div className="col-6">
                            <div className="bg-light rounded-2 p-2 text-center">
                              <div className="fs-18 fw-700 color-text-1">
                                {zone.far != null ? zone.far : '—'}
                              </div>
                              <div className="fs-12 color-text-3">{t('zoneChecker.far')}</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-light rounded-2 p-2 text-center">
                              <div className="fs-18 fw-700 color-text-1">
                                {zone.max_height != null ? `${zone.max_height}m` : '—'}
                              </div>
                              <div className="fs-12 color-text-3">{t('zoneChecker.maxHeight')}</div>
                            </div>
                          </div>
                        </div>
                        <I18nLink
                          to={`/zone-checker/${zone.slug}`}
                          className="btn btn-sm btn-outline-main mt-15 align-self-start"
                        >
                          {t('zoneChecker.viewDetails')} <i className="fas fa-arrow-right ms-1"></i>
                        </I18nLink>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cursor-based Load more */}
                {zoneHasMore && (
                  <div className="text-center mb-30">
                    <button
                      type="button"
                      className="btn btn-sm btn-outline-main"
                      onClick={handleLoadMoreZones}
                      disabled={zoneLoadingMore}
                    >
                      {zoneLoadingMore ? (
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

            {/* Colony Approvals Section */}
            <div className="row mt-20">
              <div className="col-12">
                <h2 className="fs-22 fw-600 mb-5">{t('zoneChecker.colonyApprovals')}</h2>
                <p className="color-text-3 mb-20">{t('zoneChecker.colonyApprovalsDesc')}</p>

                {coloniesLoading ? (
                  <p className="color-text-3">{t('zoneChecker.colonyLoading')}</p>
                ) : coloniesError ? (
                  <div className="alert alert-warning" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    {t('zoneChecker.colonyError')}
                  </div>
                ) : colonies.length === 0 ? (
                  <p className="color-text-3">{t('zoneChecker.noColonyData')}</p>
                ) : (
                  <>
                    <div className="table-responsive mb-15">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>{t('zoneChecker.colonyTableHeaders.colonyName')}</th>
                            <th>{t('zoneChecker.colonyTableHeaders.licenceNumber')}</th>
                            <th>{t('zoneChecker.colonyTableHeaders.status')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {colonies.map((colony) => (
                            <tr key={colony.id || colony.licence_number}>
                              <td>{colony.colony_name || colony.name || '—'}</td>
                              <td>{colony.licence_number || colony.license_number || '—'}</td>
                              <td><StatusBadge status={colony.status} /></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Colony Load more */}
                    {colonyHasMore && (
                      <div className="text-center">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-main"
                          onClick={handleLoadMoreColonies}
                          disabled={colonyLoadingMore}
                        >
                          {colonyLoadingMore ? (
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
            </div>
          </div>
        </section>

        {/* AUDIT FIX (imp 3.16): FAR calculator */}
        <section className="pb-60">
          <div className="container">
            <div className="bg-white p-4 rounded-3 shadow-sm">
              <h2 className="fs-22 fw-600 mb-10">{t('zoneChecker.farCalcTitle', 'FAR Calculator')}</h2>
              <p className="color-text-3 mb-20">{t('zoneChecker.farCalcDesc', 'Estimate the maximum buildable area from your plot size and the applicable Floor Area Ratio (FAR).')}</p>
              <div className="row g-3 align-items-end">
                <div className="col-md-4">
                  <label className="form-label small">{t('zoneChecker.plotSize', 'Plot Size (sq ft)')}</label>
                  <input type="number" className="form-control" min="0" value={farPlotSize} onChange={(e) => setFarPlotSize(Math.max(0, Number(e.target.value)))} />
                </div>
                <div className="col-md-4">
                  <label className="form-label small">FAR</label>
                  <input type="number" className="form-control" min="0" step="0.05" value={farValue} onChange={(e) => setFarValue(Math.max(0, Number(e.target.value)))} />
                </div>
                <div className="col-md-4">
                  <div className="p-3 bg-light rounded-2 text-center h-100">
                    <small className="color-text-3 d-block">{t('zoneChecker.maxBuildable', 'Max Buildable Area')}</small>
                    <span className="fw-bold text-main fs-4">{farBuildable.toLocaleString('en-IN')} sq ft</span>
                  </div>
                </div>
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

        <Footer />
      </main>
    </>
  );
};

export default ZoneChecker;
