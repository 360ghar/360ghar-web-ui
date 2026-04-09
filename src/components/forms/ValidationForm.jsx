import { useFormik } from "formik";
import * as yup from "yup";
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import i18n from '../../i18n';

const ValidationForm = (props) => {

    const { t } = useTranslation('forms');

    const formik = useFormik({
        initialValues: {
            name: "",
            email: "",
            address: "",
            message: "",
        },
        // Validate by Yup
        validationSchema: yup.object({
            name: yup.string().min(3, () => i18n.t('forms:name.tooShort')).required(() => i18n.t('forms:generic.required')),
            address: yup.string().min(3, () => i18n.t('forms:address.tooShort')).required(() => i18n.t('forms:generic.required')),
            email: yup.string().email(() => i18n.t('forms:email.invalid')).required(() => i18n.t('forms:generic.required')),
            message: yup.string().min(5, () => i18n.t('forms:message.minLength')),
        }),

        onSubmit: (values, { resetForm }) => {
            resetForm({ values: "" });
            toast.success(t('generic.congratsSuccess'), {
                theme: "colored",
            });
        },
    });

    // Render Errors Code Start
    const renderNameError = formik.touched.name && formik.errors.name && (
        <span className="text-danger">{formik.errors.name}</span>
    );

    const renderEmailError = formik.touched.email && formik.errors.email && (
        <span className="text-danger">{formik.errors.email}</span>
    );

    const renderAddressError = formik.touched.address && formik.errors.address && (
        <span className="text-danger">{formik.errors.address}</span>
    );

    const renderMessageError = formik.touched.message &&
        formik.errors.message && (
            <span className="text-danger">{formik.errors.message}</span>
        );
    // Render Errors Code End

    return (
        <>
            <form action="#" onSubmit={formik.handleSubmit}>
                <div className="row gy-30">
                    <div className={props.colClass}>
                        {
                            props.renderLabel && (
                                <label htmlFor="name" className={`form-label ${props.labelClass}`}>{t('name.labelYourName')}</label>
                            )
                        }
                        <div className="position-relative">
                            <input
                                type="text"
                                placeholder={t('name.placeholderName')}
                                name='name'
                                id='name'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.name}
                                className={`${props.inputClass} ${formik.touched.name && formik.errors.name ? "is-invalid" : ""
                                    }`}
                            />
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-user"></i></span>
                        </div>
                        {renderNameError}
                    </div>



                    <div className={props.colClass}>
                        {
                            props.renderLabel && (
                                <label htmlFor="email" className={`form-label ${props.labelClass}`}>{t('email.labelYourEmail')}</label>
                            )
                        }
                        <div className="position-relative">
                            <input
                                type="email"
                                placeholder={t('email.placeholderYourEmail')}
                                name='email'
                                id='email'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.email}
                                className={`${props.inputClass} ${formik.touched.email && formik.errors.email ? "is-invalid" : ""
                                    }`}
                            />
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-paper-plane"></i></span>
                        </div>
                        {renderEmailError}
                    </div>

                    <div className={props.colClass}>
                        {
                            props.renderLabel && (
                                <label htmlFor="address" className={`form-label ${props.labelClass}`}>{t('address.label')}</label>
                            )
                        }
                        <div className="position-relative">
                            <input
                                type="text"
                                placeholder={t('address.placeholder')}
                                name='address'
                                id='address'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.address}
                                className={`${props.inputClass} ${formik.touched.address && formik.errors.address ? "is-invalid" : ""
                                    }`}
                            />
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-map-marker-alt"></i></span>
                        </div>
                        {renderAddressError}
                    </div>

                    <div className="col-lg-12">
                        {
                            props.renderLabel && (
                                <label htmlFor="message" className={`form-label ${props.labelClass}`}>{t('message.label')}</label>
                            )
                        }
                        <div className="position-relative">
                            <textarea
                                placeholder={t('message.placeholder')}
                                name='message'
                                id='message'
                                onChange={formik.handleChange}
                                onBlur={formik.handleBlur}
                                value={formik.values.message}
                                className={`${props.inputClass} ${formik.touched.message && formik.errors.message ? "is-invalid" : ""
                                    }`}
                            >
                            </textarea>
                            <span className={`input-icon ${props.iconSpanClass}`}><i className="fas fa-envelope"></i></span>
                        </div>
                        {renderMessageError}
                    </div>

                    <div className="col-lg-12">
                        <button type="submit" className="btn btn-main w-100"> {t('message.sendBtn')} </button>
                    </div>
                </div>
            </form>
        </>
    );
};

export default ValidationForm;
