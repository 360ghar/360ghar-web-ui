import { useForm, ValidationError } from '@formspree/react';
import { useTranslation } from 'react-i18next';

const NewsletterForm = (props) => {
    const { t } = useTranslation('common');
    const [state, handleSubmit] = useForm("mkgzdjyj");

    // UX FIX (audit 5.9): explicit success confirmation message.
    if (state.succeeded) {
        return <p className="text-success">{t('newsletter.subscribeSuccess')}</p>;
    }

    return (
        <form onSubmit={handleSubmit} className={`newsletter-content__form d-flex align-items-start gap-2 ${props.formClass}`}>
            <div className="w-100">
                <div className="position-relative w-100">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder={t('newsletter.emailPlaceholder')}
                        className={`common-input common-input--withLeftIcon w-100 ${props.inputClass}`}
                    />
                    <span className={`input-icon input-icon--left text-white font-20 line-height-1 ${props.iconClass}`}>
                        <i className="far fa-envelope"></i>
                    </span>
                </div>
                <ValidationError
                    prefix="Email"
                    field="email"
                    errors={state.errors}
                    className="text-danger text-start d-block"
                />
            </div>
            <button type="submit" disabled={state.submitting} className="btn btn-main text-uppercase flex-shrink-0">
                {t('newsletter.subscribeBtn')}
            </button>
        </form>
    );
};

export default NewsletterForm;