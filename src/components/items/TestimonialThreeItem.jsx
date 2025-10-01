import React from 'react';
import StarRating from '../../common/StarRating';

const TestimonialThreeItem = ({ testimonialThreeItem }) => {

    const {image, name, designation, desc} = testimonialThreeItem; 
    
    return (
        <>
            <div className="testimonial-item style-two">
                <div className="testimonial-item__top flx-between gap-2">
                    <div className="testimonial-item__info flx-align">
                        <div className="testimonial-item__thumb">
                            <img src={image} alt=""/>
                        </div>
                        <div>
                            <h6 className="testimonial-item__name">{name}</h6>
                        <span className="testimonial-item__designation">{designation}</span>
                        </div>
                    </div>
                    
                    <StarRating />
                    
                </div>
                <p className="testimonial-item__desc mb-0">{desc}</p>
            </div>   
        </>
    );
};

export default TestimonialThreeItem;