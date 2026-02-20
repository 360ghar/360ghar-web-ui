 import React, { useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
 import Header from '../../common/Header';
 import Footer from '../../common/Footer';
 import MobileMenu from '../../common/MobileMenu';
 import OffCanvas from '../../common/OffCanvas';
 import PageTitle from '../../common/PageTitle';
 import SEO from '../../common/SEO';
 import Cta from '../../components/ui/Cta';
 import { siteMetadata } from '../../seo/siteMetadata';
 import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
 
 const PropertyChecklist = () => {
     const checklistData = {
         "Legal Documents (Pre-Purchase)": [
             { id: 1, text: "Title Deed / Sale Deed", desc: "Verify the seller has clear ownership of the property." },
             { id: 2, text: "Encumbrance Certificate (EC)", desc: "Ensures the property is free from legal dues or mortgages." },
             { id: 3, text: "NA Order (Non-Agricultural)", desc: "Required if buying land to build a home." },
             { id: 4, text: "Approved Building Plan", desc: "Check if the building plan is approved by the local municipal authority." },
             { id: 5, text: "Completion / Occupancy Certificate", desc: "Proof that the building is constructed according to approved plans and is ready for habitation." }
         ],
         "Financial & Tax Documents": [
             { id: 6, text: "Property Tax Receipts", desc: "Ensure all previous property taxes have been paid by the seller." },
             { id: 7, text: "Khata Certificate", desc: "Proof that the property is registered in the municipal records." },
             { id: 8, text: "NOC from Bank", desc: "If the seller had a loan, ensure they have a No Objection Certificate from the bank." },
             { id: 9, text: "NOC from Society/RWA", desc: "Required for transferring the share certificate in housing societies." }
         ],
         "Agreement & Registration": [
             { id: 10, text: "Sale Agreement", desc: "Drafted on stamp paper, outlining terms and conditions of the sale." },
             { id: 11, text: "Stamp Duty Payment", desc: "Proof of stamp duty payment to the government." },
             { id: 12, text: "Registration Receipt", desc: "Final proof of transaction registration with the sub-registrar." },
             { id: 13, text: "Possession Letter", desc: "Issued by the builder/seller when handing over keys." }
         ]
     };
 
     const [checkedItems, setCheckedItems] = useState({});
 
     // Load progress from local storage
     useEffect(() => {
         const saved = localStorage.getItem('propertyChecklist');
         if (saved) {
             setCheckedItems(JSON.parse(saved));
         }
     }, []);
 
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
                title="Property Documents Checklist India | Home Buying Legal Checklist | 360Ghar"
                description="Essential document checklist for buying property in India. Ensure you have all legal papers: Title Deed, EC, Occupancy Certificate, etc. Verified by 360Ghar experts."
                keywords="property document checklist India, documents for buying flat, home loan documents list, property legal verification checklist, real estate documents India, 360ghar guide"
                 canonical="/property-document-checklist"
                 image={siteMetadata.defaultOgImage}
                 type="website"
                 structuredData={generateToolSchema(
                     toolSchemas.propertyChecklist.name,
                     toolSchemas.propertyChecklist.description,
                     toolSchemas.propertyChecklist.keywords,
                     toolSchemas.propertyChecklist.category
                 )}
             />
             <PageTitle
                 title="Property Document Checklist - Home Buying Guide India | 360Ghar"
                 description="Don\Don'tapos;t miss a thing. Use our interactive checklist to ensure you have all essential legal and financial documents in place for your property purchase in India."
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
                                         <span className="fw-bold">Your Progress</span>
                                         <span className="fw-bold text-main">{calculateProgress()}% Completed</span>
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
                                     <h5 className="text-info-emphasis"><i className="fas fa-info-circle me-2"></i>Note</h5>
                                     <p className="mb-0 small text-dark">
                                         This checklist is for general guidance only. Property laws vary by state in India. 
                                         It is highly recommended to consult a property lawyer for legal verification of documents before making a purchase.
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
