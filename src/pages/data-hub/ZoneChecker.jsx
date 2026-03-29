import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { dataHubService } from '../../services/dataHubService';

const LAND_USE_COLORS = {
  residential: { bg: '#198754', label: 'Residential' },
  commercial:  { bg: '#0d6efd', label: 'Commercial' },
  mixed:       { bg: '#6f42c1', label: 'Mixed Use' },
  industrial:  { bg: '#fd7e14', label: 'Industrial' },
  institutional: { bg: '#0dcaf0', label: 'Institutional' },
};

const PAGE_SIZE = 12;
const COLONY_PAGE_SIZE = 10;

const LandUseBadge = ({ landUse }) => {
  const config = LAND_USE_COLORS[landUse?.toLowerCase()] || { bg: '#6c757d', label: landUse || 'Unknown' };
  return (
    <span
      style={{ background: config.bg, color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600, display: 'inline-block' }}
    >
      {config.label}
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
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [zones, setZones] = useState([]);
  const [zoneMeta, setZoneMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [zonePage, setZonePage] = useState(1);
  const [zonesLoading, setZonesLoading] = useState(true);
  const [zonesError, setZonesError] = useState(false);

  const [colonies, setColonies] = useState([]);
  const [colonyMeta, setColonyMeta] = useState({ total: 0, page: 1, pages: 1 });
  const [colonyPage, setColonyPage] = useState(1);
  const [coloniesLoading, setColoniesLoading] = useState(true);
  const [coloniesError, setColoniesError] = useState(false);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setZonePage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Fetch zoning data
  useEffect(() => {
    dataHubService
      .getZoningData({ search: debouncedSearch, page: zonePage, limit: PAGE_SIZE })
      .then((res) => {
        setZones(res?.data || res?.items || []);
        const total = res?.meta?.total ?? res?.total ?? 0;
        const pages = res?.meta?.pages ?? Math.ceil(total / PAGE_SIZE);
        setZoneMeta({ total, page: zonePage, pages });
      })
      .catch(() => setZonesError(true))
      .finally(() => setZonesLoading(false));
  }, [debouncedSearch, zonePage]);

  // Fetch colony approvals
  useEffect(() => {
    dataHubService
      .getColonyApprovals({ page: colonyPage, limit: COLONY_PAGE_SIZE })
      .then((res) => {
        setColonies(res?.data || res?.items || []);
        const total = res?.meta?.total ?? res?.total ?? 0;
        const pages = res?.meta?.pages ?? Math.ceil(total / COLONY_PAGE_SIZE);
        setColonyMeta({ total, page: colonyPage, pages });
      })
      .catch(() => setColoniesError(true))
      .finally(() => setColoniesLoading(false));
  }, [colonyPage]);

  return (
    <>
      <SEO
        title="Zone Checker Gurugram | Land Use FAR Master Plan | 360Ghar"
        description="Check zoning regulations for Gurugram sectors. View land use classification, Floor Area Ratio (FAR), maximum height, and setback rules from Haryana Master Plan."
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
                <h1 className="fs-28 fw-600 mb-10">Zone Checker — Gurugram</h1>
                <p className="color-text-3 mb-20">
                  Browse land use zones, Floor Area Ratio (FAR), and height restrictions for Gurugram sectors as per the Haryana Master Plan.
                </p>

                {/* Search */}
                <div className="col-lg-4 col-md-6 ps-0">
                  <div className="input-group">
                    <span className="input-group-text bg-white">
                      <i className="fas fa-search color-text-3"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by sector..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button className="btn btn-outline-secondary" type="button" onClick={() => setSearch('')}>
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
                <p className="mt-10 color-text-3">Loading zoning data…</p>
              </div>
            ) : zonesError ? (
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Zoning data temporarily unavailable. Please try again later.
              </div>
            ) : zones.length === 0 ? (
              <div className="text-center py-40">
                <i className="fas fa-map-marked-alt fs-40 color-text-3 mb-15"></i>
                <p className="color-text-3">No zones found{debouncedSearch ? ` for "${debouncedSearch}"` : ''}.</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">{zoneMeta.total} zone{zoneMeta.total !== 1 ? 's' : ''} found</p>
                <div className="row g-3 mb-30">
                  {zones.map((zone) => (
                    <div key={zone.id || zone.slug} className="col-lg-4 col-md-6 col-12">
                      <div className="bg-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start mb-10">
                          <h3 className="fs-16 fw-600 mb-0">{zone.sector_name || zone.sector}</h3>
                          <LandUseBadge landUse={zone.primary_land_use || zone.land_use} />
                        </div>
                        <div className="row g-2 mt-auto">
                          <div className="col-6">
                            <div className="bg-light rounded-2 p-2 text-center">
                              <div className="fs-18 fw-700 color-text-1">
                                {zone.far != null ? zone.far : '—'}
                              </div>
                              <div className="fs-12 color-text-3">FAR</div>
                            </div>
                          </div>
                          <div className="col-6">
                            <div className="bg-light rounded-2 p-2 text-center">
                              <div className="fs-18 fw-700 color-text-1">
                                {zone.max_height != null ? `${zone.max_height}m` : '—'}
                              </div>
                              <div className="fs-12 color-text-3">Max Height</div>
                            </div>
                          </div>
                        </div>
                        <Link
                          to={`/zone-checker/${zone.slug}`}
                          className="btn btn-sm btn-outline-main mt-15 align-self-start"
                        >
                          View Details <i className="fas fa-arrow-right ms-1"></i>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {zoneMeta.pages > 1 && (
                  <div className="d-flex align-items-center gap-10 mb-30">
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={zonePage === 1}
                      onClick={() => setZonePage((p) => p - 1)}
                    >
                      ← Prev
                    </button>
                    <span className="fs-14 color-text-3">
                      Page {zonePage} of {zoneMeta.pages}
                    </span>
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      disabled={zonePage >= zoneMeta.pages}
                      onClick={() => setZonePage((p) => p + 1)}
                    >
                      Next →
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Colony Approvals Section */}
            <div className="row mt-20">
              <div className="col-12">
                <h2 className="fs-22 fw-600 mb-5">Colony Approvals</h2>
                <p className="color-text-3 mb-20">Licensed colonies in Gurugram with their approval status.</p>

                {coloniesLoading ? (
                  <p className="color-text-3">Loading colony approvals…</p>
                ) : coloniesError ? (
                  <div className="alert alert-warning" role="alert">
                    <i className="fas fa-exclamation-triangle me-2"></i>
                    Colony approval data temporarily unavailable.
                  </div>
                ) : colonies.length === 0 ? (
                  <p className="color-text-3">No colony approvals data available.</p>
                ) : (
                  <>
                    <div className="table-responsive mb-15">
                      <table className="table table-bordered">
                        <thead className="table-light">
                          <tr>
                            <th>Colony Name</th>
                            <th>Licence Number</th>
                            <th>Status</th>
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

                    {/* Colony pagination */}
                    {colonyMeta.pages > 1 && (
                      <div className="d-flex align-items-center gap-10">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={colonyPage === 1}
                          onClick={() => setColonyPage((p) => p - 1)}
                        >
                          ← Prev
                        </button>
                        <span className="fs-14 color-text-3">
                          Page {colonyPage} of {colonyMeta.pages}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          disabled={colonyPage >= colonyMeta.pages}
                          onClick={() => setColonyPage((p) => p + 1)}
                        >
                          Next →
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default ZoneChecker;
