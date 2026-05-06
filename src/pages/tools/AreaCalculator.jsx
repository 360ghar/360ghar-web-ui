 import { useMemo, useState } from 'react';
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

 const AreaCalculator = () => {
     const { t } = useTranslation('tools');

     const AREA_CALCULATOR_FAQS = [
         { question: t('areaCalculator.faqs.q1.question'), answer: t('areaCalculator.faqs.q1.answer') },
         { question: t('areaCalculator.faqs.q2.question'), answer: t('areaCalculator.faqs.q2.answer') },
         { question: t('areaCalculator.faqs.q3.question'), answer: t('areaCalculator.faqs.q3.answer') },
         { question: t('areaCalculator.faqs.q4.question'), answer: t('areaCalculator.faqs.q4.answer') },
     ];

     const AREA_CALCULATOR_HOW_TO_STEPS = [
         { name: t('areaCalculator.howToSteps.step1.name'), text: t('areaCalculator.howToSteps.step1.text') },
         { name: t('areaCalculator.howToSteps.step2.name'), text: t('areaCalculator.howToSteps.step2.text') },
         { name: t('areaCalculator.howToSteps.step3.name'), text: t('areaCalculator.howToSteps.step3.text') },
         { name: t('areaCalculator.howToSteps.step4.name'), text: t('areaCalculator.howToSteps.step4.text') },
     ];

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
 
     return (
         <>
             <SEO
                title={t('areaCalculator.title')}
                description={t('areaCalculator.description')}
                keywords={t('areaCalculator.keywords')}
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
                     generateFaqStructuredData(AREA_CALCULATOR_FAQS),
                     generateHowToStructuredData({
                         name: 'How to Calculate Property Area',
                         description: 'Calculate carpet area, built-up area, and super built-up area step by step',
                         steps: AREA_CALCULATOR_HOW_TO_STEPS,
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
                             <div className="col-lg-10">
                                 <div className="row g-4">
                                     <div className="col-lg-5">
                                         <div className="calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                                             <h4 className="mb-4">{t('areaCalculator.enterPropertyDetails')}</h4>
                                             
                                             <div className="mb-3">
                                                 <label className="form-label">{t('areaCalculator.superBuiltupArea')}</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={superArea}
                                                     onChange={(e) => setSuperArea(Number(e.target.value))}
                                                 />
                                                 <small className="text-muted">{t('areaCalculator.superBuiltupHint')}</small>
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">{t('areaCalculator.loadingFactor')}</label>
                                                 <div className="d-flex align-items-center gap-2">
                                                     <input 
                                                         type="range" 
                                                         className="form-range flex-grow-1" 
                                                         min="15" 
                                                         max="50" 
                                                         value={loading}
                                                         onChange={(e) => setLoading(Number(e.target.value))}
                                                     />
                                                     <span className="fw-bold" style={{width: '50px'}}>{loading}%</span>
                                                 </div>
                                                 <small className="text-muted">{t('areaCalculator.loadingHint')}</small>
                                             </div>
                                         </div>
                                     </div>
 
                                     <div className="col-lg-7">
                                         <div className="results-card bg-white p-4 rounded-3 shadow-sm h-100">
                                             <h4 className="mb-4">{t('areaCalculator.areaBreakdown')}</h4>
                                             
                                             <div className="mb-4 p-3 rounded-3" style={{backgroundColor: '#fff5eb'}}>
                                                 <label className="text-success fw-bold small">{t('areaCalculator.estimatedCarpetArea')}</label>
                                                 <div className="display-6 fw-bold text-dark">{carpetArea} <span className="fs-5 text-muted">{t('areaCalculator.sqFt')}</span></div>
                                                 <div className="small text-muted mt-1">
                                                     {t('areaCalculator.carpetDesc')}
                                                 </div>
                                             </div>
 
                                             <div className="row g-3">
                                                 <div className="col-md-6">
                                                     <div className="p-3 bg-light rounded-3">
                                                         <label className="text-muted small fw-bold">{t('areaCalculator.builtUpArea')}</label>
                                                         <div className="fs-4 fw-bold">{builtUpArea} <span className="fs-6">{t('areaCalculator.sqFt')}</span></div>
                                                         <small className="text-muted">{t('areaCalculator.builtUpHint')}</small>
                                                     </div>
                                                 </div>
                                                 <div className="col-md-6">
                                                     <div className="p-3 bg-light rounded-3">
                                                         <label className="text-muted small fw-bold">{t('areaCalculator.commonArea')}</label>
                                                         <div className="fs-4 fw-bold">{superArea - carpetArea} <span className="fs-6">{t('areaCalculator.sqFt')}</span></div>
                                                         <small className="text-muted">{t('areaCalculator.commonAreaHint')}</small>
                                                     </div>
                                                 </div>
                                             </div>
                                         </div>
                                     </div>
                                 </div>
 
                                 <div className="mt-5">
                                     <h3 className="mb-3">{t('areaCalculator.understandingTerms')}</h3>
                                     <div className="row g-4">
                                         <div className="col-md-4">
                                             <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                 <h5 className="text-main">{t('areaCalculator.carpetAreaTitle')}</h5>
                                                 <p className="small mb-0">{t('areaCalculator.carpetAreaDesc')}</p>
                                             </div>
                                         </div>
                                         <div className="col-md-4">
                                             <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                 <h5 className="text-main">{t('areaCalculator.builtUpAreaTitle')}</h5>
                                                 <p className="small mb-0">{t('areaCalculator.builtUpAreaDesc')}</p>
                                             </div>
                                         </div>
                                         <div className="col-md-4">
                                             <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                 <h5 className="text-main">{t('areaCalculator.superBuiltUpAreaTitle')}</h5>
                                                 <p className="small mb-0">{t('areaCalculator.superBuiltUpAreaDesc')}</p>
                                             </div>
                                         </div>
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
 
 export default AreaCalculator;
