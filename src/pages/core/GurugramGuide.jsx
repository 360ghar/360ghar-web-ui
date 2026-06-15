import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

import LazyImage from '../../common/ui/LazyImage';
const GurugramGuide = () => {
  const { t } = useTranslation('policies');
  const breadcrumbs = [
    { name: 'Home', url: 'https://360ghar.com/' },
    { name: 'Gurugram Real Estate Guide', url: 'https://360ghar.com/gurugram-real-estate-guide' },
  ];

  const structuredData = [
    generateBreadcrumbStructuredData(breadcrumbs),
    {
      '@type': 'Article',
      headline: 'Complete Guide to Real Estate in Gurugram 2024',
      description: 'Comprehensive guide to buying, selling, and renting properties in Gurugram. Learn about top locations, property prices, market trends, and investment opportunities.',
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
        '@id': 'https://360ghar.com/gurugram-real-estate-guide'
      }
    }
  ];

  return (
    <>
      <SEO
        title={t('gurugramGuide.seoTitle')}
        description={t('gurugramGuide.seoDescription')}
        keywords={t('gurugramGuide.seoKeywords')}
        canonical="/gurugram-real-estate-guide"
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
                <li className="breadcrumb-item"><I18nLink to="/">{t('gurugramGuide.breadcrumbHome')}</I18nLink></li>
                <li className="breadcrumb-item active" aria-current="page">{t('gurugramGuide.breadcrumbCurrent')}</li>
              </ol>
            </nav>

            <div className="section-heading text-center mb-5">
              <h1 className="section-heading__title">{t('gurugramGuide.pageTitle')}</h1>
              <p className="section-heading__desc">
                {t('gurugramGuide.pageDesc')}
              </p>
            </div>

            <div className="row">
              <div className="col-lg-8 mx-auto">
                <article className="blog-details">
                  <div className="blog-details__thumb mb-4">
                    <LazyImage
                      src="/assets/images/blog/gurugram-guide.webp"
                      alt="Gurugram Real Estate Market Overview"
                      className="img-fluid rounded"
                      priority
                      onError={(e) => {
                        e.target.src = '/assets/images/logo/logo.png';
                      }}
                    />
                  </div>

                  <div className="blog-details__content">
                    <h2>{t('gurugramGuide.whyInvestTitle')}</h2>
                    <p>
                      {t('gurugramGuide.whyInvestDesc')}
                    </p>

                    <h3>{t('gurugramGuide.keyAdvantages')}</h3>
                    <ul>
                      <li>{t('gurugramGuide.advantageLocation')}</li>
                      <li>{t('gurugramGuide.advantageEconomic')}</li>
                      <li>{t('gurugramGuide.advantageInfrastructure')}</li>
                      <li>{t('gurugramGuide.advantageROI')}</li>
                      <li>{t('gurugramGuide.advantageLifestyle')}</li>
                    </ul>

                    <h2>{t('gurugramGuide.topLocations')}</h2>

                    <h3>{t('gurugramGuide.dlfTitle')}</h3>
                    <p>
                      {t('gurugramGuide.dlfDesc')}
                    </p>

                    <h3>{t('gurugramGuide.golfCourseTitle')}</h3>
                    <p>
                      {t('gurugramGuide.golfCourseDesc')}
                    </p>

                    <h3>{t('gurugramGuide.sohnaTitle')}</h3>
                    <p>
                      {t('gurugramGuide.sohnaDesc')}
                    </p>

                    <h3>{t('gurugramGuide.cyberCityTitle')}</h3>
                    <p>
                      {t('gurugramGuide.cyberCityDesc')}
                    </p>

                    <h2>{t('gurugramGuide.priceTitle')}</h2>
                    <div className="table-responsive mb-4">
                      <table className="table table-bordered">
                        <thead>
                          <tr>
                            <th>{t('gurugramGuide.thLocation')}</th>
                            <th>{t('gurugramGuide.th2bhkBuy')}</th>
                            <th>{t('gurugramGuide.th3bhkBuy')}</th>
                            <th>{t('gurugramGuide.th2bhkRent')}</th>
                            <th>{t('gurugramGuide.th3bhkRent')}</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr>
                            <td>DLF Phase</td>
                            <td>₹2-4 Cr</td>
                            <td>₹4-8 Cr</td>
                            <td>₹45,000-85,000</td>
                            <td>₹75,000-1.5L</td>
                          </tr>
                          <tr>
                            <td>Golf Course Road</td>
                            <td>₹3-6 Cr</td>
                            <td>₹6-12 Cr</td>
                            <td>₹60,000-1.2L</td>
                            <td>₹1-2.5L</td>
                          </tr>
                          <tr>
                            <td>Sohna Road</td>
                            <td>₹50L-1.5 Cr</td>
                            <td>₹80L-3 Cr</td>
                            <td>₹15,000-45,000</td>
                            <td>₹25,000-75,000</td>
                          </tr>
                          <tr>
                            <td>Cyber City</td>
                            <td>₹1.5-3 Cr</td>
                            <td>₹2.5-6 Cr</td>
                            <td>₹35,000-70,000</td>
                            <td>₹55,000-1.2L</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>

                    <h2>{t('gurugramGuide.marketTrends')}</h2>
                    <ul>
                      <li>{t('gurugramGuide.trendDemand')}</li>
                      <li>{t('gurugramGuide.trendAffordable')}</li>
                      <li>{t('gurugramGuide.trendVirtual')}</li>
                      <li>{t('gurugramGuide.trendGreen')}</li>
                      <li>{t('gurugramGuide.trendColiving')}</li>
                    </ul>

                    <h2>{t('gurugramGuide.investmentTitle')}</h2>
                    <p>
                      {t('gurugramGuide.investmentDesc')}
                    </p>
                    <ul>
                      <li>{t('gurugramGuide.investUnderConstruction')}</li>
                      <li>{t('gurugramGuide.investRentalYield')}</li>
                      <li>{t('gurugramGuide.investAppreciation')}</li>
                      <li>{t('gurugramGuide.investCommercial')}</li>
                      <li>{t('gurugramGuide.investLandBanking')}</li>
                    </ul>

                    <h2>{t('gurugramGuide.howHelpTitle')}</h2>
                    <p>
                      {t('gurugramGuide.howHelpDesc')}
                    </p>
                    <ul>
                      <li>{t('gurugramGuide.helpVerified')}</li>
                      <li>{t('gurugramGuide.helpVirtualTours')}</li>
                      <li>{t('gurugramGuide.helpMarketInsights')}</li>
                      <li>{t('gurugramGuide.helpExpertGuidance')}</li>
                      <li>{t('gurugramGuide.helpFreeListing')}</li>
                    </ul>

                    <div className="text-center mt-5">
                      <I18nLink to="/properties" className="btn btn-main me-3">{t('gurugramGuide.browseProperties')}</I18nLink>
                      <I18nLink to="/post-property" className="btn btn-outline-main">{t('gurugramGuide.listYourProperty')}</I18nLink>
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

export default GurugramGuide;
