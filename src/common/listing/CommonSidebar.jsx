import { useEffect, useState }  from 'react';
import { useNavigate } from 'react-router-dom';
import SidebarCategoryList from './SidebarCategoryList';
import SidebarRecentPost from './SidebarRecentPost';
import SidebarProperty from './SidebarProperty';
import { blogService } from '../../services/blogService';
import { I18nLink } from '../../i18n/I18nLink';

/**
 * CommonSidebar component for blog pages
 * @param {boolean} renderProperties - Show properties section
 * @param {boolean} renderSearch - Show search box
 * @param {boolean} renderTags - Show tags section
 * @param {function} onSearch - Optional callback when search is submitted
 * @param {string} searchValue - Optional initial search value
 */
const CommonSidebar = ({
    renderProperties,
    renderSearch,
    renderTags,
    onSearch,
    searchValue = ''
}) => {
    const navigate = useNavigate();
    const [tags, setTags] = useState([]);
    const [tagsLoading, setTagsLoading] = useState(false);
    const [tagsError, setTagsError] = useState(null);
    const [searchQuery, setSearchQuery] = useState(searchValue);

    // Sync searchQuery with prop
    useEffect(() => {
        setSearchQuery(searchValue);
    }, [searchValue]);

    // Fetch tags
    useEffect(() => {
        if (!renderTags) return;
        let mounted = true;
        const fetchTags = async () => {
            try {
                setTagsLoading(true);
                setTagsError(null);
                const data = await blogService.getTags();
                const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
                if (mounted) setTags(items);
            } catch (err) {
                if (mounted) setTagsError(err?.response?.data?.detail || err?.message || 'Failed to load tags');
            } finally {
                if (mounted) setTagsLoading(false);
            }
        };
        fetchTags();
        return () => { mounted = false; };
    }, [renderTags]);

    // Handle search submit
    const handleSearchSubmit = (e) => {
        e.preventDefault();
        const trimmedQuery = searchQuery.trim();

        if (onSearch) {
            // Use callback if provided
            onSearch(trimmedQuery);
        } else {
            // Default: navigate to blog with search query
            if (trimmedQuery) {
                navigate(`/blog?q=${encodeURIComponent(trimmedQuery)}`);
            } else {
                navigate('/blog');
            }
        }
    };

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle search clear
    const handleClearSearch = () => {
        setSearchQuery('');
        if (onSearch) {
            onSearch('');
        } else {
            navigate('/blog');
        }
    };

    return (
        <div className="common-sidebar-wrapper">
            {renderSearch && (
                <div className="common-sidebar p-0">
                    <form onSubmit={handleSearchSubmit} autoComplete="off">
                        <div className="search-box style-two w-100 position-relative">
                            <input
                                type="text"
                                className="common-input"
                                placeholder="Search blog posts..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                aria-label="Search blog posts"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    className="btn btn-sm position-absolute"
                                    style={{ right: '45px', top: '50%', transform: 'translateY(-50%)' }}
                                    onClick={handleClearSearch}
                                    aria-label="Clear search"
                                >
                                    <i className="fas fa-times text-muted"></i>
                                </button>
                            )}
                            <button type="submit" className="icon" aria-label="Search">
                                <i className="fas fa-search"></i>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="common-sidebar">
                <h6 className="common-sidebar__title">Category</h6>
                <SidebarCategoryList />
            </div>

            <div className="common-sidebar">
                <h6 className="common-sidebar__title">Recent Post</h6>
                <SidebarRecentPost />
            </div>

            {renderProperties && (
                <div className="common-sidebar">
                    <h6 className="common-sidebar__title">Properties</h6>
                    <SidebarProperty />
                </div>
            )}

            {renderTags && (
                <div className="common-sidebar">
                    <h6 className="common-sidebar__title">Tags</h6>
                    <ul className="tag-list">
                        {tagsLoading && (
                            <li className="tag-list__item">
                                <span className="text-muted">Loading tags...</span>
                            </li>
                        )}
                        {tagsError && !tagsLoading && (
                            <li className="tag-list__item text-danger">{tagsError}</li>
                        )}
                        {!tagsLoading && !tagsError && tags.length === 0 && (
                            <li className="tag-list__item">
                                <span className="text-muted">No tags available</span>
                            </li>
                        )}
                        {!tagsLoading && !tagsError && tags.map((tag, i) => (
                            <li className="tag-list__item" key={tag.id || i}>
                                <I18nLink
                                    to={`/blog?tag=${tag.slug || tag.id}`}
                                    className="tag-list__link"
                                >
                                    {tag.name || tag.title}
                                </I18nLink>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default CommonSidebar;
