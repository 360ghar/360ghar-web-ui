import { Link } from 'react-router-dom';

function formatPrice(price) {
  if (!price) return 'Price on request';
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function PropertyCard({ property }) {
  return (
    <Link
      to={`/property/${property.id}`}
      className="chatbot-property-card"
      target="_blank"
      rel="noopener noreferrer"
    >
      {property.thumbnail_url && (
        <div className="chatbot-property-card__image">
          <img src={property.thumbnail_url} alt={property.title || 'Property'} loading="lazy" />
        </div>
      )}
      <div className="chatbot-property-card__info">
        <p className="chatbot-property-card__price">{property.price_display || formatPrice(property.price)}</p>
        <p className="chatbot-property-card__title">{property.title || property.property_type}</p>
        <p className="chatbot-property-card__location">{property.location}</p>
        {property.bedrooms > 0 && (
          <span className="chatbot-property-card__badge">{property.bedrooms} BHK</span>
        )}
      </div>
    </Link>
  );
}

function GenericFallback() {
  return <div className="chatbot-widget chatbot-widget--empty"><p>Results not available.</p></div>;
}

export default function PropertyResultsWidget({ data }) {
  if (!data) return <GenericFallback />;

  const items = data.items || data.properties || data.results || [];
  const total = data.total || items.length;
  const displayItems = items.slice(0, 4); // Show max 4 in chat

  if (items.length === 0) {
    return (
      <div className="chatbot-widget chatbot-widget--empty">
        <p>No properties found matching your criteria.</p>
      </div>
    );
  }

  return (
    <div className="chatbot-widget chatbot-widget--properties">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">Properties Found</span>
        <span className="chatbot-widget__count">{total} result{total !== 1 ? 's' : ''}</span>
      </div>
      <div className="chatbot-property-grid">
        {displayItems.map((p, i) => (
          <PropertyCard key={p.id || i} property={p} />
        ))}
      </div>
      {total > 4 && (
        <Link to="/properties" className="chatbot-widget__view-all">
          View all {total} properties →
        </Link>
      )}
    </div>
  );
}
