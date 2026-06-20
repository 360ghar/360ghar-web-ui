import SectionHeading from '../../common/ui/SectionHeading';
import { propertyTypes } from '../../data/HomeOneData';
import PropertyTypeItem from './PropertyTypeItem';

const PropertyType = () => {
    return (
        <>
            {/* ======================= Property Section Start ================================== */}
            <section className="property-type padding-y-120">
                <div className="container container-two">

                    <SectionHeading
                        headingClass=""
                        subtitle="Why Choose 360Ghar"
                        subtitleClass="bg-gray-100"
                        title="Real value for your investment—not just brokerage"
                        renderDesc={false}
                        desc=""
                        renderButton={false}
                        buttonClass="btn-main"
                        buttonText="View More"
                    />

                    <div className="row gy-4">
                        
                        {
                            propertyTypes.map((propertyType, propertyTypeIndex) => {
                                return (
                                    <div className="col-lg-4 col-sm-6 col-6" key={propertyTypeIndex}>
                                        <PropertyTypeItem propertyType={propertyType}/>
                                    </div>
                                )
                            })
                        }
                        
                    </div>
                </div>
            </section>
            {/* ======================= Property Section End ================================== */}   
        </>
    );
};

export default PropertyType;