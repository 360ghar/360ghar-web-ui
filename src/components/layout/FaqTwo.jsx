import FaqAccordion from '../../common/FaqAccordion';
import FaqTwoThumb from '/assets/images/thumbs/faq-two-img.png';
import SectionHeading from '../../common/ui/SectionHeading';

import LazyImage from '../../common/ui/LazyImage';
const FaqTwo = () => {
    return (
        <section className="faq-two padding-y-120">
            <div className="container container-two">

                <SectionHeading
                    headingClass=""  
                    subtitle="Ask question"
                    subtitleClass="bg-gray-100" 
                    title="Let us find the perfect the  property for you" 
                    renderDesc={false}
                    desc=""
                    renderButton={false}
                    buttonClass="btn-main"
                    buttonText="View More"
                />

                <div className="row gy-4">
                    <div className="col-lg-6">
                        
                        <FaqAccordion accordionClass="style-two" itemClass=""/>
                        
                    </div>
                    <div className="col-lg-6 ps-lg-4 d-lg-block d-none">
                        <div className="faq-two-thumb">
                            <LazyImage src={FaqTwoThumb} alt="360Ghar FAQ illustration" loading="lazy" decoding="async" />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default FaqTwo;
