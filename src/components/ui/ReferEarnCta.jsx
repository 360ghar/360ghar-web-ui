import { I18nLink } from '../../i18n/I18nLink';

const ReferEarnCta = () => {
  return (
    <section className="refer-earn-cta padding-y-60">
      <div className="container container-two">
        <div className="refer-earn-cta__wrapper">
          <div className="row align-items-center g-4">
            <div className="col-lg-7">
              <div className="refer-earn-cta__content">
                <span className="refer-earn-cta__badge">
                  <i className="fas fa-gift"></i>
                  Referral Program
                </span>
                <h2 className="refer-earn-cta__title">
                  Know Someone Selling or Renting?{' '}
                  <span className="text-gradient">Earn up to ₹10,000</span>
                </h2>
                <p className="refer-earn-cta__desc">
                  Refer a property owner to 360Ghar and earn ₹100 when listed + up to ₹10,000
                  when the deal completes. No login required!
                </p>
                <div className="refer-earn-cta__features">
                  <div className="refer-earn-cta__feature">
                    <i className="fas fa-check-circle"></i>
                    <span>₹100 on listing</span>
                  </div>
                  <div className="refer-earn-cta__feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Up to ₹10,000 on deal</span>
                  </div>
                  <div className="refer-earn-cta__feature">
                    <i className="fas fa-check-circle"></i>
                    <span>Instant submission</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-5">
              <div className="refer-earn-cta__action text-lg-end">
                <I18nLink to="/refer-and-earn" className="btn btn-main btn-lg">
                  <i className="fas fa-paper-plane me-2"></i>
                  Start Referring Now
                </I18nLink>
                <p className="refer-earn-cta__note mt-2 mb-0">
                  <i className="fas fa-info-circle me-1"></i>
                  Open to all. No account needed.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ReferEarnCta;
