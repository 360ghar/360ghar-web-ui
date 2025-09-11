import React from 'react';
import Slider from "react-slick";

import SectionHeading from '../common/SectionHeading';
import { testimonialThreeContents } from '../data/HomeThreeData/HomeThreeData';
import TestimonialThreeItem from './items/TestimonialThreeItem';

// Custom arrows to avoid forwarding non-DOM props (currentSlide, slideCount)
const PrevArrow = ({ currentSlide, slideCount, ...props }) => {
    const { className, style, onClick } = props;
    return (
        <button type="button" className={className || "slick-prev"} style={style} onClick={onClick}>
            <i className="fas fa-arrow-left"></i>
        </button>
    );
};

const NextArrow = ({ currentSlide, slideCount, ...props }) => {
    const { className, style, onClick } = props;
    return (
        <button type="button" className={className || "slick-next"} style={style} onClick={onClick}>
            <i className="fas fa-arrow-right"></i>
        </button>
    );
};

const settings = {
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 2000,
    speed: 1500,
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
                                    subtitle="clients testimonial"
                                    subtitleClass="" 
                                    title="Your satisfaction is our top a the priority" 
                                    renderDesc={false}
                                    desc="Real estate is a lucrative ind involves the buying selling and reproperties. It Real estate is a lucrative ind involves. Real estate is a lucrative"
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
                                                <TestimonialThreeItem testimonialThreeItem={testimonialThreeItem} key={testimonialThreeItemIndex}/>
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
