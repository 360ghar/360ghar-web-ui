import { useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { I18nLink } from '../../i18n/I18nLink';

const EmiCalculator = () => {
    const { t } = useTranslation('tools');
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
          title={t('emi.title')}
          description={t('emi.description')}
          keywords={t('emi.keywords')}
          canonical="/emi-calculator"
          image={siteMetadata.defaultOgImage}
          type="website"
          structuredData={[
            generateToolSchema(toolSchemas.emiCalculator),
            generateBreadcrumbStructuredData([
                { name: 'Home', url: 'https://360ghar.com/' },
                { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                { name: toolSchemas.emiCalculator.name, url: 'https://360ghar.com/emi-calculator' }
            ])
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
                                    <h2 className="section-title">{t('emi.headingTitle')}</h2>
                                    <p className="section-desc">
                                        {t('emi.headingDesc')}
                                    </p>
                                </div>

                                <div className="emi-calculator-wrapper">
                                    <div className="row g-4">
                                        {/* Calculator Form */}
                                        <div className="col-lg-6">
                                            <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                                <h3 className="form-title mb-4">{t('emi.loanDetails')}</h3>

                                                {/* Loan Amount */}
                                                <div className="form-group mb-4">
                                                    <label htmlFor="loanAmount" className="form-label">
                                                        {t('emi.loanAmount')}
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
                                                        {t('emi.interestRate')}
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
                                                        {interestRate}{t('emi.perAnnum')}
                                                    </small>
                                                </div>

                                                {/* Loan Tenure */}
                                                <div className="form-group mb-4">
                                                    <label htmlFor="loanTenure" className="form-label">
                                                        {t('emi.loanTenure')}
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
                                                        <span className="input-group-text">{t('emi.years')}</span>
                                                    </div>
                                                    <small className="text-muted">
                                                        {t('emi.yearsMonths', { years: loanTenure, months: loanTenure * 12 })}
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
                                                        {t('emi.calculateEmi')}
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className="btn btn-outline-secondary flex-fill"
                                                        onClick={handleReset}
                                                    >
                                                        <i className="fas fa-redo me-2"></i>
                                                        {t('emi.reset')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Results Section */}
                                        <div className="col-lg-6" ref={resultsRef}>
                                            <div className="calculator-results bg-white p-4 rounded-3 shadow-sm">
                                                <h3 className="results-title mb-4">{t('emi.resultsTitle')}</h3>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                                        <span className="result-label text-muted">{t('emi.monthlyEmi')}</span>
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
                                                        <span className="result-label text-muted">{t('emi.totalInterest')}</span>
                                                        <span className="result-value fs-5 fw-bold text-warning">
                                                        {formatCurrency(emiBreakdown.totalInterest)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="result-item mb-4 p-3 bg-light rounded-2">
                                                    <div className="d-flex justify-content-between align-items-center">
                                                        <span className="result-label text-muted">{t('emi.totalPayment')}</span>
                                                        <span className="result-value fs-5 fw-bold text-success">
                                                        {formatCurrency(emiBreakdown.totalPayment)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Breakdown Chart */}
                                                <div className="breakdown-chart mt-4">
                                                    <h5 className="chart-title mb-3">{t('emi.paymentBreakdown')}</h5>
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
                                                        {t('emi.whatIsEmi')}
                                                    </h4>
                                                    <p className="info-text">
                                                        {t('emi.whatIsEmiDesc')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="col-md-6">
                                                <div className="info-card bg-white p-4 rounded-3 shadow-sm h-100">
                                                    <h4 className="info-title mb-3">
                                                        <i className="fas fa-lightbulb text-main me-2"></i>
                                                        {t('emi.tipsForHomeLoan')}
                                                    </h4>
                                                    <ul className="info-list">
                                                        <li>{t('emi.tipCreditScore')}</li>
                                                        <li>{t('emi.tipShorterTenure')}</li>
                                                        <li>{t('emi.tipPrepayments')}</li>
                                                        <li>{t('emi.tipCompareRates')}</li>
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
                                <h2 className="cta-title mb-3">{t('emi.ctaTitle')}</h2>
                                <p className="cta-desc mb-4">
                                    {t('emi.ctaDesc')}
                                </p>
                                <div className="cta-buttons d-flex justify-content-center gap-3">
                                    <I18nLink to="/properties" className="btn btn-white btn-main">
                                        <i className="fas fa-home me-2"></i>
                                        {t('emi.browseProperties')}
                                    </I18nLink>
                                    <I18nLink to="/contact" className="btn btn-outline-white">
                                        <i className="fas fa-phone me-2"></i>
                                        {t('emi.contactUs')}
                                    </I18nLink>
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
