import { useMemo, useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks, ToolInfoCard, ToolComparisonTable } from '../../components/tools/ToolContentSections';

const AREA_CALCULATOR_FAQS = [
  {
    question: 'What is carpet area?',
    answer: 'Carpet area is the actual usable floor area inside your apartment — the area on which you can lay a carpet. It includes bedrooms, living room, kitchen, bathrooms, and balconies (at 50% as per RERA). It does NOT include walls, common areas, or lifts. RERA mandates that builders must disclose carpet area as the basis for pricing.',
  },
  {
    question: 'What is the difference between carpet area, built-up area, and super built-up area?',
    answer: 'Carpet area is usable space inside the flat. Built-up area = carpet area + walls + balcony (typically 15-20% more than carpet). Super built-up area = built-up area + proportionate share of common areas (lobby, lift, staircase, club) — this is what builders quote. The difference between super built-up and carpet is called the "loading factor".',
  },
  {
    question: 'What is loading factor in real estate?',
    answer: 'Loading factor is the percentage difference between super built-up area and carpet area. In Gurugram, typical loading is 25-35% for apartments. For example, if a flat is quoted at 1,500 sq ft super area with 30% loading, the actual carpet area is about 1,050 sq ft. RERA requires sale based on carpet area, but many markets still quote super area.',
  },
  {
    question: 'How is RERA carpet area different from the old carpet area definition?',
    answer: 'Under RERA (2016), carpet area includes the net usable floor area plus exclusive balcony/verandah area at 50% and exclusive open terrace area at 50%. The older definition excluded balconies entirely. This means RERA carpet area is slightly higher than the old carpet area, giving buyers a fairer measurement.',
  },
  {
    question: 'How do I calculate carpet area from super built-up area?',
    answer: 'Carpet Area = Super Built-up Area × ((100 - Loading %) / 100). For example, a 1,500 sq ft super area flat with 30% loading: 1,500 × 0.70 = 1,050 sq ft carpet area. Use our calculator above — just enter the super area and loading percentage to get instant results.',
  },
  {
    question: 'What is a good loading percentage?',
    answer: 'For apartments: 25-30% is standard, 30-35% is on the higher side, above 35% is excessive. For independent floors/villas: 15-20% loading is typical. Lower loading means more usable space for the same quoted area. Always compare carpet area, not super built-up, when evaluating property value.',
  },
  {
    question: 'Why do builders quote super built-up area?',
    answer: 'Builders quote super built-up area because it is a larger number that makes the per-sq-ft price appear lower. For example, ₹10,000/sq ft on super area (1,500 sq ft = ₹1.5 Cr) vs ₹14,285/sq ft on carpet area (1,050 sq ft = ₹1.5 Cr) — same total price, but the per-unit rate looks cheaper. RERA mandates carpet-area-based pricing.',
  },
];

const HOW_TO_STEPS = [
  { name: 'Enter Super Built-up Area', text: 'Input the total super built-up area quoted by the builder (in sq ft). This is usually the area mentioned in brochures and marketing materials.' },
  { name: 'Set Loading Percentage', text: 'Enter the loading factor — typically 25-35% for apartments in Gurugram/Delhi NCR. Check the builder agreement or ask the sales team for the exact loading.' },
  { name: 'Review Calculated Areas', text: 'The calculator instantly shows carpet area and built-up area. Carpet area is your actual usable space; built-up area adds walls and balcony at ~15%.' },
  { name: 'Compare Value Across Properties', text: 'Use the carpet area to compare per-sq-ft value across properties. A 1,500 sq ft flat with 30% loading (1,050 carpet) at ₹1.5 Cr costs ₹14,285/sq ft carpet — more useful than the ₹10,000/sq ft super rate.' },
];

const LOADING_TABLE = {
  title: 'Typical Loading Factor by Property Type (Gurugram / Delhi NCR)',
  headers: ['Property Type', 'Loading Range', 'Example: 1500 sq ft Super Area → Carpet'],
  rows: [
    ['High-rise Apartment', '25-35%', '975 - 1,125 sq ft'],
    ['Low-rise Apartment', '20-30%', '1,050 - 1,200 sq ft'],
    ['Independent Floor', '15-20%', '1,200 - 1,275 sq ft'],
    ['Villa', '10-15%', '1,275 - 1,350 sq ft'],
    ['Penthouse', '20-25%', '1,125 - 1,200 sq ft'],
  ],
};

const CONVERSION_TABLE = {
  title: 'Carpet Area to Built-up Area Conversion (Quick Reference)',
  headers: ['Carpet Area (sq ft)', 'Built-up Area (~15%)', 'Super Area at 30% Loading', 'Super Area at 35% Loading'],
  rows: [
    ['500', '575', '714', '769'],
    ['750', '863', '1,071', '1,154'],
    ['1,000', '1,150', '1,429', '1,538'],
    ['1,200', '1,380', '1,714', '1,846'],
    ['1,500', '1,725', '2,143', '2,308'],
    ['2,000', '2,300', '2,857', '3,077'],
    ['2,500', '2,875', '3,571', '3,846'],
    ['3,000', '3,450', '4,286', '4,615'],
  ],
};

const AreaCalculator = () => {
  const [superArea, setSuperArea] = useState(1000);
  const [loading, setLoading] = useState(30);
  const { carpetArea, builtUpArea } = useMemo(() => {
    const calculatedCarpet = superArea * ((100 - loading) / 100);
    const calculatedBuiltUp = calculatedCarpet * 1.15;

    return {
      carpetArea: Math.round(calculatedCarpet),
      builtUpArea: Math.min(Math.round(calculatedBuiltUp), superArea),
    };
  }, [superArea, loading]);

  const faqStructuredData = generateFaqStructuredData(AREA_CALCULATOR_FAQS);
  const howToStructuredData = generateHowToStructuredData({
    name: 'How to Calculate Carpet Area from Super Built-up Area',
    description: 'Step-by-step guide to determine actual usable carpet area from the quoted super built-up area and loading factor.',
    steps: HOW_TO_STEPS,
  });

  return (
    <>
      <SEO
        title="Carpet Area Calculator Gurgaon | RERA Area Calculator Haryana | 360Ghar"
        description="Free carpet area calculator for Indian real estate. Convert super built-up area to RERA carpet area instantly. Includes loading factor chart, conversion table, and worked examples for Gurugram & Delhi NCR flats."
        keywords="carpet area calculator India, super built up area vs carpet area, RERA area calculator, loading factor calculator, apartment area calculator, flat size calculator, carpet area to built up area, 360ghar tools"
        canonical="/area-calculator"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={[
          generateToolSchema(toolSchemas.areaCalculator),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
            { name: toolSchemas.areaCalculator.name, url: 'https://360ghar.com/area-calculator' }
          ]),
          faqStructuredData,
          howToStructuredData,
        ]}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header />

        <section className="padding-y-50">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {/* Hero heading for SEO */}
                <div className="text-center mb-4">
                  <h1>Carpet Area Calculator — RERA Compliant (2026)</h1>
                  <p className="text-muted">
                    Calculate actual usable carpet area from super built-up area. Understand loading factor and compare real value across properties in Gurugram &amp; Delhi NCR.
                  </p>
                </div>

                <div className="row g-4">
                  <div className="col-lg-6">
                    <div className="calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                      <h4 className="mb-4">Calculate Carpet Area</h4>

                      <div className="mb-3">
                        <label className="form-label">Super Built-up Area (sq ft)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={superArea}
                          onChange={(e) => setSuperArea(Number(e.target.value))}
                        />
                      </div>

                      <div className="mb-3">
                        <label className="form-label">Loading Factor (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={loading}
                          min="0"
                          max="60"
                          onChange={(e) => setLoading(Number(e.target.value))}
                        />
                        <small className="text-muted">Typical: 25-35% for apartments in Gurugram</small>
                      </div>
                    </div>
                  </div>

                  <div className="col-lg-6">
                    <div className="bg-main text-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column justify-content-center text-center">
                      <h3 className="text-white mb-3">Your Results</h3>

                      <div className="mb-3">
                        <small className="d-block opacity-75">Carpet Area (Usable Space)</small>
                        <div className="display-5 fw-bold text-white">{carpetArea.toLocaleString('en-IN')} sq ft</div>
                      </div>

                      <div className="border-top border-white opacity-50 my-3"></div>

                      <div className="row">
                        <div className="col-6">
                          <small className="d-block opacity-75">Built-up Area</small>
                          <span className="fs-5 fw-bold">{builtUpArea.toLocaleString('en-IN')} sq ft</span>
                        </div>
                        <div className="col-6">
                          <small className="d-block opacity-75">Loading</small>
                          <span className="fs-5 fw-bold">{loading}%</span>
                        </div>
                      </div>

                      <div className="mt-4 pt-3">
                        <p className="small opacity-75 mb-0">
                          * Built-up area includes carpet + walls + balcony (~15%). RERA mandates sale based on carpet area.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* What is Carpet Area */}
                <ToolInfoCard title="Carpet Area vs Built-up Area vs Super Built-up Area — Explained">
                  <p>
                    <strong>Carpet area</strong> is the net usable floor area inside your home — the space you actually live in.
                    Under <strong>RERA (2016)</strong>, it includes exclusive balcony at 50% and open terrace at 50%.
                    Builders must price properties based on carpet area, not super area.
                  </p>
                  <p>
                    <strong>Built-up area</strong> = carpet area + thickness of inner walls + exclusive balcony (full).
                    Typically 15-20% more than carpet area.
                  </p>
                  <p>
                    <strong>Super built-up area</strong> = built-up area + proportionate share of common areas
                    (lobby, lift, staircase, clubhouse, garden). This is the number builders traditionally quote.
                    The difference between super and carpet is the <strong>loading factor</strong>.
                  </p>
                </ToolInfoCard>

                {/* Loading factor table */}
                <ToolComparisonTable {...LOADING_TABLE} />

                {/* Quick conversion table */}
                <ToolComparisonTable {...CONVERSION_TABLE} />

                {/* FAQ */}
                <ToolFaq faqs={AREA_CALCULATOR_FAQS} heading="Carpet Area Calculator — Frequently Asked Questions" />

                {/* Related Tools */}
                <ToolRelatedLinks
                  heading="Related Calculators & Tools"
                  links={[
                    { to: '/area-converter', label: 'Area Unit Converter', icon: 'fas fa-exchange-alt' },
                    { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                    { to: '/loan-eligibility-calculator', label: 'Loan Eligibility Calculator', icon: 'fas fa-university' },
                    { to: '/capital-gains-tax-calculator', label: 'Capital Gains Tax Calculator', icon: 'fas fa-receipt' },
                    { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-stamp' },
                    { to: '/blog', label: 'Real Estate Blog', icon: 'fas fa-blog' },
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

export default AreaCalculator;
