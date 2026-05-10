import { useTranslation } from 'react-i18next';
import { footerUsefulLinks } from '../../../data/CommonData';
import { I18nLink } from '../../../i18n/I18nLink';

const FooterUsefulItem = () => {
    const { t } = useTranslation();
    return (
        <div className="footer-item ms-xl-5">
            <h6 className="footer-item__title">{t('footer.usefulLinks')}</h6>
            <ul className="footer-menu">
                {footerUsefulLinks.map((link, index) => (
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

export default FooterUsefulItem;
