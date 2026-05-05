import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

const PropertyInvestment = () => {
  const { t } = useTranslation('policies');

  const breadcrumbs = [
    { name: t('propertyInvestment.breadcrumbHome'), url: 'https://360ghar.com/' },
    { name: t('propertyInvestment.breadcrumbCurrent'), url: 'https://360ghar.com/property-investment-gurugram' },
  ];

  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    {
      '@type': 'Article',
      headline: t('propertyInvestment.seoTitle'),
      description: t('propertyInvestment.seoDescription'),
      image: '/assets/images/logo/logo.png',
      author: {
        '@type': 'Organization',
        name: '360Ghar'
      },
      publisher: {
        '@type': 'Organization',
        name: '360Ghar'
      },
      datePublished: '2024-01-01',
      dateModified: new Date().toISOString(),
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': 'https://360ghar.com/property-investment-gurugram'
      }
    }
  ];

  return (
    <>
      <SEO
        title={t('propertyInvestment.seoTitle')}
        description={t('propertyInvestment.seoDescription')}
        keywords={t('propertyInvestment.seoKeywords')}
        canonical="/property-investment-gurugram"
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

        <section className="padding-y-120">
          <div className="container container-two">
            <nav aria-label="breadcrumb" className="mb-4">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><I18nLink to="/">{t('propertyInvestment.breadcrumbHome')}</I18nLink></li>
                <li className="breadcrumb-item active" aria-current="page">{t('propertyInvestment.breadcrumbCurrent')}</li>
              </ol>
            </nav>

            <div className="section-heading text-center mb-5">
              <h1 className="section-heading__title">{t('propertyInvestment.pageTitle')}</h1>
              <p className="section-heading__desc">
                {t('propertyInvestment.pageDesc')}
              </p>
            </div>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                <article className="blog-details">
                  <div className="blog-details__content">
                    <h2>{t('propertyInvestment.whyInvest')}</h2>
                    <p>
                      {t('propertyInvestment.whyInvestDesc')}
                    </p>

                    <h3>{t('propertyInvestment.keyAdvantages')}</h3>
                    <ul>
                      <li><strong>{t('propertyInvestment.advantageLocation')}</strong></li>
                      <li><strong>{t('propertyInvestment.advantageEconomy')}</strong></li>
                      <li><strong>{t('propertyInvestment.advantageInfra')}</strong></li>
                      <li><strong>{t('propertyInvestment.advantageDemand')}</strong></li>
                      <li><strong>{t('propertyInvestment.advantageLegal')}</strong></li>
                    </ul>

                    <h2>{t('propertyInvestment.bestAreas')}</h2>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-body">
                            <h5 className="card-title">{t('propertyInvestment.dlfTitle')}</h5>
                            <p className="card-text">{t('propertyInvestment.dlfDesc')}</p>
                            <ul className="list-unstyled">
                              <li><strong>{t('propertyInvestment.dlfRoi')}</strong></li>
                              <li><strong>{t('propertyInvestment.dlfYield')}</strong></li>
                              <li><strong>{t('propertyInvestment.dlfRisk')}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-body">
                            <h5 className="card-title">{t('propertyInvestment.sohnaTitle')}</h5>
                            <p className="card-text">{t('propertyInvestment.sohnaDesc')}</p>
                            <ul className="list-unstyled">
                              <li><strong>{t('propertyInvestment.sohnaRoi')}</strong></li>
                              <li><strong>{t('propertyInvestment.sohnaYield')}</strong></li>
                              <li><strong>{t('propertyInvestment.sohnaRisk')}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="row mb-4">
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-body">
                            <h5 className="card-title">{t('propertyInvestment.sectorTitle')}</h5>
                            <p className="card-text">{t('propertyInvestment.sectorDesc')}</p>
                            <ul className="list-unstyled">
                              <li><strong>{t('propertyInvestment.sectorRoi')}</strong></li>
                              <li><strong>{t('propertyInvestment.sectorYield')}</strong></li>
                              <li><strong>{t('propertyInvestment.sectorRisk')}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="card h-100">
                          <div className="card-body">
                            <h5 className="card-title">{t('propertyInvestment.newGurugramTitle')}</h5>
                            <p className="card-text">{t('propertyInvestment.newGurugramDesc')}</p>
                            <ul className="list-unstyled">
                              <li><strong>{t('propertyInvestment.newGurugramRoi')}</strong></li>
                              <li><strong>{t('propertyInvestment.newGurugramYield')}</strong></li>
                              <li><strong>{t('propertyInvestment.newGurugramRisk')}</strong></li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    <h2>{t('propertyInvestment.strategies')}</h2>

                    <h3>{t('propertyInvestment.strategy1Title')}</h3>
                    <p>
                      {t('propertyInvestment.strategy1Desc')}
                    </p>

                    <h3>{t('propertyInvestment.strategy2Title')}</h3>
                    <p>
                      {t('propertyInvestment.strategy2Desc')}
                    </p>

                    <h3>{t('propertyInvestment.strategy3Title')}</h3>
                    <p>
                      {t('propertyInvestment.strategy3Desc')}
                    </p>

                    <h3>{t('propertyInvestment.strategy4Title')}</h3>
                    <p>
                      {t('propertyInvestment.strategy4Desc')}
                    </p>

                    <h2>{t('propertyInvestment.marketTrends')}</h2>
                    <ul>
                      <li><strong>{t('propertyInvestment.trendAffordable')}</strong></li>
                      <li><strong>{t('propertyInvestment.trendColiving')}</strong></li>
                      <li><strong>{t('propertyInvestment.trendVirtual')}</strong></li>
                      <li><strong>{t('propertyInvestment.trendGreen')}</strong></li>
                      <li><strong>{t('propertyInvestment.trendSmart')}</strong></li>
                    </ul>

                    <h2>{t('propertyInvestment.riskFactors')}</h2>
                    <ul>
                      <li><strong>{t('propertyInvestment.riskVolatility')}</strong></li>
                      <li><strong>{t('propertyInvestment.riskLiquidity')}</strong></li>
                      <li><strong>{t('propertyInvestment.riskRegulatory')}</strong></li>
                      <li><strong>{t('propertyInvestment.riskLocation')}</strong></li>
                      <li><strong>{t('propertyInvestment.riskEconomic')}</strong></li>
                    </ul>

                    <h2>{t('propertyInvestment.howToStart')}</h2>
                    <ol>
                      <li><strong>{t('propertyInvestment.step1')}</strong></li>
                      <li><strong>{t('propertyInvestment.step2')}</strong></li>
                      <li><strong>{t('propertyInvestment.step3')}</strong></li>
                      <li><strong>{t('propertyInvestment.step4')}</strong></li>
                      <li><strong>{t('propertyInvestment.step5')}</strong></li>
                    </ol>

                    <div className="alert alert-info mt-4">
                      <h5>{t('propertyInvestment.proTipTitle')}</h5>
                      <p>
                        {t('propertyInvestment.proTipDesc')}
                      </p>
                    </div>

                    <div className="text-center mt-5">
                      <I18nLink to="/properties" className="btn btn-main me-3">{t('propertyInvestment.exploreProperties')}</I18nLink>
                      <I18nLink to="/gurugram-real-estate-guide" className="btn btn-outline-main">{t('propertyInvestment.readGuide')}</I18nLink>
                    </div>
                  </div>
                </article>
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

export default PropertyInvestment;
