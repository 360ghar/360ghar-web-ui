import { useState, useEffect } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks, ToolInfoCard, ToolComparisonTable } from '../../components/tools/ToolContentSections';

const LOAN_ELIGIBILITY_FAQS = [
  {
    question: 'How is home loan eligibility calculated?',
    answer: 'Banks calculate home loan eligibility using FOIR (Fixed Obligation to Income Ratio), typically 50-65% of your net monthly income. They deduct existing EMIs and obligations from your income, then calculate the maximum EMI you can afford. The eligible loan amount is derived from this EMI using the prevailing interest rate and your chosen tenure.',
  },
  {
    question: 'What is FOIR and how does it affect my loan amount?',
    answer: 'FOIR stands for Fixed Obligation to Income Ratio. It represents the percentage of your monthly income that banks allow for total debt payments (including the new loan EMI). For salaried individuals with income below ₹50,000/month, FOIR is usually 50%. For higher incomes (₹2L+/month), it can go up to 65%. A higher FOIR means a higher eligible loan amount.',
  },
  {
    question: 'How much home loan can I get on a ₹50,000 salary?',
    answer: 'With a ₹50,000 monthly salary, zero existing EMIs, at 8.5% interest for 20 years, and 50% FOIR, your eligible EMI is approximately ₹25,000/month. This translates to a maximum home loan of roughly ₹28-30 lakhs. If you have existing EMIs (car loan, personal loan), the eligible amount reduces proportionally.',
  },
  {
    question: 'Which bank gives the highest home loan eligibility?',
    answer: 'SBI and HDFC typically offer the highest eligibility due to their higher FOIR limits (up to 65% for high-income borrowers) and competitive interest rates. SBI also offers special schemes for women borrowers with lower rates. However, actual eligibility depends on your credit score, age, employer category, and property profile.',
  },
  {
    question: 'Does a co-applicant increase my loan eligibility?',
    answer: 'Yes. Adding a co-applicant (spouse, parent) with a steady income significantly increases your eligibility because the bank considers combined income for FOIR calculation. For example, if both you and your spouse earn ₹50,000 each, the bank may approve a loan based on ₹1,00,000 combined income, nearly doubling the eligible amount.',
  },
  {
    question: 'How does credit score affect home loan eligibility?',
    answer: 'A credit score above 750 (CIBIL) gets you the best interest rates and highest FOIR consideration. Scores between 650-750 may result in slightly higher rates or lower eligible amounts. Below 650, most banks reject the application or require a larger down payment. Always check your credit score before applying.',
  },
  {
    question: 'Can I get a home loan with existing EMIs?',
    answer: 'Yes, but your eligible amount reduces. Banks deduct your existing EMI obligations from the FOIR calculation. For example, if you have a ₹15,000/month car EMI, that amount is subtracted from the maximum payment the bank allows, directly reducing your home loan eligibility.',
  },
];

const HOW_TO_STEPS = [
  { name: 'Enter Your Monthly Income', text: 'Input your net take-home salary after all deductions. Include all income sources — salary, rental income, freelance earnings — that you can document with bank statements.' },
  { name: 'Add Existing EMIs and Obligations', text: 'Enter all current monthly EMIs (car loan, personal loan, credit card minimums). Banks deduct these from your available income before calculating eligibility.' },
  { name: 'Set Interest Rate and Tenure', text: 'Use the current home loan interest rate (check SBI, HDFC, ICICI for latest rates). Choose a tenure — longer tenures (25-30 years) increase eligible amount but cost more interest.' },
  { name: 'Review Your Eligible Amount', text: 'The calculator shows your maximum eligible loan amount and EMI. This is an estimate — actual bank approval depends on credit score, property valuation, and documentation.' },
  { name: 'Compare Bank Offers', text: 'Use your eligibility estimate to compare offers from SBI, HDFC, ICICI, Axis, and Kotak. Even a 0.25% rate difference saves lakhs over a 20-year loan.' },
];

const BANK_COMPARISON = {
  title: 'Home Loan Eligibility by Bank (Approximate)',
  headers: ['Bank', 'FOIR Limit', 'Interest Rate (2026)', 'Processing Fee'],
  rows: [
    ['SBI', '50-65%', '8.50% - 10.15%', '0.35% + GST'],
    ['HDFC', '50-65%', '8.70% - 10.30%', '0.50% + GST'],
    ['ICICI Bank', '50-60%', '8.75% - 10.40%', '0.50% - 1%'],
    ['Axis Bank', '50-60%', '8.70% - 10.25%', '1% + GST'],
    ['Kotak', '50-60%', '8.85% - 10.50%', '0.50% + GST'],
    ['Bank of Baroda', '50-65%', '8.40% - 10.05%', '0.25% + GST'],
  ],
};

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
      let foir = 0.50;
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

  const faqStructuredData = generateFaqStructuredData(LOAN_ELIGIBILITY_FAQS);
  const howToStructuredData = generateHowToStructuredData({
    name: 'How to Check Your Home Loan Eligibility',
    description: 'Step-by-step guide to calculate your maximum home loan amount based on income, EMIs, and bank norms.',
    steps: HOW_TO_STEPS,
  });

  return (
    <>
      <SEO
        title="Home Loan Eligibility Calculator Gurgaon | How Much Loan in Haryana | 360Ghar"
        description="Free home loan eligibility calculator for India. Instantly check maximum loan amount from SBI, HDFC, ICICI based on your salary and FOIR. Includes bank-wise comparison table and 5 tips to increase eligibility."
        keywords="home loan eligibility calculator India, how much home loan can I get, SBI home loan eligibility, HDFC loan eligibility, housing loan eligibility check, salary based home loan calculator, FOIR calculator, 360ghar financial tools"
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
          faqStructuredData,
          howToStructuredData,
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
                {/* Hero heading for SEO */}
                <div className="text-center mb-4">
                  <h1>Home Loan Eligibility Calculator 2026</h1>
                  <p className="text-muted">
                    Check how much home loan you can get from SBI, HDFC, ICICI, and other banks. Free FOIR-based calculator with instant results.
                  </p>
                </div>

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

                {/* How is Loan Eligibility Calculated */}
                <ToolInfoCard title="How is Home Loan Eligibility Calculated?">
                  <p>
                    Banks use <strong>FOIR (Fixed Obligation to Income Ratio)</strong> to determine your maximum
                    eligible loan. FOIR represents the portion of your monthly income that can go toward all debt
                    payments combined, including the new home loan EMI.
                  </p>
                  <p>
                    <strong>Formula:</strong> Max EMI = (Net Monthly Income &times; FOIR%) &minus; Existing EMIs &minus; Other Obligations.
                    The eligible loan amount is then calculated by reversing the EMI formula using the
                    prevailing interest rate and your chosen tenure.
                  </p>
                  <p>
                    FOIR ranges from <strong>50%</strong> (for incomes up to ₹50,000) to <strong>65%</strong>
                    (for incomes above ₹2,00,000). Adding a co-applicant with independent income
                    can significantly increase your eligible amount.
                  </p>
                </ToolInfoCard>

                {/* How to Improve Eligibility */}
                <ToolInfoCard title="5 Ways to Improve Your Home Loan Eligibility">
                  <ol>
                    <li><strong>Add a co-applicant:</strong> Spouse or parent with income nearly doubles eligibility</li>
                    <li><strong>Close existing loans:</strong> Prepay car/personal loans to free up FOIR</li>
                    <li><strong>Increase tenure:</strong> 25-30 year tenure vs 20 years increases eligible amount by 15-20%</li>
                    <li><strong>Improve credit score:</strong> Score above 750 gets higher FOIR and lower rates</li>
                    <li><strong>Include variable pay:</strong> Bonuses and variable pay (with 2-year proof) can boost income considered</li>
                  </ol>
                </ToolInfoCard>

                {/* Bank comparison table */}
                <ToolComparisonTable {...BANK_COMPARISON} />
                <p className="text-muted small mt-1">
                  * Rates as of Jan 2026. Actual rates vary by borrower profile, loan amount, and property type. Check with your bank for the latest rates.
                </p>

                {/* FAQ */}
                <ToolFaq faqs={LOAN_ELIGIBILITY_FAQS} heading="Home Loan Eligibility — Frequently Asked Questions" />

                {/* Related Tools */}
                <ToolRelatedLinks
                  heading="Related Calculators & Tools"
                  links={[
                    { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                    { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                    { to: '/capital-gains-tax-calculator', label: 'Capital Gains Tax Calculator', icon: 'fas fa-receipt' },
                    { to: '/property-document-checklist', label: 'Property Document Checklist', icon: 'fas fa-clipboard-list' },
                    { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-stamp' },
                    { to: '/blog', label: 'Real Estate Blog', icon: 'fas fa-blog' },
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
