import { I18nLink } from '../../../i18n/I18nLink';

function formatPrice(price) {
  if (!price) return 'Price on request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

export default function PropertyDetailWidget({ data }) {
  if (!data) return null;

  const property = data.property || data;
  const { id, title, price, price_display, location, bedrooms, bathrooms, area, property_type, purpose, thumbnail_url } = property;

  return (
    <div className="chatbot-widget chatbot-widget--property-detail">
      {thumbnail_url && (
        <img className="chatbot-widget__property-image" src={thumbnail_url} alt={title || 'Property'} loading="lazy" />
      )}
      <div className="chatbot-widget__body">
        <p className="chatbot-widget__price">{price_display || formatPrice(price)}</p>
        <h4 className="chatbot-widget__name">{title || property_type}</h4>
        {location && <p className="chatbot-widget__location">📍 {location}</p>}
        <div className="chatbot-widget__specs">
          {bedrooms > 0 && <span className="chatbot-widget__spec">{bedrooms} BHK</span>}
          {bathrooms > 0 && <span className="chatbot-widget__spec">{bathrooms} Bath</span>}
          {area > 0 && <span className="chatbot-widget__spec">{area} sq.ft</span>}
          {purpose && <span className="chatbot-widget__spec chatbot-widget__spec--purpose">{purpose === 'rent' ? 'For Rent' : 'For Sale'}</span>}
        </div>
        {id && (
          <I18nLink to={`/property/${id}`} className="chatbot-widget__cta" target="_blank" rel="noopener noreferrer">
            View Full Details →
          </I18nLink>
        )}
      </div>
    </div>
  );
}
