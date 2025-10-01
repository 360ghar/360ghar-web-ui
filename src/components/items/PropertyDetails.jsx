import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePropertyStore, useAuthStore } from '../../store';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();
  const {
    currentProperty,
    propertyMedia,
    isLoading,
    error,
    getPropertyById,
    deleteProperty,
  } = usePropertyStore();
  const [activeImage, setActiveImage] = useState(null);

  useEffect(() => {
    const fetchPropertyDetails = async () => {
      await getPropertyById(id);
    };
    
    fetchPropertyDetails();
    
    // Cleanup
    return () => {
      // Clear current property when component unmounts
    };
  }, [getPropertyById, id]);

  useEffect(() => {
    // Set first image as active when media loads
    if (propertyMedia && propertyMedia.length > 0) {
      setActiveImage(propertyMedia[0]);
    }
  }, [propertyMedia]);

  if (isLoading) {
    return <div className="text-center py-5">Loading property details...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (!currentProperty) {
    return <div className="text-center py-5">Property not found.</div>;
  }

  const isOwner = isAuthenticated && user?.id === currentProperty.owner_id;

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      const success = await deleteProperty(id);
      if (success) {
        navigate('/my-properties');
      }
    }
  };

  return (
    <div className="property-details">
      <div className="property-header mb-4">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <h2 className="property-title">{currentProperty.title}</h2>
            <p className="location">
              <i className="fas fa-map-marker-alt"></i> {currentProperty.address}, {currentProperty.city}, {currentProperty.state} {currentProperty.zip_code}
            </p>
          </div>
          <div className="property-price">
            <h3>${currentProperty.price.toLocaleString()}</h3>
            <span className={`badge ${currentProperty.status === 'FOR_SALE' ? 'bg-primary' : 'bg-warning'}`}>
              {currentProperty.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="property-gallery mb-4">
            <div className="property-main-image">
              {activeImage ? (
                <img
                  src={activeImage.url}
                  alt={activeImage.title || currentProperty.title}
                  className="img-fluid rounded"
                />
              ) : (
                <div className="no-image rounded">No images available</div>
              )}
            </div>

            {propertyMedia && propertyMedia.length > 0 && (
              <div className="property-thumbnails d-flex mt-3 gap-2">
                {propertyMedia.map((media) => (
                  <div
                    key={media.id}
                    className={`thumbnail-item ${
                      activeImage?.id === media.id ? 'active' : ''
                    }`}
                    onClick={() => setActiveImage(media)}
                  >
                    <img
                      src={media.url}
                      alt={media.title || currentProperty.title}
                      className="img-fluid rounded"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="property-description mb-4">
            <h4>Description</h4>
            <p>{currentProperty.description}</p>
          </div>

          <div className="property-features mb-4">
            <h4>Features</h4>
            <div className="row">
              <div className="col-md-4">
                <ul className="list-unstyled">
                  <li>
                    <i className="fas fa-bed"></i> {currentProperty.bedrooms} Bedrooms
                  </li>
                  <li>
                    <i className="fas fa-bath"></i> {currentProperty.bathrooms} Bathrooms
                  </li>
                  <li>
                    <i className="fas fa-ruler-combined"></i> {currentProperty.area} sqft
                  </li>
                </ul>
              </div>
              <div className="col-md-4">
                <ul className="list-unstyled">
                  <li>
                    <i className="fas fa-home"></i> {currentProperty.property_type.replace('_', ' ')}
                  </li>
                  <li>
                    <i className="fas fa-calendar"></i> Built in {currentProperty.year_built || 'N/A'}
                  </li>
                </ul>
              </div>
            </div>

            {currentProperty.features && currentProperty.features.length > 0 && (
              <div className="additional-features mt-3">
                <h5>Additional Features</h5>
                <ul className="list-unstyled row">
                  {currentProperty.features.map((feature, index) => (
                    <li key={index} className="col-md-4">
                      <i className="fas fa-check"></i> {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="property-sidebar">
            {isOwner && (
              <div className="owner-actions mb-4">
                <h4>Property Management</h4>
                <div className="d-grid gap-2">
                  <a
                    href={`/edit-property/${currentProperty.id}`}
                    className="btn btn-primary"
                  >
                    Edit Property
                  </a>
                  <button
                    className="btn btn-danger"
                    onClick={handleDelete}
                  >
                    Delete Property
                  </button>
                </div>
              </div>
            )}

            <div className="contact-form-wrapper mb-4">
              <h4>Contact Agent</h4>
              <form>
                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Your Name"
                    required
                  />
                </div>
                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Your Email"
                    required
                  />
                </div>
                
                <div className="mb-3">
                  <textarea
                    className="form-control"
                    rows="4"
                    placeholder="Your Message"
                    defaultValue={`I'm interested in ${currentProperty.title}`}
                    required
                  ></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Send Message
                </button>
              </form>
            </div>

            <div className="location-map">
              <h4>Location</h4>
              <div className="map-placeholder rounded">
                {/* Map would be integrated here */}
                <div className="text-center p-5">
                  <i className="fas fa-map-marker-alt fa-3x mb-3"></i>
                  <p>{currentProperty.address}, {currentProperty.city}</p>
                  <p>{currentProperty.state} {currentProperty.zip_code}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails; 