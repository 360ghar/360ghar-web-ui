import React from 'react';

import BannerTwoThumb from '/assets/images/thumbs/banner-two-filter-bg.png';
import TabFilter from '../../common/TabFilter';
import { bannerTwoContent } from '../../data/HomeTwoData/HomeTwoData';
import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const BannerTwo = () => {
    return (
        <>
            {/* ============================= Banner Two Start ============================= */}
            <div className="banner-two">
                <div className="container container-two">
                    <div className="banner-two__content flx-between">
                        <h1 className="banner-two__title"> {bannerTwoContent.title}<span className="text">{ bannerTwoContent.boldTitle}</span> </h1>
                        <div className="contact-content">
                            <p className="contact-content__desc font-18">{bannerTwoContent.desc}</p>
                            <div className="d-flex align-items-center gap-3">
                                <div className="contact-content__icon">
                                    <LazyImage src={bannerTwoContent.icon} alt=""/>
                                </div>
                                <div className="contact-content__infos">
                                    <span className="contact-content__text">{bannerTwoContent.text}</span> 
                                    <Link to={`${bannerTwoContent.numberLink}${bannerTwoContent.number}`} className="contact-content__contact">{bannerTwoContent.number}</Link>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="banner-two__filter background-img" style={{ backgroundImage: `url(${BannerTwoThumb})` }}>
                        <div className="filter--box ms-auto">
                            <TabFilter colClass="col-12"/>
                        </div>
                    </div>
                </div>
            </div>
            {/* ============================= Banner Two End ============================= */}
        </>
    );
};

export default BannerTwo;