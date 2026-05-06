 import React, { useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
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

 const LoanEligibilityCalculator = () => {
      const { t, i18n } = useTranslation('tools');

     const LOAN_ELIGIBILITY_FAQS = [
         { question: t('loanEligibility.faqs.q1.question'), answer: t('loanEligibility.faqs.q1.answer') },
         { question: t('loanEligibility.faqs.q2.question'), answer: t('loanEligibility.faqs.q2.answer') },
         { question: t('loanEligibility.faqs.q3.question'), answer: t('loanEligibility.faqs.q3.answer') },
         { question: t('loanEligibility.faqs.q4.question'), answer: t('loanEligibility.faqs.q4.answer') },
     ];

     const LOAN_ELIGIBILITY_HOW_TO_STEPS = [
         { name: t('loanEligibility.howToSteps.step1.name'), text: t('loanEligibility.howToSteps.step1.text') },
         { name: t('loanEligibility.howToSteps.step2.name'), text: t('loanEligibility.howToSteps.step2.text') },
         { name: t('loanEligibility.howToSteps.step3.name'), text: t('loanEligibility.howToSteps.step3.text') },
         { name: t('loanEligibility.howToSteps.step4.name'), text: t('loanEligibility.howToSteps.step4.text') },
     ];

     const [income, setIncome] = useState(50000);
     const [existingEmi, setExistingEmi] = useState(0);
     const [interestRate, setInterestRate] = useState(8.5);
     const [tenure, setTenure] = useState(20);
     const [otherExpenses, setOtherExpenses] = useState(10000);
     
     const [maxLoan, setMaxLoan] = useState(0);
     const [eligibleEmi, setEligibleEmi] = useState(0);
 
     useEffect(() => {
         const calculateEligibility = () => {
             // Assumptions:
             // FOIR (Fixed Obligation to Income Ratio) is typically 50% for lower incomes, up to 65% for higher.
             // We'll use a sliding scale or fixed conservative 50-60%.
             
             let foir = 0.50; // Default 50%
             if (income > 50000) foir = 0.55;
             if (income > 100000) foir = 0.60;
             if (income > 200000) foir = 0.65;
 
             const maxMonthlyPayment = (income * foir) - existingEmi - otherExpenses;
             
             if (maxMonthlyPayment <= 0) {
                 setMaxLoan(0);
                 setEligibleEmi(0);
                 return;
             }
 
             const r = interestRate / 12 / 100;
             const n = tenure * 12;
             
             // EMI Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
             // P = E * ((1+r)^n - 1) / (r * (1+r)^n)
             
             const principal = maxMonthlyPayment * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
             
             setMaxLoan(Math.round(principal));
             setEligibleEmi(Math.round(maxMonthlyPayment));
         };
 
         calculateEligibility();
     }, [income, existingEmi, interestRate, tenure, otherExpenses]);
 
     const formatCurrency = (val) => {
          return new Intl.NumberFormat(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
              style: 'currency',
              currency: 'INR',
              maximumFractionDigits: 0
          }).format(val);
     };
 
     return (
         <>
             <SEO
                title={t('loanEligibility.title')}
                description={t('loanEligibility.description')}
                keywords={t('loanEligibility.keywords')}
                 canonical="/loan-eligibility-calculator"
                 image={siteMetadata.defaultOgImage}
                 type="website"
                  structuredData={[
                     generateToolSchema(toolSchemas.loanEligibility),
                     generateBreadcrumbStructuredData([
                         { name: 'Home', url: 'https://360ghar.com/' },
                         { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                         { name: toolSchemas.loanEligibility.name, url: 'https://360ghar.com/loan-eligibility-calculator' }
                     ]),
                     generateFaqStructuredData(LOAN_ELIGIBILITY_FAQS),
                     generateHowToStructuredData({
                         name: 'How to Check Your Home Loan Eligibility',
                         description: 'Calculate how much home loan you can get based on income and obligations',
                         steps: LOAN_ELIGIBILITY_HOW_TO_STEPS,
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
                                     <div className="col-lg-6">
                                         <div className="calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                                             <h4 className="mb-4">{t('loanEligibility.financialDetails')}</h4>
                                             
                                             <div className="mb-3">
                                                 <label className="form-label">{t('loanEligibility.netMonthlyIncome')}</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={income}
                                                     onChange={(e) => setIncome(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">{t('loanEligibility.existingEmis')}</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={existingEmi}
                                                     onChange={(e) => setExistingEmi(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">{t('loanEligibility.otherExpenses')}</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={otherExpenses}
                                                     onChange={(e) => setOtherExpenses(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">{t('loanEligibility.interestRate')}</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={interestRate}
                                                     step="0.1"
                                                     onChange={(e) => setInterestRate(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">{t('loanEligibility.loanTenure')}</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={tenure}
                                                     onChange={(e) => setTenure(Number(e.target.value))}
                                                 />
                                             </div>
                                         </div>
                                     </div>
 
                                     <div className="col-lg-6">
                                         <div className="bg-main text-white p-4 rounded-3 shadow-sm h-100 d-flex flex-column justify-content-center text-center">
                                             <h3 className="text-white mb-2">{t('loanEligibility.maxEligibleLoan')}</h3>
                                             <div className="display-4 fw-bold mb-4 text-white">
                                                 {formatCurrency(maxLoan)}
                                             </div>
 
                                             <div className="border-top border-white opacity-50 my-3"></div>
 
                                             <div className="row">
                                                 <div className="col-6">
                                                     <small className="d-block opacity-75">{t('loanEligibility.maxMonthlyEmi')}</small>
                                                     <span className="fs-5 fw-bold">{formatCurrency(eligibleEmi)}</span>
                                                 </div>
                                                 <div className="col-6">
                                                     <small className="d-block opacity-75">{t('loanEligibility.tenure')}</small>
                                                     <span className="fs-5 fw-bold">{t('loanEligibility.tenureYears', { years: tenure })}</span>
                                                 </div>
                                             </div>
                                             
                                             <div className="mt-4 pt-3">
                                                 <p className="small opacity-75 mb-0">
                                                     {t('loanEligibility.estimateNote')}
                                                 </p>
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
 
 export default LoanEligibilityCalculator;
