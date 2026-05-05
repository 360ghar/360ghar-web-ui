import { useState } from 'react';
import { useTranslation } from 'react-i18next';
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
    question: 'Is this floor plan designer free?',
    answer: 'Yes, 360Ghar\'s 3D Blueprint Designer is completely free to use. Create as many floor plans as you need, experiment with layouts, and visualize your dream home in 3D — all from your browser without signing up.',
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
];

const DesignBlueprint = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const { t } = useTranslation('tools');

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
            { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
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
            {!isLoaded && (
              <div className="design-blueprint-loading" role="status" aria-live="polite">
                {t('designBlueprint.loading')}
              </div>
            )}

            <iframe
              className="design-blueprint-iframe"
              src={DESIGNER_SRC}
              title={t('designBlueprint.iframeTitle')}
              onLoad={() => setIsLoaded(true)}
              loading="lazy"
              allow="fullscreen; clipboard-read; clipboard-write"
            />
          </div>
        </section>

        <section className="padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8">
                <ToolFaq faqs={DESIGN_BLUEPRINT_FAQS} heading="3D Floor Planner — Frequently Asked Questions" />
                <ToolRelatedLinks
                  heading="Related Calculators & Tools"
                  links={[
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
