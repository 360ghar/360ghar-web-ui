 import React, { useState, useEffect, useMemo } from 'react'; // eslint-disable-line no-unused-vars
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

import { ToolFaq, ToolRelatedLinks, ToolComparisonTable } from '../../components/tools/ToolContentSections';

import './AreaConverter.scss';

 const AreaConverter = () => {
     const { t } = useTranslation('tools');

     const AREA_CONVERTER_FAQS = [
         { question: t('areaConverter.faqs.q1.question'), answer: t('areaConverter.faqs.q1.answer') },
         { question: t('areaConverter.faqs.q2.question'), answer: t('areaConverter.faqs.q2.answer') },
         { question: t('areaConverter.faqs.q3.question'), answer: t('areaConverter.faqs.q3.answer') },
         { question: t('areaConverter.faqs.q4.question'), answer: t('areaConverter.faqs.q4.answer') },
         { question: t('areaConverter.faqs.q5.question'), answer: t('areaConverter.faqs.q5.answer') },
         { question: t('areaConverter.faqs.q6.question'), answer: t('areaConverter.faqs.q6.answer') },
         { question: t('areaConverter.faqs.q7.question'), answer: t('areaConverter.faqs.q7.answer') },
         { question: t('areaConverter.faqs.q8.question'), answer: t('areaConverter.faqs.q8.answer') },
         { question: t('areaConverter.faqs.q9.question'), answer: t('areaConverter.faqs.q9.answer') },
     ];

     const AREA_CONVERTER_HOW_TO_STEPS = [
         { name: t('areaConverter.howToSteps.step1.name'), text: t('areaConverter.howToSteps.step1.text') },
         { name: t('areaConverter.howToSteps.step2.name'), text: t('areaConverter.howToSteps.step2.text') },
         { name: t('areaConverter.howToSteps.step3.name'), text: t('areaConverter.howToSteps.step3.text') },
         { name: t('areaConverter.howToSteps.step4.name'), text: t('areaConverter.howToSteps.step4.text') },
     ];

     const [amount, setAmount] = useState(1);
     const [fromUnit, setFromUnit] = useState('sq_ft');
     const [toUnit, setToUnit] = useState('sq_yard');
     const [result, setResult] = useState(0);

     // Conversion rates to Square Feet (Base Unit)
     const conversionRates = useMemo(() => ({
         sq_ft: 1,
         sq_mt: 10.7639,
         sq_yd: 9,
         acre: 43560,
         hectare: 107639,
         gaj: 9,
         bigha: 27000, // Approximate standard, varies by region
         guntha: 1089,
         ground: 2400,
         cent: 435.6,
         kanal: 5445,
         marla: 272.25
     }), []);

     const unitLabels = {
         sq_ft: t('areaConverter.sqFt'),
         sq_mt: t('areaConverter.sqMt'),
         sq_yd: t('areaConverter.sqYd'),
         acre: t('areaConverter.acre'),
         hectare: t('areaConverter.hectare'),
         gaj: t('areaConverter.gaj'),
         bigha: t('areaConverter.bigha'),
         guntha: t('areaConverter.guntha'),
         ground: t('areaConverter.ground'),
         cent: t('areaConverter.cent'),
         kanal: t('areaConverter.kanal'),
         marla: t('areaConverter.marla')
     };

     useEffect(() => {
         const convert = () => {
             const inSqFt = amount * conversionRates[fromUnit];
             const finalValue = inSqFt / conversionRates[toUnit];
             setResult(finalValue);
         };
         convert();
     }, [amount, fromUnit, toUnit, conversionRates]);

     const handleSwap = () => {
         setFromUnit(toUnit);
         setToUnit(fromUnit);
     };

     return (
         <>
             <SEO
                title={t('areaConverter.title')}
                description={t('areaConverter.description')}
                keywords={t('areaConverter.keywords')}
                 canonical="/area-converter"
                 image={siteMetadata.defaultOgImage}
                 type="website"
                 structuredData={[
                     generateToolSchema(toolSchemas.areaConverter),
                     generateBreadcrumbStructuredData([
                         { name: 'Home', url: 'https://360ghar.com/' },
                         { name: 'Tools', url: 'https://360ghar.com/tools' },
                         { name: toolSchemas.areaConverter.name, url: 'https://360ghar.com/area-converter' }
                     ]),
                     generateFaqStructuredData(AREA_CONVERTER_FAQS),
                     generateHowToStructuredData({
                         name: 'How to Use the Area Converter',
                         description: 'Convert between Indian and international area units step by step',
                         steps: AREA_CONVERTER_HOW_TO_STEPS,
                     }),
                  ]}
             />

             <OffCanvas />
             <MobileMenu />

             <main className="body-bg">
                 <Header />

                 <section className="padding-y-50">
                     <div className="container">
                         <div className="row justify-content-center">
                             <div className="col-lg-8">
                                 <div className="area-conv-hero">
                                     <h1>{t('areaConverter.heroTitle')}</h1>
                                     <p>{t('areaConverter.heroDesc')}</p>
                                 </div>

                                 <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                     <div className="row g-4 align-items-center">
                                         <div className="col-md-5">
                                             <label className="form-label">{t('areaConverter.from')}</label>
                                             <input
                                                 type="number"
                                                 className="form-control mb-2"
                                                 value={amount}
                                                 onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
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
                                                 title={t('areaConverter.swapUnits')}
                                             >
                                                 <i className="fas fa-exchange-alt"></i>
                                             </button>
                                         </div>

                                         <div className="col-md-5">
                                             <label className="form-label">{t('areaConverter.to')}</label>
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

                                     {/* AUDIT FIX (imp 3.3): visual comparison of the two area units */}
                                     {amount > 0 && (
                                         <div className="mt-4 p-3 bg-light rounded-3">
                                             <h6 className="mb-3">{t('areaConverter.visualComparison', 'Visual Comparison')}</h6>
                                             {(() => {
                                                 const fromVal = amount;
                                                 const toVal = parseFloat(result.toFixed(4));
                                                 const max = Math.max(fromVal, toVal, 0.0001);
                                                 const fromPct = Math.max((fromVal / max) * 100, 2);
                                                 const toPct = Math.max((toVal / max) * 100, 2);
                                                 return (
                                                     <>
                                                         <div className="mb-2">
                                                             <div className="d-flex justify-content-between small text-muted mb-1">
                                                                 <span>{fromVal} {unitLabels[fromUnit]}</span>
                                                             </div>
                                                             <div style={{ height: 18, background: '#fff', borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border-color-light)' }}>
                                                                 <div style={{ width: `${fromPct}%`, height: '100%', background: 'var(--main-color)' }}></div>
                                                             </div>
                                                         </div>
                                                         <div>
                                                             <div className="d-flex justify-content-between small text-muted mb-1">
                                                                 <span>{toVal} {unitLabels[toUnit]}</span>
                                                             </div>
                                                             <div style={{ height: 18, background: '#fff', borderRadius: 9, overflow: 'hidden', border: '1px solid var(--border-color-light)' }}>
                                                                 <div style={{ width: `${toPct}%`, height: '100%', background: 'var(--cta-color)' }}></div>
                                                             </div>
                                                         </div>
                                                     </>
                                                 );
                                             })()}
                                         </div>
                                     )}
                                 </div>

                                 {/* Common Conversions Table */}
                                 <div className="mt-5">
                                     <h2 className="h4 mb-4">{t('areaConverter.commonConversions')}</h2>
                                     <div className="table-responsive">
                                         <table className="table table-bordered table-striped bg-white">
                                             <thead>
                                                 <tr>
                                                     <th>{t('areaConverter.unitCol')}</th>
                                                     <th>{t('areaConverter.sqFeetCol')}</th>
                                                     <th>{t('areaConverter.sqYardsCol')}</th>
                                                 </tr>
                                             </thead>
                                             <tbody>
                                                 <tr>
                                                     <td>1 Square Meter</td>
                                                     <td>10.76 Sq. Ft.</td>
                                                     <td>1.20 Sq. Yd.</td>
                                                 </tr>
                                                 <tr>
                                                     <td>1 Square Yard (Gaj)</td>
                                                     <td>9 Sq. Ft.</td>
                                                     <td>1 Sq. Yd.</td>
                                                 </tr>
                                                 <tr>
                                                     <td>1 Ground</td>
                                                     <td>2,400 Sq. Ft.</td>
                                                     <td>266.67 Sq. Yd.</td>
                                                 </tr>
                                                 <tr>
                                                     <td>1 Acre</td>
                                                     <td>43,560 Sq. Ft.</td>
                                                     <td>4,840 Sq. Yd.</td>
                                                 </tr>
                                                 <tr>
                                                     <td>1 Hectare</td>
                                                     <td>1,07,639 Sq. Ft.</td>
                                                     <td>11,960 Sq. Yd.</td>
                                                 </tr>
                                                 <tr>
                                                     <td>1 Guntha</td>
                                                     <td>1,089 Sq. Ft.</td>
                                                     <td>121 Sq. Yd.</td>
                                                 </tr>
                                             </tbody>
                                         </table>
                                     </div>
                                 </div>

                                 <div className="area-conv-content-section">
                                     <h2>{t('areaConverter.gajToAcreTitle')}</h2>
                                     <p>{t('areaConverter.gajToAcreDesc')}</p>
                                 </div>

                                 <div className="area-conv-content-section">
                                     <h2>{t('areaConverter.sqFtToGajTitle')}</h2>
                                     <p>{t('areaConverter.sqFtToGajDesc')}</p>
                                 </div>

                                 {/* Why Convert Area Units? - Educational Section */}
                                 <div className="area-conv-content-section">
                                     <h2>Why Convert Area Units?</h2>
                                     <p>
                                         India uses multiple measurement systems for land and property — the standard metric system (square meters, hectares), imperial units (square feet, acres), and a wide range of regional units such as <strong>Bigha, Guntha, Ground, Cent, Kanal, and Marla</strong>. A property listed as &ldquo;2 Bigha&rdquo; in Rajasthan means something very different from &ldquo;2 Bigha&rdquo; in Punjab, making unit conversion essential when comparing properties across states.
                                     </p>
                                     <p>
                                         The <strong>Real Estate (Regulation and Development) Act (RERA)</strong> mandates the use of <strong>square feet</strong> for all official property documentation, sale agreements, and registered brochures. However, traditional units are still widely used in local dealings, village records, and agricultural land transactions. Understanding how to convert between these units helps buyers, sellers, and investors make informed decisions and avoid costly misunderstandings.
                                     </p>
                                     <p>
                                         Different states have their own traditional units — for example, <strong>Ground</strong> is common in Tamil Nadu, <strong>Cent</strong> in Kerala and Andhra Pradesh, and <strong>Marla/Kanal</strong> in Punjab and Jammu &amp; Kashmir. Whether you are comparing a residential plot in Gurugram (measured in square yards) with farmland in Maharashtra (measured in Guntha), or verifying property dimensions in a sale deed, this area converter helps you accurately translate between any two units instantly.
                                     </p>
                                 </div>

                                 {/* Common Indian Land Measurement Units Table */}
                                 <ToolComparisonTable
                                     title="Common Indian Land Measurement Units"
                                     headers={['Unit', 'Region', 'Sq Ft Equivalent', 'Sq M Equivalent']}
                                     rows={[
                                         ['1 Bigha', 'Rajasthan / UP', '27,000', '2,508'],
                                         ['1 Bigha', 'Punjab / Himachal Pradesh', '9,072', '843'],
                                         ['1 Guntha', 'Maharashtra / Karnataka', '1,089', '101'],
                                         ['1 Ground', 'Tamil Nadu', '2,400', '223'],
                                         ['1 Cent', 'Kerala / Andhra Pradesh', '435.6', '40.5'],
                                         ['1 Kanal', 'Punjab / J&K', '5,445', '506'],
                                         ['1 Marla', 'Punjab / J&K', '272.25', '25.3'],
                                         ['1 Acre', 'Pan-India', '43,560', '4,047'],
                                         ['1 Hectare', 'Pan-India (Metric)', '1,07,639', '10,000'],
                                     ]}
                                 />

                                 <ToolFaq faqs={AREA_CONVERTER_FAQS} heading={t('areaConverter.faqTitle')} />

                                 <ToolRelatedLinks
                                     heading="Related Calculators & Tools"
                                     links={[
                                         { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                                         { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                                         { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-file-invoice-dollar' },
                                         { to: '/loan-eligibility-calculator', label: 'Loan Eligibility', icon: 'fas fa-clipboard-check' },
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
