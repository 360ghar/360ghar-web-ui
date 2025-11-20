import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { BlogDataContext } from '../../contextApi/BlogDataContext';

import LazyImage from '../../common/LazyImage';
const BlogItem = ({ blog }) => {

    // Blog Data Context API
    const { setBlogData, currentMonthName} = useContext(BlogDataContext); 

    const { thumb, meta, title, admin, desc, linkText} = blog; 
    
    // Title Convert To Slug
    const convertToSlug = (text) => {
        return text.toLowerCase().replace(/\s+/g, '-');
    };
    const blogURL = `/blog/${encodeURIComponent(convertToSlug(title))}`;


    const handleBlogClick = () => {
        setBlogData({ thumb, meta, title, admin, desc });
    };

    return (
        <>
            <div className="blog-item">
                <div className="blog-item__thumb">
                    <Link to={blogURL} onClick={()=>handleBlogClick() } className="blog-item__thumb-link">
                        <LazyImage src={thumb} className="cover-img" alt="Blog Image"/>
                    </Link>
                </div>
                <div className="blog-item__inner">
                    
                    <div className="blog-item__date">
                        {new Date().getDate()}<span className="text">{currentMonthName}</span>
                    </div>
                    
                    <div className="blog-item__content">
                        <ul className="text-list flx-align">
                            {
                                meta.map((metaInfo, metaIndex) => {
                                    return (
                                        <li className="text-list__item font-12" key={metaIndex}> 
                                            <span className="icon">{metaInfo.icon}</span> 
                                            <Link to="/" className="link">{metaInfo.text}</Link>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <h6 className="blog-item__title">
                            <Link to={blogURL} onClick={()=>handleBlogClick() } className="blog-item__title-link border-effect"> {title}</Link>
                        </h6>
                        <Link to={blogURL} onClick={()=>handleBlogClick() } className="simple-btn text-heading fw-semibold"> 
                            {linkText}
                            <span className="icon-right text-gradient"> <i className="fas fa-plus"></i> </span>
                        </Link>
                    </div>
                </div>
            </div>   
        </>
    );
};

export default BlogItem;