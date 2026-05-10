import { useTranslation } from 'react-i18next';

import ListingBasicInformation from '../../common/listing/ListingBasicInformation';
import ListingPropertyGallery from '../../common/listing/ListingPropertyGallery';
import ListingPropertyInformation from '../property/ListingPropertyInformation';
import ListingContactDetails from '../../common/listing/ListingContactDetails';

const AddListingForm = () => {
    const { t } = useTranslation('account');

    return (
        <>
            <form action="#">
                <ListingBasicInformation/>
                <ListingPropertyGallery/>
                <ListingPropertyInformation/>
                <ListingContactDetails/>
                <button type="submit" className="btn btn-main w-100">{t('addListing.submitProperty')}</button>
            </form>
        </>
    );
};

export default AddListingForm;
