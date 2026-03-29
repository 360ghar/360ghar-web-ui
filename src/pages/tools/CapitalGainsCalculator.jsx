import { useMemo, useState } from 'react';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';

import SEO from '../../common/SEO';
import Cta from '../../components/ui/Cta';
import { siteMetadata } from '../../seo/siteMetadata';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';

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
    '2024-2025': 363
};

const CapitalGainsCalculator = () => {
    const [salePrice, setSalePrice] = useState(5000000);
    const [purchasePrice, setPurchasePrice] = useState(2000000);
    const [purchaseYear, setPurchaseYear] = useState('2015-2016');
    const [saleYear, setSaleYear] = useState('2024-2025');
    const [transferExpenses, setTransferExpenses] = useState(50000);
    const [improvementCost] = useState(0);

    const taxSummary = useMemo(() => {
        const pYear = parseInt(purchaseYear.split('-')[0]);
        const sYear = parseInt(saleYear.split('-')[0]);

        // Determine Gain Type (Long Term if held > 24 months)
        // Simplified: Using financial year difference for estimation
        const isLongTerm = (sYear - pYear) >= 2;
        const gainType = isLongTerm ? 'Long Term Capital Asset (LTCG)' : 'Short Term Capital Asset (STCG)';

        const finalCost = isLongTerm ? (() => {
            // Calculate Indexed Cost of Acquisition
            // Formula: Cost * (CII of Sale Year / CII of Purchase Year)
            const ciiSale = ciiData[saleYear] || 363;
            const ciiPurchase = ciiData[purchaseYear] || 100;

            return (purchasePrice * ciiSale) / ciiPurchase + improvementCost;
        })() : purchasePrice + improvementCost;

        const netSaleConsideration = salePrice - transferExpenses;
        const gain = netSaleConsideration - finalCost;
        const taxLiability = isLongTerm && gain > 0 ? Math.round(gain * 0.20) : 0;

        return {
            gainType,
            indexedCost: Math.round(finalCost),
            capitalGain: Math.round(gain),
            taxLiability,
        };
    }, [improvementCost, purchasePrice, purchaseYear, salePrice, saleYear, transferExpenses]);

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
                title="Capital Gains Tax Calculator India | Property LTCG & STCG Calculator | 360Ghar"
                description="Calculate Capital Gains Tax on property sale in India. Check Long Term (LTCG) and Short Term (STCG) tax liability with indexation benefits. Plan your property sale tax efficiently."
                keywords="capital gains tax calculator property India, LTCG on property, STCG on property, property sale tax calculator, indexation benefit calculator, income tax on property sale, 360ghar tax tools"
                canonical="/capital-gains-tax-calculator"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.capitalGains),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/emi-calculator' },
                        { name: toolSchemas.capitalGains.name, url: 'https://360ghar.com/capital-gains-tax-calculator' }
                    ])
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
                                            <h4 className="mb-4">Transaction Details</h4>

                                            <div className="mb-3">
                                                <label className="form-label">Sale Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={salePrice}
                                                    onChange={(e) => setSalePrice(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Purchase Price (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={purchasePrice}
                                                    onChange={(e) => setPurchasePrice(Number(e.target.value))}
                                                />
                                            </div>

                                            <div className="row">
                                                <div className="col-6 mb-3">
                                                    <label className="form-label">Purchase Year</label>
                                                    <select className="form-select" value={purchaseYear} onChange={(e) => setPurchaseYear(e.target.value)}>
                                                        {Object.keys(ciiData).map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-6 mb-3">
                                                    <label className="form-label">Sale Year</label>
                                                    <select className="form-select" value={saleYear} onChange={(e) => setSaleYear(e.target.value)}>
                                                        {[...Object.keys(ciiData)].reverse().map(year => (
                                                            <option key={year} value={year}>{year}</option>
                                                        ))}
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">Transfer Expenses (Brokerage, Legal) (₹)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={transferExpenses}
                                                    onChange={(e) => setTransferExpenses(Number(e.target.value))}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-6">
                                        <div className="results-card bg-white p-4 rounded-3 shadow-sm h-100 border border-light">
                                            <h4 className="mb-4">Tax Calculation</h4>

                                            <div className="mb-3">
                                                <label className="text-muted small fw-bold">ASSET TYPE</label>
                                                <div className={`fs-5 fw-bold ${taxSummary.gainType.includes('Long') ? 'text-success' : 'text-warning'}`}>
                                                    {taxSummary.gainType}
                                                </div>
                                            </div>

                                            <div className="mb-3 p-3 bg-light rounded-2">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Indexed Cost of Acquisition</span>
                                                    <span className="fw-bold">{formatCurrency(taxSummary.indexedCost)}</span>
                                                </div>
                                                <div className="small text-muted fst-italic">
                                                    (Purchase Price adjusted for inflation using CII)
                                                </div>
                                            </div>

                                            <div className="mb-4 p-3 bg-light rounded-2">
                                                <div className="d-flex justify-content-between mb-2">
                                                    <span className="text-muted">Capital Gains</span>
                                                    <span className={`fw-bold ${taxSummary.capitalGain > 0 ? 'text-success' : 'text-danger'}`}>
                                                        {formatCurrency(taxSummary.capitalGain)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-main bg-opacity-10 rounded-2 border border-main">
                                                <label className="text-main small fw-bold">ESTIMATED TAX LIABILITY</label>
                                                <div className="display-6 fw-bold text-main">
                                                    {taxSummary.gainType.includes('Long') ? formatCurrency(taxSummary.taxLiability) : 'As per Tax Slab'}
                                                </div>
                                                <div className="small text-muted mt-1">
                                                    {taxSummary.gainType.includes('Long')
                                                        ? '@ 20% on gains with indexation benefit'
                                                        : 'Short term gains are added to your total income and taxed as per your slab.'}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <h5>Exemptions (Section 54)</h5>
                                    <p className="text-muted small">
                                        You can save tax on Long Term Capital Gains by reinvesting the gain amount into another residential property within:
                                        <ul className="mt-2">
                                            <li>1 year before the sale</li>
                                            <li>2 years after the sale (for purchase)</li>
                                            <li>3 years after the sale (for construction)</li>
                                        </ul>
                                        Or by investing in 54EC Capital Gain Bonds (max ₹50 Lakhs) within 6 months.
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

export default CapitalGainsCalculator;
