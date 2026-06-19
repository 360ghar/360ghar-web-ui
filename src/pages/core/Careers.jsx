import { I18nLink } from '../../i18n/I18nLink';
import { useTranslation } from 'react-i18next';
import { useMemo, useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { careerFaqStructuredData } from '../../seo/structuredData';
import { careerOpenings } from '../../data/careers';

const CAREER_VALUES = [
  { icon: 'fas fa-rocket', text: 'Build products real people use daily' },
  { icon: 'fas fa-users', text: 'Collaborative team of builders and makers' },
  { icon: 'fas fa-graduation-cap', text: 'Learn fast — mentors, reviews, and ownership' },
];

const TODAY = new Date().toISOString().split('T')[0];
const VALID_THROUGH = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

/**
 * AUDIT FIX (4.8): derive a human-readable category from each opening so the
 * careers page can offer a search + category filter. Categories are derived
 * from the role title to avoid a separate data migration.
 */
const deriveCategory = (opening) => {
  const title = (opening.title || '').toLowerCase();
  if (title.includes('content') || title.includes('writer') || title.includes('marketing')) return 'content';
  if (title.includes('software') || title.includes('developer') || title.includes('engineer')) return 'engineering';
  if (title.includes('agent') || title.includes('sales') || title.includes('real estate')) return 'sales';
  return 'other';
};

const CATEGORY_LABELS = {
  content: 'Content & Marketing',
  engineering: 'Engineering',
  sales: 'Sales & Field',
  other: 'Other',
};

const Careers = () => {
  const { t } = useTranslation();
  const [tSeo] = useTranslation('seo');
  const [tC] = useTranslation('common');
  // AUDIT FIX (4.8): search + category filter state
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => {
    const set = new Set(careerOpenings.map(deriveCategory));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredOpenings = useMemo(() => careerOpenings.filter((opening) => {
    const matchesQuery = !query
      || opening.title.toLowerCase().includes(query.toLowerCase())
      || opening.description.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = category === 'all' || deriveCategory(opening) === category;
    return matchesQuery && matchesCategory;
  }), [query, category]);

  const structuredData = useMemo(() => [
    {
      '@type': 'CollectionPage',
      name: 'Internships at 360Ghar',
      description: 'Explore internship opportunities at 360Ghar across content, real estate, and technology.',
      hasPart: careerOpenings.map((opening) => ({
        '@type': 'JobPosting',
        name: opening.title,
        description: opening.description.slice(0, 200),
        datePosted: TODAY,
        validThrough: VALID_THROUGH,
        hiringOrganization: {
          '@type': 'Organization',
          name: '360Ghar',
          url: siteMetadata.siteUrl,
        },
        jobLocation: {
          '@type': 'Place',
          address: {
            '@type': 'PostalAddress',
            addressLocality: 'Gurugram',
            addressRegion: 'Haryana',
            addressCountry: 'IN',
          },
        },
        employmentType: 'INTERNSHIP',
      })),
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteMetadata.siteUrl },
          { '@type': 'ListItem', position: 2, name: 'Careers', item: `${siteMetadata.siteUrl}/careers` },
        ],
      },
    },
    careerFaqStructuredData,
  ], []);

  return (
    <>
      <SEO
        title={tSeo('careers.title')}
        description={tSeo('careers.description')}
        keywords="360Ghar careers, internships in Gurugram, content creator internship, real estate agent internship, software developer internship, software developer intern, 360Ghar hiring, tech internships Gurugram, prop-tech internships India, real estate startup jobs"
        canonical="/careers"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={structuredData}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        {/* Hero Section */}
        <section className="careers-wrapper py-5 bg-light-subtle">
          <div className="container px-lg-5">
            <div className="row justify-content-center">
              <div className="col-lg-9 text-center">
                <p className="text-uppercase text-primary fw-semibold mb-2" style={{ fontSize: '0.85rem', letterSpacing: '0.08em' }}>
                  We&apos;re Hiring
                </p>
                <h1 className="display-5 fw-bold mb-3">Internships at 360Ghar</h1>
                <p className="text-secondary fs-6 mb-4 mx-auto" style={{ maxWidth: '600px' }}>
                  We are looking for curious, driven interns to help build India&apos;s most trusted property platform.
                  Work on real products, ship features that users care about, and grow alongside a passionate team in Gurugram.
                </p>
                <div className="row g-3 justify-content-center mt-4">
                  {CAREER_VALUES.map((value) => (
                    <div className="col-md-4" key={value.icon}>
                      <div className="d-flex align-items-center justify-content-center gap-2">
                        <i className={`${value.icon} text-main`}></i>
                        <span className="small text-secondary">{value.text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="padding-y-120 bg-white">
          <div className="container px-lg-5">
            <div className="row justify-content-center mb-5">
              <div className="col-lg-8 text-center">
                <h2 className="fw-bold mb-2">Open Internships</h2>
                <p className="text-secondary">
                  All positions are based in Gurugram. Apply by emailing your resume to{' '}
                  <a href="mailto:info@360ghar.com" className="text-main text-decoration-none">
                    info@360ghar.com
                  </a>
                </p>
              </div>
            </div>

            {/* AUDIT FIX (4.8): search + category filter */}
            <div className="row g-3 justify-content-center mb-5">
              <div className="col-lg-6">
                <div className="input-group">
                  <span className="input-group-text bg-white border-end-0">
                    <i className="fas fa-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder={tC('contentSeo.searchJobs')}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    aria-label={tC('contentSeo.searchJobs')}
                  />
                </div>
              </div>
              <div className="col-lg-4">
                <select
                  className="form-select"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  aria-label={tC('contentSeo.filterByCategory')}
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat === 'all' ? tC('contentSeo.allCategories') : CATEGORY_LABELS[cat] || cat}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="row g-4 g-lg-5">
              {filteredOpenings.map((opening) => (
                <div className="col-lg-6 col-xl-4" key={opening.slug}>
                  <article className="careers-card h-100 shadow-sm border-0 rounded-4 overflow-hidden transition-all">
                    <div className="careers-card__header bg-gradient"></div>
                    <div className="card-body d-flex flex-column p-4 p-lg-5">
                      <div className="d-flex align-items-start gap-3 mb-3">
                        <div className="careers-card__icon d-flex align-items-center justify-content-center flex-shrink-0">
                          <i className={opening.icon || 'fas fa-briefcase'}></i>
                        </div>
                        <div>
                          <h3 className="h6 fw-bold mb-1">{opening.title}</h3>
                          <span className="badge badge-internship">Internship</span>
                        </div>
                      </div>

                      <p className="text-secondary small mb-3 flex-grow-1">{opening.description.slice(0, 180)}...</p>

                      <div className="d-flex flex-column gap-2 mb-4 text-muted" style={{ fontSize: '0.8rem' }}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-map-marker-alt" style={{ width: '14px' }}></i>
                          <span>{opening.location}</span>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-clock" style={{ width: '14px' }}></i>
                          <span>{opening.duration}</span>
                        </div>
                      </div>

                      <div className="d-flex justify-content-end mt-auto pt-3">
                        <I18nLink to={`/careers/${opening.slug}`} className="btn btn-outline-main px-4">
                          View Details
                        </I18nLink>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
            {filteredOpenings.length === 0 && (
              <p className="text-center text-muted py-5">{tC('contentSeo.noResults')}</p>
            )}
          </div>
        </section>

        {/* Why Join Section */}
        <section className="py-5 bg-light-subtle">
          <div className="container px-lg-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="fw-bold mb-4">What You&apos;ll Get</h2>
                <div className="row g-4">
                  {[
                    { icon: 'fas fa-laptop-code', title: 'Real Ownership', desc: 'Ship features used by thousands of users, not just side projects.' },
                    { icon: 'fas fa-chalkboard-teacher', title: 'Hands-on Mentoring', desc: 'Direct guidance from the founding team — no layers, just learning.' },
                    { icon: 'fas fa-chart-line', title: 'Fast Growth', desc: 'The fastest way to level up is by building with real feedback loops.' },
                  ].map((item) => (
                    <div className="col-md-4" key={item.icon}>
                      <div className="text-center p-3">
                        <div className="d-inline-flex align-items-center justify-content-center mb-3 rounded-circle" style={{ width: '56px', height: '56px', backgroundColor: 'var(--bs-primary-bg-subtle, #e8f0fe)' }}>
                          <i className={`${item.icon} text-main fs-5`}></i>
                        </div>
                        <h5 className="fw-bold mb-2">{item.title}</h5>
                        <p className="text-secondary small mb-0">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Careers;
