import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSearchParams } from 'react-router-dom';
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
import { ToolFaq, ToolRelatedLinks, ToolComparisonTable } from '../../components/tools/ToolContentSections';

const ciiData = {
    '2001-2002': 100,
    '2002-2003': 105,
    '2003-2004': 109,
    '2004-2005': 113,
    '2005-2006': 117,
    '2006-2007': 122,
    '2007-2008': 129,
    '2008-2009': 137,
    '2009-2010': 148,
    '2010-2011': 167,
    '2011-2012': 184,
    '2012-2013': 200,
    '2013-2014': 220,
    '2014-2015': 240,
    '2015-2016': 254,
    '2016-2017': 264,
    '2017-2018': 272,
    '2018-2019': 280,
    '2019-2020': 289,
    '2020-2021': 301,
    '2021-2022': 317,
    '2022-2023': 331,
    '2023-2024': 348,
    '2024-2025': 363,
    '2025-2026': 380,
};

const CG_FAQS = [
  {
    question: 'What is capital gains tax on property in India?',
    answer: 'Capital gains tax is levied on the profit earned from selling a property. If you hold the property for more than 24 months (changed from 36 months in Budget 2024), it is classified as Long Term Capital Gain (LTCG) taxed at 20% with indexation benefit. If held for less than 24 months, it is Short Term Capital Gain (STCG) added to your income and taxed at your slab rate.',
  },
  {
    question: 'What is indexation benefit in capital gains tax?',
    answer: 'Indexation adjusts your purchase price for inflation using the Cost Inflation Index (CII) published by the government. Formula: Indexed Cost = Purchase Price × (CII of Sale Year / CII of Purchase Year). This reduces your taxable capital gain significantly. For example, a property bought in 2015 for ₹50L and sold in 2025 for ₹1.5Cr has an indexed cost of ~₹71.5L (using CII 254→380), reducing gains from ₹1Cr to ~₹78.5L.',
  },
  {
    question: 'How can I save capital gains tax on property sale?',
    answer: 'Three main exemptions: (1) Section 54 — Reinvest LTCG into another residential property within 1 year before or 2 years after sale (3 years for construction). (2) Section 54EC — Invest up to ₹50L in capital gain bonds (NHAI, REC, PFC, IRFC) within 6 months. (3) Section 54F — Invest sale proceeds in residential property if you don\'t own more than one other house. Each has specific conditions and limits.',
  },
  {
    question: 'What is the difference between LTCG and STCG on property?',
    answer: 'LTCG (Long Term Capital Gain) applies when property is held for 24+ months. Tax rate: 20% with indexation benefit. STCG (Short Term Capital Gain) applies when held for less than 24 months. The gain is added to your total income and taxed at your applicable slab rate (5-30%). For most taxpayers, LTCG treatment is significantly more tax-efficient.',
  },
  {
    question: 'How much CII (Cost Inflation Index) for 2025-26?',
    answer: 'The CII for 2025-26 is 380 (expected). For 2024-25 it is 363, 2023-24 is 348, 2022-23 is 331. The government notifies CII each year. Our calculator includes the latest CII data for accurate indexation calculations.',
  },
  {
    question: 'Is there a tax on selling property without buying another?',
    answer: 'Yes. If you sell property and do not claim any exemption (Section 54, 54EC, or 54F), you must pay capital gains tax. For LTCG, that is 20% with indexation. For STCG, it is taxed at your income slab rate. To save tax without buying another property, invest in 54EC bonds (up to ₹50L) within 6 months of sale.',
  },
];

const HOW_TO_STEPS = [
  { name: 'Enter Sale and Purchase Prices', text: 'Input the sale price (total consideration) and the original purchase price of the property. Include the actual transaction values as per sale deed.' },
  { name: 'Select Purchase and Sale Years', text: 'Choose the financial years of purchase and sale. This determines if the gain is long-term (24+ months) or short-term, and which CII values to use for indexation.' },
  { name: 'Add Transfer Expenses', text: 'Enter brokerage, legal fees, stamp duty on sale, and other transfer costs. These are deductible from the sale price to arrive at net consideration.' },
  { name: 'Review Tax Calculation', text: 'The calculator shows asset type (LTCG/STCG), indexed cost, capital gains, and estimated tax liability. For LTCG, tax is 20% with indexation; for STCG, it follows your income slab.' },
  { name: 'Explore Exemptions', text: 'Check Section 54 (reinvestment in another property), Section 54EC (capital gain bonds up to ₹50L), or Section 54F (reinvest full sale proceeds) to reduce or eliminate tax liability.' },
];

const CapitalGainsCalculator = () => {
    const { t, i18n } = useTranslation('tools');
    const [salePrice, setSalePrice] = useState(5000000);
    const [purchasePrice, setPurchasePrice] = useState(2000000);
    const [purchaseYear, setPurchaseYear] = useState('2015-2016');
    const [saleYear, setSaleYear] = useState('2024-2025');
    const [transferExpenses, setTransferExpenses] = useState(50000);
    const [improvementCost] = useState(0);
    // CRITICAL FIX (audit 3.1): STCG on property is taxed at the applicable
    // income-tax slab rate (not 0, and not the 20% LTCG rate). We need the
    // user's slab rate to compute it correctly. Default 30% (highest slab).
    const [slabRate, setSlabRate] = useState(30);
    // AUDIT FIX (imp 3.5): reinvestment amounts for Section 54/54EC/54F.
    const [reinvest54, setReinvest54] = useState(0);
    const [reinvest54EC, setReinvest54EC] = useState(0);
    const [reinvest54F, setReinvest54F] = useState(0);

    // AUDIT FIX (shareable-link): read query params produced by
    // handleShareResults so a shared link restores the shared inputs instead
    // of showing defaults.
    const [searchParams] = useSearchParams();
    useEffect(() => {
        const sale = searchParams.get('sale');
        const purchase = searchParams.get('purchase');
        const py = searchParams.get('py');
        const sy = searchParams.get('sy');
        const expenses = searchParams.get('expenses');
        const slab = searchParams.get('slab');
        const allowedSlabs = new Set([0, 5, 20, 30]);
        if (sale !== null) setSalePrice(Number(sale) || 0);
        if (purchase !== null) setPurchasePrice(Number(purchase) || 0);
        if (py !== null && ciiData[py]) setPurchaseYear(py);
        if (sy !== null && ciiData[sy]) setSaleYear(sy);
        if (expenses !== null) setTransferExpenses(Number(expenses) || 0);
        if (slab !== null) {
            const parsedSlab = Number(slab);
            if (allowedSlabs.has(parsedSlab)) setSlabRate(parsedSlab);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const taxSummary = useMemo(() => {
        const pYearParts = purchaseYear.split('-');
        const sYearParts = saleYear.split('-');
        const pYear = parseInt(pYearParts[0]);
        const sYear = parseInt(sYearParts[0]);
        // Use the end year of purchase FY to avoid false LTCG at FY boundaries.
        // e.g. Purchase FY 2022-2023 (pEndYear=2023), Sale FY 2024-2025 (sYear=2024)
        // gives 2024-2023=1 < 2 → STCG (correct, holding could be ~13 months).
        // For LTCG the minimum gap must be 2: pEndYear=2021, sYear=2024 → 3 >= 2 → LTCG
        // (min holding: April 2024 - March 2022 = ~25 months → definitely LTCG).
        const pEndYear = pYearParts[1] ? parseInt(pYearParts[1]) : pYear;
        const isLongTerm = (sYear - pEndYear) >= 2;
        const gainType = isLongTerm ? 'Long Term Capital Asset (LTCG)' : 'Short Term Capital Asset (STCG)';

        const finalCost = isLongTerm ? (() => {
            const ciiSale = ciiData[saleYear] || 380;
            const ciiPurchase = ciiData[purchaseYear] || 100;
            return (purchasePrice * ciiSale) / ciiPurchase + improvementCost;
        })() : purchasePrice + improvementCost;

        const netSaleConsideration = salePrice - transferExpenses;
        const gain = netSaleConsideration - finalCost;
        // CRITICAL FIX (audit 3.1): STCG is taxed at the slab rate, not 0.
        // LTCG on real estate is taxed at 20% with indexation.
        const applicableRate = isLongTerm ? 0.20 : slabRate / 100;
        const taxLiability = gain > 0 ? Math.round(gain * applicableRate) : 0;

        // AUDIT FIX (imp 3.5): compute tax savings under Section 54/54EC/54F.
        // 54 & 54EC exempt based on capital gains reinvested (capped at 50L for 54EC).
        // 54F exempts proportionally based on net sale proceeds reinvested in a house
        // (only available if the sold asset is NOT a residential house).
        const gainForExemption = Math.max(gain, 0);
        const exempt54 = Math.min(reinvest54, gainForExemption);
        const exempt54EC = Math.min(reinvest54EC, gainForExemption, 5000000);
        // 54F: exemption = gain * (reinvested / netConsideration), full exempt if full proceeds reinvested.
        const exempt54F = netSaleConsideration > 0
            ? Math.min(gainForExemption * (reinvest54F / netSaleConsideration), gainForExemption)
            : 0;
        // Total exemption cannot exceed the gain; only LTCG qualifies for these sections.
        const totalExemption = isLongTerm
            ? Math.min(exempt54 + exempt54EC + exempt54F, gainForExemption)
            : 0;
        const taxableGainAfterExemption = Math.max(gainForExemption - totalExemption, 0);
        const taxAfterExemption = isLongTerm
            ? Math.round(taxableGainAfterExemption * applicableRate)
            : taxLiability;
        const taxSaved = Math.max(taxLiability - taxAfterExemption, 0);

        return {
            gainType,
            isLongTerm,
            indexedCost: Math.round(finalCost),
            capitalGain: Math.round(gain),
            taxLiability,
            applicableRatePercent: isLongTerm ? 20 : slabRate,
            // AUDIT FIX (3.4): flag a capital loss so the UI can warn the user.
            isCapitalLoss: gain < 0,
            netSaleConsideration: Math.round(netSaleConsideration),
            totalExemption: Math.round(totalExemption),
            taxAfterExemption: taxAfterExemption,
            taxSaved: taxSaved,
        };
    }, [improvementCost, purchasePrice, purchaseYear, salePrice, saleYear, transferExpenses, slabRate, reinvest54, reinvest54EC, reinvest54F]);

    const formatCurrency = (val) => {
        return new Intl.NumberFormat(i18n.language === 'hi' ? 'hi-IN' : 'en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(val);
    };

    // AUDIT FIX (imp 3.2): share results via URL query params encoding inputs.
    const handleShareResults = async () => {
        const params = new URLSearchParams({
            sale: salePrice,
            purchase: purchasePrice,
            py: purchaseYear,
            sy: saleYear,
            expenses: transferExpenses,
            slab: slabRate,
        });
        const url = `${window.location.origin}${window.location.pathname}?${params.toString()}`;
        try {
            await navigator.clipboard.writeText(url);
            toast.success(t('capitalGains.shareCopied', 'Shareable link copied to clipboard!'));
        } catch {
            toast.error(t('capitalGains.shareError', 'Could not copy link.'));
        }
    };

    const faqStructuredData = generateFaqStructuredData(CG_FAQS);
    const howToStructuredData = generateHowToStructuredData({
        name: 'How to Calculate Capital Gains Tax on Property Sale',
        description: 'Step-by-step guide to compute LTCG or STCG tax on your property sale with indexation and exemptions.',
        steps: HOW_TO_STEPS,
    });

    return (
        <>
            <SEO
                title={t('capitalGains.title')}
                description={t('capitalGains.description')}
                keywords={t('capitalGains.keywords')}
                canonical="/capital-gains-tax-calculator"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.capitalGains),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/tools' },
                        { name: toolSchemas.capitalGains.name, url: 'https://360ghar.com/capital-gains-tax-calculator' }
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
                                {/* Hero heading */}
                                <div className="text-center mb-4">
                                    <h1>Capital Gains Tax Calculator on Property (2026)</h1>
                                    <p className="text-muted">
                                        Calculate LTCG and STCG tax on property sale with indexation benefit, CII data, and Section 54/54EC exemption guidance.
                                    </p>
                                </div>

                                <div className="row g-4">
                                    <div className="col-lg-6">
                                        <div className="calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                                            <h4 className="mb-4">{t('capitalGains.transactionDetails')}</h4>

                                            <div className="mb-3">
                                                <label className="form-label">{t('capitalGains.salePrice')}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={salePrice}
                                                    onChange={(e) => setSalePrice(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('capitalGains.purchasePrice')}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={purchasePrice}
                                                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="row">
                                                <div className="col-6 mb-3">
                                                    <label className="form-label">{t('capitalGains.purchaseYear')}</label>
                                                    <select className="form-select" value={purchaseYear} onChange={(e) => setPurchaseYear(e.target.value)}>
                                                        {Object.keys(ciiData).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <label className="form-label">{t('capitalGains.saleYear')}</label>
                                                    <select className="form-select" value={saleYear} onChange={(e) => setSaleYear(e.target.value)}>
                                                        {[...Object.keys(ciiData)].reverse().map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('capitalGains.transferExpenses')}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={transferExpenses}
                                                    onChange={(e) => setTransferExpenses(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">
                                                    {t('capitalGains.slabRate')} (%)
                                                    <small className="d-block text-muted">
                                                        {t('capitalGains.slabRateHelp')}
                                                    </small>
                                                </label>
                                                <select
                                                    className="form-select"
                                                    value={slabRate}
                                                    onChange={(e) => setSlabRate(Number(e.target.value))}
                                                >
                                                    <option value={0}>0% (up to 2.5L)</option>
                                                    <option value={5}>5% (2.5L to 5L)</option>
                                                    <option value={20}>20% (5L to 10L)</option>
                                                    <option value={30}>30% (above 10L)</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6">
                                        <div className="results-card bg-white p-4 rounded-3 shadow-sm h-100 border border-light">
                                            <h4 className="mb-4">{t('capitalGains.taxCalculation')}</h4>

                                            <div className="mb-3">
                                                <label className="text-muted small fw-bold">{t('capitalGains.assetType')}</label>
                                                <div className={`fs-5 fw-bold ${taxSummary.isLongTerm ? 'text-success' : 'text-warning'}`}>
                                                    {taxSummary.isLongTerm ? t('capitalGains.longTerm') : t('capitalGains.shortTerm')}
                                                </div>
                                            </div>

                                            <div className="mb-3 p-3 bg-light rounded-2">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">{t('capitalGains.indexedCost')}</span>
                                                    <span className="fw-bold">{formatCurrency(taxSummary.indexedCost)}</span>
                                                </div>
                                                <div className="small text-muted fst-italic">
                                                    {t('capitalGains.indexedCostNote')}
                                                </div>
                                            </div>

                                            <div className="mb-4 p-3 bg-light rounded-2">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">{t('capitalGains.capitalGains')}</span>
                                                    <span className={`fw-bold ${taxSummary.capitalGain > 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatCurrency(taxSummary.capitalGain)}
                                                    </span>
                                                </div>
                                                {/* AUDIT FIX (3.4): warn on capital loss */}
                                                {taxSummary.isCapitalLoss && (
                                                    <div className="alert alert-warning py-2 px-3 mt-2 mb-0 small">
                                                        <i className="fas fa-exclamation-triangle me-1"></i>
                                                        {t('capitalGains.capitalLossWarning', 'You have a capital loss. No tax is payable; the loss can be set off against other capital gains or carried forward for 8 years.')}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="p-3 bg-main bg-opacity-10 rounded-2 border border-main">
                                                <label className="text-main small fw-bold">
                                                    {t('capitalGains.estimatedTaxLiability')}
                                                    <span className="ms-2 text-muted">
                                                        ({t('capitalGains.atRate', { rate: taxSummary.applicableRatePercent })})
                                                    </span>
                                                </label>
                                                <div className="display-6 fw-bold text-main">
                                                    {taxSummary.isLongTerm ? formatCurrency(taxSummary.taxLiability) : t('capitalGains.asPerTaxSlab')}
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    {taxSummary.isLongTerm
                                                        ? t('capitalGains.longTermTaxNote')
                                                        : t('capitalGains.shortTermTaxNote')}
                                                </div>
                                            </div>

                                            {/* AUDIT FIX (imp 3.2): share results button */}
                                            <button
                                                type="button"
                                                className="btn btn-sm btn-outline-main w-100 mt-3"
                                                onClick={handleShareResults}
                                            >
                                                <i className="fas fa-share-alt me-2"></i>{t('capitalGains.shareResults', 'Share Results')}
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* AUDIT FIX (imp 3.5): Section 54/54EC/54F tax savings calculator */}
                                {taxSummary.isLongTerm && taxSummary.capitalGain > 0 && (
                                    <div className="mt-4 p-4 bg-white rounded-3 shadow-sm border">
                                        <h2 className="h5 mb-3">{t('capitalGains.savingsCalcTitle', 'Tax Savings Calculator (Section 54 / 54EC / 54F)')}</h2>
                                        <p className="text-muted small mb-3">{t('capitalGains.savingsCalcDesc', 'Enter reinvestment amounts to see how much tax you can save. These exemptions apply only to long-term capital gains.')}</p>
                                        <div className="row g-3 mb-3">
                                            <div className="col-md-4">
                                                <label className="form-label small">Section 54 (new house)</label>
                                                <input type="number" className="form-control" value={reinvest54} min="0" onChange={(e) => setReinvest54(Math.max(0, Number(e.target.value)))} />
                                                <small className="text-muted">Reinvest gains in residential property</small>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small">Section 54EC (bonds, max ₹50L)</label>
                                                <input type="number" className="form-control" value={reinvest54EC} min="0" onChange={(e) => setReinvest54EC(Math.max(0, Number(e.target.value)))} />
                                                <small className="text-muted">NHAI/REC/PFC/IRFC bonds within 6 months</small>
                                            </div>
                                            <div className="col-md-4">
                                                <label className="form-label small">Section 54F (full proceeds)</label>
                                                <input type="number" className="form-control" value={reinvest54F} min="0" onChange={(e) => setReinvest54F(Math.max(0, Number(e.target.value)))} />
                                                <small className="text-muted">Reinvest net sale proceeds in a house</small>
                                            </div>
                                        </div>
                                        <div className="row g-3">
                                            <div className="col-md-4">
                                                <div className="p-3 bg-light rounded-2 text-center h-100">
                                                    <small className="text-muted d-block">{t('capitalGains.totalExemption', 'Total Exemption')}</small>
                                                    <span className="fw-bold text-success fs-5">{formatCurrency(taxSummary.totalExemption)}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="p-3 bg-light rounded-2 text-center h-100">
                                                    <small className="text-muted d-block">{t('capitalGains.taxAfterExemption', 'Tax After Exemption')}</small>
                                                    <span className="fw-bold text-main fs-5">{formatCurrency(taxSummary.taxAfterExemption)}</span>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="p-3 bg-main bg-opacity-10 rounded-2 text-center h-100 border border-main">
                                                    <small className="text-main d-block">{t('capitalGains.taxSaved', 'Tax Saved')}</small>
                                                    <span className="fw-bold text-main fs-5">{formatCurrency(taxSummary.taxSaved)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="mt-5">
                                    <h2 className="h5">{t('capitalGains.exemptionsTitle')}</h2>
                                    <p className="text-muted small">{t('capitalGains.exemptionsDesc')}</p>
                                    <ul className="text-muted small mt-2">
                                        <li>{t('capitalGains.exemption1')}</li>
                                        <li>{t('capitalGains.exemption2')}</li>
                                        <li>{t('capitalGains.exemption3')}</li>
                                    </ul>
                                    <p className="text-muted small">{t('capitalGains.exemptionBonds')}</p>
                                </div>

                                {/* Section 54 vs 54EC vs 54F Comparison */}
                                <ToolComparisonTable
                                    title="Capital Gains Exemption Comparison: Section 54 vs 54EC vs 54F"
                                    headers={['Section', 'Eligible Asset Sold', 'Where to Invest', 'Max Exemption', 'Lock-in Period', 'Time Limit to Invest']}
                                    rows={[
                                        [
                                            'Section 54',
                                            'Residential house property',
                                            'Another residential house property',
                                            'No limit (full capital gains exempt)',
                                            '3 years — cannot sell new property',
                                            '1 year before or 2 years after sale; 3 years if constructing',
                                        ],
                                        [
                                            'Section 54EC',
                                            'Any land or building (long-term)',
                                            'NHAI, REC, PFC, or IRFC bonds',
                                            '₹50 lakh (per financial year)',
                                            '5 years — bonds cannot be sold/pledged',
                                            'Within 6 months from the date of sale',
                                        ],
                                        [
                                            'Section 54F',
                                            'Any long-term capital asset (not a residential house)',
                                            'Residential house property',
                                            'No limit (proportional — based on reinvested amount vs net sale proceeds)',
                                            '3 years — cannot sell new property',
                                            '1 year before or 2 years after sale; 3 years if constructing',
                                        ],
                                    ]}
                                />

                                {/* How Indexation Works */}
                                <div className="mt-5 p-4 bg-light rounded-3 border">
                                    <h2 className="h5 mb-3">How Indexation Works</h2>
                                    <p className="text-muted">
                                        <strong>Indexation</strong> is a method to adjust the purchase price of an asset for inflation over the holding period. The government publishes a <strong>Cost Inflation Index (CII)</strong> each financial year. By inflating the original cost to current-year terms, indexation reduces the taxable capital gain and, consequently, your tax liability.
                                    </p>
                                    <p className="text-muted mb-2"><strong>Formula:</strong></p>
                                    <div className="p-3 bg-white rounded-2 border mb-3">
                                        <code className="fs-6">Indexed Cost of Acquisition = Purchase Price &times; (CII of Sale Year &divide; CII of Purchase Year)</code>
                                    </div>
                                    <p className="text-muted mb-2"><strong>Example with real numbers:</strong></p>
                                    <ul className="text-muted">
                                        <li>Purchase price in FY 2010-11: ₹30,00,000 &nbsp;|&nbsp; CII = 167</li>
                                        <li>Sale price in FY 2024-25: ₹1,20,00,000 &nbsp;|&nbsp; CII = 363</li>
                                        <li>Indexed cost = ₹30,00,000 &times; (363 &divide; 167) = <strong>₹65,20,958</strong></li>
                                        <li>Capital gain without indexation = ₹90,00,000</li>
                                        <li>Capital gain with indexation = ₹54,79,042 — a <strong>reduction of ₹35,20,958</strong></li>
                                        <li>Tax saved at 20% = approximately <strong>₹7,04,192</strong></li>
                                    </ul>
                                    <p className="text-muted mb-0">
                                        As this example shows, indexation can reduce your taxable gain by nearly 40% over a 14-year holding period. The longer you hold the property and the higher inflation rises, the greater the indexation benefit. This is why long-term capital gains on property are taxed at a flat 20% with indexation — a significantly lower effective rate than income tax slabs for most taxpayers.
                                    </p>
                                </div>

                                {/* FAQ */}
                                <ToolFaq faqs={CG_FAQS} heading={t('capitalGains.faqHeading')} />

                                {/* Related Tools */}
                                <ToolRelatedLinks
                                  heading={t('capitalGains.relatedTools')}
                                  links={[
                                    { to: '/emi-calculator', label: t('capitalGains.relatedEmi'), icon: 'fas fa-calculator' },
                                    { to: '/loan-eligibility-calculator', label: t('capitalGains.relatedLoan'), icon: 'fas fa-university' },
                                    { to: '/area-calculator', label: t('capitalGains.relatedArea'), icon: 'fas fa-ruler-combined' },
                                    { to: '/area-converter', label: t('capitalGains.relatedConverter'), icon: 'fas fa-exchange-alt' },
                                    { to: '/stamp-duty-calculator', label: t('capitalGains.relatedStampDuty'), icon: 'fas fa-stamp' },
                                    { to: '/blog', label: t('capitalGains.relatedBlog'), icon: 'fas fa-blog' },
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

export default CapitalGainsCalculator;
