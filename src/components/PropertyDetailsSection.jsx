import React, { useState } from 'react';
import CommonSidebar from '../common/CommonSidebar';
import usePropertyStore from '../store/propertyStore';
import { useVisitStore } from '../store';
import { useAuthStore } from '../store';

function formatCurrency(value) {
  if (value === null || value === undefined) return 'Price on request';
  try {
    return `₹${Number(value).toLocaleString('en-IN')}`;
  } catch {
    return `₹${value}`;
  }
}

const PropertyDetailsSection = ({ property }) => {
  if (!property) return null;

  const images = Array.isArray(property.images) ? property.images : [];
  const mainImage = property.main_image_url || images.find((i) => i.is_main_image)?.image_url || images[0]?.image_url;
  const title = property.title || 'Property Details';
  const description = property.description || '';
  const purpose = property.purpose || property.price_type;
  const priceValue = purpose === 'rent' ? (property.monthly_rent || property.daily_rate || property.base_price) : property.base_price;
  const price = formatCurrency(priceValue);
  const day = purpose === 'rent' ? (property.daily_rate ? '/per day' : '/per month') : '';
  const address = property.full_address || [property.locality, property.city, property.state].filter(Boolean).join(', ');

  const previewStats = [
    { icon: <i className="fas fa-bed"></i>, label: 'Bedrooms', value: property.bedrooms },
    { icon: <i className="fas fa-bath"></i>, label: 'Bathrooms', value: property.bathrooms },
    { icon: <i className="fas fa-ruler-combined"></i>, label: 'Area', value: property.area_sqft ? `${property.area_sqft} sqft` : null },
    { icon: <i className="fas fa-building"></i>, label: 'Floor', value: property.floor_number },
    { icon: <i className="fas fa-parking"></i>, label: 'Parking', value: property.parking_spaces },
  ].filter((x) => x.value !== null && x.value !== undefined && x.value !== '');

  const features = Array.isArray(property.features) ? property.features : [];

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

  return (
    <>
      <section className="property-details padding-y-120">
        <div className="container container-two">
          <div className="row gy-4">
            <div className="col-lg-8">
              {mainImage && (
                <div className="property-details__thumb">
                  <img src={mainImage} alt="Property" className="cover-img" loading="lazy" decoding="async" />
                </div>
              )}

              <h3 className="property-details__title mt-lg-5 mb-2">{title}</h3>
              <h5 className="property-details__price mb-2">
                {price} <span className="day">{day}</span>
              </h5>
              {/* Actions */}
              <div className="d-flex align-items-center gap-3 mb-4">
                <button
                  type="button"
                  className={`btn ${property.liked ? 'btn-danger' : 'btn-outline-danger'}`}
                  onClick={toggleLike}
                  disabled={likeLoading}
                  title={property.liked ? 'Unlike' : 'Like'}
                >
                  <i className={`fas fa-heart${property.liked ? '' : '-o'}`}></i>
                  <span className="ms-2">{property.liked ? 'Liked' : 'Like'}</span>
                </button>
                <form className="d-flex align-items-center gap-2" onSubmit={onSchedule}>
                  <input
                    type="datetime-local"
                    className="form-control"
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Special requirements (optional)"
                    value={visitNotes}
                    onChange={(e) => setVisitNotes(e.target.value)}
                  />
                  <button type="submit" className="btn btn-main" disabled={visitLoading}>
                    {visitLoading ? 'Scheduling...' : 'Schedule Visit'}
                  </button>
                </form>
              </div>
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
                    <div className="row gy-4">
                      <div className="col-12">
                        <div className="address-content d-flex gap-4 align-items-center">
                          <span className="address-content__text font-18">Full Address</span>
                          <h6 className="address-content__title font-15 mb-0">{address}</h6>
                        </div>
                      </div>
                    </div>
                    {property.latitude && property.longitude && (
                      <div className="address-map mt-3">
                        <iframe
                          src={`https://www.google.com/maps?q=${property.latitude},${property.longitude}&z=15&output=embed`}
                          allowFullScreen=""
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <CommonSidebar renderSearch={false} renderProperties={true} renderTags={false} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default PropertyDetailsSection;
