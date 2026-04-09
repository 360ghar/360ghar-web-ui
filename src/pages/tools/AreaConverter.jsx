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
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

 const AreaConverter = () => {
     const { t } = useTranslation('tools');
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
                        { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                        { name: toolSchemas.areaConverter.name, url: 'https://360ghar.com/area-converter' }
                    ])
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
                                 <div className="section-heading text-center mb-5">
                                     <h2 className="section-title">{t('areaConverter.headingTitle')}</h2>
                                     <p className="section-desc">
                                         {t('areaConverter.headingDesc')}
                                     </p>
                                 </div>
 
                                 <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                     <div className="row g-4 align-items-center">
                                         <div className="col-md-5">
                                             <label className="form-label">{t('areaConverter.from')}</label>
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
                                 </div>
 
                                 {/* Common Conversions Table */}
                                 <div className="mt-5">
                                     <h4 className="mb-4">{t('areaConverter.commonConversions')}</h4>
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
                                                     <td>2400 Sq. Ft.</td>
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
