import { useTranslation } from 'react-i18next';
import CtaThumb from '/assets/images/thumbs/cta-img.webp';
import NewsletterForm from '../../common/forms/NewsletterForm';

import LazyImage from '../../common/ui/LazyImage';
const Cta = (props) => {
    const { t } = useTranslation('common');
    return (
        <section className={`cta padding-b-120 ${props.ctaClass}`}>
            <div className="container container-two">
                <div className="cta-box flx-between gap-2">
                    <div className="cta-content">
                        <h2 className="cta-content__title">{t('cta.title')} <span className="text-gradient">{t('cta.newsletter')}</span> </h2>
                        <p className="cta-content__desc">{t('cta.description')}</p>

                        <NewsletterForm formClass="max-w-unset" inputClass="bg-danger" iconClass="text-gradient" />

                    </div>
                    <div className="cta-content__thumb d-xl-block d-none">
                        <LazyImage src={CtaThumb} alt={t('cta.imageAlt')} />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Cta;