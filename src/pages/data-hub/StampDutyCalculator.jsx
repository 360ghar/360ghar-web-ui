import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData, generateHowToStructuredData } from '../../seo/structuredData';
import { generateToolSchema, toolSchemas } from '../../seo/toolSchemas';
import { ToolFaq, ToolRelatedLinks } from '../../components/tools/ToolContentSections';
import { dataHubService } from '../../services/dataHubService';
import { useDataHubStore } from '../../store/dataHubStore';

const STAMP_DUTY_HOW_TO_STEPS = [
  { name: 'Enter property value in rupees', text: 'Input the total property value or consideration amount in Indian Rupees.' },
  { name: 'Select buyer type (male/female/joint)', text: 'Choose the buyer category to apply the correct stamp duty rate: 7% for male, 5% for female, or 6% for joint buyers.' },
  { name: 'Optionally select sector for circle rates', text: 'Pick a sector in Gurugram to compare the stamp duty against circle rates for that area.' },
  { name: 'View calculated stamp duty and registration charges', text: 'See the breakdown of stamp duty, 1% registration fee, and total registration cost instantly.' },
];

const BUYER_RATES = [
  { value: 'male', rate: 7 },
  { value: 'female', rate: 5 },
  { value: 'joint', rate: 6 },
];

const FAQS = [
  {
    question: 'How is stamp duty calculated in Haryana in 2026?',
    answer: 'In Haryana, stamp duty is calculated as a percentage of the property\'s transaction value or the circle rate, whichever is higher. As of 2026, the rates are 7% for male buyers, 5% for female buyers in urban areas, and 3% for properties in rural areas. An additional 1% registration fee is charged separately.',
  },
  {
    question: 'What is the stamp duty rate for female buyers in Haryana?',
    answer: 'Female buyers in Haryana pay 5% stamp duty on property purchases in urban areas, compared to 7% for male buyers. This 2% concession was introduced to encourage women\'s homeownership. The property must be registered in the woman\'s name to avail this benefit.',
  },
  {
    question: 'Is stamp duty payable on gift deeds in Haryana?',
    answer: 'Yes, stamp duty is payable on gift deeds in Haryana. When property is gifted to a blood relative (parent, child, sibling), the stamp duty is typically 3-5% depending on the relationship. For non-relatives, the standard rates apply. The deed must be registered at the Sub-Registrar\'s office.',
  },
  {
    question: 'Can stamp duty be paid online in Haryana?',
    answer: 'Yes, Haryana offers online stamp duty payment through the e-STAMPS portal (https://www.shcilestamp.com). You can generate an e-stamp paper online using net banking, debit card, or UPI. This is the preferred method as it eliminates the need for physical stamp papers.',
  },
  {
    question: 'What happens if a property is registered below the circle rate?',
    answer: 'If a property is registered below the circle rate (also called ready reckoner rate or collector rate), the sub-registrar may refuse registration. Additionally, both buyer and seller can face penalties under Section 50C of the Income Tax Act. The difference between circle rate and actual price is treated as income and taxed accordingly.',
  },
  {
    question: 'What is the difference between stamp duty and registration charges?',
    answer: 'Stamp duty is a tax paid on the property transaction value, while registration charges are fees paid for the legal registration of the property document. In Haryana, stamp duty ranges from 5-7% while registration charges are typically 1% of the property value. Both are mandatory for a valid property transfer.',
  },
  {
    question: 'Is stamp duty refundable if the deal falls through?',
    answer: 'Yes, stamp duty can be refunded if the property deal falls through before registration. You need to apply for a refund within 6 months from the date of execution of the document. A processing fee of 1-2% is deducted. If the document was already registered, the refund process is more complex and may require a court order.',
  },
  {
    question: 'How does stamp duty affect home loan eligibility?',
    answer: 'Stamp duty and registration charges are additional costs that reduce your effective home loan eligibility. Banks typically fund 80-90% of the property value but stamp duty must be paid from your own funds. For a ₹50 lakh property in Haryana, stamp duty (7%) and registration (1%) add ₹4 lakh to your upfront costs.',
  },
  {
    question: 'What is the stamp duty for resale properties in Haryana?',
    answer: 'Stamp duty for resale properties in Haryana is the same as for new properties — 7% for male buyers and 5% for female buyers in urban areas. The duty is calculated on the higher of the actual transaction value or the circle rate. The seller must also clear any pending property taxes before registration.',
  },
];

const fmt = (n, lang) => `₹${Number(n).toLocaleString(lang === 'hi' ? 'hi-IN' : 'en-IN')}`;

const StampDutyCalculator = () => {
  const { t, i18n } = useTranslation('data-hub');
  const [tSeo] = useTranslation('seo');
  const { circleRateSectors, fetchCircleRateSectors } = useDataHubStore();
  const [form, setForm] = useState({ property_value: '', buyer_type: 'male', sector: '', property_type: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCircleRateSectors(); }, [fetchCircleRateSectors]);

  const calculate = async () => {
    if (!form.property_value) return;
    try {
      const data = await dataHubService.calculateStampDuty({
        property_value: Number(form.property_value),
        buyer_type: form.buyer_type,
        sector: form.sector || undefined,
      });
      setResult(data);
    } catch (e) {
      console.error('Stamp duty calculation error', e);
    } finally {
      setLoading(false);
    }
  };

  const BUYER_TYPES = BUYER_RATES.map(({ value, rate }) => ({
    value,
    label: t(`stampDuty.buyerTypes.${value}`),
    rate,
  }));

  const selectedBuyer = BUYER_TYPES.find(b => b.value === form.buyer_type);

  return (
    <>
      <SEO
        title={tSeo('stampDuty.title')}
        description={tSeo('stampDuty.description')}
        keywords="Haryana stamp duty calculator, Gurugram property registration charges, DLC rate stamp duty, stamp duty female buyer Haryana, property registration cost Gurgaon"
        canonical="/stamp-duty-calculator"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Stamp Duty Calculator', url: 'https://360ghar.com/stamp-duty-calculator' },
          ]),
          generateToolSchema(toolSchemas.stampDutyCalculator),
          generateHowToStructuredData({
            name: 'How to Calculate Stamp Duty in Haryana',
            description: 'Calculate stamp duty and registration charges for property registration in Gurugram, Haryana based on buyer type and property value.',
            steps: STAMP_DUTY_HOW_TO_STEPS,
          }),
          generateFaqStructuredData(FAQS),
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />
        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row">
              <div className="col-lg-7">
                <h1 className="fs-28 fw-600 mb-10">{t('stampDuty.title')}</h1>
                <p className="mb-30 color-text-3">{t('stampDuty.description')}</p>

                <div className="p-30 border-radius-8 mb-30" style={{ background: '#f9fafb', border: '1px solid #e5e7eb' }}>
                  <div className="row mb-20">
                    <div className="col-12">
                      <label className="form-label fw-500">{t('stampDuty.propertyValue')}</label>
                      <input type="number" className="form-control"
                        placeholder={t('stampDuty.propertyValuePlaceholder')}
                        value={form.property_value}
                        onChange={(e) => setForm(f => ({ ...f, property_value: e.target.value }))} />
                    </div>
                  </div>

                  <div className="row mb-20">
                    <div className="col-12">
                      <label className="form-label fw-500">{t('stampDuty.buyerType')}</label>
                      <div className="d-flex gap-10">
                        {BUYER_TYPES.map(({ value, label, rate }) => (
                          <button key={value}
                            className={`btn btn-sm ${form.buyer_type === value ? 'btn-primary' : 'btn-outline-secondary'}`}
                            onClick={() => setForm(f => ({ ...f, buyer_type: value }))}>
                            {label} ({rate}%)
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="row mb-20">
                    <div className="col-sm-6">
                      <label className="form-label fw-500">{t('stampDuty.sectorOptional')}</label>
                      <select className="form-select" value={form.sector}
                        onChange={(e) => setForm(f => ({ ...f, sector: e.target.value }))}>
                        <option value="">{t('stampDuty.selectSector')}</option>
                        {circleRateSectors.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>

                  <button className="btn btn-primary w-100" onClick={calculate} disabled={loading || !form.property_value}>
                    {loading ? t('stampDuty.calculating') : t('stampDuty.calculate')}
                  </button>
                </div>

                {/* Result */}
                {result && (
                  <div className="p-30 border-radius-8" style={{ background: '#fff', border: '1px solid #d1fae5' }}>
                    <h3 className="fs-20 fw-600 mb-20">{t('stampDuty.result')}</h3>
                    <div className="row">
                      {[
                        { label: t('stampDuty.propertyValueLabel'), value: fmt(result.property_value, i18n.language) },
                        { label: t('stampDuty.stampDutyLabel', { rate: selectedBuyer?.rate, type: selectedBuyer?.label }), value: fmt(result.stamp_duty_amount, i18n.language) },
                        { label: t('stampDuty.registrationFee'), value: fmt(result.registration_fee, i18n.language) },
                        { label: t('stampDuty.totalCost'), value: fmt(result.total_cost, i18n.language), highlight: true },
                      ].map(({ label, value, highlight }) => (
                        <div key={label} className="col-sm-6 mb-15">
                          <div className={`p-15 border-radius-6 ${highlight ? '' : ''}`}
                            style={{ background: highlight ? '#ecfdf5' : '#f9fafb', border: `1px solid ${highlight ? '#6ee7b7' : '#e5e7eb'}` }}>
                            <p className="fs-12 color-text-3 mb-5">{label}</p>
                            <p className={`fs-20 fw-700 mb-0 ${highlight ? 'color-primary' : ''}`}>{value}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                    {result.current_bank_rate && (
                      <p className="mt-15 fs-13 color-text-3">
                        {t('stampDuty.homeLoanRate', { rate: result.current_bank_rate })}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Sidebar: Rate Reference Table */}
              <div className="col-lg-5 mt-40 mt-lg-0">
                <div className="p-25 border-radius-8" style={{ background: '#f9fafb', border: '1px solid #e5e7eb', position: 'sticky', top: 80 }}>
                  <h3 className="fs-18 fw-600 mb-15">{t('stampDuty.rateReference')}</h3>
                  <table className="table table-sm table-bordered mb-20">
                    <thead className="table-light"><tr><th>{t('stampDuty.tableHeaders.buyerType')}</th><th>{t('stampDuty.tableHeaders.stampDuty')}</th><th>{t('stampDuty.tableHeaders.regFee')}</th></tr></thead>
                    <tbody>
                      {BUYER_TYPES.map(({ label, rate }) => (
                        <tr key={label}><td>{label}</td><td>{rate}%</td><td>1%</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p className="fs-12 color-text-3">{t('stampDuty.source')}</p>
                </div>
              </div>
            </div>

            {/* Educational Content: Understanding Stamp Duty in Haryana */}
            <div className="mt-5">
              <h2 className="h4 mb-3">Understanding Stamp Duty in Haryana</h2>
              <p>
                Stamp duty is a mandatory tax levied by the state government on property transactions in India. In Haryana, it is governed by the Indian Stamp Act, 1899, as amended by the state. Every property buyer must pay stamp duty at the time of registration, and failure to do so renders the document legally invalid and inadmissible as evidence in court.
              </p>
              <p>
                {"The stamp duty amount is calculated as a percentage of the property's transaction value or the circle rate (also known as the collector rate or DLC rate), whichever is higher. This ensures that the government collects revenue based on the fair market value of the property. The circle rate is determined by the state government and varies by locality, sector, and type of property."}
              </p>
              <p>
                {"Haryana offers a gender-based concession on stamp duty rates. Male buyers pay 7% stamp duty on property purchases in urban areas, while female buyers benefit from a reduced rate of 5%. This 2% concession was introduced to promote women's homeownership and financial independence. Joint buyers (property registered in both male and female names) pay an intermediate rate of 6%. For properties in rural areas of Haryana, the stamp duty rate is lower at 3%."}
              </p>
              <p>
                {"In addition to stamp duty, buyers must pay a 1% registration fee to the Sub-Registrar's office. This fee covers the cost of legally recording the property transfer in government records. Together, stamp duty and registration charges form a significant part of the total transaction cost that every buyer must budget for in addition to the property price."}
              </p>
            </div>

            {/* Educational Content: Registration Process in Haryana */}
            <div className="mt-5">
              <h2 className="h4 mb-3">Registration Process in Haryana</h2>
              <p>
                Once you have calculated the stamp duty and registration charges using the calculator above, follow these steps to complete your property registration in Haryana:
              </p>
              <ol className="mb-3">
                <li className="mb-2"><strong>Calculate stamp duty using this calculator</strong> — Enter your property value and buyer type to get the exact stamp duty amount and registration charges. Keep this breakdown handy for the registration process.</li>
                <li className="mb-2"><strong>Purchase e-stamp paper from SHCIL portal</strong> — Visit <a href="https://www.shcilestamp.com" target="_blank" rel="noopener noreferrer">www.shcilestamp.com</a> to generate e-stamp paper. You can pay online using net banking, debit card, or UPI. This is the preferred and most convenient method, eliminating the need for physical stamp papers.</li>
                <li className="mb-2"><strong>Visit Sub-Registrar office with documents</strong> — Carry the e-stamp paper, original property documents, identity proof (Aadhaar, PAN), passport-sized photographs, and the sale deed. Both buyer and seller (or their authorized representatives with a power of attorney) must be present.</li>
                <li className="mb-2"><strong>Biometric verification and signing</strong>{" — At the Sub-Registrar's office, biometric data (fingerprints and photographs) of both parties will be captured. All parties must sign the sale deed in the presence of the Sub-Registrar. Two witnesses are also required."}</li>
                <li className="mb-2"><strong>Collect registered document</strong>{" — After successful registration, you will receive a receipt. The registered document can typically be collected after 7-15 working days. You can track the status online through the Haryana government's e-District portal."}</li>
              </ol>
            </div>

            {/* Educational Content: Circle Rate vs Market Rate */}
            <div className="mt-5">
              <h2 className="h4 mb-3">Circle Rate vs Market Rate</h2>
              <p>
                <strong>Circle rate</strong> (also called the collector rate, DLC rate, or ready reckoner rate) is the minimum price at which a property can be legally registered in a particular area. It is set by the state government and revised periodically to reflect market conditions. Each sector, colony, and locality in Gurugram has its own circle rate based on factors like proximity to main roads, infrastructure development, and property type.
              </p>
              <p>
                The circle rate matters for stamp duty because the government charges stamp duty on the higher of the actual transaction value or the circle rate. If you buy a property for ₹50 lakh but the circle rate values it at ₹60 lakh, you will pay stamp duty on ₹60 lakh. This prevents undervaluation of properties and ensures adequate revenue collection.
              </p>
              <p>
                When the market rate is below the circle rate (which can happen in a sluggish market), both buyer and seller face complications. The sub-registrar may refuse to register the transaction at a value below the circle rate. Under Section 50C of the Income Tax Act, the difference between the circle rate and the actual transaction price can be treated as income for the seller and taxed accordingly. Under Section 56(2)(x) of the Income Tax Act, the buyer may also face tax implications if the property is received below the circle rate.
              </p>
              <p>
                To check circle rates for your area in Gurugram, you can use the sector selector in this calculator or visit the official Haryana Revenue Department website. Circle rates are updated annually and vary significantly between sectors — premium areas like DLF Phase 1-5 and Golf Course Road have higher rates compared to developing sectors on Sohna Road or New Gurugram.
              </p>
            </div>

            {/* AUDIT FIX (imp 3.13): stamp duty comparison across states */}
            {form.property_value && Number(form.property_value) > 0 && (() => {
              const value = Number(form.property_value);
              const STATE_RATES = [
                { state: 'Haryana (Male)', rate: 0.07 },
                { state: 'Haryana (Female)', rate: 0.05 },
                { state: 'Delhi (Male)', rate: 0.04 },
                { state: 'Delhi (Female)', rate: 0.06 },
                { state: 'UP (Male)', rate: 0.07 },
                { state: 'Rajasthan (Male)', rate: 0.05 },
              ];
              return (
                <div className="mt-5">
                  <h2 className="h4 mb-3">{t('stampDuty.stateComparisonTitle', 'Stamp Duty Comparison Across States')}</h2>
                  <p className="text-muted">{t('stampDuty.stateComparisonDesc', 'Indicative stamp duty for your property value across NCR states. Registration charges (1%) extra.')}</p>
                  <div className="table-responsive">
                    <table className="table table-bordered table-sm">
                      <thead className="table-light">
                        <tr>
                          <th>{t('stampDuty.stateCol', 'State / Buyer')}</th>
                          <th>{t('stampDuty.rateCol', 'Rate')}</th>
                          <th>{t('stampDuty.stampDutyCol', 'Stamp Duty')}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {STATE_RATES.map((s) => (
                          <tr key={s.state}>
                            <td className="fw-600">{s.state}</td>
                            <td>{(s.rate * 100).toFixed(0)}%</td>
                            <td className="fw-bold">₹{Math.round(value * s.rate).toLocaleString('en-IN')}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })()}
            {/* FAQ Section */}
            <ToolFaq faqs={FAQS} heading="Stamp Duty & Registration FAQs" />

            {/* Related Links */}
            <ToolRelatedLinks
              heading="Related Calculators & Tools"
              links={[
                { to: '/emi-calculator', label: 'EMI Calculator', icon: 'fas fa-calculator' },
                { to: '/loan-eligibility-calculator', label: 'Loan Eligibility', icon: 'fas fa-clipboard-check' },
                { to: '/capital-gains-tax-calculator', label: 'Capital Gains', icon: 'fas fa-chart-line' },
                { to: '/area-calculator', label: 'Carpet Area Calculator', icon: 'fas fa-ruler-combined' },
              ]}
            />

          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default StampDutyCalculator;
