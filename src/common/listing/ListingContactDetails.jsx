
const ListingContactDetails = () => {
    return (
        <>
            <div className="card-item" id="propertyContactDetails">
                <div className="card common-card">
                    <div className="card-header">
                        <h6 className="title mb-0">Property Contact Details</h6>
                    </div>
                    <div className="card-body">
                        <div className="row gy-4">
                            <div className="col-md-4 col-sm-6 col-xs-6">
                                <label htmlFor="Name" className="form-label">Your Name</label>
                                <input type="text" id="Name" className="common-input" placeholder="Your Name"/>
                            </div>
                            <div className="col-md-4 col-sm-6 col-xs-6">
                                <label htmlFor="Email" className="form-label">Your E-mail</label>
                                <input type="email" id="Email" className="common-input" placeholder="Your E-Mail"/>
                            </div>
                            
                        </div>
                    </div>
                </div>
            </div>   
        </>
    );
};

export default ListingContactDetails;