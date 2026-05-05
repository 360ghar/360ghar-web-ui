/**
 * ReviewDisplay — renders reviews and aggregate rating for SEO.
 * Emits AggregateRating and Review structured data.
 */
import { siteMetadata } from '../../seo/siteMetadata';

const ReviewDisplay = ({ reviews = [], averageRating = 0, totalCount = 0, className = '' }) => {
  const structuredData = {
    '@type': 'AggregateRating',
    itemReviewed: {
      '@type': 'RealEstateAgent',
      name: siteMetadata.siteName,
    },
    ratingValue: String(averageRating),
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(totalCount),
  };

  const reviewStructuredData = reviews.slice(0, 5).map((review) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: review.name || 'Anonymous' },
    datePublished: review.date || new Date().toISOString(),
    reviewRating: { '@type': 'Rating', ratingValue: String(review.rating), bestRating: '5' },
    reviewBody: review.text,
  }));

  return (
    <section className={`padding-y-60 bg-light ${className}`}>
      <div className="container container-two">
        <h2 className="h5 mb-3">Customer Reviews</h2>

        {totalCount > 0 && (
          <div className="d-flex align-items-center gap-3 mb-4">
            <div className="text-center p-3 rounded-3 bg-white border" style={{ minWidth: '100px' }}>
              <strong className="d-block text-main fs-4">{averageRating.toFixed(1)}</strong>
              <div className="text-warning">
                {[1, 2, 3, 4, 5].map((star) => (
                  <i
                    key={star}
                    className={star <= Math.round(averageRating) ? 'fas fa-star' : 'far fa-star'}
                    style={{ fontSize: '0.875rem' }}
                  />
                ))}
              </div>
              <small className="text-muted">{totalCount} reviews</small>
            </div>
            <p className="text-muted mb-0">
              Based on verified customer experiences with 360Ghar&apos;s property services.
            </p>
          </div>
        )}

        {reviews.length > 0 && (
          <div className="row g-3">
            {reviews.slice(0, 6).map((review, idx) => (
              <div className="col-md-6 col-lg-4" key={idx}>
                <div className="p-3 rounded-3 bg-white border h-100">
                  <div className="d-flex align-items-center gap-2 mb-2">
                    <div className="text-warning">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <i
                          key={star}
                          className={star <= review.rating ? 'fas fa-star' : 'far fa-star'}
                          style={{ fontSize: '0.75rem' }}
                        />
                      ))}
                    </div>
                    <small className="text-muted">{review.role || ''}</small>
                  </div>
                  <p className="mb-1" style={{ fontSize: '0.875rem' }}>{review.text}</p>
                  <small className="text-muted">&mdash; {review.name || 'Anonymous'}</small>
                </div>
              </div>
            ))}
          </div>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              ...structuredData,
              review: reviewStructuredData,
            }),
          }}
        />
      </div>
    </section>
  );
};

export default ReviewDisplay;
