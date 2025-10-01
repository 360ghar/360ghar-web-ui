import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useAuthStore } from '../../store';
import { useNavigate } from 'react-router-dom';

const LoginSchema = Yup.object().shape({
  phone: Yup.string()
    .matches(/^[+]?\d{10,15}$/, 'Enter a valid phone number')
    .required('Phone number is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
});

const LoginForm = ({ redirectTo = '/' }) => {
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

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
              <label htmlFor="phone">Phone Number</label>
              <Field
                type="tel"
                name="phone"
                className="form-control"
                placeholder="e.g., +919876543210"
              />
              <ErrorMessage name="phone" component="div" className="text-danger" />
            </div>

            <div className="form-group mb-4">
              <label htmlFor="password">Password</label>
              <Field
                type="password"
                name="password"
                className="form-control"
                placeholder="Your Password"
              />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting || isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginForm; 