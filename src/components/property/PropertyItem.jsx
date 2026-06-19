import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../i18n/I18nLink';
import { toast } from 'react-toastify';

import LazyImage from '../../common/ui/LazyImage';
import TrustBadge from '../ui/TrustBadge';
import { usePropertyStore } from '../../store';
import { useAuthStore } from '../../store';
import { useCompareStore } from '../../store/compareStore';
import {
  getListingLabel,
  getPropertyTypeLabel,
} from '../../utils/propertyTaxonomy';
const PROPERTY_IMAGE_FALLBACK = '/assets/images/thumbs/property-1.webp';

const isUsableImageUrl = (value) =>
  typeof value === 'string' && value.trim() !== '' && !/kuula\.co/i.test(value);

const ShareModal = ({ isOpen, onClose, propertyTitle, propertyURL }) => {
  const { t } = useTranslation('properties');
  if (!isOpen) return null;

  const fullURL = typeof window !== 'undefined' ? `${window.location.origin}${propertyURL}` : propertyURL;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(fullURL);
    // UX FIX (audit 2.4): use toast instead of alert() to avoid blocking the
    // UI thread and to match the rest of the app's notification pattern.
    toast.success(t('propertyItem.linkCopied'), { theme: 'colored' });
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
          <h5>{t('propertyItem.shareTitle')}</h5>
          <button className="share-modal__close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        <div className="share-modal__content">
          <button className="share-modal__btn" onClick={handleCopyLink}>
            <i className="fas fa-link"></i>
            <span>{t('propertyItem.copyLink')}</span>
          </button>
          {navigator.share && (
            <button className="share-modal__btn" onClick={handleShareNative}>
              <i className="fas fa-share-alt"></i>
              <span>{t('propertyItem.share')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Generate descriptive alt text for property images
const generatePropertyAltText = (property, t) => {
  const parts = [];

  // Add BHK if available
  if (property.bhk || property.bedrooms) {
    parts.push(`${property.bhk || property.bedrooms} BHK`);
  }

  // Add property type
  const propertyType = getPropertyTypeLabel(property.property_type, t);
  parts.push(propertyType);

  if (property.purpose) {
    parts.push(getListingLabel({ propertyType: property.property_type, purpose: property.purpose }, t) || 'in');
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
  return altText ? `${altText} - 360Ghar` : t('propertyItem.propertyListing');
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
  const { t } = useTranslation('properties');
  const [isHovered, setIsHovered] = useState(false);
  const [isFavorite, setIsFavorite] = useState(property.is_liked ?? false);
  // AUDIT FIX (improvement 2.10): minimal image carousel - cycle through
  // available images while hovering the card.
  const propertyImages = Array.isArray(property.images)
    ? property.images
        .map((img) => img?.image_url)
        .filter((url) => isUsableImageUrl(url))
    : [];
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  useEffect(() => {
    if (!isHovered || propertyImages.length <= 1) return;
    const timer = setInterval(() => {
      setActiveImageIdx((prev) => (prev + 1) % propertyImages.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [isHovered, propertyImages.length]);
  useEffect(() => {
    if (!isHovered) setActiveImageIdx(0);
  }, [isHovered]);
  const carouselThumb = propertyImages.length > 0 ? propertyImages[activeImageIdx] : thumb;
  // UX FIX (audit 2.10): keep favorite state in sync with the property data
  // (which the store updates optimistically after a swipe) so navigating back
  // to the listing reflects the latest like state.
  useEffect(() => {
    setIsFavorite(property.is_liked ?? false);
  }, [property.is_liked]);
  const [showShareModal, setShowShareModal] = useState(false);
  const recordSwipe = usePropertyStore((state) => state.recordSwipe);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  // AUDIT FIX (improvement 2.3): comparison selection
  const { compareList, toggleCompare, openCompare } = useCompareStore();
  const isInCompare = compareList.some((p) => p.id === id);
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
  const day = purpose === 'rent' ? (property.daily_rate ? t('listing.perDay') : t('listing.perMonth')) : '';
  const title = property.title || property.name || 'Property Title';
  const locationIcon = <i className="fas fa-map-marker-alt"></i>;
  const location = property.full_address || [property.locality, property.city, property.state].filter(Boolean).join(', ') || property.address || property.location || t('propertyItem.locationNotSpecified');
  const btnText = t('listing.viewDetails');

  // Enhanced amenities preview with more details
  const amenities = [];
  if (property.bedrooms) amenities.push({ icon: <i className="fas fa-bed"></i>, text: property.bedrooms > 1 ? t('propertyItem.beds', { count: property.bedrooms }) : t('propertyItem.bed', { count: property.bedrooms }) });
  if (property.bathrooms) amenities.push({ icon: <i className="fas fa-bath"></i>, text: property.bathrooms > 1 ? t('propertyItem.baths', { count: property.bathrooms }) : t('propertyItem.bath', { count: property.bathrooms }) });
  if (property.area_sqft) amenities.push({ icon: <i className="fas fa-ruler-combined"></i>, text: t('propertyItem.sqft', { count: property.area_sqft.toLocaleString() }) });

  // Add more amenities from API response
  if (property.balconies) amenities.push({ icon: <i className="fas fa-home"></i>, text: property.balconies > 1 ? t('propertyItem.balconies', { count: property.balconies }) : t('propertyItem.balcony', { count: property.balconies }) });
  if (property.parking_spaces) amenities.push({ icon: <i className="fas fa-car"></i>, text: t('propertyItem.parkingSpaces', { count: property.parking_spaces }) });

  // Show floor information if available
  if (property.floor_number && property.total_floors) {
    amenities.push({ icon: <i className="fas fa-building"></i>, text: t('propertyItem.floorInfo', { floor: property.floor_number, total: property.total_floors }) });
  } else if (property.floor_number) {
    amenities.push({ icon: <i className="fas fa-building"></i>, text: t('propertyItem.floorOnly', { floor: property.floor_number }) });
  }

  // Show age if available
  if (property.age_of_property) {
    amenities.push({ icon: <i className="fas fa-calendar"></i>, text: t('propertyItem.yearsOld', { count: property.age_of_property }) });
  }

  // URL
  const propertyURL = `/property/${id}`;

  const normalizedPurpose = getListingLabel({
    propertyType: property.property_type,
    purpose: property.purpose,
  }, t);
  const resolvedBadgeText = property.is_verified ? t('propertyItem.verifiedProperty') : (badgeText || normalizedPurpose);
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
          <I18nLink to={propertyURL} className="link">
            <LazyImage src={carouselThumb} fallbackSrc={PROPERTY_IMAGE_FALLBACK} alt={generatePropertyAltText(property, t)} className="cover-img" />
          </I18nLink>
          {/* AUDIT FIX (improvement 2.10): carousel dots when multiple images */}
          {propertyImages.length > 1 && (
            <div className="property-item__carousel-dots">
              {propertyImages.slice(0, 5).map((_, dotIdx) => (
                <span
                  key={dotIdx}
                  className={`carousel-dot ${dotIdx === activeImageIdx ? 'carousel-dot--active' : ''}`}
                />
              ))}
            </div>
          )}

          {/* Verified Badge with TrustBadge Component */}
          {property.is_verified && (
            <TrustBadge
              type="verified"
              position="top-left"
              tooltip={t('propertyItem.verifiedProperty')}
            />
          )}

          {/* Quick Action Buttons - Appear on Hover */}
          <div className={`property-item__quick-actions ${isHovered ? 'property-item__quick-actions--visible' : ''}`}>
            <button
              className={`quick-action-btn quick-action-btn--save ${isFavorite ? 'quick-action-btn--active' : ''}`}
              onClick={handleSaveClick}
              title={isFavorite ? t('propertyItem.removeFromFavorites') : t('propertyItem.saveToFavorites')}
              aria-label={isFavorite ? t('propertyItem.removeFromFavorites') : t('propertyItem.saveProperty')}
            >
              <i className={`${isFavorite ? 'fas' : 'far'} fa-heart`}></i>
            </button>
            <button
              className="quick-action-btn quick-action-btn--share"
              onClick={handleShareClick}
              title={t('propertyItem.shareProperty')}
              aria-label={t('propertyItem.shareProperty')}
            >
              <i className="fas fa-share-alt"></i>
            </button>
            {/* AUDIT FIX (improvement 2.3): compare toggle */}
            <button
              className={`quick-action-btn quick-action-btn--compare ${isInCompare ? 'quick-action-btn--active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const added = toggleCompare(property);
                if (added === false && !isInCompare) {
                  // reached the 4-property cap
                }
                if (compareList.length + (isInCompare ? 0 : 1) >= 2 && !isInCompare) {
                  openCompare();
                }
              }}
              title={t('propertyItem.compare')}
              aria-label={t('propertyItem.compare')}
            >
              <i className="fas fa-balance-scale"></i>
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
          {/* AUDIT FIX (improvement 2.7): badge indicating the listing has a
              360° virtual tour, so users can spot tour-enabled cards. */}
          {property.virtual_tour_url && (
            <span className="badge bg-dark text-white property-item__tour-badge" title={t('propertyItem.tourAvailable')}>
              <i className="fas fa-vr-cardboard me-1" aria-hidden="true"></i>360°
            </span>
          )}
        </div>
        <div className="property-item__content">
          <div className="property-item__header">
            <div className="property-item__price-wrapper">
              <h6 className="property-item__price">
                <span className="property-item__price-currency">₹</span>
                <span className="property-item__price-value">{priceValue ? Number(priceValue).toLocaleString('en-IN') : t('listing.priceOnRequest')}</span>
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
            <I18nLink to={propertyURL} className="link">
              {title}
            </I18nLink>
          </h6>

          <p className="property-item__location d-flex gap-2">
            <span className={`icon ${iconsClass}`}> {locationIcon}</span>
            <span className="flex-grow-1">{location}</span>
          </p>

          {/* Property Type and Purpose Tags */}
          <div className="property-item__tags mb-2">
            {property.purpose && (
              <span className="badge bg-primary me-1">
                {normalizedPurpose || t('propertyItem.listing')}
              </span>
            )}
            {property.property_type && (
              <span className="badge bg-secondary">
                {getPropertyTypeLabel(property.property_type, t)}
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
              <I18nLink to={propertyURL} className={`simple-btn ${btnClass}`}>
                {btnText}
                <span className="icon-right">
                  {' '}
                  <i className="fas fa-arrow-right"></i>{' '}
                </span>
              </I18nLink>
            )}
          </div>

          {/* Show top amenities and features */}
          {showFeatureBadges && (topAmenities.length > 0 || topFeatures.length > 0) && (
            <div className="property-item__amenities-features mt-2">
              {topAmenities.length > 0 && (
                <div className="amenities-preview">
                  <small className="text-muted">{t('propertyItem.amenities')}</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {topAmenities.map((amenity, index) => (
                      <span key={index} className="badge bg-light text-dark small">
                        {amenity.title || amenity}
                      </span>
                    ))}
                    {propertyAmenities.length > 3 && (
                      <span className="badge bg-light text-dark small">
                        {t('propertyItem.more', { count: propertyAmenities.length - 3 })}
                      </span>
                    )}
                  </div>
                </div>
              )}
              {topFeatures.length > 0 && (
                <div className="features-preview mt-1">
                  <small className="text-muted">{t('propertyItem.features')}</small>
                  <div className="d-flex flex-wrap gap-1 mt-1">
                    {topFeatures.map((feature, index) => (
                      <span key={index} className="badge bg-success text-white small">
                        {feature}
                      </span>
                    ))}
                    {propertyFeatures.length > 2 && (
                      <span className="badge bg-success text-white small">
                        {t('propertyItem.more', { count: propertyFeatures.length - 2 })}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {btnRenderBottom && (
            <I18nLink to={propertyURL} className={`simple-btn ${btnClass}`}>
              {btnText}
              <span className="icon-right">
                {' '}
                <i className="fas fa-arrow-right"></i>{' '}
              </span>
            </I18nLink>
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
