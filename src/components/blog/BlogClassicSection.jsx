import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import CommonSidebar from '../../common/listing/CommonSidebar';
import BlogClassicItem from './BlogClassicItem';
import { blogService } from '../../services/blogService';

const POSTS_PER_PAGE = 10;

const BlogClassicSection = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State — cursor-paginated: we accumulate posts across pages and fetch the
    // next page using the opaque `next_cursor` returned by the backend.
    const [posts, setPosts] = useState([]);
    const [nextCursor, setNextCursor] = useState(null);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState(null);

    // Get filters from URL (cursor is held in component state, not the URL)
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const searchQuery = searchParams.get('q') || '';

    // Fetch the first page (cursor=null) — replaces the list. Triggered when
    // any filter changes.
    const fetchFirstPage = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = { limit: POSTS_PER_PAGE };
            if (category) params.category = category;
            if (tag) params.tag = tag;
            if (searchQuery) params.q = searchQuery;

            const data = await blogService.getPosts(params);
            const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
            setPosts(items);
            setNextCursor(data?.next_cursor ?? null);
            setHasMore(Boolean(data?.has_more));
        } catch (err) {
            setError(err?.response?.data?.detail || err?.message || 'Failed to load posts');
            setPosts([]);
            setNextCursor(null);
            setHasMore(false);
        } finally {
            setLoading(false);
        }
    }, [category, tag, searchQuery]);

    useEffect(() => {
        fetchFirstPage();
    }, [fetchFirstPage]);

    // Fetch the next page using the opaque cursor token and append.
    const handleLoadMore = async () => {
        if (!hasMore || !nextCursor || loadingMore) return;
        setLoadingMore(true);
        try {
            const params = { limit: POSTS_PER_PAGE, cursor: nextCursor };
            if (category) params.category = category;
            if (tag) params.tag = tag;
            if (searchQuery) params.q = searchQuery;

            const data = await blogService.getPosts(params);
            const items = Array.isArray(data?.items) ? data.items : [];
            setPosts(prev => [...prev, ...items]);
            setNextCursor(data?.next_cursor ?? null);
            setHasMore(Boolean(data?.has_more));
        } catch {
            // Silently ignore; user can retry via the Load More button.
        } finally {
            setLoadingMore(false);
        }
    };

    // Handle search from sidebar
    const handleSearch = (query) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        setSearchParams(params);
    };

    // Handle retry
    const handleRetry = () => {
        fetchFirstPage();
    };

    // Clear all filters
    const handleClearFilters = () => {
        setSearchParams(new URLSearchParams());
    };

    // Check if any filters are active
    const hasActiveFilters = category || tag || searchQuery;

    // Render loading state
    if (loading) {
        return (
            <div className="blog-classic padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="text-center py-5">
                                <div className="spinner-border text-main" role="status" aria-live="polite">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading posts...</p>
                            </div>
                        </div>
                        <div className="col-lg-4">
                            <CommonSidebar
                                renderSearch={true}
                                renderProperties={false}
                                renderTags={true}
                                onSearch={handleSearch}
                                searchValue={searchQuery}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="blog-classic padding-y-120">
            <div className="container container-two">
                <div className="row gy-4">
                    <div className="col-lg-8">
                        {/* Active filters indicator */}
                        {hasActiveFilters && (
                            <div className="alert alert-light d-flex justify-content-between align-items-center mb-4">
                                <div>
                                    {searchQuery && (
                                        <span className="badge bg-main me-2">
                                            Search: {searchQuery}
                                        </span>
                                    )}
                                    {category && (
                                        <span className="badge bg-secondary me-2">
                                            Category: {category}
                                        </span>
                                    )}
                                    {tag && (
                                        <span className="badge bg-secondary me-2">
                                            Tag: {tag}
                                        </span>
                                    )}
                                </div>
                                <button
                                    className="btn btn-sm btn-outline-secondary"
                                    onClick={handleClearFilters}
                                >
                                    Clear Filters
                                </button>
                            </div>
                        )}

                        {/* Error state */}
                        {error && (
                            <div className="alert alert-danger d-flex justify-content-between align-items-center mb-4">
                                <span>{error}</span>
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={handleRetry}
                                >
                                    <i className="fas fa-redo me-1"></i>
                                    Retry
                                </button>
                            </div>
                        )}

                        {/* Empty state */}
                        {!error && posts.length === 0 && (
                            <div className="text-center py-5">
                                <i className="fas fa-newspaper fa-3x text-muted mb-3"></i>
                                <h5>No posts found</h5>
                                <p className="text-muted mb-4">
                                    {hasActiveFilters
                                        ? 'Try adjusting your search or filters'
                                        : 'Check back later for new content'
                                    }
                                </p>
                                {hasActiveFilters && (
                                    <button
                                        className="btn btn-outline-main"
                                        onClick={handleClearFilters}
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Posts list */}
                        {!error && posts.length > 0 && (
                            <>
                                {posts.map((post) => (
                                    <BlogClassicItem
                                        key={post.id}
                                        post={post}
                                    />
                                ))}

                                {/* Cursor-based Load more */}
                                {hasMore && (
                                    <div className="text-center mt-4">
                                        <button
                                            type="button"
                                            className="btn btn-outline-main"
                                            onClick={handleLoadMore}
                                            disabled={loadingMore}
                                        >
                                            {loadingMore ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                                                    Loading...
                                                </>
                                            ) : (
                                                <>
                                                    <i className="fas fa-plus me-1"></i> Load More
                                                </>
                                            )}
                                        </button>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                    <div className="col-lg-4">
                        <CommonSidebar
                            renderSearch={true}
                            renderProperties={false}
                            renderTags={true}
                            onSearch={handleSearch}
                            searchValue={searchQuery}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlogClassicSection;
