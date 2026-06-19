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
  const { t } = useTranslation('compare');
  const competitorData = competitor;


  const breadcrumbs = generateCompetitorBreadcrumbs(competitorData.id, 'vs');
  const breadcrumbItems = [
    { name: t('breadcrumb.home'), url: '/' },
    { name: t('breadcrumb.compare'), url: null },
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
    // CRITICAL FIX (audit 4.2): removed fabricated AggregateRating block.
    // Fake review counts/ratings risk a Google manual penalty. Restore only
    // when backed by a real, verified review source.
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
        <section className="compare-hero">
          <div className="container container-two">
            <div className="hero-content">
              <h1 className="hero-title">
                360 Ghar <span className="vs-badge">{t('hero.vs')}</span> {competitorData.name}
              </h1>
              <p className="hero-subtitle">
                {pageDescription}
              </p>
              <div className="hero-buttons">
                <I18nLink to="/properties?city=Gurgaon&intent=buy" className="btn btn-white">
                  {t('hero.browseProperties')}
                  <span className="ms-2"><i className="fas fa-arrow-right"></i></span>
                </I18nLink>
                <I18nLink to="/post-property" className="btn btn-outline-white">
                  {t('hero.listYourProperty')}
                </I18nLink>
              </div>
            </div>
          </div>
        </section>

        {/* Breadcrumb */}
        <CompareBreadcrumb items={breadcrumbItems} />

        {/* AUDIT FIX (4.6): competitor "At a Glance" snapshot adds minimal
            per-competitor differentiation to an otherwise uniform template. */}
        <section className="padding-y-60 bg-white">
          <div className="container container-two">
            <div className="row g-3 text-center">
              {[
                { label: t('compare:atAGlance.founded'), value: competitorData.founded },
                { label: t('compare:atAGlance.valuation'), value: competitorData.valuation },
                { label: t('compare:atAGlance.users'), value: competitorData.users },
                { label: t('compare:atAGlance.cities'), value: competitorData.cities },
              ].map((stat) => (
                <div className="col-md-3 col-6" key={stat.label}>
                  <div className="p-3 rounded-3 border h-100">
                    <small className="text-muted d-block text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}>{stat.label}</small>
                    <strong className="d-block mt-1" style={{ fontSize: '0.95rem' }}>{stat.value || '—'}</strong>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Quick Comparison Summary */}
        <section className="padding-y-120 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle={t('quickComparison.subtitle')}
              subtitleClass="bg-gray-100"
              title={`${t('quickComparison.titlePrefix')} ${competitorData.name}`}
              renderDesc={true}
              desc={t('quickComparison.desc')}
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
              subtitle={t('featureComparison.subtitle')}
              subtitleClass="bg-gray-100"
              title={t('featureComparison.title')}
              renderDesc={true}
              desc={`${t('featureComparison.descPrefix')} ${competitorData.name} ${t('featureComparison.descSuffix')}`}
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
              subtitle={t('claimsVsReality.subtitle')}
              subtitleClass="bg-gray-100"
              title={`${t('claimsVsReality.titlePrefix')} ${competitorData.name} ${t('claimsVsReality.titleSuffix')}`}
              renderDesc={true}
              desc={t('claimsVsReality.desc')}
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
              subtitle={t('userReviews.subtitle')}
              subtitleClass="bg-gray-100"
              title={`${t('userReviews.titlePrefix')} ${competitorData.name}`}
              renderDesc={true}
              desc={t('userReviews.desc')}
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
          title={`${t('faq.titlePrefix')} ${competitorData.name}`}
          subtitle={t('faq.subtitleDefault')}
        />

        {/* See Also — cross-links to truth page and other compares */}
        <section className="padding-y-60 bg-white">
          <div className="container container-two">
            <SectionHeading
              headingClass="text-center"
              subtitle={t('seeAlso.subtitle')}
              subtitleClass="bg-gray-100"
              title={t('seeAlso.title')}
              renderDesc={false}
            />
            <div className="row g-3 mt-3">
              {COMPETITOR_TRUTH_SLUGS[competitorData.id] && (
                <div className="col-md-4">
                  <I18nLink
                    to={`/truth/${COMPETITOR_TRUTH_SLUGS[competitorData.id]}`}
                    className="d-flex align-items-center gap-3 p-3 rounded-3 border text-decoration-none h-100"
                    style={{ color: 'inherit' }}
                  >
                    <i className="fas fa-search text-gradient" style={{ fontSize: '1.25rem' }} />
                    <div>
                      <div className="fw-semibold">{t('seeAlso.truthPrefix')} {competitorData.name}</div>
                      <small className="text-muted">{t('seeAlso.truthDesc')}</small>
                    </div>
                  </I18nLink>
                </div>
              )}
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
                        <div className="fw-semibold">{t('seeAlso.comparePrefix')} {other.name}</div>
                        <small className="text-muted">{t('seeAlso.compareDesc')}</small>
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
            <h3 className="cta-title">{t('cta.title')}</h3>
            <p className="cta-subtitle">{t('cta.subtitle')}</p>
            <div className="mt-4">
              <I18nLink to="/properties?city=Gurgaon&intent=buy" className="btn btn-main">
                {t('cta.findProperty')}
                <span className="ms-2"><i className="fas fa-arrow-right"></i></span>
              </I18nLink>
              <I18nLink to="/post-property" className="btn btn-outline-main">
                {t('cta.listFree')}
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

export default ComparePage;
