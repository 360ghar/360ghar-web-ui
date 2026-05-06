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

 const PropertyChecklist = () => {
     const { t } = useTranslation('tools');

     const PROPERTY_CHECKLIST_FAQS = [
         { question: t('propertyChecklist.faqs.q1.question'), answer: t('propertyChecklist.faqs.q1.answer') },
         { question: t('propertyChecklist.faqs.q2.question'), answer: t('propertyChecklist.faqs.q2.answer') },
         { question: t('propertyChecklist.faqs.q3.question'), answer: t('propertyChecklist.faqs.q3.answer') },
         { question: t('propertyChecklist.faqs.q4.question'), answer: t('propertyChecklist.faqs.q4.answer') },
     ];

     const PROPERTY_CHECKLIST_HOW_TO_STEPS = [
         { name: t('propertyChecklist.howToSteps.step1.name'), text: t('propertyChecklist.howToSteps.step1.text') },
         { name: t('propertyChecklist.howToSteps.step2.name'), text: t('propertyChecklist.howToSteps.step2.text') },
         { name: t('propertyChecklist.howToSteps.step3.name'), text: t('propertyChecklist.howToSteps.step3.text') },
         { name: t('propertyChecklist.howToSteps.step4.name'), text: t('propertyChecklist.howToSteps.step4.text') },
     ];

     const checklistData = {
         [t('propertyChecklist.catLegalDocuments')]: [
             { id: 1, text: t('propertyChecklist.docTitleDeed'), desc: t('propertyChecklist.docTitleDeedDesc') },
             { id: 2, text: t('propertyChecklist.docEncumbrance'), desc: t('propertyChecklist.docEncumbranceDesc') },
             { id: 3, text: t('propertyChecklist.docNAOrder'), desc: t('propertyChecklist.docNAOrderDesc') },
             { id: 4, text: t('propertyChecklist.docBuildingPlan'), desc: t('propertyChecklist.docBuildingPlanDesc') },
             { id: 5, text: t('propertyChecklist.docCompletion'), desc: t('propertyChecklist.docCompletionDesc') }
         ],
         [t('propertyChecklist.catFinancialTax')]: [
             { id: 6, text: t('propertyChecklist.docPropertyTax'), desc: t('propertyChecklist.docPropertyTaxDesc') },
             { id: 7, text: t('propertyChecklist.docKhata'), desc: t('propertyChecklist.docKhataDesc') },
             { id: 8, text: t('propertyChecklist.docNocBank'), desc: t('propertyChecklist.docNocBankDesc') },
             { id: 9, text: t('propertyChecklist.docNocSociety'), desc: t('propertyChecklist.docNocSocietyDesc') }
         ],
         [t('propertyChecklist.catAgreementRegistration')]: [
             { id: 10, text: t('propertyChecklist.docSaleAgreement'), desc: t('propertyChecklist.docSaleAgreementDesc') },
             { id: 11, text: t('propertyChecklist.docStampDuty'), desc: t('propertyChecklist.docStampDutyDesc') },
             { id: 12, text: t('propertyChecklist.docRegistration'), desc: t('propertyChecklist.docRegistrationDesc') },
             { id: 13, text: t('propertyChecklist.docPossession'), desc: t('propertyChecklist.docPossessionDesc') }
         ]
     };
 
     const [checkedItems, setCheckedItems] = useState(() => {
         const saved = localStorage.getItem('propertyChecklist');
         return saved ? JSON.parse(saved) : {};
     });
 
     const handleCheck = (id) => {
         const updated = { ...checkedItems, [id]: !checkedItems[id] };
         setCheckedItems(updated);
         localStorage.setItem('propertyChecklist', JSON.stringify(updated));
     };
 
     const calculateProgress = () => {
         const totalItems = Object.values(checklistData).flat().length;
         const checkedCount = Object.values(checkedItems).filter(Boolean).length;
         return Math.round((checkedCount / totalItems) * 100);
     };
 
     return (
         <>
             <SEO
                title={t('propertyChecklist.title')}
                description={t('propertyChecklist.description')}
                keywords={t('propertyChecklist.keywords')}
                 canonical="/property-document-checklist"
                 image={siteMetadata.defaultOgImage}
                 type="website"
                  structuredData={[
                     generateToolSchema(toolSchemas.propertyChecklist),
                     generateBreadcrumbStructuredData([
                         { name: 'Home', url: 'https://360ghar.com/' },
                         { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                         { name: toolSchemas.propertyChecklist.name, url: 'https://360ghar.com/property-document-checklist' }
                     ]),
                     generateFaqStructuredData(PROPERTY_CHECKLIST_FAQS),
                     generateHowToStructuredData({
                         name: 'How to Use the Property Document Checklist',
                         description: 'Track all documents needed for property purchase step by step',
                         steps: PROPERTY_CHECKLIST_HOW_TO_STEPS,
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
                                 
                                 {/* Progress Bar */}
                                 <div className="mb-5 bg-white p-4 rounded-3 shadow-sm sticky-top" style={{top: '90px', zIndex: 90}}>
                                     <div className="d-flex justify-content-between mb-2">
                                         <span className="fw-bold">{t('propertyChecklist.yourProgress')}</span>
                                         <span className="fw-bold text-main">{calculateProgress()}{t('propertyChecklist.completed')}</span>
                                     </div>
                                     <div className="progress" style={{height: '10px'}}>
                                         <div 
                                             className="progress-bar bg-main" 
                                             role="progressbar" 
                                             style={{width: `${calculateProgress()}%`}}
                                         ></div>
                                     </div>
                                 </div>
 
                                 {Object.entries(checklistData).map(([category, items]) => (
                                     <div key={category} className="mb-4">
                                         <h3 className="mb-3 fs-4 fw-bold text-dark border-start border-4 border-main ps-3">
                                             {category}
                                         </h3>
                                         <div className="bg-white rounded-3 shadow-sm overflow-hidden">
                                             {items.map((item) => (
                                                 <div 
                                                     key={item.id} 
                                                     className={`p-3 border-bottom d-flex gap-3 align-items-start ${checkedItems[item.id] ? 'bg-light' : ''}`}
                                                 >
                                                     <div className="pt-1">
                                                         <input 
                                                             type="checkbox" 
                                                             className="form-check-input fs-5"
                                                             style={{cursor: 'pointer'}}
                                                             checked={!!checkedItems[item.id]}
                                                             onChange={() => handleCheck(item.id)}
                                                         />
                                                     </div>
                                                     <div>
                                                         <h5 className={`mb-1 fs-6 ${checkedItems[item.id] ? 'text-decoration-line-through text-muted' : ''}`}>
                                                             {item.text}
                                                         </h5>
                                                         <p className="small text-muted mb-0">{item.desc}</p>
                                                     </div>
                                                 </div>
                                             ))}
                                         </div>
                                     </div>
                                 ))}
 
                                 <div className="mt-5 p-4 bg-info bg-opacity-10 rounded-3 border border-info">
                                     <h5 className="text-info-emphasis"><i className="fas fa-info-circle me-2"></i>{t('propertyChecklist.noteTitle')}</h5>
                                     <p className="mb-0 small text-dark">
                                         {t('propertyChecklist.noteDesc')}
                                     </p>
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
 
 export default PropertyChecklist;
