import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import HowItWorks from '../../components/referral/HowItWorks';
import RewardTiers from '../../components/referral/RewardTiers';
import ReferralForm from '../../components/referral/ReferralForm';
import ReferralTerms from '../../components/referral/ReferralTerms';

const ReferAndEarn = () => {
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
        title="Refer & Earn | Earn up to ₹10,000 with 360Ghar Referral Program"
        description="Know someone selling or renting property? Refer them to 360Ghar and earn ₹100 on successful listing + up to ₹10,000 when the deal completes. No login required."
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
          btnText="Post Property"
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
                    Referral Program
                  </span>
                  <h1 className="refer-hero__title">
                    Know Someone Selling or Renting?
                    <span className="text-gradient"> Earn up to ₹10,000</span>
                  </h1>
                  <p className="refer-hero__desc">
                    Refer a property owner to 360Ghar and earn rewards at every step.
                    Get ₹100 when the property is verified and listed, plus up to ₹10,000
                    when the deal completes successfully.
                  </p>
                  <a href="#referral-form" className="btn btn-main btn-lg">
                    <i className="fas fa-paper-plane me-2"></i>
                    Submit Referral Now
                  </a>
                </div>
              </div>
              <div className="col-lg-6">
                <div className="refer-hero__image">
                  <div className="refer-hero__image-wrapper">
                    <div className="refer-hero__float-card refer-hero__float-card--1">
                      <i className="fas fa-home"></i>
                      <span>Property Verified</span>
                    </div>
                    <div className="refer-hero__float-card refer-hero__float-card--2">
                      <i className="fas fa-rupee-sign"></i>
                      <span>Reward Credited</span>
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
                    <h2 className="section-heading">Submit Your Referral</h2>
                    <p className="section-desc">
                      Fill in the details below to refer a property. Make sure you have the owner&apos;s consent.
                    </p>
                  </div>
                  <ReferralForm />
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
                <h2 className="section-heading text-center mb-40">Frequently Asked Questions</h2>
                <div className="referral-faq-list">
                  <div className="referral-faq-item">
                    <h4>When will I receive my ₹100 onboarding bonus?</h4>
                    <p>The ₹100 bonus is credited within 7 business days after the property is verified and successfully listed on 360Ghar.</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>How is the deal completion bonus calculated?</h4>
                    <p>For rental deals, you receive 10% of the brokerage (max ₹5,000). For sale deals, you receive 5% of the brokerage (max ₹10,000). The bonus is paid after 360Ghar receives its commission.</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>What if someone else refers the same property?</h4>
                    <p>Only the first valid referral submission (determined by timestamp) will be considered for rewards. Duplicate submissions are automatically rejected.</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>Can I refer my own property?</h4>
                    <p>Self-referrals are not eligible for the referral program. However, you can still list your property for free on 360Ghar.</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>Which areas are eligible for the referral program?</h4>
                    <p>Currently, the referral program is active for properties in Gurugram and Delhi NCR regions where 360Ghar operates.</p>
                  </div>
                  <div className="referral-faq-item">
                    <h4>How will I receive my reward?</h4>
                    <p>Rewards are transferred via UPI or Bank Transfer. You&apos;ll need to provide your bank details when claiming the reward.</p>
                  </div>
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

export default ReferAndEarn;
