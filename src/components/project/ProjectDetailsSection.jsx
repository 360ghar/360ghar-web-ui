import React from 'react';

import { Link, useLocation } from 'react-router-dom';
import { challengeLists, projectSidebarLists } from '../../data/OthersPageData/OthersPageData';
import { socialLists } from '../../data/CommonData/CommonData';

import LazyImage from '../../common/LazyImage';
const ProjectDetailsSection = () => {

    const location = useLocation(); 

    // Get Formatted current date
    const currentDate = new Date();
    const formattedDate = `${currentDate.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    })}`;
    
    return (
        <>
            <section className="project-details padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="project-details__thumb">
                                <LazyImage src={location.state.thumb} alt="" className='cover-img' priority />
                            </div>
                            <div className="project-details__content">
                                <h2 className="project-details__title">{location.state.title}</h2>
                                <p className="project-details__desc font-18">{location.state.desc.slice(0, 250)}</p>
                                <p className="project-details__desc font-18">{location.state.desc.slice(251, 900)}</p>
                                
                                <h6 className="border-title">Project challeng</h6>
                                <p className="project-details__desc font-18">Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis  viverra laoreet augue mattis ferment ullamcorer viverra laoreet Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper ere viverra .Aliquam eros justo, posuere lobortis non, viverra Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere </p>

                                <ul className="text-list-two">
                                    {
                                        challengeLists.map((challengeList, challengeListIndex) => {
                                            return (
                                                <li className="text-list-two__item font-18" key={challengeListIndex}>{challengeList.text}</li>
                                            )
                                        })
                                    }
                                </ul>

                            </div>
                        </div>
                        <div className="col-lg-4">
                            <div className="project-sidebar__box mt-0">
                                <ul className="project-sidebar">
                                    {
                                        projectSidebarLists.map((projectSidebarList, projectSidebarListIndex) => {
                                            return (
                                                <li className="project-sidebar__item" key={projectSidebarListIndex}>
                                                    <span className="project-sidebar__text font-12">{projectSidebarList.text}</span>
                                                    <h6 className="project-sidebar__title font-16 fw-semibold mb-0">{projectSidebarList.title}</h6>
                                                </li>
                                            )
                                        })
                                    }
                                    <li className="project-sidebar__item">
                                        <span className="project-sidebar__text font-12">Date</span>
                                        <h6 className="project-sidebar__title font-16 fw-semibold mb-0"> {formattedDate}</h6>
                                    </li>
                                </ul>
                                <ul className="social-share-list style-two mt-lg-5 mt-4">
                                    {
                                        socialLists.map((socialList, socialListIndex) => {
                                            return (
                                                <li className="social-share-list__item" key={socialListIndex}>
                                                    <Link to={socialList.link} className="social-share-list__link">
                                                        {socialList.icon}
                                                    </Link>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ProjectDetailsSection;
