import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import Pagination from '../../common/ui/Pagination';
import ScoreWheel from '../../components/data-hub/ScoreWheel';
import { dataHubService } from '../../services/dataHubService';

const PAGE_LIMIT = 20;

const SORT_OPTIONS = [
  { value: 'score_desc', label: 'Score (High to Low)' },
  { value: 'name_asc', label: 'Name (A-Z)' },
  { value: 'projects_desc', label: 'Projects (Most First)' },
  { value: 'complaints_desc', label: 'Complaints (Most First)' },
];

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
  const [builders, setBuilders] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('score_desc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  useEffect(() => {
    dataHubService.getBuilders({ search, sort_by: sortBy, page, limit: PAGE_LIMIT })
      .then((data) => {
        setBuilders(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [search, sortBy, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <>
      <SEO
        title="Builder Reputation Gurugram | RERA Score Checker | 360Ghar"
        description="Check builder reputation scores for Gurugram developers. Based on HRERA registered projects, complaint history, and penalties. Find reliable builders before you invest."
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
            numberOfItems: total,
          },
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
                <h1 className="fs-28 fw-600 mb-10">Builder Reputation Directory — Gurugram</h1>
                <p className="mb-0 color-text-3">
                  Scores based on HRERA registered projects and complaints. Higher is better.
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
                    placeholder="Search by builder name..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                  />
                  <button type="submit" className="btn btn-main btn-sm" style={{ whiteSpace: 'nowrap' }}>
                    Search
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
                  <span><span style={{ color: '#22c55e', fontWeight: 700 }}>70+</span> — Good</span>
                  <span><span style={{ color: '#f59e0b', fontWeight: 700 }}>40–69</span> — Average</span>
                  <span><span style={{ color: '#ef4444', fontWeight: 700 }}>Below 40</span> — Poor</span>
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
                <p className="color-danger fs-16">Builder data temporarily unavailable. Please try again later.</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">
                  {total} builder{total !== 1 ? 's' : ''} found
                </p>

                {builders.length === 0 ? (
                  <div className="text-center py-40">
                    <p className="fs-16 color-text-3">No builders found{search ? ` for "${search}"` : ''}.</p>
                  </div>
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="d-none d-md-block mb-30">
                      <div className="table-responsive">
                        <table className="table table-bordered" style={{ fontSize: 14 }}>
                          <thead className="table-light">
                            <tr>
                              <th>Builder Name</th>
                              <th className="text-center">Projects</th>
                              <th className="text-center">Complaints</th>
                              <th className="text-center">Score</th>
                              <th></th>
                            </tr>
                          </thead>
                          <tbody>
                            {builders.map((builder) => {
                              const score = Math.round(builder.score ?? 0);
                              return (
                                <tr key={builder.slug || builder.id}>
                                  <td>
                                    <Link
                                      to={`/builder-reputation/${builder.slug}`}
                                      style={{ fontWeight: 600, color: '#111827', textDecoration: 'none' }}
                                    >
                                      {builder.name || 'Unknown Builder'}
                                    </Link>
                                  </td>
                                  <td className="text-center">{builder.total_projects ?? '—'}</td>
                                  <td className="text-center">{builder.total_complaints ?? '—'}</td>
                                  <td className="text-center">
                                    <span style={scoreBadgeStyle(score)}>{score}</span>
                                  </td>
                                  <td>
                                    <Link
                                      to={`/builder-reputation/${builder.slug}`}
                                      className="btn btn-sm btn-outline-secondary"
                                    >
                                      View Profile
                                    </Link>
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
                                <Link
                                  to={`/builder-reputation/${builder.slug}`}
                                  style={{ fontWeight: 600, fontSize: 15, color: '#111827', textDecoration: 'none' }}
                                >
                                  {builder.name || 'Unknown Builder'}
                                </Link>
                                <ScoreWheel score={score} size={52} label="" />
                              </div>
                              <div className="d-flex gap-20">
                                <div>
                                  <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Projects</span>
                                  <span style={{ fontSize: 14, fontWeight: 600 }}>{builder.total_projects ?? '—'}</span>
                                </div>
                                <div>
                                  <span style={{ fontSize: 11, color: '#9ca3af', display: 'block' }}>Complaints</span>
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

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}

            {/* Disclaimer */}
            <div className="row mt-30">
              <div className="col-12">
                <p style={{ fontSize: 12, color: '#9ca3af', borderTop: '1px solid #e5e7eb', paddingTop: 16 }}>
                  Scores based on HRERA registered projects and complaints. Higher is better.
                  Data sourced from publicly available HRERA records. 360Ghar does not guarantee accuracy of regulatory data.
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
                <h2 className="cta-title mb-3">Looking for Trusted Properties?</h2>
                <p className="mb-4">Browse verified properties from reputable builders in Gurugram.</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/properties" className="btn btn-white btn-main">Browse Properties</a>
                  <a href="/contact" className="btn btn-outline-white">Contact Us</a>
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
