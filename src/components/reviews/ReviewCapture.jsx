import { useState } from 'react';
import { siteMetadata } from '../../seo/siteMetadata';

const STAR_LABELS = ['Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

/**
 * ReviewCapture — post-deal review prompt.
 * Collects star rating, review text, and optional name.
 * Submits to /api/reviews (graceful error until backend exists).
 */
const ReviewCapture = ({ role = 'buyer', propertyId, className = '', onSubmitted }) => {
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
          propertyId: propertyId || null,
          platform: 'web',
        }),
      });
      if (!res.ok) throw new Error('Submission failed');
      setSubmitted(true);
      if (onSubmitted) onSubmitted({ rating, text: reviewText, name: reviewerName, role });
    } catch {
      setError('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className={`p-4 rounded-3 border bg-light text-center ${className}`}>
        <i className="fas fa-check-circle text-success fs-2 mb-2" />
        <h3 className="h6">Thank you for your review!</h3>
        <p className="text-muted mb-0">Your feedback helps other buyers and tenants make informed decisions.</p>
      </div>
    );
  }

  const rolePrompt = {
    buyer: 'How was your property buying experience with 360Ghar?',
    seller: 'How was your experience listing and selling through 360Ghar?',
    tenant: 'How was your rental experience with 360Ghar?',
    landlord: 'How was your experience as a landlord on 360Ghar?',
  };

  return (
    <div className={`p-4 rounded-3 border bg-white ${className}`}>
      <h3 className="h6 mb-3">Share Your Experience</h3>
      <p className="text-muted mb-3" style={{ fontSize: '0.875rem' }}>
        {rolePrompt[role] || rolePrompt.buyer}
      </p>

      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <div className="d-flex gap-2 align-items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="btn btn-link p-0 border-0"
                style={{ fontSize: '1.5rem', color: star <= (hoverRating || rating) ? 'var(--main-color)' : 'var(--gray-400)', textDecoration: 'none' }}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${star} star: ${STAR_LABELS[star - 1]}`}
              >
                <i className={star <= (hoverRating || rating) ? 'fas fa-star' : 'far fa-star'} />
              </button>
            ))}
            {rating > 0 && <small className="text-muted ms-2">{STAR_LABELS[rating - 1]}</small>}
          </div>
        </div>

        <div className="mb-3">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Your name (optional)"
            value={reviewerName}
            onChange={(e) => setReviewerName(e.target.value)}
          />
        </div>

        <div className="mb-3">
          <textarea
            className="form-control form-control-sm"
            rows={3}
            placeholder="Tell us about your experience..."
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            required
            minLength={20}
          />
        </div>

        {error && <p className="text-danger small mb-2">{error}</p>}

        <button
          type="submit"
          className="btn btn-main btn-sm"
          disabled={submitting || rating === 0}
        >
          {submitting ? 'Submitting...' : 'Submit Review'}
        </button>
      </form>
    </div>
  );
};

export default ReviewCapture;
