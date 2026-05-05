
import LazyImage from '../../common/ui/LazyImage';
const PropertyTypeItem = ({ propertyType }) => {
    const { icon, title, desc } = propertyType;
    
    return (
        <>
            <div className="property-type-item">
                <span className="property-type-item__icon">
                    <LazyImage src={ icon } alt={`${title} icon`}/>
                </span>
                <h6 className="property-type-item__title"> { title }</h6>
                <p className="property-type-item__desc font-18">{ desc }</p>
            </div>
        </>
    );
};

export default PropertyTypeItem;