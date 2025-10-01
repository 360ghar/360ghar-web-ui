import React from 'react';
import { useForm, ValidationError } from '@formspree/react';

const ContactUsSection = () => {
    const [state, handleSubmit] = useForm("mwpqglyb");

    if (state.succeeded) {
        return (
            <section className="contact-us-section padding-b-120">
                <div className="container container-two">
                    <div className="contact-form bg-white">
                        <div className="section-heading">
                            <span className="section-heading__subtitle bg-gray-100">
                                <span className="text-gradient fw-semibold">Contact us</span>
                            </span>
                            <h2 className="section-heading__title">Do you have any question?</h2>
                            <p className="section-heading__desc">Thank you for your message! We have received your inquiry and will get back to you within 24 hours.</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }
    
    return (
        <section className="contact-us-section padding-b-120">
            <div className="container container-two">
                <div className="contact-form bg-white">
                    <div className="section-heading">
                        <span className="section-heading__subtitle bg-gray-100">
                            <span className="text-gradient fw-semibold">Contact us</span>
                        </span>
                        <h2 className="section-heading__title">Do you have any question?</h2>
                        <p className="section-heading__desc">We're here to help you find your dream property in Gurgaon. Our expert team is ready to assist with property search, documentation, and all your real estate needs.</p>
                    </div>
                    <div className="contact-form__form">
                        <form onSubmit={handleSubmit} className="contact-form__form">
                            <div className="row gy-4">
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="user_name"
                                        type="text"
                                        name="user_name"
                                        className="common-input"
                                        placeholder="Your Name"
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="user_email"
                                        type="email"
                                        name="user_email"
                                        className="common-input"
                                        placeholder="Your E-mail"
                                    />
                                    <ValidationError
                                        prefix="Email"
                                        field="user_email"
                                        errors={state.errors}
                                        className="text-danger"
                                    />
                                </div>
                                
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="user_subject"
                                        type="text"
                                        name="user_subject"
                                        className="common-input"
                                        placeholder="Subject"
                                    />
                                </div>
                                <div className="col-12">
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="common-input"
                                        placeholder="Your Message"
                                    />
                                    <ValidationError
                                        prefix="Message"
                                        field="message"
                                        errors={state.errors}
                                        className="text-danger"
                                    />
                                </div>
                                <div className="col-12">
                                    <button type="submit" disabled={state.submitting} className="btn btn-main w-100">
                                        Submit Now
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ContactUsSection;