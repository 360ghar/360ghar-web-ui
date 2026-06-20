import { useEffect }  from 'react';
import SectionHeading from '../../common/ui/SectionHeading';
import PropertyItem from './PropertyItem';
import Button from '../../common/ui/Button';
import { usePropertyStore } from '../../store/propertyStore';

const Property = ({ properties: propsProperties, loading: propsLoading }) => {
    const { 
        recommendations, 
        isLoading, 
        error, 
        fetchRecommendations 
    } = usePropertyStore();

    useEffect(() => {
        // Only fetch recommendations if not passed as props
        if (!propsProperties) {
            fetchRecommendations();
        }
    }, [fetchRecommendations, propsProperties]);

    // Use props if provided, otherwise use store data
    const displayProperties = propsProperties || recommendations;
    const displayLoading = propsLoading !== undefined ? propsLoading : isLoading;
    return (
        <>
            {/* ============================ property Start ==================== */}
            <section className="property padding-y-120">
                <div className="container container-two">

                    <SectionHeading 
                        headingClass="style-left style-dark flx-between align-items-end gap-3"  
                        subtitle="Latest property"
                        subtitleClass="" 
                        title="Prestige Property Management property for you" 
                        renderDesc={false}
                        desc=""
                        renderButton={true}
                        buttonLink="/properties"
                        buttonClass="btn-main"
                        buttonText="View More"
                    />

                    <div className="row gy-4 property-item-wrapper">
                        {displayLoading ? (
                            // Loading skeleton
                            Array.from({ length: 6 }).map((_, index) => (
                                <div className="col-lg-4 col-sm-6" key={index}>
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
                            <div className="col-12">
                                <div className="text-center py-4">
                                    <p className="text-danger">Error loading properties: {error}</p>
                                </div>
                            </div>
                        ) : displayProperties.length === 0 ? (
                            <div className="col-12">
                                <div className="text-center py-4">
                                    <p>No properties available at the moment.</p>
                                </div>
                            </div>
                        ) : (
                            displayProperties.slice(0, 6).map((property, index) => (
                                <div className="col-lg-4 col-sm-6" key={property.id || index}>
                                    <PropertyItem 
                                        itemClass=""
                                        btnClass=""
                                        property={property}
                                        badgeText={property.status || "For Sale"}
                                        badgeClass="property-item__badge"
                                        iconsClass=""
                                        btnRenderBottom={false}
                                        btnRenderRight={true}
                                    />
                                </div> 
                            ))
                        )}
                    </div>

                    <div className="text-center property__btn">
                        <Button 
                            btnLink="/properties" 
                            btnClass="btn-main" 
                            btnText="See All Listings" 
                            spanClass="icon-right" 
                            iconClass="fas fa-arrow-right" 
                        />
                    </div>
                </div>
            </section>
            {/* ============================ property End ==================== */}   
        </>
    );
};

export default Property;