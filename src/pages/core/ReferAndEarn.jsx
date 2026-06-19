import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import HowItWorks from '../../components/referral/HowItWorks';
import RewardTiers from '../../components/referral/RewardTiers';
import ReferralForm from '../../components/referral/ReferralForm';
import ReferralTerms from '../../components/referral/ReferralTerms';

const ReferAndEarn = () => {
  const { t } = useTranslation('policies');
  const [tSeo] = useTranslation('seo');
  const [tC] = useTranslation('common');
  const pageStructuredData = [
    {
      '@type': 'WebPage',
      name: 'Refer & Earn - 360Ghar Referral Program',
      url: `${siteMetadata.siteUrl}/refer-and-earn`,
      description: 'Earn up to ₹10,000 by referring properties to 360Ghar. Get ₹100 when property is listed and up to ₹10,000 when deal is completed.',
      isPartOf: { '@type': 'WebSite', name: siteMetadata.siteName, url: siteMetadata.siteUrl },
    },
    generateBreadcrumbStructuredData([
      { name: 'Home', url: 'https://360ghar.com/' },
      { name: 'Refer & Earn', url: 'https://360ghar.com/refer-and-earn' },
    ]),
  ];

  return (
    <>
      <SEO
        title={tSeo('referAndEarn.title')}
        description={tSeo('referAndEarn.description')}
        keywords="360Ghar referral, earn money, property referral, refer and earn, real estate referral program, Gurgaon property referral"
        canonical="/refer-and-earn"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={pageStructuredData}
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

        <section className="refer-hero padding-y-120 bg-gradient-main">
          <div className="container container-two">
            <div className="row align-items-center g-5">
              <div className="col-lg-6">
                <div className="refer-hero__content">
                  <span className="refer-hero__badge">
                    <i className="fas fa-gift me-2"></i>
                    {t('referAndEarn.referralProgram')}
                  </span>
                  <h1 className="refer-hero__title">
                    {t('referAndEarn.heroTitle1')}
                    <span className="text-gradient">{t('referAndEarn.heroTitle2')}</span>
                  </h1>
                  <p className="refer-hero__desc">
                    {t('referAndEarn.heroDesc')}
                  </p>
                  <a href="#referral-form" className="btn btn-main btn-lg">
                    <i className="fas fa-paper-plane me-2"></i>
                    {t('referAndEarn.submitReferral')}
                  </a>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="refer-hero__image">
                  <div className="refer-hero__image-wrapper">
                    <div className="refer-hero__float-card refer-hero__float-card--1">
                      <i className="fas fa-home"></i>
                      <span>{t('referAndEarn.propertyVerified')}</span>
                    </div>
                    <div className="refer-hero__float-card refer-hero__float-card--2">
                      <i className="fas fa-rupee-sign"></i>
                      <span>{t('referAndEarn.rewardCredited')}</span>
                    </div>
                    <div className="refer-hero__illustration">
                      <i className="fas fa-handshake"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <HowItWorks />

        <RewardTiers />

        <section id="referral-form" className="referral-form-section padding-y-120">
          <div className="container container-two">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="referral-form-wrapper">
                  <div className="referral-form-header text-center mb-40">
                    <h2 className="section-heading">{t('referAndEarn.formTitle')}</h2>
                    <p className="section-desc">
                      {t('referAndEarn.formDesc')}
                    </p>
                  </div>
                  <ReferralForm />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT FIX (4.9): clarify the referral link generation & tracking
            mechanism so users understand how their referral is identified,
            tracked, and rewarded. */}
        <section className="referral-tracking padding-y-60 bg-light">
          <div className="container container-two">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h2 className="section-heading text-center mb-3">{tC('contentSeo.referralHowItWorks')}</h2>
                <p className="text-center text-muted mb-4">{tC('contentSeo.referralTrackingDesc')}</p>
                <ol className="referral-tracking-list">
                  <li className="mb-2">{tC('contentSeo.referralStep1')}</li>
                  <li className="mb-2">{tC('contentSeo.referralStep2')}</li>
                  <li className="mb-2">{tC('contentSeo.referralStep3')}</li>
                  <li className="mb-2">{tC('contentSeo.referralStep4')}</li>
                </ol>

                <div className="referral-status-card mt-4 p-4 bg-white rounded-3 border">
                  <h3 className="h6 mb-2">{tC('contentSeo.referralStatusTitle')}</h3>
                  <p className="text-muted small mb-2">{tC('contentSeo.referralStatusDesc')}</p>
                  <p className="text-muted small mb-0">
                    <i className="fas fa-info-circle me-1 text-main"></i>
                    {tC('contentSeo.referralDashboardNote')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <ReferralTerms />

        <section className="referral-faq padding-y-60 bg-light">
          <div className="container container-two">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <h2 className="section-heading text-center mb-40">{t('referAndEarn.faqTitle')}</h2>
                <div className="referral-faq-list">
                  <div className="referral-faq-item">
                    <h4>{t('referAndEarn.faq1Q')}</h4>
                    <p>{t('referAndEarn.faq1A')}</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>{t('referAndEarn.faq2Q')}</h4>
                    <p>{t('referAndEarn.faq2A')}</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>{t('referAndEarn.faq3Q')}</h4>
                    <p>{t('referAndEarn.faq3A')}</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>{t('referAndEarn.faq4Q')}</h4>
                    <p>{t('referAndEarn.faq4A')}</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>{t('referAndEarn.faq5Q')}</h4>
                    <p>{t('referAndEarn.faq5A')}</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>{t('referAndEarn.faq6Q')}</h4>
                    <p>{t('referAndEarn.faq6A')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT FIX (4.3): add CTA section to referral page */}
        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default ReferAndEarn;
