import { useForm, ValidationError } from '@formspree/react';

const SubscribeBox = () => {
    const [state, handleSubmit] = useForm("mkgzdjyj");

    if (state.succeeded) {
        return <p className="text-success mt-3">Thanks for joining!</p>;
    }

    return (
        <form onSubmit={handleSubmit} className="mt-4 subscribe-box">
            <div className="input-group">
                <input
                    id="email"
                    type="email"
                    name="email"
                    className="form-control common-input common-input--md text-white"
                    placeholder="Your mail address"
                />
                <button
                    type="submit"
                    disabled={state.submitting}
                    className="px-4 input-group-text bg--gradient border-0 text-white"
                >
                    <i className="fas fa-paper-plane"></i>
                </button>
            </div>
            <ValidationError
                prefix="Email"
                field="email"
                errors={state.errors}
                className="text-danger mt-2"
            />
        </form>
    );
};

export default SubscribeBox;