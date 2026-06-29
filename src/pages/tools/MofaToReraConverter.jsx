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

// MOFA → RERA carpet conversion.
// RERA carpet (RERA Act 2016 §2(k)) is typically 5-8% larger than MOFA carpet
// because it INCLUDES internal partition walls that MOFA excluded. RERA carpet
// still EXCLUDES exclusive balconies/verandahs/open terraces, external walls,
// and service shafts — the size gap vs MOFA comes from the internal walls, not
// open areas. The 6% factor is an estimate; the real ratio depends on the
// number/thickness of internal walls.
// We use a 6% uplift (the midpoint) for MOFA→RERA, and ~5.66% reduction for
// RERA→MOFA so the round-trip is consistent (1 / 1.06 ≈ 0.9434).
const MOFA_TO_RERA_FACTOR = 1.06;

const MofaToReraConverter = () => {
    const { t } = useTranslation('tools');

    const FAQS = [
        { question: t('mofaToRera.faqs.q1.question'), answer: t('mofaToRera.faqs.q1.answer') },
        { question: t('mofaToRera.faqs.q2.question'), answer: t('mofaToRera.faqs.q2.answer') },
        { question: t('mofaToRera.faqs.q3.question'), answer: t('mofaToRera.faqs.q3.answer') },
        { question: t('mofaToRera.faqs.q4.question'), answer: t('mofaToRera.faqs.q4.answer') },
        { question: t('mofaToRera.faqs.q5.question'), answer: t('mofaToRera.faqs.q5.answer') },
        { question: t('mofaToRera.faqs.q6.question'), answer: t('mofaToRera.faqs.q6.answer') },
    ];

    const HOW_TO_STEPS = [
        { name: t('mofaToRera.howToSteps.step1.name'), text: t('mofaToRera.howToSteps.step1.text') },
        { name: t('mofaToRera.howToSteps.step2.name'), text: t('mofaToRera.howToSteps.step2.text') },
        { name: t('mofaToRera.howToSteps.step3.name'), text: t('mofaToRera.howToSteps.step3.text') },
        { name: t('mofaToRera.howToSteps.step4.name'), text: t('mofaToRera.howToSteps.step4.text') },
    ];

    const [value, setValue] = useState(1000);
    const [direction, setDirection] = useState('mofa_to_rera'); // 'mofa_to_rera' | 'rera_to_mofa'

    const { result, delta } = useMemo(() => {
        const out = direction === 'mofa_to_rera'
            ? value * MOFA_TO_RERA_FACTOR
            : value / MOFA_TO_RERA_FACTOR;
        const diff = out - value;
        return { result: Math.round(out), delta: Math.round(diff) };
    }, [value, direction]);

    const handleSwap = () => {
        setDirection((d) => (d === 'mofa_to_rera' ? 'rera_to_mofa' : 'mofa_to_rera'));
    };

    return (
        <>
            <SEO
                title={t('mofaToRera.title')}
                description={t('mofaToRera.description')}
                keywords={t('mofaToRera.keywords')}
                canonical="/mofa-to-rera-converter"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.mofaToRera),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/tools' },
                        { name: toolSchemas.mofaToRera.name, url: 'https://360ghar.com/mofa-to-rera-converter' },
                    ]),
                    generateFaqStructuredData(FAQS),
                    generateHowToStructuredData({
                        name: 'How to Convert MOFA to RERA Carpet Area',
                        description: 'Convert MOFA carpet area to RERA carpet area (or vice versa) step by step',
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
                                    <h1>{t('mofaToRera.heroTitle')}</h1>
                                    <p>{t('mofaToRera.heroDesc')}</p>
                                </div>

                                {/* Converter */}
                                <div className="calculator-form bg-white p-4 rounded-3 shadow-sm">
                                    <h2 className="h4 mb-4">{t('mofaToRera.converterHeading')}</h2>
                                    <div className="row g-4 align-items-center">
                                        <div className="col-md-5">
                                            <label className="form-label" htmlFor="mofa-rera-input">
                                                {direction === 'mofa_to_rera' ? t('mofaToRera.mofaCarpet') : t('mofaToRera.reraCarpet')}
                                            </label>
                                            <input
                                                id="mofa-rera-input"
                                                type="number"
                                                className="form-control"
                                                value={value}
                                                min="0"
                                                onChange={(e) => setValue(Math.max(0, Number(e.target.value)))}
                                            />
                                            <small className="text-muted">Sq. Ft.</small>
                                        </div>

                                        <div className="col-md-2 text-center pt-md-4">
                                            <button
                                                className="btn btn-outline-main rounded-circle p-2"
                                                onClick={handleSwap}
                                                title={t('areaConverter.swapUnits', 'Swap')}
                                                aria-label="Swap conversion direction"
                                            >
                                                <i className="fas fa-exchange-alt"></i>
                                            </button>
                                        </div>

                                        <div className="col-md-5">
                                            <label className="form-label">
                                                {direction === 'mofa_to_rera' ? t('mofaToRera.reraCarpet') : t('mofaToRera.mofaCarpet')}
                                            </label>
                                            <div className="form-control bg-light fw-bold text-main fs-5">
                                                {result.toLocaleString('en-IN')} <span className="fs-6 text-muted">Sq. Ft.</span>
                                            </div>
                                            <small className="text-muted">
                                                {t('mofaToRera.deltaLabel')}: {delta >= 0 ? '+' : ''}{delta.toLocaleString('en-IN')} Sq. Ft.
                                            </small>
                                        </div>
                                    </div>
                                    <div className="mt-3">
                                        <small className="text-muted">{t('mofaToRera.resultHint')}</small>
                                    </div>
                                </div>

                                {/* Explanation */}
                                <div className="area-conv-content-section">
                                    <h2>{t('mofaToRera.explanationTitle')}</h2>
                                    <p><strong>MOFA carpet area:</strong> {t('mofaToRera.explanationMofa')}</p>
                                    <p><strong>RERA carpet area:</strong> {t('mofaToRera.explanationRera')}</p>
                                    <p>{t('mofaToRera.explanationWhy')}</p>
                                </div>

                                {/* Formula */}
                                <div className="area-conv-content-section">
                                    <h2>{t('mofaToRera.formulaTitle')}</h2>
                                    <p>{t('mofaToRera.formulaDesc')}</p>
                                    <ToolComparisonTable
                                        title={t('mofaToRera.tableTitle')}
                                        headers={[t('mofaToRera.unitCol'), t('mofaToRera.reraCol')]}
                                        rows={[
                                            ['1,000 Sq. Ft.', '1,060 Sq. Ft.'],
                                            ['2,000 Sq. Ft.', '2,120 Sq. Ft.'],
                                            ['5,000 Sq. Ft.', '5,300 Sq. Ft.'],
                                            ['10,000 Sq. Ft.', '10,600 Sq. Ft.'],
                                        ]}
                                    />
                                </div>

                                <ToolFaq faqs={FAQS} heading={t('mofaToRera.faqTitle')} />

                                <ToolRelatedLinks
                                    heading={t('areaConverter.relatedTools', 'Related Tools & Resources')}
                                    links={[
                                        { to: '/area-calculator', label: t('areaCalculator.heroTitle'), icon: 'fas fa-ruler-combined' },
                                        { to: '/sq-ft-calculator', label: t('sqFtCalculator.heroTitle'), icon: 'fas fa-square' },
                                        { to: '/area-converter', label: t('areaConverter.heroTitle'), icon: 'fas fa-exchange-alt' },
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

export default MofaToReraConverter;
