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

// Conversion rates to square feet (base unit). Same rates as AreaConverter.
const CONVERSION_RATES = {
    acre: 43560,
    gaj: 9,
    sq_ft: 1,
};

const AcreInGaj = () => {
    const { t } = useTranslation('tools');

    const FAQS = [
        { question: t('acreInGaj.faqs.q1.question'), answer: t('acreInGaj.faqs.q1.answer') },
        { question: t('acreInGaj.faqs.q2.question'), answer: t('acreInGaj.faqs.q2.answer') },
        { question: t('acreInGaj.faqs.q3.question'), answer: t('acreInGaj.faqs.q3.answer') },
        { question: t('acreInGaj.faqs.q4.question'), answer: t('acreInGaj.faqs.q4.answer') },
        { question: t('acreInGaj.faqs.q5.question'), answer: t('acreInGaj.faqs.q5.answer') },
        { question: t('acreInGaj.faqs.q6.question'), answer: t('acreInGaj.faqs.q6.answer') },
    ];

    const HOW_TO_STEPS = [
        { name: t('acreInGaj.howToSteps.step1.name'), text: t('acreInGaj.howToSteps.step1.text') },
        { name: t('acreInGaj.howToSteps.step2.name'), text: t('acreInGaj.howToSteps.step2.text') },
        { name: t('acreInGaj.howToSteps.step3.name'), text: t('acreInGaj.howToSteps.step3.text') },
        { name: t('acreInGaj.howToSteps.step4.name'), text: t('acreInGaj.howToSteps.step4.text') },
    ];

    const unitLabels = {
        acre: t('acreInGaj.acre'),
        gaj: t('acreInGaj.gaj'),
        sq_ft: t('acreInGaj.sqFt'),
    };

    const [amount, setAmount] = useState(1);
    const [fromUnit, setFromUnit] = useState('acre');
    const [toUnit, setToUnit] = useState('gaj');

    const result = useMemo(() => {
        const inSqFt = amount * CONVERSION_RATES[fromUnit];
        return inSqFt / CONVERSION_RATES[toUnit];
    }, [amount, fromUnit, toUnit]);

    const handleSwap = () => {
        setFromUnit(toUnit);
        setToUnit(fromUnit);
    };

    return (
        <>
            <SEO
                title={t('acreInGaj.title')}
                description={t('acreInGaj.description')}
                keywords={t('acreInGaj.keywords')}
                canonical="/acre-in-gaj"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.acreInGaj),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/tools' },
                        { name: toolSchemas.acreInGaj.name, url: 'https://360ghar.com/acre-in-gaj' },
                    ]),
                    generateFaqStructuredData(FAQS),
                    generateHowToStructuredData({
                        name: 'How to Convert Acre to Gaj',
                        description: 'Convert acres to gaj, sq ft, or sq yd step by step',
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
                                    <h1>{t('acreInGaj.heroTitle')}</h1>
                                    <p>{t('acreInGaj.heroDesc')}</p>
                                </div>

                                {/* Headline answer */}
                                <div className="p-4 rounded-3 shadow-sm mb-4 text-center" style={{ backgroundColor: '#fff5eb' }}>
                                    <div className="display-6 fw-bold text-dark">{t('acreInGaj.headlineAnswer')}</div>
                                    <div className="small text-muted mt-2">{t('acreInGaj.headlineSub')}</div>
                                </div>

                                {/* Converter */}
                                <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                    <h2 className="h4 mb-4">{t('acreInGaj.converterHeading')}</h2>
                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-5">
                                            <label className="form-label" htmlFor="acre-gaj-input">{t('acreInGaj.amount')}</label>
                                            <input
                                                id="acre-gaj-input"
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
                                                aria-label={t('acreInGaj.fromUnit')}
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
                                                title={t('acreInGaj.swapUnits')}
                                                aria-label={t('acreInGaj.swapUnits')}
                                            >
                                                <i className="fas fa-exchange-alt"></i>
                                            </button>
                                        </div>

                                        <div className="col-md-5">
                                            <label className="form-label">{t('acreInGaj.result')}</label>
                                            <div className="form-control mb-2 bg-light fw-bold text-main fs-5">
                                                {parseFloat(result.toFixed(4))}
                                            </div>
                                            <select
                                                className="form-select"
                                                value={toUnit}
                                                onChange={(e) => setToUnit(e.target.value)}
                                                aria-label={t('acreInGaj.toUnit')}
                                            >
                                                {Object.keys(unitLabels).map((key) => (
                                                    <option key={key} value={key}>{unitLabels[key]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                {/* Common conversions table */}
                                <ToolComparisonTable
                                    title={t('acreInGaj.tableTitle')}
                                    headers={[t('acreInGaj.acreCol'), t('acreInGaj.gajCol'), t('acreInGaj.sqFtCol')]}
                                    rows={[
                                        ['0.25 Acre', '1,210 Gaj', '10,890 Sq. Ft.'],
                                        ['0.5 Acre', '2,420 Gaj', '21,780 Sq. Ft.'],
                                        ['1 Acre', '4,840 Gaj', '43,560 Sq. Ft.'],
                                        ['2 Acres', '9,680 Gaj', '87,120 Sq. Ft.'],
                                        ['5 Acres', '24,200 Gaj', '2,17,800 Sq. Ft.'],
                                    ]}
                                />

                                {/* Explanation */}
                                <div className="area-conv-content-section">
                                    <h2>{t('acreInGaj.explanationTitle')}</h2>
                                    <p>{t('acreInGaj.explanationDesc')}</p>
                                </div>

                                <ToolFaq faqs={FAQS} heading={t('acreInGaj.faqTitle')} />

                                <ToolRelatedLinks
                                    heading={t('areaConverter.relatedTools', 'Related Tools & Resources')}
                                    links={[
                                        { to: '/area-converter', label: t('areaConverter.heroTitle'), icon: 'fas fa-exchange-alt' },
                                        { to: '/sq-ft-calculator', label: t('sqFtCalculator.heroTitle'), icon: 'fas fa-square' },
                                        { to: '/area-calculator', label: t('areaCalculator.heroTitle'), icon: 'fas fa-ruler-combined' },
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

export default AcreInGaj;
