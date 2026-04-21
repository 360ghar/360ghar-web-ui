import { useSearchParams } from 'react-router-dom';
import { useI18nNavigate } from '../../i18n/I18nLink';
import ListGridButtons from '../../common/listing/ListGridButtons';
import { usePropertyStore } from '../../store/propertyStore';

const PropertyFilterBottom = ({
    total = 0,
    currentPage = 1,
    viewMode = 'grid',
    onViewModeChange
}) => {
    const navigate = useI18nNavigate();
    const { filters, updateFilter, applyFilters } = usePropertyStore();
    const [searchParams] = useSearchParams();

    const selectedSort = filters.sort_by || 'newest';
    const sortOptions = [
        { value: 'newest', label: 'Newest First' },
        { value: 'distance', label: 'Nearest First' },
        { value: 'price_low', label: 'Price: Low to High' },
        { value: 'price_high', label: 'Price: High to Low' },
        { value: 'popular', label: 'Most Popular' },
        { value: 'relevance', label: 'Relevance' }
    ];

    const handleSortChangeEnhanced = async (newSortValue) => {
        updateFilter('sort_by', newSortValue);
        updateFilter('page', 1);
        await applyFilters();

        const params = new URLSearchParams(searchParams);
        params.set('sort_by', newSortValue);
        params.set('page', '1');
        navigate(`?${params.toString()}`, { replace: true });
    };

    const showingStart = total > 0 ? ((currentPage - 1) * 12) + 1 : 0;
    const showingEnd = Math.min(currentPage * 12, total);

    return (
        <div className="property-filter__bottom flx-between gap-2">
            <div className="property-results-info d-flex align-items-center gap-3 flex-wrap">
                <span className="property-filter__text font-16 text-gray-800">
                    {total > 0 ?
                        `Showing ${showingStart}-${showingEnd} of ${total.toLocaleString()} properties` :
                        'No properties found'
                    }
                </span>
                {total > 0 && (
                    <div className="sort-options">
                        <label htmlFor="property-sort-select" className="visually-hidden">Sort properties</label>
                        <select
                            id="property-sort-select"
                            className="form-select form-select-sm"
                            value={selectedSort}
                            onChange={(e) => {
                                void handleSortChangeEnhanced(e.target.value);
                            }}
                        >
                            {sortOptions.map((option) => (
                                <option key={option.value} value={option.value}>{option.label}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>
            <div className="d-flex align-items-center gap-3">
                <ListGridButtons viewMode={viewMode} onViewModeChange={onViewModeChange} />
            </div>
        </div>
    );
};

export default PropertyFilterBottom;
