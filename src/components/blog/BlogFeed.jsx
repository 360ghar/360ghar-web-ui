import { useEffect, useState } from 'react';
import { I18nLink } from '../../i18n/I18nLink';
import SectionHeading from '../../common/ui/SectionHeading';
import LazyImage from '../../common/ui/LazyImage';
import { blogService } from '../../services/blogService';
import { useBlogStore } from '../../store/blogStore';

const titleToSlug = (text) =>
    String(text || '').toLowerCase().replace(/\s+/g, '-');

const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
};

const BlogFeed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { setBlogData } = useBlogStore();

    useEffect(() => {
        let mounted = true;
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await blogService.getPosts({ page: 1, limit: 6 });
                const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
                if (mounted) setPosts(items);
            } catch (err) {
                if (mounted) setError(err?.response?.data?.detail || err?.message || 'Failed to load posts');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchPosts();
        return () => { mounted = false; };
    }, []);

    const mapPost = (post) => ({
        id: post.id,
        thumb: post.thumbnail_url || post.cover_image_url || '/assets/images/thumbs/blog1.webp',
        title: post.title || 'Untitled',
        excerpt: post.excerpt || post.summary || '',
        date: post.published_at,
        admin: `By ${post.author_name || 'Admin'}`,
        slug: post.slug || titleToSlug(post.title || ''),
    });

    return (
        <section className="blog-feed padding-y-120">
            <div className="container container-two">
                <div className="blog-feed__heading-row">
                    <SectionHeading
                        headingClass="style-center"
                        subtitle="Latest from 360Ghar"
                        subtitleClass="bg-white"
                        title="Stay Updated"
                        renderDesc={false}
                        renderButton={false}
                    />
                    <a
                        href="/rss.xml"
                        className="blog-feed__rss-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Subscribe to RSS feed"
                    >
                        <i className="fas fa-rss icon" aria-hidden="true"></i>
                        RSS Feed
                    </a>
                </div>

                {loading && (
                    <div className="col-12 text-center py-4">Loading latest posts...</div>
                )}
                {error && !loading && (
                    <div className="col-12 text-danger py-4">{error}</div>
                )}
                {!loading && !error && posts.length === 0 && (
                    <div className="col-12 text-center py-4">No posts available.</div>
                )}

                {!loading && !error && posts.length > 0 && (
                    <ul className="blog-feed__list">
                        {posts.map((post, index) => {
                            const item = mapPost(post);
                            const blogURL = `/blog/${encodeURIComponent(item.slug)}`;
                            const handleClick = () =>
                                setBlogData({ thumb: item.thumb, admin: item.admin, title: item.title, slug: item.slug });
                            return (
                                <li className="blog-feed__item" key={item.id || index}>
                                    <div className="blog-feed__thumb">
                                        <I18nLink to={blogURL} onClick={handleClick} tabIndex={-1}>
                                            <LazyImage
                                                src={item.thumb}
                                                alt={`${item.title} - 360Ghar Blog`}
                                                className="cover-img"
                                            />
                                        </I18nLink>
                                    </div>
                                    <div className="blog-feed__content">
                                        <h6 className="blog-feed__title">
                                            <I18nLink to={blogURL} onClick={handleClick} className="border-effect">
                                                {item.title}
                                            </I18nLink>
                                        </h6>
                                        {item.excerpt && (
                                            <p className="blog-feed__excerpt">{item.excerpt}</p>
                                        )}
                                    </div>
                                    {item.date && (
                                        <div className="blog-feed__meta">{formatDate(item.date)}</div>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                )}

                <div className="blog-feed__actions">
                    <I18nLink to="/blog" className="btn btn-main">
                        View All Posts <i className="fas fa-arrow-right icon-right"></i>
                    </I18nLink>
                    <a
                        href="/rss.xml"
                        className="blog-feed__rss-btn"
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Subscribe to RSS feed"
                    >
                        <i className="fas fa-rss icon" aria-hidden="true"></i>
                        Subscribe via RSS
                    </a>
                </div>
            </div>
        </section>
    );
};

export default BlogFeed;
