import { footerInfos } from '../../../data/CommonData';

const FooterInfo = () => {
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
                                    <span className="contact-info__text text-white">{footerInfo.text}</span>
                                    <span className="contact-info__address text-white">{footerInfo.address}</span>
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