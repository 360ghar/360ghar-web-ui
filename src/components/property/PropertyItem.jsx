import { Link } from 'react-router-dom';
import { useState } from 'react';

import LazyImage from '../../common/ui/LazyImage';
import TrustBadge from '../ui/TrustBadge';
import { usePropertyStore } from '../../store';
import { useAuthStore } from '../../store';
import {
  getListingLabel,
  getPropertyTypeLabel,
} from '../../utils/propertyTaxonomy';
const PROPERTY_IMAGE_FALLBACK = '/assets/images/thumbs/property-1.png';

const isUsableImageUrl = (value) =>
  typeof value === 'string' && value.trim() !== '' && !/kuula\.co/i.test(value);

const ShareModal = ({ isOpen, onClose, propertyTitle, propertyURL }) => {
  if (!isOpen) return null;

  const fullURL = typeof window !== 'undefined' ? `${window.location.origin}${propertyURL}` : propertyURL;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullURL);
    alert('Link copied to clipboard!');
    onClose();
  };

  const handleShareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: propertyTitle,
          url: fullURL,
        });
      } catch {
        // User cancelled share dialog
      }
    }
    onClose();
  };

  return (
    <div className="share-modal-overlay" onClick={onClose}>
      <div className="share-modal" onClick={(e) => e.stopPropagation()}>
        <div className="share-modal__header">
          <h5>Share Property</h5>
          <button className="share-modal__close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="share-modal__content">
          <button className="share-modal__btn" onClick={handleCopyLink}>
            <i className="fas fa-link"></i>
            <span>Copy Link</span>
          </button>
          {navigator.share && (
            <button className="share-modal__btn" onClick={handleShareNative}>
              <i className="fas fa-share-alt"></i>
              <span>Share</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Generate descriptive alt text for property images
const generatePropertyAltText = (property) => {
  const parts = [];

  // Add BHK if available
  if (property.bhk || property.bedrooms) {
    parts.push(`${property.bhk || property.bedrooms} BHK`);
  }

  // Add property type
  const propertyType = getPropertyTypeLabel(property.property_type);
  parts.push(propertyType);

  // Add purpose
  if (property.purpose) {
    parts.push(getListingLabel({ propertyType: property.property_type, purpose: property.purpose }) || 'in');
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
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(property.is_liked ?? false);
  const [showShareModal, setShowShareModal] = useState(false);
  const recordSwipe = usePropertyStore((state) => state.recordSwipe);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCompactCard = typeof itemClass === 'string' && itemClass.includes('compact-card');
  const visibleAmenitiesCount = isCompactCard ? 3 : 4;
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

  const normalizedPurpose = getListingLabel({
    propertyType: property.property_type,
    purpose: property.purpose,
  });
  const resolvedBadgeText = property.is_verified ? 'Verified' : (badgeText || normalizedPurpose);
  const shouldRenderBadge = Boolean(resolvedBadgeText);

  // Server-side filtering is now used, no client-side filtering needed

  const handleSaveClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const newValue = !isFavorite;
    setIsFavorite(newValue);
    if (isAuthenticated && id) {
      recordSwipe(id, newValue);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShareModal(true);
  };

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
        className={`property-item ${itemClass} ${isHovered ? 'property-item--hovered' : ''}`}
        data-status={property.status}
        data-type={property.property_type}
        data-location={property.city}
        data-sort={property.sort_by || 'newest'}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="property-item__thumb">
          <Link to={propertyURL} className="link">
            <LazyImage src={thumb} fallbackSrc={PROPERTY_IMAGE_FALLBACK} alt={generatePropertyAltText(property)} className="cover-img" />
          </Link>
          
          {/* Verified Badge with TrustBadge Component */}
          {property.is_verified && (
            <TrustBadge 
              type="verified" 
              position="top-left" 
              tooltip="Verified Property"
            />
          )}
          
          {/* Quick Action Buttons - Appear on Hover */}
          <div className={`property-item__quick-actions ${isHovered ? 'property-item__quick-actions--visible' : ''}`}>
            <button
              className={`quick-action-btn quick-action-btn--save ${isFavorite ? 'quick-action-btn--active' : ''}`}
              onClick={handleSaveClick}
              title={isFavorite ? 'Remove from favorites' : 'Save to favorites'}
              aria-label={isFavorite ? 'Remove from favorites' : 'Save property'}
            >
              <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
            </button>
            <button
              className="quick-action-btn quick-action-btn--share"
              onClick={handleShareClick}
              title="Share property"
              aria-label="Share property"
            >
              <i className="fas fa-share-alt"></i>
            </button>
          </div>
          
          {/* Property Type Badge */}
          {property.purpose && (
            <div className={`property-item__type-badge property-item__type-badge--${property.purpose}`}>
              {normalizedPurpose}
            </div>
          )}
          
          {shouldRenderBadge && !property.is_verified && <span className={badgeClass}>{resolvedBadgeText}</span>}
          {showDistance}
        </div>
        <div className="property-item__content">
          <div className="property-item__header">
            <div className="property-item__price-wrapper">
              <h6 className="property-item__price">
                <span className="property-item__price-currency">₹</span>
                <span className="property-item__price-value">{priceValue ? Number(priceValue).toLocaleString('en-IN') : 'Price on request'}</span>
                <span className="property-item__price-period">{day}</span>
              </h6>
              {property.price_per_sqft && (
                <span className="property-item__price-per-sqft">
                  ₹{property.price_per_sqft.toLocaleString()}/sqft
                </span>
              )}
            </div>
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
                {normalizedPurpose || 'Listing'}
              </span>
            )}
            {property.property_type && (
              <span className="badge bg-secondary">
                {getPropertyTypeLabel(property.property_type)}
              </span>
            )}
          </div>

          <div className="property-item__bottom flx-between gap-2">
            <ul className="amenities-list flx-align">
              {amenities.slice(0, visibleAmenitiesCount).map((amenity, amenityIndex) => (
                <li className="amenities-list__item flx-align" key={amenityIndex} title={amenity.text}>
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

      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        propertyTitle={title}
        propertyURL={propertyURL}
      />
    </>
  );
};

export default PropertyItem;
