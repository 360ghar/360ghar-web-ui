import { Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import SectionHeading from '../../common/ui/SectionHeading';
import {
  ComparisonTable,
  WhyChooseUs,
  TestimonialCard,
  ComparisonFAQ,
  QuickComparison,
  ClaimsVsReality,
  CompareBreadcrumb
} from '../../components/compare/ComparisonComponents';
import { competitors, comparisonFeatures, generateCompetitorBreadcrumbs } from '../../data/competitors';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import '../../components/compare/ComparisonStyles.scss';

// Mapping from competitor id to corresponding truth page slug
const COMPETITOR_TRUTH_SLUGS = {
  nobroker: 'nobroker-listings',
  magicbricks: 'magicbricks-spam',
  '99acres': '99acres-fake',
  nestaway: 'nestaway-collapse',
  zolo: 'zolo-issues',
};

const ALL_COMPARE_SLUGS = Object.keys(competitors);

function getOtherCompares(currentId, count = 3) {
  return ALL_COMPARE_SLUGS.filter((id) => id !== currentId).slice(0, count);
}

const ComparePage = ({ 
  competitor,
  pageTitle,
  pageDescription,
  canonicalPath
}) => {
  const competitorData = competitor;
  
  const breadcrumbs = generateCompetitorBreadcrumbs(competitorData.id, 'vs');
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Compare', url: null },
    { name: `${competitorData.name}`, url: null }
  ];
  
  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    {
      '@type': 'WebPage',
      name: pageTitle,
      description: pageDescription,
      url: `https://360ghar.com${canonicalPath}`,
    },
    {
      '@type': 'FAQPage',
      mainEntity: competitorData.faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    },
    {
      '@type': 'AggregateRating',
      itemReviewed: {
        '@type': 'Product',
        name: `360Ghar vs ${competitorData.name} Comparison`,
      },
      ratingValue: '4.8',
      reviewCount: '128',
      bestRating: '5',
      worstRating: '1',
    }
  ];

  return (
    <>
      <SEO
        title={pageTitle}
        description={pageDescription}
        keywords={competitorData.seoKeywords}
        canonical={canonicalPath}
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
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />
        
        {/* Hero Section */}
        <section className="compare-hero">
          <div className="container container-two">
            <div className="hero-content">
              <h1 className="hero-title">
                360 Ghar <span className="vs-badge">vs</span> {competitorData.name}
              </h1>
              <p className="hero-subtitle">
                {pageDescription}
              </p>
              <div className="hero-buttons">
                <Link to="/properties?city=Gurgaon&intent=buy" className="btn btn-white">
                  Browse Properties
                  <span className="ms-2"><i className="fas fa-arrow-right"></i></span>
                </Link>
                <Link to="/post-property" className="btn btn-outline-white">
                  List Your Property
                </Link>
              </div>
            </div>
          </div>
        </section>
        
        {/* Breadcrumb */}
        <CompareBreadcrumb items={breadcrumbItems} />
        
        {/* Quick Comparison Summary */}
        <section className="padding-y-120 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="Quick Comparison"
              subtitleClass="bg-gray-100"
              title={`Why 360 Ghar Beats ${competitorData.name}`}
              renderDesc={true}
              desc="See how we stack up against the competition in key areas that matter most to property seekers"
            />
            
            <div className="row mt-4">
              <div className="col-lg-8 mx-auto">
                <QuickComparison 
                  features={comparisonFeatures}
                  competitorFeatures={competitorData.comparisonFeatures}
                  competitorName={competitorData.name}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Detailed Comparison Table */}
        <section className="padding-y-120 bg-light">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="Feature Comparison"
              subtitleClass="bg-gray-100"
              title="Detailed Feature-by-Feature Analysis"
              renderDesc={true}
              desc={`A comprehensive look at how 360 Ghar compares to ${competitorData.name} across all important features`}
            />
            
            <div className="row mt-4">
              <div className="col-lg-10 mx-auto">
                <ComparisonTable 
                  features={comparisonFeatures}
                  competitorFeatures={competitorData.comparisonFeatures}
                  competitorName={competitorData.name}
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Claims vs Reality */}
        <section className="padding-y-120 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="The Truth"
              subtitleClass="bg-gray-100"
              title={`What ${competitorData.name} Claims vs Reality`}
              renderDesc={true}
              desc="We investigated the marketing promises to find out what users actually experience"
            />
            
            <div className="row mt-4">
              <div className="col-lg-8 mx-auto">
                <ClaimsVsReality claims={competitorData.claimsVsReality} />
              </div>
            </div>
          </div>
        </section>
        
        {/* 360 Ghar Advantages */}
        <WhyChooseUs />
        
        {/* User Testimonials */}
        <section className="padding-y-120 bg-light">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="User Reviews"
              subtitleClass="bg-gray-100"
              title={`What Users Say About ${competitorData.name}`}
              renderDesc={true}
              desc="Real feedback from users who have experienced the platform firsthand"
            />
            
            <div className="row g-4 mt-4">
              {competitorData.testimonials.map((testimonial, index) => (
                <div className="col-lg-4 col-md-6" key={index}>
                  <TestimonialCard {...testimonial} />
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* FAQ Section */}
        <ComparisonFAQ 
          faqs={competitorData.faqs}
          title={`Common Questions About ${competitorData.name}`}
          subtitle="Get answers to frequently asked questions"
        />
        
        {/* See Also — cross-links to truth page and other compares */}
        <section className="padding-y-60 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="Related"
              subtitleClass="bg-gray-100"
              title="See Also"
              renderDesc={false}
            />
            <div className="row g-3 mt-3">
              {COMPETITOR_TRUTH_SLUGS[competitorData.id] && (
                <div className="col-md-4">
                  <Link
                    to={`/truth/${COMPETITOR_TRUTH_SLUGS[competitorData.id]}`}
                    className="d-flex align-items-center gap-3 p-3 rounded-3 border text-decoration-none h-100"
                    style={{ color: 'inherit' }}
                  >
                    <i className="fas fa-search text-gradient" style={{ fontSize: '1.25rem' }} />
                    <div>
                      <div className="fw-semibold">The Truth About {competitorData.name}</div>
                      <small className="text-muted">Investigate real user experiences</small>
                    </div>
                  </Link>
                </div>
              )}
              {getOtherCompares(competitorData.id).map((otherId) => {
                const other = competitors[otherId];
                return (
                  <div className="col-md-4" key={otherId}>
                    <Link
                      to={`/vs/${otherId}`}
                      className="d-flex align-items-center gap-3 p-3 rounded-3 border text-decoration-none h-100"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-exchange-alt text-gradient" style={{ fontSize: '1.25rem' }} />
                      <div>
                        <div className="fw-semibold">360Ghar vs {other.name}</div>
                        <small className="text-muted">Compare features side-by-side</small>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="compare-cta-section">
          <div className="container container-two">
            <h3 className="cta-title">Ready to Experience the 360 Ghar Difference?</h3>
            <p className="cta-subtitle">Join thousands of happy property seekers who made the switch</p>
            <div className="mt-4">
              <Link to="/properties?city=Gurgaon&intent=buy" className="btn btn-main">
                Find Your Perfect Property
                <span className="ms-2"><i className="fas fa-arrow-right"></i></span>
              </Link>
              <Link to="/post-property" className="btn btn-outline-main">
                List Your Property Free
              </Link>
            </div>
          </div>
        </section>
        
        <Cta ctaClass="" />
        
        <Footer />
      </main>
    </>
  );
};

export default ComparePage;
