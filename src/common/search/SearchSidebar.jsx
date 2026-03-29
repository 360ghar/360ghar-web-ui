import { bedBaths, priceRanges, searchAmenities } from '../../data/OthersPageData';
import CustomRangeSlider from '../forms/CustomRangeSlider';
import { usePropertyStore } from '../../store/propertyStore';
import {
    COMMERCIAL_PROPERTY_TYPES,
    PROPERTY_TYPE_FILTER_OPTIONS,
    PURPOSE_OPTIONS,
    isCommercialSelection,
} from '../../utils/propertyTaxonomy';

const SearchSidebar = () => {
    const { filters, updateFilter, applyFilters } = usePropertyStore();
    
    const handleFilterChange = async (key, value) => {
        updateFilter(key, value);
        // Auto-apply filters for sidebar (different UX from main filters)
        await applyFilters();
    };
    
    const handlePropertyTypeChange = (value, checked) => {
        const currentTypes = [...(filters.property_type || [])];
        if (value === 'commercial') {
            const nextTypes = checked
                ? [...new Set([...currentTypes, ...COMMERCIAL_PROPERTY_TYPES])]
                : currentTypes.filter((type) => !COMMERCIAL_PROPERTY_TYPES.includes(type));
            handleFilterChange('property_type', nextTypes);
            return;
        }
        if (checked) {
            if (!currentTypes.includes(value)) {
                handleFilterChange('property_type', [...currentTypes, value]);
            }
        } else {
            handleFilterChange('property_type', currentTypes.filter(t => t !== value));
        }
    };

    const propertyTypes = PROPERTY_TYPE_FILTER_OPTIONS;
    const purposes = PURPOSE_OPTIONS.filter((option) => option.value);
    
    return (
        <>
        {/* ============================== Search Sidebar Start ========================    */}
        <div className="search-sidebar">
            <form action="#" method="post" autoComplete="off">
                
                <div className="search-sidebar__item">
                    <h6 className="search-sidebar__title mb-4">Property Type</h6>
                    {
                        propertyTypes.map((propertyType, propertyTypeIndex) => {
                            return (
                                <div className="common-check" key={propertyTypeIndex}>
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id={propertyType.value} 
                                        value={propertyType.value}
                                        checked={
                                            propertyType.value === 'commercial'
                                                ? isCommercialSelection(filters.property_type || [])
                                                : filters.property_type?.includes(propertyType.value) || false
                                        }
                                        onChange={(e) => handlePropertyTypeChange(propertyType.value, e.target.checked)}
                                    />
                                    <label className="form-check-label" htmlFor={propertyType.value}>
                                        {propertyType.label}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>
                
                <div className="search-sidebar__item">
                    <h6 className="search-sidebar__title mb-4">Status</h6>
                    {
                        purposes.map((reason, reasonIndex) => {
                            return (
                                <div className="common-radio" key={reasonIndex}>
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="room" 
                                        id={reason.value} 
                                        value={reason.value}
                                        checked={filters.purpose === reason.value}
                                        onChange={(e) => handleFilterChange('purpose', e.target.value)}
                                    />
                                    <label className="form-check-label" htmlFor={reason.value}>
                                        {reason.label}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>
                
                <div className="search-sidebar__item">
                    <h6 className="search-sidebar__title mb-4">Price Range</h6>
                    {
                        priceRanges.map((priceRange, priceRangeIndex) => {
                            return (
                                <div className="common-check" key={priceRangeIndex}>
                                    <input 
                                        className="form-check-input" 
                                        type="checkbox" 
                                        id={priceRange.text} 
                                        value={priceRange.value}
                                        onChange={(e) => {
                                            // Handle price range selection
                                            if (e.target.checked) {
                                                // Parse price range and set min/max
                                                const range = priceRange.value.split('-');
                                                if (range.length === 2) {
                                                    handleFilterChange('price_min', parseInt(range[0]));
                                                    handleFilterChange('price_max', parseInt(range[1]));
                                                }
                                            }
                                        }}
                                    />
                                    <label className="form-check-label" htmlFor={priceRange.text}>
                                        {priceRange.text}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>
                <div className="search-sidebar__item">
                    <h6 className="search-sidebar__title mb-4">Amenities</h6>
                    {
                        searchAmenities.map((searchAmenity, searchAmenityIndex) => {
                            return (
                                <div className="common-check" key={searchAmenityIndex}>
                                    <input className="form-check-input" type="checkbox" id={searchAmenity.text}/>
                                    <label className="form-check-label" htmlFor={searchAmenity.text}>
                                        {searchAmenity.text}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>

                <div className="search-sidebar__item position-relative">
                    <h6 className="search-sidebar__title mb-4">Filter By Price</h6>
                    <label className="custom--range__text mb-2 text-text-capitalize">Your range:</label>

                    <CustomRangeSlider
                        min={0}
                        max={10000000}
                        value={{ min: filters.price_min || 0, max: filters.price_max || 10000000 }}
                        onChange={({ min, max }) => {
                            handleFilterChange('price_min', min);
                            handleFilterChange('price_max', max);
                        }}
                    />

                </div>

                <div className="search-sidebar__item">
                    <h6 className="search-sidebar__title mb-4">Bed/Bath</h6>
                    {
                        bedBaths.map((bedBath, bedBathIndex) => {
                            return (
                                <div className="common-radio" key={bedBathIndex}>
                                    <input className="form-check-input" type="radio" name="room" id={bedBath.text}/>
                                    <label className="form-check-label" htmlFor={bedBath.text}>
                                        {bedBath.text}
                                    </label>
                                </div>
                            )
                        })
                    }
                </div>
            </form>
        </div>
        {/* ============================== Search Sidebar End ========================    */}
        </>
    );
};

export default SearchSidebar;
