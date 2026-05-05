import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import AuctionAlertModal from '../../components/data-hub/AuctionAlertModal';
import { dataHubService } from '../../services/dataHubService';

/**
 * Format a rupee amount into human-readable lakh/crore notation.
 * e.g. 4500000 → "₹45 Lakh", 12000000 → "₹1.2 Cr"
 */
const formatPrice = (amount) => {
  if (amount == null) return '—';
  const n = Number(amount);
  if (isNaN(n)) return '—';
  if (n >= 10000000) {
    const cr = (n / 10000000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${cr} Cr`;
  }
  if (n >= 100000) {
    const lakh = (n / 100000).toFixed(2).replace(/\.?0+$/, '');
    return `₹${lakh} Lakh`;
  }
  return `₹${n.toLocaleString('en-IN')}`;
};

/**
 * Returns days remaining until a future date, or null if past/missing.
 */
const daysUntil = (dateStr) => {
  if (!dateStr) return null;
  const target = new Date(dateStr);
  const now = new Date();
  const diff = Math.ceil((target - now) / (1000 * 60 * 60 * 24));
  return diff > 0 ? diff : null;
};

const sourceBadgeStyle = (source, caseNumber) => {
  const isBank = !caseNumber;
  if (isBank) {
    return { background: '#dbeafe', color: '#1e40af', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'inline-block' };
  }
  return { background: '#fef3c7', color: '#92400e', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600, display: 'inline-block' };
};

const BankAuctionDetail = () => {
  const { t } = useTranslation('data-hub');
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertModal, setAlertModal] = useState(false);

  useEffect(() => {
    if (!id) return;
    dataHubService.getAuction(id)
      .then(setAuction)
      .catch((err) => {
        if (err?.response?.status === 404) {
          setError('not_found');
        } else {
          setError('error');
        }
      })
      .finally(() => setLoading(false));
  }, [id]);

  const isBank = auction ? !auction.case_number : true;
  const sourceBadge = auction
    ? (isBank ? (auction.source || 'SARFAESI').toUpperCase() : t('bankAuctions.detail.courtOrdered'))
    : '';
  const institution = auction ? (auction.bank_name || auction.court_name || '') : '';
  const remaining = auction ? daysUntil(auction.auction_date) : null;

  const pageTitle = auction
    ? `${auction.property_description || auction.property_type || 'Property'} — Auction | 360Ghar`
    : 'Auction Detail | 360Ghar';

  return (
    <>
      <SEO
        title={pageTitle}
        description={
          auction
            ? `${sourceBadge} auction by ${institution || 'bank'}. Reserve price: ${formatPrice(auction.reserve_price)}. Auction date: ${auction.auction_date ? new Date(auction.auction_date).toLocaleDateString('en-IN') : 'TBD'}.`
            : 'Property auction detail — Gurugram bank and court auctions on 360Ghar.'
        }
        keywords="bank auction property, SARFAESI auction Gurugram, court ordered sale, property auction detail"
        canonical={`/bank-auctions/${id}`}
        noindex={!loading && (!!error || !auction)}
        structuredData={auction ? [
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Bank Auctions', url: 'https://360ghar.com/bank-auctions' },
            { name: auction.city || 'Delhi NCR', url: `https://360ghar.com/bank-auctions?city=${encodeURIComponent(auction.city || '')}` },
            { name: auction.property_description || auction.property_type || 'Auction', url: `https://360ghar.com/bank-auctions/${id}` },
          ]),
          {
            '@type': 'Event',
            name: auction.property_description || 'Property Auction',
            description: `${sourceBadge} auction by ${institution || 'bank'}. Reserve price: ${formatPrice(auction.reserve_price)}.`,
            startDate: auction.auction_date || undefined,
            location: auction.address
              ? { '@type': 'Place', name: auction.address, address: { '@type': 'PostalAddress', streetAddress: auction.address, addressLocality: 'Gurugram', addressRegion: 'Haryana', addressCountry: 'IN' } }
              : { '@type': 'Place', name: 'Gurugram, Haryana' },
            organizer: institution
              ? { '@type': 'Organization', name: institution }
              : undefined,
            offers: {
              '@type': 'Offer',
              price: auction.reserve_price || 0,
              priceCurrency: 'INR',
              availability: 'https://schema.org/LimitedAvailability',
            },
          },
        ] : []}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />

        <section className="pt-60 pb-60">
          <div className="container">
            {/* Back link */}
            <div className="mb-20">
              <I18nLink to="/bank-auctions" style={{ fontSize: 14, color: '#6b7280', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <i className="fas fa-arrow-left" style={{ fontSize: 12 }}></i>
                {t('bankAuctions.detail.backToAuctions')}
              </I18nLink>
            </div>

            {loading ? (
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32 }}>
                    <div style={{ height: 24, background: '#e5e7eb', borderRadius: 4, marginBottom: 16, width: '60%' }}></div>
                    <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, marginBottom: 12, width: '40%' }}></div>
                    <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, marginBottom: 12, width: '50%' }}></div>
                    <div style={{ height: 16, background: '#f3f4f6', borderRadius: 4, width: '35%' }}></div>
                  </div>
                </div>
              </div>
            ) : error === 'not_found' ? (
              <div className="text-center py-60">
                <i className="fas fa-search" style={{ fontSize: 48, color: '#d1d5db', display: 'block', marginBottom: 16 }}></i>
                <h2 className="fs-24 fw-600 mb-10">{t('bankAuctions.detail.notFound')}</h2>
                <p className="color-text-3 mb-20">{t('bankAuctions.detail.notFoundDesc')}</p>
                <I18nLink to="/bank-auctions" className="btn btn-main">{t('bankAuctions.detail.browseAll')}</I18nLink>
              </div>
            ) : error ? (
              <div className="text-center py-60">
                <p className="color-danger fs-16">{t('bankAuctions.detail.error')}</p>
                <I18nLink to="/bank-auctions" className="btn btn-outline-secondary mt-20">{t('bankAuctions.detail.backToAuctions')}</I18nLink>
              </div>
            ) : auction ? (
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: 32 }}>
                    {/* Badges */}
                    <div className="d-flex flex-wrap gap-10 mb-20">
                      <span style={sourceBadgeStyle(auction.source, auction.case_number)}>{sourceBadge}</span>
                      {institution && (
                        <span style={{ background: '#f3f4f6', color: '#374151', padding: '4px 12px', borderRadius: 6, fontSize: 13, fontWeight: 500, display: 'inline-block' }}>
                          {institution}
                        </span>
                      )}
                    </div>

                    {/* Property heading */}
                    <h1 style={{ fontSize: 22, fontWeight: 700, color: '#111827', marginBottom: 8 }}>
                      {auction.property_description || auction.property_type || t('bankAuctions.detail.propertyAuction')}
                    </h1>

                    {auction.address && (
                      <p style={{ fontSize: 15, color: '#6b7280', marginBottom: 24 }}>
                        <i className="fas fa-map-marker-alt" style={{ marginRight: 6, color: '#9ca3af' }}></i>
                        {auction.address}
                      </p>
                    )}

                    {/* Key details grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16, marginBottom: 28, padding: '20px 24px', background: '#f8fafc', borderRadius: 10 }}>
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('bankAuctions.detail.reservePrice')}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 20, fontWeight: 700, color: '#111827' }}>{formatPrice(auction.reserve_price)}</p>
                      </div>
                      {auction.emd_amount != null && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('bankAuctions.detail.emdAmount')}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 18, fontWeight: 600, color: '#374151' }}>{formatPrice(auction.emd_amount)}</p>
                        </div>
                      )}
                      <div>
                        <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('bankAuctions.detail.auctionDate')}</p>
                        <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#374151' }}>
                          {auction.auction_date
                            ? new Date(auction.auction_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
                            : t('bankAuctions.detail.tbd')}
                        </p>
                        {remaining && (
                          <p style={{ margin: '2px 0 0', fontSize: 12, color: '#059669', fontWeight: 600 }}>
                            {t('bankAuctions.detail.daysRemaining', { count: remaining, suffix: remaining !== 1 ? 's' : '' })}
                          </p>
                        )}
                      </div>
                      {auction.property_type && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('bankAuctions.detail.propertyType')}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#374151', textTransform: 'capitalize' }}>{auction.property_type}</p>
                        </div>
                      )}
                      {(auction.area || auction.area_sqft) && (
                        <div>
                          <p style={{ margin: 0, fontSize: 11, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{t('bankAuctions.detail.area')}</p>
                          <p style={{ margin: '4px 0 0', fontSize: 15, fontWeight: 600, color: '#374151' }}>
                            {auction.area || auction.area_sqft} {auction.area_unit || 'sq ft'}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Additional details */}
                    {(auction.case_number || auction.loan_account_number || auction.borrower_name) && (
                      <div style={{ marginBottom: 24 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: '#374151', marginBottom: 12 }}>{t('bankAuctions.detail.additionalInfo')}</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                          {auction.case_number && (
                            <div className="d-flex gap-10">
                              <span style={{ fontSize: 13, color: '#9ca3af', minWidth: 140 }}>{t('bankAuctions.detail.caseNumber')}</span>
                              <span style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{auction.case_number}</span>
                            </div>
                          )}
                          {auction.loan_account_number && (
                            <div className="d-flex gap-10">
                              <span style={{ fontSize: 13, color: '#9ca3af', minWidth: 140 }}>{t('bankAuctions.detail.loanAccount')}</span>
                              <span style={{ fontSize: 13, color: '#374151', fontFamily: 'monospace' }}>{auction.loan_account_number}</span>
                            </div>
                          )}
                          {auction.borrower_name && (
                            <div className="d-flex gap-10">
                              <span style={{ fontSize: 13, color: '#9ca3af', minWidth: 140 }}>{t('bankAuctions.detail.borrower')}</span>
                              <span style={{ fontSize: 13, color: '#374151' }}>{auction.borrower_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Contact information */}
                    {(auction.contact_name || auction.contact_phone || auction.contact_email) && (
                      <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '16px 20px', marginBottom: 24 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, color: '#166534', marginBottom: 10 }}>{t('bankAuctions.detail.contactForAuction')}</h3>
                        {auction.contact_name && <p style={{ margin: '0 0 4px', fontSize: 14, color: '#166534' }}>{auction.contact_name}</p>}
                        {auction.contact_phone && (
                          <p style={{ margin: '0 0 4px', fontSize: 14 }}>
                            <a href={`tel:${auction.contact_phone}`} style={{ color: '#166534' }}>{auction.contact_phone}</a>
                          </p>
                        )}
                        {auction.contact_email && (
                          <p style={{ margin: 0, fontSize: 14 }}>
                            <a href={`mailto:${auction.contact_email}`} style={{ color: '#166534' }}>{auction.contact_email}</a>
                          </p>
                        )}
                      </div>
                    )}

                    {/* Action button */}
                    <div className="d-flex gap-3 flex-wrap">
                      <button
                        className="btn btn-main"
                        onClick={() => setAlertModal(true)}
                      >
                        <i className="fas fa-bell me-2"></i>
                        {t('bankAuctions.detail.setAlert')}
                      </button>
                      {auction.source_url && (
                        <a
                          href={auction.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-primary"
                        >
                          <i className="fas fa-external-link-alt me-2"></i>
                          View on Source Website
                        </a>
                      )}
                      <I18nLink to="/bank-auctions" className="btn btn-outline-secondary">
                        {t('bankAuctions.detail.browseAll')}
                      </I18nLink>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </section>

        {/* CTA */}
        <section className="cta-section bg-main text-white padding-y-60">
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <h2 className="cta-title mb-3">{t('bankAuctions.detail.cta.title')}</h2>
                <p className="mb-4">{t('bankAuctions.detail.cta.description')}</p>
                <div className="d-flex justify-content-center gap-3 flex-wrap">
                  <I18nLink to="/properties" className="btn btn-white btn-main">{t('bankAuctions.detail.cta.browseProperties')}</I18nLink>
                  <I18nLink to="/rera-projects" className="btn btn-outline-white">{t('bankAuctions.detail.cta.reraProjects')}</I18nLink>
                </div>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>

      <AuctionAlertModal
        isOpen={alertModal}
        onClose={() => setAlertModal(false)}
        initialData={auction ? {
          bank_name: auction.bank_name || '',
          property_type: auction.property_type || '',
        } : {}}
      />
    </>
  );
};

export default BankAuctionDetail;
