import { I18nLink } from '../../i18n/I18nLink';
import Button from '../../common/ui/Button';
import { useBlogStore } from '../../store/blogStore';

import LazyImage from '../../common/ui/LazyImage';
const BlogItemThree = ({blogItem}) => {

    // Blog Data Store
    const { setBlogData, currentMonthName} = useBlogStore(); 

    const { thumb, meta, title, admin, desc, linkText, linkAriaLabel} = blogItem; 
    
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
                <I18nLink to={blogURL} onClick={()=>handleBlogClick()} className="blog-item__thumb-link">
                    <LazyImage src={thumb} className="cover-img" alt={`${title} - 360Ghar Blog`}/>
                </I18nLink>
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
                                    <I18nLink to={blogURL} onClick={()=>handleBlogClick()} className="link">{metaInfo.text}</I18nLink>
                                </li>
                            )
                        })
                    }
                </ul>
                <h6 className="blog-item__title mb-4">
                    <I18nLink to={blogURL} onClick={()=>handleBlogClick()} className="blog-item__title-link border-effect"> {title}</I18nLink>
                </h6>

                <Button
                    btnLink={blogURL}
                    state={{ thumb, admin, meta, title, desc}}
                    btnClass="btn btn-outline-light"
                    btnText={linkText}
                    spanClass="icon-right icon"
                    iconClass="fas fa-arrow-right"
                    ariaLabel={linkAriaLabel}
                />
                
            </div>
        </div>   
    );
};

export default BlogItemThree;
