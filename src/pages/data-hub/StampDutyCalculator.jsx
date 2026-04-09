import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { generateToolSchema } from '../../seo/toolSchemas';
import { toolSchemas } from '../../seo/toolSchemas';
import { dataHubService } from '../../services/dataHubService';
import { useDataHubStore } from '../../store/dataHubStore';

const BUYER_TYPES = [
  { value: 'male', label: 'Male', rate: 7 },
  { value: 'female', label: 'Female', rate: 5 },
  { value: 'joint', label: 'Joint', rate: 6 },
];

const fmt = (n) => `₹${Number(n).toLocaleString('en-IN')}`;

const StampDutyCalculator = () => {
  const { t } = useTranslation('data-hub');
  const { circleRateSectors, fetchCircleRateSectors } = useDataHubStore();
  const [form, setForm] = useState({ property_value: '', buyer_type: 'male', sector: '', property_type: '' });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

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

  const selectedBuyer = BUYER_TYPES.find(b => b.value === form.buyer_type);

  return (
    <>
      <SEO
        title="Haryana Stamp Duty Calculator 2024 | Gurugram Property Registration Cost | 360Ghar"
        description="Calculate stamp duty and registration charges for property in Gurugram, Haryana. Male: 7%, Female: 5%, Joint: 6%. Includes circle rate comparison and EMI estimation."
        keywords="Haryana stamp duty calculator, Gurugram property registration charges, DLC rate stamp duty, stamp duty female buyer Haryana, property registration cost Gurgaon"
        canonical="/stamp-duty-calculator"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Stamp Duty Calculator', url: 'https://360ghar.com/stamp-duty-calculator' },
          ]),
          generateToolSchema(
            toolSchemas.stampDutyCalculator.name,
            toolSchemas.stampDutyCalculator.description,
            toolSchemas.stampDutyCalculator.keywords,
            toolSchemas.stampDutyCalculator.category,
          ),
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
                        { label: t('stampDuty.propertyValueLabel'), value: fmt(result.property_value) },
                        { label: t('stampDuty.stampDutyLabel', { rate: selectedBuyer?.rate, type: selectedBuyer?.label }), value: fmt(result.stamp_duty_amount) },
                        { label: t('stampDuty.registrationFee'), value: fmt(result.registration_fee) },
                        { label: t('stampDuty.totalCost'), value: fmt(result.total_cost), highlight: true },
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
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default StampDutyCalculator;
