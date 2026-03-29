import { useEffect } from 'react';
import { usePropertyStore } from '../../store/propertyStore';
import PropertyItem from '../property/PropertyItem';

const AccountFavoritePropertyTab = () => {
  const { likedProperties, fetchLikedProperties, isLoading, error } = usePropertyStore();

  useEffect(() => {
    fetchLikedProperties();
  }, [fetchLikedProperties]);

  return (
    <>
      <div className="overflow-auto">
        <div className="card common-card">
          <div className="card-body">
            <h5 className="mb-3">Liked Properties</h5>
            <div className="row gy-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, idx) => (
                  <div className="col-lg-4 col-sm-6" key={idx}>
                    <div className="property-item loading">
                      <div className="property-item__thumb loading-placeholder"></div>
                      <div className="property-item__content">
                        <div className="loading-placeholder-text"></div>
                        <div className="loading-placeholder-text short"></div>
                      </div>
                    </div>
                  </div>
                ))
              ) : error ? (
                <div className="col-12"><div className="text-danger">{error}</div></div>
              ) : likedProperties.length === 0 ? (
                <div className="col-12"><div>No liked properties yet.</div></div>
              ) : (
                likedProperties.map((property) => (
                  <div className="col-lg-4 col-sm-6" key={property.id}>
                    <PropertyItem property={property} itemClass="style-two" btnRenderBottom={true} />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default AccountFavoritePropertyTab;