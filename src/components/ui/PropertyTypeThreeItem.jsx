import { Link } from 'react-router-dom';

import LazyImage from '../../common/ui/LazyImage';
const PropertyTypeThreeItem = ({ propertyTypeItem }) => {

    const {icon, title, desc, btnLink, btnText} = propertyTypeItem;  
    
    return (
        <>
            <div className="property-type-three-item d-flex align-items-start">
                <span className="property-type-three-item__icon flex-shrink-0">
                    <LazyImage src={icon} alt=""/>
                </span>
                <div className="property-type-three-item__content">
                    <h6 className="property-type-three-item__title">{title}</h6>
                    <p className="property-type-three-item__desc font-18">{desc}</p>
                    <Link to={btnLink} className="simple-btn text-heading fw-semibold">
                        {btnText} 
                        <span className="icon-right"> <i className="fas fa-arrow-right"></i> </span>
                    </Link>
                </div>
            </div>   
        </>
    );
};

export default PropertyTypeThreeItem;