import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store';
import { useNavigate } from 'react-router-dom';
import i18n from '../../i18n';

const RegisterSchema = Yup.object().shape({
  full_name: Yup.string()
    .min(2, () => i18n.t('forms:name.tooShortMin'))
    .max(50, () => i18n.t('forms:name.tooLong'))
    .required(() => i18n.t('forms:name.required')),
  email: Yup.string()
    .email(() => i18n.t('forms:email.invalidShort'))
    .required(() => i18n.t('forms:email.required')),
  phone: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, () => i18n.t('forms:phone.mustBeValid'))
    .required(() => i18n.t('forms:phone.genericRequired')),
  password: Yup.string()
    .min(6, () => i18n.t('forms:password.minLength6'))
    .required(() => i18n.t('forms:password.required')),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], () => i18n.t('forms:password.mustMatch'))
    .required(() => i18n.t('forms:password.confirmRequired')),
});

const RegisterForm = ({ redirectTo = '/' }) => {
  const { register, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useTranslation('forms');

  const handleSubmit = async (values, { setSubmitting }) => {
    clearError();
    
    const userData = {
      full_name: values.full_name,
      email: values.email,
      phone: values.phone,
      password: values.password,
    };
    
    const success = await register(userData);
    setSubmitting(false);
    
    if (success) {
      navigate(redirectTo);
    }
  };

  return (
    <div className="register-form">
      <Formik
        initialValues={{
          full_name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
        }}
        validationSchema={RegisterSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group mb-4">
              <label htmlFor="full_name">{t('name.label')}</label>
              <Field
                type="text"
                name="full_name"
                className="form-control"
                placeholder={t('name.placeholderYourName')}
              />
              <ErrorMessage name="full_name" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-4">
              <label htmlFor="email">{t('email.label')}</label>
              <Field
                type="email"
                name="email"
                className="form-control"
                placeholder={t('email.placeholderYourEmail')}
              />
              <ErrorMessage name="email" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-4">
              <label htmlFor="phone">{t('phone.labelPhoneNumber')}</label>
              <Field
                type="text"
                name="phone"
                className="form-control"
                placeholder={t('phone.labelPhoneNumber')}
              />
              <ErrorMessage name="phone" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-4">
              <label htmlFor="password">{t('password.label')}</label>
              <Field
                type="password"
                name="password"
                className="form-control"
                placeholder={t('password.placeholderYour')}
              />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-4">
              <label htmlFor="confirmPassword">{t('password.labelConfirm')}</label>
              <Field
                type="password"
                name="confirmPassword"
                className="form-control"
                placeholder={t('password.placeholderConfirmYour')}
              />
              <ErrorMessage name="confirmPassword" component="div" className="text-danger" />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? t('registering') : t('registerBtn')}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default RegisterForm;
