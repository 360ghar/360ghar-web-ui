import { addAmenities } from '../../data/OthersPageData';

const ListingPropertyInformation = () => {
    return (
        <>
            <div className="card-item" id="propertyInformation">
            <div className="card common-card">
                <div className="card-header">
                    <h6 className="title mb-0">Details Information</h6>
                </div>
                <div className="card-body">
                    <div className="row gy-4">
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="PropertyId" className="form-label">Property Id</label>
                            <input type="text" className="common-input" id="PropertyId" placeholder="Property Id"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="AreaSize" className="form-label">Area Size</label>
                            <input type="text" className="common-input" id="AreaSize" placeholder="Area Size"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="SizePrefix" className="form-label">Size Prefix</label>
                            <input type="text" className="common-input" id="SizePrefix" placeholder="Size Prefix"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="LandArea" className="form-label">Land Area</label>
                            <input type="text" className="common-input" id="LandArea" placeholder="Land Area"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="Bedrooms" className="form-label">Bedrooms</label>
                            <input type="text" className="common-input" id="Bedrooms" placeholder="Bedrooms"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="Bathrooms" className="form-label">Bathrooms</label>
                            <input type="text" className="common-input" id="Bathrooms" placeholder="Bathrooms"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="Garages" className="form-label">Garages</label>
                            <input type="text" className="common-input" id="Garages" placeholder="Garages"/>
                        </div>
                        <div className="col-xl-3 col-sm-6 col-6">
                            <label htmlFor="YearBuild" className="form-label">Year Build</label>
                            <input type="text" className="common-input" id="YearBuild" placeholder="Year Build"/>
                        </div>
                        <div className="col-12">
                            <h6 className="checkboxes__title mt-4 fw-500 font-18">Amenities</h6>
                            <div className="row gy-3 checkboxes">
                                {
                                    addAmenities.reduce((prevValue, currValue, ItemIndex) => {
                                        if (ItemIndex % 1 === 0) {
                                            prevValue.push([]);
                                        }
                                        prevValue[prevValue.length - 1].push(currValue);
                                        return prevValue;
                                    }, []).map((amenityGroup, groupIndex) => (
                                        <div className="col-md-4 col-sm-6 col-6" key={groupIndex}>
                                            {
                                                amenityGroup.map((amenity, amenityIndex) => (
                                                    <div className="common-check" key={amenityIndex}>
                                                        <input className="form-check-input" type="checkbox" value="" id={amenity.text}/>
                                                        <label className="form-check-label" htmlFor={amenity.text}> {amenity.text} </label>
                                                    </div>
                                                ))
                                            }
                                        </div>
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>   
        </>
    );
};

export default ListingPropertyInformation;