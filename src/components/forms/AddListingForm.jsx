
import ListingBasicInformation from '../../common/listing/ListingBasicInformation';
import ListingPropertyGallery from '../../common/listing/ListingPropertyGallery';
import ListingPropertyInformation from '../property/ListingPropertyInformation';
import ListingContactDetails from '../../common/listing/ListingContactDetails';

const AddListingForm = () => {
    return (
        <>
            <form action="#">
                <ListingBasicInformation/>
                <ListingPropertyGallery/>
                <ListingPropertyInformation/>
                <ListingContactDetails/>
                <button type="submit" className="btn btn-main w-100">Submit Property</button>
            </form>
        </>
    );
};

export default AddListingForm;