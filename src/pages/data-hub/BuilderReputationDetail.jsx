import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import SEO from '../../common/SEO';
import Pagination from '../../common/Pagination';
import BuilderScoreChart from '../../components/data-hub/BuilderScoreChart';
import { dataHubService } from '../../services/dataHubService';

const PAGE_LIMIT = 12;

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

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return dateStr;
  }
};

const formatCurrency = (amount) => {
  if (amount == null) return '—';
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
};

const BuilderReputationDetail = () => {
  const { slug } = useParams();

  const [builder, setBuilder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notFound, setNotFound] = useState(false);

  // Tab state
  const [activeTab, setActiveTab] = useState('projects');

  // Projects tab state
  const [projects, setProjects] = useState([]);
  const [projectsTotal, setProjectsTotal] = useState(0);
  const [projectsPage, setProjectsPage] = useState(1);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const projectsTotalPages = Math.ceil(projectsTotal / PAGE_LIMIT);

  // Complaints tab state — sourced from builder.complaints array
  const [complaints, setComplaints] = useState([]);

  // Fetch builder profile
  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    setNotFound(false);
    dataHubService.getBuilder(slug)
      .then((data) => {
        setBuilder(data);
        setComplaints(data?.complaints || []);
      })
      .catch((err) => {
        if (err?.response?.status === 404) {
          setNotFound(true);
        } else {
          setError(true);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  // Fetch RERA projects for this builder when on projects tab
  useEffect(() => {
    if (!builder || activeTab !== 'projects') return;
    setProjectsLoading(true);
    const params = { page: projectsPage, limit: PAGE_LIMIT };
    if (builder.name) params.developer = builder.name;

    dataHubService.getReraProjects(params)
      .then((data) => {
        setProjects(data?.items || []);
        setProjectsTotal(data?.total || 0);
      })
      .catch(() => {
        setProjects([]);
        setProjectsTotal(0);
      })
      .finally(() => setProjectsLoading(false));
  }, [builder, activeTab, projectsPage]);

  if (loading) {
    return (
      <>
        <OffCanvas />
        <MobileMenu />
        <main className="body-bg">
          <Header />
          <section className="pt-60 pb-60">
            <div className="container">
              <p className="color-text-3">Loading builder profile...</p>
            </div>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  if (notFound) {
    return (
      <>
        <OffCanvas />
        <MobileMenu />
        <main className="body-bg">
          <Header />
          <section className="pt-60 pb-60">
            <div className="container text-center py-60">
              <h2 className="fs-24 fw-600 mb-15">Builder Not Found</h2>
              <p className="color-text-3 mb-20">We could not find a builder profile for this page.</p>
              <Link to="/builder-reputation" className="btn btn-main">Back to Builder Directory</Link>
            </div>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <OffCanvas />
        <MobileMenu />
        <main className="body-bg">
          <Header />
          <section className="pt-60 pb-60">
            <div className="container text-center py-60">
              <p className="color-danger fs-16">Builder data temporarily unavailable. Please try again later.</p>
              <Link to="/builder-reputation" className="btn btn-outline-secondary mt-20">Back to Directory</Link>
            </div>
          </section>
          <Footer />
        </main>
      </>
    );
  }

  const builderName = builder?.name || 'Builder';
  const score = Math.round(builder?.score ?? 0);

  return (
    <>
      <SEO
        title={`${builderName} RERA Score & Complaints | 360Ghar`}
        description={`Check ${builderName}'s RERA reputation score, registered projects, and complaint history in Gurugram. Data sourced from HRERA public records.`}
        keywords={`${builderName} RERA score, ${builderName} complaints, builder reputation Gurugram, HRERA ${builderName}`}
        canonical={`/builder-reputation/${slug}`}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">

            {/* Breadcrumb */}
            <div className="mb-20" style={{ fontSize: 13, color: '#6b7280' }}>
              <Link to="/builder-reputation" style={{ color: '#6b7280', textDecoration: 'none' }}>
                Builder Directory
              </Link>
              <span className="mx-2">/</span>
              <span style={{ color: '#111827' }}>{builderName}</span>
            </div>

            {/* Header */}
            <div className="row mb-30">
              <div className="col-12">
                <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '24px 28px' }}>
                  <div className="d-flex align-items-start flex-wrap gap-20">
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <h1 className="fs-28 fw-700 mb-6" style={{ color: '#111827' }}>{builderName}</h1>
                      {builder?.city && (
                        <p style={{ margin: '0 0 12px', fontSize: 14, color: '#6b7280' }}>
                          <i className="fas fa-map-marker-alt me-1"></i>
                          {builder.city}
                        </p>
                      )}
                    </div>
                    <BuilderScoreChart
                      score={score}
                      totalProjects={builder?.total_projects ?? 0}
                      totalComplaints={builder?.total_complaints ?? 0}
                    />
                  </div>

                  {/* Stats Row */}
                  <div className="row g-3 mt-10">
                    <div className="col-4 col-md-3">
                      <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                          {builder?.total_projects ?? '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Total Projects</div>
                      </div>
                    </div>
                    <div className="col-4 col-md-3">
                      <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                          {builder?.total_complaints ?? '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Total Complaints</div>
                      </div>
                    </div>
                    <div className="col-4 col-md-3">
                      <div style={{ textAlign: 'center', padding: '12px 8px', background: '#f8fafc', borderRadius: 8 }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: '#111827' }}>
                          {builder?.total_penalties != null ? formatCurrency(builder.total_penalties) : '—'}
                        </div>
                        <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>Total Penalties</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="row mb-20">
              <div className="col-12">
                <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #e5e7eb' }}>
                  {[
                    { key: 'projects', label: 'RERA Projects' },
                    { key: 'complaints', label: 'Complaints & Orders' },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key)}
                      style={{
                        padding: '10px 22px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === tab.key ? 700 : 500,
                        color: activeTab === tab.key ? 'var(--main-color, #2563eb)' : '#6b7280',
                        borderBottom: activeTab === tab.key ? '2px solid var(--main-color, #2563eb)' : '2px solid transparent',
                        marginBottom: -1,
                        fontSize: 14,
                        transition: 'color 0.15s',
                      }}
                    >
                      {tab.label}
                      {tab.key === 'complaints' && complaints.length > 0 && (
                        <span style={{
                          marginLeft: 6,
                          background: '#fee2e2',
                          color: '#991b1b',
                          fontSize: 11,
                          fontWeight: 700,
                          borderRadius: 10,
                          padding: '1px 7px',
                        }}>
                          {complaints.length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Tab Content */}
            {activeTab === 'projects' && (
              <div className="row">
                <div className="col-12">
                  {projectsLoading ? (
                    <div className="row g-3">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="col-lg-4 col-md-6 col-12">
                          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, background: '#fff' }}>
                            <div style={{ height: 16, background: '#e5e7eb', borderRadius: 4, marginBottom: 12, width: '70%' }}></div>
                            <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '50%' }}></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : projects.length === 0 ? (
                    <div className="text-center py-40">
                      <p className="fs-16 color-text-3">No RERA projects found for this builder.</p>
                    </div>
                  ) : (
                    <>
                      <p className="mb-20 fs-14 color-text-3">{projectsTotal} project{projectsTotal !== 1 ? 's' : ''} found</p>
                      <div className="row g-3 mb-30">
                        {projects.map((project) => (
                          <div key={project.id || project.rera_number} className="col-lg-4 col-md-6 col-12">
                            <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, background: '#fff', height: '100%' }}>
                              <div className="d-flex justify-content-between align-items-start mb-10">
                                <span style={statusBadgeStyle(project.status)}>
                                  {project.status ? project.status.charAt(0).toUpperCase() + project.status.slice(1) : 'Unknown'}
                                </span>
                                {project.property_type && (
                                  <span style={{ fontSize: 11, color: '#6b7280', textTransform: 'capitalize' }}>{project.property_type}</span>
                                )}
                              </div>
                              <h3 style={{ fontSize: 15, fontWeight: 600, margin: '0 0 6px', color: '#111827' }}>
                                {project.project_name || 'Unnamed Project'}
                              </h3>
                              {project.rera_number && (
                                <p style={{ margin: '0 0 10px', fontFamily: 'monospace', fontSize: 12, color: '#374151', background: '#f3f4f6', padding: '4px 8px', borderRadius: 4, wordBreak: 'break-all' }}>
                                  {project.rera_number}
                                </p>
                              )}
                              <div className="d-flex gap-20 flex-wrap">
                                {project.total_units != null && (
                                  <div>
                                    <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Units</span>
                                    <span style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>{project.total_units}</span>
                                  </div>
                                )}
                                {project.possession_date && (
                                  <div>
                                    <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Possession</span>
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
                      <Pagination
                        currentPage={projectsPage}
                        totalPages={projectsTotalPages}
                        onPageChange={setProjectsPage}
                      />
                    </>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'complaints' && (
              <div className="row">
                <div className="col-12">
                  {complaints.length === 0 ? (
                    <div className="text-center py-40">
                      <p className="fs-16 color-text-3">No complaints or orders found for this builder.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-3 mb-30">
                      {complaints.map((complaint, idx) => (
                        <div key={complaint.id || idx} style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 20, background: '#fff' }}>
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-10 mb-10">
                            <div>
                              {complaint.project_name && (
                                <p style={{ margin: '0 0 4px', fontWeight: 600, fontSize: 15, color: '#111827' }}>
                                  {complaint.project_name}
                                </p>
                              )}
                              {complaint.nature_of_complaint && (
                                <p style={{ margin: 0, fontSize: 13, color: '#6b7280' }}>
                                  {complaint.nature_of_complaint}
                                </p>
                              )}
                            </div>
                            <div style={{ textAlign: 'right', flexShrink: 0 }}>
                              {complaint.complaint_date && (
                                <p style={{ margin: '0 0 4px', fontSize: 12, color: '#9ca3af' }}>
                                  {formatDate(complaint.complaint_date)}
                                </p>
                              )}
                              {complaint.penalty_amount != null && (
                                <span style={{
                                  background: '#fee2e2',
                                  color: '#991b1b',
                                  fontSize: 13,
                                  fontWeight: 700,
                                  padding: '3px 10px',
                                  borderRadius: 6,
                                }}>
                                  Penalty: {formatCurrency(complaint.penalty_amount)}
                                </span>
                              )}
                            </div>
                          </div>
                          {complaint.order_summary && (
                            <p style={{ margin: 0, fontSize: 13, color: '#4b5563', borderTop: '1px solid #f3f4f6', paddingTop: 10 }}>
                              {complaint.order_summary}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="row mt-20">
              <div className="col-12">
                <p style={{ fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  Data sourced from publicly available HRERA records. 360Ghar does not guarantee accuracy or completeness of regulatory data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">Looking for Verified Properties?</h2>
                <p className="mb-4">Explore our curated listings from trusted developers in Gurugram.</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/properties" className="btn btn-white btn-main">Browse Properties</a>
                  <Link to="/builder-reputation" className="btn btn-outline-white">Back to Builder Directory</Link>
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

export default BuilderReputationDetail;
