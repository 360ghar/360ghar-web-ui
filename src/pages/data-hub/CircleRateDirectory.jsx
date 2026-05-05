import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData, generateFaqStructuredData } from '../../seo/structuredData';
import { dataHubService } from '../../services/dataHubService';
import { ToolFaq } from '../../components/tools/ToolContentSections';

const FAQS = [
  {
    question: 'What are circle rates in Gurugram?',
    answer: 'Circle rates (also called DLC rates or collector rates) are the minimum property valuation rates set by the Haryana government for each sector and colony. They are used to calculate stamp duty on property registrations. No property sale can be registered below the circle rate for that area.',
  },
  {
    question: 'How are circle rates different from market rates?',
    answer: 'Circle rates are government-set minimum values used for stamp duty calculation, while market rates are the actual prices at which properties are bought and sold. Market rates are typically 20-50% higher than circle rates in prime areas. Circle rates serve as a floor price for registration purposes.',
  },
  {
    question: 'Do circle rates affect stamp duty?',
    answer: 'Yes, stamp duty is calculated on the higher of the circle rate or the actual transaction value. If you buy a property below the circle rate, you still pay stamp duty based on the circle rate. This ensures the government collects a minimum amount of stamp duty on every property transaction.',
  },
  {
    question: 'How often do circle rates change in Haryana?',
    answer: 'Circle rates in Haryana are revised periodically by the IGRS (Inspector General of Registration and Stamps). Revisions typically happen every 1-2 years, though there is no fixed schedule. The government issues gazette notifications when new rates come into effect.',
  },
  {
    question: 'Can I negotiate below circle rate?',
    answer: 'You can negotiate the actual purchase price, but the property cannot be registered below the circle rate. Even if you buy below circle rate, stamp duty will be calculated on the circle rate value. Effectively, the government treats the circle rate as the minimum declared value for that property.',
  },
];
import StampDutyWidget from '../../components/data-hub/StampDutyWidget';

const CircleRateDirectory = () => {
  const { t } = useTranslation('data-hub');
  const [rates, setRates] = useState([]);
  const [sectors, setSectors] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({ sector: '', property_type: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch sectors for dropdown
  useEffect(() => {
    dataHubService.getCircleRateSectors()
      .then(setSectors)
      .catch(() => {});
  }, []);

  useEffect(() => {
    dataHubService.getCircleRates({ ...filters, page, limit: 20 })
      .then((data) => {
        setRates(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [filters, page]);

  const PROPERTY_TYPES = ['residential', 'commercial', 'plot', 'industrial'];

  return (
    <>
      <SEO
        title="Gurugram Circle Rates 2024 | Sector-wise DLC Rates | 360Ghar"
        description="Official circle rates (DLC rates) for all sectors in Gurugram. Check IGRS Haryana stamp duty rates for residential, commercial, and plot properties sector-by-sector."
        keywords="Gurugram circle rates, DLC rates Gurugram, IGRS Haryana rates, stamp duty circle rate, sector wise circle rate Gurgaon 2024"
        canonical="/circle-rates"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Circle Rates', url: 'https://360ghar.com/circle-rates' },
          ]),
          {
            '@type': 'ItemList',
            name: 'Gurugram Circle Rates (DLC Rates)',
            description: 'Official circle rates for all sectors in Gurugram.',
            url: 'https://360ghar.com/circle-rates',
            numberOfItems: total,
          },
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
              <div className="col-12">
                <h1 className="fs-28 fw-600 mb-10">{t('circleRates.title')}</h1>
                <p className="mb-30 color-text-3">{t('circleRates.description')}</p>
              </div>
            </div>

            {/* Filters */}
            <div className="row mb-20">
              <div className="col-md-4 col-sm-6 mb-10">
                <select className="form-select form-select-sm"
                  value={filters.sector}
                  onChange={(e) => { setFilters(f => ({ ...f, sector: e.target.value })); setPage(1); }}>
                  <option value="">{t('circleRates.allSectors')}</option>
                  {sectors.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="col-md-4 col-sm-6 mb-10">
                <select className="form-select form-select-sm"
                  value={filters.property_type}
                  onChange={(e) => { setFilters(f => ({ ...f, property_type: e.target.value })); setPage(1); }}>
                  <option value="">{t('circleRates.allPropertyTypes')}</option>
                  {PROPERTY_TYPES.map(pt => <option key={pt} value={pt} style={{ textTransform: 'capitalize' }}>{pt}</option>)}
                </select>
              </div>
            </div>

            {/* Table */}
            {loading ? (
              <p>{t('circleRates.loading')}</p>
            ) : error ? (
              <p className="color-danger">{t('circleRates.error')}</p>
            ) : (
              <>
                <p className="mb-15 fs-14 color-text-3">{t('circleRates.ratesFound', { count: total })}</p>
                <div className="table-responsive mb-30">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>{t('circleRates.tableHeaders.sector')}</th>
                        <th>{t('circleRates.tableHeaders.colony')}</th>
                        <th>{t('circleRates.tableHeaders.propertyType')}</th>
                        <th>{t('circleRates.tableHeaders.ratePerSqYd')}</th>
                        <th>{t('circleRates.tableHeaders.ratePerSqFt')}</th>
                        <th>{t('circleRates.tableHeaders.year')}</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {rates.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-20">{t('circleRates.noResults')}</td></tr>
                      ) : rates.map((rate) => (
                        <tr key={rate.id}>
                          <td>{rate.sector}</td>
                          <td>{rate.colony || '—'}</td>
                          <td style={{ textTransform: 'capitalize' }}>{rate.property_type}</td>
                          <td>{rate.rate_per_sqyd ? `₹${Number(rate.rate_per_sqyd).toLocaleString('en-IN')}` : '—'}</td>
                          <td>{rate.rate_per_sqft ? `₹${Number(rate.rate_per_sqft).toLocaleString('en-IN')}` : '—'}</td>
                          <td>{rate.revision_year}</td>
                          <td>
                            <I18nLink to={`/circle-rate/${rate.slug}`} className="btn-sm">{t('circleRates.tableHeaders.view')}</I18nLink>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {total > 20 && (
                  <div className="d-flex gap-10 mb-30">
                    <button className="btn btn-sm btn-outline-secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>{t('circleRates.pagination.prev')}</button>
                    <span className="align-self-center fs-14">{t('circleRates.pagination.page', { current: page, total: Math.ceil(total / 20) })}</span>
                    <button className="btn btn-sm btn-outline-secondary" disabled={page >= Math.ceil(total / 20)} onClick={() => setPage(p => p + 1)}>{t('circleRates.pagination.next')}</button>
                  </div>
                )}
              </>
            )}

            {/* Stamp Duty Widget */}
            <div className="row mt-20">
              <div className="col-lg-6">
                <h3 className="fs-20 fw-600 mb-15">{t('circleRates.quickCalc')}</h3>
                <StampDutyWidget />
              </div>
            </div>

            <ToolFaq faqs={FAQS} />
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default CircleRateDirectory;
