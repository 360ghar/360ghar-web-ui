import { useState, useCallback } from 'react';
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
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';
import { analyzeFloorPlan } from '../../services/vastuService';
import './VastuChecker.scss';

const VASTU_FAQS = [
  {
    question: 'How to check Vastu of a flat online for free?',
    answer: 'Upload your floor plan image on 360Ghar\'s free Vastu Checker, select the North direction, and get an instant AI-powered analysis with a score (0-100), room-by-room evaluation, and practical remedies. No registration required. Supports JPEG, PNG, and WebP images up to 5MB.',
  },
  {
    question: 'What is a good Vastu score for a flat?',
    answer: 'A Vastu score above 70 is considered good, above 85 is excellent. Scores below 50 indicate significant Vastu concerns that may need remedies. However, perfect Vastu compliance (100) is rare in modern apartments. Focus on the main entrance, kitchen, master bedroom, and Brahmasthan (center) for maximum impact.',
  },
  {
    question: 'Which direction should the main entrance face as per Vastu?',
    answer: 'North and East-facing entrances are considered most auspicious in Vastu Shastra. North brings wealth and career growth. East brings health and enlightenment. South-facing entrances can be acceptable with proper remedies. West-facing is less preferred but manageable. Avoid entrances in the South-West corner.',
  },
  {
    question: 'Can Vastu defects be fixed without renovation?',
    answer: 'Yes, many Vastu defects can be remedied without structural changes: use mirrors to redirect energy, place specific colors and elements in affected zones, use Vastu pyramids and crystals, keep the Brahmasthan (center) clutter-free, add plants in the North/East, and use salt water remedies for negative zones. Our AI analysis provides specific, practical remedies for each defect found.',
  },
  {
    question: 'Is Vastu Shastra scientifically proven?',
    answer: 'Vastu Shastra combines traditional spatial planning principles with natural element positioning. While not empirically validated by modern science, it incorporates principles of natural light, ventilation, and ergonomic space planning. Many homeowners report improved well-being after implementing Vastu guidelines. Our AI tool provides an objective score-based analysis.',
  },
];

const HOW_TO_STEPS = [
  { name: 'Upload Your Floor Plan', text: 'Take a photo or screenshot of your floor plan and upload it. Ensure the image is clear with visible room labels. Supported formats: JPEG, PNG, WebP (max 5MB).' },
  { name: 'Set the North Direction', text: 'Indicate which side of the image faces North using our direction selector. This is critical for accurate zone analysis — Vastu recommendations depend on the cardinal orientation of each room.' },
  { name: 'Add Notes (Optional)', text: 'Mention specific concerns like "health issues" or "financial growth" so the AI can prioritize relevant remedies.' },
  { name: 'Get Your Vastu Report', text: 'In 30-60 seconds, receive a comprehensive report with: overall Vastu score (0-100), room-by-room analysis, identified defects, and practical remedies with Vastu products and colors.' },
];

const VastuChecker = () => {
    // Form state
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [northDirection, setNorthDirection] = useState('up');
    const [notes, setNotes] = useState('');

    // UI state
    const [appState, setAppState] = useState('input'); // input, loading, result, error
    const [loadingStep, setLoadingStep] = useState('analyzing');
    const [errorMessage, setErrorMessage] = useState('');
    const [errorType, setErrorType] = useState('general'); // general, timeout, network, validation

    // Result state
    const [analysisResult, setAnalysisResult] = useState(null);

    const handleImageSelect = useCallback((file, preview) => {
        setSelectedFile(file);
        setPreviewUrl(preview);
    }, []);

    const handleSubmit = useCallback(async (e) => {
        e.preventDefault();

        if (!selectedFile) {
            setErrorMessage('Please upload a floor plan image');
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
            let message = 'Analysis failed. Please try again.';
            let type = 'general';

            if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
                type = 'timeout';
                message = 'The analysis is taking longer than expected. This may be due to high demand or a complex floor plan.';
            } else if (error.code === 'ERR_NETWORK' || !navigator.onLine) {
                type = 'network';
                message = 'Unable to connect to the server. Please check your internet connection and try again.';
            } else if (error.response?.status === 413) {
                type = 'validation';
                message = 'The image file is too large. Please upload an image smaller than 5MB.';
            } else if (error.response?.status === 415) {
                type = 'validation';
                message = 'Unsupported image format. Please upload a JPEG, PNG, or WebP image.';
            } else if (error.response?.status === 422) {
                type = 'validation';
                message = error.response?.data?.detail || 'Invalid request. Please check your input and try again.';
            } else if (error.response?.status >= 500) {
                type = 'general';
                message = 'Our servers are experiencing issues. Please try again in a few minutes.';
            } else if (error.response?.data?.detail) {
                message = error.response.data.detail;
            } else if (error.message) {
                message = error.message;
            }

            setErrorMessage(message);
            setErrorType(type);
            setAppState('error');
        }
    }, [selectedFile, northDirection, notes]);

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
    }, [previewUrl]);

    const handleRetry = useCallback(() => {
        setAppState('input');
        setErrorMessage('');
        setErrorType('general');
    }, []);

    return (
        <>
            <SEO
                title="Free AI Vastu Checker 2026 | Upload Floor Plan & Get Instant Score | 360Ghar"
                description="Check Vastu of your flat or house online for free. Upload your floor plan and get an instant AI-powered Vastu score (0-100), room-by-room analysis, and practical remedies. No registration required. Trusted by 15,000+ homeowners."
                keywords="vastu checker free, ai vastu check online, floor plan vastu analysis, vastu shastra checker, vastu score calculator, vastu for flat online, vastu remedies, check vastu of house free, 360ghar vastu"
                canonical="/vastu-checker"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.vastuChecker),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                        { name: toolSchemas.vastuChecker.name, url: 'https://360ghar.com/vastu-checker' }
                    ]),
                    generateFaqStructuredData(VASTU_FAQS),
                    generateHowToStructuredData({
                      name: 'How to Check Vastu of Your Floor Plan Online',
                      description: 'Step-by-step guide to get an AI-powered Vastu analysis for your home.',
                      steps: HOW_TO_STEPS,
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
                                    Free AI Vastu Checker 2026 — Upload Floor Plan & Get Score
                                </h1>
                                <p className="section-desc">
                                    Upload your floor plan and receive a comprehensive Vastu Shastra analysis
                                    with personalized recommendations and practical remedies.
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
                                                        Additional Notes
                                                        <span className="text-muted ms-2">(optional)</span>
                                                    </label>
                                                    <textarea
                                                        className="form-control"
                                                        rows={4}
                                                        value={notes}
                                                        onChange={(e) => setNotes(e.target.value)}
                                                        placeholder="Any specific concerns about your property? E.g., 'Planning kitchen renovation', 'Health issues in family', 'Want to improve prosperity'..."
                                                        maxLength={1000}
                                                    />
                                                    <small className="text-muted d-block text-end mt-1">
                                                        {notes.length}/1000 characters
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
                                            Analyze Vastu
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
                                    {errorType === 'network' ? 'Connection Error' :
                                     errorType === 'timeout' ? 'Request Timeout' :
                                     errorType === 'validation' ? 'Invalid Input' :
                                     'Analysis Failed'}
                                </h3>
                                <p className="text-muted mb-4">{errorMessage}</p>

                                {/* Error-specific suggestions */}
                                <div className="error-suggestions bg-light p-3 rounded-3 mb-4 text-start mx-auto" style={{ maxWidth: '500px' }}>
                                    <h6 className="mb-2">
                                        <i className="fas fa-lightbulb text-warning me-2"></i>
                                        Suggestions
                                    </h6>
                                    <ul className="mb-0 small text-muted">
                                        {errorType === 'network' && (
                                            <>
                                                <li>Check your internet connection</li>
                                                <li>Try refreshing the page</li>
                                                <li>Disable any VPN or proxy that might be blocking the connection</li>
                                            </>
                                        )}
                                        {errorType === 'timeout' && (
                                            <>
                                                <li>Try uploading a smaller or simpler floor plan image</li>
                                                <li>Ensure the image is clear and well-lit</li>
                                                <li>Try again in a few minutes if the server is busy</li>
                                            </>
                                        )}
                                        {errorType === 'validation' && (
                                            <>
                                                <li>Use JPEG, PNG, or WebP image format</li>
                                                <li>Keep the file size under 5MB</li>
                                                <li>Ensure the image shows a clear 2D floor plan</li>
                                            </>
                                        )}
                                        {errorType === 'general' && (
                                            <>
                                                <li>Ensure your floor plan image is clear and readable</li>
                                                <li>Try uploading a different floor plan image</li>
                                                <li>If the problem persists, contact support</li>
                                            </>
                                        )}
                                    </ul>
                                </div>

                                <div className="d-flex gap-3 justify-content-center flex-wrap">
                                    <button onClick={handleRetry} className="btn btn-main">
                                        <i className="fas fa-redo me-2"></i>
                                        Try Again
                                    </button>
                                    {errorType === 'validation' && (
                                        <button onClick={handleReset} className="btn btn-outline-main">
                                            <i className="fas fa-upload me-2"></i>
                                            Upload Different Image
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
                                        <h4>1. Upload Floor Plan</h4>
                                        <p className="text-muted mb-0">
                                            Upload a clear image of your floor plan (JPEG, PNG, or WebP, max 5MB)
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-compass fa-3x text-main mb-3"></i>
                                        <h4>2. Set North Direction</h4>
                                        <p className="text-muted mb-0">
                                            Indicate which direction is North in your floor plan image
                                        </p>
                                    </div>
                                </div>
                                <div className="col-md-4">
                                    <div className="info-card bg-white h-100 text-center">
                                        <i className="fas fa-file-alt fa-3x text-main mb-3"></i>
                                        <h4>3. Get AI Report</h4>
                                        <p className="text-muted mb-0">
                                            Receive detailed Vastu analysis with score and practical remedies
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
                                        <h3 className="mb-4">What is Vastu Shastra?</h3>
                                        <p className="mb-4">
                                            Vastu Shastra is an ancient Indian science of architecture and design that harmonizes
                                            the five elements of nature - Earth, Water, Fire, Air, and Space - with your living space.
                                            It provides guidelines for the layout and positioning of rooms to enhance positive energy flow.
                                        </p>
                                        <div className="row g-4 mt-4">
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>Entrance facing North or East brings prosperity</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>Kitchen in South-East for health and wealth</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>Master bedroom in South-West for stability</span>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="feature-item">
                                                    <i className="fas fa-check-circle text-success me-2"></i>
                                                    <span>Center (Brahmasthan) should be open</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                )}

                {/* FAQ and Related Tools - only show on input state */}
                {appState === 'input' && (
                    <section className="padding-y-60">
                        <div className="container">
                            <div className="row justify-content-center">
                                <div className="col-lg-8">
                                    <ToolFaq faqs={VASTU_FAQS} heading="Vastu Checker — Frequently Asked Questions" />
                                    <ToolRelatedLinks
                                        heading="Related Tools & Resources"
                                        links={[
                                            { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                                            { to: '/area-converter', label: 'Area Unit Converter', icon: 'fas fa-exchange-alt' },
                                            { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                                            { to: '/property-document-checklist', label: 'Property Document Checklist', icon: 'fas fa-clipboard-list' },
                                            { to: '/design-blueprint', label: '3D Blueprint Designer', icon: 'fas fa-drafting-compass' },
                                            { to: '/blog', label: 'Real Estate Blog', icon: 'fas fa-blog' },
                                        ]}
                                    />
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
                                <h2 className="cta-title mb-3">Looking for a Vastu-Compliant Home?</h2>
                                <p className="cta-desc mb-4">
                                    Explore our curated collection of properties with 360° virtual tours.
                                    Find your perfect home with confidence.
                                </p>
                                <div className="cta-buttons d-flex justify-content-center gap-3 flex-wrap">
                                    <a href="/properties" className="btn btn-white btn-main">
                                        <i className="fas fa-home me-2"></i>
                                        Browse Properties
                                    </a>
                                    <a href="/contact" className="btn btn-outline-white">
                                        <i className="fas fa-phone me-2"></i>
                                        Contact Us
                                    </a>
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
