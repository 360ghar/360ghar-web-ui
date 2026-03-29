import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import Pagination from '../../common/ui/Pagination';
import CommonSidebar from '../../common/listing/CommonSidebar';
import BlogClassicItem from './BlogClassicItem';
import { blogService } from '../../services/blogService';

const POSTS_PER_PAGE = 10;

const BlogClassicSection = () => {
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        totalPages: 1,
        total: 0
    });

    // Get filters from URL
    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';
    const searchQuery = searchParams.get('q') || '';

    // Fetch posts
    const fetchPosts = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {
                page,
                limit: POSTS_PER_PAGE,
            };

            // Add filters if present
            if (category) params.category = category;
            if (tag) params.tag = tag;
            if (searchQuery) params.q = searchQuery;

            const data = await blogService.getPosts(params);

            // Handle response structure
            if (data?.items && Array.isArray(data.items)) {
                setPosts(data.items);
                setPagination({
                    page: data.page || 1,
                    totalPages: data.total_pages || 1,
                    total: data.total || 0
                });
            } else if (Array.isArray(data)) {
                setPosts(data);
                setPagination({
                    page: 1,
                    totalPages: 1,
                    total: data.length
                });
            } else {
                setPosts([]);
                setPagination({ page: 1, totalPages: 1, total: 0 });
            }
        } catch (err) {
            setError(err?.response?.data?.detail || err?.message || 'Failed to load posts');
            setPosts([]);
        } finally {
            setLoading(false);
        }
    }, [page, category, tag, searchQuery]);

    useEffect(() => {
        fetchPosts();
    }, [fetchPosts]);

    // Handle page change
    const handlePageChange = (newPage) => {
        const params = new URLSearchParams();
        if (newPage > 1) params.set('page', newPage.toString());
        if (category) params.set('category', category);
        if (tag) params.set('tag', tag);
        if (searchQuery) params.set('q', searchQuery);
        setSearchParams(params);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Handle search from sidebar
    const handleSearch = (query) => {
        const params = new URLSearchParams();
        if (query) params.set('q', query);
        // Reset page when searching
        setSearchParams(params);
    };

    // Handle retry
    const handleRetry = () => {
        fetchPosts();
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
                                    <span className="text-muted ms-2">
                                        {pagination.total} {pagination.total === 1 ? 'result' : 'results'} found
                                    </span>
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

                                {/* Pagination */}
                                <Pagination
                                    currentPage={pagination.page}
                                    totalPages={pagination.totalPages}
                                    onPageChange={handlePageChange}
                                />

                                {/* Results info */}
                                {pagination.total > 0 && (
                                    <p className="text-center text-muted mt-3">
                                        Showing {((pagination.page - 1) * POSTS_PER_PAGE) + 1} - {Math.min(pagination.page * POSTS_PER_PAGE, pagination.total)} of {pagination.total} posts
                                    </p>
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
