import { useState, useCallback, useEffect }  from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { I18nLink } from '../../i18n/I18nLink';

import {
  PuterAuthPrompt,
  DesignModeSelector,
  RoomTypeSelector,
  StylePresetSelector,
  DesignGenerationMode,
  DesignImageUpload,
  DesignPromptInput,
  DesignLoadingState,
  DesignResult,
  BeforeAfterCompare,
  DesignGallery,
  saveToGallery,
  ROOM_TYPES,
  STYLE_PRESETS,
} from '../../components/design';

import puterService from '../../services/puterService';
import './AIDesignStudio.scss';

const AI_DESIGN_FAQS = [
  { question: 'How does AI Design Studio work?', answer: 'AI Design Studio uses advanced image generation AI to create photorealistic interior and exterior designs. You can either describe your vision in text or upload a photo of an existing room to reimagine it in different styles.' },
  { question: 'Is AI Design Studio free to use?', answer: 'Yes, AI Design Studio is completely free to use on 360Ghar. Generate as many designs as you need to visualize your dream space.' },
  { question: 'Can I upload my own room photo?', answer: 'Yes! Use the image-to-image mode to upload a photo of your existing room. The AI will reimagine it while preserving the room layout and structure.' },
  { question: 'What design styles are available?', answer: 'Choose from Modern, Minimalist, Scandinavian, Industrial, Bohemian, Traditional Indian, and many more style presets. Each generates a unique look tailored to the selected room type.' },
  { question: 'How is AI Design Studio different from other design tools?', answer: 'Unlike static planning tools, AI Design Studio generates photorealistic renders in seconds. Combined with 360Ghar\'s verified property listings and 360° virtual tours, you can design your ideal space before moving in.' },
];

const AI_DESIGN_HOW_TO_STEPS = [
  { name: 'Choose generation mode', text: 'Select text-to-image to describe your vision, or image-to-image to reimagine an existing room.' },
  { name: 'Select room type and style', text: 'Pick the room type (bedroom, living room, kitchen, etc.) and a design style preset.' },
  { name: 'Add your prompt or upload photo', text: 'Type a custom description or upload a room photo for the AI to work with.' },
  { name: 'Generate and save', text: 'Click generate to create your design. Save results to your gallery for later reference.' },
];

/**
 * Build the full prompt from user selections
 */
const buildPrompt = ({ designType, roomType, style, customPrompt }) => {
  // Get room label
  const roomTypes = ROOM_TYPES[designType] || ROOM_TYPES.interior;
  const room = roomTypes.find((r) => r.id === roomType);
  const roomLabel = room?.label || roomType;

  // Get style description
  const stylePreset = STYLE_PRESETS.find((s) => s.id === style);
  const styleDesc = stylePreset?.promptText || style;

  const base = designType === 'interior'
    ? `Interior design of a ${roomLabel}`
    : `Exterior design of a ${roomLabel}`;

  const parts = [
    base,
    styleDesc,
    customPrompt,
    'Professional architectural visualization',
    'high quality',
    'photorealistic',
    'well-lit',
    'detailed textures',
    '8K resolution',
  ].filter(Boolean);

  return parts.join(', ');
};

const NEGATIVE_PROMPT = 'blurry, distorted, low quality, cartoon, sketch, watermark, text, logo, unrealistic, deformed';

/**
 * Build prompt specifically for image-to-image (reimagine) mode
 * Includes explicit instructions for Gemini to preserve the original structure
 * Style is optional - if not provided, will just preserve and enhance
 */
const buildReimaginePrompt = ({ style, customPrompt }) => {
  const stylePreset = STYLE_PRESETS.find((s) => s.id === style);
  const styleDesc = stylePreset?.promptText || '';

  const parts = [
    'STRICT RULES — You MUST follow every rule below:',
    '1. The uploaded image is the REFERENCE. Reproduce its exact room layout, architecture, walls, windows, doors, ceiling, floor plan, and furniture positions pixel-for-pixel.',
    '2. Do NOT add, remove, or relocate any furniture, walls, doors, or windows.',
    '3. Do NOT change the camera angle, perspective, lens distortion, or viewpoint.',
    '4. ONLY change: surface colors, materials, textures, fabrics, finishes, decor accessories, wall art, plants, and styling.',
    '5. Maintain the exact same lighting direction, shadow angles, and natural light sources.',
    styleDesc ? `6. Apply a ${styleDesc} interior design style to all surfaces and decor.` : null,
    '7. Output a photorealistic, professional interior design rendering.',
    '8. The result must look like the SAME room photographed from the SAME angle, just restyled.',
    customPrompt ? `Additional user instructions: ${customPrompt}` : null,
  ].filter(Boolean);

  return parts.join('\n');
};

const AIDesignStudio = () => {
  const { t } = useTranslation('tools');

  // App state: auth, input, loading, result, error
  const [appState, setAppState] = useState('auth');
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Generation mode
  const [generationMode, setGenerationMode] = useState('text-to-image');

  // Form state
  const [designType, setDesignType] = useState('interior');
  const [roomType, setRoomType] = useState('living-room');
  const [style, setStyle] = useState('modern');
  const [customPrompt, setCustomPrompt] = useState('');

  // Image upload state (for img2img)
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Loading state
  const [loadingStep, setLoadingStep] = useState('understanding');

  // Result state
  const [generatedImage, setGeneratedImage] = useState(null);
  const [usedPrompt, setUsedPrompt] = useState('');
  const [isSaved, setIsSaved] = useState(false);

  // Error state
  const [errorMessage, setErrorMessage] = useState('');
  const [errorType, setErrorType] = useState('general');

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        await puterService.init();
        if (puterService.isAuthenticated()) {
          setAppState('input');
        }
      } catch {
        // Puter SDK not yet loaded — will retry on user action
      }
    };
    checkAuth();
  }, []);

  // Reset room type when design type changes
  useEffect(() => {
    const rooms = ROOM_TYPES[designType];
    if (rooms && rooms.length > 0) {
      setRoomType(rooms[0].id);
    }
  }, [designType]);

  const handleSignIn = useCallback(async () => {
    setIsAuthLoading(true);
    try {
      await puterService.signIn();
      if (puterService.isAuthenticated()) {
        setAppState('input');
      }
    } catch (error) {
      console.error('Sign in failed:', error);
      setErrorMessage('Failed to sign in with Puter. Please try again.');
      setErrorType('validation');
      setAppState('error');
    } finally {
      setIsAuthLoading(false);
    }
  }, []);

  const handleImageSelect = useCallback((file, preview) => {
    setSelectedFile(file);
    setPreviewUrl(preview);
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    // Validation for img2img mode
    if (generationMode === 'image-to-image' && !selectedFile) {
      setErrorMessage('Please upload a photo to reimagine');
      setErrorType('validation');
      setAppState('error');
      return;
    }

    let stepTimer1 = null;
    let stepTimer2 = null;

    try {
      setAppState('loading');
      setLoadingStep('understanding');
      setErrorMessage('');
      setIsSaved(false);

      // Simulate step transitions
      stepTimer1 = setTimeout(() => setLoadingStep('generating'), 2000);
      stepTimer2 = setTimeout(() => setLoadingStep('enhancing'), 15000);

      let imageUrl;

      if (generationMode === 'text-to-image') {
        // Text-to-Image generation - build standard prompt
        const prompt = buildPrompt({
          designType,
          roomType,
          style,
          customPrompt,
        });
        setUsedPrompt(prompt);

        imageUrl = await puterService.generateFromText(prompt, {
          negativePrompt: NEGATIVE_PROMPT,
          width: 1024,
          height: 1024,
        });
      } else {
        // Image-to-Image transformation - use specialized prompt with structure preservation
        const reimaginePrompt = buildReimaginePrompt({
          style,
          customPrompt,
        });
        setUsedPrompt(reimaginePrompt);

        const { base64, mimeType } = await puterService.fileToBase64(selectedFile);
        imageUrl = await puterService.reimagineImage(reimaginePrompt, base64, mimeType);
      }

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      setGeneratedImage(imageUrl);
      setAppState('result');

    } catch (error) {
      console.error('Generation error:', error);
      if (stepTimer1) clearTimeout(stepTimer1);
      if (stepTimer2) clearTimeout(stepTimer2);

      if (error.message?.includes('sign in') || error.message?.includes('authenticated')) {
        setErrorMessage('Please sign in with Puter to generate images.');
        setErrorType('validation');
        setAppState('auth');
        return;
      }
      const [type, message] = error.message?.includes('quota') || error.message?.includes('limit')
        ? ['quota', 'You have reached your Puter usage limit. Please check your Puter account.']
        : error.message?.includes('timeout')
          ? ['timeout', 'The generation is taking too long. Please try again with a simpler prompt.']
          : !navigator.onLine
            ? ['network', 'No internet connection. Please check your network and try again.']
            : ['general', 'Failed to generate design. Please try again.'];

      setErrorMessage(message);
      setErrorType(type);
      setAppState('error');
    }
  }, [generationMode, designType, roomType, style, customPrompt, selectedFile]);

  const handleRegenerate = useCallback(() => {
    handleSubmit({ preventDefault: () => {} });
  }, [handleSubmit]);

  const handleSaveToGallery = useCallback(() => {
    const success = saveToGallery({
      imageUrl: generatedImage,
      originalUrl: previewUrl,
      prompt: usedPrompt,
      settings: {
        designType,
        roomType,
        style,
        generationMode,
      },
    });

    if (success) {
      setIsSaved(true);
    }
  }, [generatedImage, previewUrl, usedPrompt, designType, roomType, style, generationMode]);

  const handleReset = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setGenerationMode('text-to-image');
    setDesignType('interior');
    setRoomType('living-room');
    setStyle('modern');
    setCustomPrompt('');
    setSelectedFile(null);
    setPreviewUrl(null);
    setGeneratedImage(null);
    setUsedPrompt('');
    setIsSaved(false);
    setErrorMessage('');
    setErrorType('general');
    setAppState('input');
  }, [previewUrl]);

  const handleRetry = useCallback(() => {
    setAppState('input');
    setErrorMessage('');
    setErrorType('general');
  }, []);

  const getSettings = useCallback(() => {
    const rooms = ROOM_TYPES[designType] || [];
    const room = rooms.find((r) => r.id === roomType);
    const stylePreset = STYLE_PRESETS.find((s) => s.id === style);

    return {
      designType,
      roomType: room?.label || roomType,
      style: stylePreset?.label || style,
    };
  }, [designType, roomType, style]);

  return (
    <>
      <SEO
        title={t('aiDesignStudio.title')}
        description={t('aiDesignStudio.description')}
        keywords={t('aiDesignStudio.keywords')}
        canonical="/ai-design-studio"
        type="website"
        structuredData={[
          generateToolSchema(toolSchemas.aiDesignStudio),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
            { name: 'AI Design Studio', url: 'https://360ghar.com/ai-design-studio' }
          ]),
          generateFaqStructuredData(AI_DESIGN_FAQS),
          generateHowToStructuredData({
            name: 'How to Generate AI Room Designs',
            description: 'Step-by-step guide to creating photorealistic room designs with AI.',
            steps: AI_DESIGN_HOW_TO_STEPS,
          }),
        ]}
      />
      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header />

        {/* Main Design Studio Section */}
        <section className="design-studio-section">
          <div className="container">
            {/* Auth State */}
            {appState === 'auth' && (
              <>
                <div className="section-heading text-center mb-4">
                  <h2 className="section-title">{t('aiDesignStudio.heroTitle')}</h2>
                  <p className="section-desc">{t('aiDesignStudio.heroDescAuth')}</p>
                </div>
                <PuterAuthPrompt
                  onSignIn={handleSignIn}
                  isLoading={isAuthLoading}
                />
              </>
            )}

            {/* Input State */}
            {appState === 'input' && (
              <>
                <div className="section-heading text-center mb-4">
                  <h2 className="section-title">{t('aiDesignStudio.heroTitle')}</h2>
                  <p className="section-desc">{t('aiDesignStudio.heroDescInput')}</p>
                </div>

                <div className="design-form-wrapper">
                  <form onSubmit={handleSubmit} className="design-form">
                    {/* Generation Mode Toggle */}
                    <div className="form-section mb-4">
                      <DesignGenerationMode
                        value={generationMode}
                        onChange={setGenerationMode}
                      />
                    </div>

                    <div className="row g-4">
                      {/* Left column - only show for text-to-image */}
                      {generationMode === 'text-to-image' && (
                        <div className="col-lg-6">
                          {/* Design Type */}
                          <div className="form-section mb-4">
                            <DesignModeSelector
                              value={designType}
                              onChange={setDesignType}
                            />
                          </div>

                          {/* Room Type */}
                          <div className="form-section mb-4">
                            <RoomTypeSelector
                              designMode={designType}
                              value={roomType}
                              onChange={setRoomType}
                            />
                          </div>
                        </div>
                      )}

                      {/* Image Upload - left column for img2img */}
                      {generationMode === 'image-to-image' && (
                        <div className="col-lg-6">
                          <div className="form-section mb-4">
                            <DesignImageUpload
                              onImageSelect={handleImageSelect}
                              selectedFile={selectedFile}
                              previewUrl={previewUrl}
                            />
                          </div>
                        </div>
                      )}

                      {/* Style Presets - right column for both modes */}
                      <div className="col-lg-6">
                        <div className="form-section mb-4">
                          <StylePresetSelector
                            value={style}
                            onChange={setStyle}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom Prompt */}
                    <div className="form-section mb-4">
                      <DesignPromptInput
                        value={customPrompt}
                        onChange={setCustomPrompt}
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="form-actions text-center">
                      <button
                        type="submit"
                        className="btn btn-main btn-lg px-5"
                        disabled={generationMode === 'image-to-image' && !selectedFile}
                      >
                        <i className="fas fa-magic me-2"></i>
                        {t('aiDesignStudio.generateDesign')}
                      </button>
                    </div>
                  </form>
                </div>

                {/* Design Gallery */}
                <div className="mt-5">
                  <DesignGallery />
                </div>
              </>
            )}

            {/* Loading State */}
            {appState === 'loading' && (
              <DesignLoadingState currentStep={loadingStep} />
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
                    <i className="fas fa-exclamation-circle fa-4x text-info"></i>
                  ) : errorType === 'quota' ? (
                    <i className="fas fa-coins fa-4x text-warning"></i>
                  ) : (
                    <i className="fas fa-exclamation-triangle fa-4x text-warning"></i>
                  )}
                </div>
                <h3 className="mb-3">
                  {errorType === 'network' ? 'Connection Error' :
                   errorType === 'timeout' ? 'Request Timeout' :
                   errorType === 'validation' ? 'Invalid Input' :
                   errorType === 'quota' ? 'Usage Limit Reached' :
                   'Generation Failed'}
                </h3>
                <p className="text-muted mb-4">{errorMessage}</p>

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
                        <li>Disable any VPN or proxy</li>
                      </>
                    )}
                    {errorType === 'timeout' && (
                      <>
                        <li>Try a simpler prompt</li>
                        <li>Use a smaller image (for img2img)</li>
                        <li>Try again in a few minutes</li>
                      </>
                    )}
                    {errorType === 'validation' && (
                      <>
                        <li>Make sure all required fields are filled</li>
                        <li>Upload a valid image (JPEG, PNG, WebP)</li>
                        <li>Check that you are signed in</li>
                      </>
                    )}
                    {errorType === 'quota' && (
                      <>
                        <li>Check your Puter account usage limits</li>
                        <li>Try again later when quota resets</li>
                        <li>Consider upgrading your Puter plan</li>
                      </>
                    )}
                    {errorType === 'general' && (
                      <>
                        <li>Try a different style or room type</li>
                        <li>Simplify your custom prompt</li>
                        <li>Refresh the page and try again</li>
                      </>
                    )}
                  </ul>
                </div>

                <div className="d-flex gap-3 justify-content-center flex-wrap">
                  <button onClick={handleRetry} className="btn btn-main">
                    <i className="fas fa-redo me-2"></i>
                    Try Again
                  </button>
                  <button onClick={handleReset} className="btn btn-outline-main">
                    <i className="fas fa-home me-2"></i>
                    Start Over
                  </button>
                </div>
              </div>
            )}

            {/* Result State */}
            {appState === 'result' && generatedImage && (
              <div className="result-wrapper">
                <DesignResult
                  imageUrl={generatedImage}
                  prompt={usedPrompt}
                  settings={getSettings()}
                  onRegenerate={handleRegenerate}
                  onSaveToGallery={handleSaveToGallery}
                  onReset={handleReset}
                  isSaved={isSaved}
                />

                {/* Before/After Compare (for img2img) */}
                {generationMode === 'image-to-image' && previewUrl && (
                  <div className="mt-5">
                    <BeforeAfterCompare
                      beforeImage={previewUrl}
                      afterImage={generatedImage}
                      beforeLabel="Original"
                      afterLabel="AI Redesign"
                    />
                  </div>
                )}

                {/* Gallery */}
                <div className="mt-5">
                  <DesignGallery />
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Info Section - only show on input state */}
        {appState === 'input' && (
          <section className="design-info-section bg-light">
            <div className="container">
              <div className="row g-4">
                <div className="col-md-4">
                  <div className="info-card bg-white h-100 text-center">
                    <i className="fas fa-paint-brush fa-3x text-main mb-3"></i>
                    <h4>1. Choose Your Style</h4>
                    <p className="text-muted mb-0">
                      Select from 12+ design styles including Modern, Traditional Indian, Minimalist, and more
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-card bg-white h-100 text-center">
                    <i className="fas fa-wand-magic-sparkles fa-3x text-main mb-3"></i>
                    <h4>2. Generate with AI</h4>
                    <p className="text-muted mb-0">
                      Create from scratch or upload a photo to reimagine your existing space
                    </p>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="info-card bg-white h-100 text-center">
                    <i className="fas fa-download fa-3x text-main mb-3"></i>
                    <h4>3. Save & Share</h4>
                    <p className="text-muted mb-0">
                      Download your designs, save to your gallery, or share with friends
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* About Section - only show on auth/input state */}
        {(appState === 'auth' || appState === 'input') && (
          <section className="design-about-section">
            <div className="container">
              <div className="row">
                <div className="col-lg-8 mx-auto">
                  <div className="about-content text-center">
                    <h3 className="mb-4">Why Use AI Design Studio?</h3>
                    <p className="mb-4">
                      Our AI Design Studio uses cutting-edge image generation technology to help you
                      visualize your dream space. Whether you&apos;re planning a renovation, seeking inspiration,
                      or just curious about different design styles, our tool makes it easy to explore
                      endless possibilities.
                    </p>
                    <div className="row g-4 mt-4">
                      <div className="col-md-6">
                        <div className="feature-item">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span>Generate photorealistic room designs in seconds</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="feature-item">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span>Transform existing photos into new styles</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="feature-item">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span>12+ design styles from Modern to Traditional Indian</span>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="feature-item">
                          <i className="fas fa-check-circle text-success me-2"></i>
                          <span>Save designs to your personal gallery</span>
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
                <h2 className="cta-title mb-3">{t('tools:aiDesign.ctaTitle')}</h2>
                <p className="cta-desc mb-4">
                  {t('tools:aiDesign.ctaDesc')}
                </p>
                <div className="cta-buttons d-flex justify-content-center gap-3 flex-wrap">
                  <I18nLink to="/properties" className="btn btn-white btn-main">
                    <i className="fas fa-home me-2"></i>
                    {t('tools:aiDesign.browseProperties')}
                  </I18nLink>
                  <I18nLink to="/contact" className="btn btn-outline-white">
                    <i className="fas fa-phone me-2"></i>
                    {t('tools:aiDesign.contactUs')}
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

export default AIDesignStudio;
