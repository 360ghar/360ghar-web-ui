import Slider from "react-slick";

import SectionHeading from '../../common/ui/SectionHeading';
import { testimonialThreeContents } from '../../data/HomeThreeData';
import TestimonialThreeItem from './TestimonialThreeItem';

// Custom arrows to avoid forwarding non-DOM props (currentSlide, slideCount)
const PrevArrow = ({ currentSlide: _currentSlide, slideCount: _slideCount, ...props }) => {
    const { className, style, onClick } = props;
    return (
        <button type="button" className={className || "slick-prev"} style={style} onClick={onClick}>
            <i className="fas fa-arrow-left"></i>
        </button>
    );
};

const NextArrow = ({ currentSlide: _currentSlide, slideCount: _slideCount, ...props }) => {
    const { className, style, onClick } = props;
    return (
        <button type="button" className={className || "slick-next"} style={style} onClick={onClick}>
            <i className="fas fa-arrow-right"></i>
        </button>
    );
};

// Respect prefers-reduced-motion: disable autoplay for users who opted out.
const REDUCED_MOTION = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: !REDUCED_MOTION,
    autoplaySpeed: 5000,
    speed: 500,
    dots: false,
    pauseOnHover: true,
    arrows: true,
    centerMode: true,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
};

const TestimonialThree = () => {
    return (
        <>
            <section className="testimonials-three padding-y-120">
                <div className="container container-two">
                    <div className="testimonials-three__inner position-relative">
                        <div className="row align-items-center gy-4">
                            <div className="col-lg-5">
                                <div className="testimonials-three__box">

                                    <SectionHeading
                                        headingClass="section-heading style-left mb-0"
                                        subtitle="Client Testimonials"
                                        subtitleClass=""
                                        title="Loved by home seekers in Gurugram"
                                        renderDesc={false}
                                        desc=""
                                        renderButton={false}
                                        renderBesideDesc={true}
                                        buttonClass="btn-main"
                                        buttonText="View More"
                                    />

                                </div>
                            </div>

                            <div className="col-lg-7">
                                <div className="testimonials-three__wrapper overflow-hidden">
                                    <Slider {...settings}>
                                        {
                                            testimonialThreeContents.map((testimonialThreeItem, testimonialThreeItemIndex) => {
                                                return (
                                                    <TestimonialThreeItem testimonialThreeItem={testimonialThreeItem} key={testimonialThreeItemIndex} />
                                                )
                                            })
                                        }
                                    </Slider>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
};

export default TestimonialThree;
