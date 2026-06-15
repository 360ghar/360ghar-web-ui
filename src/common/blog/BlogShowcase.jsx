
import LazyImage from '../ui/LazyImage';
const BlogShowcase = () => {
    return (
        <>
             <div className="blog-showcase">
                <h5 className="blog-showcase__title">Showcase your talent with our portfolio</h5>
                <p className="blog-showcase__desc">Aliquam eros justo, posuere loborti viverra laoreet matti ullamcorper posuere viverra .Aliquam eros justo, posuere lobortis, viverra laoreet augue mattis fermentum ullamcorper viverra laoreet Aliquam eros </p>
                <div className="blog-showcase__content flx-align gap-4">
                    <div className="blog-showcase__thumb">
                        <LazyImage src="assets/images/thumbs/blog-showcase.webp" alt="360Ghar real estate services showcase" width={120} height={120}/>
                    </div>
                    <ul className="check-list">
                        <li className="check-list__item d-flex align-items-center">
                            <span className="icon"><i className="fas fa-check"></i></span>
                            <span className="text">Your trusted real estate partner</span>
                        </li>
                        <li className="check-list__item d-flex align-items-center">
                            <span className="icon"><i className="fas fa-check"></i></span>
                            <span className="text">Unlocking the door to your new home</span>
                        </li>
                        <li className="check-list__item d-flex align-items-center">
                            <span className="icon"><i className="fas fa-check"></i></span>
                            <span className="text">Luxury living at affordable prices</span>
                        </li>
                        <li className="check-list__item d-flex align-items-center">
                            <span className="icon"><i className="fas fa-check"></i></span>
                            <span className="text">Your journey to homeownership starts here</span>
                        </li>
                    </ul>
                </div>
                <p className="blog-showcase__desc">Real estate is a lucrative industry that involves the buying selling and renting properties It encompass residential commercial and industrial properties. Real estate agents play a crucial role in facilitating at transactions and an english helping commercial, and industrial</p>
            </div>   
        </>
    );
};

export default BlogShowcase;