import { I18nLink } from '../../i18n/I18nLink';
import FooterBottom from './FooterBottom';
import FooterServiceItem from './footer/FooterServiceItem';
import FooterLogoDesc from './footer/FooterLogoDesc';
import FooterInfo from './footer/FooterInfo';
import SocialList from '../ui/SocialList';
import SubscribeBox from './footer/SubscribeBox';
import FooterUsefulItem from './footer/FooterUsefulItem';

const FooterTwo = () => {
    return (
        <>
            {/* ==================== Footer Two Start Here ==================== */}
            <footer className="footer footer-two padding-y-120">
                <div className="container container-two">
                    <div className="row gy-5">
                        <div className="col-xl-4 col-lg-6">
                            <div className="footer-item">
                                <FooterLogoDesc/>

                                <h6 className="footer-item__title mt-4 mt-lg-5">Get In Touch</h6>

                                <FooterInfo/>

                                <div className="mt-4">
                                    <I18nLink
                                        to="/contact"
                                        className="btn btn-main w-100 d-inline-flex justify-content-center align-items-center"
                                    >
                                        <i className="fas fa-comments me-2"></i>
                                        Contact Support
                                    </I18nLink>
                                </div>

                            </div>
                        </div>
                        <div className="col-xl-1 d-xl-block d-none"></div>
                        <div className="col-xl-2 col-sm-6">
                            <FooterUsefulItem/>
                        </div>
                        <div className="col-xl-1 d-xl-block d-none"></div>
                        <div className="col-xl-3 col-sm-6">
                            <div className="footer-item">
                                <FooterServiceItem/>
                            </div>
                        </div>
                        <div className="col-xl-1 d-xl-block d-none"></div>
                        <div className="col-xl-3 col-sm-6">
                            <div className="footer-item">
                                <h6 className="footer-item__title">Subscribe & Follow</h6>
                                <p className="footer-item__desc">Get the latest property updates and exclusive offers from 360Ghar.</p>

                                <SubscribeBox/>

                                <div className="mt-4">
                                    <h6 className="footer-item__title mb-3">Connect With Us</h6>
                                    <SocialList/>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </footer>

            {/* bottom Footer */}
            <FooterBottom footerClass=""/>
            {/* ==================== Footer Two End Here ==================== */}
        </>
    );
};

export default FooterTwo;
