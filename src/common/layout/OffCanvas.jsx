import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import LogoWhite from '../LogoWhite';
import { offCanvasInfos } from '../../data/CommonData';
import SearchBox from '../search/SearchBox';
import SocialList from '../ui/SocialList';
import { useUIStore } from '../../store';
import { siteMetadata } from '../../seo/siteMetadata';
import { useFocusTrap } from '../useFocusTrap';

const OffCanvas = () => {

    const { offCanvas, handleOffCanvasClose } = useUIStore();
    const { t } = useTranslation('common');
    const panelRef = useRef(null);

    // IMP FIX (audit 5.5): trap focus inside the off-canvas panel while open
    // for keyboard / screen-reader accessibility.
    useFocusTrap(panelRef, offCanvas);

    // Mount the search box only while the panel is open. The panel sits in the DOM on every
    // page, so mounting SearchBox eagerly would download ~230KB of Google Maps/Places JS on
    // every cold load even though the panel is closed (and display:none on mobile). The Maps
    // API is cached on window.google after the first open, so reopening does not reload it.

    return (
        <>
            <div className={`side-overlay ${offCanvas ? 'show' : '' }`} onClick={handleOffCanvasClose}></div>

            {/* ==================== Right Offcanvas Start Here ==================== */}
            <div
                ref={panelRef}
                tabIndex={-1}
                className={`common-offcanvas d-lg-block d-none ${offCanvas ? 'active' : '' }`}
                role="dialog"
                aria-modal="true"
                aria-label={t('offCanvas.panelAriaLabel')}
            >
                <div className="flx-between">
                    <LogoWhite/>
                    <button type="button" className="close-button d-flex position-relative top-0 end-0" onClick={handleOffCanvasClose}> 
                        <i className="fas fa-times"></i> 
                    </button>
                </div>

                {offCanvas && <SearchBox/>}

                <ul className="address-list mt-5">
                    {offCanvasInfos.map((offCanvasInfo, index) => {
                        const text = t(offCanvasInfo.textKey);
                        const isExternalLink = offCanvasInfo.link && (offCanvasInfo.link.startsWith('mailto:') || offCanvasInfo.link.startsWith('tel:') || offCanvasInfo.link.startsWith('http://') || offCanvasInfo.link.startsWith('https://'));
                        return (
                            <li className="address-list__item flx-align flex-nowrap" key={index}>
                                <span className="address-list__icon"> { offCanvasInfo.icon } </span>
                                <div className="address-list__content">
                                    {isExternalLink ? (
                                        <a href={`${offCanvasInfo.link}${text}`} className="address-list__text">
                                            {text}
                                        </a>
                                    ) : offCanvasInfo.link ? (
                                        <I18nLink to={`${offCanvasInfo.link}${text}`} className="address-list__text">
                                            {text}
                                        </I18nLink>
                                    ) : (
                                        <p className="address-list__text">{text}</p>
                                    )}
                                </div>
                            </li>
                        );
                    })}
                </ul>

                <div className="google-map mt-5">
                    {/* AUDIT FIX (5.4): replaced the hardcoded New York City
                        iframe with the configurable Gurugram service-area map
                        from siteMetadata. */}
                    <iframe
                        src={siteMetadata.mapEmbedUrl}
                        loading="lazy"
                        className="w-100 h-100"
                        title={t('offCanvas.mapTitle', '360Ghar service area map')}
                        referrerPolicy="no-referrer-when-downgrade"
                    ></iframe>
                </div>

                <SocialList/>
                
            </div>
            {/* ==================== Right Offcanvas End Here ==================== */}
        </>
    );
};

export default OffCanvas;
