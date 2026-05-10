import { useTranslation } from 'react-i18next';
import { footerInfos } from '../../../data/CommonData';

const FooterInfo = () => {
    const { t } = useTranslation('common');
    return (
        <>
              <div className="row gy-4">
                {
                    footerInfos.map((footerInfo, footerInfoIndex) => {
                        return (
                            <div className="col-6" key={footerInfoIndex}>
                            <div className="contact-info d-flex gap-2">
                                <span className="contact-info__icon text-gradient">{footerInfo.icon}</span>
                                <div className="contact-info__content">
                                    <span className="contact-info__text text-white">{t(footerInfo.textKey)}</span>
                                    <span className="contact-info__address text-white">{t(footerInfo.addressKey)}</span>
                                </div>
                            </div>
                        </div>
                        )
                    })
                }
            </div>
        </>
    );
};

export default FooterInfo;