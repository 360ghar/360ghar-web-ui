import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
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

const TEHSIL_OPTIONS = [
  'Gurgaon',
  'Faridabad',
  'Sohna',
  'Pataudi',
  'Badshahpur',
  'Wazirabad',
];

const VerifyOwnership = () => {
  const [tehsil, setTehsil] = useState('');
  const [village, setVillage] = useState('');
  const [khasraNumber, setKhasraNumber] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  const [captchaUrl, setCaptchaUrl] = useState(null);
  const [captchaLoading, setCaptchaLoading] = useState(false);
  const [loading, setLoading] = useState(true);
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
      setError({ type: 'captcha', message: 'Failed to load CAPTCHA. Please try again.' });
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
        setError({ type: 'captcha', message: 'CAPTCHA was incorrect. Please refresh and try again.' });
        // Reload captcha automatically
        loadCaptcha();
      } else if (status === 404) {
        setError({ type: 'notfound', message: 'No land record found for the given Tehsil, Village, and Khasra Number.' });
      } else {
        setError({ type: 'generic', message: 'Unable to fetch land records at this time. Please try again later.' });
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
        title="Verify Property Ownership Gurgaon | Jamabandi Haryana Land Records | 360Ghar"
        description="Verify property ownership using official Haryana land records (Jamabandi). Look up Khasra numbers, owner names, mutation status, and encumbrance details for plots in Gurugram."
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
                <h1 className="fs-28 fw-600 mb-10">Verify Property Ownership</h1>
                <p className="mb-10 color-text-3">
                  Verify property ownership using Haryana land records (Jamabandi). Enter the Tehsil, Village, and Khasra Number to look up the official record.
                </p>
                <div className="alert alert-warning d-flex align-items-start gap-10 mb-30" role="alert">
                  <i className="fas fa-shield-alt mt-1"></i>
                  <span>
                    <strong>Important:</strong> You must solve the CAPTCHA yourself. We do not bypass security mechanisms of the Haryana Jamabandi portal.
                  </span>
                </div>
              </div>
            </div>

            <div className="row">
              {/* Lookup Form */}
              <div className="col-lg-6 mb-40">
                <div className="bg-white p-4 rounded-3 shadow-sm">
                  <h2 className="fs-20 fw-600 mb-20">Land Record Lookup</h2>
                  <form onSubmit={handleSubmit}>

                    {/* Tehsil */}
                    <div className="mb-15">
                      <label className="form-label fw-500">Tehsil <span className="color-danger">*</span></label>
                      <select
                        className="form-select"
                        value={tehsil}
                        onChange={(e) => { setTehsil(e.target.value); setVillage(''); setKhasraNumber(''); setResult(null); setError(null); }}
                        required
                      >
                        <option value="">Select Tehsil</option>
                        {TEHSIL_OPTIONS.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>

                    {/* Village */}
                    <div className="mb-15">
                      <label className="form-label fw-500">Village <span className="color-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter village name"
                        value={village}
                        onChange={(e) => { setVillage(e.target.value); setKhasraNumber(''); setResult(null); setError(null); }}
                        disabled={!tehsil}
                        required
                      />
                      {!tehsil && (
                        <small className="text-muted">Select a Tehsil first</small>
                      )}
                    </div>

                    {/* Khasra Number */}
                    <div className="mb-20">
                      <label className="form-label fw-500">Khasra Number <span className="color-danger">*</span></label>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="e.g. 123/4"
                        value={khasraNumber}
                        onChange={(e) => { setKhasraNumber(e.target.value); setResult(null); setError(null); }}
                        disabled={!village}
                        required
                      />
                      {!village && (
                        <small className="text-muted">Enter a Village first</small>
                      )}
                    </div>

                    {/* CAPTCHA */}
                    <div className="mb-20">
                      <label className="form-label fw-500">CAPTCHA Verification <span className="color-danger">*</span></label>
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
                            No CAPTCHA loaded
                          </div>
                        )}
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary"
                          onClick={loadCaptcha}
                          disabled={captchaLoading}
                        >
                          {captchaLoading ? (
                            <><span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>Loading…</>
                          ) : captchaUrl ? (
                            <><i className="fas fa-sync-alt me-1"></i>Refresh</>
                          ) : (
                            <><i className="fas fa-image me-1"></i>Load CAPTCHA</>
                          )}
                        </button>
                      </div>
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter CAPTCHA text"
                        value={captchaToken}
                        onChange={(e) => setCaptchaToken(e.target.value)}
                        disabled={!captchaUrl}
                        required
                        autoComplete="off"
                        autoCorrect="off"
                        autoCapitalize="off"
                      />
                      {!captchaUrl && (
                        <small className="text-muted">Click &quot;Load CAPTCHA&quot; to get a CAPTCHA image</small>
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
                            Refresh CAPTCHA
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
                        <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Looking up…</>
                      ) : (
                        <><i className="fas fa-search me-2"></i>Lookup Land Record</>
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
                      <h2 className="fs-20 fw-600 mb-0">Ownership Record</h2>
                      <span className="badge bg-success">Found</span>
                    </div>

                    <table className="table table-sm table-borderless mb-20">
                      <tbody>
                        <tr>
                          <th className="color-text-3 fw-500 w-40">Owner(s)</th>
                          <td className="fw-600">
                            {Array.isArray(result.owners) && result.owners.length > 0
                              ? result.owners.join(', ')
                              : result.owner || '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">Area</th>
                          <td>
                            {result.area ? `${result.area}${result.area_unit ? ' ' + result.area_unit : ''}` : '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">Mutation Status</th>
                          <td>
                            {result.mutation_status
                              ? result.mutation_status.charAt(0).toUpperCase() + result.mutation_status.slice(1).replace(/_/g, ' ')
                              : '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">Encumbrance</th>
                          <td>
                            {result.encumbrance !== undefined && result.encumbrance !== null
                              ? (result.encumbrance ? (
                                <span className="badge bg-danger">Encumbered</span>
                              ) : (
                                <span className="badge bg-success">Clear</span>
                              ))
                              : '—'}
                          </td>
                        </tr>
                        <tr>
                          <th className="color-text-3 fw-500">Last Updated</th>
                          <td>{formatDate(result.last_updated || result.updated_at)}</td>
                        </tr>
                      </tbody>
                    </table>

                    <div className="alert alert-light fs-13 mb-0" role="note">
                      <i className="fas fa-info-circle me-2 color-text-3"></i>
                      Data sourced from the <strong>Haryana Jamabandi portal</strong>. Always verify with official records before making property decisions.
                    </div>
                  </div>
                ) : (
                  <div className="bg-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column justify-content-center align-items-center text-center" style={{ minHeight: '300px' }}>
                    <i className="fas fa-file-alt fs-40 color-text-3 mb-15"></i>
                    <p className="color-text-3 mb-0">Fill in the form and submit to view land ownership details.</p>
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
                    About Jamabandi Land Records
                  </h3>
                  <p className="color-text-3 mb-10">
                    Jamabandi is the official land record maintained by the Revenue Department of Haryana. It contains details of ownership, cultivation rights, and encumbrances on agricultural and non-agricultural land parcels identified by Khasra numbers.
                  </p>
                  <ul className="color-text-3 mb-0" style={{ paddingLeft: '20px' }}>
                    <li>Verify ownership before buying a plot or agricultural land</li>
                    <li>Check for any pending litigations or encumbrances</li>
                    <li>Confirm mutation (intkal) has been completed after purchase</li>
                    <li>Official data is periodically updated by Patwaris</li>
                  </ul>
                </div>
              </div>
              <div className="col-lg-4 mt-20 mt-lg-0">
                <div className="bg-main text-white p-4 rounded-3 h-100 d-flex flex-column justify-content-center">
                  <h4 className="fs-18 fw-600 mb-10">Looking for plots in Gurugram?</h4>
                  <p className="mb-15" style={{ opacity: 0.9 }}>
                    Browse verified residential plots and properties listed on 360Ghar.
                  </p>
                  <Link to="/properties" className="btn btn-white btn-main align-self-start">
                    <i className="fas fa-home me-2"></i>
                    Browse Properties
                  </Link>
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
