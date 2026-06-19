import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { ToolFaq, ToolRelatedLinks, ToolInfoCard, ToolComparisonTable } from '../../components/tools/ToolContentSections';
import { I18nLink } from '../../i18n/I18nLink';

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
  {
    question: 'What is the ideal EMI to income ratio?',
    answer: 'Financial experts recommend keeping total EMIs below 40% of your monthly income. For a ₹50,000 salary, your EMI should not exceed ₹20,000. Banks use FOIR (Fixed Obligation to Income Ratio) to assess your repayment capacity. A lower FOIR not only improves loan approval chances but also ensures you have enough buffer for emergencies and daily expenses.',
  },
  {
    question: 'Can I pay more than my EMI amount?',
    answer: 'Yes, you can make partial prepayments on your home loan. Most banks allow prepayment without any penalty on floating rate loans. Even small prepayments can significantly reduce your total interest burden and loan tenure. For example, paying just one extra EMI per year on a ₹50 lakh loan at 8.5% over 20 years can save you approximately ₹6-8 lakh in total interest and reduce tenure by 2-3 years.',
  },
  {
    question: 'What happens if I miss an EMI payment?',
    answer: 'Missing an EMI payment attracts a late payment fee (typically 1-2% of the EMI amount) and negatively impacts your CIBIL score. Consecutive misses can lead to the loan being classified as NPA (Non-Performing Asset). Always inform your bank in advance if you anticipate difficulty in paying — most lenders offer a grace period or restructuring options. Even a single missed payment can drop your credit score by 50-70 points.',
  },
  {
    question: 'How does loan tenure affect total interest paid?',
    answer: 'A longer tenure reduces your monthly EMI but significantly increases the total interest paid. For example, on a ₹50 lakh loan at 8.5%: a 20-year tenure results in approximately ₹55.5 lakh total interest, while a 30-year tenure results in approximately ₹91.5 lakh — a difference of ₹36 lakh. The key takeaway is that every additional year of tenure adds several lakhs in interest cost, so choose the shortest tenure your budget can comfortably support.',
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
    const { t, i18n } = useTranslation('tools');
    const resultsRef = useRef(null);
    const [loanAmount, setLoanAmount] = useState(1000000);
    const [interestRate, setInterestRate] = useState(8.5);
    const [loanTenure, setLoanTenure] = useState(20);

    // CRITICAL FIX (audit 3.4): clamp number inputs to the slider's min/max
    // so the slider and number box never desync.
    const clamp = (value, min, max) => {
        const n = Number(value);
        if (Number.isNaN(n)) return min;
        return Math.min(Math.max(n, min), max);
    };

    // AUDIT FIX (shareable-link): restore inputs from a shared URL produced by
    // handleShareResults so a recipient sees the shared calculation, not defaults.
    const [searchParams, setSearchParams] = useSearchParams();
    useEffect(() => {
        const amount = searchParams.get('amount');
        const rate = searchParams.get('rate');
        const tenure = searchParams.get('tenure');
        if (amount !== null) setLoanAmount(clamp(Number(amount), 100000, 10000000));
        if (rate !== null) setInterestRate(clamp(Number(rate), 1, 20));
        if (tenure !== null) setLoanTenure(clamp(Number(tenure), 1, 30));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // AUDIT FIX (imp 3.1): prepayment simulator inputs.
    const [prepaymentAmount, setPrepaymentAmount] = useState(0);
    const [prepaymentMonth, setPrepaymentMonth] = useState(12);
    const [showAmortization, setShowAmortization] = useState(false);
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

    // AUDIT FIX (3.1): year-by-year amortization schedule (principal, interest, balance).
    const amortizationSchedule = useMemo(() => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 12 / 100;
        const months = parseFloat(loanTenure) * 12;
        if (!(principal > 0 && rate > 0 && months > 0)) return [];
        const emi = emiBreakdown.emi;
        let balance = principal;
        const years = [];
        for (let y = 1; y <= loanTenure; y++) {
            let yearPrincipal = 0;
            let yearInterest = 0;
            for (let m = 0; m < 12; m++) {
                if (balance <= 0) break;
                const interest = balance * rate;
                const principalPart = Math.min(emi - interest, balance);
                yearInterest += interest;
                yearPrincipal += principalPart;
                balance -= principalPart;
            }
            years.push({
                year: y,
                principal: Math.round(yearPrincipal),
                interest: Math.round(yearInterest),
                balance: Math.max(Math.round(balance), 0),
            });
        }
        return years;
    }, [loanAmount, interestRate, loanTenure, emiBreakdown.emi]);

    // AUDIT FIX (imp 3.1): effect of a one-time prepayment on tenure & interest.
    const prepaymentImpact = useMemo(() => {
        const principal = parseFloat(loanAmount);
        const rate = parseFloat(interestRate) / 12 / 100;
        const months = parseFloat(loanTenure) * 12;
        const prep = parseFloat(prepaymentAmount);
        const prepMonth = parseInt(prepaymentMonth, 10);
        if (!(principal > 0 && rate > 0 && months > 0) || !(prep > 0) || prepMonth < 1) return null;
        const emi = emiBreakdown.emi;
        let balance = principal;
        let totalInterest = 0;
        let month = 0;
        // Simulate up to prepayment month.
        while (month < prepMonth && balance > 0) {
            const interest = balance * rate;
            const principalPart = Math.min(emi - interest, balance);
            totalInterest += interest;
            balance -= principalPart;
            month++;
        }
        // Apply prepayment.
        balance = Math.max(balance - prep, 0);
        // Continue until balance is cleared.
        while (balance > 0 && month < months * 2) {
            const interest = balance * rate;
            const principalPart = Math.min(emi - interest, balance);
            totalInterest += interest;
            balance -= principalPart;
            month++;
        }
        const originalInterest = emiBreakdown.totalInterest;
        const monthsSaved = Math.max(months - month, 0);
        const interestSaved = Math.max(originalInterest - totalInterest, 0);
        return {
            newTenureMonths: month,
            monthsSaved,
            interestSaved: Math.round(interestSaved),
            newTotalInterest: Math.round(totalInterest),
        };
    }, [loanAmount, interestRate, loanTenure, prepaymentAmount, prepaymentMonth, emiBreakdown.emi, emiBreakdown.totalInterest]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    const formatNumber = (num) => {
        return new Intl.NumberFormat(i18n.language === 'hi' ? 'hi-IN' : 'en-IN').format(num);
    };

    const handleReset = () => {
        setLoanAmount(1000000);
        setInterestRate(8.5);
        setLoanTenure(20);
        setPrepaymentAmount(0);
        setPrepaymentMonth(12);
        setSearchParams({});
    };

    // AUDIT FIX (imp 3.2): share results via URL query params.
    const handleShareResults = async () => {
        const params = new URLSearchParams({
            amount: loanAmount,
            rate: interestRate,
            tenure: loanTenure,
        });
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success(t('emi.shareCopied', 'Shareable link copied to clipboard!'));
        } catch {
            toast.error(t('emi.shareError', 'Could not copy link.'));
        }
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
                { name: 'Tools', url: 'https://360ghar.com/tools' },
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
                                                            onChange={(e) => setLoanAmount(clamp(e.target.value, 100000, 10000000))}
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
                                                            onChange={(e) => setInterestRate(clamp(e.target.value, 1, 20))}
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
                                                            onChange={(e) => setLoanTenure(clamp(e.target.value, 1, 30))}
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
                                                {emiBreakdown.totalPayment > 0 && (
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
                                                )}

                                                {/* AUDIT FIX (imp 3.2): share results button */}
                                                <button
                                                    type="button"
                                                    className="btn btn-sm btn-outline-main w-100 mt-3"
                                                    onClick={handleShareResults}
                                                >
                                                    <i className="fas fa-share-alt me-2"></i>{t('emi.shareResults', 'Share Results')}
                                                </button>

                                                {/* AUDIT FIX (imp 3.1): prepayment simulator */}
                                                <div className="mt-4 p-3 border rounded-2">
                                                    <h6 className="mb-3">{t('emi.prepaymentTitle', 'Prepayment Simulator')}</h6>
                                                    <div className="row g-2 mb-3">
                                                        <div className="col-6">
                                                            <label className="form-label small text-muted">{t('emi.prepaymentAmount', 'Prepayment Amount')}</label>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                min="0"
                                                                value={prepaymentAmount}
                                                                onChange={(e) => setPrepaymentAmount(Math.max(0, Number(e.target.value)))}
                                                            />
                                                        </div>
                                                        <div className="col-6">
                                                            <label className="form-label small text-muted">{t('emi.prepaymentMonth', 'After Month #')}</label>
                                                            <input
                                                                type="number"
                                                                className="form-control form-control-sm"
                                                                min="1"
                                                                value={prepaymentMonth}
                                                                onChange={(e) => setPrepaymentMonth(Math.max(1, Number(e.target.value)))}
                                                            />
                                                        </div>
                                                    </div>
                                                    {prepaymentImpact && prepaymentAmount > 0 && (
                                                        <div className="small">
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted">{t('emi.monthsSaved', 'Months Saved')}:</span>
                                                                <span className="fw-bold text-success">{prepaymentImpact.monthsSaved}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted">{t('emi.interestSaved', 'Interest Saved')}:</span>
                                                                <span className="fw-bold text-success">{formatCurrency(prepaymentImpact.interestSaved)}</span>
                                                            </div>
                                                            <div className="d-flex justify-content-between">
                                                                <span className="text-muted">{t('emi.newTenure', 'New Tenure')}:</span>
                                                                <span className="fw-bold">{prepaymentImpact.newTenureMonths} {t('emi.months', 'months')}</span>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {/* AUDIT FIX (3.1): collapsible amortization schedule */}
                                                <div className="mt-4">
                                                    <button
                                                        type="button"
                                                        className="btn btn-sm btn-link p-0 text-main"
                                                        onClick={() => setShowAmortization((v) => !v)}
                                                        aria-expanded={showAmortization}
                                                    >
                                                        <i className={`fas ${showAmortization ? 'fa-chevron-down' : 'fa-chevron-right'} me-1`}></i>
                                                        {t('emi.amortizationSchedule', 'Amortization Schedule (Yearly)')}
                                                    </button>
                                                    {showAmortization && amortizationSchedule.length > 0 && (
                                                        <div className="table-responsive mt-2" style={{ maxHeight: 320 }}>
                                                            <table className="table table-sm table-bordered">
                                                                <thead className="table-light">
                                                                    <tr>
                                                                        <th>{t('emi.year', 'Year')}</th>
                                                                        <th>{t('emi.principal', 'Principal')}</th>
                                                                        <th>{t('emi.interest', 'Interest')}</th>
                                                                        <th>{t('emi.balance', 'Balance')}</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {amortizationSchedule.map((row) => (
                                                                        <tr key={row.year}>
                                                                            <td>{row.year}</td>
                                                                            <td>{formatCurrency(row.principal)}</td>
                                                                            <td>{formatCurrency(row.interest)}</td>
                                                                            <td>{formatCurrency(row.balance)}</td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
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

                <section className="padding-y-60">
                    <div className="container">
                        <div className="row justify-content-center">
                            <div className="col-lg-8">

                                {/* Educational Content Sections */}
                                <ToolInfoCard title="Understanding Home Loan EMI">
                                    <p className="text-muted mb-3">
                                        EMI (Equated Monthly Instalment) is the fixed amount you pay your bank every month until your home loan is fully repaid. Each EMI consists of two components — <strong>principal</strong> (the loan amount you borrowed) and <strong>interest</strong> (the cost of borrowing). In the early years of your loan, a larger share of your EMI goes toward interest. For example, in year 1 of a 20-year loan at 8.5%, nearly 75% of your EMI covers interest. As the loan matures, the principal component grows while the interest portion shrinks. This shifting balance is described by your <strong>amortization schedule</strong> — a month-by-month breakup that shows exactly how much of each payment reduces your outstanding principal versus what the bank earns as interest. Reviewing this schedule helps you identify the best time to make prepayments for maximum savings.
                                    </p>
                                </ToolInfoCard>

                                <ToolInfoCard title="Tips to Reduce Your Home Loan EMI">
                                    <ul className="text-muted mb-0">
                                        <li className="mb-2"><strong>Make a larger down payment</strong> — Putting down 20-25% instead of the minimum 10-15% reduces your principal, which directly lowers your EMI and total interest.</li>
                                        <li className="mb-2"><strong>Compare interest rates across banks</strong> — Even a 0.5% difference on a ₹50 lakh loan over 20 years can save you more than ₹3.5 lakh. Always get quotes from at least 3-4 lenders.</li>
                                        <li className="mb-2"><strong>Opt for a shorter tenure if affordable</strong> — A 20-year tenure instead of 30 years on a ₹50 lakh loan at 8.5% saves you over ₹36 lakh in interest.</li>
                                        <li className="mb-2"><strong>Make periodic prepayments</strong> — Use annual bonuses, salary increments, or windfall gains to make lump-sum prepayments. Even one extra EMI per year can save lakhs and reduce tenure by 2-3 years.</li>
                                        <li className="mb-0"><strong>Consider a balance transfer</strong> — If another lender offers a rate that is 0.5% or more lower, transferring your outstanding balance can significantly reduce your interest burden. Factor in processing fees and legal charges before switching.</li>
                                    </ul>
                                </ToolInfoCard>

                                <ToolInfoCard title="Fixed vs Floating Interest Rate">
                                    <p className="text-muted mb-3">
                                        <strong>Fixed rate</strong> loans have a constant interest rate throughout the tenure, giving you predictable EMIs. However, fixed rates are typically 0.5–1% higher than floating rates and most banks reserve the right to reset them after a few years. <strong>Floating rate</strong> loans are linked to the RBI repo rate or an external benchmark, meaning your EMI changes when the benchmark moves. While this introduces uncertainty, floating rates have historically been cheaper over the long term — especially in a declining rate environment. If you expect rates to fall or stay stable, a floating rate loan is generally the better choice. If you prefer budgeting certainty and rates are at historic lows, locking in a fixed rate can be worthwhile.
                                    </p>
                                    <div className="row g-3">
                                        <div className="col-md-6">
                                            <div className="p-3 bg-white rounded-2 border">
                                                <h6 className="text-main mb-1"><i className="fas fa-lock me-1"></i> Fixed Rate</h6>
                                                <small className="text-muted">Stable EMI, higher rate (typically 0.5–1% more). Best when interest rates are at historic lows.</small>
                                            </div>
                                        </div>
                                        <div className="col-md-6">
                                            <div className="p-3 bg-white rounded-2 border">
                                                <h6 className="text-main mb-1"><i className="fas fa-chart-line me-1"></i> Floating Rate</h6>
                                                <small className="text-muted">Variable EMI, linked to repo rate. Generally cheaper over the long term. Most popular choice in India.</small>
                                            </div>
                                        </div>
                                    </div>
                                </ToolInfoCard>

                                {/* Bank Comparison Table */}
                                <ToolComparisonTable
                                    title="Home Loan Interest Rates: SBI vs HDFC vs ICICI vs LIC Housing (2026)"
                                    headers={['Bank', 'Interest Rate (From)', 'Max Tenure', 'Max LTV Ratio', 'Processing Fee']}
                                    rows={[
                                        ['SBI', '8.50% p.a.', '30 years', 'Up to 90%', '0.35% (min ₹2,000, max ₹10,000)'],
                                        ['HDFC Bank', '8.70% p.a.', '30 years', 'Up to 90%', '0.50% (min ₹3,000)'],
                                        ['ICICI Bank', '8.75% p.a.', '30 years', 'Up to 90%', '0.50% (min ₹3,000, max ₹5,000)'],
                                        ['LIC Housing Finance', '8.65% p.a.', '30 years', 'Up to 85%', '0.25% (min ₹2,500, max ₹15,000)'],
                                    ]}
                                />

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
