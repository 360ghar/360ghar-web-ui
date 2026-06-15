import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import BreadcrumbImage from '/assets/images/thumbs/breadcrumb-img.webp';

import LazyImage from '../ui/LazyImage';
const Breadcrumb = (props) => {
    const { t } = useTranslation('common');
    const isCompact = props.variant === 'compact';
    const sectionClass = `breadcrumb ${isCompact ? 'breadcrumb--compact' : 'padding-y-120'}`;
    return (
        <>
            {/* =============================== Breadcrumb Start ===========================    */}
            <section className={sectionClass}>
                <LazyImage src={BreadcrumbImage} alt="Breadcrumb Image" className="breadcrumb__img" priority />
                <div className="container">
                    <div className="row justify-content-center">
                        <div className="col-lg-8">
                            <div className="breadcrumb__wrapper">
                                <h2 className="breadcrumb__title"> {props.pageTitle}</h2>
                                <ul className="breadcrumb__list">
                                    <li className="breadcrumb__item">
                                        <I18nLink to="/" className="breadcrumb__link"> <i className="fas fa-home"></i> {t('breadcrumb.home')}</I18nLink> 
                                    </li>
                                    <li className="breadcrumb__item"><i className="fas fa-angle-right"></i></li>
                                    <li className="breadcrumb__item"> <span className="breadcrumb__item-text"> {props.pageName}  </span> </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* =============================== Breadcrumb End ===========================    */}
        </>
    );
};

export default Breadcrumb;
