import { Link } from 'react-router-dom';
import { useBlogStore } from '../../store/blogStore';
import LazyImage from '../../common/ui/LazyImage';

/**
 * BlogClassicItem - Displays a single blog post card in the listing
 * @param {object} post - Full blog post object from API
 */
const BlogClassicItem = ({ post }) => {
    const { setBlogData, currentMonthName } = useBlogStore();

    // Extract post data
    const thumb = post.thumbnail_url || post.cover_image_url || '/assets/images/thumbs/blog1.png';
    const title = post.title || 'Untitled';
    const slug = post.slug; // Use backend slug directly
    const excerpt = post.excerpt || post.summary || '';
    const authorName = post.author_name || 'Admin';
    const publishedAt = post.published_at || post.created_at;

    // Format date
    const formattedDate = publishedAt
        ? new Date(publishedAt).toLocaleDateString('en-US', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
        : `${new Date().getDate()} ${currentMonthName}`;

    // Build URL using backend slug
    const blogURL = `/blog/${encodeURIComponent(slug)}`;

    // Save minimal post data to context for navigation (detail page always fetches full content from API)
    const handleBlogClick = () => {
        setBlogData({
            thumb,
            title,
            slug,
            admin: `By ${authorName}`,
        });
    };

    // Meta information
    const meta = [
        { icon: <i className="fas fa-user"></i>, text: `By ${authorName}` },
        publishedAt && { icon: <i className="fas fa-calendar"></i>, text: formattedDate },
    ].filter(Boolean);

    return (
        <div className="blog-item blog-classic-item d-flex">
            <div className="blog-item__thumb d-flex position-relative">
                <Link
                    to={blogURL}
                    onClick={handleBlogClick}
                    className="blog-item__thumb-link"
                >
                    <LazyImage src={thumb} className="cover-img" alt={title} />
                </Link>
                <span className="blog-item__date font-12">{formattedDate}</span>
            </div>
            <div className="blog-item__content">
                <ul className="text-list border-0 p-0 flx-align">
                    {meta.map((metaInfo, metaIndex) => (
                        <li className="text-list__item font-12" key={metaIndex}>
                            <span className="icon text-gradient">{metaInfo.icon}</span>
                            <span className="link">{metaInfo.text}</span>
                        </li>
                    ))}
                </ul>
                <h5 className="blog-item__title">
                    <Link
                        to={blogURL}
                        onClick={handleBlogClick}
                        className="blog-item__title-link"
                    >
                        {title}
                    </Link>
                </h5>

                {excerpt && (
                    <p className="blog-item__desc font-18">
                        {excerpt.length > 200 ? `${excerpt.substring(0, 200)}...` : excerpt}
                    </p>
                )}

                <Link
                    to={blogURL}
                    onClick={handleBlogClick}
                    aria-label={`Read more about: ${title}`}
                    className="btn btn-outline-main btn-outline-main-white"
                >
                    Read More
                    <span className="icon-right icon">
                        <i className="fas fa-arrow-right"></i>
                    </span>
                </Link>
            </div>
        </div>
    );
};

export default BlogClassicItem;
