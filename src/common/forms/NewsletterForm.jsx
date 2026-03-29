import { useForm, ValidationError } from '@formspree/react';

const NewsletterForm = (props) => {
    const [state, handleSubmit] = useForm("mkgzdjyj");

    if (state.succeeded) {
        return <p className="text-success">Thanks for joining!</p>;
    }

    return (
        <form onSubmit={handleSubmit} className={`newsletter-content__form d-flex align-items-start gap-2 ${props.formClass}`}>
            <div className="w-100">
                <div className="position-relative w-100">
                    <input
                        id="email"
                        type="email"
                        name="email"
                        placeholder="Your Email"
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
                Subscribe <span className="text">Now</span>
            </button>
        </form>
    );
};

export default NewsletterForm;