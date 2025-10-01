import React from 'react';
import StarRating from '../../common/StarRating';

const TestimonialItem = ({ testimonial }) => {

    const {name, designation, desc, quote} = testimonial; 
    
    return (
        <>
             <div className="testimonial-item">
                <div className="testimonial-item__top flx-between">
                    <div className="testimonial-item__info">
                        <h6 className="testimonial-item__name">{name}</h6>
                        <span className="testimonial-item__designation">{designation}</span>
                    </div>
                    <img src={quote} alt=""/>
                </div>
                <p className="testimonial-item__desc">{desc}</p>

                <StarRating />

            </div>   
        </>
    );
};

export default TestimonialItem;