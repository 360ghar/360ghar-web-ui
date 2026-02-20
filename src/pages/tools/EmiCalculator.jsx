import { useState, useEffect, useCallback } from 'react';
import Header from '../../common/Header';
import Footer from '../../common/Footer';
import MobileMenu from '../../common/MobileMenu';
import OffCanvas from '../../common/OffCanvas';
import PageTitle from '../../common/PageTitle';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';

const EmiCalculator = () => {
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);
    const [emi, setEmi] = useState(0);
    const [totalInterest, setTotalInterest] = useState(0);
    const [totalPayment, setTotalPayment] = useState(0);

    const calculateEMI = useCallback(() => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 12 / 100; // Monthly interest rate
        const time = parseFloat(loanTenure) * 12; // Total months

        if (principal > 0 && rate > 0 && time > 0) {
            const emiAmount = (principal * rate * Math.pow(1 + rate, time)) / (Math.pow(1 + rate, time) - 1);
            const totalAmount = emiAmount * time;
            const totalInterestAmount = totalAmount - principal;

            setEmi(emiAmount);
            setTotalPayment(totalAmount);
            setTotalInterest(totalInterestAmount);
        }
    }, [loanAmount, interestRate, loanTenure]);

    useEffect(() => {
        calculateEMI();
    }, [loanAmount, interestRate, loanTenure, calculateEMI]);

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
          title="Home Loan EMI Calculator India | Calculate Mortgage EMI | 360Ghar"
          description="Calculate your Home Loan EMI instantly with 360Ghar's free EMI Calculator. Plan your budget, check monthly installments, and view amortization schedule for properties in Gurgaon & India."
          keywords="home loan EMI calculator India, housing loan calculator, mortgage calculator India, loan repayment schedule, SBI home loan EMI, HDFC home loan EMI, real estate finance tool, 360ghar financial tools"
          canonical="/emi-calculator"
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={generateToolSchema(
              toolSchemas.emiCalculator.name,
              toolSchemas.emiCalculator.description,
              toolSchemas.emiCalculator.keywords,
              toolSchemas.emiCalculator.category
          )}
        />
            <PageTitle
                title="Home Loan EMI Calculator - Calculate EMI Online | 360Ghar"
                description="Use 360Ghar's free EMI calculator to calculate your home loan monthly installments. Get accurate EMI calculations for property purchase based on loan amount, interest rate, and tenure."
                keywords="home loan EMI, loan EMI calculator, mortgage calculator, EMI calculation, housing loan EMI, property loan EMI calculator, loan repayment calculator"
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
                                    <h2 className="section-title">Calculate Your Home Loan EMI</h2>
                                    <p className="section-desc">
                                        Use our comprehensive EMI calculator to plan your home loan better.
                                        Get instant calculations for monthly installments, total interest, and total payment.
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
                                                        onClick={calculateEMI}
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
                                        <div className="col-lg-6">
                                            <div className="calculator-results bg-white p-4 rounded-3 shadow-sm">
                                                <h3 className="results-title mb-4">EMI Calculation Results</h3>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="result-label text-muted">Monthly EMI</span>
                                                        <span className="result-value fs-4 fw-bold text-main">
                                                            {formatCurrency(emi)}
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
                                                            {formatCurrency(totalInterest)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="result-label text-muted">Total Payment</span>
                                                        <span className="result-value fs-5 fw-bold text-success">
                                                            {formatCurrency(totalPayment)}
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
                                                                    width: `${(loanAmount / totalPayment) * 100}%`,
                                                                backgroundColor: 'var(--success-color)'
                                                                }}
                                                                title={`Principal: ${formatCurrency(loanAmount)}`}
                                                            ></div>
                                                            <div
                                                                className="interest-bar"
                                                                style={{
                                                                    width: `${(totalInterest / totalPayment) * 100}%`,
                                                                backgroundColor: 'var(--warning-color)'
                                                                }}
                                                                title={`Interest: ${formatCurrency(totalInterest)}`}
                                                            ></div>
                                                        </div>
                                                        <div className="breakdown-legend d-flex justify-content-between mt-2">
                                                            <span className="legend-item">
                                                            <span className="legend-color" style={{ backgroundColor: 'var(--success-color)' }}></span>
                                                                Principal ({formatNumber(Math.round((loanAmount / totalPayment) * 100))}%)
                                                            </span>
                                                            <span className="legend-item">
                                                                <span className="legend-color" style={{ backgroundColor: '#ffc107' }}></span>
                                                                Interest ({formatNumber(Math.round((totalInterest / totalPayment) * 100))}%)
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

                {/* Footer */}
                <Footer />
            </main>
        </>
    );
};

export default EmiCalculator;