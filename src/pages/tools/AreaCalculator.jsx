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

import './AreaCalculator.scss';

const AreaCalculator = () => {
    const { t } = useTranslation('tools');

    const AREA_CALCULATOR_FAQS = [
        { question: t('areaCalculator.faqs.q1.question'), answer: t('areaCalculator.faqs.q1.answer') },
        { question: t('areaCalculator.faqs.q2.question'), answer: t('areaCalculator.faqs.q2.answer') },
        { question: t('areaCalculator.faqs.q3.question'), answer: t('areaCalculator.faqs.q3.answer') },
        { question: t('areaCalculator.faqs.q4.question'), answer: t('areaCalculator.faqs.q4.answer') },
        { question: t('areaCalculator.faqs.q5.question'), answer: t('areaCalculator.faqs.q5.answer') },
        { question: t('areaCalculator.faqs.q6.question'), answer: t('areaCalculator.faqs.q6.answer') },
        { question: t('areaCalculator.faqs.q7.question'), answer: t('areaCalculator.faqs.q7.answer') },
        { question: t('areaCalculator.faqs.q8.question'), answer: t('areaCalculator.faqs.q8.answer') },
        { question: t('areaCalculator.faqs.q9.question'), answer: t('areaCalculator.faqs.q9.answer') },
    ];

    const AREA_CALCULATOR_HOW_TO_STEPS = [
        { name: t('areaCalculator.howToSteps.step1.name'), text: t('areaCalculator.howToSteps.step1.text') },
        { name: t('areaCalculator.howToSteps.step2.name'), text: t('areaCalculator.howToSteps.step2.text') },
        { name: t('areaCalculator.howToSteps.step3.name'), text: t('areaCalculator.howToSteps.step3.text') },
        { name: t('areaCalculator.howToSteps.step4.name'), text: t('areaCalculator.howToSteps.step4.text') },
    ];

    const [superArea, setSuperArea] = useState(1000);
    const [loading, setLoading] = useState(30);
    // CRITICAL FIX (audit 3.3): the built-up area multiplier was hardcoded
    // to 1.15 with no explanation. Make it a user-editable input with a
    // sensible default and a tooltip, and compute it as
    // carpet * (1 + builtUpLoading/100) so the relationship is explicit.
    const [builtUpLoading, setBuiltUpLoading] = useState(15);
    const [faqOpenIndex, setFaqOpenIndex] = useState(0);

    const { carpetArea, builtUpArea, loadingArea } = useMemo(() => {
        const calculatedCarpet = superArea * ((100 - loading) / 100);
        const calculatedBuiltUp = calculatedCarpet * (1 + builtUpLoading / 100);

        return {
            carpetArea: Math.round(calculatedCarpet),
            builtUpArea: Math.min(Math.round(calculatedBuiltUp), superArea),
            // Loading area = super area minus carpet area (the "common" portion).
            loadingArea: Math.max(Math.round(superArea - calculatedCarpet), 0),
        };
    }, [superArea, loading, builtUpLoading]);

    return (
        <>
            <SEO
                title={t('areaCalculator.title')}
                description={t('areaCalculator.description')}
                keywords={t('areaCalculator.keywords')}
                canonical="/area-calculator"
                image={siteMetadata.defaultOgImage}
                type="website"
                structuredData={[
                    generateToolSchema(toolSchemas.areaCalculator),
                    generateBreadcrumbStructuredData([
                        { name: 'Home', url: 'https://360ghar.com/' },
                        { name: 'Tools', url: 'https://360ghar.com/tools' },
                        { name: toolSchemas.areaCalculator.name, url: 'https://360ghar.com/area-calculator' }
                    ]),
                    generateFaqStructuredData(AREA_CALCULATOR_FAQS),
                    generateHowToStructuredData({
                        name: 'How to Calculate Property Area',
                        description: 'Calculate carpet area, built-up area, and super built-up area step by step',
                        steps: AREA_CALCULATOR_HOW_TO_STEPS,
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
                            <div className="col-lg-10">
                                <div className="area-calc-hero">
                                    <h1>{t('areaCalculator.heroTitle')}</h1>
                                    <p>{t('areaCalculator.heroDesc')}</p>
                                </div>

                                <div className="row g-4">
                                    <div className="col-lg-5">
                                        <div className="calculator-form bg-white p-4 rounded-3 shadow-sm h-100">
                                            <h2 className="mb-4 h4">{t('areaCalculator.enterPropertyDetails')}</h2>

                                            <div className="mb-3">
                                                <label className="form-label">{t('areaCalculator.superBuiltupArea')}</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    value={superArea}
                                                    onChange={(e) => setSuperArea(Number(e.target.value))}
                                                />
                                                <small className="text-muted">{t('areaCalculator.superBuiltupHint')}</small>
                                            </div>

                                            <div className="mb-3">
                                                <label className="form-label">{t('areaCalculator.loadingFactor')}</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <input
                                                        type="range"
                                                        className="form-range flex-grow-1"
                                                        min="15"
                                                        max="50"
                                                        value={loading}
                                                        onChange={(e) => setLoading(Number(e.target.value))}
                                                    />
                                                    <span className="fw-bold" style={{width: '50px'}}>{loading}%</span>
                                                </div>
                                                <small className="text-muted">{t('areaCalculator.loadingHint')}</small>
                                            </div>
                                            <div className="mb-3">
                                                <label className="form-label">{t('areaCalculator.builtUpLoadingFactor')}</label>
                                                <div className="d-flex align-items-center gap-2">
                                                    <input
                                                        type="range"
                                                        className="form-range flex-grow-1"
                                                        min="0"
                                                        max="40"
                                                        value={builtUpLoading}
                                                        onChange={(e) => setBuiltUpLoading(Number(e.target.value))}
                                                    />
                                                    <span className="fw-bold" style={{width: '50px'}}>{builtUpLoading}%</span>
                                                </div>
                                                <small className="text-muted">{t('areaCalculator.builtUpLoadingHint')}</small>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="col-lg-7">
                                        <div className="results-card bg-white p-4 rounded-3 shadow-sm h-100">
                                            <h2 className="mb-4 h4">{t('areaCalculator.areaBreakdown')}</h2>

                                            <div className="mb-4 p-3 rounded-3" style={{backgroundColor: '#fff5eb'}}>
                                                <label className="text-success fw-bold small">{t('areaCalculator.estimatedCarpetArea')}</label>
                                                <div className="display-6 fw-bold text-dark">{carpetArea} <span className="fs-5 text-muted">{t('areaCalculator.sqFt')}</span></div>
                                                <div className="small text-muted mt-1">
                                                    {t('areaCalculator.carpetDesc')}
                                                </div>
                                            </div>

                                            <div className="row g-3">
                                                <div className="col-md-6">
                                                    <div className="p-3 bg-light rounded-3">
                                                        <label className="text-muted small fw-bold">{t('areaCalculator.builtUpArea')}</label>
                                                        <div className="fs-4 fw-bold">{builtUpArea} <span className="fs-6">{t('areaCalculator.sqFt')}</span></div>
                                                        <small className="text-muted">{t('areaCalculator.builtUpHint')}</small>
                                                    </div>
                                                </div>
                                                <div className="col-md-6">
                                                    <div className="p-3 bg-light rounded-3">
                                                        <label className="text-muted small fw-bold">{t('areaCalculator.loadingArea')}</label>
                                                        <div className="fs-4 fw-bold">{loadingArea} <span className="fs-6">{t('areaCalculator.sqFt')}</span></div>
                                                        <small className="text-muted">{t('areaCalculator.loadingAreaHint')}</small>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-5">
                                    <h2 className="mb-3">{t('areaCalculator.understandingTerms')}</h2>
                                    <div className="row g-4">
                                        <div className="col-md-4">
                                            <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                <h3 className="text-main h5">{t('areaCalculator.carpetAreaTitle')}</h3>
                                                <p className="small mb-0">{t('areaCalculator.carpetAreaDesc')}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                <h3 className="text-main h5">{t('areaCalculator.builtUpAreaTitle')}</h3>
                                                <p className="small mb-0">{t('areaCalculator.builtUpAreaDesc')}</p>
                                            </div>
                                        </div>
                                        <div className="col-md-4">
                                            <div className="bg-white p-3 rounded-3 shadow-sm h-100">
                                                <h3 className="text-main h5">{t('areaCalculator.superBuiltUpAreaTitle')}</h3>
                                                <p className="small mb-0">{t('areaCalculator.superBuiltUpAreaDesc')}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="area-calc-content-section">
                                    <h2>{t('areaCalculator.carpetToBuiltUpTitle')}</h2>
                                    <p>{t('areaCalculator.carpetToBuiltUpDesc')}</p>
                                </div>

                                <div className="area-calc-content-section">
                                    <h2>{t('areaCalculator.reraVsMofaTitle')}</h2>
                                    <p>{t('areaCalculator.reraVsMofaDesc')}</p>
                                </div>

                                <div className="area-calc-faq-section">
                                    <h2 className="mb-4">{t('areaCalculator.faqTitle')}</h2>
                                    <div className="area-calc-faq-list">
                                        {AREA_CALCULATOR_FAQS.map((faq, index) => (
                                            <div className="area-calc-faq-item" key={index}>
                                                <button
                                                    className="area-calc-faq-item__question"
                                                    aria-expanded={faqOpenIndex === index}
                                                    aria-controls={`area-calc-faq-answer-${index}`}
                                                    onClick={() => setFaqOpenIndex(faqOpenIndex === index ? -1 : index)}
                                                >
                                                    <span>{faq.question}</span>
                                                    <span className="area-calc-faq-item__icon">
                                                        <i className={`fas ${faqOpenIndex === index ? 'fa-minus' : 'fa-plus'}`} />
                                                    </span>
                                                </button>
                                                <div
                                                    id={`area-calc-faq-answer-${index}`}
                                                    className={`area-calc-faq-item__answer ${faqOpenIndex === index ? 'open' : ''}`}
                                                    role="region"
                                                    aria-label={faq.question}
                                                >
                                                    <p>{faq.answer}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
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

export default AreaCalculator;
