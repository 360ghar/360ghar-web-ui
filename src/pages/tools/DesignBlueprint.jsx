import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';


import './DesignBlueprint.css';

const DESIGNER_SRC = '/blueprint3d/index.html';

const DESIGN_BLUEPRINT_HOW_TO_STEPS = [
  { name: 'Open the 3D floor plan designer', text: 'Launch the Blueprint Designer in your browser. No signup or download is required.' },
  { name: 'Draw walls and rooms', text: 'Click on the 2D grid to draw walls and define room layouts with precise measurements.' },
  { name: 'Add furniture and doors', text: 'Drag furniture items, doors, and windows from the sidebar catalog into your floor plan.' },
  { name: 'Switch to 3D view to preview', text: 'Toggle to the 3D view to walk through your design and visualize proportions from any angle.' },
];

const DESIGN_BLUEPRINT_FAQS = [
  {
    question: 'What is a 3D floor planner?',
    answer: 'A 3D floor planner is a tool that lets you create 2D floor plans and instantly visualize them in 3D. You can draw room layouts, add furniture, doors, and windows, then walk through the design in a 3D view. 360Ghar\'s floor planner is free and works in your browser — no download required.',
  },
  {
    question: 'How do I create a floor plan for my Indian home?',
    answer: '1) Open the designer above, 2) Click on the 2D grid to draw walls and rooms, 3) Add doors and windows by dragging from the sidebar, 4) Place furniture items (beds, sofa, kitchen counter) from the catalog, 5) Switch to 3D view to see your plan from any angle. The tool supports metric measurements in feet and meters.',
  },
  {
    question: 'Can I design according to Vastu Shastra?',
    answer: 'The floor planner lets you orient rooms as needed for Vastu compliance. For a full Vastu analysis, design your floor plan here and then use our free AI Vastu Checker to upload the plan and get a Vastu score with room-by-room recommendations.',
  },
  {
    question: 'What is the difference between 2D and 3D floor plans?',
    answer: 'A 2D floor plan is a top-down view showing room dimensions, walls, and layout — like a map. A 3D floor plan renders the same layout as a three-dimensional model you can rotate and walk through. 3D plans help you visualize proportions, lighting, and furniture placement much better than 2D alone.',
  },
  {
    question: 'Can I export my floor plan design?',
    answer: 'Yes, the Blueprint3D tool allows you to export your design. You can save the floor plan data as JSON and share it with your architect or interior designer. This makes it easy to communicate your exact layout preferences during the construction or renovation planning phase.',
  },
  {
    question: 'Is the 3D design tool free to use?',
    answer: 'Yes, 360Ghar\'s 3D Blueprint Designer is completely free. There are no hidden charges, premium tiers, or feature restrictions. You can create unlimited floor plans, experiment with furniture placement, and visualize your home in 3D — all without signing up or downloading any software.',
  },
];

const DesignBlueprint = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  // AUDIT FIX (3.6): error state with retry when the iframe fails to load.
  const [hasError, setHasError] = useState(false);
  const [retryKey, setRetryKey] = useState(0);
  const loadTimeoutRef = useRef(null);
  const isLoadedRef = useRef(false);
  const { t } = useTranslation('tools');

  // Keep a ref of isLoaded so the timeout callback can read the latest value
  // without re-subscribing the effect (avoids setState-in-effect).
  useEffect(() => {
    isLoadedRef.current = isLoaded;
  }, [isLoaded]);

  // AUDIT FIX (3.6): if the iframe doesn't fire onLoad within 15s, show a
  // fallback error state with a retry button instead of an infinite spinner.
  useEffect(() => {
    loadTimeoutRef.current = setTimeout(() => {
      if (!isLoadedRef.current) setHasError(true);
    }, 15000);
    return () => {
      if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    };
  }, [retryKey]);

  const handleRetry = () => {
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    isLoadedRef.current = false;
    setIsLoaded(false);
    setHasError(false);
    setRetryKey((k) => k + 1);
  };

  const handleIframeLoad = () => {
    isLoadedRef.current = true;
    if (loadTimeoutRef.current) clearTimeout(loadTimeoutRef.current);
    setIsLoaded(true);
  };

  const faqStructuredData = generateFaqStructuredData(DESIGN_BLUEPRINT_FAQS);

  return (
    <>
      <SEO
        title={t('designBlueprint.title')}
        description={t('designBlueprint.description')}
        keywords={t('designBlueprint.keywords')}
        canonical="/design-blueprint"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={[
          generateToolSchema(toolSchemas.designBlueprint),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/tools' },
            { name: toolSchemas.designBlueprint.name, url: 'https://360ghar.com/design-blueprint' }
          ]),
          generateHowToStructuredData({
            name: 'How to Design a 3D Floor Plan',
            description: 'Create a 2D floor plan with walls, rooms, and furniture, then visualize it in 3D using the free Blueprint Designer.',
            steps: DESIGN_BLUEPRINT_HOW_TO_STEPS,
          }),
          faqStructuredData,
        ]}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg design-blueprint-shell">
        <Header
          headerClass="dark-header has-border"
          logoBlack={false}
          logoWhite
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />

        <section className="padding-y-40">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                <div className="text-center mb-4">
                  <h1>Free 3D Floor Planner & Blueprint Designer India</h1>
                  <p className="text-muted">
                    Draw your 2D floor plan, add furniture and doors, then explore in 3D. Free, no signup — design your Indian home or Vastu-compliant layout.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="design-blueprint-content">
          <div className="design-blueprint-frame">
            {/* AUDIT FIX (3.6): fallback UI when the iframe fails to load */}
            {hasError ? (
              <div className="design-blueprint-loading" role="alert" style={{ flexDirection: 'column', gap: 16 }}>
                <i className="fas fa-exclamation-triangle" style={{ fontSize: 40, color: 'var(--warning-color)' }}></i>
                <p style={{ margin: 0 }}>{t('designBlueprint.loadError', 'The 3D designer could not be loaded. Please check your connection and try again.')}</p>
                <button type="button" className="btn btn-main" onClick={handleRetry}>
                  <i className="fas fa-redo me-2"></i>{t('designBlueprint.retry', 'Retry')}
                </button>
              </div>
            ) : (
              <>
                {!isLoaded && (
                  <div className="design-blueprint-loading" role="status" aria-live="polite">
                    {t('designBlueprint.loading')}
                  </div>
                )}

                <iframe
                  key={retryKey}
                  className="design-blueprint-iframe"
                  src={DESIGNER_SRC}
                  title={t('designBlueprint.iframeTitle')}
                  onLoad={handleIframeLoad}
                  onError={() => setHasError(true)}
                  loading="lazy"
                  allow="fullscreen; clipboard-read; clipboard-write"
                />
              </>
            )}
          </div>

          {/* AUDIT FIX (imp 3.7): one-click Vastu check after designing */}
          <div className="container mt-4 text-center">
            <I18nLink to="/vastu-checker" className="btn btn-outline-main">
              <i className="fas fa-compass me-2"></i>
              {t('designBlueprint.checkVastu', 'Check Vastu for Your Design')}
            </I18nLink>
          </div>
        </section>

        <section className="padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                {/* Benefits of 3D Floor Plan Design */}
                <div className="mt-4 p-4 bg-light rounded-3 border">
                  <h2 className="h5 mb-2">Benefits of 3D Floor Plan Design</h2>
                  <ul className="text-muted mb-0">
                    <li><strong>Visualize space before construction:</strong> Walk through your home layout in 3D to understand room proportions, corridor widths, and how each area connects — before a single brick is laid.</li>
                    <li><strong>Identify design flaws early:</strong> Spot awkward room shapes, poor furniture placement, or wasted space in the design phase when changes are inexpensive, rather than during construction when they are costly.</li>
                    <li><strong>Communicate with architects effectively:</strong> A 3D floor plan speaks a universal language. Share your design with architects, contractors, or interior designers to ensure everyone interprets the layout the same way.</li>
                    <li><strong>Estimate material costs:</strong> Accurate room dimensions from a floor plan help you estimate paint area, flooring tiles, and furniture sizes — leading to more precise budgeting for your home construction or renovation.</li>
                  </ul>
                </div>

                {/* Tips for Designing Your Home Layout */}
                <div className="mt-4 p-4 bg-light rounded-3 border">
                  <h2 className="h5 mb-2">Tips for Designing Your Home Layout</h2>
                  <ul className="text-muted mb-0">
                    <li><strong>Start with the plot dimensions:</strong> Input the exact boundary dimensions of your plot first. This ensures your floor plan fits within the available land and respects mandatory setbacks required by local building bylaws.</li>
                    <li><strong>Prioritize natural ventilation:</strong> Position living areas and bedrooms to receive cross-ventilation. In Indian climates, proper airflow reduces reliance on air conditioning and improves indoor comfort significantly.</li>
                    <li><strong>Plan for future expansion:</strong> Design your layout with flexibility in mind — leave provisions for an additional room, a terrace extension, or a modular kitchen upgrade as your family&rsquo;s needs evolve.</li>
                    <li><strong>Consider Vastu principles if applicable:</strong> If Vastu compliance matters to you, plan the placement of the main entrance, kitchen, bedrooms, and toilets according to Vastu guidelines. After designing your floor plan here, use our free <a href="/vastu-checker">AI Vastu Checker</a> to validate it.</li>
                  </ul>
                </div>

                <ToolFaq faqs={DESIGN_BLUEPRINT_FAQS} heading="3D Floor Planner — Frequently Asked Questions" />
                <ToolRelatedLinks
                  heading="Related Calculators & Tools"
                  links={[
                    { to: '/ai-design-studio', label: 'AI Design Studio', icon: 'fas fa-wand-magic-sparkles' },
                    { to: '/vastu-checker', label: 'AI Vastu Checker', icon: 'fas fa-compass' },
                    { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                    { to: '/area-converter', label: 'Area Unit Converter', icon: 'fas fa-exchange-alt' },
                    { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                    { to: '/property-document-checklist', label: 'Property Document Checklist', icon: 'fas fa-clipboard-list' },
                  ]}
                />
              </div>
            </div>
          </div>
        </section>

        <Cta ctaClass="" />
        <Footer />
      </main>
    </>
  );
};

export default DesignBlueprint;
