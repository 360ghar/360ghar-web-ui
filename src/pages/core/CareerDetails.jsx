import { useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { careerOpenings } from '../../data/careers';

const CAREERS_EMAIL = 'info@360ghar.com';

const CAREER_DETAILS_LAYOUT = {
  content: {
    'Content Creator Intern': {
      icon: 'fas fa-pen-nib',
      color: '#4f46e5',
      description:
        'As a Content Creator Intern at 360Ghar, you will shape the voice of India\'s emerging property platform. You will research trending real estate topics, write SEO-optimized blog posts, craft engaging social media content, and help build a content engine that drives organic growth. You will also experiment with AI-powered tools to enhance content quality and productivity.',
    },
    'Real Estate Agent': {
      icon: 'fas fa-building',
      color: '#059669',
      description:
        'As a Real Estate Agent Intern at 360Ghar, you will work side-by-side with our brokerage team to connect buyers, sellers, and investors with the right properties in Gurugram. You will conduct property showings, maintain client relationships, negotiate deals, and leverage AI tools for lead scoring and property matching. This is a hands-on role where you will learn the end-to-end property transaction cycle.',
    },
    'Software Developer': {
      icon: 'fas fa-code',
      color: '#7c3aed',
      description:
        'As a Software Developer Intern at 360Ghar, you will build and maintain web applications, APIs, and internal tools that power the 360Ghar platform. You will work with React, Node.js, PostgreSQL, and Python. You will also integrate AI-powered features like smart search, recommendation engines, and content automation. This is a role for someone who wants to see their code directly impact thousands of users.',
    },
  },
};

const getExpandedDescription = (title) => {
  const entry = CAREER_DETAILS_LAYOUT.content[title];
  return entry?.description || '';
};

const CareerDetails = () => {
  const { slug } = useParams();

  const opening = useMemo(
    () => careerOpenings.find((o) => o.slug === slug) ?? null,
    [slug],
  );

  const expandedDesc = opening ? getExpandedDescription(opening.title) : '';

  if (!opening) {
    return (
      <>
        <SEO
          title="Career Not Found | 360Ghar"
          description="The career opening you are looking for could not be found."
          canonical={`/careers/${slug}`}
          image={siteMetadata.defaultOgImage}
          type="website"
        />

        <OffCanvas />
        <MobileMenu />

        <main className="body-bg">
          <Header
            headerClass="dark-header has-border"
            headerMenusClass="mx-auto"
            btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
            btnLink="/post-property"
            btnText="Post Property"
            spanClass="icon-right text-gradient"
            showContactNumber={false}
          />

          <section className="policy-wrapper pt-100 pb-120">
            <div className="container px-lg-5">
              <div className="row justify-content-center">
                <div className="col-lg-8 text-center">
                  <div className="mb-4">
                    <i className="fas fa-exclamation-circle text-warning fs-1"></i>
                  </div>
                  <h2 className="mb-3">Career Opening Not Found</h2>
                  <p className="text-secondary mb-4">
                    The position you are looking for may have been filled or does not exist.
                  </p>
                  <Link to="/careers" className="btn btn-outline-main px-4">
                    <i className="fas fa-arrow-left me-2"></i>
                    Browse All Openings
                  </Link>
                </div>
              </div>
            </div>
          </section>

          <Cta ctaClass="" />

          <Footer />
        </main>
      </>
    );
  }

  const layoutInfo = CAREER_DETAILS_LAYOUT.content[opening.title] || {
    icon: 'fas fa-briefcase',
    color: '#6c757d',
  };

  const jobPostingSchema = {
    '@type': 'JobPosting',
    title: opening.title,
    description: expandedDesc || opening.description,
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
    employmentType: 'INTERNESHIP',
    jobDuration: opening.duration,
    directApply: true,
  };

  const mailtoSubject = encodeURIComponent(
    `Application for ${opening.title} - Career at 360Ghar`,
  );
  const mailtoLink = `mailto:${CAREERS_EMAIL}?subject=${mailtoSubject}`;

  return (
    <>
      <SEO
        title={`${opening.title} at 360Ghar | Internships`}
        description={`${opening.title} internship at 360Ghar in ${opening.location}. Duration: ${opening.duration}. Apply now.`}
        keywords={`360Ghar careers, ${opening.title} internship, ${opening.location} jobs, 360Ghar hiring`}
        canonical={`/careers/${opening.slug}`}
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={jobPostingSchema}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="py-5" style={{ borderBottom: `3px solid ${layoutInfo.color}` }}>
          <div className="container px-lg-5">
            <nav aria-label="Breadcrumb" className="mb-4 careers-inline-breadcrumb">
              <ol className="breadcrumb mb-0">
                <li className="breadcrumb-item">
                  <Link to="/" className="text-decoration-none">Home</Link>
                </li>
                <li className="breadcrumb-item">
                  <Link to="/careers" className="text-decoration-none">Careers</Link>
                </li>
                <li className="breadcrumb-item active text-muted" aria-current="page">
                  {opening.title}
                </li>
              </ol>
            </nav>

            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div
                    className="d-flex align-items-center justify-content-center rounded-3"
                    style={{ width: '52px', height: '52px', backgroundColor: `${layoutInfo.color}15` }}
                  >
                    <i className={`${layoutInfo.icon} fs-4`} style={{ color: layoutInfo.color }}></i>
                  </div>
                  <div>
                    <h1 className="h3 fw-bold mb-0">{opening.title}</h1>
                    <p className="text-muted small mb-0">Internship</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="pt-5 pb-5">
          <div className="container px-lg-5">
            <div className="row g-4 justify-content-center">
              {/* Main Content */}
              <div className="col-lg-8">
                {/* Quick Info Bar */}
                <div className="card border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
                  <div className="card-body p-4">
                    <div className="row g-3 text-center">
                      <div className="col-6 col-md-3">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-map-marker-alt text-main mb-2"></i>
                          <span className="small text-muted d-block">Location</span>
                          <span className="fw-semibold small">{opening.location}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-clock text-main mb-2"></i>
                          <span className="small text-muted d-block">Duration</span>
                          <span className="fw-semibold small">{opening.duration}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-tag text-main mb-2"></i>
                          <span className="small text-muted d-block">Type</span>
                          <span className="fw-semibold small text-capitalize">{opening.type}</span>
                        </div>
                      </div>
                      <div className="col-6 col-md-3">
                        <div className="d-flex flex-column align-items-center">
                          <i className="fas fa-map text-main mb-2"></i>
                          <span className="small text-muted d-block">Department</span>
                          <span className="fw-semibold small">{opening.title.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* About */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5">
                    <h2 className="h5 fw-bold mb-3">About This Internship</h2>
                    <p className="text-secondary lh-lg">{expandedDesc || opening.description}</p>
                  </div>
                </div>

                {/* Requirements */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5">
                    <h2 className="h5 fw-bold mb-3">What We&apos;re Looking For</h2>
                    <ul className="list-unstyled mb-0">
                      {opening.requirements.map((req, index) => (
                        <li key={index} className="d-flex align-items-start gap-3 py-2">
                          <i className="fas fa-check-circle text-success mt-1 flex-shrink-0" style={{ fontSize: '0.8rem' }}></i>
                          <span className="text-secondary">{req}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* What You&apos;ll Learn */}
                <div className="card border-0 shadow-sm rounded-4 mb-4">
                  <div className="card-body p-4 p-lg-5">
                    <h2 className="h5 fw-bold mb-3">What You&apos;ll Learn</h2>
                    <p className="text-secondary lh-lg">
                      At 360Ghar, interns work on real products with real impact. You will gain hands-on experience,
                      receive direct mentorship from the founding team, and build a portfolio piece that users actually use.
                      High-performing interns may receive extended opportunities or full-time offers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar - Apply CTA */}
              <div className="col-lg-4">
                <div className="card border-0 shadow-sm rounded-4 sticky-lg-top" style={{ top: '2rem' }}>
                  <div className="card-body p-4">
                    <h3 className="h5 fw-bold mb-3">Ready to Apply?</h3>
                    <p className="text-secondary small mb-4">
                      Send your resume, portfolio, or a quick note about yourself to our team.
                    </p>

                    <div className="mb-4">
                      <a
                        href={mailtoLink}
                        className="btn btn-main w-100 mb-2"
                        role="button"
                      >
                        <i className="fas fa-paper-plane me-2"></i>
                        Apply Now
                      </a>
                      <a
                        href={`mailto:${CAREERS_EMAIL}`}
                        className="btn btn-outline-main w-100"
                        role="button"
                      >
                        <i className="fas fa-envelope me-2"></i>
                        Open Email Client
                      </a>
                    </div>

                    <hr />

                    <div className="text-center">
                      <p className="text-muted small mb-2">Or email us directly at</p>
                      <a href={`mailto:${CAREERS_EMAIL}`} className="text-main fw-semibold small text-decoration-none">
                        {CAREERS_EMAIL}
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back to all openings */}
        <section className="py-5 bg-light-subtle">
          <div className="container px-lg-5">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h3 className="h5 fw-bold mb-2">Interested in other roles?</h3>
                <p className="text-secondary mb-3">Check out all our open internships.</p>
                <Link to="/careers" className="btn btn-outline-main px-4">
                  <i className="fas fa-arrow-left me-2"></i>
                  Browse All Openings
                </Link>
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

export default CareerDetails;
