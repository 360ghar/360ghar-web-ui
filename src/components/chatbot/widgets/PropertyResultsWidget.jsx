import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../../i18n/I18nLink';

function formatPrice(price, t) {
  if (!price) return t('chatbot.widgets.priceOnRequest');
  if (price >= 10000000) return `₹${(price / 10000000).toFixed(1)}Cr`;
  if (price >= 100000) return `₹${(price / 100000).toFixed(0)}L`;
  return `₹${price.toLocaleString('en-IN')}`;
}

function PropertyCard({ property, t }) {
  return (
    <I18nLink
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
        <p className="chatbot-property-card__price">{property.price_display || formatPrice(property.price, t)}</p>
        <p className="chatbot-property-card__title">{property.title || property.property_type}</p>
        <p className="chatbot-property-card__location">{property.location}</p>
        {property.bedrooms > 0 && (
          <span className="chatbot-property-card__badge">{property.bedrooms} BHK</span>
        )}
      </div>
    </I18nLink>
  );
}

function GenericFallback({ t }) {
  return <div className="chatbot-widget chatbot-widget--empty"><p>{t('chatbot.widgets.resultsNotAvailable')}</p></div>;
}

export default function PropertyResultsWidget({ data }) {
  const { t } = useTranslation('common');
  if (!data) return <GenericFallback t={t} />;

  const items = Array.isArray(data?.items) ? data.items : [];
  const total = items.length;
  const displayItems = items.slice(0, 4); // Show max 4 in chat

  if (items.length === 0) {
    return (
      <div className="chatbot-widget chatbot-widget--empty">
        <p>{t('chatbot.widgets.noProperties')}</p>
      </div>
    );
  }

  return (
    <div className="chatbot-widget chatbot-widget--properties">
      <div className="chatbot-widget__header">
        <span className="chatbot-widget__title">{t('chatbot.widgets.propertiesFound')}</span>
        <span className="chatbot-widget__count">{t('chatbot.widgets.resultCount', { count: total })}</span>
      </div>
      <div className="chatbot-property-grid">
        {displayItems.map((p, i) => (
          <PropertyCard key={p.id || i} property={p} t={t} />
        ))}
      </div>
      {total > 4 && (
        <I18nLink to="/properties" className="chatbot-widget__view-all">
          {t('chatbot.widgets.viewAll', { count: total })}
        </I18nLink>
      )}
    </div>
  );
}
