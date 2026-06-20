import TabFilter from '../../common/forms/TabFilter';
import { bannerThreeContent } from '../../data/HomeThreeData';
import { I18nLink } from '../../i18n/I18nLink';

import LazyImage from '../../common/ui/LazyImage';

// Hero banner responsive srcsets for LCP optimization.
// AVIF is the primary format (~36% smaller than WebP); WebP is the fallback
// for the rare browser without AVIF support. The 480w variant targets typical
// mobile viewports (source is 629px, so 640/768/1024w were identical before).
const HERO_AVIF_SRCSET = `/assets/images/thumbs/banner-three-320w.avif 320w,
/assets/images/thumbs/banner-three-480w.avif 480w,
/assets/images/thumbs/banner-three-640w.avif 640w,
/assets/images/thumbs/banner-three-768w.avif 768w,
/assets/images/thumbs/banner-three-1024w.avif 1024w`;

const HERO_WEBP_SRCSET = `/assets/images/thumbs/banner-three-320w.webp 320w,
/assets/images/thumbs/banner-three-480w.webp 480w,
/assets/images/thumbs/banner-three-640w.webp 640w,
/assets/images/thumbs/banner-three-768w.webp 768w,
/assets/images/thumbs/banner-three-1024w.webp 1024w`;

const BannerThree = () => {
    return (
        <>
            {/* ============================ Banner Three Start =============================    */}
            <section className="banner-three">
                <LazyImage src="assets/images/thumbs/dotted-bg.webp" alt="Decorative dotted background pattern" className="banner-three__dotted"/>
                <LazyImage src="assets/images/shapes/banner-shape.webp" alt="Decorative banner shape element" className="banner-three__shape"/>
                <div className="container container-two">
                    <div className="banner-three__inner position-relative padding-y-120">
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <div className="banner-inner position-relative">
                                    <div className="banner-content pe-lg-5">
                                        <span className="banner-content__subtitle text-uppercase font-14 fw-bold text-gradient mb-3 d-inline-block tracking-wider" style={{ letterSpacing: '2px' }}>{bannerThreeContent.subtitle}</span>
                                        <h1 className="banner-content__title mb-4" style={{ fontFamily: 'var(--font-heading)', fontWeight: '700', lineHeight: '1.2' }}>{bannerThreeContent.title} <br />
                                            <span className="position-relative d-inline text-main">
                                            {bannerThreeContent.shapedTitle}
                                                <LazyImage src="assets/images/shapes/curve-shape.webp" alt="Decorative curve shape" className="curve-shape"/>
                                            </span>
                                        </h1>
                                        <p className="banner-content__desc font-18 mb-5 text-secondary" style={{ lineHeight: '1.8' }}>{bannerThreeContent.desc}</p>
                                        <div className="contact-info d-flex align-items-center gap-3 mb-4 p-3 bg-white rounded-pill shadow-sm d-inline-flex border">
                                            <span className="contact-info__icon text-white rounded-circle d-flex align-items-center justify-content-center shadow-sm" style={{ width: '40px', height: '40px', background: 'var(--main-color)' }}><i className="fas fa-envelope"></i></span>
                                            <div className="contact-info__content pe-3">
                                                <span className="contact-info__text fw-500 d-block text-muted" style={{ fontSize: '12px' }}>Need help?</span>
                                                <I18nLink to={`mailto:info@360ghar.com`} className="contact-info__address fw-bold text-heading text-decoration-none">info@360ghar.com</I18nLink>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-lg-6 order-lg-0 order-1">
                                <div className="banner-thumb">
                                    <LazyImage
                                        src={bannerThreeContent.thumb}
                                        avifSrc="/assets/images/thumbs/banner-three.avif"
                                        avifSrcSet={HERO_AVIF_SRCSET}
                                        webpSrc="/assets/images/thumbs/banner-three.webp"
                                        webpSrcSet={HERO_WEBP_SRCSET}
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        alt="360Ghar - AI-Enabled Real Estate Platform"
                                        width={629}
                                        height={571}
                                        priority
                                    />
                                </div>
                            </div>

                            <div className="col-12">
                                <TabFilter colClass="col-lg-3 col-sm-6 col-6"/>
                            </div>

                        </div>
                    </div>
                </div>
            </section>
            {/* ============================ Banner Three End =============================    */}
        </>
    );
};

export default BannerThree;
