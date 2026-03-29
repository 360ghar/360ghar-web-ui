import { useState, useCallback } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import FloorPlanUpload from '../../components/vastu/FloorPlanUpload';
import DirectionSelector from '../../components/vastu/DirectionSelector';
import VastuLoadingState from '../../components/vastu/VastuLoadingState';
import VastuReport from '../../components/vastu/VastuReport';
import { analyzeFloorPlan } from '../../services/vastuService';
import './VastuChecker.scss';

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
                title="Free Vastu Checker - AI Floor Plan Analysis | 360Ghar"
                description="Get instant AI-powered Vastu Shastra analysis for your floor plan. Upload your floor plan and receive a comprehensive Vastu score, room-by-room analysis, and practical remedies. Free online Vastu checker."
                keywords="vastu checker, vastu analysis, floor plan vastu, vastu shastra, vastu score, vastu remedies, 360ghar, free vastu analysis, vastu consultant, vastu for home, vastu tips, vastu dosh, vastu shastra in hindi"
                canonical="/vastu-checker"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.vastuChecker),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                        { name: toolSchemas.vastuChecker.name, url: 'https://360ghar.com/vastu-checker' }
                    ])
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
                                <h2 className="section-title">
                                    <span className="vastu-icon-wrapper">
                                        <i className="fas fa-compass text-main"></i>
                                    </span>
                                    AI-Powered Vastu Checker
                                </h2>
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
