import { useState }  from 'react';
import PropertyFilters from '../../components/property-filters/PropertyFilters';
import AdvancedPropertyFilter from '../../components/property-filters/AdvancedPropertyFilter';

const Filter = (props) => {
    const [useAdvancedFilter, setUseAdvancedFilter] = useState(false);

    return (
        <div className="filter-container">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">Property Search</h5>
                <button
                    type="button"
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => setUseAdvancedFilter(!useAdvancedFilter)}
                >
                    {useAdvancedFilter ? 'Modern Filters' : 'Legacy Filters'}
                    <i className={`fas fa-chevron-${useAdvancedFilter ? 'up' : 'down'} ms-2`}></i>
                </button>
            </div>

            {useAdvancedFilter ? (
                <AdvancedPropertyFilter
                    colClass={props.colClass}
                    buttonText={props.buttonText}
                />
            ) : (
                <PropertyFilters showAdvanced={true} />
            )}
        </div>
    );
};


export default Filter;


