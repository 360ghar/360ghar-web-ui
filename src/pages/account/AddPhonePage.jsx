import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { authService } from '../../services/authService';
import { AUTH_METHODS } from '../../services/lastAuthMethod';
import { useAuthStore } from '../../store';
import useWebOtp from '../../hooks/useWebOtp';
import { useResendTimer } from '../../hooks/useResendTimer';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';

function sanitizeNext(next) {
  if (!next || typeof next !== 'string') return '/';
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

const AddPhonePage = () => {
  const { t } = useTranslation(['account', 'forms']);
  const navigate = useI18nNavigate();
  const [searchParams] = useSearchParams();
  const next = sanitizeNext(searchParams.get('next'));

  const syncAfterExternalAuth = useAuthStore((s) => s.syncAfterExternalAuth);

  const [step, setStep] = useState('phone'); // 'phone' | 'otp'
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [submitting, setSubmitting] = useState(false);
  // AUDIT FIX (1.8): dedicated syncing state so the user sees a clear message
  // while syncAfterExternalAuth() runs (it flips isInitializing on the auth
  // store). Showing our own spinner prevents a confusing flash where route
  // guards or init-driven loaders might briefly redirect or render blank.
  const [syncing, setSyncing] = useState(false);
  const [phoneError, setPhoneError] = useState('');

  // Standard 30s resend cooldown for the OTP step.
  const resend = useResendTimer();

  // Android Chrome SMS autofill for the OTP step.
  useWebOtp((code) => setOtp(code.replace(/\D/g, '').slice(0, 6)), step === 'otp');

  const goNext = () => navigate(next);

  const handleSendCode = async (event) => {
    event.preventDefault();
    const digits = phone.replace(/\D/g, '');
    if (!/^[6-9]\d{9}$/.test(digits)) {
      setPhoneError(t('forms:phone.invalid'));
      return;
    }
    setPhoneError('');
    setSubmitting(true);
    try {
      await authService.startAddPhone(`+91${digits}`);
      setStep('otp');
      resend.start();
      toast.info(t('account:addPhone.codeSent'));
    } catch (error) {
      toast.error(error.message || t('account:addPhone.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (!resend.canResend) return;
    const digits = phone.replace(/\D/g, '');
    setSubmitting(true);
    try {
      await authService.startAddPhone(`+91${digits}`);
      resend.start();
      toast.info(t('account:addPhone.codeSent'));
    } catch (error) {
      toast.error(error.message || t('account:addPhone.sendFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerify = async (event) => {
    event.preventDefault();
    const code = otp.replace(/\D/g, '');
    if (code.length !== 6) {
      toast.error(t('forms:otp.invalidLength'));
      return;
    }
    setSubmitting(true);
    try {
      await authService.verifyAddPhone(`+91${phone.replace(/\D/g, '')}`, code);
      // Keep last-used method as Google; just re-sync the profile.
      authService.afterAuthSuccess(AUTH_METHODS.GOOGLE);
      setSyncing(true);
      await syncAfterExternalAuth();
      toast.success(t('account:addPhone.successMessage'), { theme: 'colored' });
      goNext();
    } catch (error) {
      toast.error(error.message || t('account:addPhone.verifyFailed'));
    } finally {
      setSubmitting(false);
      setSyncing(false);
    }
  };

  return (
    <>
      <SEO
        title={t('account:addPhone.title')}
        description={t('account:addPhone.description')}
        canonical="/add-phone"
        noindex
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText={t('account:common.postProperty')}
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="login-section pt-120 pb-120">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-xl-6 col-lg-8">
                <div style={{
                  background: '#fff',
                  border: '1px solid var(--border-color-light)',
                  borderRadius: '18px',
                  padding: '40px',
                  boxShadow: '0 12px 24px rgba(16, 24, 40, 0.04)',
                }}>
                  <div className="text-center mb-4">
                    <h3 className="mb-2">{t('account:addPhone.heading')}</h3>
                    <p className="text-muted">{t('account:addPhone.subheading')}</p>
                  </div>

                  {step === 'phone' ? (
                    <form onSubmit={handleSendCode}>
                      <div className="col-12 mb-3">
                        <label htmlFor="add-phone" className="form-label">{t('forms:phone.label')}</label>
                        <input
                          type="tel"
                          inputMode="tel"
                          autoComplete="tel"
                          id="add-phone"
                          name="phone"
                          maxLength={10}
                          placeholder={t('forms:phone.placeholder')}
                          value={phone}
                          onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                          className={`common-input ${phoneError ? 'is-invalid' : ''}`}
                          disabled={submitting}
                        />
                        {phoneError && <span className="text-danger">{phoneError}</span>}
                      </div>
                      <div className="col-12 mt-3">
                        <button type="submit" className="btn btn-main w-100" disabled={submitting}>
                          {submitting ? t('account:addPhone.sending') : t('account:addPhone.sendCode')}
                        </button>
                      </div>
                    </form>
                  ) : (
                    <form onSubmit={handleVerify}>
                      <div className="col-12 mb-2">
                        <label htmlFor="add-phone-otp" className="form-label">{t('forms:otp.label')}</label>
                        <input
                          type="text"
                          inputMode="numeric"
                          autoComplete="one-time-code"
                          maxLength={6}
                          id="add-phone-otp"
                          name="otp"
                          placeholder={t('forms:otp.placeholder')}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="common-input"
                          disabled={submitting}
                        />
                        <small className="text-muted d-block mt-1">{t('account:addPhone.codeSent')}</small>
                      </div>
                      <div className="col-12 mt-3">
                        <button type="submit" className="btn btn-main w-100" disabled={submitting}>
                          {submitting ? t('account:addPhone.verifying') : t('account:addPhone.verify')}
                        </button>
                      </div>
                      <div className="col-12 mt-2 text-center">
                        <button
                          type="button"
                          className="btn btn-link text-main"
                          onClick={handleResend}
                          disabled={submitting || !resend.canResend}
                        >
                          {resend.canResend ? t('forms:otp.resend') : t('forms:otp.resendIn', { seconds: resend.secondsLeft })}
                        </button>
                      </div>
                      <div className="col-12 mt-1 text-center">
                        <button
                          type="button"
                          className="btn btn-link text-main"
                          onClick={() => { setStep('phone'); setOtp(''); resend.reset(); }}
                          disabled={submitting}
                        >
                          {t('account:addPhone.changeNumber')}
                        </button>
                      </div>
                    </form>
                  )}

                  <div className="col-12 mt-3 text-center">
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={goNext}
                      disabled={submitting || syncing}
                    >
                      {t('account:addPhone.skip')}
                    </button>
                    {/* AUDIT FIX (1.imp4): explain the consequences of skipping
                        the phone so the user can make an informed choice. */}
                    <small className="text-muted d-block mt-2">
                      {t('account:addPhone.skipConsequence')}
                    </small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* AUDIT FIX (1.8): full-screen syncing overlay while the auth store
            re-syncs the profile after phone verification. Prevents interaction
            and shows a clear status instead of a silent redirect/spinner. */}
        {syncing && (
          <div
            className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center"
            style={{ background: 'rgba(255,255,255,0.85)', zIndex: 1050 }}
            role="status"
            aria-live="polite"
          >
            <div className="text-center">
              <div className="spinner-border text-main mb-3" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="text-muted mb-0">{t('account:addPhone.syncing')}</p>
            </div>
          </div>
        )}

        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default AddPhonePage;
