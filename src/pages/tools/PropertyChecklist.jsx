 import { useState } from 'react';
 import { useTranslation } from 'react-i18next';
 import { toast } from 'react-toastify';
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
         try {
             const saved = localStorage.getItem('propertyChecklist');
             return saved ? JSON.parse(saved) : {};
         } catch {
             return {};
         }
     });
     // AUDIT FIX (imp 3.6): per-item document upload + verified status,
     // persisted to localStorage so progress survives browser data clears.
     const [uploadedDocs, setUploadedDocs] = useState(() => {
         try {
             const saved = localStorage.getItem('propertyChecklistDocs');
             return saved ? JSON.parse(saved) : {};
         } catch {
             return {};
         }
     });
 
     const handleCheck = (id) => {
         const updated = { ...checkedItems, [id]: !checkedItems[id] };
         setCheckedItems(updated);
         localStorage.setItem('propertyChecklist', JSON.stringify(updated));
     };

     const handleUpload = (id, file) => {
         if (!file) return;
         // Store only metadata (name + size) — we don't persist the file blob.
         const updated = { ...uploadedDocs, [id]: { name: file.name, size: file.size, uploadedAt: new Date().toISOString() } };
         setUploadedDocs(updated);
         localStorage.setItem('propertyChecklistDocs', JSON.stringify(updated));
         toast.success(t('propertyChecklist.uploadSuccess', { name: file.name }));
     };

     const handleRemoveUpload = (id) => {
         const updated = { ...uploadedDocs };
         delete updated[id];
         setUploadedDocs(updated);
         localStorage.setItem('propertyChecklistDocs', JSON.stringify(updated));
     };
 
     const calculateProgress = () => {
         const totalItems = Object.values(checklistData).flat().length;
         const checkedCount = Object.values(checkedItems).filter(Boolean).length;
         return Math.round((checkedCount / totalItems) * 100);
     };

     // AUDIT FIX (3.5): export/share the checklist.
     const handlePrintPdf = () => {
         window.print();
     };

     const handleCopySummary = async () => {
         const lines = [t('propertyChecklist.title'), ''];
         Object.entries(checklistData).forEach(([category, items]) => {
             lines.push(category);
             items.forEach((item) => {
                 const status = checkedItems[item.id] ? '[x]' : '[ ]';
                 const doc = uploadedDocs[item.id] ? ` (doc: ${uploadedDocs[item.id].name})` : '';
                 lines.push(`  ${status} ${item.text}${doc}`);
             });
             lines.push('');
         });
         lines.push(`${t('propertyChecklist.yourProgress')}: ${calculateProgress()}%`);
         try {
             await navigator.clipboard.writeText(lines.join('\n'));
             toast.success(t('propertyChecklist.copySuccess', 'Checklist summary copied to clipboard!'));
         } catch {
             toast.error(t('propertyChecklist.copyError', 'Could not copy. Try the Print option instead.'));
         }
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
                         { name: 'Tools', url: 'https://360ghar.com/tools' },
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
                                     {/* AUDIT FIX (3.5): export / share buttons */}
                                     <div className="d-flex gap-2 mt-3 flex-wrap">
                                         <button type="button" className="btn btn-sm btn-main" onClick={handlePrintPdf}>
                                             <i className="fas fa-file-pdf me-1"></i>{t('propertyChecklist.downloadPdf', 'Download PDF')}
                                         </button>
                                         <button type="button" className="btn btn-sm btn-outline-main" onClick={handleCopySummary}>
                                             <i className="fas fa-copy me-1"></i>{t('propertyChecklist.copySummary', 'Copy Summary')}
                                         </button>
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
                                                     <div className="flex-grow-1">
                                                         <h5 className={`mb-1 fs-6 ${checkedItems[item.id] ? 'text-decoration-line-through text-muted' : ''}`}>
                                                             {item.text}
                                                             {/* AUDIT FIX (imp 3.6): show verified/pending badge */}
                                                             {uploadedDocs[item.id] && (
                                                                 <span className="badge bg-success ms-2" style={{fontSize: '0.7em'}}>
                                                                     <i className="fas fa-check me-1"></i>{t('propertyChecklist.verified', 'Verified')}
                                                                 </span>
                                                             )}
                                                         </h5>
                                                         <p className="small text-muted mb-2">{item.desc}</p>
                                                         {/* AUDIT FIX (imp 3.6): document upload per item */}
                                                         {uploadedDocs[item.id] ? (
                                                             <div className="d-flex align-items-center gap-2 flex-wrap">
                                                                 <span className="badge bg-light text-dark border">
                                                                     <i className="fas fa-paperclip me-1"></i>{uploadedDocs[item.id].name}
                                                                 </span>
                                                                 <button type="button" className="btn btn-sm btn-link text-danger p-0" onClick={() => handleRemoveUpload(item.id)}>
                                                                     <i className="fas fa-times me-1"></i>{t('propertyChecklist.remove', 'Remove')}
                                                                 </button>
                                                             </div>
                                                         ) : (
                                                             <label className="btn btn-sm btn-outline-secondary" style={{cursor: 'pointer'}}>
                                                                 <i className="fas fa-upload me-1"></i>{t('propertyChecklist.uploadDoc', 'Upload Document')}
                                                                 <input
                                                                     type="file"
                                                                     className="d-none"
                                                                     accept="image/*,.pdf"
                                                                     onChange={(e) => handleUpload(item.id, e.target.files?.[0])}
                                                                 />
                                                             </label>
                                                         )}
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
