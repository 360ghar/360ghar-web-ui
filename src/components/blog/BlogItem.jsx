import { I18nLink } from '../../i18n/I18nLink';
import { useBlogStore } from '../../store/blogStore';

import LazyImage from '../../common/ui/LazyImage';
const BlogItem = ({ blog }) => {

    // Blog Data Store
    const { setBlogData, currentMonthName} = useBlogStore(); 

    const { thumb, meta, title, admin, linkText, linkAriaLabel} = blog;
    
    // Title Convert To Slug
    const convertToSlug = (text) => {
        return text.toLowerCase().replace(/\s+/g, '-');
    };
    const blogURL = `/blog/${encodeURIComponent(convertToSlug(title))}`;


    const handleBlogClick = () => {
        setBlogData({ thumb, meta, title, admin });
    };

    return (
        <>
            <div className="blog-item">
                <div className="blog-item__thumb">
                    <I18nLink to={blogURL} onClick={()=>handleBlogClick() } className="blog-item__thumb-link">
                        <LazyImage src={thumb} className="cover-img" alt={`${title} - 360Ghar Blog`}/>
                    </I18nLink>
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
                                            <I18nLink to="/" className="link">{metaInfo.text}</I18nLink>
                                        </li>
                                    )
                                })
                            }
                        </ul>
                        <h6 className="blog-item__title">
                            <I18nLink to={blogURL} onClick={()=>handleBlogClick() } className="blog-item__title-link border-effect"> {title}</I18nLink>
                        </h6>
                        <I18nLink to={blogURL} onClick={()=>handleBlogClick()} aria-label={linkAriaLabel} className="simple-btn text-heading fw-semibold">
                            {linkText}
                            <span className="icon-right text-gradient"> <i className="fas fa-plus"></i> </span>
                        </I18nLink>
                    </div>
                </div>
            </div>   
        </>
    );
};

export default BlogItem;
