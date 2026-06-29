
import BannerTwoThumb from '/assets/images/thumbs/banner-two-filter-bg.webp';
import TabFilter from '../../common/forms/TabFilter';
import { bannerTwoContent } from '../../data/HomeTwoData';
import { I18nLink } from '../../i18n/I18nLink';

import LazyImage from '../../common/ui/LazyImage';
const BannerTwo = () => {
    return (
        <>
            {/* ============================= Banner Two Start ============================= */}
            <div className="banner-two">
                <div className="container container-two">
                    <div className="banner-two__content flx-between">
                        <h1 className="banner-two__title"> {bannerTwoContent.title}<span className="text">{ bannerTwoContent.boldTitle}</span> </h1>
                        <div className="contact-content">
                            <p className="contact-content__desc font-18">{bannerTwoContent.desc}</p>
                            <div className="d-flex align-items-center gap-3">
                                <div className="contact-content__icon">
                                    <LazyImage src={bannerTwoContent.icon} alt="Contact support phone icon"/>
                                </div>
                                <div className="contact-content__infos">
                                    <span className="contact-content__text">{bannerTwoContent.text}</span> 
                                    <I18nLink to={`${bannerTwoContent.numberLink}${bannerTwoContent.number}`} className="contact-content__contact">{bannerTwoContent.number}</I18nLink>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="banner-two__filter background-img" style={{ backgroundImage: `url(${BannerTwoThumb})` }}>
                        <div className="filter--box ms-auto">
                            <TabFilter />
                        </div>
                    </div>
                </div>
            </div>
            {/* ============================= Banner Two End ============================= */}
        </>
    );
};

export default BannerTwo;