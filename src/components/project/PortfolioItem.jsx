import React from 'react';
import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const PortfolioItem = ({ portfolio }) => {
    const {thumb, title, desc, btnIcon} = portfolio; 

    return (
        <div className="portfolio-item">
            <div className="portfolio-item__thumb">
                <LazyImage src={thumb} alt="" className="cover-img"/>
            </div>
            <div className="portfolio-item__content">
                <Link to="/portfolio-details" className="btn btn-icon"> 
                    <span className="text-gradient line-height-0">
                        {btnIcon}
                    </span> 
                </Link>
                <div className="portfolio-item__inner">
                    <h6 className="portfolio-item__title">
                        <Link to="/portfolio-details" className="link">{title}</Link>
                    </h6>
                    <p className="portfolio-item__desc">{desc}</p>
                </div>
            </div>
        </div>    
    );
};

export default PortfolioItem;