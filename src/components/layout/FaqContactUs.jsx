import SectionHeading from '../../common/ui/SectionHeading';
import ValidationForm from '../forms/ValidationForm';

const FaqContactUs = () => {
    return (
        <>
            <section className="contact-us">
                <div className="container container-two">
                    <div className="contact-form bg-gray-100 shadow-none">  

                        <SectionHeading
                            headingClass=""  
                            subtitle="Contact uss"
                            subtitleClass="bg-gray-100" 
                            title="Do you have any question? " 
                            renderDesc={true}
                            desc="For your car we will do everything  advice, repairs and maintenance. We are the some preferred choice by many car owners because"
                            renderButton={false}
                            buttonClass="btn-main"
                            buttonText="View More"
                        />
                        <div className="contact-form__form">
                            <ValidationForm
                                colClass="col-sm-6 col-xs-6" 
                                inputClass="common-input"
                                iconSpanClass="d-none text-gradient"
                                renderLabel={false}
                                labelClass="text-white fw-normal"
                            />
                        </div>
                    </div>
                </div>
            </section>   
        </>
    );
};

export default FaqContactUs;