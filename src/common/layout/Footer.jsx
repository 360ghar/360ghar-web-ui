import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import SocialList from '../ui/SocialList';
import FooterLogoDesc from './footer/FooterLogoDesc';
import FooterServiceItem from './footer/FooterServiceItem';
import FooterUsefulItem from './footer/FooterUsefulItem';
import FooterBottom from './FooterBottom';
import LanguageSwitcher from './LanguageSwitcher';

const Footer = () => {
    const { t } = useTranslation('common');
    return (
        <>
            {/* =============================== Footer Section Start ============================== */}
            <footer className="footer padding-y-120">
                <div className="container container-two">
                    <div className="row gy-5">

                        {/* Company Info and Newsletter */}
                        <div className="col-xl-4 col-lg-6 col-sm-12">
                            <div className="footer-item">
                                <FooterLogoDesc/>
                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-xl-2 col-lg-6 col-sm-6 col-xsm-6">
                            <FooterUsefulItem/>
                        </div>

                        {/* Services */}
                        <div className="col-xl-2 col-lg-6 col-sm-6 col-xsm-6">
                            <FooterServiceItem/>
                        </div>

                        {/* Legal & Social */}
                        <div className="col-xl-4 col-lg-6 col-sm-12">
                            <div className="footer-item">
                                <h6 className="footer-item__title mb-4">{t('footer.connectWithUs')}</h6>
                                <p className="footer-item__desc mb-3">{t('footer.stayUpdatedDesc')}</p>
                                <SocialList/>

                                <div className="mt-3">
                                    <LanguageSwitcher variant="dark" />
                                </div>

                                <div className="mt-4">
                                    <h6 className="footer-item__title mb-3">{t('footer.quickActions')}</h6>
                                    <div className="footer-quick-actions d-flex flex-column gap-2">
                                        <I18nLink to="/properties" className="btn btn-outline-lightInDark btn-sm text-start">
                                            <i className="fas fa-search me-2"></i>
                                            {t('footer.searchProperties')}
                                        </I18nLink>
                                        <I18nLink to="/post-property" className="btn btn-outline-lightInDark btn-sm text-start">
                                            <i className="fas fa-home me-2"></i>
                                            {t('footer.listYourProperty')}
                                        </I18nLink>
                                        <I18nLink to="/project" className="btn btn-outline-lightInDark btn-sm text-start">
                                            <i className="fas fa-building me-2"></i>
                                            {t('footer.viewProjects')}
                                        </I18nLink>
                                        <I18nLink to="/account" className="btn btn-outline-lightInDark btn-sm text-start">
                                            <i className="fas fa-user-circle me-2"></i>
                                            {t('footer.myAccount')}
                                        </I18nLink>
                                        <I18nLink to="/contact" className="btn btn-outline-lightInDark btn-sm text-start">
                                            <i className="fas fa-envelope me-2"></i>
                                            {t('footer.contactExperts')}
                                        </I18nLink>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="footer-trust-badges mt-5 pt-5 border-top border-secondary">
                        <div className="footer-trust-badges__inner">
                            <div className="trust-badges d-flex flex-wrap align-items-center gap-3 justify-content-center justify-content-lg-start">
                                <div className="trust-badge d-flex align-items-center gap-2">
                                    <i className="fas fa-cube text-gradient flex-shrink-0"></i>
                                    <span className="text-white small">{t('footer.virtualTours')}</span>
                                </div>
                                <div className="trust-badge d-flex align-items-center gap-2">
                                    <i className="fas fa-certificate text-gradient flex-shrink-0"></i>
                                    <span className="text-white small">{t('footer.verifiedProperties')}</span>
                                </div>
                                <div className="trust-badge d-flex align-items-center gap-2">
                                    <i className="fas fa-lock text-gradient flex-shrink-0"></i>
                                    <span className="text-white small">{t('footer.secureBooking')}</span>
                                </div>
                                <div className="trust-badge d-flex align-items-center gap-2">
                                    <i className="fas fa-users text-gradient flex-shrink-0"></i>
                                    <span className="text-white small">{t('footer.expertSupport')}</span>
                                </div>
                                <div className="trust-badge d-flex align-items-center gap-2">
                                    <i className="fas fa-rupee-sign text-gradient flex-shrink-0"></i>
                                    <span className="text-white small">{t('footer.bestPriceGuarantee')}</span>
                                </div>
                            </div>
                            <div className="footer-contact-quick text-center text-lg-end mt-4 mt-lg-0">
                                <h6 className="text-white mb-2">{t('footer.needHelp')}</h6>
                                <p className="text-white small mb-2">{t('footer.emailExperts')}</p>
                                <a href="mailto:info@360ghar.com" className="btn btn-main btn-sm">
                                    <i className="fas fa-envelope me-2"></i>
                                    info@360ghar.com
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* bottom Footer */}
            <FooterBottom footerClass=""/>
            {/* =============================== Footer Section End ============================== */}
        </>
    );
};

export default Footer;