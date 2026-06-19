import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoWhite from '../../LogoWhite';
import { offCanvasInfos } from '../../../data/CommonData';


const FooterLogoDesc = () => {
    const { t } = useTranslation('common');
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);

    const handleSubscribe = (e) => {
        e.preventDefault();
        if (email) {
            // Here you would typically call an API to subscribe the user
            setIsSubscribed(true);
            setEmail('');
            setTimeout(() => setIsSubscribed(false), 3000);
        }
    };

    return (
        <>
            <div className="footer-item__logo mb-3">
                <LogoWhite />
            </div>
            <p className="footer-item__desc">{t('footer.logoDesc')}</p>

            {/* Contact Info */}
            <div className="footer-contact-info mt-4">
                {offCanvasInfos.map((info, index) => {
                    const text = t(info.textKey);
                    return (
                        <div key={index} className="footer-contact-item d-flex align-items-center gap-2 mb-2">
                            <span className="footer-contact-icon text-gradient">
                                {info.icon}
                            </span>
                            {info.link === 'tel:' || info.link === 'mailto:' ? (
                                <a href={`${info.link}${text}`} className="footer-contact-text text-white text-decoration-none">
                                    {text}
                                </a>
                            ) : (
                                <span className="footer-contact-text text-white">{text}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Newsletter Subscription */}
            < div className="footer-newsletter mt-4" >
                <h6 className="footer-item__title mb-3">{t('footer.stayUpdated')}</h6>
                <form onSubmit={handleSubscribe} className="newsletter-form">
                    <div className="input-group">
                        <input
                            type="email"
                            className="form-control rounded-start-pill border-0 px-3"
                            placeholder={t('footer.enterYourEmail')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-main rounded-end-pill px-3"
                            disabled={!email}
                            aria-label="Subscribe"
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    {isSubscribed && (
                        <div className="alert alert-success mt-2 py-2 px-3 small">
                            {t('footer.subscribedSuccessfully')}
                        </div>
                    )}
                </form>
            </div >
        </>
    );
};

export default FooterLogoDesc;