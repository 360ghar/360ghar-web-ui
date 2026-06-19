import { useMemo, useRef, useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18nNavigate } from '../../i18n/I18nLink';
import Lightbox from 'yet-another-react-lightbox';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';
import Thumbnails from 'yet-another-react-lightbox/plugins/thumbnails';
import { useSwipeable } from 'react-swipeable';
import PropTypes from 'prop-types';
import 'yet-another-react-lightbox/styles.css';
import 'yet-another-react-lightbox/plugins/thumbnails.css';
import CommonSidebar from '../../common/listing/CommonSidebar';
import { usePropertyStore } from '../../store/propertyStore';
import { useVisitStore } from '../../store';
import { useAuthStore } from '../../store';
import LazyImage from '../../common/ui/LazyImage';
import PropertyActions from './PropertyActions';
import PropertyItem from './PropertyItem';
import LazyVRPlayer from './LazyVRPlayer';
import WhatsAppButton from '../ui/WhatsAppButton';
import LoadingSkeleton from '../ui/LoadingSkeleton';
import { propertyAPIService } from '../../services/propertyAPIService';
import { hapticLight, hapticSuccess } from '../../utils/hapticFeedback';
import { localInputToServerTimestamp } from '../../utils/dateUtils';
import { getListingLabel, getPropertyTypeLabel } from '../../utils/propertyTaxonomy';
const PROPERTY_IMAGE_FALLBACK = '/assets/images/thumbs/property-1.webp';
function formatCurrency(value) {
  if (value === null || value === undefined) return 'Price on request';
  try {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  } catch {
    return `₹${value}`;
  }
}
function formatNumber(value) {
  if (value === null || value === undefined) return null;
  try {
    return Number(value).toLocaleString('en-IN');
  } catch {
    return String(value);
  }
}
function formatDate(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return null;
  }
}

function parseVideoUrl(url) {
  if (!url) return null;
  const ytMatch = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
  if (ytMatch) return { type: 'youtube', id: ytMatch[1], embed: `https://www.youtube.com/embed/${ytMatch[1]}?rel=0` };
  const vimeoMatch = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return { type: 'vimeo', id: vimeoMatch[1], embed: `https://player.vimeo.com/video/${vimeoMatch[1]}` };
  if (/\.(mp4|webm|ogg)(\?|$)/i.test(url)) return { type: 'native', src: url };
  return { type: 'iframe', src: url };
}

function getMediaTabDefault(virtualTourUrl, videoUrl, hasPhotos) {
  if (virtualTourUrl) return 'tour';
  if (hasPhotos) return 'photos';
  if (videoUrl) return 'video';
  return 'photos';
}

const MediaTabButton = ({ active, disabled, onClick, icon, label, count }) => (
  <button
    type="button"
    className={`media-tab-btn ${active ? 'active' : ''}`}
    disabled={disabled}
    onClick={onClick}
    title={disabled ? `No ${label.toLowerCase()} available` : label}
  >
    <i className={icon}></i>
    <span className="ms-1">{label}{count > 0 ? ` (${count})` : ''}</span>
  </button>
);

MediaTabButton.propTypes = {
  active: PropTypes.bool,
  disabled: PropTypes.bool,
  onClick: PropTypes.func.isRequired,
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  count: PropTypes.number
};

const PropertyDetailsSection = ({ property }) => {
  const { t } = useTranslation('properties');
  const navigate = useI18nNavigate();
  const images = Array.isArray(property?.images) ? property.images : [];
  const galleryImages = useMemo(
    () => images.filter((i) => i?.image_url && !/kuula\.co/i.test(i.image_url)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [JSON.stringify(images.map(i => i?.image_url))]
  );
  const mainImage =
    galleryImages.find((i) => i?.is_main_image)?.image_url ||
    galleryImages[0]?.image_url ||
    property?.main_image_url ||
    images.find((i) => i.is_main_image)?.image_url ||
    images[0]?.image_url;
  const title = property?.title || t('details.title');
  const description = property?.description || '';
  const purpose = property?.purpose || property?.price_type;
  const priceValue = purpose === 'rent' ? (property?.monthly_rent || property?.daily_rate || property?.base_price) : property?.base_price;
  const price = formatCurrency(priceValue);
  const day = purpose === 'rent' ? (property?.daily_rate ? '/per day' : '/per month') : '';
  const address = property?.full_address || [property?.locality, property?.city, property?.state].filter(Boolean).join(', ');

  const virtualTourUrl = property?.virtual_tour_url;
  const videoUrl = property?.video_url;
  const parsedVideo = useMemo(() => parseVideoUrl(videoUrl), [videoUrl]);
  const hasPhotos = galleryImages.length > 0;
  const mediaDefault = getMediaTabDefault(virtualTourUrl, videoUrl, hasPhotos);

  const [mediaTab, setMediaTab] = useState(mediaDefault);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const tourRef = useRef(null);
  const galleryRef = useRef(null);
  const [swipeFeedback, setSwipeFeedback] = useState(null);
  const [preloadedImages, setPreloadedImages] = useState(new Set());

  const preloadImage = useCallback((url) => {
    if (!url || preloadedImages.has(url)) return;
    const img = new Image();
    img.src = url;
    img.onload = () => {
      setPreloadedImages(prev => new Set(prev).add(url));
    };
  }, [preloadedImages]);

  const preloadAdjacentImages = useCallback((centerIdx) => {
    const indices = [];
    for (let i = 1; i <= 2; i++) {
      if (centerIdx + i < galleryImages.length) indices.push(centerIdx + i);
      if (centerIdx - i >= 0) indices.push(centerIdx - i);
    }
    indices.forEach(idx => {
      if (galleryImages[idx]?.image_url) {
        preloadImage(galleryImages[idx].image_url);
      }
    });
  }, [galleryImages, preloadImage]);

  useEffect(() => {
    if (galleryImages.length > 0) {
      preloadAdjacentImages(0);
    }
  }, [galleryImages, preloadAdjacentImages]);

  useEffect(() => {
    if (lightboxOpen) {
      preloadAdjacentImages(lightboxIndex);
    }
  }, [lightboxOpen, lightboxIndex, preloadAdjacentImages]);

  const previewStats = [
    { icon: <i className="fas fa-bed"></i>, label: t('details.bedrooms'), value: property?.bedrooms },
    { icon: <i className="fas fa-bath"></i>, label: t('details.bathrooms'), value: property?.bathrooms },
    { icon: <i className="fas fa-ruler-combined"></i>, label: t('details.area'), value: property?.area_sqft ? `${property.area_sqft} sqft` : null },
    { icon: <i className="fas fa-building"></i>, label: t('details.floor'), value: property?.floor_number },
    { icon: <i className="fas fa-parking"></i>, label: t('details.parking'), value: property?.parking_spaces },
  ].filter((x) => x.value !== null && x.value !== undefined && x.value !== '');

  const features = Array.isArray(property?.features) ? property.features : [];
  const listingPreferences = property?.listing_preferences || {};
  const propertyTypeLabel = getPropertyTypeLabel(property?.property_type, t);
  const listingLabel = getListingLabel({
    propertyType: property?.property_type,
    purpose: property?.purpose || property?.price_type,
  }, t);

  const keyDetails = useMemo(() => ([
    { label: t('details.propertyType'), value: propertyTypeLabel },
    { label: t('details.listing'), value: listingLabel },
    { label: t('details.status'), value: property?.status },
    { label: t('details.available'), value: property?.is_available === true ? t('details.yes') : (property?.is_available === false ? t('details.no') : null) },
    { label: t('details.availableFrom'), value: formatDate(property?.available_from) },
    { label: t('details.builder'), value: property?.builder_name },
    { label: t('details.owner'), value: property?.owner_name },
    { label: t('details.ownerContact'), value: property?.owner_contact },
    listingPreferences?.gender_preference
      ? {
          label: t('details.genderPreference'),
          value: listingPreferences.gender_preference.replace(/_/g, ' '),
        }
      : null,
    listingPreferences?.sharing_type
      ? {
          label: t('details.roomType'),
          value: listingPreferences.sharing_type.replace(/_/g, ' '),
        }
      : null,
    { label: t('details.listingId'), value: property?.id },
  ].filter(i => i && i.value !== null && i.value !== undefined && i.value !== '')), [listingLabel, listingPreferences, property, propertyTypeLabel, t]);

  const pricingDetails = useMemo(() => ([
    { label: purpose === 'rent' ? t('details.monthlyRent') : t('details.basePrice'), value: formatCurrency(priceValue) },
    property?.daily_rate ? { label: t('details.dailyRate'), value: formatCurrency(property.daily_rate) } : null,
    property?.security_deposit ? { label: t('details.securityDeposit'), value: formatCurrency(property.security_deposit) } : null,
    property?.maintenance_charges ? { label: t('details.maintenance'), value: formatCurrency(property.maintenance_charges) } : null,
    property?.price_per_sqft ? { label: t('details.pricePerSqft'), value: `₹${formatNumber(property.price_per_sqft)}` } : null,
    property?.minimum_stay_days ? { label: t('details.minimumStayDays'), value: property.minimum_stay_days } : null,
    property?.max_occupancy ? { label: t('details.maxOccupancy'), value: property.max_occupancy } : null,
  ].filter(Boolean)), [property, priceValue, purpose, t]);

  const buildingDetails = useMemo(() => ([
    property?.area_type ? { label: t('details.areaType'), value: property.area_type } : null,
    property?.area_sqft ? { label: t('details.areaSqft'), value: formatNumber(property.area_sqft) } : null,
    property?.balconies ? { label: t('details.balconies'), value: property.balconies } : null,
    property?.total_floors ? { label: t('details.totalFloors'), value: property.total_floors } : null,
    property?.age_of_property ? { label: t('details.ageOfProperty'), value: property.age_of_property } : null,
  ].filter(Boolean)), [property, t]);

  const addressDetails = useMemo(() => ([
    { label: t('details.fullAddress'), value: address },
    property?.landmark ? { label: t('details.landmark'), value: property.landmark } : null,
    property?.sub_locality ? { label: t('details.subLocality'), value: property.sub_locality } : null,
    property?.locality ? { label: t('details.locality'), value: property.locality } : null,
    property?.city ? { label: t('details.city'), value: property.city } : null,
    property?.state ? { label: t('details.state'), value: property.state } : null,
    property?.pincode ? { label: t('details.pincode'), value: property.pincode } : null,
    property?.country ? { label: t('details.country'), value: property.country } : null,
  ].filter(Boolean)), [address, property, t]);

  const engagementDetails = useMemo(() => ([
    property?.view_count != null ? { label: t('details.views'), value: formatNumber(property.view_count) } : null,
    property?.like_count != null ? { label: t('details.likes'), value: formatNumber(property.like_count) } : null,
    property?.interest_count != null ? { label: t('details.interests'), value: formatNumber(property.interest_count) } : null,
    property?.created_at ? { label: t('details.created'), value: formatDate(property.created_at) } : null,
    property?.updated_at ? { label: t('details.updated'), value: formatDate(property.updated_at) } : null,
  ].filter(Boolean)), [property, t]);

  const { recordSwipe } = usePropertyStore();
  const { scheduleVisit, isLoading: visitLoading } = useVisitStore();
  const { isAuthenticated, user } = useAuthStore();

  const [visitDatePart, setVisitDatePart] = useState('');
  const [visitTimePart, setVisitTimePart] = useState('');
  const visitDate = visitDatePart && visitTimePart ? `${visitDatePart}T${visitTimePart}` : '';
  const [visitNotes, setVisitNotes] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  const [showPhoneNumber, setShowPhoneNumber] = useState(false);
  const [showCallbackModal, setShowCallbackModal] = useState(false);
  const [callbackForm, setCallbackForm] = useState({
    phone: user?.phone || '',
    preferredTime: '',
    notes: ''
  });
  const [callbackLoading, setCallbackLoading] = useState(false);
  const [callbackSuccess, setCallbackSuccess] = useState(false);
  const [callbackErrors, setCallbackErrors] = useState({});

  const [visitErrors, setVisitErrors] = useState({});
  const [visitSuccess, setVisitSuccess] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);

  // Similar Properties State
  const [similarProperties, setSimilarProperties] = useState([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);

  // Fetch similar properties
  useEffect(() => {
    const fetchSimilarProperties = async () => {
      if (!property?.id) return;
      
      setLoadingSimilar(true);
      try {
        // Build filter criteria based on current property
        const filters = {
          locality: property.locality,
          city: property.city,
          purpose: property.purpose,
          property_type: property.property_type,
          limit: 4
        };
        
        // Add price range (±20% of current property price)
        if (property.base_price) {
          const priceBuffer = property.base_price * 0.2;
          filters.price_min = Math.max(0, property.base_price - priceBuffer);
          filters.price_max = property.base_price + priceBuffer;
        }
        
        const response = await propertyAPIService.searchProperties(filters, null, 4);
        const properties = Array.isArray(response.data?.items) ? response.data.items : [];
        
        // Filter out the current property
        const filtered = properties.filter(p => p.id !== property.id).slice(0, 4);
        setSimilarProperties(filtered);
      } catch (error) {
        console.error('Error fetching similar properties:', error);
      } finally {
        setLoadingSimilar(false);
      }
    };
    
    fetchSimilarProperties();
  }, [property?.id, property?.locality, property?.city, property?.purpose, property?.property_type, property?.base_price]);

  const lightboxSlides = useMemo(() =>
    galleryImages.map((img) => ({
      src: img.image_url,
      alt: img.caption || title,
    })), [galleryImages, title]
  );

  const openLightbox = useCallback((index = 0) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
    preloadAdjacentImages(index);
  }, [preloadAdjacentImages]);

  const navigateLightbox = useCallback((direction) => {
    if (galleryImages.length <= 1) return;
    const newIndex = direction === 'next'
      ? (lightboxIndex + 1) % galleryImages.length
      : (lightboxIndex - 1 + galleryImages.length) % galleryImages.length;
    setLightboxIndex(newIndex);
    preloadAdjacentImages(newIndex);
  }, [galleryImages.length, lightboxIndex, preloadAdjacentImages]);

  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeFeedback('swipe-left-feedback');
      hapticLight();
      navigateLightbox('next');
      setTimeout(() => setSwipeFeedback(null), 300);
    },
    onSwipedRight: () => {
      setSwipeFeedback('swipe-right-feedback');
      hapticLight();
      navigateLightbox('prev');
      setTimeout(() => setSwipeFeedback(null), 300);
    },
    onTap: () => {
      openLightbox(0);
    },
    trackMouse: true,
    delta: 50,
    swipeDuration: 500,
    preventScrollOnSwipe: false,
  });

  const preloadLinks = useMemo(() => {
    const links = [];
    if (galleryImages.length > 0) {
      for (let i = 1; i <= 2; i++) {
        if (i < galleryImages.length && galleryImages[i]?.image_url) {
          const url = galleryImages[i].image_url;
          // Detect MIME type from URL extension
          const ext = url?.split('?')[0]?.split('#')[0]?.split('.')?.pop()?.toLowerCase();
          const mime = ext === 'webp' ? 'image/webp' : ext === 'png' ? 'image/png' : 'image/jpeg';
          links.push(
            <link
              key={`preload-next-${i}`}
              rel="preload"
              as="image"
              href={url}
              type={mime}
            />
          );
        }
      }
    }
    return links;
  }, [galleryImages]);

  if (!property) return null;

  const toggleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/property/${property?.id}` } });
      return;
    }
    setLikeLoading(true);
    // AUDIT FIX (2.3): use is_liked (the canonical store/API field) with a
    // legacy `liked` fallback, so the toggle persists visually after re-fetch.
    const currentLiked = property?.is_liked ?? property?.liked ?? false;
    try {
      await recordSwipe(property?.id, !currentLiked);
      hapticSuccess();
    } finally {
      setLikeLoading(false);
    }
  };

  const onSchedule = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/property/${property?.id}` } });
      return;
    }
    
    // Validate form
    const errors = {};
    if (!visitDate) {
      errors.visitDate = 'Please select a date and time';
    } else {
      const selectedDate = new Date(visitDate);
      const now = new Date();
      if (selectedDate <= now) {
        errors.visitDate = 'Please select a future date and time';
      }
    }
    
    if (Object.keys(errors).length > 0) {
      setVisitErrors(errors);
      setShakeForm(true);
      setTimeout(() => setShakeForm(false), 500);
      return;
    }
    
    setVisitErrors({});
    const isoDate = localInputToServerTimestamp(visitDate);
    if (!isoDate) {
      setVisitErrors({ visitDate: 'Please enter a valid date and time' });
      return;
    }
    const res = await scheduleVisit({ property_id: property?.id, scheduled_date: isoDate, special_requirements: visitNotes });
    if (res) {
      setVisitNotes('');
      setVisitDatePart('');
      setVisitTimePart('');
      setVisitSuccess(true);
      setTimeout(() => setVisitSuccess(false), 5000);
      hapticSuccess();
    }
  };

  const handlePhoneReveal = () => {
    setShowPhoneNumber(true);
  };

  const validateCallbackForm = () => {
    const errors = {};
    const phoneRegex = /^[\d\s+()-]{10,}$/;
    if (!callbackForm.phone || !phoneRegex.test(callbackForm.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    if (!callbackForm.preferredTime) {
      errors.preferredTime = 'Please select a preferred time';
    }
    return errors;
  };

  const handleCallbackSubmit = async (e) => {
    e.preventDefault();
    const errors = validateCallbackForm();
    if (Object.keys(errors).length > 0) {
      setCallbackErrors(errors);
      return;
    }
    setCallbackErrors({});
    setCallbackLoading(true);
    // CRITICAL FIX (audit 2.4): the callback form was a non-functional mock
    // (`setTimeout` + fake success). Wire it to the existing visit endpoint
    // so an agent actually receives the request. The visit contract requires
    // a scheduled_date; for a callback we schedule a generic follow-up window
    // (next day) and flag it via special_requirements so agents can filter.
    try {
      const { visitService } = await import('../../services/visitService');
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 16);
      await visitService.schedule({
        property_id: property?.id,
        scheduled_date: tomorrow,
        special_requirements: `Callback requested. Phone: ${
          callbackForm.phone || 'not provided'
        }. Preferred time: ${callbackForm.preferredTime || 'anytime'}. Notes: ${
          callbackForm.notes || 'none'
        }`,
      });
      setCallbackSuccess(true);
      setTimeout(() => {
      setShowCallbackModal(false);
      setCallbackSuccess(false);
      setCallbackForm({ phone: user?.phone || '', preferredTime: '', notes: '' });
    }, 3000);
    } catch (err) {
      setCallbackErrors({
        form:
          err?.response?.data?.detail?.message ||
          err?.response?.data?.detail ||
          err?.message ||
          'Could not submit callback request. Please try again or call us directly.',
      });
    } finally {
      setCallbackLoading(false);
    }
  };

  const enterFullscreenTour = () => {
    try {
      const node = tourRef.current;
      if (!node) return;
      if (node.requestFullscreen) node.requestFullscreen();
      else if (node.webkitRequestFullscreen) node.webkitRequestFullscreen();
      else if (node.mozRequestFullScreen) node.mozRequestFullScreen();
      else if (node.msRequestFullscreen) node.msRequestFullscreen();
    } catch {
      // Ignored
    }
  };

  return (
    <>
      {preloadLinks}
      <section className="property-details compact padding-y-60">
        <div className="container container-two">
          <div className="row gy-4">
            <div className="col-lg-8">
              {/* Media Tabs */}
              <div className="media-tabs-container mb-2">
                <div className="media-tabs d-flex align-items-center gap-2 flex-wrap">
                  <MediaTabButton
                    active={mediaTab === 'tour'}
                    disabled={!virtualTourUrl}
                    onClick={() => setMediaTab('tour')}
                    icon="fas fa-vr-cardboard"
                    label={t('details.virtualTour')}
                  />
                  <MediaTabButton
                    active={mediaTab === 'photos'}
                    disabled={!hasPhotos}
                    onClick={() => setMediaTab('photos')}
                    icon="fas fa-images"
                    label={t('details.photos')}
                    count={galleryImages.length}
                  />
                  <MediaTabButton
                    active={mediaTab === 'video'}
                    disabled={!parsedVideo}
                    onClick={() => setMediaTab('video')}
                    icon="fas fa-video"
                    label={t('details.video')}
                  />
                </div>
                {mediaTab === 'tour' && virtualTourUrl ? (
                  <div className="media-actions d-flex gap-2 mt-2 mt-sm-0">
                    <button
                      type="button"
                      className="btn btn-outline-dark btn-sm"
                      onClick={enterFullscreenTour}
                      title={t('details.fullScreen')}
                      aria-label={t('details.openVirtualTourFullScreen')}
                    >
                      <i className="fas fa-expand" aria-hidden="true"></i>
                    </button>
                    <a href={virtualTourUrl} target="_blank" rel="noopener noreferrer" className="btn btn-outline-dark btn-sm" title={t('details.openInNewTab')}>
                      <i className="fas fa-external-link-alt" aria-hidden="true"></i>
                    </a>
                  </div>
                ) : mediaTab === 'photos' && galleryImages.length > 0 ? (
                  <div className="media-actions d-flex gap-2 mt-2 mt-sm-0">
                    <button type="button" className="btn btn-outline-dark btn-sm" onClick={() => openLightbox(0)} title={t('details.viewAllPhotos')}>
                      <i className="fas fa-expand"></i> {t('details.viewAll')}
                    </button>
                  </div>
                ) : null}
              </div>

              {/* Lightbox */}
              <Lightbox
                open={lightboxOpen}
                close={() => setLightboxOpen(false)}
                index={lightboxIndex}
                slides={lightboxSlides}
                plugins={[Zoom, Thumbnails]}
                zoom={{ 
                  maxZoomPixelRatio: 3,
                  zoomInMultiplier: 2,
                  doubleTapDelay: 300,
                  doubleClickDelay: 300,
                  keyboardMoveDistance: 50,
                  pinchZoomDistanceFactor: 100,
                  scrollToZoom: true
                }}
                carousel={{ finite: galleryImages.length <= 1 }}
                animation={{ swipe: 500 }}
                render={{
                  buttonPrev: galleryImages.length <= 1 ? () => null : undefined,
                  buttonNext: galleryImages.length <= 1 ? () => null : undefined,
                  toolbar: ({ zoom }) => (
                    <div className="zoom-indicator">
                      {Math.round((zoom || 1) * 100)}%
                    </div>
                  ),
                }}
                on={{ 
                  view: ({ index }) => {
                    preloadAdjacentImages(index);
                  }
                }}
              />

              {/* Media Content */}
              {mediaTab === 'tour' && virtualTourUrl && (
                <div className="virtual-tour-container" ref={tourRef}>
                  <LazyVRPlayer
                    virtualTourUrl={virtualTourUrl}
                    thumbnailUrl={mainImage}
                    title={title}
                  />
                </div>
              )}

              {mediaTab === 'photos' && (
                <div className="property-gallery" ref={galleryRef} {...swipeHandlers}>
                  {mainImage ? (
                    <div
                      className={`property-details__thumb media-hero cursor-pointer ${swipeFeedback || ''}`}
                    >
                      <div onClick={() => openLightbox(0)} style={{ width: '100%', height: '100%' }}>
                        <LazyImage
                          src={mainImage}
                          fallbackSrc={PROPERTY_IMAGE_FALLBACK}
                          alt={title}
                          className="cover-img"
                          priority
                        />
                      </div>
                      <div className="gallery-overlay">
                        <i className="fas fa-search-plus"></i>
                      </div>
                      {galleryImages.length > 1 && (
                        <div
                          className="image-counter"
                          onClick={(e) => {
                            e.stopPropagation();
                            openLightbox(0);
                          }}
                        >
                          1 / {galleryImages.length}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="property-details__thumb media-hero no-image-placeholder">
                      <i className="fas fa-image fa-3x text-muted"></i>
                      <p className="text-muted mt-2">{t('details.noPhotosAvailable')}</p>
                    </div>
                  )}
                  {galleryImages.length > 1 && (
                    <div className="gallery-thumbnails mt-2">
                      <div className="row g-2">
                        {galleryImages.slice(0, 7).map((img, idx) => (
                          <div className="col-3 col-md-2" key={idx}>
                            <div
                              className="gallery-thumb-item cursor-pointer"
                              onClick={() => openLightbox(idx)}
                            >
                              <LazyImage
                                src={img.image_url}
                                fallbackSrc={PROPERTY_IMAGE_FALLBACK}
                                alt={img.caption || `Image ${idx + 1}`}
                                className="img-fluid rounded"
                                loading="lazy"
                                decoding="async"
                              />
                            </div>
                          </div>
                        ))}
                        {galleryImages.length > 7 && (
                          <div className="col-3 col-md-2">
                            <div
                              className="gallery-thumb-item gallery-more cursor-pointer"
                              onClick={() => openLightbox(7)}
                            >
                              <span>+{galleryImages.length - 7}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {mediaTab === 'video' && parsedVideo && (
                <div className="video-container">
                  {parsedVideo.type === 'native' ? (
                    <video controls className="video-player" preload="metadata">
                      <source src={parsedVideo.src} type="video/mp4" />
                      {t('details.browserNoVideo')}
                    </video>
                  ) : (
                    <iframe
                      src={parsedVideo.embed || parsedVideo.src}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                      allowFullScreen
                      loading="lazy"
                      title={t('details.propertyVideo')}
                      className="video-iframe"
                    />
                  )}
                </div>
              )}

              {/* Actions Bar */}
              <div className="property-actions-bar mt-3 mb-3">
                <PropertyActions
                  property={property}
                  onLikeToggle={toggleLike}
                  isLiked={property.is_liked ?? property.liked}
                  likeLoading={likeLoading}
                />
              </div>

              <h1 className="property-details__title mt-3 mb-1">{title}</h1>
              <h5 className="property-details__price mb-2">
                {price} <span className="day">{day}</span>
              </h5>
              <div className="property-trust-strip d-flex flex-wrap gap-2 mb-3">
                {property?.is_verified && <span className="badge bg-success">{t('details.verifiedListing')}</span>}
                {property?.id && <span className="badge bg-light text-dark border">ID: {property.id}</span>}
                {property?.updated_at && <span className="badge bg-light text-dark border">{t('details.updated')}: {formatDate(property.updated_at)}</span>}
              </div>
              {/* AUDIT FIX (UX 2.11): removed the duplicate mobile-only owner
                  box. The sidebar owner card (visible on all breakpoints) and
                  the mobile sticky bar already expose owner name, Call,
                  WhatsApp and Callback, so the extra mobile box was redundant. */}
              {/* Description */}
              {description && <p className="property-details__desc mb-3">{description}</p>}

              <div className="property-details-wrapper">
                <div className="property-details-item">
                  <h6 className="property-details-item__title">{t('details.overview')}</h6>
                  <div className="property-details-item__content">
                    <div className="row gy-4 gy-lg-5">
                      {previewStats.map((stat, index) => (
                        <div className="col-sm-4 col-6" key={index}>
                          <div className="amenities-content d-flex align-items-center">
                            <span className="amenities-content__icon">{stat.icon}</span>
                            <div className="amenities-content__inner">
                              <span className="amenities-content__text">{stat.label}</span>
                              <h6 className="amenities-content__title mb-0 font-16">{stat.value}</h6>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {keyDetails.length > 0 && (
                  <div className="property-details-item">
                    <h6 className="property-details-item__title">{t('details.keyDetails')}</h6>
                    <div className="property-details-item__content">
                      <div className="row gy-3">
                        {keyDetails.map((d, i) => (
                          <div className="col-sm-6" key={i}>
                            <div className="d-flex align-items-center">
                              <span className="amenities-content__text me-3">{d.label}</span>
                              <h6 className="amenities-content__title mb-0 font-15">{d.value}</h6>
                            </div>
                          </div>
                        ))}
                      </div>
                      {Array.isArray(property.tags) && property.tags.length > 0 && (
                        <div className="mt-3 d-flex flex-wrap gap-2">
                          {property.tags.map((t, idx) => (
                            <span key={idx} className="badge bg-light text-dark border">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {pricingDetails.length > 0 && (
                  <div className="property-details-item">
                    <h6 className="property-details-item__title">{t('details.pricingCosts')}</h6>
                    <div className="property-details-item__content">
                      <div className="row gy-3">
                        {pricingDetails.map((d, i) => (
                          <div className="col-sm-6" key={i}>
                            <div className="d-flex align-items-center">
                              <span className="amenities-content__text me-3">{d.label}</span>
                              <h6 className="amenities-content__title mb-0 font-15">{d.value}</h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {buildingDetails.length > 0 && (
                  <div className="property-details-item">
                    <h6 className="property-details-item__title">{t('details.buildingArea')}</h6>
                    <div className="property-details-item__content">
                      <div className="row gy-3">
                        {buildingDetails.map((d, i) => (
                          <div className="col-sm-6" key={i}>
                            <div className="d-flex align-items-center">
                              <span className="amenities-content__text me-3">{d.label}</span>
                              <h6 className="amenities-content__title mb-0 font-15">{d.value}</h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {features.length > 0 && (
                  <div className="property-details-item">
                    <h6 className="property-details-item__title">{t('details.features')}</h6>
                    <div className="property-details-item__content">
                      <div className="row gy-2">
                        <div className="col-12">
                          <ul className="check-list two-column">
                            {features.map((text, idx) => (
                              <li className="check-list__item d-flex align-items-center" key={idx}>
                                <span className="icon">
                                  <i className="fas fa-check"></i>
                                </span>
                                <span className="text">{text}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="property-details-item">
                  <h6 className="property-details-item__title">{t('details.address')}</h6>
                  <div className="property-details-item__content">
                    <div className="row gy-3">
                      {addressDetails.map((d, i) => (
                        <div className="col-sm-6" key={i}>
                          <div className="d-flex align-items-center">
                            <span className="amenities-content__text me-3">{d.label}</span>
                            <h6 className="amenities-content__title mb-0 font-15">{d.value}</h6>
                          </div>
                        </div>
                      ))}
                    </div>
                    {(() => {
                      // CRITICAL FIX (audit 2.2): API returns lat/lng, but some
                      // legacy/seed records expose latitude/longitude. Accept
                      // both with lat/lng taking precedence.
                      const lat = property.lat ?? property.latitude;
                      const lng = property.lng ?? property.longitude;
                      if (!lat || !lng) return null;
                      return (
                        <div className="address-map mt-3">
                          <iframe
                            src={`https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Property Location"
                            style={{ width: '100%', minHeight: 320, border: 0 }}
                          />
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Virtual tour section has been moved to top media area */}

                {engagementDetails.length > 0 && (
                  <div className="property-details-item">
                    <h6 className="property-details-item__title">{t('details.engagement')}</h6>
                    <div className="property-details-item__content">
                      <div className="row gy-3">
                        {engagementDetails.map((d, i) => (
                          <div className="col-sm-6" key={i}>
                            <div className="d-flex align-items-center">
                              <span className="amenities-content__text me-3">{d.label}</span>
                              <h6 className="amenities-content__title mb-0 font-15">{d.value}</h6>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Similar Properties Section */}
                {(similarProperties.length > 0 || loadingSimilar) && (
                  <div className="similar-properties-section">
                    <h6 className="similar-properties-section__title">
                      <i className="fas fa-home me-2"></i>
                      {t('details.similarProperties')}
                    </h6>
                    <div className="similar-properties-scroll">
                      {loadingSimilar ? (
                        <>
                          <div style={{ flex: '0 0 280px' }}>
                            <LoadingSkeleton variant="card" count={1} />
                          </div>
                          <div style={{ flex: '0 0 280px' }}>
                            <LoadingSkeleton variant="card" count={1} />
                          </div>
                          <div style={{ flex: '0 0 280px' }}>
                            <LoadingSkeleton variant="card" count={1} />
                          </div>
                        </>
                      ) : (
                        similarProperties.map((similarProperty, index) => (
                          <PropertyItem
                            key={similarProperty.id || index}
                            property={similarProperty}
                            itemClass="style-two style-shaped"
                            btnClass="text-gradient fw-semibold"
                            badgeText={similarProperty.status || "For Sale"}
                            badgeClass="property-item__badge"
                            iconsClass="text-gradient"
                            btnRenderBottom={true}
                            btnRenderRight={false}
                          />
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="col-lg-4">
              <div className="summary-card position-sticky">
                <div className="card compact-card">
                  <div className="card-body">
                    <div className="price-section d-flex align-items-start justify-content-between mb-0">
                      <div>
                        <div className="price-amount">
                          {price}
                          <span className="price-period">{day}</span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${(property.is_liked ?? property.liked) ? 'btn-danger' : 'btn-outline-secondary'}`}
                        onClick={toggleLike}
                        disabled={likeLoading}
                        title={(property.is_liked ?? property.liked) ? 'Unlike' : 'Like'}
                        aria-label={(property.is_liked ?? property.liked) ? 'Remove property from favorites' : 'Save property to favorites'}
                        aria-pressed={Boolean(property.is_liked ?? property.liked)}
                      >
                        <i className="fas fa-heart" aria-hidden="true"></i>
                      </button>
                    </div>

                    {address && (
                      <div className="text-truncate text-muted small mb-2">
                        <i className="fas fa-map-marker-alt me-1"></i> {address}
                      </div>
                    )}

                    <div className="row g-2 mb-2">
                      {previewStats.slice(0, 6).map((s, i) => (
                        <div className="col-6" key={i}>
                          <div className="d-flex align-items-center gap-2 small">
                            <span className="text-muted">{s.icon}</span>
                            <span>{s.value}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="d-flex flex-wrap gap-2 mb-3">
                      {property.price_per_sqft && (
                        <span className="badge bg-light text-dark border">₹{formatNumber(property.price_per_sqft)}/sqft</span>
                      )}
                      {property.maintenance_charges && (
                        <span className="badge bg-light text-dark border">Maint: {formatCurrency(property.maintenance_charges)}</span>
                      )}
                      {property.floor_number && property.total_floors && (
                        <span className="badge bg-light text-dark border">Floor {property.floor_number}/{property.total_floors}</span>
                      )}
                    </div>

                    {(property.owner_name || property.owner_contact) && (
                      <div className="owner-box small mb-3">
                        <div className="owner-label">{t('details.listedBy')}</div>
                        <div className="owner-name">{property.owner_name || property.builder_name}</div>
                        
                        {/* WhatsApp Button */}
                        {property.owner_contact && (
                          <div className="mt-2">
                            <WhatsAppButton
                              phone={property.owner_contact}
                              property={property}
                              variant="small"
                              className="w-100 mb-2"
                            />
                          </div>
                        )}
                        
                        {/* Click to Reveal Phone Number */}
                        {property.owner_contact && (
                          <div className="mt-2">
                            {!showPhoneNumber ? (
                              <button
                                type="button"
                                className="btn btn-outline-secondary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                                onClick={handlePhoneReveal}
                              >
                                <i className="fas fa-eye"></i>
                                <span>{t('details.showPhoneNumber')}</span>
                              </button>
                            ) : (
                              <a
                                href={`tel:${property.owner_contact}`}
                                className="btn btn-outline-main btn-sm w-100 d-flex align-items-center justify-content-center gap-2 fade-in"
                              >
                                <i className="fas fa-phone"></i>
                                <span>{property.owner_contact}</span>
                              </a>
                            )}
                          </div>
                        )}
                        
                        {/* Request Callback Button */}
                        <div className="mt-2">
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-2"
                            onClick={() => setShowCallbackModal(true)}
                          >
                            <i className="fas fa-phone-volume"></i>
                            <span>{t('details.requestCallback')}</span>
                          </button>
                        </div>
                      </div>
                    )}

                    <form className={`visit-form ${shakeForm ? 'shake' : ''}`} onSubmit={onSchedule} id="schedule-visit-form">
                      <label htmlFor="visit-date-time" className="form-label small mb-1 fw-semibold">
                        <i className="far fa-calendar-alt me-1"></i> {t('details.scheduleVisit')}
                      </label>
                      
                      {visitSuccess && (
                        <div className="alert alert-success alert-dismissible fade show py-2 px-3 mb-2" role="alert">
                          <i className="fas fa-check-circle me-1"></i>
                          {t('details.visitScheduled')}
                        </div>
                      )}
                      
                      <div className="d-flex flex-column gap-2">
                        <div className="d-flex gap-2">
                          <div className="flex-fill">
                            <label htmlFor="visit-date" className="visually-hidden">Visit date</label>
                            <input
                              id="visit-date"
                              name="visitDate"
                              type="date"
                              // UX FIX (audit 2.7): prevent past dates; IST implied.
                              min={new Date().toISOString().split('T')[0]}
                              className={`form-control ${visitErrors.visitDate ? 'is-invalid' : ''}`}
                              value={visitDatePart}
                              onChange={(e) => {
                                setVisitDatePart(e.target.value);
                                if (visitErrors.visitDate) {
                                  setVisitErrors(prev => ({ ...prev, visitDate: '' }));
                                }
                              }}
                              autoComplete="off"
                            />
                          </div>
                          <div className="flex-fill">
                            <label htmlFor="visit-time" className="visually-hidden">Visit time</label>
                            <input
                              id="visit-time"
                              name="visitTime"
                              type="time"
                              className={`form-control ${visitErrors.visitDate ? 'is-invalid' : ''}`}
                              value={visitTimePart}
                              onChange={(e) => {
                                setVisitTimePart(e.target.value);
                                if (visitErrors.visitDate) {
                                  setVisitErrors(prev => ({ ...prev, visitDate: '' }));
                                }
                              }}
                              autoComplete="off"
                            />
                          </div>
                        </div>
                        {visitErrors.visitDate && (
                          <div className="invalid-feedback d-block">
                            <i className="fas fa-exclamation-circle me-1"></i>
                            {visitErrors.visitDate}
                          </div>
                        )}
                        
                        <label htmlFor="visit-notes" className="visually-hidden">Special requirements</label>
                        <textarea
                          id="visit-notes"
                          name="visitNotes"
                          className="form-control"
                          placeholder={t('details.specialRequirements')}
                          value={visitNotes}
                          onChange={(e) => setVisitNotes(e.target.value)}
                          autoComplete="off"
                          rows="2"
                        />
                        
                        <button 
                          type="submit" 
                          className="btn btn-teal w-100 fw-semibold" 
                          disabled={visitLoading}
                        >
                          {visitLoading ? (
                            <>
                              <i className="fas fa-spinner fa-spin me-2"></i>
                              {t('details.scheduling')}
                            </>
                          ) : (
                            <>
                              <i className="far fa-calendar-check me-2"></i>
                              {t('details.scheduleVisit')}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <CommonSidebar renderSearch={false} renderProperties={true} renderTags={false} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Callback Request Modal */}
      {showCallbackModal && (
        <div
          className="modal show d-block callback-modal"
          tabIndex="-1"
          role="dialog"
          aria-modal="true"
          aria-labelledby="callback-modal-title"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowCallbackModal(false);
            }
          }}
          onKeyDown={(e) => {
            // UX FIX (audit 2.8): close on Escape for keyboard accessibility.
            if (e.key === 'Escape') setShowCallbackModal(false);
          }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="callback-modal-title">
                  <i className="fas fa-phone-volume me-2"></i>
                  {t('details.requestCallbackTitle')}
                </h5>
                <button
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowCallbackModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                {callbackSuccess ? (
                  <div className="text-center py-4">
                    <div className="mb-3">
                      <i className="fas fa-check-circle text-success fa-3x"></i>
                    </div>
                    <h5 className="text-success">{t('details.callbackRequested')}</h5>
                    <p className="text-muted mb-0">{t('details.callbackMessage')}</p>
                  </div>
                ) : (
                  <form onSubmit={handleCallbackSubmit}>
                    <div className="mb-3">
                      <label htmlFor="callback-phone" className="form-label">
                        {t('details.yourPhoneNumber')} <span className="text-danger">*</span>
                      </label>
                      <input
                        type="tel"
                        className={`form-control ${callbackErrors.phone ? 'is-invalid' : ''}`}
                        id="callback-phone"
                        placeholder={t('details.phoneNumberPlaceholder')}
                        value={callbackForm.phone}
                        onChange={(e) => {
                          setCallbackForm(prev => ({ ...prev, phone: e.target.value }));
                          if (callbackErrors.phone) {
                            setCallbackErrors(prev => ({ ...prev, phone: '' }));
                          }
                        }}
                      />
                      {callbackErrors.phone && (
                        <div className="invalid-feedback">
                          {callbackErrors.phone}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="callback-time" className="form-label">
                        {t('details.preferredTime')} <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${callbackErrors.preferredTime ? 'is-invalid' : ''}`}
                        id="callback-time"
                        value={callbackForm.preferredTime}
                        onChange={(e) => {
                          setCallbackForm(prev => ({ ...prev, preferredTime: e.target.value }));
                          if (callbackErrors.preferredTime) {
                            setCallbackErrors(prev => ({ ...prev, preferredTime: '' }));
                          }
                        }}
                      >
                        <option value="">{t('details.selectTimeSlot')}</option>
                        <option value="morning">{t('details.morning')}</option>
                        <option value="afternoon">{t('details.afternoon')}</option>
                        <option value="evening">{t('details.evening')}</option>
                      </select>
                      {callbackErrors.preferredTime && (
                        <div className="invalid-feedback">
                          {callbackErrors.preferredTime}
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-3">
                      <label htmlFor="callback-notes" className="form-label">
                        {t('details.additionalNotes')}
                      </label>
                      <textarea
                        className="form-control"
                        id="callback-notes"
                        rows="3"
                        placeholder={t('details.notesPlaceholder')}
                        value={callbackForm.notes}
                        onChange={(e) => setCallbackForm(prev => ({ ...prev, notes: e.target.value }))}
                      />
                    </div>
                    
                    <button 
                      type="submit" 
                      className="btn btn-teal w-100"
                      disabled={callbackLoading}
                    >
                      {callbackLoading ? (
                        <>
                          <i className="fas fa-spinner fa-spin me-2"></i>
                          {t('details.sendingRequest')}
                        </>
                      ) : (
                        <>
                          <i className="fas fa-paper-plane me-2"></i>
                          {t('details.requestCallback')}
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT FIX (UX 2.11): removed the duplicate mobile owner box above
          (owner name/phone + Call) since the sticky bottom bar already
          exposes Call/Callback/WhatsApp actions. Keeping both caused visual
          redundancy on mobile. */}
      {property?.owner_contact && (
        <div className="mobile-sticky-actions d-lg-none">
          <a href={`tel:${property.owner_contact}`} className="btn btn-outline-main btn-sm flex-fill">
            <i className="fas fa-phone me-1" aria-hidden="true"></i> {t('details.call')}
          </a>
          {/* AUDIT FIX (improvement 2.8): add WhatsApp to the mobile sticky bar
              so mobile users can reach the owner via WhatsApp just like desktop. */}
          <WhatsAppButton
            phone={property.owner_contact}
            property={property}
            variant="small"
            className="btn-sm flex-fill"
          >
            <i className="fab fa-whatsapp me-1" aria-hidden="true"></i> WhatsApp
          </WhatsAppButton>
          <button type="button" className="btn btn-main btn-sm flex-fill" onClick={() => setShowCallbackModal(true)}>
            <i className="fas fa-phone-volume me-1" aria-hidden="true"></i> {t('details.callback')}
          </button>
        </div>
      )}
    </>
  );
};

PropertyDetailsSection.propTypes = {
  property: PropTypes.object
};

export default PropertyDetailsSection;
