import React, { useMemo, useRef, useState } from 'react';
import CommonSidebar from '../../common/CommonSidebar';
import usePropertyStore from '../../store/propertyStore';
import { useVisitStore } from '../../store';
import { useAuthStore } from '../../store';

import LazyImage from '../../common/LazyImage';
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

const PropertyDetailsSection = ({ property }) => {
  if (!property) return null;

  const images = Array.isArray(property.images) ? property.images : [];
  const galleryImages = useMemo(() => images.filter((i) => i?.image_url && !/kuula\.co/i.test(i.image_url)), [images]);
  const mainImage = property.main_image_url || galleryImages.find((i) => i.is_main_image)?.image_url || galleryImages[0]?.image_url || images.find((i)=>i.is_main_image)?.image_url || images[0]?.image_url;
  const title = property.title || 'Property Details';
  const description = property.description || '';
  const purpose = property.purpose || property.price_type;
  const priceValue = purpose === 'rent' ? (property.monthly_rent || property.daily_rate || property.base_price) : property.base_price;
  const price = formatCurrency(priceValue);
  const day = purpose === 'rent' ? (property.daily_rate ? '/per day' : '/per month') : '';
  const address = property.full_address || [property.locality, property.city, property.state].filter(Boolean).join(', ');
  const virtualTourUrl = property.virtual_tour_url;
  const mediaDefault = virtualTourUrl ? 'tour' : 'photos';
  const [mediaTab, setMediaTab] = useState(mediaDefault);
  const tourRef = useRef(null);

  const previewStats = [
    { icon: <i className="fas fa-bed"></i>, label: 'Bedrooms', value: property.bedrooms },
    { icon: <i className="fas fa-bath"></i>, label: 'Bathrooms', value: property.bathrooms },
    { icon: <i className="fas fa-ruler-combined"></i>, label: 'Area', value: property.area_sqft ? `${property.area_sqft} sqft` : null },
    { icon: <i className="fas fa-building"></i>, label: 'Floor', value: property.floor_number },
    { icon: <i className="fas fa-parking"></i>, label: 'Parking', value: property.parking_spaces },
  ].filter((x) => x.value !== null && x.value !== undefined && x.value !== '');

  const features = Array.isArray(property.features) ? property.features : [];

  const keyDetails = useMemo(() => ([
    { label: 'Property Type', value: property.property_type },
    { label: 'Purpose', value: property.purpose || property.price_type },
    { label: 'Status', value: property.status },
    { label: 'Available', value: property.is_available === true ? 'Yes' : (property.is_available === false ? 'No' : null) },
    { label: 'Available From', value: formatDate(property.available_from) },
    { label: 'Builder', value: property.builder_name },
    { label: 'Owner', value: property.owner_name },
    { label: 'Owner Contact', value: property.owner_contact },
    { label: 'Listing ID', value: property.id },
  ].filter(i => i.value !== null && i.value !== undefined && i.value !== '')), [property]);

  const pricingDetails = useMemo(() => ([
    { label: purpose === 'rent' ? 'Monthly Rent' : 'Base Price', value: formatCurrency(priceValue) },
    property.daily_rate ? { label: 'Daily Rate', value: formatCurrency(property.daily_rate) } : null,
    property.security_deposit ? { label: 'Security Deposit', value: formatCurrency(property.security_deposit) } : null,
    property.maintenance_charges ? { label: 'Maintenance', value: formatCurrency(property.maintenance_charges) } : null,
    property.price_per_sqft ? { label: 'Price / Sqft', value: `₹${formatNumber(property.price_per_sqft)}` } : null,
    property.minimum_stay_days ? { label: 'Minimum Stay (days)', value: property.minimum_stay_days } : null,
    property.max_occupancy ? { label: 'Max Occupancy', value: property.max_occupancy } : null,
  ].filter(Boolean)), [property, priceValue, purpose]);

  const buildingDetails = useMemo(() => ([
    property.area_type ? { label: 'Area Type', value: property.area_type } : null,
    property.area_sqft ? { label: 'Area (sqft)', value: formatNumber(property.area_sqft) } : null,
    property.balconies ? { label: 'Balconies', value: property.balconies } : null,
    property.total_floors ? { label: 'Total Floors', value: property.total_floors } : null,
    property.age_of_property ? { label: 'Age of Property (yrs)', value: property.age_of_property } : null,
  ].filter(Boolean)), [property]);

  const addressDetails = useMemo(() => ([
    { label: 'Full Address', value: address },
    property.landmark ? { label: 'Landmark', value: property.landmark } : null,
    property.sub_locality ? { label: 'Sub Locality', value: property.sub_locality } : null,
    property.locality ? { label: 'Locality', value: property.locality } : null,
    property.city ? { label: 'City', value: property.city } : null,
    property.state ? { label: 'State', value: property.state } : null,
    property.pincode ? { label: 'Pincode', value: property.pincode } : null,
    property.country ? { label: 'Country', value: property.country } : null,
  ].filter(Boolean)), [address, property]);

  const engagementDetails = useMemo(() => ([
    property.view_count != null ? { label: 'Views', value: formatNumber(property.view_count) } : null,
    property.like_count != null ? { label: 'Likes', value: formatNumber(property.like_count) } : null,
    property.interest_count != null ? { label: 'Interests', value: formatNumber(property.interest_count) } : null,
    property.created_at ? { label: 'Created', value: formatDate(property.created_at) } : null,
    property.updated_at ? { label: 'Updated', value: formatDate(property.updated_at) } : null,
  ].filter(Boolean)), [property]);

  const { recordSwipe } = usePropertyStore();
  const { scheduleVisit, isLoading: visitLoading } = useVisitStore();
  const { isAuthenticated } = useAuthStore();

  const [visitDate, setVisitDate] = useState('');
  const [visitNotes, setVisitNotes] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);

  const toggleLike = async () => {
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    setLikeLoading(true);
    try {
      await recordSwipe(property.id, !property.liked);
    } finally {
      setLikeLoading(false);
    }
  };

  const onSchedule = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }
    if (!visitDate) return;
    const isoDate = new Date(visitDate).toISOString();
    const res = await scheduleVisit({ property_id: property.id, scheduled_date: isoDate, special_requirements: visitNotes });
    if (res) {
      setVisitNotes('');
      setVisitDate('');
      if (typeof window !== 'undefined' && window.alert) window.alert('Visit scheduled successfully');
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
    } catch (_) {}
  };

  return (
    <>
      <section className="property-details compact padding-y-60">
        <div className="container container-two">
          <div className="row gy-4">
            <div className="col-lg-8">
              {/* Media switch (Tour / Photos) */}
              <div className="media-switch d-flex align-items-center justify-content-between mb-2">
                <div className="btn-group btn-group-sm" role="group" aria-label="Media switch">
                  <button type="button" className={`btn ${mediaTab === 'tour' ? 'btn-main' : 'btn-outline-main'}`} disabled={!virtualTourUrl} onClick={() => setMediaTab('tour')}>
                    360° Tour
                  </button>
                  <button type="button" className={`btn ${mediaTab === 'photos' ? 'btn-main' : 'btn-outline-main'}`} onClick={() => setMediaTab('photos')}>
                    Photos
                  </button>
                </div>
                {mediaTab === 'tour' && virtualTourUrl && (
                  <button type="button" className="btn btn-outline-dark btn-sm" onClick={enterFullscreenTour} title="Full Screen">
                    <i className="fas fa-expand"></i>
                  </button>
                )}
              </div>

              {mediaTab === 'tour' && virtualTourUrl ? (
                <div className="virtual-tour-container" ref={tourRef}>
                  <iframe
                    src={virtualTourUrl}
                    allow="accelerometer; magnetometer; gyroscope; xr-spatial-tracking; vr; fullscreen"
                    allowFullScreen
                    loading="lazy"
                    title="360° Virtual Tour"
                    style={{ width: '100%', height: '100%', border: 0 }}
                  />
                </div>
              ) : (
                <>
                  {mainImage && (
                    <div className="property-details__thumb media-hero">
                      <LazyImage src={mainImage} alt="Property" className="cover-img" priority />
                    </div>
                  )}
                  {galleryImages.length > 1 && (
                    <div className="mt-2">
                      <div className="row g-2">
                        {galleryImages.slice(0, 8).map((img, idx) => (
                          <div className="col-3 col-md-2" key={idx}>
                            <LazyImage src={img.image_url} alt={img.caption || `Image ${idx + 1}`} className="img-fluid rounded" loading="lazy" decoding="async" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}

              <h3 className="property-details__title mt-3 mb-1">{title}</h3>
              <h5 className="property-details__price mb-2">
                {price} <span className="day">{day}</span>
              </h5>
              {/* Description */}
              {description && <p className="property-details__desc mb-3">{description}</p>}

              <div className="property-details-wrapper">
                <div className="property-details-item">
                  <h6 className="property-details-item__title">Overview</h6>
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
                    <h6 className="property-details-item__title">Key Details</h6>
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
                    <h6 className="property-details-item__title">Pricing & Costs</h6>
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
                    <h6 className="property-details-item__title">Building & Area</h6>
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
                    <h6 className="property-details-item__title">Features</h6>
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
                  <h6 className="property-details-item__title">Address</h6>
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
                    {property.latitude && property.longitude && (
                      <div className="address-map mt-3">
                        <iframe
                          src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Property Location"
                          style={{ width: '100%', minHeight: 320, border: 0 }}
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Virtual tour section has been moved to top media area */}

                {engagementDetails.length > 0 && (
                  <div className="property-details-item">
                    <h6 className="property-details-item__title">Engagement</h6>
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
              </div>
            </div>
            <div className="col-lg-4">
              <div className="summary-card position-sticky" style={{ top: 88 }}>
                <div className="card compact-card">
                  <div className="card-body">
                    <div className="d-flex align-items-start justify-content-between mb-2">
                      <div>
                        <div className="text-muted small">Price</div>
                        <div className="h5 mb-0">{price} <span className="text-muted small">{day}</span></div>
                      </div>
                      <button
                        type="button"
                        className={`btn btn-sm ${property.liked ? 'btn-danger' : 'btn-outline-danger'}`}
                        onClick={toggleLike}
                        disabled={likeLoading}
                        title={property.liked ? 'Unlike' : 'Like'}
                      >
                        <i className="fas fa-heart"></i>
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
                        <div className="fw-semibold mb-1">Owner/Builder</div>
                        <div className="text-muted">{property.owner_name || property.builder_name}</div>
                        {property.owner_contact && (
                          <div className="mt-1">
                            <a href={`tel:${property.owner_contact}`} className="btn btn-sm btn-outline-main">
                              <i className="fas fa-phone"></i> {property.owner_contact}
                            </a>
                          </div>
                        )}
                      </div>
                    )}

                    <form className="visit-form" onSubmit={onSchedule}>
                      <label className="form-label small mb-1">Schedule a Visit</label>
                      <div className="d-flex flex-column gap-2">
                        <input
                          type="datetime-local"
                          className="form-control form-control-sm"
                          value={visitDate}
                          onChange={(e) => setVisitDate(e.target.value)}
                          required
                        />
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="Special requirements (optional)"
                          value={visitNotes}
                          onChange={(e) => setVisitNotes(e.target.value)}
                        />
                        <button type="submit" className="btn btn-main btn-sm" disabled={visitLoading}>
                          {visitLoading ? 'Scheduling...' : 'Schedule Visit'}
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
    </>
  );
};

export default PropertyDetailsSection;
