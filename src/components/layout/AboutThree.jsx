import SectionHeading from '../../common/ui/SectionHeading';
import Button from '../../common/ui/Button';
import { aboutCheckLists } from '../../data/HomeThreeData';
import CountUp from 'react-countup';

import AboutThreeThumb from '/assets/images/thumbs/about-three-img.webp';

import LazyImage from '../../common/ui/LazyImage';
const AboutThree = () => {
    return (
        <>
            <section className="about-three bg-white padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-6">
                            <div className="about-three-thumb">
                                <div className="about-three-thumb__inner">
                                    <LazyImage src={AboutThreeThumb} alt="360Ghar team and services" width={580} height={480}/>
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
                                    title="India's First AI + VR Real Estate Platform"
                                    renderDesc={true}
                                    desc="Experience verified properties with studio-quality 360° guided walkthroughs, physically inspected by our on-site team. Your dedicated Relationship Manager ensures an immersive, seamless journey from search to closing—complete transparency, zero upfront fees. We show you genuine properties with exact locations, not partnered inventories."
                                    renderButton={false}
                                    buttonClass="btn-main"
                                    buttonText="View More"
                                />

                                <ul className="check-list style-two speakable-highlights">
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