 import React, { useState, useEffect, useMemo } from 'react'; // eslint-disable-line no-unused-vars
 import { useTranslation } from 'react-i18next';
 import { toast } from 'react-toastify';
 import Header from '../../common/layout/Header';
 import Footer from '../../common/layout/Footer';
 import MobileMenu from '../../common/layout/MobileMenu';
 import OffCanvas from '../../common/layout/OffCanvas';

 import SEO from '../../common/SEO';
 import Cta from '../../components/ui/Cta';
 import { ToolFaq, ToolRelatedLinks, ToolInfoCard } from '../../components/tools/ToolContentSections';
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
         {
             question: 'What is FOIR and how does it affect loan eligibility?',
             answer: 'FOIR (Fixed Obligation to Income Ratio) is the percentage of your income already committed to existing EMIs and obligations. Most banks cap FOIR at 50-60%. If you earn ₹1 lakh and have ₹30,000 in existing EMIs, your remaining eligibility is based on ₹70,000 income.'
         },
         {
             question: 'Can I include rental income in my loan eligibility?',
             answer: 'Yes, most banks include 50-70% of your rental income when calculating loan eligibility. You\'ll need to provide rental agreements and bank statements showing consistent rent receipts. Self-employed applicants can also include business income with proper documentation.'
         },
         {
             question: 'Does my CIBIL score affect home loan eligibility?',
             answer: 'Yes, CIBIL score is a critical factor. A score above 750 is considered good and qualifies you for the best interest rates. Scores below 700 may result in higher rates or rejection. Check your CIBIL score for free before applying and take steps to improve it if needed.'
         },
         {
             question: 'How much home loan can I get on a ₹50,000 salary?',
             answer: 'On a ₹50,000 monthly salary, most banks offer a home loan of ₹25-35 lakh, assuming no existing EMIs, a 20-year tenure, and 8.5% interest rate. The exact amount depends on your age, employer, credit score, and existing obligations.'
         },
         {
             question: 'What is the minimum salary for a home loan in India?',
             answer: 'There\'s no universal minimum salary requirement, but most banks require a minimum net monthly income of ₹15,000-₹25,000 for salaried applicants. For self-employed, minimum ITR income of ₹2-3 lakh per annum is typically required.'
         },
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

     // AUDIT FIX (imp 3.4): bank-specific eligibility with different FOIR.
     const BANKS = [
       { name: 'SBI', foir: 0.50 },
       { name: 'HDFC', foir: 0.55 },
       { name: 'ICICI', foir: 0.55 },
       { name: 'Axis', foir: 0.50 },
       { name: 'Bank of Baroda', foir: 0.60 },
     ];

     // Pure helper so we can reuse it for the bank-specific comparison.
     const computeEligibility = (inc, exp, emi, rate, ten, foir) => {
       const disposableIncome = Math.max(inc - exp, 0);
       const maxMonthlyPayment = disposableIncome * foir - emi;
       if (maxMonthlyPayment <= 0) return 0;
       const r = rate / 12 / 100;
       const n = ten * 12;
       if (r === 0) return maxMonthlyPayment * n;
       return Math.round(maxMonthlyPayment * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n)));
     };

     const bankEligibility = useMemo(
       () => BANKS.map((b) => ({ name: b.name, foir: b.foir, maxLoan: computeEligibility(income, otherExpenses, existingEmi, interestRate, tenure, b.foir) })),
       // eslint-disable-next-line react-hooks/exhaustive-deps
       [income, otherExpenses, existingEmi, interestRate, tenure]
     );

     useEffect(() => {
         const calculateEligibility = () => {
             // CRITICAL FIX (audit 3.2): FOIR (Fixed Obligation to Income
             // Ratio) is the maximum % of income allowed for ALL obligations.
             // Previously the code subtracted BOTH existingEmi AND
             // otherExpenses from (income * FOIR), double-counting.
             // Correct logic: capacity = (income * FOIR) - existingEmi.
             // otherExpenses should reduce the income BASE before the FOIR
             // check (they are living expenses, not financial obligations),
             // so disposable income = income - otherExpenses, and the bank
             // then allows FOIR of THAT for EMIs.
             let foir = 0.50; // Default 50%
             if (income > 50000) foir = 0.55;
             if (income > 100000) foir = 0.60;
             if (income > 200000) foir = 0.65;

             const disposableIncome = Math.max(income - otherExpenses, 0);
             const maxMonthlyPayment = (disposableIncome * foir) - existingEmi;
             
             if (maxMonthlyPayment <= 0) {
                 setMaxLoan(0);
                 setEligibleEmi(0);
                 return;
             }
 
             const r = interestRate / 12 / 100;
             const n = tenure * 12;
             
             // EMI Formula: E = P * r * (1+r)^n / ((1+r)^n - 1)
             // P = E * ((1+r)^n - 1) / (r * (1+r)^n)
             
             // Guard: when interest rate is 0, principal = payment * n
             let principal;
             if (r === 0) {
                 principal = maxMonthlyPayment * n;
             } else {
                 principal = maxMonthlyPayment * (Math.pow(1 + r, n) - 1) / (r * Math.pow(1 + r, n));
             }
             
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

     // AUDIT FIX (imp 3.2): share results via URL query params.
     const handleShareResults = async () => {
         const params = new URLSearchParams({
             income, emi: existingEmi, rate: interestRate, tenure, expenses: otherExpenses,
         });
         const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
         try {
             await navigator.clipboard.writeText(url);
             toast.success(t('loanEligibility.shareCopied', 'Shareable link copied to clipboard!'));
         } catch {
             toast.error(t('loanEligibility.shareError', 'Could not copy link.'));
         }
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
                         { name: 'Tools', url: 'https://360ghar.com/tools' },
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

                                            {/* AUDIT FIX (3.3): range sliders alongside number inputs */}
                                            <div className="mb-3">
                                                <label className="form-label">{t('loanEligibility.netMonthlyIncome')}</label>
                                                <div className="input-group">
                                                    <input type="range" className="form-range" min="10000" max="500000" step="5000" value={income} onChange={(e) => setIncome(Number(e.target.value))} />
                                                    <input type="number" className="form-control" min="10000" max="500000" value={income} onChange={(e) => setIncome(Math.min(Math.max(Number(e.target.value), 0), 500000))} />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('loanEligibility.existingEmis')}</label>
                                                <div className="input-group">
                                                    <input type="range" className="form-range" min="0" max="100000" step="1000" value={existingEmi} onChange={(e) => setExistingEmi(Number(e.target.value))} />
                                                    <input type="number" className="form-control" min="0" max="100000" value={existingEmi} onChange={(e) => setExistingEmi(Math.max(Number(e.target.value), 0))} />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('loanEligibility.otherExpenses')}</label>
                                                <div className="input-group">
                                                    <input type="range" className="form-range" min="0" max="100000" step="1000" value={otherExpenses} onChange={(e) => setOtherExpenses(Number(e.target.value))} />
                                                    <input type="number" className="form-control" min="0" max="100000" value={otherExpenses} onChange={(e) => setOtherExpenses(Math.max(Number(e.target.value), 0))} />
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('loanEligibility.interestRate')}</label>
                                                <div className="input-group">
                                                    <input type="range" className="form-range" min="1" max="20" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
                                                    <input type="number" className="form-control" min="1" max="20" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} />
                                                    <span className="input-group-text">%</span>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('loanEligibility.loanTenure')}</label>
                                                <div className="input-group">
                                                    <input type="range" className="form-range" min="1" max="30" value={tenure} onChange={(e) => setTenure(Number(e.target.value))} />
                                                    <input type="number" className="form-control" min="1" max="30" value={tenure} onChange={(e) => setTenure(Math.min(Math.max(Number(e.target.value), 1), 30))} />
                                                    <span className="input-group-text">{t('loanEligibility.tenureYears', { years: '' }).trim() || 'Yrs'}</span>
                                                </div>
                                            </div>

                                            <button type="button" className="btn btn-sm btn-outline-main w-100" onClick={handleShareResults}>
                                                <i className="fas fa-share-alt me-2"></i>{t('loanEligibility.shareResults', 'Share Results')}
                                            </button>
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

                                {/* AUDIT FIX (imp 3.4): bank-specific eligibility comparison */}
                                <ToolInfoCard title={t('loanEligibility.bankComparisonTitle', 'Bank-wise Eligibility Estimate')}>
                                    <p className="text-muted small mb-3">{t('loanEligibility.bankComparisonDesc', 'Each bank applies a different FOIR (Fixed Obligation to Income Ratio). Estimated eligible loan amounts based on your inputs:')}</p>
                                    <div className="table-responsive">
                                        <table className="table table-bordered table-sm">
                                            <thead className="table-light">
                                                <tr>
                                                    <th>{t('loanEligibility.bankCol', 'Bank')}</th>
                                                    <th>FOIR</th>
                                                    <th>{t('loanEligibility.estLoanCol', 'Estimated Loan')}</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {bankEligibility.map((b) => (
                                                    <tr key={b.name}>
                                                        <td className="fw-600">{b.name}</td>
                                                        <td>{Math.round(b.foir * 100)}%</td>
                                                        <td className="fw-bold text-main">{formatCurrency(b.maxLoan)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </ToolInfoCard>

                                <ToolInfoCard title="How Home Loan Eligibility is Calculated">
                                    <p className="mb-2">Banks consider several factors when determining your home loan eligibility:</p>
                                    <ul className="mb-3">
                                        <li><strong>Monthly income</strong> &mdash; Your net take-home salary or income</li>
                                        <li><strong>Existing obligations</strong> &mdash; Current EMIs, credit card dues, and other loan payments</li>
                                        <li><strong>Age</strong> &mdash; Younger applicants may qualify for longer tenures</li>
                                        <li><strong>Credit score</strong> &mdash; A CIBIL score above 750 improves eligibility</li>
                                        <li><strong>Employment type</strong> &mdash; Salaried vs. self-employed have different criteria</li>
                                        <li><strong>Property value</strong> &mdash; Loan-to-value (LTV) ratio limits apply</li>
                                    </ul>
                                    <p className="mb-2"><strong>Formula used by banks:</strong></p>
                                    <p className="mb-1"><code>Eligible EMI = Net Income x FOIR% - Existing EMIs</code></p>
                                    <p className="mb-0"><code>Loan Amount = Eligible EMI x [((1+r)^n - 1) / (r x (1+r)^n)]</code></p>
                                    <p className="small text-muted mt-2 mb-0">Where r = monthly interest rate, n = total number of monthly installments, FOIR = Fixed Obligation to Income Ratio (typically 50-65%).</p>
                                </ToolInfoCard>

                                <ToolInfoCard title="Tips to Increase Your Home Loan Eligibility">
                                    <ul className="mb-0">
                                        <li><strong>Add a co-applicant</strong> (spouse/parent) to combine incomes and boost eligibility</li>
                                        <li><strong>Clear existing loans</strong> and credit card dues before applying to lower your FOIR</li>
                                        <li><strong>Choose a longer tenure</strong> &mdash; this reduces your EMI and increases the eligible loan amount</li>
                                        <li><strong>Include all income sources</strong> such as rental income, bonuses, and incentives in your application</li>
                                        <li><strong>Maintain a CIBIL score above 750</strong> to qualify for the best rates and higher eligibility</li>
                                        <li><strong>Apply during festive season offers</strong> when banks often provide lower interest rates and relaxed criteria</li>
                                    </ul>
                                </ToolInfoCard>

                                <ToolInfoCard title="Documents Required for Home Loan Application">
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <h6 className="text-main">Identity Proof</h6>
                                            <p className="small mb-2">Aadhaar Card, PAN Card, Passport, Voter ID, or Driving License</p>
                                            <h6 className="text-main">Address Proof</h6>
                                            <p className="small mb-2">Aadhaar Card, Utility Bills, Passport, or Bank Statement with address</p>
                                            <h6 className="text-main">Employment Proof</h6>
                                            <p className="small mb-0">Offer Letter, Company ID Card, or Employment Certificate</p>
                                        </div>
                                        <div className="col-md-6">
                                            <h6 className="text-main">Income Proof</h6>
                                            <p className="small mb-2">Last 3-6 months salary slips, ITR (last 2-3 years), and Bank Statements (last 6 months)</p>
                                            <h6 className="text-main">Property Documents</h6>
                                            <p className="small mb-0">Sale Agreement, NOC from builder, Approved Building Plan, and Property Tax Receipts</p>
                                        </div>
                                    </div>
                                </ToolInfoCard>

                                <ToolFaq faqs={LOAN_ELIGIBILITY_FAQS} heading="Frequently Asked Questions" />

                                <ToolRelatedLinks
                                    heading="Related Calculators & Tools"
                                    links={[
                                        { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                                        { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-file-invoice-dollar' },
                                        { to: '/capital-gains-tax-calculator', label: 'Capital Gains Calculator', icon: 'fas fa-chart-line' },
                                        { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
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

export default LoanEligibilityCalculator;
