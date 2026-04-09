import { useTranslation } from 'react-i18next';
import { footerServiceLinks } from '../../../data/CommonData';
import { I18nLink } from '../../../i18n/I18nLink';

const FooterServiceItem = () => {
    const { t } = useTranslation();
    return (
        <div className="footer-item">
            <h6 className="footer-item__title">Services</h6>
            <ul className="footer-menu">
                {footerServiceLinks.map((link, index) => (
                    <li className="footer-menu__item" key={index}>
                        <I18nLink to={link.link} className="footer-menu__link">
                            {t(link.textKey)}
                        </I18nLink>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default FooterServiceItem;
