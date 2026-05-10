import { useTranslation } from 'react-i18next';
import BottomFooterLinks from './footer/BottomFooterLinks';

const FooterBottom = (props) => {
    const { t } = useTranslation();
    return (
        <>
             <div className={`bottom-footer ${props.footerClass}`}>
                <div className="container container-two">
                    <div className="bottom-footer__inner flx-between gap-3">
                        <p className="bottom-footer__text"> &copy; 360Ghar {new Date().getFullYear()} | {t('footer.allRightsReserved')}</p>
                        <BottomFooterLinks/>
                    </div>
                </div>
            </div>   
        </>
    );
};

export default FooterBottom;