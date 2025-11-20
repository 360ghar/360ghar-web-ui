import React from 'react';
import { Link } from 'react-router-dom';
import { projectItems } from '../../data/OthersPageData/OthersPageData';

import LazyImage from '../../common/LazyImage';
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

                                const {id, thumb, title, desc} = projectItem; 

                                // Generate dynamic URL based on the property title
                                const projectURL = `/project/${encodeURIComponent(convertToSlug(title))}`;
                                
                                return (
                                    <div className={`col-md-4 col-sm-6 col-xs-6`} key={projectItemIndex}>
                                        <div className="project-page-thumb">
                                            <LazyImage src={thumb} alt="" className="cover-img"/>
                                            <div className="project-page-content">
                                                <h6 className="project-page-content__title">
                                                    <Link to={projectURL} state={{ id, title, thumb, desc }} className="link">{title}</Link>
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