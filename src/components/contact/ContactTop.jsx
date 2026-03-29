import { contactTopInfos } from '../../data/OthersPageData';
import { Link } from 'react-router-dom';

const ContactTop = () => {
    return (
        <>
            <section className="contact-top padding-y-120">
                <div className="container container-two">
                    <div className="section-heading">
                        <span className="section-heading__subtitle bg-gray-100"> 
                            <span className="text-gradient fw-semibold">Contact</span> 
                        </span>
                        <h2 className="section-heading__title">Contact Us!</h2>
                    </div>
                    <div className="row gy-4">
                        {
                            contactTopInfos.map((contactTopInfo, contactTopInfoIndex) => {
                                return (
                                    <div className="col-lg-4 col-sm-6" key={contactTopInfoIndex}>
                                        <div className="contact-card">
                                            <span className="contact-card__icon">{contactTopInfo.icon}</span>
                                            <h5 className="contact-card__title">{contactTopInfo.title}</h5>

                                            {
                                                contactTopInfo.link ? (
                                                    <>
                                                        <p className="contact-card__text font-18">
                                                            <Link to={`${contactTopInfo.link} ${contactTopInfo.textOne}`} className="link">{contactTopInfo.textOne}</Link>
                                                        </p>
                                                        <p className="contact-card__text font-18">
                                                            <Link to={`${contactTopInfo.link} ${contactTopInfo.textTwo}`} className="link">{contactTopInfo.textTwo}</Link>
                                                        </p>
                                                    </>

                                                ) : (
                                                    <p className="contact-card__text font-18">
                                                        {contactTopInfo.text}
                                                    </p>
                                                )
                                            }
                                        </div>
                                    </div>
                                    
                                )
                            })
                        }
                    </div>
                </div>
            </section>
        </>
    );
};

export default ContactTop;