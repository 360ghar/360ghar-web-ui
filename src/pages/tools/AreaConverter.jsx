import { useState, useMemo } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks, ToolInfoCard } from '../../components/tools/ToolContentSections';

const AREA_CONVERTER_HOW_TO_STEPS = [
  { name: 'Select the unit to convert from', text: 'Choose the area unit you want to convert from the "From" dropdown, such as Square Feet, Gaj, Bigha, or Acre.' },
  { name: 'Enter the area value', text: 'Type the numeric area value you want to convert in the input field.' },
  { name: 'Select the target unit', text: 'Choose the area unit you want to convert to from the "To" dropdown.' },
  { name: 'View instant conversion results', text: 'The converted value appears instantly. Use the swap button to reverse the units.' },
];

const AREA_CONVERTER_FAQS = [
  {
    question: 'How many square feet are in 1 gaj?',
    answer: '1 Gaj (square yard) equals 9 square feet. So 100 gaj = 900 sq ft, 200 gaj = 1,800 sq ft, and 500 gaj = 4,500 sq ft. Gaj is the most commonly used land measurement unit in North India, especially in Haryana, Punjab, and Delhi NCR.',
  },
  {
    question: 'How many bigha in 1 acre?',
    answer: 'In Haryana and Punjab, 1 acre ≈ 4 bigha (where 1 bigha = 10,890 sq ft). In Rajasthan, 1 bigha varies: 1,618-2,500 sq ft depending on the district. In UP, 1 bigha ≈ 27,000 sq ft, so 1 acre ≈ 1.6 bigha. Always confirm the local bigha standard before land transactions.',
  },
  {
    question: 'What is the difference between gaj and square yard?',
    answer: 'Gaj and square yard are the same unit — both equal 9 square feet. "Gaj" is the Hindi term commonly used in North India, while "square yard" is the English term used in official documents and agreements. Both are used interchangeably in property listings in Gurugram and Delhi NCR.',
  },
  {
    question: 'How many square feet in 1 acre?',
    answer: '1 acre = 43,560 square feet = 4,840 square yards (gaj) = 100.04 cents. An acre is a standard land measurement unit used across India. For context, a standard cricket field is roughly 1.5-2 acres.',
  },
  {
    question: 'How many square feet in 1 marla?',
    answer: 'In Haryana and Punjab, 1 marla = 272.25 sq ft. In Rajasthan, 1 marla can vary from 225-300 sq ft. 20 marlas = 1 kanal, and 8 kanals = 1 acre. Marla and kanal are commonly used for residential plots in Panchkula, Chandigarh, and parts of Haryana.',
  },
  {
    question: 'What is a ground in land measurement?',
    answer: '1 ground = 2,400 sq ft, commonly used in Tamil Nadu and parts of South India. It is equivalent to 266.67 square yards. The term is not used in North India — in Gurugram/Delhi, land is measured in gaj, bigha, or acres.',
  },
];

const STATE_UNITS = [
  ['Haryana / Punjab', 'Gaj, Bigha, Kanal, Marla, Acre', '1 Bigha ≈ 10,890 sq ft; 1 Kanal = 5,445 sq ft'],
  ['Delhi NCR', 'Gaj, Bigha, Acre', '1 Bigha ≈ 10,890 sq ft; same as Haryana'],
  ['Rajasthan', 'Bigha, Biswa, Acre', '1 Bigha = 1,618-2,500 sq ft (varies by district)'],
  ['Uttar Pradesh', 'Bigha, Biswa, Acre', '1 Bigha ≈ 27,000 sq ft (larger than Haryana bigha)'],
  ['Maharashtra', 'Guntha, Acre, Hectare', '1 Guntha = 1,089 sq ft; 40 Gunthas = 1 Acre'],
  ['Tamil Nadu', 'Ground, Cent, Acre', '1 Ground = 2,400 sq ft; 1 Cent = 435.6 sq ft'],
  ['Gujarat', 'Bigha, Vigha, Acre', '1 Bigha ≈ 17,424 sq ft (Gujarat standard)'],
  ['Karnataka', 'Guntha, Acre, Hectare', '1 Guntha = 1,089 sq ft (same as Maharashtra)'],
];

const AreaConverter = () => {
  const [amount, setAmount] = useState(1);
  const [fromUnit, setFromUnit] = useState('sq_ft');
  const [toUnit, setToUnit] = useState('sq_yd');

  const conversionRates = useMemo(() => ({
    sq_ft: 1,
    sq_mt: 10.7639,
    sq_yd: 9,
    acre: 43560,
    hectare: 107639,
    gaj: 9,
    bigha: 27000,
    guntha: 1089,
    ground: 2400,
    cent: 435.6,
    kanal: 5445,
    marla: 272.25
  }), []);

  const unitLabels = {
    sq_ft: 'Square Feet (sq ft)',
    sq_mt: 'Square Meter (sq mt)',
    sq_yd: 'Square Yard (sq yd)',
    acre: 'Acre',
    hectare: 'Hectare',
    gaj: 'Gaj',
    bigha: 'Bigha',
    guntha: 'Guntha',
    ground: 'Ground',
    cent: 'Cent',
    kanal: 'Kanal',
    marla: 'Marla'
  };

  const result = useMemo(() => {
    const inSqFt = amount * conversionRates[fromUnit];
    return inSqFt / conversionRates[toUnit];
  }, [amount, fromUnit, toUnit, conversionRates]);

  const handleSwap = () => {
    setFromUnit(toUnit);
    setToUnit(fromUnit);
  };

  const faqStructuredData = generateFaqStructuredData(AREA_CONVERTER_FAQS);

  return (
    <>
      <SEO
        title="Area Converter Gurgaon | Gaj to Sq Ft, Bigha Converter Haryana | 360Ghar"
        description="Convert land area between Square Feet, Gaj (Sq Yard), Bigha, Acre, Hectare, Guntha, Kanal, Marla, and more. State-wise land measurement units for Haryana, Delhi, UP, Maharashtra, and Tamil Nadu. Free instant conversion."
        keywords="area converter India, sq ft to gaj converter, bigha to sq ft, acre to hectare converter, plot size converter, real estate unit converter, gaj to sq ft, 360ghar tools, land measurement India, kanal to marla"
        canonical="/area-converter"
        image={siteMetadata.defaultOgImage}
        type="website"
        structuredData={[
          generateToolSchema(toolSchemas.areaConverter),
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
            { name: toolSchemas.areaConverter.name, url: 'https://360ghar.com/area-converter' }
          ]),
          generateHowToStructuredData({
            name: 'How to Convert Area Units',
            description: 'Convert land area between Square Feet, Gaj, Bigha, Acre, and 12+ Indian units in seconds.',
            steps: AREA_CONVERTER_HOW_TO_STEPS,
          }),
          faqStructuredData,
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
                {/* Hero heading */}
                <div className="text-center mb-4">
                  <h1>India Land Area Unit Converter (2026)</h1>
                  <p className="text-muted">
                    Instantly convert between Square Feet, Gaj, Bigha, Acre, Hectare, and 12+ units used across Indian states.
                  </p>
                </div>

                <div className="row justify-content-center">
                  <div className="col-lg-8">
                    <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                      <div className="row g-4 align-items-center">
                        <div className="col-md-5">
                          <label className="form-label">From</label>
                          <input
                            type="number"
                            className="form-control mb-2"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            min="0"
                          />
                          <select
                            className="form-select"
                            value={fromUnit}
                            onChange={(e) => setFromUnit(e.target.value)}
                          >
                            {Object.keys(unitLabels).map((key) => (
                              <option key={key} value={key}>{unitLabels[key]}</option>
                            ))}
                          </select>
                        </div>

                        <div className="col-md-2 text-center pt-md-4">
                          <button
                            className="btn btn-outline-main rounded-circle p-2"
                            onClick={handleSwap}
                            title="Swap Units"
                          >
                            <i className="fas fa-exchange-alt"></i>
                          </button>
                        </div>

                        <div className="col-md-5">
                          <label className="form-label">To</label>
                          <div className="form-control mb-2 bg-light fw-bold text-main fs-5">
                            {parseFloat(result.toFixed(4))}
                          </div>
                          <select
                            className="form-select"
                            value={toUnit}
                            onChange={(e) => setToUnit(e.target.value)}
                          >
                            {Object.keys(unitLabels).map((key) => (
                              <option key={key} value={key}>{unitLabels[key]}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick reference table */}
                <div className="mt-5">
                  <h2 className="h4 mb-3">Common Area Conversions</h2>
                  <div className="table-responsive">
                    <table className="table table-bordered table-striped bg-white">
                      <thead>
                        <tr>
                          <th>Unit</th>
                          <th>Square Feet</th>
                          <th>Square Yards (Gaj)</th>
                          <th>Square Meters</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td>1 Square Yard (Gaj)</td><td>9</td><td>1</td><td>0.84</td></tr>
                        <tr><td>1 Square Meter</td><td>10.76</td><td>1.20</td><td>1</td></tr>
                        <tr><td>1 Marla</td><td>272.25</td><td>30.25</td><td>25.29</td></tr>
                        <tr><td>1 Guntha</td><td>1,089</td><td>121</td><td>101.17</td></tr>
                        <tr><td>1 Kanal</td><td>5,445</td><td>605</td><td>505.86</td></tr>
                        <tr><td>1 Ground</td><td>2,400</td><td>266.67</td><td>222.97</td></tr>
                        <tr><td>1 Bigha (Haryana)</td><td>10,890</td><td>1,210</td><td>1,011.71</td></tr>
                        <tr><td>1 Acre</td><td>43,560</td><td>4,840</td><td>4,046.86</td></tr>
                        <tr><td>1 Hectare</td><td>1,07,639</td><td>11,960</td><td>10,000</td></tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* State-wise measurement units */}
                <ToolInfoCard title="Land Measurement Units by State in India">
                  <p>India uses different land measurement units in each state. Always confirm the local standard before transactions.</p>
                  <div className="table-responsive mt-3">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>State</th>
                          <th>Common Units</th>
                          <th>Standard Conversion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STATE_UNITS.map(([state, units, note], idx) => (
                          <tr key={idx}>
                            <td className="fw-medium">{state}</td>
                            <td>{units}</td>
                            <td className="text-muted small">{note}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </ToolInfoCard>

                {/* FAQ */}
                <ToolFaq faqs={AREA_CONVERTER_FAQS} heading="Area Unit Conversion — Frequently Asked Questions" />

                {/* Related Tools */}
                <ToolRelatedLinks
                  heading="Related Calculators & Tools"
                  links={[
                    { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
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

export default AreaConverter;
