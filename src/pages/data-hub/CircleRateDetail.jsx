import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { dataHubService } from '../../services/dataHubService';
import StampDutyWidget from '../../components/data-hub/StampDutyWidget';

const CircleRateDetail = () => {
  const { slug } = useParams();
  const [rate, setRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    dataHubService.getCircleRateBySlug(slug)
      .then(setRate)
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return (
    <>
      <OffCanvas /><MobileMenu />
      <main className="body-bg"><Header /><section className="pt-60 pb-60"><div className="container"><p>Loading...</p></div></section><Footer /></main>
    </>
  );

  if (error || !rate) return (
    <>
      <SEO noindex={true} title="Not Found | 360Ghar" />
      <OffCanvas /><MobileMenu />
      <main className="body-bg"><Header /><section className="pt-60 pb-60"><div className="container">
        <h1>Circle Rate Not Found</h1>
        <p>Data temporarily unavailable. <Link to="/circle-rates">← Back to Circle Rates</Link></p>
      </div></section><Footer /></main>
    </>
  );

  return (
    <>
      <SEO
        title={`${rate.sector} Circle Rates ${rate.revision_year} | DLC Rate ${rate.property_type} | 360Ghar`}
        description={`Official circle rates for ${rate.sector}, Gurugram for ${rate.property_type} properties. Rate: ₹${rate.rate_per_sqyd}/sq yd for ${rate.revision_year}. Calculate stamp duty.`}
        keywords={`${rate.sector} circle rate, DLC rate ${rate.sector}, stamp duty ${rate.sector} Gurugram`}
        canonical={`/circle-rate/${slug}`}
        structuredData={[
          generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Circle Rates', url: 'https://360ghar.com/circle-rates' },
            { name: rate.sector, url: `https://360ghar.com/circle-rate/${slug}` },
          ]),
          {
            '@type': 'FAQPage',
            mainEntity: [
              {
                q: `What is the circle rate for ${rate.sector}?`,
                a: `The current circle rate for ${rate.property_type} properties in ${rate.sector} is ₹${rate.rate_per_sqyd || 'N/A'} per square yard as per the ${rate.revision_year} revision by IGRS Haryana.`,
              },
              {
                q: `How is stamp duty calculated in ${rate.sector}?`,
                a: 'Stamp duty in Haryana is 7% for male buyers, 5% for female buyers, and 6% for joint ownership. Registration fees are an additional 1% of the property value.',
              },
              {
                q: 'What is the difference between circle rate and market rate?',
                a: 'Circle rate (DLC rate) is the minimum value set by the government for property registration. The actual market rate (transaction price) is usually higher. Stamp duty is calculated on whichever is higher.',
              },
            ].map(({ q, a }) => ({
              '@type': 'Question',
              name: q,
              acceptedAnswer: { '@type': 'Answer', text: a },
            })),
          },
        ]}
      />
      <OffCanvas />
      <MobileMenu />
      <main className="body-bg">
        <Header />
        <section className="pt-60 pb-60">
          <div className="container">
            <nav aria-label="breadcrumb" className="mb-20">
              <ol className="breadcrumb">
                <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                <li className="breadcrumb-item"><Link to="/circle-rates">Circle Rates</Link></li>
                <li className="breadcrumb-item active">{rate.sector}</li>
              </ol>
            </nav>

            <h1 className="fs-28 fw-600 mb-5">{rate.sector} Circle Rates</h1>
            <p className="mb-30 color-text-3">
              {rate.property_type && <span style={{ textTransform: 'capitalize' }}>{rate.property_type} • </span>}
              Revision Year: {rate.revision_year}
              {rate.effective_date && ` • Effective: ${new Date(rate.effective_date).toLocaleDateString('en-IN')}`}
            </p>

            <div className="row mb-40">
              <div className="col-md-4 col-sm-6 mb-15">
                <div className="p-20 border-radius-8" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
                  <p className="fs-12 color-text-3 mb-5">Rate per Sq. Yard</p>
                  <p className="fs-24 fw-700 mb-0">
                    {rate.rate_per_sqyd ? `₹${Number(rate.rate_per_sqyd).toLocaleString('en-IN')}` : '—'}
                  </p>
                </div>
              </div>
              <div className="col-md-4 col-sm-6 mb-15">
                <div className="p-20 border-radius-8" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0' }}>
                  <p className="fs-12 color-text-3 mb-5">Rate per Sq. Ft</p>
                  <p className="fs-24 fw-700 mb-0">
                    {rate.rate_per_sqft ? `₹${Number(rate.rate_per_sqft).toLocaleString('en-IN')}` : '—'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stamp Duty Calculator */}
            <div className="row mb-40">
              <div className="col-lg-7">
                <h2 className="fs-22 fw-600 mb-15">Calculate Stamp Duty for {rate.sector}</h2>
                <StampDutyWidget />
              </div>
            </div>

            {/* FAQ */}
            <div className="row">
              <div className="col-lg-8">
                <h2 className="fs-20 fw-600 mb-20">FAQs about {rate.sector} Circle Rates</h2>
                {[
                  {
                    q: `What is the circle rate for ${rate.sector}?`,
                    a: `The current circle rate for ${rate.property_type} properties in ${rate.sector} is ₹${rate.rate_per_sqyd || 'N/A'} per square yard as per the ${rate.revision_year} revision by IGRS Haryana.`,
                  },
                  {
                    q: `How is stamp duty calculated in ${rate.sector}?`,
                    a: `Stamp duty in Haryana is 7% for male buyers, 5% for female buyers, and 6% for joint ownership. Registration fees are an additional 1% of the property value.`,
                  },
                  {
                    q: 'What is the difference between circle rate and market rate?',
                    a: 'Circle rate (DLC rate) is the minimum value set by the government for property registration. The actual market rate (transaction price) is usually higher. Stamp duty is calculated on whichever is higher.',
                  },
                ].map(({ q, a }) => (
                  <details key={q} className="mb-15" style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 16 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>{q}</summary>
                    <p style={{ marginTop: 8, fontSize: 13, color: '#4b5563' }}>{a}</p>
                  </details>
                ))}
              </div>
            </div>

            <div className="mt-30">
              <Link to="/circle-rates" className="btn-outline">← Back to all Circle Rates</Link>
            </div>
          </div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default CircleRateDetail;
