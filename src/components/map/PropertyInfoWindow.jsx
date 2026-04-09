import { I18nLink } from '../../i18n/I18nLink';
import {
  getListingLabel,
  getPropertyTypeLabel,
} from '../../utils/propertyTaxonomy';

const PropertyInfoWindow = ({ property, onClose }) => {
  if (!property) return null;

  const formatPrice = (value) => {
    if (!value) return 'Price on request';
    return `₹${Number(value).toLocaleString('en-IN')}`;
  };

  const price = property.purpose === 'rent' 
    ? formatPrice(property.monthly_rent || property.daily_rate)
    : formatPrice(property.base_price);
  
  const priceLabel = property.purpose === 'rent'
    ? property.daily_rate ? '/day' : '/month'
    : '';
  const listingLabel = getListingLabel({
    propertyType: property.property_type,
    purpose: property.purpose,
  });
  const propertyTypeLabel = getPropertyTypeLabel(property.property_type);

  const mainImage = property.main_image_url || property.image_url || '/assets/images/thumbs/property-1.png';

  return (
    <div className="property-info-window">
      <button className="info-window-close" onClick={onClose} aria-label="Close">
        <i className="fas fa-times"></i>
      </button>
      
      <div className="info-window-image">
        <img src={mainImage} alt={property.title} />
        {listingLabel && (
          <span className="info-window-badge">
            {listingLabel}
          </span>
        )}
      </div>
      
      <div className="info-window-content">
        <h6 className="info-window-title">{property.title}</h6>
        {property.property_type && (
          <p className="info-window-location mb-2">
            <i className="fas fa-building me-1"></i>
            {propertyTypeLabel}
          </p>
        )}
        
        <p className="info-window-price">
          {price}
          <span className="price-label">{priceLabel}</span>
        </p>
        
        <p className="info-window-location">
          <i className="fas fa-map-marker-alt me-1"></i>
          {property.locality || property.city}
        </p>
        
        <div className="info-window-amenities">
          {property.bedrooms && (
            <span className="amenity-item">
              <i className="fas fa-bed"></i> {property.bedrooms} Bed
            </span>
          )}
          {property.bathrooms && (
            <span className="amenity-item">
              <i className="fas fa-bath"></i> {property.bathrooms} Bath
            </span>
          )}
          {property.area_sqft && (
            <span className="amenity-item">
              <i className="fas fa-ruler-combined"></i> {property.area_sqft.toLocaleString()} sqft
            </span>
          )}
        </div>
        
        <I18nLink to={`/property/${property.id}`} className="info-window-link">
          View Details
          <i className="fas fa-arrow-right ms-2"></i>
        </I18nLink>
      </div>
    </div>
  );
};

export default PropertyInfoWindow;
