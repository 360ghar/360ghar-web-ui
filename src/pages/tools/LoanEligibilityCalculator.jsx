 import React, { useState, useEffect } from 'react'; // eslint-disable-line no-unused-vars
 import Header from '../../common/Header';
 import Footer from '../../common/Footer';
 import MobileMenu from '../../common/MobileMenu';
 import OffCanvas from '../../common/OffCanvas';
 import PageTitle from '../../common/PageTitle';
 import SEO from '../../common/SEO';
 import Cta from '../../components/ui/Cta';
 import { siteMetadata } from '../../seo/siteMetadata';
 
 const LoanEligibilityCalculator = () => {
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
         return new Intl.NumberFormat('en-IN', {
             style: 'currency',
             currency: 'INR',
             maximumFractionDigits: 0
         }).format(val);
     };
 
     return (
         <>
             <SEO
                title="Home Loan Eligibility Calculator India | Check Max Loan Amount | 360Ghar"
                description="Check your Home Loan Eligibility instantly. Calculate the maximum loan amount you can get based on your salary, existing EMIs, and tenure. Plan your home purchase budget."
                keywords="home loan eligibility calculator India, how much home loan can I get, housing loan eligibility check, salary based home loan calculator, 360ghar financial tools"
                 canonical="/loan-eligibility-calculator"
                 image={siteMetadata.defaultOgImage}
                 type="website"
             />
             <PageTitle
                 title="Home Loan Eligibility Calculator - Maximum Loan Amount | 360Ghar"
                 description="Find out the maximum home loan amount you may be eligible for based on your income and existing financial obligations. FOIR-based calculation for Indian banks."
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
                                             <h4 className="mb-4">Your Financial Details</h4>
                                             
                                             <div className="mb-3">
                                                 <label className="form-label">Net Monthly Income (₹)</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={income}
                                                     onChange={(e) => setIncome(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">Existing Monthly EMIs (₹)</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={existingEmi}
                                                     onChange={(e) => setExistingEmi(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">Other Monthly Expenses (₹)</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={otherExpenses}
                                                     onChange={(e) => setOtherExpenses(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">Interest Rate (%)</label>
                                                 <input 
                                                     type="number" 
                                                     className="form-control" 
                                                     value={interestRate}
                                                     step="0.1"
                                                     onChange={(e) => setInterestRate(Number(e.target.value))}
                                                 />
                                             </div>
 
                                             <div className="mb-3">
                                                 <label className="form-label">Loan Tenure (Years)</label>
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
                                             <h3 className="text-white mb-2">Maximum Eligible Loan</h3>
                                             <div className="display-4 fw-bold mb-4 text-white">
                                                 {formatCurrency(maxLoan)}
                                             </div>
 
                                             <div className="border-top border-white opacity-50 my-3"></div>
 
                                             <div className="row">
                                                 <div className="col-6">
                                                     <small className="d-block opacity-75">Max Monthly EMI</small>
                                                     <span className="fs-5 fw-bold">{formatCurrency(eligibleEmi)}</span>
                                                 </div>
                                                 <div className="col-6">
                                                     <small className="d-block opacity-75">Tenure</small>
                                                     <span className="fs-5 fw-bold">{tenure} Years</span>
                                                 </div>
                                             </div>
                                             
                                             <div className="mt-4 pt-3">
                                                 <p className="small opacity-75 mb-0">
                                                     * This is an estimate based on standard bank norms (FOIR). Actual eligibility may vary based on credit score, age, and bank policies.
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
