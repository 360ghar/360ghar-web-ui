
const ListingBasicInformation = () => {
    return (
        <>
            <div className="card-item" id="basicInformation">
                <div className="card common-card">
                    <div className="card-header">
                        <h6 className="title mb-0">Property Basic Information</h6>
                    </div>
                    <div className="card-body">
                        <div className="row gy-4">
                            <div className="col-sm-12">
                                <label htmlFor="propertyTitle" className="form-label">Property Title</label>
                                <input type="text" className="common-input" id="propertyTitle" placeholder="Property Title"/>
                            </div>
                            <div className="col-12">
                                <label htmlFor="Description" className="form-label">Description</label>
                                <textarea className="common-input" id="Description" placeholder="Your Message"></textarea>
                            </div>
                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="Status" className="form-label">Status</label>
                                <div className="select-has-icon icon-black">
                                    <select className="select common-input" id="Status">
                                        <option value="1" disabled="">Status</option>
                                        <option value="1">For Rent</option>
                                        <option value="1">For Sell</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="Type" className="form-label">Status</label>
                                <div className="select-has-icon icon-black">
                                    <select className="select common-input" id="Type">
                                        <option value="1" disabled=""> Type</option>
                                        <option value="1">Apartment</option>
                                        <option value="1">House</option>
                                        <option value="1">Land</option>
                                        <option value="1">Single Family</option>
                                    </select>
                                </div>
                            </div>
                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="Price" className="form-label">Price</label>
                                <input type="number" className="common-input" id="Price" placeholder="USD"/>
                            </div>
                            <div className="col-sm-6 col-xs-6">
                                <label htmlFor="Area" className="form-label">Area</label>
                                <input type="number" className="common-input" id="Area" placeholder="Sq Ft"/>
                            </div>
                            <div className="col-sm-12">
                                <label htmlFor="Rooms" className="form-label">Rooms</label>
                                <div className="select-has-icon icon-black">
                                    <select className="select common-input" id="Rooms">
                                        <option value="1" disabled=""> Rooms</option>
                                        <option value="1">Apartment</option>
                                        <option value="1">House</option>
                                        <option value="1">Land</option>
                                        <option value="1">Single Family</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>   
        </>
    );
};

export default ListingBasicInformation;