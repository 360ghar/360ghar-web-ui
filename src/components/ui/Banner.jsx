import React from 'react';
import { bannerContent } from '../../data/HomeOneData/HomeOneData';
import { Link } from 'react-router-dom';

import TabFilter from '../../common/TabFilter';

import LazyImage from '../../common/LazyImage';
const Banner = () => {
    return (
        <>
            {/*========================== Banner Section Start ==========================*/}
            <section className="banner">
                <div className="container container-two">
                    <div className="position-relative">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="banner-inner position-relative">
                                    <div className="banner-content">
                                        <span className="banner-content__subtitle text-uppercase font-14"> {bannerContent.subtitle} </span>
                                        <h1 className="banner-content__title">{bannerContent.title} <span className="text-gradient">{bannerContent.gradientTitle}</span> </h1>
                                        <p className="banner-content__desc font-18">{bannerContent.desc}</p>
                                        <div className="contact-info d-flex align-items-center gap-2 mt-4">
                                            <span className="contact-info__icon text-gradient"><i className="fas fa-envelope"></i></span>
                                            <div className="contact-info__content">
                                                <span className="contact-info__text fw-500">Email us</span>
                                                <Link to={`mailto:info@360ghar.com`} className="contact-info__address text-gradient">info@360ghar.com</Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 order-lg-0 order-1">
                                    <div className="banner-thumb">
                                    <LazyImage src={bannerContent.thumb} alt="" priority />
                                    <LazyImage src="assets/images/shapes/shape-triangle.png" alt="" className="shape-element one"/>
                                    <LazyImage src="assets/images/shapes/shape-circle.png" alt="" className="shape-element two"/>
                                    <LazyImage src="assets/images/shapes/shape-moon.png" alt="" className="shape-element three"/>
                                </div>  
                            </div>
                            <div className="col-lg-12">

                                {/* Tab Filter */}
                                <TabFilter colClass="col-lg-3 col-sm-6 col-xs-6"/>
                                
                            </div>
                            
                        </div>
                    </div>
                </div>
            </section>
            {/*========================== Banner Section End ==========================*/}   
        </>
    );
};

export default Banner;
