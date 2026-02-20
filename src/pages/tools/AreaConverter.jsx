 import React, { useState, useEffect, useMemo } from 'react'; // eslint-disable-line no-unused-vars
 import Header from '../../common/Header';
 import Footer from '../../common/Footer';
 import MobileMenu from '../../common/MobileMenu';
 import OffCanvas from '../../common/OffCanvas';
 import PageTitle from '../../common/PageTitle';
 import SEO from '../../common/SEO';
 import Cta from '../../components/ui/Cta';
 import { siteMetadata } from '../../seo/siteMetadata';
 import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
 
 const AreaConverter = () => {
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
                title="Land Area Converter India | Sq Ft, Gaj, Bigha, Acre Converter | 360Ghar"
                description="Convert land area units instantly. Support for Sq Ft, Sq Yard (Gaj), Bigha, Acre, Hectare, Guntha, and more. Essential tool for buying land or plots in India."
                keywords="land area converter India, sq ft to gaj converter, bigha to sq ft, acre to hectare converter, plot size converter, real estate unit converter, 360ghar tools, land measurement India"
                 canonical="/area-converter"
                 image={siteMetadata.defaultOgImage}
                 type="website"
                 structuredData={generateToolSchema(
                     toolSchemas.areaConverter.name,
                     toolSchemas.areaConverter.description,
                     toolSchemas.areaConverter.keywords,
                     toolSchemas.areaConverter.category
                 )}
             />
             <PageTitle
                 title="Land Area Unit Converter - Indian Real Estate Calculator | 360Ghar"
                 description="Instantly convert between different land measurement units used in Indian real estate including Gaj, Bigha, Kanal, Marla, Acre, and Square Feet."
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
                                     <h2 className="section-title">Land Area Converter</h2>
                                     <p className="section-desc">
                                         Compare properties easily by converting between local and standard measurement units.
                                     </p>
                                 </div>
 
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
 
                                 {/* Common Conversions Table */}
                                 <div className="mt-5">
                                     <h4 className="mb-4">Common Conversions</h4>
                                     <div className="table-responsive">
                                         <table className="table table-bordered table-striped bg-white">
                                             <thead>
                                                 <tr>
                                                     <th>Unit</th>
                                                     <th>Equivalent in Sq. Feet</th>
                                                     <th>Equivalent in Sq. Yards</th>
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
