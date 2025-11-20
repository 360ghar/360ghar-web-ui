import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../common/Button';
import { BlogDataContext } from '../../contextApi/BlogDataContext';

import LazyImage from '../../common/LazyImage';
const BlogItemThree = ({blogItem}) => {
    
    // Blog Data Context API
    const { setBlogData, currentMonthName} = useContext(BlogDataContext); 

    const { thumb, meta, title, admin, desc, linkText} = blogItem; 
    
    // Title Convert To Slug
    const convertToSlug = (text) => {
        return text.toLowerCase().replace(/\s+/g, '-');
    };
    const blogURL = `/blog/${encodeURIComponent(convertToSlug(title))}`;

    const handleBlogClick = () => {
        setBlogData({ thumb, meta, title, admin, desc });
    };
    
    return (
        <div className="blog-item">
            <div className="blog-item__thumb">
                <Link to={blogURL} onClick={()=>handleBlogClick()} className="blog-item__thumb-link">
                    <LazyImage src={thumb} className="cover-img" alt=""/>
                </Link>
                <span className="blog-item__date style-three font-18"> 
                    {new Date().getDate()}  <span className="text">{currentMonthName}</span>
                </span>
            </div>
            <div className="blog-item__content bg-white border-0">
                <ul className="text-list border-0 p-0 flx-align">
                    {
                        meta.map((metaInfo, metaIndex) => {
                            return (
                                <li className="text-list__item font-12" key={metaIndex}> 
                                    <span className="icon text-gradient">{metaInfo.icon}</span> 
                                    <Link to={blogURL} onClick={()=>handleBlogClick()} className="link">{metaInfo.text}</Link>
                                </li>
                            )
                        })
                    }
                </ul>
                <h6 className="blog-item__title mb-4">
                    <Link to={blogURL} onClick={()=>handleBlogClick()} className="blog-item__title-link border-effect"> {title}</Link>
                </h6>

                <Button
                    btnLink={blogURL}
                    state={{ thumb, admin, meta, title, desc}}
                    btnClass="btn btn-outline-light" 
                    btnText={linkText} 
                    spanClass="icon-right icon" 
                    iconClass="fas fa-arrow-right" 
                />
                
            </div>
        </div>   
    );
};

export default BlogItemThree;