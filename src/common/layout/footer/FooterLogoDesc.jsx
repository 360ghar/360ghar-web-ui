import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import LogoWhite from '../../LogoWhite';
import { offCanvasInfos } from '../../../data/CommonData';
import { I18nLink } from '../../../i18n/I18nLink';

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
            <p className="footer-item__desc">India&apos;s VR-First Way to Find a Home. Verified properties with studio-quality 360° guided walkthroughs in Gurugram. Buy, sell, or rent — no fake listings, zero upfront fees.</p>

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
                                <I18nLink to={`${info.link}${text}`} className="footer-contact-text text-white text-decoration-none">
                                    {text}
                                </I18nLink>
                            ) : (
                                <span className="footer-contact-text text-white">{text}</span>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Newsletter Subscription */}
            < div className="footer-newsletter mt-4" >
                <h6 className="footer-item__title mb-3">Stay Updated</h6>
                <form onSubmit={handleSubscribe} className="newsletter-form">
                    <div className="input-group">
                        <input
                            type="email"
                            className="form-control rounded-start-pill border-0 px-3"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <button
                            type="submit"
                            className="btn btn-main rounded-end-pill px-3"
                            disabled={!email}
                        >
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </div>
                    {isSubscribed && (
                        <div className="alert alert-success mt-2 py-2 px-3 small">
                            Subscribed successfully!
                        </div>
                    )}
                </form>
            </div >
        </>
    );
};

export default FooterLogoDesc;