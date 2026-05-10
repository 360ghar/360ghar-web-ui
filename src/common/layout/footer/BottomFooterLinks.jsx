import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../../i18n/I18nLink';
import { BottomFooterLink } from '../../../data/CommonData';

const BottomFooterLinks = () => {
    const { t } = useTranslation();
    return (
        <div className="footer-links">
            {BottomFooterLink.map((link, index) => (
                <I18nLink to={link.link} className="footer-link" key={index}>
                    {t(link.textKey)}
                </I18nLink>
            ))}
        </div>
    );
};

export default BottomFooterLinks;
