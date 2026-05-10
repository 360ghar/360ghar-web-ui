import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '../../store';
import { useI18nNavigate } from '../../i18n/I18nLink';
import i18n from '../../i18n';

const LoginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[+]?\d{10,15}$/, () => i18n.t('forms:phone.genericInvalid'))
    .required(() => i18n.t('forms:phone.genericRequired')),
  password: Yup.string()
    .min(6, () => i18n.t('forms:password.minLength6'))
    .required(() => i18n.t('forms:password.required')),
});

const LoginForm = ({ redirectTo = '/' }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useI18nNavigate();
  const { t } = useTranslation('forms');

  const handleSubmit = async (values, { setSubmitting }) => {
    clearError();
    const success = await login(values.phone, values.password);
    setSubmitting(false);
    if (success) {
      navigate(redirectTo);
    }
  };

  return (
    <div className="login-form">
      <Formik
        initialValues={{ phone: '', password: '' }}
        validationSchema={LoginSchema}
        onSubmit={handleSubmit}
      >
        {({ isSubmitting }) => (
          <Form>
            <div className="form-group mb-4">
              <label htmlFor="phone">{t('phone.labelPhoneNumber')}</label>
              <Field
                type="tel"
                name="phone"
                className="form-control"
                placeholder="e.g., +919876543210"
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

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? t('loginRegister.loggingIn') : t('loginBtn')}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm;
