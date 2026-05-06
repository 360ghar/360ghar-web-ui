import { useForm, ValidationError } from '@formspree/react';
import { useTranslation, Trans } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';

const ContactUsSection = () => {
    const { t } = useTranslation('policies');
    const [state, handleSubmit] = useForm("mwpqglyb");

    if (state.succeeded) {
        return (
            <section className="contact-us-section padding-b-120">
                <div className="container container-two">
                    <div className="contact-form bg-white">
                        <div className="section-heading">
                            <span className="section-heading__subtitle bg-gray-100">
                                <span className="text-gradient fw-semibold">{t('contact.formSubtitle')}</span>
                            </span>
                            <h2 className="section-heading__title">{t('contact.formTitle')}</h2>
                            <p className="contact-item__desc">
                                <Trans i18nKey="contact.formDescSuccess" t={t} components={[<I18nLink key="faq" to="/faq" className="text-main text-decoration-underline" />]} />
                            </p>
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
                            <span className="text-gradient fw-semibold">{t('contact.formSubtitle')}</span>
                        </span>
                        <p className="section-heading__desc">{t('contact.formDesc')}</p>
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
                                        placeholder={t('contact.namePlaceholder')}
                                    />
                                </div>
                                <div className="col-sm-6 col-xs-6">
                                    <input
                                        id="user_email"
                                        type="email"
                                        name="user_email"
                                        className="common-input"
                                        placeholder={t('contact.emailPlaceholder')}
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
                                        placeholder={t('contact.subjectPlaceholder')}
                                    />
                                </div>
                                <div className="col-12">
                                    <textarea
                                        id="message"
                                        name="message"
                                        className="common-input"
                                        placeholder={t('contact.messagePlaceholder')}
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
                                        {t('contact.submit')}
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