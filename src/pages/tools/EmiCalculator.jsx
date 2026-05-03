import { useMemo, useRef, useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';

const EMI_CALCULATOR_FAQS = [
  {
    question: 'How is home loan EMI calculated?',
    answer: 'EMI = [P × R × (1+R)^N] / [(1+R)^N - 1], where P = principal loan amount, R = monthly interest rate (annual rate / 12 / 100), N = total months (tenure × 12). For example, a ₹50 lakh loan at 8.5% for 20 years: EMI ≈ ₹43,691/month.',
  },
  {
    question: 'What is the current home loan interest rate in India (2026)?',
    answer: 'As of 2026, home loan rates range from 8.40% to 10.50% depending on the bank and borrower profile. SBI offers 8.50%–10.15%, HDFC offers 8.70%–10.30%, and Bank of Baroda offers 8.40%–10.05%. Women borrowers often get 0.05–0.10% lower rates.',
  },
  {
    question: 'How can I reduce my home loan EMI?',
    answer: '5 ways to reduce EMI: (1) Negotiate a lower interest rate — even 0.25% saves lakhs over 20 years, (2) Increase tenure from 20 to 25-30 years (but you pay more total interest), (3) Make partial prepayments to reduce principal, (4) Choose a lender with lower processing fees, (5) Improve credit score (750+) to unlock best rates.',
  },
  {
    question: 'What is an amortization schedule?',
    answer: 'An amortization schedule is a table showing the breakdown of each EMI into principal and interest components over the loan tenure. In the initial years, most of your EMI goes toward interest (e.g., ~75% in year 1 of a 20-year loan). Over time, the principal component increases while interest decreases.',
  },
  {
    question: 'Should I choose a shorter or longer loan tenure?',
    answer: 'Shorter tenure (15-20 years) = higher EMI but much less total interest paid. Longer tenure (25-30 years) = lower EMI but significantly more total interest. For a ₹50 lakh loan at 8.5%: 20-year EMI is ₹43,691 (total interest ₹54.9L), while 30-year EMI is ₹38,459 (total interest ₹88.5L). Choose based on your monthly budget and financial goals.',
  },
];

const EMI_HOW_TO_STEPS = [
  { name: 'Enter Loan Amount', text: 'Input the total home loan amount you need (e.g., ₹50,00,000). This is the principal borrowed from the bank.' },
  { name: 'Set Interest Rate', text: 'Enter the annual interest rate offered by your bank (e.g., 8.5% for SBI/HDFC in 2026). Check your bank\'s website for the latest rate.' },
  { name: 'Choose Loan Tenure', text: 'Select the repayment period in years. Common tenures are 20-25 years. Longer tenure = lower EMI but more total interest.' },
  { name: 'Review EMI Results', text: 'The calculator shows your monthly EMI, total interest, and total payment. Use the breakdown to understand how much goes to interest vs principal.' },
  { name: 'Compare Across Banks', text: 'Repeat with different interest rates from SBI, HDFC, ICICI, and Bank of Baroda. Even 0.25% difference saves lakhs over 20 years.' },
];

const EmiCalculator = () => {
    const resultsRef = useRef(null);
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);
    const emiBreakdown = useMemo(() => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 12 / 100; // Monthly interest rate
        const time = parseFloat(loanTenure) * 12; // Total months

        if (principal > 0 && rate > 0 && time > 0) {
            const emiAmount = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
            const totalAmount = emiAmount * time;
            const totalInterestAmount = totalAmount - principal;

            return {
                emi: emiAmount,
                totalPayment: totalAmount,
                totalInterest: totalInterestAmount,
            };
        }
        return { emi: 0, totalPayment: 0, totalInterest: 0 };
    }, [loanAmount, interestRate, loanTenure]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat('en-IN').format(num);
    };

    const handleReset = () => {
        setLoanAmount(1000000);
        setInterestRate(8.5);
        setLoanTenure(20);
    };

    return (
        <>
        <SEO
          title="EMI Calculator Gurgaon | Home Loan EMI for Gurugram Property | 360Ghar"
          description="Free home loan EMI calculator for India. Calculate monthly EMI for SBI, HDFC, ICICI home loans instantly. View amortization schedule, payment breakdown, and compare interest rates for properties in Gurugram & Delhi NCR."
          keywords="home loan EMI calculator India, housing loan calculator, mortgage calculator India, loan repayment schedule, SBI home loan EMI, HDFC home loan EMI, real estate finance tool, 360ghar financial tools"
          canonical="/emi-calculator"
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={[
            generateToolSchema(toolSchemas.emiCalculator),
            generateBreadcrumbStructuredData([
                { name: 'Home', url: 'https://360ghar.com/' },
                { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                { name: toolSchemas.emiCalculator.name, url: 'https://360ghar.com/emi-calculator' }
            ]),
            generateFaqStructuredData(EMI_CALCULATOR_FAQS),
            generateHowToStructuredData({
              name: 'How to Calculate Home Loan EMI',
              description: 'Step-by-step guide to calculating your monthly EMI for a home loan in India.',
              steps: EMI_HOW_TO_STEPS,
            }),
          ]}
        />
            <OffCanvas/>
            <MobileMenu/>

            <main className="body-bg">
                {/* Header */}
                <Header />

                {/* EMI Calculator Section */}
                <section className="emi-calculator-section padding-y-50">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-10">
                                <div className="section-heading text-center mb-5">
                                    <h1>Home Loan EMI Calculator India (2026)</h1>
                                    <p className="section-desc">
                                        Free EMI calculator for SBI, HDFC, ICICI home loans. Get monthly installments, total interest, and amortization breakdown instantly.
                                    </p>
                                </div>

                                <div className="emi-calculator-wrapper">
                                    <div className="row g-4">
                                        {/* Calculator Form */}
                                        <div className="col-lg-6">
                                            <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                                <h3 className="form-title mb-4">Loan Details</h3>

                                                {/* Loan Amount */}
                                                <div className="form-group mb-4">
                                                    <label htmlFor="loanAmount" className="form-label">
                                                        Loan Amount (₹)
                                                    </label>
                                                    <div className="input-group">
                                                        <span className="input-group-text">₹</span>
                                                        <input
                                                            type="range"
                                                            id="loanAmountRange"
                                                            className="form-range"
                                                            min="100000"
                                                            max="10000000"
                                                            step="50000"
                                                            value={loanAmount}
                                                            onChange={(e) => setLoanAmount(e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            id="loanAmount"
                                                            className="form-control"
                                                            min="100000"
                                                            max="10000000"
                                                            value={loanAmount}
                                                            onChange={(e) => setLoanAmount(e.target.value)}
                                                        />
                                                    </div>
                                                    <small className="text-muted">
                                                        {formatCurrency(loanAmount)}
                                                    </small>
                                                </div>

                                                {/* Interest Rate */}
                                                <div className="form-group mb-4">
                                                    <label htmlFor="interestRate" className="form-label">
                                                        Interest Rate (% per annum)
                                                    </label>
                                                    <div className="input-group">
                                                        <input
                                                            type="range"
                                                            id="interestRateRange"
                                                            className="form-range"
                                                            min="1"
                                                            max="20"
                                                            step="0.1"
                                                            value={interestRate}
                                                            onChange={(e) => setInterestRate(e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            id="interestRate"
                                                            className="form-control"
                                                            min="1"
                                                            max="20"
                                                            step="0.1"
                                                            value={interestRate}
                                                            onChange={(e) => setInterestRate(e.target.value)}
                                                        />
                                                        <span className="input-group-text">%</span>
                                                    </div>
                                                    <small className="text-muted">
                                                        {interestRate}% per annum
                                                    </small>
                                                </div>

                                                {/* Loan Tenure */}
                                                <div className="form-group mb-4">
                                                    <label htmlFor="loanTenure" className="form-label">
                                                        Loan Tenure (Years)
                                                    </label>
                                                    <div className="input-group">
                                                        <input
                                                            type="range"
                                                            id="loanTenureRange"
                                                            className="form-range"
                                                            min="1"
                                                            max="30"
                                                            value={loanTenure}
                                                            onChange={(e) => setLoanTenure(e.target.value)}
                                                        />
                                                        <input
                                                            type="number"
                                                            id="loanTenure"
                                                            className="form-control"
                                                            min="1"
                                                            max="30"
                                                            value={loanTenure}
                                                            onChange={(e) => setLoanTenure(e.target.value)}
                                                        />
                                                        <span className="input-group-text">Years</span>
                                                    </div>
                                                    <small className="text-muted">
                                                        {loanTenure} years ({loanTenure * 12} months)
                                                    </small>
                                                </div>

                                                {/* Buttons */}
                                                <div className="form-actions d-flex gap-3">
                                                    <button
                                                        type="button"
                                                        className="btn btn-main flex-fill"
                                                        onClick={() => resultsRef.current?.scrollIntoView({ behavior: 'smooth' })}
                                                    >
                                                        <i className="fas fa-calculator me-2"></i>
                                                        Calculate EMI
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary flex-fill"
                                                        onClick={handleReset}
                                                    >
                                                        <i className="fas fa-redo me-2"></i>
                                                        Reset
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Results Section */}
                                        <div className="col-lg-6" ref={resultsRef}>
                                            <div className="calculator-results bg-white p-4 rounded-3 shadow-sm">
                                                <h3 className="results-title mb-4">EMI Calculation Results</h3>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="result-label text-muted">Monthly EMI</span>
                                                        <span className="result-value fs-4 fw-bold text-main">
                                                        {formatCurrency(emiBreakdown.emi)}
                                                        </span>
                                                    </div>
                                                    <div className="progress" style={{ height: '6px' }}>
                                                        <div
                                                            className="progress-bar bg-main"
                                                            style={{ width: '100%' }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="result-label text-muted">Total Interest</span>
                                                        <span className="result-value fs-5 fw-bold text-warning">
                                                        {formatCurrency(emiBreakdown.totalInterest)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="result-label text-muted">Total Payment</span>
                                                        <span className="result-value fs-5 fw-bold text-success">
                                                        {formatCurrency(emiBreakdown.totalPayment)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Breakdown Chart */}
                                                <div className="breakdown-chart mt-4">
                                                    <h5 className="chart-title mb-3">Payment Breakdown</h5>
                                                    <div className="breakdown-visual">
                                                        <div className="breakdown-bar">
                                                            <div
                                                                className="principal-bar"
                                                                style={{
                                                                    width: `${(loanAmount / emiBreakdown.totalPayment) * 100}%`,
                                                                backgroundColor: 'var(--success-color)'
                                                                }}
                                                                title={`Principal: ${formatCurrency(loanAmount)}`}
                                                            ></div>
                                                            <div
                                                                className="interest-bar"
                                                                style={{
                                                                    width: `${(emiBreakdown.totalInterest / emiBreakdown.totalPayment) * 100}%`,
                                                                backgroundColor: 'var(--warning-color)'
                                                                }}
                                                                title={`Interest: ${formatCurrency(emiBreakdown.totalInterest)}`}
                                                            ></div>
                                                        </div>
                                                        <div className="breakdown-legend d-flex justify-content-between mt-2">
                                                            <span className="legend-item">
                                                            <span className="legend-color" style={{ backgroundColor: 'var(--success-color)' }}></span>
                                                                Principal ({formatNumber(Math.round((loanAmount / emiBreakdown.totalPayment) * 100))}%)
                                                            </span>
                                                            <span className="legend-item">
                                                                <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
                                                                Interest ({formatNumber(Math.round((emiBreakdown.totalInterest / emiBreakdown.totalPayment) * 100))}%)
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Additional Information */}
                                    <div className="additional-info mt-5">
                                        <div className="row g-4">
                                            <div className="col-md-6">
                                                <div className="info-card bg-white p-4 rounded-3 shadow-sm h-100">
                                                    <h4 className="info-title mb-3">
                                                        <i className="fas fa-info-circle text-main me-2"></i>
                                                        What is EMI?
                                                    </h4>
                                                    <p className="info-text">
                                                        EMI (Equated Monthly Installment) is a fixed payment amount made by a borrower
                                                        to a lender at a specified date each calendar month. It consists of both principal
                                                        and interest components.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-card bg-white p-4 rounded-3 shadow-sm h-100">
                                                    <h4 className="info-title mb-3">
                                                        <i className="fas fa-lightbulb text-main me-2"></i>
                                                        Tips for Home Loan
                                                    </h4>
                                                    <ul className="info-list">
                                                        <li>Maintain a good credit score for better interest rates</li>
                                                        <li>Choose a shorter tenure to save on interest</li>
                                                        <li>Make prepayments when possible to reduce interest burden</li>
                                                        <li>Compare rates from multiple lenders</li>
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="cta-section bg-main text-white padding-y-80">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8 text-center">
                                <h2 className="cta-title mb-3">Ready to Find Your Dream Home?</h2>
                                <p className="cta-desc mb-4">
                                    Explore our wide range of properties and use our EMI calculator to plan your finances better.
                                </p>
                                <div className="cta-buttons d-flex justify-content-center gap-3">
                                    <a href="/properties" className="btn btn-white btn-main">
                                        <i className="fas fa-home me-2"></i>
                                        Browse Properties
                                    </a>
                                    <a href="/contact" className="btn btn-outline-white">
                                        <i className="fas fa-phone me-2"></i>
                                        Contact Us
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="padding-y-60">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">
                                <ToolFaq faqs={EMI_CALCULATOR_FAQS} heading="Home Loan EMI — Frequently Asked Questions" />
                                <ToolRelatedLinks
                                    heading="Related Calculators & Tools"
                                    links={[
                                        { to: '/loan-eligibility-calculator', label: 'Loan Eligibility Calculator', icon: 'fas fa-university' },
                                        { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
                                        { to: '/area-converter', label: 'Area Unit Converter', icon: 'fas fa-exchange-alt' },
                                        { to: '/capital-gains-tax-calculator', label: 'Capital Gains Tax Calculator', icon: 'fas fa-receipt' },
                                        { to: '/stamp-duty-calculator', label: 'Stamp Duty Calculator', icon: 'fas fa-stamp' },
                                        { to: '/vastu-checker', label: 'Vastu Checker', icon: 'fas fa-compass' },
                                    ]}
                                />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
};

export default EmiCalculator;
