import { aboutContent, aboutStatistics } from '../../data/HomeOneData';
import Button from '../../common/ui/Button';
import SectionHeading from '../../common/ui/SectionHeading';

import CountUp from 'react-countup';

import LazyImage from '../../common/ui/LazyImage';
const About = () => {
    return (
        <>
            {/* ======================== About Section Start ========================== */}
            <section className="about padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4 align-items-center">
                        <div className="col-lg-6">
                            <div className="about-thumb">
                                <LazyImage src={aboutContent.thumb} alt="About 360Ghar real estate platform" width={580} height={480}/>
                                <div className="client-statistics flx-align">
                                    <span className="client-statistics__icon">
                                        {aboutStatistics.icon}
                                    </span>
                                    <div className="client-statistics__content">
                                        <h5 className="client-statistics__number statisticsCounter">
                                            <CountUp end={parseInt(aboutStatistics.number)}/>
                                        </h5>
                                        <span className="client-statistics__text fs-18">{aboutStatistics.text}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-lg-6">
                            <div className="about-content">

                                <SectionHeading 
                                    headingClass="style-left"  
                                    subtitle="About Us"
                                    subtitleClass="" 
                                    title="Your Trusted Real Estate Partner in Gurugram" 
                                    renderDesc={false}
                                    desc=""
                                    renderButton={false}
                                    buttonClass="btn-main"
                                    buttonText="View More"
                                />
                                
                                <div className="about-box d-flex">
                                    <div className="about-box__icon">
                                        <LazyImage src={aboutContent.icon} alt="360Ghar expert guidance icon" />
                                    </div>
                                    <div className="about-box__content">
                                        <h6 className="about-box__title">{aboutContent.title}</h6>
                                        <p className="about-box__desc font-13">{aboutContent.desc}</p>
                                    </div>
                                </div>
                                <div className="about-button">
                                    <Button
                                        btnLink="/about-us"
                                        btnClass="btn-main"
                                        btnText="Learn About 360Ghar"
                                        spanClass="icon-right"
                                        iconClass="fas fa-arrow-right"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* ======================== About Section End ========================== */}
   
        </>
    );
};

export default About;