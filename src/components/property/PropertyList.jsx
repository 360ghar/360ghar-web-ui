import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usePropertyStore } from '../../store';

import LazyImage from '../../common/LazyImage';
const PropertyList = ({ limit, filters = {} }) => {
  const { properties, isLoading, error, getAllProperties } = usePropertyStore();

  useEffect(() => {
    const fetchProperties = async () => {
      await getAllProperties({
        limit: limit || 12,
        ...filters
      });
    };

    fetchProperties();
  }, [getAllProperties, limit, filters]);
  
  if (isLoading) {
    return <div className="text-center py-5">Loading properties...</div>;
  }
  
  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }
  
  if (!properties || properties.length === 0) {
    return <div className="text-center py-5">No properties found.</div>;
  }
  
  return (
    <div className="row g-4">
      {properties.map((property) => (
        <div key={property.id} className="col-md-6 col-lg-4">
          <div className="property-item">
            <div className="property-img">
              {property.media && property.media.length > 0 ? (
                <LazyImage 
                  src={property.media[0].url} 
                  alt={property.title} 
                  className="img-fluid"
                />
              ) : (
                <div className="no-image">No image available</div>
              )}
              <div className="property-badge">
                <span className={`badge ${property.status === 'FOR_SALE' ? 'bg-primary' : 'bg-warning'}`}>
                  {property.status.replace('_', ' ')}
                </span>
              </div>
            </div>
            <div className="property-content">
              <h5>
                <Link to={`/property/${property.id}`}>{property.title}</Link>
              </h5>
              <p className="location">
                <i className="fas fa-map-marker-alt"></i> {property.city}, {property.state}
              </p>
              <div className="price">${property.price.toLocaleString()}</div>
              <div className="features">
                <span><i className="fas fa-bed"></i> {property.bedrooms} Beds</span>
                <span><i className="fas fa-bath"></i> {property.bathrooms} Baths</span>
                <span><i className="fas fa-ruler-combined"></i> {property.area} sqft</span>
              </div>
              <div className="property-footer">
                <Link to={`/property/${property.id}`} className="btn btn-sm btn-outline-primary">
                  View Details
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default PropertyList; 