import { useTranslation } from 'react-i18next';
import NewsletterThumb from '/assets/images/thumbs/newsletter-bg.png';
import NewsletterForm from '../../common/forms/NewsletterForm';

const Newsletter = () => {
    const { t } = useTranslation('common');
    return (
        <>
            <section className="newsletter bg-white">
                <div className="container container-two">
                    <div className="newsletter-content text-center background-img" style={{ backgroundImage: `url(${NewsletterThumb})` }}>
                        <h2 className="newsletter-content__title text-white">{t('newsletter.title')}</h2>
                        <p className="newsletter-content__desc font-18 text-white fw-light">{t('newsletter.description')}</p>

                        <NewsletterForm formClass="" inputClass="white-bordered-input" iconClass="text-gradient" />

                    </div>
                </div>
            </section>
        </>
    );
};

export default Newsletter;