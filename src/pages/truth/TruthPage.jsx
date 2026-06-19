import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import SectionHeading from '../../common/ui/SectionHeading';
import {
  WhyChooseUs,
  TestimonialCard,
  ComparisonFAQ,
  ClaimsVsReality,
  IssueCard,
  CompareBreadcrumb
} from '../../components/compare/ComparisonComponents';
import { competitors, generateCompetitorBreadcrumbs } from '../../data/competitors';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { siteMetadata } from '../../seo/siteMetadata';
import '../../components/compare/ComparisonStyles.scss';

const ALL_COMPARE_SLUGS = Object.keys(competitors);

function getOtherCompares(currentId, count = 3) {
  return ALL_COMPARE_SLUGS.filter((id) => id !== currentId).slice(0, count);
}

const TruthPage = ({
  competitor,
  pageTitle,
  pageDescription,
  canonicalPath,
  truthTitle,
  introText,
  keyIssues
}) => {
  const { t } = useTranslation('truth');
  const competitorData = competitor;
  
  const breadcrumbs = generateCompetitorBreadcrumbs(competitorData.id, 'truth');
  const breadcrumbItems = [
    { name: 'Home', url: '/' },
    { name: 'Truth', url: null },
    { name: `${competitorData.name}`, url: null }
  ];
  
  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    {
      '@type': 'Article',
      headline: pageTitle,
      name: pageTitle,
      description: pageDescription,
      url: `https://360ghar.com${canonicalPath}`,
      datePublished: new Date().toISOString(),
      dateModified: new Date().toISOString(),
      image: siteMetadata.defaultOgImage,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://360ghar.com${canonicalPath}`
      },
      author: {
        '@type': 'Organization',
        name: '360Ghar'
      },
      publisher: {
        '@type': 'Organization',
        name: '360Ghar',
        logo: {
          '@type': 'ImageObject',
          url: siteMetadata.defaultOgImage
        }
      }
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
          btnText={t('common:header.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />
        
        {/* Hero Section */}
        <section className="truth-hero">
          <div className="container container-two">
            <div className="hero-content text-center">
              <h1 className="hero-title">{truthTitle}</h1>
              <p className="hero-subtitle" style={{ maxWidth: '700px', marginLeft: 'auto', marginRight: 'auto' }}>
                {introText}
              </p>
              <div className="hero-buttons mt-4">
                <I18nLink to="/properties?city=Gurgaon&intent=buy" className="btn btn-white">
                  Try Transparent Alternative
                  <span className="ms-2"><i className="fas fa-arrow-right"></i></span>
                </I18nLink>
              </div>
            </div>
          </div>
        </section>
        
        {/* Breadcrumb */}
        <CompareBreadcrumb items={breadcrumbItems} />
        
        {/* The Truth Section */}
        <section className="padding-y-120 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="Investigation"
              subtitleClass="bg-gray-100"
              title={`The Claims vs Reality`}
              renderDesc={true}
              desc={`What ${competitorData.name} promises vs what users actually experience`}
            />
            
            <div className="row mt-4">
              <div className="col-lg-8 mx-auto">
                <ClaimsVsReality claims={competitorData.claimsVsReality} />
              </div>
            </div>
          </div>
        </section>
        
        {/* Key Issues Section */}
        {keyIssues && keyIssues.length > 0 && (
          <section className="padding-y-120 bg-light">
            <div className="container container-two">
              <SectionHeading
                headingClass="text-center"
                subtitle="Documented Issues"
                subtitleClass="bg-gray-100"
                title={`Key Problems Reported`}
                renderDesc={true}
                desc="Verified issues that users have experienced with this platform"
              />
              
              <div className="row g-4 mt-4">
                {keyIssues.map((issue, index) => (
                  <div className="col-lg-6" key={index}>
                    <IssueCard {...issue} />
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
        
        {/* User Testimonials About Issues */}
        <section className="padding-y-120 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="User Experiences"
              subtitleClass="bg-gray-100"
              title={`What Users Actually Experience`}
              renderDesc={true}
              desc="Real reviews from people who have used this platform"
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
        
        {/* How 360 Ghar Does It Better */}
        <WhyChooseUs />
        
        {/* FAQ Section */}
        <ComparisonFAQ
          faqs={competitorData.faqs}
          title={`Common Questions Answered`}
          subtitle="Get the facts you need to make an informed decision"
        />

        {/* Compare — cross-link to compare page and other competitors */}
        <section className="padding-y-60 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle="Compare"
              subtitleClass="bg-gray-100"
              title="Compare Side-by-Side"
              renderDesc={false}
            />
            <div className="row g-3 mt-3">
              <div className="col-md-4">
                <I18nLink
                  to={`/vs/${competitorData.id}`}
                  className="d-flex align-items-center gap-3 p-3 rounded-3 border text-decoration-none h-100"
                  style={{ color: 'inherit' }}
                >
                  <i className="fas fa-exchange-alt text-gradient" style={{ fontSize: '1.25rem' }} />
                  <div>
                    <div className="fw-semibold">360Ghar vs {competitorData.name}</div>
                    <small className="text-muted">Feature-by-feature comparison</small>
                  </div>
                </I18nLink>
              </div>
              {getOtherCompares(competitorData.id).map((otherId) => {
                const other = competitors[otherId];
                return (
                  <div className="col-md-4" key={otherId}>
                    <I18nLink
                      to={`/vs/${otherId}`}
                      className="d-flex align-items-center gap-3 p-3 rounded-3 border text-decoration-none h-100"
                      style={{ color: 'inherit' }}
                    >
                      <i className="fas fa-exchange-alt text-gradient" style={{ fontSize: '1.25rem' }} />
                      <div>
                        <div className="fw-semibold">360Ghar vs {other.name}</div>
                        <small className="text-muted">See how they compare</small>
                      </div>
                    </I18nLink>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="compare-cta-section">
          <div className="container container-two">
            {/* AUDIT FIX (4.7): softened language to reduce legal liability */}
            <h3 className="cta-title">Prefer a Verified, Transparent Alternative?</h3>
            <p className="cta-subtitle">Explore physically verified properties with 360° virtual tours on 360 Ghar</p>
            <div className="mt-4">
              <I18nLink to="/properties?city=Gurgaon&intent=buy" className="btn btn-main">
                Start Your Property Search
                <span className="ms-2"><i className="fas fa-arrow-right"></i></span>
              </I18nLink>
            </div>
          </div>
        </section>
        
        <Cta ctaClass="" />
        
        <Footer />
      </main>
    </>
  );
};

export default TruthPage;
