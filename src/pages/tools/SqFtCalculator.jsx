import { useMemo, useState } from 'react';
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
import { ToolFaq, ToolRelatedLinks, ToolComparisonTable } from '../../components/tools/ToolContentSections';

// Reuse the AreaConverter layout styles (hero + content sections + calculator form).
import './AreaConverter.scss';

const SqFtCalculator = () => {
    const { t } = useTranslation('tools');

    const FAQS = [
        { question: t('sqFtCalculator.faqs.q1.question'), answer: t('sqFtCalculator.faqs.q1.answer') },
        { question: t('sqFtCalculator.faqs.q2.question'), answer: t('sqFtCalculator.faqs.q2.answer') },
        { question: t('sqFtCalculator.faqs.q3.question'), answer: t('sqFtCalculator.faqs.q3.answer') },
        { question: t('sqFtCalculator.faqs.q4.question'), answer: t('sqFtCalculator.faqs.q4.answer') },
        { question: t('sqFtCalculator.faqs.q5.question'), answer: t('sqFtCalculator.faqs.q5.answer') },
        { question: t('sqFtCalculator.faqs.q6.question'), answer: t('sqFtCalculator.faqs.q6.answer') },
    ];

    const HOW_TO_STEPS = [
        { name: t('sqFtCalculator.howToSteps.step1.name'), text: t('sqFtCalculator.howToSteps.step1.text') },
        { name: t('sqFtCalculator.howToSteps.step2.name'), text: t('sqFtCalculator.howToSteps.step2.text') },
        { name: t('sqFtCalculator.howToSteps.step3.name'), text: t('sqFtCalculator.howToSteps.step3.text') },
        { name: t('sqFtCalculator.howToSteps.step4.name'), text: t('sqFtCalculator.howToSteps.step4.text') },
    ];

    // Conversion rates to square feet (base unit). Same rates as AreaConverter.
    const conversionRates = useMemo(() => ({
        sq_ft: 1,
        sq_mt: 10.7639,
        sq_yd: 9,
        acre: 43560,
        gaj: 9,
    }), []);

    const unitLabels = {
        sq_ft: t('sqFtCalculator.sqFt'),
        sq_mt: t('sqFtCalculator.sqMt'),
        sq_yd: t('sqFtCalculator.sqYd'),
        acre: t('sqFtCalculator.acre'),
        gaj: t('sqFtCalculator.gaj'),
    };

    const [amount, setAmount] = useState(100);
    const [fromUnit, setFromUnit] = useState('sq_mt');
    const [toUnit, setToUnit] = useState('sq_ft');

    const result = useMemo(() => {
        const inSqFt = amount * conversionRates[fromUnit];
        return inSqFt / conversionRates[toUnit];
    }, [amount, fromUnit, toUnit, conversionRates]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    return (
        <>
            <SEO
                title={t('sqFtCalculator.title')}
                description={t('sqFtCalculator.description')}
                keywords={t('sqFtCalculator.keywords')}
                canonical="/sq-ft-calculator"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.sqFtCalculator),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/tools' },
                        { name: toolSchemas.sqFtCalculator.name, url: 'https://360ghar.com/sq-ft-calculator' },
                    ]),
                    generateFaqStructuredData(FAQS),
                    generateHowToStructuredData({
                        name: 'How to Convert Area to Square Feet',
                        description: 'Convert carpet area, sq m, sq yd, gaj, or acres to square feet step by step',
                        steps: HOW_TO_STEPS,
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
                            <div className="col-lg-8">
                                <div className="area-conv-hero">
                                    <h1>{t('sqFtCalculator.heroTitle')}</h1>
                                    <p>{t('sqFtCalculator.heroDesc')}</p>
                                </div>

                                {/* Converter */}
                                <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                    <h2 className="h4 mb-4">{t('sqFtCalculator.converterHeading')}</h2>
                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-5">
                                            <label className="form-label" htmlFor="sqft-input">{t('sqFtCalculator.amount')}</label>
                                            <input
                                                id="sqft-input"
                                                type="number"
                                                className="form-control mb-2"
                                                value={amount}
                                                min="0"
                                                onChange={(e) => setAmount(Math.max(0, Number(e.target.value)))}
                                            />
                                            <select
                                                className="form-select"
                                                value={fromUnit}
                                                onChange={(e) => setFromUnit(e.target.value)}
                                                aria-label={t('sqFtCalculator.fromUnit')}
                                            >
                                                {Object.keys(unitLabels).map((key) => (
                                                    <option key={key} value={key}>{unitLabels[key]}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="col-md-2 text-center pt-md-4">
                                            <button
                                                className="btn btn-outline-main rounded-circle p-2"
                                                onClick={handleSwap}
                                                title={t('sqFtCalculator.swapUnits')}
                                                aria-label={t('sqFtCalculator.swapUnits')}
                                            >
                                                <i className="fas fa-exchange-alt"></i>
                                            </button>
                                        </div>

                                        <div className="col-md-5">
                                            <label className="form-label">{t('sqFtCalculator.result')}</label>
                                            <div className="form-control mb-2 bg-light fw-bold text-main fs-5">
                                                {parseFloat(result.toFixed(4))}
                                            </div>
                                            <select
                                                className="form-select"
                                                value={toUnit}
                                                onChange={(e) => setToUnit(e.target.value)}
                                                aria-label={t('sqFtCalculator.toUnit')}
                                            >
                                                {Object.keys(unitLabels).map((key) => (
                                                    <option key={key} value={key}>{unitLabels[key]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className="area-conv-content-section">
                                    <h2>{t('sqFtCalculator.explanationTitle')}</h2>
                                    <p>{t('sqFtCalculator.explanationDesc')}</p>
                                </div>

                                {/* Rates table */}
                                <ToolComparisonTable
                                    title={t('sqFtCalculator.ratesTitle')}
                                    headers={[t('sqFtCalculator.unitCol'), t('sqFtCalculator.sqFtCol')]}
                                    rows={[
                                        ['1 Sq. Ft.', '1'],
                                        ['1 Square Meter', '10.7639'],
                                        ['1 Square Yard (Gaj)', '9'],
                                        ['1 Gaj', '9'],
                                        ['1 Acre', '43,560'],
                                    ]}
                                />

                                <ToolFaq faqs={FAQS} heading={t('sqFtCalculator.faqTitle')} />

                                <ToolRelatedLinks
                                    heading={t('areaConverter.relatedTools', 'Related Tools & Resources')}
                                    links={[
                                        { to: '/area-calculator', label: t('areaCalculator.heroTitle'), icon: 'fas fa-ruler-combined' },
                                        { to: '/mofa-to-rera-converter', label: t('mofaToRera.heroTitle'), icon: 'fas fa-arrows-rotate' },
                                        { to: '/acre-in-gaj', label: t('acreInGaj.heroTitle'), icon: 'fas fa-mountain' },
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

export default SqFtCalculator;
