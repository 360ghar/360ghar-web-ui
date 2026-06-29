import { bannerContent } from '../../data/HomeOneData';
import { I18nLink } from '../../i18n/I18nLink';

import TabFilter from '../../common/forms/TabFilter';

import LazyImage from '../../common/ui/LazyImage';
const Banner = () => {
    return (
        <>
            {/*========================== Banner Section Start ==========================*/}
            <section className="banner">
                <div className="container container-two">
                    <div className="position-relative">
                        <div className="row">
                            <div className="col-lg-6">
                                <div className="banner-inner position-relative">
                                    <div className="banner-content">
                                        <span className="banner-content__subtitle text-uppercase font-14"> {bannerContent.subtitle} </span>
                                        <h1 className="banner-content__title">{bannerContent.title} <span className="text-gradient">{bannerContent.gradientTitle}</span> </h1>
                                        <p className="banner-content__desc font-18">{bannerContent.desc}</p>
                                        <div className="contact-info d-flex align-items-center gap-2 mt-4">
                                            <span className="contact-info__icon text-gradient"><i className="fas fa-envelope"></i></span>
                                            <div className="contact-info__content">
                                                <span className="contact-info__text fw-500">Email us</span>
                                                <I18nLink to={`mailto:info@360ghar.com`} className="contact-info__address text-gradient">info@360ghar.com</I18nLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 order-lg-0 order-1">
                                    <div className="banner-thumb">
                                    <LazyImage src={bannerContent.thumb} alt="Find your dream home with 360Ghar" width={629} height={571} priority />
                                    <LazyImage src="assets/images/shapes/shape-triangle.webp" alt="Decorative triangle shape" className="shape-element one"/>
                                    <LazyImage src="assets/images/shapes/shape-circle.webp" alt="Decorative circle shape" className="shape-element two"/>
                                    <LazyImage src="assets/images/shapes/shape-moon.webp" alt="Decorative moon shape" className="shape-element three"/>
                                </div>  
                            </div>
                            <div className="col-lg-12">

                                <TabFilter />
                                
                            </div>
                            
                        </div>
                    </div>
                </div>
            </section>
            {/*========================== Banner Section End ==========================*/}   
        </>
    );
};

export default Banner;
