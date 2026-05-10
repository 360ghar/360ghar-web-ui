import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import { topHeaderInfos } from '../../data/CommonData';

const TopHeader = () => {
    const { t } = useTranslation('common');
    return (
        <>
            {/* ==================== Header Top Start Here ==================== */}
            <div className="header-top">
                <div className="container container-two">

                    <div className="header-info-wrapper flx-between">
                        {
                            topHeaderInfos.map((item, index) => (
                                <div key={index} className={`header-info flx-align ${index === 2 ? 'd-sm-block d-none ms-auto' : ''}`}>
                                    <div className="header-info__item flx-align">
                                        <span className="header-info__icon">{item.icon}</span>
                                        {
                                            item.link ? (
                                                (item.link === 'tel:' || item.link === 'mailto:') ? (
                                                    <a href={`${item.link}${t(item.textKey)}`} className="header-info__text">{t(item.textKey)}</a>
                                                ) : (
                                                    <I18nLink to={`${item.link}${t(item.textKey)}`} className="header-info__text">{t(item.textKey)}</I18nLink>
                                                )
                                            ) : (
                                                <p className="header-info__text">{t(item.textKey)}</p>
                                            )
                                        }
                                    </div>
                                </div>
                            ))
                        }
                    </div>

                </div>
            </div>
            {/* ==================== Header Top End Here ==================== */}   
        </>
    );
};

export default TopHeader;