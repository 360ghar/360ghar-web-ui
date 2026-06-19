import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { generateToolSchema } from '../../seo/toolSchemas';
import { toolSchemas } from '../../seo/toolSchemas';
import { dataHubService } from '../../services/dataHubService';

const VERIFY_OWNERSHIP_HOW_TO_STEPS = [
  { name: 'Select district and tehsil', text: 'Choose the district and tehsil where the property is located from the dropdown.' },
  { name: 'Enter village name and khasra number', text: 'Type the village name and the Khasra number identifying the specific land parcel.' },
  { name: 'Complete captcha verification', text: 'Load and solve the CAPTCHA to verify you are human, as required by the Jamabandi portal.' },
  { name: 'View property ownership records', text: 'Review ownership details, mutation status, encumbrance, and area from official Haryana land records.' },
];

// AUDIT FIX (3.14): expanded the hardcoded tehsil list to cover more of
// Haryana's districts so the tool is useful beyond a small Gurugram subset.
const TEHSIL_OPTIONS = [
  // Gurugram district
  'Gurgaon', 'Sohna', 'Pataudi', 'Farukhnagar', 'Manesar',
  // Faridabad district
  'Faridabad', 'Ballabgarh', 'Palwal',
  // Sonipat district
  'Sonipat', 'Ganaur', 'Gohana',
  // Rohtak district
  'Rohtak', 'Maham',
  // Panipat district
  'Panipat', 'Samalkha',
  // Karnal district
  'Karnal', 'Gharaunda', 'Assandh',
  // Rewari district
  'Rewari', 'Bawal', 'Kosli',
  // Hisar district
  'Hisar', 'Hansi', 'Narnaund',
  // Ambala district
  'Ambala', 'Ambala Cantt', 'Naraingarh',
  // Kurukshetra district
  'Kurukshetra', 'Pehowa', 'Shahbad',
  // Jhajjar district
  'Jhajjar', 'Bahadurgarh',
  // Mewat district
  'Nuh', 'Ferozepur Jhirka', 'Punahana',
  // Yamunanagar district
  'Yamunanagar', 'Jagadhri', 'Chhachhrauli',
  // Other
  'Wazirabad',
];

const VerifyOwnership = () => {
  const { t } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const [tehsil, setTehsil] = useState('');
  const [village, setVillage] = useState('');
  const [khasraNumber, setKhasraNumber] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const captchaBlobRef = useRef(null);

  // Clean up blob URL on unmount
  useEffect(() => {
    return () => {
      if (captchaBlobRef.current) {
        URL.revokeObjectURL(captchaBlobRef.current);
      }
    };
  }, []);

  const loadCaptcha = async () => {
    setCaptchaLoading(true);
    try {
      // Revoke previous blob URL if any
      if (captchaBlobRef.current) {
        URL.revokeObjectURL(captchaBlobRef.current);
        captchaBlobRef.current = null;
      }
      const blob = await dataHubService.getJamabandiCaptcha();
      const url = URL.createObjectURL(blob);
      captchaBlobRef.current = url;
      setCaptchaUrl(url);
      setCaptchaToken('');
    } catch {
      setError({ type: 'captcha', message: t('verifyOwnership.captchaFailed') });
    } finally {
      setCaptchaLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!tehsil || !village || !khasraNumber || !captchaToken) return;
    setResult(null);
    try {
      const data = await dataHubService.lookupJamabandi({
        tehsil,
        village,
        khasra_number: khasraNumber,
        captcha_token: captchaToken,
      });
      setResult(data);
    } catch (err) {
      const status = err?.response?.status;
      if (status === 422 || (err?.message || '').toLowerCase().includes('captcha')) {
        setError({ type: 'captcha', message: t('verifyOwnership.captchaIncorrect') });
        // Reload captcha automatically
        loadCaptcha();
      } else if (status === 404) {
        setError({ type: 'notfound', message: t('verifyOwnership.notFound') });
      } else {
        setError({ type: 'generic', message: t('verifyOwnership.genericError') });
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <SEO
        title={tSeo('verifyOwnership.title')}
        description={tSeo('verifyOwnership.description')}
        keywords="verify property ownership Gurugram, Jamabandi Haryana land records, Khasra number lookup, mutation status Haryana, property ownership check Gurgaon"
        canonical="/verify-ownership"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Verify Ownership', url: 'https://360ghar.com/verify-ownership' },
          ]),
          generateToolSchema(
            toolSchemas.verifyOwnership.name,
            toolSchemas.verifyOwnership.description,
            toolSchemas.verifyOwnership.keywords,
            toolSchemas.verifyOwnership.category,
          ),
          generateHowToStructuredData({
            name: 'How to Verify Property Ownership',
            description: 'Look up official Haryana Jamabandi land records by tehsil, village, and khasra number to verify property ownership.',
            steps: VERIFY_OWNERSHIP_HOW_TO_STEPS,
          }),
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row">
              <div className="col-12">
                {/* AUDIT FIX (imp 3.19): consistent breadcrumb */}
                <nav aria-label="breadcrumb" className="mb-20">
                  <ol className="breadcrumb">
                    <li className="breadcrumb-item"><I18nLink to="/">Home</I18nLink></li>
                    <li className="breadcrumb-item"><I18nLink to="/verify-ownership">Data Hub</I18nLink></li>
                    <li className="breadcrumb-item active">Verify Ownership</li>
                  </ol>
                </nav>
                <h1 className="fs-28 fw-600 mb-10">{t('verifyOwnership.title')}</h1>
                <p className="mb-10 color-text-3">
                  {t('verifyOwnership.description')}
                </p>
                <div className="alert alert-warning d-flex align-items-start gap-10 mb-30" role="alert">
                  <i className="fas fa-shield-alt mt-1"></i>
                  <span>
                    {t('verifyOwnership.important')}
                  </span>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Lookup Form */}
              <div className="col-lg-6 mb-40">
                <div className="bg-white p-4 rounded-3 shadow-sm">
                  <h2 className="fs-20 fw-600 mb-20">{t('verifyOwnership.landRecordLookup')}</h2>
                  <form onSubmit={handleSubmit}>

                    {/* Tehsil */}
                    <div className="mb-15">
                      <label className="form-label fw-500">{t('verifyOwnership.tehsil')} <span className="color-danger">*</span></label>
                      <select
                        className="form-select"
                        value={tehsil}
                        onChange={(e) => { setTehsil(e.target.value); setVillage(''); setKhasraNumber(''); setResult(null); setError(null); }}
                        required
                      >
                        <option value="">{t('verifyOwnership.selectTehsil')}</option>
                        {TEHSIL_OPTIONS.map((th) => (
                          <option key={th} value={th}>{th}</option>
                        ))}
                      </select>
                    </div>

                    {/* Village */}
                    <div className="mb-15">
                      <label className="form-label fw-500">{t('verifyOwnership.village')} <span className="color-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('verifyOwnership.enterVillage')}
                        value={village}
                        onChange={(e) => { setVillage(e.target.value); setKhasraNumber(''); setResult(null); setError(null); }}
                        disabled={!tehsil}
                        required
                      />
                      {!tehsil && (
                        <small className="text-muted">{t('verifyOwnership.selectTehsilFirst')}</small>
                      )}
                    </div>

                    {/* Khasra Number */}
                    <div className="mb-20">
                      <label className="form-label fw-500">{t('verifyOwnership.khasraNumber')} <span className="color-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('verifyOwnership.khasraPlaceholder')}
                        value={khasraNumber}
                        onChange={(e) => { setKhasraNumber(e.target.value); setResult(null); setError(null); }}
                        disabled={!village}
                        required
                      />
                      {!village && (
                        <small className="text-muted">{t('verifyOwnership.enterVillageFirst')}</small>
                      )}
                    </div>

                    {/* CAPTCHA */}
                    <div className="mb-20">
                      <label className="form-label fw-500">{t('verifyOwnership.captchaVerification')} <span className="color-danger">*</span></label>
                      <div className="d-flex align-items-center gap-10 mb-10">
                        {captchaUrl ? (
                          <img
                            src={captchaUrl}
                            alt="CAPTCHA"
                            style={{ height: '52px', border: '1px solid #dee2e6', borderRadius: '4px', background: '#f8f9fa' }}
                          />
                        ) : (
                          <div
                            style={{ height: '52px', width: '160px', border: '1px dashed #dee2e6', borderRadius: '4px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                            className="fs-13 color-text-3"
                          >
                            {t('verifyOwnership.noCaptcha')}
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={loadCaptcha}
                          disabled={captchaLoading}
                        >
                          {captchaLoading ? (
                            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>{t('verifyOwnership.lookingUp')}</>
                          ) : captchaUrl ? (
                            <><i className="fas fa-sync-alt me-1"></i>{t('verifyOwnership.refresh')}</>
                          ) : (
                            <><i className="fas fa-image me-1"></i>{t('verifyOwnership.loadCaptcha')}</>
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder={t('verifyOwnership.enterCaptcha')}
                        value={captchaToken}
                        onChange={(e) => setCaptchaToken(e.target.value)}
                        disabled={!captchaUrl}
                        required
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                      {!captchaUrl && (
                        <small className="text-muted">{t('verifyOwnership.clickLoadCaptcha')}</small>
                      )}
                    </div>

                    {/* Error messages */}
                    {error && (
                      <div className={`alert ${error.type === 'notfound' ? 'alert-info' : 'alert-danger'} mb-15`} role="alert">
                        <i className={`fas ${error.type === 'notfound' ? 'fa-search' : 'fa-exclamation-circle'} me-2`}></i>
                        {error.message}
                        {error.type === 'captcha' && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-danger ms-2"
                            onClick={loadCaptcha}
                            disabled={captchaLoading}
                          >
                            {t('verifyOwnership.refreshCaptcha')}
                          </button>
                        )}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="btn btn-main w-100"
                      disabled={loading || !tehsil || !village || !khasraNumber || !captchaToken}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>{t('verifyOwnership.lookingUp')}</>
                      ) : (
                        <><i className="fas fa-search me-2"></i>{t('verifyOwnership.lookupRecord')}</>
                      )}
                    </button>
                  </form>
                </div>
              </div>

              {/* Result Card */}
              <div className="col-lg-6 mb-40">
                {result ? (
                  <div className="bg-white p-4 rounded-3 shadow-sm">
                    <div className="d-flex align-items-center justify-content-between mb-20">
                      <h2 className="fs-20 fw-600 mb-0">{t('verifyOwnership.ownershipRecord')}</h2>
                      <span className="badge bg-success">{t('verifyOwnership.found')}</span>
                    </div>

                    <table className="table table-sm table-borderless mb-20">
                      <tbody>
                        <tr>
                          <th className="color-text-3 fw-500 w-40">{t('verifyOwnership.owners')}</th>
                          <td className="fw-600">
                            {Array.isArray(result.owners) && result.owners.length > 0
                              ? result.owners.join(', ')
                              : result.owner || '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">{t('verifyOwnership.area')}</th>
                          <td>
                            {result.area ? `${result.area}${result.area_unit ? ' ' + result.area_unit : ''}` : '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">{t('verifyOwnership.mutationStatus')}</th>
                          <td>
                            {result.mutation_status
                              ? result.mutation_status.charAt(0).toUpperCase() + result.mutation_status.slice(1).replace(/_/g, ' ')
                              : '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">{t('verifyOwnership.encumbrance')}</th>
                          <td>
                            {result.encumbrance !== undefined && result.encumbrance !== null
                              ? (result.encumbrance ? (
                                <span className="badge bg-danger">{t('verifyOwnership.encumbered')}</span>
                              ) : (
                                <span className="badge bg-success">{t('verifyOwnership.clear')}</span>
                              ))
                              : '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">{t('verifyOwnership.lastUpdated')}</th>
                          <td>{formatDate(result.last_updated || result.updated_at)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="alert alert-light fs-13 mb-0" role="note">
                      <i className="fas fa-info-circle me-2 color-text-3"></i>
                      {t('verifyOwnership.dataSourced')}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <i className="fas fa-file-alt fs-40 color-text-3 mb-15"></i>
                    <p className="color-text-3 mb-0">{t('verifyOwnership.fillForm')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Info + CTA */}
            <div className="row mt-10">
              <div className="col-lg-8">
                <div className="bg-white p-4 rounded-3 shadow-sm">
                  <h3 className="fs-18 fw-600 mb-15">
                    <i className="fas fa-info-circle text-main me-2"></i>
                    {t('verifyOwnership.aboutJamabandi.title')}
                  </h3>
                  <p className="color-text-3 mb-10">
                    {t('verifyOwnership.aboutJamabandi.description')}
                  </p>
                  <ul className="color-text-3 mb-0" style={{ paddingLeft: '20px' }}>
                    {t('verifyOwnership.aboutJamabandi.tips', { returnObjects: true }).map((tip, idx) => (
                      <li key={idx}>{tip}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="col-lg-4 mt-20 mt-lg-0">
                <div className="bg-main text-white p-4 rounded-3 h-100 d-flex flex-column justify-content-center">
                  <h4 className="fs-18 fw-600 mb-10">{t('verifyOwnership.plotsCta.title')}</h4>
                  <p className="mb-15" style={{ opacity: 0.9 }}>
                    {t('verifyOwnership.plotsCta.description')}
                  </p>
                  <I18nLink to="/properties" className="btn btn-white btn-main align-self-start">
                    <i className="fas fa-home me-2"></i>
                    {t('verifyOwnership.plotsCta.browseProperties')}
                  </I18nLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default VerifyOwnership;
