import SectionHeading from '../../common/ui/SectionHeading';
import { propertyThreeTypes } from '../../data/HomeThreeData';
import PropertyTypeThreeItem from './PropertyTypeThreeItem';

const PropertyTypeThree = () => {
    return (
        <>
            <section className="property-type-three padding-t-120 padding-b-60">
                <div className="container container-two">

                    <SectionHeading
                        headingClass="style-left"  
                        subtitle="Property Type"
                        subtitleClass="bg-white" 
                        title="Investing in real estate made easy" 
                        renderDesc={false}
                        desc="Real estate is a lucrative industry that involves the buying selling and renting of properties. It encompasses residential commercial and industrial properties Real estate agents play a crucial role in facilitating real estate"
                        renderButton={false}
                        buttonClass="btn-main"
                        buttonText="View More"
                    />
                    
                    <div className="row gy-4">
                        {
                            propertyThreeTypes.map((propertyTypeItem, index) => {
                                return (
                                    <div className="col-xl-4 col-sm-6 col-6" key={index}>
                                        <PropertyTypeThreeItem propertyTypeItem={propertyTypeItem} />
                                    </div>
                                )
                            })
                        }
                    </div>
                </div>
            </section>   
        </>
    );
};

export default PropertyTypeThree;