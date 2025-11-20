import React from 'react';
import SectionHeading from '../../common/SectionHeading';
import Button from '../../common/Button';
import { aboutCheckLists } from '../../data/HomeThreeData/HomeThreeData';
import CountUp from 'react-countup';

import AboutThreeThumb from '/assets/images/thumbs/about-three-img.png';

import LazyImage from '../../common/LazyImage';
const AboutThree = () => {
    return (
        <>
            <section className="about-three bg-white padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-6">
                            <div className="about-three-thumb">
                                <div className="about-three-thumb__inner">
                                    <LazyImage src={AboutThreeThumb} alt=""/>
                                    <div className="project-content">
                                        <div className="project-content__inner">
                                            <h2 className="project-content__number">
                                                <CountUp end={parseInt(10)} duration={6} delay={0.2} />k                                            </h2>
                                            <span className="project-content__text font-12">Complete project</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-content">

                                <SectionHeading
                                    headingClass="style-left"  
                                    subtitle="About 360Ghar"
                                    subtitleClass="bg-gray-100" 
                                    title="Verified 360° property discovery in Gurugram" 
                                    renderDesc={true}
                                    desc="We turn every Rent, PG, and Sale listing into a guided, studio‑quality 360° walkthrough with verified media, details, and exact location. Owners list with no upfront fee and get free professional photography and onboarding for a limited time."
                                    renderButton={false}
                                    buttonClass="btn-main"
                                    buttonText="View More"
                                />

                                <ul className="check-list style-two">
                                    {
                                        aboutCheckLists.map((aboutCheckList, index) => {
                                            return (
                                                <li className="check-list__item d-flex align-items-center" key={index}>
                                                    <span className="icon">{aboutCheckList.icon}</span>
                                                    <span className="text fw-semibold">{aboutCheckList.text}</span>
                                                </li>
                                            )
                                        })
                                    }
                                </ul>
                                <div className="about-button">
                                    <Button
                                        btnLink="/about-us" 
                                        btnClass="btn btn-outline-main bg-white" 
                                        btnText="Learn More" 
                                        spanClass="icon-right" 
                                        iconClass="fas fa-arrow-right" 
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>   
        </>
    );
};

export default AboutThree;