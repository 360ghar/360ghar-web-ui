import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLazyToast } from '../../common/useLazyToast';
import { PROPERTY_TYPE_OPTIONS } from '../../utils/propertyTaxonomy';

const PROPERTY_TYPES = PROPERTY_TYPE_OPTIONS;

const INTENT_OPTIONS = [
  { value: 'rent', label: 'Rent' },
  { value: 'sale', label: 'Sale' },
];

const RELATIONSHIP_OPTIONS = [
  { value: 'self', label: 'Self (I am the owner)' },
  { value: 'friend', label: 'Friend' },
  { value: 'family', label: 'Family Member' },
  { value: 'neighbor', label: 'Neighbor' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'acquaintance', label: 'Acquaintance' },
  { value: 'agent', label: 'Real Estate Agent' },
  { value: 'other', label: 'Other' },
];

const INITIAL_FORM_STATE = {
  referrer: {
    name: '',
    phone: '',
    email: '',
    relationship: '',
  },
  property: {
    owner_name: '',
    owner_phone: '',
    address: '',
    locality: '',
    property_type: '',
    intent: '',
    expected_price: '',
    additional_notes: '',
  },
  consent: false,
  terms_accepted: false,
};

const ReferralForm = () => {
  const { t } = useTranslation('properties');
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const { success: toastSuccess, error: toastError } = useLazyToast();

  const handleInputChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
    if (errors[`${section}.${field}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`${section}.${field}`];
        return newErrors;
      });
    }
  };

  const handleCheckboxChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.referrer.name.trim()) {
      newErrors['referrer.name'] = 'Your name is required';
    }

    if (!formData.referrer.phone.trim()) {
      newErrors['referrer.phone'] = 'Your phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.referrer.phone.replace(/\D/g, ''))) {
      newErrors['referrer.phone'] = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!formData.referrer.email.trim()) {
      newErrors['referrer.email'] = 'Your email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.referrer.email)) {
      newErrors['referrer.email'] = 'Enter a valid email address';
    }

    if (!formData.referrer.relationship) {
      newErrors['referrer.relationship'] = 'Please select your relationship to the owner';
    }

    if (!formData.property.owner_name.trim()) {
      newErrors['property.owner_name'] = 'Property owner name is required';
    }

    if (!formData.property.owner_phone.trim()) {
      newErrors['property.owner_phone'] = 'Owner phone number is required';
    } else if (!/^[6-9]\d{9}$/.test(formData.property.owner_phone.replace(/\D/g, ''))) {
      newErrors['property.owner_phone'] = 'Enter a valid 10-digit Indian mobile number';
    }

    if (!formData.property.address.trim()) {
      newErrors['property.address'] = 'Property address is required';
    }

    if (!formData.property.property_type) {
      newErrors['property.property_type'] = 'Please select property type';
    }

    if (!formData.property.intent) {
      newErrors['property.intent'] = 'Please select intent (Rent/Sale)';
    }

    if (!formData.consent) {
      newErrors['consent'] = 'You must confirm you have consent from the property owner';
    }

    if (!formData.terms_accepted) {
      newErrors['terms_accepted'] = 'You must accept the terms and conditions';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toastError('Please fix the errors in the form');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus(null);

    try {
      // TODO: Connect to backend /referrals/ endpoint when available
      // For now simulate a successful submission
      await new Promise((resolve) => setTimeout(resolve, 800));
      setSubmitStatus({
        type: 'success',
        message: 'Thank you! Your referral has been received. Our team will contact you shortly.',
        referralId: null,
      });
      toastSuccess('Referral submitted successfully!');
      setFormData(INITIAL_FORM_STATE);
    } catch (error) {
      const errorMessage = 'Failed to submit referral. Please try again.';
      setSubmitStatus({ type: 'error', message: errorMessage });
      toastError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus?.type === 'success') {
    return (
      <div className="referral-success">
        <div className="referral-success__icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h3 className="referral-success__title">Referral Submitted!</h3>
        <p className="referral-success__message">{submitStatus.message}</p>
        {submitStatus.referralId && (
          <p className="referral-success__id">
            Reference ID: <strong>{submitStatus.referralId}</strong>
          </p>
        )}
        <button
          type="button"
          className="btn btn-main"
          onClick={() => setSubmitStatus(null)}
        >
          Submit Another Referral
        </button>
      </div>
    );
  }

  return (
    <form className="referral-form" onSubmit={handleSubmit}>
      <div className="referral-form__section">
        <h3 className="referral-form__section-title">
          <i className="fas fa-user"></i>
          Your Details
        </h3>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="referrer_name" className="form-label">
                Your Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="referrer_name"
                className={`form-control ${errors['referrer.name'] ? 'is-invalid' : ''}`}
                placeholder="Enter your full name"
                value={formData.referrer.name}
                onChange={(e) => handleInputChange('referrer', 'name', e.target.value)}
              />
              {errors['referrer.name'] && (
                <div className="invalid-feedback">{errors['referrer.name']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="referrer_phone" className="form-label">
                Your Mobile Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                id="referrer_phone"
                className={`form-control ${errors['referrer.phone'] ? 'is-invalid' : ''}`}
                placeholder="10-digit mobile number"
                value={formData.referrer.phone}
                onChange={(e) => handleInputChange('referrer', 'phone', e.target.value)}
                maxLength="10"
              />
              {errors['referrer.phone'] && (
                <div className="invalid-feedback">{errors['referrer.phone']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="referrer_email" className="form-label">
                Your Email <span className="text-danger">*</span>
              </label>
              <input
                type="email"
                id="referrer_email"
                className={`form-control ${errors['referrer.email'] ? 'is-invalid' : ''}`}
                placeholder="your.email@example.com"
                value={formData.referrer.email}
                onChange={(e) => handleInputChange('referrer', 'email', e.target.value)}
              />
              {errors['referrer.email'] && (
                <div className="invalid-feedback">{errors['referrer.email']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="relationship" className="form-label">
                Relationship to Property Owner <span className="text-danger">*</span>
              </label>
              <select
                id="relationship"
                className={`form-select ${errors['referrer.relationship'] ? 'is-invalid' : ''}`}
                value={formData.referrer.relationship}
                onChange={(e) => handleInputChange('referrer', 'relationship', e.target.value)}
              >
                <option value="">Select relationship</option>
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors['referrer.relationship'] && (
                <div className="invalid-feedback">{errors['referrer.relationship']}</div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="referral-form__section">
        <h3 className="referral-form__section-title">
          <i className="fas fa-home"></i>
          Property Details
        </h3>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="owner_name" className="form-label">
                Property Owner Name <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                id="owner_name"
                className={`form-control ${errors['property.owner_name'] ? 'is-invalid' : ''}`}
                placeholder="Owner's full name"
                value={formData.property.owner_name}
                onChange={(e) => handleInputChange('property', 'owner_name', e.target.value)}
              />
              {errors['property.owner_name'] && (
                <div className="invalid-feedback">{errors['property.owner_name']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="owner_phone" className="form-label">
                Owner Mobile Number <span className="text-danger">*</span>
              </label>
              <input
                type="tel"
                id="owner_phone"
                className={`form-control ${errors['property.owner_phone'] ? 'is-invalid' : ''}`}
                placeholder="10-digit mobile number"
                value={formData.property.owner_phone}
                onChange={(e) => handleInputChange('property', 'owner_phone', e.target.value)}
                maxLength="10"
              />
              {errors['property.owner_phone'] && (
                <div className="invalid-feedback">{errors['property.owner_phone']}</div>
              )}
            </div>
          </div>

          <div className="col-12">
            <div className="form-group">
              <label htmlFor="address" className="form-label">
                Complete Property Address <span className="text-danger">*</span>
              </label>
              <textarea
                id="address"
                className={`form-control ${errors['property.address'] ? 'is-invalid' : ''}`}
                placeholder="House/Flat No., Building Name, Street, Sector/Locality, City"
                rows="3"
                value={formData.property.address}
                onChange={(e) => handleInputChange('property', 'address', e.target.value)}
              ></textarea>
              {errors['property.address'] && (
                <div className="invalid-feedback">{errors['property.address']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="property_type" className="form-label">
                Property Type <span className="text-danger">*</span>
              </label>
              <select
                id="property_type"
                className={`form-select ${errors['property.property_type'] ? 'is-invalid' : ''}`}
                value={formData.property.property_type}
                onChange={(e) => handleInputChange('property', 'property_type', e.target.value)}
              >
                <option value="">Select property type</option>
                {PROPERTY_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {t(option.labelKey)}
                  </option>
                ))}
              </select>
              {errors['property.property_type'] && (
                <div className="invalid-feedback">{errors['property.property_type']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="intent" className="form-label">
                Intent <span className="text-danger">*</span>
              </label>
              <select
                id="intent"
                className={`form-select ${errors['property.intent'] ? 'is-invalid' : ''}`}
                value={formData.property.intent}
                onChange={(e) => handleInputChange('property', 'intent', e.target.value)}
              >
                <option value="">Select intent</option>
                {INTENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              {errors['property.intent'] && (
                <div className="invalid-feedback">{errors['property.intent']}</div>
              )}
            </div>
          </div>

          <div className="col-md-6">
            <div className="form-group">
              <label htmlFor="expected_price" className="form-label">
                Expected Price/Rent (Optional)
              </label>
              <div className="input-group">
                <span className="input-group-text">₹</span>
                <input
                  type="number"
                  id="expected_price"
                  className="form-control"
                  placeholder="e.g., 50000"
                  value={formData.property.expected_price}
                  onChange={(e) => handleInputChange('property', 'expected_price', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="col-12">
            <div className="form-group">
              <label htmlFor="additional_notes" className="form-label">
                Additional Notes (Optional)
              </label>
              <textarea
                id="additional_notes"
                className="form-control"
                placeholder="Any additional details about the property (BHK, amenities, etc.)"
                rows="2"
                value={formData.property.additional_notes}
                onChange={(e) => handleInputChange('property', 'additional_notes', e.target.value)}
              ></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="referral-form__consent">
        <div className="form-check">
          <input
            type="checkbox"
            id="consent"
            className={`form-check-input ${errors['consent'] ? 'is-invalid' : ''}`}
            checked={formData.consent}
            onChange={(e) => handleCheckboxChange('consent', e.target.checked)}
          />
          <label htmlFor="consent" className="form-check-label">
            I confirm that I have obtained consent from the property owner to share their details with 360Ghar for the referral program. <span className="text-danger">*</span>
          </label>
          {errors['consent'] && (
            <div className="invalid-feedback">{errors['consent']}</div>
          )}
        </div>

        <div className="form-check">
          <input
            type="checkbox"
            id="terms_accepted"
            className={`form-check-input ${errors['terms_accepted'] ? 'is-invalid' : ''}`}
            checked={formData.terms_accepted}
            onChange={(e) => handleCheckboxChange('terms_accepted', e.target.checked)}
          />
          <label htmlFor="terms_accepted" className="form-check-label">
            I agree to the <a href="#terms-and-conditions">Terms & Conditions</a> of the 360Ghar Referral Program. <span className="text-danger">*</span>
          </label>
          {errors['terms_accepted'] && (
            <div className="invalid-feedback">{errors['terms_accepted']}</div>
          )}
        </div>
      </div>

      {submitStatus?.type === 'error' && (
        <div className="alert alert-danger">
          <i className="fas fa-exclamation-circle me-2"></i>
          {submitStatus.message}
        </div>
      )}

      <div className="referral-form__submit">
        <button
          type="submit"
          className="btn btn-main btn-lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status"></span>
              Submitting...
            </>
          ) : (
            <>
              <i className="fas fa-paper-plane me-2"></i>
              Submit Referral
            </>
          )}
        </button>
      </div>
    </form>
  );
};

export default ReferralForm;
