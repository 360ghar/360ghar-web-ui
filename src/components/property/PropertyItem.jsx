import { Link } from 'react-router-dom';

import LazyImage from '../../common/LazyImage';
const PROPERTY_IMAGE_FALLBACK = '/assets/images/thumbs/property-1.png';

const isUsableImageUrl = (value) =>
  typeof value === 'string' && value.trim() !== '' && !/kuula\.co/i.test(value);

// Generate descriptive alt text for property images
const generatePropertyAltText = (property) => {
  const parts = [];

  // Add BHK if available
  if (property.bhk || property.bedrooms) {
    parts.push(`${property.bhk || property.bedrooms} BHK`);
  }

  // Add property type
  const propertyType = property.property_type === 'apartment' || property.property_type === 'flat'
    ? 'Apartment'
    : property.property_type === 'villa'
      ? 'Villa'
      : property.property_type === 'builder_floor'
        ? 'Builder Floor'
        : property.property_type === 'independent-house'
          ? 'Independent House'
          : property.property_type || 'Property';
  parts.push(propertyType);

  // Add purpose
  if (property.purpose) {
    parts.push(property.purpose === 'rent' ? 'for Rent' : property.purpose === 'buy' ? 'for Sale' : 'in');
  }

  // Add location
  if (property.locality) {
    parts.push(`in ${property.locality}`);
  } else if (property.city) {
    parts.push(`in ${property.city}`);
  }

  // Add furnishing if available
  if (property.furnishing && property.furnishing !== 'not-specified') {
    parts.push(`(${property.furnishing})`);
  }

  // Add area if available
  if (property.area_sqft) {
    const existingIndex = parts.findIndex(p => p.includes(`(${property.furnishing})`));
    if (existingIndex >= 0) {
      parts[existingIndex] = parts[existingIndex].replace(')', `, ${property.area_sqft.toLocaleString()} sqft)`);
    } else {
      parts.push(`(${property.area_sqft.toLocaleString()} sqft)`);
    }
  }

  const altText = parts.join(' ');
  return altText ? `${altText} - 360Ghar` : 'Property listing on 360Ghar';
};

function formatCurrency(value) {
  if (value === null || value === undefined) return 'Price on request';
  try {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  } catch {
    return `₹${value}`;
  }
}

const PropertyItem = ({
  property,
  itemClass,
  iconsClass,
  btnClass,
  badgeText,
  badgeClass,
  btnRenderBottom,
  btnRenderRight,
  showFeatureBadges = true
}) => {
  // Handle API-first data structure with fallbacks
  const id = property.id;
  const mainImageFromList = Array.isArray(property.images)
    ? (
      property.images.find((img) => img.is_main_image && isUsableImageUrl(img.image_url))?.image_url ||
      property.images.find((img) => isUsableImageUrl(img.image_url))?.image_url
    )
    : undefined;
  const thumb = mainImageFromList || property.main_image_url || property.image_url || property.thumb || PROPERTY_IMAGE_FALLBACK;

  const purpose = property.purpose || property.price_type;
  const priceValue = purpose === 'rent' ? (property.monthly_rent || property.daily_rate || property.base_price) : property.base_price;
  const price = formatCurrency(priceValue);
  const day = purpose === 'rent' ? (property.daily_rate ? '/per day' : '/per month') : '';
  const title = property.title || property.name || 'Property Title';
  const locationIcon = <i className="fas fa-map-marker-alt"></i>;
  const location = property.full_address || [property.locality, property.city, property.state].filter(Boolean).join(', ') || property.address || property.location || 'Location not specified';
  const btnText = 'View Details';

  // Enhanced amenities preview with more details
  const amenities = [];
  if (property.bedrooms) amenities.push({ icon: <i className="fas fa-bed"></i>, text: `${property.bedrooms} Bed${property.bedrooms > 1 ? 's' : ''}` });
  if (property.bathrooms) amenities.push({ icon: <i className="fas fa-bath"></i>, text: `${property.bathrooms} Bath${property.bathrooms > 1 ? 's' : ''}` });
  if (property.area_sqft) amenities.push({ icon: <i className="fas fa-ruler-combined"></i>, text: `${property.area_sqft.toLocaleString()} sqft` });

  // Add more amenities from API response
  if (property.balconies) amenities.push({ icon: <i className="fas fa-home"></i>, text: `${property.balconies} Balcon${property.balconies > 1 ? 'ies' : 'y'}` });
  if (property.parking_spaces) amenities.push({ icon: <i className="fas fa-car"></i>, text: `${property.parking_spaces} Parking` });

  // Show floor information if available
  if (property.floor_number && property.total_floors) {
    amenities.push({ icon: <i className="fas fa-building"></i>, text: `${property.floor_number}/${property.total_floors} Floor` });
  } else if (property.floor_number) {
    amenities.push({ icon: <i className="fas fa-building"></i>, text: `${property.floor_number} Floor` });
  }

  // Show age if available
  if (property.age_of_property) {
    amenities.push({ icon: <i className="fas fa-calendar"></i>, text: `${property.age_of_property}y old` });
  }

  // URL
  const propertyURL = `/property/${id}`;

  // Random badge (kept as design element)
  const renderBadge = Math.random() < 0.5;

  // Server-side filtering is now used, no client-side filtering needed

  // Show distance if available
  const showDistance = property.distance_km && (
    <span className="property-item__distance badge bg-info text-white ms-2">
      <i className="fas fa-map-marker-alt me-1"></i>
      {property.distance_km < 1 ? `${(property.distance_km * 1000).toFixed(0)}m` : `${property.distance_km.toFixed(1)}km`}
    </span>
  );

  // Show amenities and features tags
  const propertyAmenities = property.amenities || [];
  const propertyFeatures = property.features || [];
  const topAmenities = propertyAmenities.slice(0, 3);
  const topFeatures = propertyFeatures.slice(0, 2);

  return (
    <>
      <div
        className={`property-item ${itemClass}`}
        data-status={property.status}
        data-type={property.property_type}
        data-location={property.city}
        data-sort={property.sort_by || 'newest'}
      >
        <div className="property-item__thumb">
          <Link to={propertyURL} className="link">
            <LazyImage src={thumb} fallbackSrc={PROPERTY_IMAGE_FALLBACK} alt={generatePropertyAltText(property)} className="cover-img" />
          </Link>
          {renderBadge && <span className={badgeClass}>{badgeText}</span>}
          {showDistance}
        </div>
        <div className="property-item__content">
          <div className="property-item__header">
            <h6 className="property-item__price">
              {price}
              <span className="day">{day}</span>
            </h6>
            {property.price_per_sqft && (
              <span className="property-item__price-per-sqft text-muted small">
                ₹{property.price_per_sqft.toLocaleString()}/sqft
              </span>
            )}
          </div>

          <h6 className="property-item__title">
            <Link to={propertyURL} className="link">
              {title}
            </Link>
          </h6>

          <p className="property-item__location d-flex gap-2">
            <span className={`icon ${iconsClass}`}> {locationIcon}</span>
            <span className="flex-grow-1">{location}</span>
          </p>

          {/* Property Type and Purpose Tags */}
          <div className="property-item__tags mb-2">
            {property.purpose && (
              <span className="badge bg-primary me-1">
                {property.purpose === 'buy' ? 'For Sale' : property.purpose === 'rent' ? 'For Rent' : 'Short Stay'}
              </span>
            )}
            {property.property_type && (
              <span className="badge bg-secondary">
                {property.property_type === 'house' ? 'House' :
                  property.property_type === 'apartment' ? 'Apartment' :
                    property.property_type === 'builder_floor' ? 'Builder Floor' :
                      property.property_type === 'room' ? 'Room' : property.property_type}
              </span>
            )}
          </div>

          <div className="property-item__bottom flx-between gap-2">
            <ul className="amenities-list flx-align">
              {amenities.slice(0, 4).map((amenity, amenityIndex) => (
                <li className="amenities-list__item flx-align" key={amenityIndex}>
                  <span className={`icon ${iconsClass}`}>{amenity.icon}</span>
                  <span className="text">{amenity.text}</span>
                </li>
              ))}
            </ul>
            {btnRenderRight && (
              <Link to={propertyURL} className={`simple-btn ${btnClass}`}>
                {btnText}
                <span className="icon-right">
                  {' '}
                  <i className="fas fa-arrow-right"></i>{' '}
                </span>
              </Link>
            )}
          </div>

          {/* Show top amenities and features */}
          {showFeatureBadges && (topAmenities.length > 0 || topFeatures.length > 0) && (
            <div className="property-item__amenities-features mt-2">
              {topAmenities.length > 0 && (
                <div className="amenities-preview">
                  <small className="text-muted">Amenities:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {topAmenities.map((amenity, index) => (
                      <span key={index} className="badge bg-light text-dark small">
                        {amenity.title || amenity}
                      </span>
                    ))}
                    {propertyAmenities.length > 3 && (
                      <span className="badge bg-light text-dark small">
                        +{propertyAmenities.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
              {topFeatures.length > 0 && (
                <div className="features-preview mt-1">
                  <small className="text-muted">Features:</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {topFeatures.map((feature, index) => (
                      <span key={index} className="badge bg-success text-white small">
                        {feature}
                      </span>
                    ))}
                    {propertyFeatures.length > 2 && (
                      <span className="badge bg-success text-white small">
                        +{propertyFeatures.length - 2} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {btnRenderBottom && (
            <Link to={propertyURL} className={`simple-btn ${btnClass}`}>
              {btnText}
              <span className="icon-right">
                {' '}
                <i className="fas fa-arrow-right"></i>{' '}
              </span>
            </Link>
          )}
        </div>
      </div>
    </>
  );
};

export default PropertyItem;

