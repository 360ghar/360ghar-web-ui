import { useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import FloorPlanUpload from '../../components/vastu/FloorPlanUpload';
import DirectionSelector from '../../components/vastu/DirectionSelector';
import VastuLoadingState from '../../components/vastu/VastuLoadingState';
import VastuReport from '../../components/vastu/VastuReport';
import { analyzeFloorPlan } from '../../services/vastuService';
import { I18nLink } from '../../i18n/I18nLink';
import './VastuChecker.scss';

const VastuChecker = () => {
    const { t } = useTranslation('tools');

    const VASTU_CHECKER_FAQS = [
        { question: t('vastu.faqs.q1.question'), answer: t('vastu.faqs.q1.answer') },
        { question: t('vastu.faqs.q2.question'), answer: t('vastu.faqs.q2.answer') },
        { question: t('vastu.faqs.q3.question'), answer: t('vastu.faqs.q3.answer') },
        { question: t('vastu.faqs.q4.question'), answer: t('vastu.faqs.q4.answer') },
        { question: t('vastu.faqs.q5.question'), answer: t('vastu.faqs.q5.answer') },
        { question: t('vastu.faqs.q6.question'), answer: t('vastu.faqs.q6.answer') },
        { question: t('vastu.faqs.q7.question'), answer: t('vastu.faqs.q7.answer') },
        { question: t('vastu.faqs.q8.question'), answer: t('vastu.faqs.q8.answer') },
        { question: t('vastu.faqs.q9.question'), answer: t('vastu.faqs.q9.answer') },
    ];

    const VASTU_CHECKER_HOW_TO_STEPS = [
        { name: t('vastu.howToSteps.step1.name'), text: t('vastu.howToSteps.step1.text') },
        { name: t('vastu.howToSteps.step2.name'), text: t('vastu.howToSteps.step2.text') },
        { name: t('vastu.howToSteps.step3.name'), text: t('vastu.howToSteps.step3.text') },
        { name: t('vastu.howToSteps.step4.name'), text: t('vastu.howToSteps.step4.text') },
    ];

    // Form state
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [northDirection, setNorthDirection] = useState('up');
    const [notes, setNotes] = useState('');

    // UI state
    const [appState, setAppState] = useState('input'); // input, loading, result, error
    const [faqOpenIndex, setFaqOpenIndex] = useState(0);
    const [loadingStep, setLoadingStep] = useState('analyzing');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState('general'); // general, timeout, network, validation

    // Result state
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleImageSelect = useCallback((file, preview) => {
        // CRITICAL FIX (audit 3.6): revoke the previous blob URL before
        // replacing it so we don't leak object URLs on every reselect or
        // after an error+retry cycle.
        setPreviewUrl((prev) => {
            if (prev && prev.startsWith('blob:')) {
                try { URL.revokeObjectURL(prev); } catch { /* noop */ }
            }
            return preview;
        });
        setSelectedFile(file);
    }, []);

    // CRITICAL FIX (audit 3.6): revoke any lingering blob URL on unmount.
    useEffect(() => {
        return () => {
            setPreviewUrl((prev) => {
                if (prev && prev.startsWith('blob:')) {
                    try { URL.revokeObjectURL(prev); } catch { /* noop */ }
                }
                return prev;
            });
        };
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setErrorMessage(t('vastu.errorNoFile'));
            setErrorType('validation');
            setAppState('error');
            return;
        }

        // UX FIX (audit 3.7): client-side file-size validation so users get
        // immediate feedback instead of a 413 from the server.
        const MAX_FILE_SIZE_MB = 5;
        if (selectedFile.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
            setErrorMessage(t('vastu.errorFileTooLarge', { mb: MAX_FILE_SIZE_MB }));
            setErrorType('validation');
            setAppState('error');
            return;
        }

        let stepTimer = null;

        try {
            setAppState('loading');
            setLoadingStep('analyzing');
            setErrorMessage('');

            // Simulate step transition after a few seconds
            stepTimer = setTimeout(() => setLoadingStep('generating'), 8000);

            const result = await analyzeFloorPlan(
                selectedFile,
                northDirection,
                notes
            );

            clearTimeout(stepTimer);

            setAnalysisResult(result);
            setAppState('result');

        } catch (error) {
            console.error('Vastu analysis error:', error);
            if (stepTimer) clearTimeout(stepTimer);

            // Determine error type and message
            let message = t('vastu.errorDefault');
            let type = 'general';

            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                type = 'timeout';
                message = t('vastu.errorTimeoutMsg');
            } else if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
                type = 'network';
                message = t('vastu.errorNetworkMsg');
            } else if (error.response?.status === 413) {
                type = 'validation';
                message = t('vastu.errorFileSize');
            } else if (error.response?.status === 415) {
                type = 'validation';
                message = t('vastu.errorFileFormat');
            } else if (error.response?.status === 422) {
                type = 'validation';
                message = error.response?.data?.detail || t('vastu.errorDefault');
            } else if (error.response?.status >= 500) {
                type = 'general';
                message = t('vastu.errorServerMsg');
            } else if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (error.message) {
                message = error.message;
            }

            setErrorMessage(message);
            setErrorType(type);
            setAppState('error');
        }
    }, [selectedFile, northDirection, notes, t]);

    const handleReset = useCallback(() => {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        setNorthDirection('up');
        setNotes('');
        setAnalysisResult(null);
        setAppState('input');
        setErrorMessage('');
        setErrorType('general');
    }, [
        previewUrl,
        setAnalysisResult,
        setAppState,
        setErrorMessage,
        setErrorType,
        setNorthDirection,
        setNotes,
        setPreviewUrl,
        setSelectedFile,
    ]);

    const handleRetry = useCallback(() => {
        setAppState('input');
        setErrorMessage('');
        setErrorType('general');
    }, []);

    return (
        <>
            <SEO
                title={t('vastu.title')}
                description={t('vastu.description')}
                keywords={t('vastu.keywords')}
                canonical="/vastu-checker"
                image={siteMetadata.defaultOgImage}
                type="website"
                 structuredData={[
                     generateToolSchema(toolSchemas.vastuChecker),
                     generateBreadcrumbStructuredData([
                         { name: 'Home', url: 'https://360ghar.com/' },
                         { name: 'Tools', url: 'https://360ghar.com/tools' },
                         { name: toolSchemas.vastuChecker.name, url: 'https://360ghar.com/vastu-checker' }
                     ]),
                     generateFaqStructuredData(VASTU_CHECKER_FAQS),
                     generateHowToStructuredData({
                         name: 'How to Check Vastu for Your Home',
                         description: 'Analyze your floor plan for Vastu compliance step by step',
                         steps: VASTU_CHECKER_HOW_TO_STEPS,
                     }),
                 ]}
            />

            <OffCanvas />
            <MobileMenu />

            <main className="body-bg">
                <Header />

                {/* Main Vastu Checker Section */}
                <section className="vastu-checker-section">
                    <div className="container">
                        {/* Hero Section - only show on input state */}
                        {appState === 'input' && (
                            <div className="section-heading text-center mb-6">
                                <h1 className="section-title">
                                    <span className="vastu-icon-wrapper">
                                        <i className="fas fa-compass text-main"></i>
                                    </span>
                                    {t('vastu.heroTitle')}
                                </h1>
                                <p className="section-desc">
                                    {t('vastu.heroDesc')}
                                </p>
                            </div>
                        )}

                        {/* Input Form */}
                        {appState === 'input' && (
                            <div className="vastu-form-wrapper">
                                <form onSubmit={handleSubmit} className="vastu-form">
                                    <div className="row g-4 g-lg-5">
                                        <div className="col-lg-6">
                                            <FloorPlanUpload
                                                onImageSelect={handleImageSelect}
                                                selectedFile={selectedFile}
                                                previewUrl={previewUrl}
                                            />
                                        </div>
                                        <div className="col-lg-6">
                                            <div className="vastu-options">
                                                <DirectionSelector
                                                    value={northDirection}
                                                    onChange={setNorthDirection}
                                                />

                                                <div className="notes-input mt-4">
                                                    <label className="form-label">
                                                        <i className="fas fa-sticky-note me-2"></i>
                                                        {t('vastu.additionalNotes')}
                                                        <span className="text-muted ms-2">{t('vastu.optional')}</span>
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={4}
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        placeholder={t('vastu.notesPlaceholder')}
                                                        maxLength={1000}
                                                    />
                                                    <small className="text-muted d-block text-end mt-1">
                                                        {t('vastu.charactersCount', { count: notes.length })}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="form-actions mt-6 text-center">
                                        <button
                                            type="submit"
                                            className="btn btn-main btn-lg px-5"
                                            disabled={!selectedFile}
                                        >
                                            <i className="fas fa-magic me-2"></i>
                                            {t('vastu.analyzeVastu')}
                                        </button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Loading State */}
                        {appState === 'loading' && (
                            <VastuLoadingState step={loadingStep} />
                        )}

                        {/* Error State */}
                        {appState === 'error' && (
                            <div className="error-container text-center py-5">
                                <div className="error-icon mb-4">
                                    {errorType === 'network' ? (
                                        <i className="fas fa-wifi fa-4x text-danger"></i>
                                    ) : errorType === 'timeout' ? (
                                        <i className="fas fa-clock fa-4x text-warning"></i>
                                    ) : errorType === 'validation' ? (
                                        <i className="fas fa-file-image fa-4x text-info"></i>
                                    ) : (
                                        <i className="fas fa-exclamation-triangle fa-4x text-warning"></i>
                                    )}
                                </div>
                                <h3 className="mb-3">
                                    {errorType === 'network' ? t('vastu.errorConnection') :
                                     errorType === 'timeout' ? t('vastu.errorTimeout') :
                                     errorType === 'validation' ? t('vastu.errorValidation') :
                                     t('vastu.errorGeneral')}
                                </h3>
                                <p className="text-muted mb-4">{errorMessage}</p>

                                {/* Error-specific suggestions */}
                                <div className="error-suggestions bg-light p-3 rounded-3 mb-4 text-start mx-auto" style={{ maxWidth: '500px' }}>
                                    <h6 className="mb-2">
                                        <i className="fas fa-lightbulb text-warning me-2"></i>
                                        {t('vastu.suggestions')}
                                    </h6>
                                    <ul className="mb-0 small text-muted">
                                        {errorType === 'network' && (
                                            <>
                                                <li>{t('vastu.suggestionNetwork1')}</li>
                                                <li>{t('vastu.suggestionNetwork2')}</li>
                                                <li>{t('vastu.suggestionNetwork3')}</li>
                                            </>
                                        )}
                                        {errorType === 'timeout' && (
                                            <>
                                                <li>{t('vastu.suggestionTimeout1')}</li>
                                                <li>{t('vastu.suggestionTimeout2')}</li>
                                                <li>{t('vastu.suggestionTimeout3')}</li>
                                            </>
                                        )}
                                        {errorType === 'validation' && (
                                            <>
                                                <li>{t('vastu.suggestionValidation1')}</li>
                                                <li>{t('vastu.suggestionValidation2')}</li>
                                                <li>{t('vastu.suggestionValidation3')}</li>
                                            </>
                                        )}
                                        {errorType === 'general' && (
                                            <>
                                                <li>{t('vastu.suggestionGeneral1')}</li>
                                                <li>{t('vastu.suggestionGeneral2')}</li>
                                                <li>{t('vastu.suggestionGeneral3')}</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <button onClick={handleRetry} className="btn btn-main">
                                        <i className="fas fa-redo me-2"></i>
                                        {t('vastu.tryAgain')}
                                    </button>
                                    {errorType === 'validation' && (
                                        <button onClick={handleReset} className="btn btn-outline-main">
                                            <i className="fas fa-upload me-2"></i>
                                            {t('vastu.uploadDifferentImage')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Result */}
                        {appState === 'result' && analysisResult && (
                            <VastuReport
                                result={analysisResult}
                                onReset={handleReset}
                            />
                        )}
                    </div>
                </section>

                {/* Info Section - only show on input state */}
                {appState === 'input' && (
                    <section className="vastu-info-section bg-light">
                        <div className="container">
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-upload fa-3x text-main mb-3"></i>
                                        <h4>{t('vastu.stepUploadTitle')}</h4>
                                        <p className="text-muted mb-0">
                                            {t('vastu.stepUploadDesc')}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-compass fa-3x text-main mb-3"></i>
                                        <h4>{t('vastu.stepNorthTitle')}</h4>
                                        <p className="text-muted mb-0">
                                            {t('vastu.stepNorthDesc')}
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-file-alt fa-3x text-main mb-3"></i>
                                        <h4>{t('vastu.stepReportTitle')}</h4>
                                        <p className="text-muted mb-0">
                                            {t('vastu.stepReportDesc')}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* What is Vastu Section - only show on input state */}
                {appState === 'input' && (
                    <section className="vastu-about-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 mx-auto">
                                    <div className="about-content text-center">
                                        <h2 className="mb-4">{t('vastu.whatIsVastu')}</h2>
                                        <p className="mb-4">
                                            {t('vastu.whatIsVastuDesc')}
                                        </p>
                                        <div className="row g-4 mt-4">
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>{t('vastu.vastuTip1')}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>{t('vastu.vastuTip2')}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>{t('vastu.vastuTip3')}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>{t('vastu.vastuTip4')}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* How to Check Vastu Online - only show on input state */}
                {appState === 'input' && (
                    <section className="vastu-howto-section bg-light">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 mx-auto">
                                    <h2 className="text-center mb-4">{t('vastu.howToCheckOnlineTitle')}</h2>
                                    <p className="text-center mb-5">{t('vastu.howToCheckOnlineDesc')}</p>
                                </div>
                            </div>
                            <div className="row g-4">
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-camera fa-3x text-main mb-3"></i>
                                        <h4>1</h4>
                                        <p className="text-muted mb-0">{t('vastu.howToCheckOnlineStep1')}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-compass fa-3x text-main mb-3"></i>
                                        <h4>2</h4>
                                        <p className="text-muted mb-0">{t('vastu.howToCheckOnlineStep2')}</p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-chart-line fa-3x text-main mb-3"></i>
                                        <h4>3</h4>
                                        <p className="text-muted mb-0">{t('vastu.howToCheckOnlineStep3')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* Vastu for Flats vs Houses - only show on input state */}
                {appState === 'input' && (
                    <section className="vastu-flat-vs-house-section">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 mx-auto text-center">
                                    <h2 className="mb-4">{t('vastu.vastuFlatVsHouseTitle')}</h2>
                                    <p>{t('vastu.vastuFlatVsHouseDesc')}</p>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ Accordion - only show on input state */}
                {appState === 'input' && (
                    <section className="vastu-faq-section bg-light">
                        <div className="container">
                            <div className="row">
                                <div className="col-lg-8 mx-auto">
                                    <h2 className="text-center mb-5">{t('vastu.faqTitle')}</h2>
                                    <div className="vastu-faq-list">
                                        {VASTU_CHECKER_FAQS.map((faq, index) => (
                                            <div
                                                key={index}
                                                className="vastu-faq-item"
                                            >
                                                <button
                                                    className="vastu-faq-item__question"
                                                    aria-expanded={faqOpenIndex === index}
                                                    aria-controls={`vastu-faq-answer-${index}`}
                                                    onClick={() => setFaqOpenIndex(faqOpenIndex === index ? -1 : index)}
                                                >
                                                    <span>{faq.question}</span>
                                                    <i className={`vastu-faq-item__icon fas ${faqOpenIndex === index ? 'fa-minus' : 'fa-plus'}`}></i>
                                                </button>
                                                <div
                                                    id={`vastu-faq-answer-${index}`}
                                                    role="region"
                                                    className={`vastu-faq-item__answer ${faqOpenIndex === index ? 'open' : ''}`}
                                                >
                                                    <p>{faq.answer}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* CTA Section */}
                <section className="cta-section text-white">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8 text-center">
                                <h2 className="cta-title mb-3">{t('vastu.ctaTitle')}</h2>
                                <p className="cta-desc mb-4">
                                    {t('vastu.ctaDesc')}
                                </p>
                                <div className="cta-buttons d-flex justify-content-center gap-3 flex-wrap">
                                    <I18nLink to="/ai-design-studio" className="btn btn-white btn-main">
                                        <i className="fas fa-wand-magic-sparkles me-2"></i>
                                        AI Design Studio
                                    </I18nLink>
                                    <I18nLink to="/properties" className="btn btn-outline-white">
                                        <i className="fas fa-home me-2"></i>
                                        {t('vastu.browseProperties')}
                                    </I18nLink>
                                    <I18nLink to="/contact" className="btn btn-outline-white">
                                        <i className="fas fa-phone me-2"></i>
                                        {t('vastu.contactUs')}
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

export default VastuChecker;
