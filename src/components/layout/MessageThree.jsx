import React from 'react';
import SectionHeading from '../../common/SectionHeading';
import { messageThreeContents } from '../../data/HomeThreeData/HomeThreeData';
import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const MessageThree = () => {
    return (
        <>
            <section className="message-three bg-white padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4 gy-sm-5">
                        <div className="col-lg-4">
                            <div className="message-two__content">

                                <SectionHeading
                                    headingClass="section-heading style-left style-flex mb-0"  
                                    subtitle="Owner Onboarding"
                                    subtitleClass="" 
                                    title="Free Owner Onboarding + Photography" 
                                    renderDesc={true}
                                    desc="We come to your doorstep to capture studio‑quality 360° media, verify details & location, and publish your listing. No upfront listing fee (limited time)."
                                    renderButton={false}
                                    renderBesideDesc={true}
                                    buttonClass="btn-main"
                                    buttonText="View More"
                                />
                                
                                <div className="contact-content__box">
                                    <div className=" d-flex align-items-center gap-3">
                                        <div className="contact-content__icon">
                                            <LazyImage src={messageThreeContents.icon} alt=""/>
                                        </div>
                                        <div className="contact-content__infos">
                                            <span className="contact-content__text">Owners, need help?</span> 
                                            <a href={`mailto:info@360ghar.com`} className="contact-content__contact font-20 fw-semibold text-heading">info@360ghar.com</a>
                                        </div>
                                    </div>
                                    <p className="section-heading__desc">{messageThreeContents.desc}</p>
                                </div>
                                
                            </div>
                        </div>
                        <div className="col-lg-8 ps-lg-4">
                            <div className="form-box max-w-unset">
                                <form action="https://formspree.io/f/mwpqglyb" method="POST" className="contact-form__form">
                                    <div className="row gy-4">
                                        <div className="col-sm-6 col-xs-6">
                                            <label htmlFor="full_name" className="form-label text-black fw-normal font-14">Full Name</label>
                                            <div className="position-relative">
                                                <input id="full_name" name="full_name" type="text" className="common-input common-input--withIcon" placeholder="Full Name" required />
                                                <span className="input-icon"><i className="fas fa-user"></i></span>
                                            </div>
                                        </div>
                                        <div className="col-sm-6 col-xs-6">
                                            <label htmlFor="email" className="form-label text-black fw-normal font-14">Email</label>
                                            <div className="position-relative">
                                                <input id="email" name="email" type="email" className="common-input common-input--withIcon" placeholder="Email Address" required />
                                                <span className="input-icon"><i className="fas fa-paper-plane"></i></span>
                                            </div>
                                        </div>
                                        
                                        <div className="col-sm-6 col-xs-6">
                                            <label htmlFor="address" className="form-label text-black fw-normal font-14">Property Address / Area</label>
                                            <div className="position-relative">
                                                <input id="address" name="address" type="text" className="common-input common-input--withIcon" placeholder="e.g., DLF Phase 3, Gurugram" required />
                                                <span className="input-icon"><i className="fas fa-map-marker-alt"></i></span>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <label htmlFor="message" className="form-label text-black fw-normal font-14">Notes (Optional)</label>
                                            <div className="position-relative">
                                                <textarea id="message" name="message" className="common-input common-input--withIcon" placeholder="Add any specifics about your property"></textarea>
                                                <span className="input-icon"><i className="fas fa-envelope"></i></span>
                                            </div>
                                        </div>
                                        <input type="hidden" name="source" value="Owner Onboarding CTA" />
                                        <div className="col-12">
                                            <div className="common-check">
                                                <input className="form-check-input" type="checkbox" id="terms_agreement" name="terms_agreement" required />
                                                <label className="form-check-label" htmlFor="terms_agreement">
                                                    I agree to the <Link to="/policies/terms-of-service" className="text-decoration-underline text-main">Terms of Service</Link> and <Link to="/policies/privacy-policy" className="text-decoration-underline text-main">Privacy Policy</Link>.
                                                </label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <button type="submit" className="btn btn-main w-100">Request Free Owner Onboarding</button>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </section>   
        </>
    );
};

export default MessageThree;