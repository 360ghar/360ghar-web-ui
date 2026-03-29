import SectionHeading from '../../common/ui/SectionHeading';
import FaqAccordion from '../../common/FaqAccordion';

import LazyImage from '../../common/ui/LazyImage';
const Faq = () => {
    return (
        <>
            <section className="faq padding-y-120 mt-minus-120">
                <div className="container container-two">
                    <div className="row">
                        <div className="col-lg-6 pe-xl-5">

                            <SectionHeading
                                headingClass="section-heading style-left"  
                                subtitle="Ask question"
                                subtitleClass="" 
                                title="Everything about our verified 360° listings" 
                                renderDesc={false}
                                desc=""
                                renderButton={false}
                                renderBesideDesc={false}
                                buttonClass="btn-main"
                                buttonText="View More"
                            />
                            
                            <FaqAccordion accordionClass="" itemClass=""/>
                            
                        </div>
                        <div className="col-lg-6  d-lg-block d-none">
                            <div className="faq-thumb">
                                <LazyImage src="assets/images/thumbs/faq-img.png" alt="Image"/>
                            </div>
                        </div>
                    </div>
                </div>
            </section>   
        </>
    );
};

export default Faq;