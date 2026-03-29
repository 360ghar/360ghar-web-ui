import SectionHeading from '../../common/ui/SectionHeading';
import ValidationForm from '../forms/ValidationForm';

const MessageTwo = () => {
    return (
        <>
            {/* ========================= Message Two Section Start ================================ */}
            <section className="message-two padding-t-60">
                <div className="container container-two">
                    <div className="row gy-4 gy-sm-5">
                        <div className="col-lg-4">
                            <div className="message-two__content">

                                <SectionHeading
                                    headingClass="section-heading style-left style-flex mb-0"  
                                    subtitle="Get a quote"
                                    subtitleClass="" 
                                    title="They chose perfect the property" 
                                    renderDesc={false}
                                    desc="Real estate is a lucrative ind involves the selling and a reproperties. It encompasses residential"
                                    renderButton={false}
                                    renderBesideDesc={true}
                                    buttonClass="btn-main"
                                    buttonText="View More"
                                />

                                <div className="d-flex align-items-center gap-3 mt-4">
                                    <span className="contact-content__icon style-bg font-15">
                                        <i className="fas fa-envelope text-gradient"></i>
                                    </span>
                                    <div className="contact-content__infos">
                                        <span className="contact-content__text">Need help?</span> 
                                        <a href="mailto:info@360ghar.com" className="contact-content__contact font-16 fw-semibold">info@360ghar.com</a>
                                    </div>
                                </div>

                            </div>
                        </div>

                        <div className="col-lg-8">
                            <div className="form-box style-dark">
                                <ValidationForm 
                                    colClass="col-sm-6 col-xs-6" 
                                    inputClass="common-input common-input--withIcon common-input--light"
                                    iconSpanClass="text-gradient"
                                    renderLabel={true}
                                    labelClass="text-white fw-normal"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
            {/* ========================= Message Two Section End ================================ */}
        </>
    );
};

export default MessageTwo;

