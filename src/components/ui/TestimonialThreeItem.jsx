import StarRating from '../../common/ui/StarRating';

import LazyImage from '../../common/ui/LazyImage';
const TestimonialThreeItem = ({ testimonialThreeItem }) => {

    const {image, name, designation, desc} = testimonialThreeItem; 
    
    return (
        <>
            <div className="testimonial-item style-two">
                <div className="testimonial-item__top flx-between gap-2">
                    <div className="testimonial-item__info flx-align">
                        <div className="testimonial-item__thumb">
                            <LazyImage src={image} alt={name || 'Reviewer'} width={50} height={50}/>
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