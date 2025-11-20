import React from 'react';
import BlogTestiThumb from '/assets/images/thumbs/blog-testi.png';

import LazyImage from './LazyImage';
const BlogTesti = () => {
    return (
        <>
            <div className="blog-testi">
                <div className="blog-testi__thumb">
                    <LazyImage src={BlogTestiThumb} alt=""/>
                </div>
                <p className="blog-testi__desc">Real estate is a lucrative industry that involves the buying selling and renting properties It encompasses residential commercial and industrial properties. Real estate agents play a crucial role in facilitating at transactions and helping commercial, and industrial </p>
                <div className="blog-testi__bottom flx-between">
                    <span className="blog-testi__name text-gradient">Mark wood</span>
                    <LazyImage src="assets/images/icons/quote-two.svg" alt="" className="blog-testi__quote"/>
                </div>
            </div>   
        </>
    );
};

export default BlogTesti;