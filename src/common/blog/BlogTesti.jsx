import BlogTestiThumb from '/assets/images/thumbs/blog-testi.png';

import LazyImage from '../ui/LazyImage';
const BlogTesti = () => {
    return (
        <>
            <div className="blog-testi">
                <div className="blog-testi__thumb">
                    <LazyImage src={BlogTestiThumb} alt="Mark Wood testimonial" width={80} height={80}/>
                </div>
                <p className="blog-testi__desc">Real estate is a lucrative industry that involves the buying selling and renting properties It encompasses residential commercial and industrial properties. Real estate agents play a crucial role in facilitating at transactions and helping commercial, and industrial </p>
                <div className="blog-testi__bottom flx-between">
                    <span className="blog-testi__name text-gradient">Mark wood</span>
                    <LazyImage src="assets/images/icons/quote-two.svg" alt="Decorative quote icon" className="blog-testi__quote"/>
                </div>
            </div>   
        </>
    );
};

export default BlogTesti;