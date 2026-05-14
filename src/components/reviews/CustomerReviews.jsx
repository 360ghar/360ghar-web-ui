import { useState } from 'react';
import { siteMetadata } from '../../seo/siteMetadata';
import SectionHeading from '../../common/ui/SectionHeading';
import { customerReviews, reviewRoles, reviewAggregate } from '../../data/reviewsData';

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

const ROLE_PROMPTS = {
  buyer: 'How was your property buying experience with 360Ghar?',
  seller: 'How was your experience listing and selling through 360Ghar?',
  tenant: 'How was your rental experience with 360Ghar?',
  landlord: 'How was your experience as a landlord on 360Ghar?',
};

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  return parts[0][0].toUpperCase();
};

const StarIcons = ({ rating, size = '0.75rem' }) => (
  <div className="customer-reviews__card-stars">
    {[1, 2, 3, 4, 5].map((star) => (
      <i key={star} className={star <= rating ? 'fas fa-star' : 'far fa-star'} style={{ fontSize: size }} />
    ))}
  </div>
);

const ReviewCard = ({ review }) => (
  <div className="customer-reviews__card">
    <div className="customer-reviews__card-top">
      <div className="customer-reviews__avatar">{getInitials(review.name)}</div>
      <div className="customer-reviews__card-info">
        <div className="customer-reviews__card-name">{review.name || 'Anonymous'}</div>
        <div className="customer-reviews__card-role">{review.role}</div>
      </div>
    </div>
    <StarIcons rating={review.rating} />
    <p className="customer-reviews__card-text">{review.text}</p>
  </div>
);

const AggregateBadge = () => {
  const rounded = Math.round(reviewAggregate.averageRating);
  return (
    <div className="customer-reviews__badge">
      <div className="customer-reviews__score">
        <span className="customer-reviews__score-number">{reviewAggregate.averageRating.toFixed(1)}</span>
        <div className="customer-reviews__stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <i key={star} className={star <= rounded ? 'fas fa-star' : 'far fa-star'} />
          ))}
        </div>
        <span className="customer-reviews__score-count">{reviewAggregate.totalCount} reviews</span>
      </div>
      <p className="customer-reviews__summary-text">
        Based on verified customer experiences with 360Ghar&apos;s property services.
      </p>
    </div>
  );
};

const ReviewCaptureForm = ({ role = 'buyer' }) => {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { setError('Please select a star rating'); return; }
    if (reviewText.trim().length < 20) { setError('Please write at least 20 characters'); return; }

    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${siteMetadata.siteUrl}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rating,
          text: reviewText.trim(),
          name: reviewerName.trim() || 'Anonymous',
          role,
          platform: 'web',
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
    } catch {
      setError('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="customer-reviews__capture-success">
        <i className="fas fa-check-circle" />
        <h3>Thank you for your review!</h3>
        <p>Your feedback helps other buyers and tenants make informed decisions.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="customer-reviews__capture-stars">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className={`customer-reviews__capture-star-btn${star <= (hoverRating || rating) ? ' customer-reviews__capture-star-btn--active' : ''}`}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            aria-label={`${star} star: ${STAR_LABELS[star - 1]}`}
          >
            <i className={star <= (hoverRating || rating) ? 'fas fa-star' : 'far fa-star'} />
          </button>
        ))}
        {rating > 0 && <span className="customer-reviews__capture-label">{STAR_LABELS[rating - 1]}</span>}
      </div>

      <div className="mb-3">
        <input
          type="text"
          className="customer-reviews__capture-input"
          placeholder="Your name (optional)"
          value={reviewerName}
          onChange={(e) => setReviewerName(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <textarea
          className="customer-reviews__capture-textarea"
          rows={3}
          placeholder="Tell us about your experience..."
          value={reviewText}
          onChange={(e) => setReviewText(e.target.value)}
          required
          minLength={20}
        />
      </div>

      {error && <p className="customer-reviews__capture-error">{error}</p>}

      <button
        type="submit"
        className="customer-reviews__capture-submit"
        disabled={submitting || rating === 0}
      >
        {submitting ? 'Submitting...' : 'Submit Review'}
      </button>
    </form>
  );
};

const CustomerReviews = ({ className = '' }) => {
  const [activeFilter, setActiveFilter] = useState('All');

  const filtered = activeFilter === 'All'
    ? customerReviews
    : customerReviews.filter((r) => r.role === activeFilter);

  const structuredData = {
    '@type': 'AggregateRating',
    itemReviewed: { '@type': 'RealEstateAgent', name: siteMetadata.siteName },
    ratingValue: String(reviewAggregate.averageRating),
    bestRating: '5',
    worstRating: '1',
    reviewCount: String(reviewAggregate.totalCount),
  };

  const reviewStructuredData = customerReviews.slice(0, 5).map((review) => ({
    '@type': 'Review',
    author: { '@type': 'Person', name: review.name || 'Anonymous' },
    datePublished: new Date().toISOString(),
    reviewRating: { '@type': 'Rating', ratingValue: String(review.rating), bestRating: '5' },
    reviewBody: review.text,
  }));


  return (
    <section className={`customer-reviews padding-y-120 ${className}`}>
      <div className="container container-two">
        <div className="customer-reviews__header">
          <SectionHeading
            headingClass="section-heading style-left mb-0"
            subtitle="Customer Reviews"
            subtitleClass=""
            title="Trusted by Home Seekers in Gurugram"
            renderDesc={false}
            desc=""
            renderButton={false}
          />
        </div>

        <AggregateBadge />

        <div className="customer-reviews__filters">
          {reviewRoles.map((role) => (
            <button
              key={role}
              type="button"
              className={`customer-reviews__filter-btn${activeFilter === role ? ' customer-reviews__filter-btn--active' : ''}`}
              onClick={() => setActiveFilter(role)}
            >
              {role}
            </button>
          ))}
        </div>

        <div className="customer-reviews__grid">
          {filtered.map((review, idx) => (
            <ReviewCard review={review} key={idx} />
          ))}
        </div>

        <div className="customer-reviews__capture-wrapper">
          <div className="customer-reviews__capture-card">
            <h3 className="customer-reviews__capture-title">Share Your Experience</h3>
            <p className="customer-reviews__capture-subtitle">
              {ROLE_PROMPTS.buyer}
            </p>
            <ReviewCaptureForm role="buyer" />
          </div>
        </div>

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

export default CustomerReviews;
