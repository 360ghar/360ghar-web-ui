import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import LogoWhite from '../LogoWhite';
import { offCanvasInfos } from '../../data/CommonData';
import SearchBox from '../search/SearchBox';
import SocialList from '../ui/SocialList';
import { useUIStore } from '../../store';

const OffCanvas = () => {

    const { offCanvas, handleOffCanvasClose } = useUIStore();
    const { t } = useTranslation('common'); 
    
    return (
        <>
            <div className={`side-overlay ${offCanvas ? 'show' : '' }`} onClick={handleOffCanvasClose}></div>

            {/* ==================== Right Offcanvas Start Here ==================== */}
            <div className={`common-offcanvas d-lg-block d-none ${offCanvas ? 'active' : '' }`} >
                <div className="flx-between">
                    <LogoWhite/>
                    <button type="button" className="close-button d-flex position-relative top-0 end-0" onClick={handleOffCanvasClose}> 
                        <i className="fas fa-times"></i> 
                    </button>
                </div>

                <SearchBox/>

                <ul className="address-list mt-5">
                    {offCanvasInfos.map((offCanvasInfo, index) => (
                        <li className="address-list__item flx-align flex-nowrap" key={index}>
                            <span className="address-list__icon"> { offCanvasInfo.icon } </span>
                            <div className="address-list__content">
                                {Array.isArray(offCanvasInfo.link) ? (
                                    offCanvasInfo.link.map((link, linkIndex) => (
                                        <I18nLink to={`${link}${offCanvasInfo.text[linkIndex]}`} className="address-list__text" key={linkIndex}>
                                            {offCanvasInfo.text[linkIndex]}
                                        </I18nLink>
                                    ))
                                ) : (
                                    offCanvasInfo.link ? (
                                        <I18nLink to={`${offCanvasInfo.link}${offCanvasInfo.text}`} className="address-list__text">
                                            {offCanvasInfo.text}
                                        </I18nLink>
                                    ) : (
                                        <p className="address-list__text">{offCanvasInfo.text}</p>
                                    )
                                )}
                            </div>
                        </li>
                    ))}
                </ul>

                <div className="google-map mt-5">
                    <iframe src="https://www.google.com/maps/embed?pb=!1m10!1m8!1m3!1d1511.2499674845235!2d-73.99553882767792!3d40.75102778252164!3m2!1i1024!2i768!4f13.1!5e0!3m2!1sen!2sbd!4v1686536419224!5m2!1sen!2sbd" loading="lazy" className="w-100 h-100"></iframe>
                </div>

                <SocialList/>
                
            </div>
            {/* ==================== Right Offcanvas End Here ==================== */}
        </>
    );
};

export default OffCanvas;
