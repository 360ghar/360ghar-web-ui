import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
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

const LandUseBadge = ({ landUse }) => {
  const config = LAND_USE_COLORS[landUse?.toLowerCase()] || { bg: '#6c757d', label: landUse || 'Unknown' };
  return (
    <span
      style={{ background: config.bg, color: '#fff', padding: '3px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, display: 'inline-block' }}
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
    <span style={{ background: bg, color: s === 'pending' ? '#000' : '#fff', padding: '3px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600 }}>
      {status ? status.charAt(0).toUpperCase() + status.slice(1) : '—'}
    </span>
  );
};

const ZoneCheckerDetail = () => {
  const { slug } = useParams();
  const [zone, setZone] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!slug) return;
    dataHubService
      .getZoningBySlug(slug)
      .then((data) => setZone(data))
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const sectorName = zone?.sector_name || zone?.sector || slug;
  const pageTitle = zone
    ? `${sectorName} Gurugram Zoning | FAR Master Plan | 360Ghar`
    : 'Zone Details Gurugram | FAR Master Plan | 360Ghar';

  const formatValue = (val) => (val != null ? val : '—');

  return (
    <>
      <SEO
        title={pageTitle}
        description={zone
          ? `Zoning details for ${sectorName}, Gurugram. Land use: ${zone.primary_land_use || zone.land_use || 'N/A'}, FAR: ${zone.far ?? 'N/A'}, Max height: ${zone.max_height ?? 'N/A'}m.`
          : 'Detailed zoning information for Gurugram sectors including FAR, height restrictions, and land use classification.'}
        keywords={`${sectorName} zoning Gurugram, ${sectorName} FAR, land use ${sectorName}, Master Plan Gurugram`}
        canonical={`/zone-checker/${slug}`}
        noindex={!loading && (!zone || notFound || error)}
        structuredData={zone ? [
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Zone Checker', url: 'https://360ghar.com/zone-checker' },
            { name: sectorName, url: `https://360ghar.com/zone-checker/${slug}` },
          ]),
          {
            '@type': 'Place',
            name: `${sectorName}, Gurugram`,
            description: `Zoning details for ${sectorName}. Land use: ${zone.primary_land_use || zone.land_use || 'N/A'}, FAR: ${zone.far ?? 'N/A'}, Max height: ${zone.max_height ?? 'N/A'}m.`,
            address: {
              '@type': 'PostalAddress',
              addressLocality: sectorName,
              addressRegion: 'Haryana',
              addressCountry: 'IN',
            },
          },
        ] : []}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            {/* Back link */}
            <div className="mb-20">
              <Link to="/zone-checker" className="color-text-3 fs-14">
                <i className="fas fa-arrow-left me-1"></i>
                Back to Zone Checker
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-60">
                <div className="spinner-border text-main" role="status">
                  <span className="visually-hidden">Loading…</span>
                </div>
                <p className="mt-10 color-text-3">Loading zone details…</p>
              </div>
            ) : notFound ? (
              <div className="text-center py-60">
                <i className="fas fa-map-marked-alt fs-50 color-text-3 mb-20"></i>
                <h2 className="fs-22 fw-600 mb-10">Zone Not Found</h2>
                <p className="color-text-3 mb-20">We could not find zoning data for this sector.</p>
                <Link to="/zone-checker" className="btn btn-main">
                  Browse All Zones
                </Link>
              </div>
            ) : error ? (
              <div className="alert alert-warning" role="alert">
                <i className="fas fa-exclamation-triangle me-2"></i>
                Zoning data temporarily unavailable. Please try again later.
              </div>
            ) : zone ? (
              <>
                {/* Header */}
                <div className="row mb-30">
                  <div className="col-12">
                    <div className="d-flex align-items-center flex-wrap gap-10 mb-5">
                      <h1 className="fs-28 fw-600 mb-0">{sectorName}</h1>
                      <LandUseBadge landUse={zone.primary_land_use || zone.land_use} />
                    </div>
                    <p className="color-text-3">
                      Gurugram, Haryana &mdash; Zoning data as per Haryana Master Plan
                    </p>
                  </div>
                </div>

                <div className="row g-4">
                  {/* Zoning Info Table */}
                  <div className="col-lg-7">
                    <div className="bg-white p-4 rounded-3 shadow-sm mb-20">
                      <h2 className="fs-20 fw-600 mb-20">Zoning Details</h2>
                      <table className="table table-sm table-bordered">
                        <tbody>
                          <tr>
                            <th className="color-text-3 fw-500 w-45 bg-light">Land Use</th>
                            <td>
                              <LandUseBadge landUse={zone.primary_land_use || zone.land_use} />
                            </td>
                          </tr>
                          <tr>
                            <th className="color-text-3 fw-500 bg-light">Floor Area Ratio (FAR)</th>
                            <td className="fw-600">{formatValue(zone.far)}</td>
                          </tr>
                          <tr>
                            <th className="color-text-3 fw-500 bg-light">Maximum Height</th>
                            <td>{zone.max_height != null ? `${zone.max_height} metres` : '—'}</td>
                          </tr>
                          {zone.ground_coverage != null && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Ground Coverage</th>
                              <td>{zone.ground_coverage}%</td>
                            </tr>
                          )}
                          {zone.setback_front != null && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Front Setback</th>
                              <td>{zone.setback_front} metres</td>
                            </tr>
                          )}
                          {zone.setback_rear != null && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Rear Setback</th>
                              <td>{zone.setback_rear} metres</td>
                            </tr>
                          )}
                          {zone.setback_side != null && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Side Setback</th>
                              <td>{zone.setback_side} metres</td>
                            </tr>
                          )}
                          {zone.parking_norm && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Parking Norm</th>
                              <td>{zone.parking_norm}</td>
                            </tr>
                          )}
                          {zone.density && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Density</th>
                              <td>{zone.density}</td>
                            </tr>
                          )}
                          {zone.notes && (
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Notes</th>
                              <td>{zone.notes}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Colony Approval Status (if available) */}
                    {zone.colony_approval && (
                      <div className="bg-white p-4 rounded-3 shadow-sm mb-20">
                        <h2 className="fs-20 fw-600 mb-15">Colony Approval Status</h2>
                        <table className="table table-sm table-bordered">
                          <tbody>
                            <tr>
                              <th className="color-text-3 fw-500 bg-light w-45">Colony Name</th>
                              <td>{zone.colony_approval.colony_name || zone.colony_approval.name || '—'}</td>
                            </tr>
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Licence Number</th>
                              <td>{zone.colony_approval.licence_number || zone.colony_approval.license_number || '—'}</td>
                            </tr>
                            <tr>
                              <th className="color-text-3 fw-500 bg-light">Status</th>
                              <td><StatusBadge status={zone.colony_approval.status} /></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}

                    {/* View Properties CTA */}
                    <div className="d-flex align-items-center gap-10 mb-20">
                      <Link
                        to={`/properties?locality=${encodeURIComponent(sectorName)}`}
                        className="btn btn-main"
                      >
                        <i className="fas fa-home me-2"></i>
                        View Properties in {sectorName}
                      </Link>
                    </div>
                  </div>

                  {/* Sidebar */}
                  <div className="col-lg-5">
                    {/* FAR Info Box */}
                    <div className="bg-white p-4 rounded-3 shadow-sm mb-20">
                      <h3 className="fs-18 fw-600 mb-15">
                        <i className="fas fa-question-circle text-main me-2"></i>
                        What does FAR mean?
                      </h3>
                      <p className="color-text-3 mb-10">
                        <strong>Floor Area Ratio (FAR)</strong>, also called Floor Space Index (FSI), is the ratio of a building&apos;s total floor area to the size of the plot on which it is built.
                      </p>
                      <p className="color-text-3 mb-10">
                        For example, a FAR of <strong>2.0</strong> on a 200 sq m plot allows a maximum built-up floor area of <strong>400 sq m</strong> across all floors.
                      </p>
                      <ul className="color-text-3 mb-0" style={{ paddingLeft: '18px' }}>
                        <li>Higher FAR = more permissible construction</li>
                        <li>FAR limits are set by the Master Plan authority (DTCP Haryana)</li>
                        <li>Violation of FAR can result in demolition notices</li>
                        <li>Always verify with the local municipal authority before construction</li>
                      </ul>
                    </div>

                    {/* Quick stats */}
                    <div className="bg-white p-4 rounded-3 shadow-sm mb-20">
                      <h3 className="fs-16 fw-600 mb-15">Quick Stats</h3>
                      <div className="row g-2">
                        <div className="col-6">
                          <div className="bg-light rounded-2 p-3 text-center">
                            <div className="fs-22 fw-700 color-text-1">{formatValue(zone.far)}</div>
                            <div className="fs-12 color-text-3 mt-1">FAR</div>
                          </div>
                        </div>
                        <div className="col-6">
                          <div className="bg-light rounded-2 p-3 text-center">
                            <div className="fs-22 fw-700 color-text-1">
                              {zone.max_height != null ? `${zone.max_height}m` : '—'}
                            </div>
                            <div className="fs-12 color-text-3 mt-1">Max Height</div>
                          </div>
                        </div>
                        {zone.ground_coverage != null && (
                          <div className="col-6">
                            <div className="bg-light rounded-2 p-3 text-center">
                              <div className="fs-22 fw-700 color-text-1">{zone.ground_coverage}%</div>
                              <div className="fs-12 color-text-3 mt-1">Ground Coverage</div>
                            </div>
                          </div>
                        )}
                        {(zone.setback_front != null || zone.setback_side != null) && (
                          <div className="col-6">
                            <div className="bg-light rounded-2 p-3 text-center">
                              <div className="fs-22 fw-700 color-text-1">
                                {zone.setback_front != null ? `${zone.setback_front}m` : '—'}
                              </div>
                              <div className="fs-12 color-text-3 mt-1">Front Setback</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Attribution */}
                    <div className="alert alert-light fs-13" role="note">
                      <i className="fas fa-info-circle me-2 color-text-3"></i>
                      Data sourced from <strong>DTCP Haryana</strong> and the Gurugram Master Plan. For official verification, consult DTCP or the local urban local body.
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default ZoneCheckerDetail;
