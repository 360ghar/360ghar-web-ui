import React from 'react';
import { Link } from 'react-router-dom';
import SocialList from './SocialList';
import FooterLogoDesc from './footer/FooterLogoDesc';
import FooterServiceItem from './footer/FooterServiceItem';
import FooterUsefulItem from './footer/FooterUsefulItem';
import FooterBottom from './FooterBottom';

const Footer = () => {
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
                                <h6 className="footer-item__title mb-4">Connect With Us</h6>
                                <p className="footer-item__desc mb-3">Stay updated with the latest property listings and real estate insights.</p>
                                <SocialList/>

                                <div className="mt-4">
                                    <h6 className="footer-item__title mb-3">Quick Actions</h6>
                                    <div className="footer-quick-actions d-flex flex-column gap-2">
                                        <Link to="/properties" className="btn btn-outline-light btn-sm text-start">
                                            <i className="fas fa-search me-2"></i>
                                            Search Properties
                                        </Link>
                                        <Link to="/post-property" className="btn btn-outline-light btn-sm text-start">
                                            <i className="fas fa-home me-2"></i>
                                            List Your Property
                                        </Link>
                                        <Link to="/project" className="btn btn-outline-light btn-sm text-start">
                                            <i className="fas fa-building me-2"></i>
                                            View Projects
                                        </Link>
                                        <Link to="/account" className="btn btn-outline-light btn-sm text-start">
                                            <i className="fas fa-user-circle me-2"></i>
                                            My Account
                                        </Link>
                                        <Link to="/contact" className="btn btn-outline-light btn-sm text-start">
                                            <i className="fas fa-envelope me-2"></i>
                                            Contact Experts
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Trust Badges */}
                    <div className="footer-trust-badges mt-5 pt-5 border-top border-secondary">
                        <div className="row align-items-center">
                            <div className="col-lg-8">
                                <div className="trust-badges d-flex flex-wrap gap-3">
                                    <div className="trust-badge d-flex align-items-center gap-2">
                                        <i className="fas fa-cube text-gradient"></i>
                                        <span className="text-white small">360° Virtual Tours</span>
                                    </div>
                                    <div className="trust-badge d-flex align-items-center gap-2">
                                        <i className="fas fa-certificate text-gradient"></i>
                                        <span className="text-white small">Verified Properties</span>
                                    </div>
                                    <div className="trust-badge d-flex align-items-center gap-2">
                                        <i className="fas fa-lock text-gradient"></i>
                                        <span className="text-white small">Secure Booking</span>
                                    </div>
                                    <div className="trust-badge d-flex align-items-center gap-2">
                                        <i className="fas fa-users text-gradient"></i>
                                        <span className="text-white small">Expert Support</span>
                                    </div>
                                    <div className="trust-badge d-flex align-items-center gap-2">
                                        <i className="fas fa-rupee-sign text-gradient"></i>
                                        <span className="text-white small">Best Price Guarantee</span>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-4 text-lg-end mt-3 mt-lg-0">
                                <div className="footer-contact-quick">
                                    <h6 className="text-white mb-2">Need Help?</h6>
                                    <p className="text-white small mb-2">Email our property experts</p>
                                    <a href="mailto:info@360ghar.com" className="btn btn-main btn-sm">
                                        <i className="fas fa-envelope me-2"></i>
                                        info@360ghar.com
                                    </a>
                                </div>
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