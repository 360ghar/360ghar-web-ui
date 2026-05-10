import { I18nLink } from '../../i18n/I18nLink';
import { useBlogStore } from '../../store/blogStore';

import LazyImage from '../../common/ui/LazyImage';
const BlogItemTwo = ({ blog }) => {

    // Blog Data Store
    const { setBlogData, currentMonthName} = useBlogStore(); 

    const { thumb, meta, title, admin, desc, linkText, linkAriaLabel} = blog; 
    
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
        <div className="blog-item blog-dark">
            <div className="blog-item__thumb">
                <I18nLink to={blogURL} onClick={()=>handleBlogClick()} className="blog-item__thumb-link">
                    <LazyImage src={thumb} className="cover-img" alt={`${title} - 360Ghar Blog`}/>
                </I18nLink>
                <span className="blog-item__date"> {new Date().getDate()} {currentMonthName}</span>
            </div>
            <div className="blog-item__inner">
                <div className="blog-item__content">
                    <ul className="text-list border-0 p-0 flx-align">
                        {
                            meta.map((metaInfo, metaIndex) => {
                                return (
                                    <li className="text-list__item font-12" key={metaIndex}> 
                                        <span className="icon text-gradient">{metaInfo.icon}</span> 
                                        <I18nLink to="/blog-details" className="link text-white fw-light">{metaInfo.text}</I18nLink>
                                    </li>
                                )
                            })
                        }
                    </ul>
                    <h6 className="blog-item__title">
                        <I18nLink to={blogURL} onClick={()=>handleBlogClick()} className="blog-item__title-link border-effect"> {title}</I18nLink>
                    </h6>

                    <I18nLink to={blogURL} onClick={()=>handleBlogClick()} aria-label={linkAriaLabel} className="btn btn-outline-lightInDark text-white fw-normal">
                        {linkText} 
                        <span className="icon-right icon"> 
                            <i className="fas fa-arrow-right"></i>
                        </span> 
                    </I18nLink>
                    
                </div>
            </div>
        </div>
        </>
    );
};

export default BlogItemTwo;
