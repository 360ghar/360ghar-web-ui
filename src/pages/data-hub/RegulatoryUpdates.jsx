import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import Pagination from '../../common/ui/Pagination';
import GazetteItem from '../../components/data-hub/GazetteItem';
import { dataHubService } from '../../services/dataHubService';

const PAGE_LIMIT = 20;

const RegulatoryUpdates = () => {
  const { t } = useTranslation('data-hub');
  const [activeTab, setActiveTab] = useState('');
  const [notifications, setNotifications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const totalPages = Math.ceil(total / PAGE_LIMIT);

  const TABS = [
    { key: '', label: t('regulatoryUpdates.tabs.all') },
    { key: 'land_acquisition', label: t('regulatoryUpdates.tabs.landAcquisition') },
    { key: 'rate_revision', label: t('regulatoryUpdates.tabs.rateRevision') },
    { key: 'policy', label: t('regulatoryUpdates.tabs.policy') },
    { key: 'clu_change', label: t('regulatoryUpdates.tabs.cluChange') },
  ];

  useEffect(() => {
    const params = { page, limit: PAGE_LIMIT };
    if (activeTab) params.type = activeTab;

    dataHubService.getGazetteNotifications(params)
      .then((data) => {
        setNotifications(data?.items || []);
        setTotal(data?.total || 0);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [activeTab, page]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    setPage(1);
  };

  const activeTabLabel = TABS.find(tab => tab.key === activeTab)?.label || t('regulatoryUpdates.tabs.all');

  return (
    <>
      <SEO
        title="Regulatory Updates Gurugram | Haryana Gazette Notifications | 360Ghar"
        description="Stay updated with official Haryana Gazette notifications affecting Gurugram real estate. Land acquisition notices, circle rate revisions, policy changes, and CLU updates."
        keywords="Haryana Gazette notifications, Gurugram regulatory updates, land acquisition notices, circle rate revision, CLU change Gurgaon, HRERA policy update, 360Ghar data hub"
        canonical="/regulatory-updates"
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Regulatory Updates', url: 'https://360ghar.com/regulatory-updates' },
          ]),
          {
            '@type': 'CollectionPage',
            name: 'Regulatory Updates — Haryana Gazette',
            description: 'Official notifications from the Haryana Government affecting real estate in Gurugram.',
            url: 'https://360ghar.com/regulatory-updates',
          },
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            <div className="row mb-20">
              <div className="col-12">
                <h1 className="fs-28 fw-600 mb-10">{t('regulatoryUpdates.title')}</h1>
                <p className="mb-0 color-text-3">
                  {t('regulatoryUpdates.description')}
                </p>
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="row mb-30">
              <div className="col-12">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', borderBottom: '1px solid #e5e7eb', paddingBottom: 0 }}>
                  {TABS.map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => handleTabChange(tab.key)}
                      style={{
                        padding: '8px 18px',
                        border: 'none',
                        background: 'none',
                        cursor: 'pointer',
                        fontWeight: activeTab === tab.key ? 700 : 500,
                        color: activeTab === tab.key ? 'var(--main-color, #2563eb)' : '#6b7280',
                        borderBottom: activeTab === tab.key ? '2px solid var(--main-color, #2563eb)' : '2px solid transparent',
                        marginBottom: -1,
                        fontSize: 14,
                        transition: 'color 0.15s',
                      }}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Content */}
            {loading ? (
              <div className="row g-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="col-12">
                    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, background: '#fff' }}>
                      <div style={{ height: 14, background: '#e5e7eb', borderRadius: 4, marginBottom: 10, width: '60%' }}></div>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, marginBottom: 8, width: '80%' }}></div>
                      <div style={{ height: 12, background: '#f3f4f6', borderRadius: 4, width: '50%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-40">
                <p className="color-danger fs-16">{t('regulatoryUpdates.error')}</p>
              </div>
            ) : (
              <>
                <p className="mb-20 fs-14 color-text-3">
                  {t('regulatoryUpdates.notificationsFound', { count: total, suffix: total !== 1 ? 's' : '' })}
                </p>

                {notifications.length === 0 ? (
                  <div className="text-center py-40">
                    <p className="fs-16 color-text-3">{t('regulatoryUpdates.noNotifications', { tab: activeTabLabel })}</p>
                  </div>
                ) : (
                  <div className="d-flex flex-column gap-3 mb-30">
                    {notifications.map((item) => (
                      <GazetteItem key={item.id} item={item} />
                    ))}
                  </div>
                )}

                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">{t('regulatoryUpdates.cta.title')}</h2>
                <p className="mb-4">{t('regulatoryUpdates.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <a href="/contact" className="btn btn-white btn-main">{t('regulatoryUpdates.cta.talkToExpert')}</a>
                  <a href="/properties" className="btn btn-outline-white">{t('regulatoryUpdates.cta.browseProperties')}</a>
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

export default RegulatoryUpdates;
