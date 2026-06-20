import { I18nLink } from '../../i18n/I18nLink';
import { projectItems } from '../../data/OthersPageData';

import LazyImage from '../../common/ui/LazyImage';
const ProjectSection = () => {

    const convertToSlug = (text) => {
        return text.toLowerCase().replace(/\s+/g, '-');
    };
    
    return (
        <>
            <section className="project-page padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        {
                            projectItems.map((projectItem, projectItemIndex) => {

                                const {id, slug, thumb, title, desc} = projectItem; 

                                // Generate dynamic URL based on the property title
                                const projectURL = `/project/${encodeURIComponent(slug || convertToSlug(title))}`;
                                
                                return (
                                    <div className={`col-md-4 col-sm-6 col-6`} key={projectItemIndex}>
                                        <div className="project-page-thumb">
                                            <LazyImage src={thumb} alt={title || 'Project'} className="cover-img" width={400} height={300}/>
                                            <div className="project-page-content">
                                                <h6 className="project-page-content__title">
                                                    <I18nLink to={projectURL} state={{ id, title, thumb, desc }} className="link">{title}</I18nLink>
                                                </h6>
                                            </div>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>   
        </>
    );
};

export default ProjectSection;