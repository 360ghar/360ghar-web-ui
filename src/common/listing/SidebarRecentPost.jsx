import { useEffect, useState } from 'react';
import { I18nLink } from '../../i18n/I18nLink';
import { useBlogStore } from '../../store/blogStore';
import { blogService } from '../../services/blogService';

import LazyImage from '../ui/LazyImage';
const SidebarRecentPost = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchRecent = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await blogService.getPosts({ page: 1, limit: 3 });
                const items = Array.isArray(data?.items) ? data.items : (Array.isArray(data) ? data : []);
                if (mounted) setPosts(items);
            } catch (err) {
                if (mounted) setError(err?.response?.data?.detail || err?.message || 'Failed to load posts');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchRecent();
        return () => { mounted = false; };
    }, []);

    const { setBlogData } = useBlogStore();

    return (
        <>
            {loading && <div>Loading...</div>}
            {error && !loading && <div className="text-danger">{error}</div>}
            {!loading && !error && posts.map((post, idx) => {
                const title = post.title || 'Untitled';
                const thumb = post.thumbnail_url || post.cover_image_url || '/assets/images/thumbs/blog1.webp';
                const slug = post.slug || encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
                const blogURL = `/blog/${slug}`;
                const handleBlogClick = () => {
                    setBlogData({ thumb, title, slug, admin: `By ${post.author_name || 'Admin'}` });
                };
                return (
                    <div className="latest-blog" key={post.id || idx}>
                        <div className="latest-blog__thumb">
                            <I18nLink to={blogURL} onClick={handleBlogClick}>
                                <LazyImage src={thumb} className="cover-img" alt={title} width={80} height={60} />
                            </I18nLink>
                        </div>
                        <div className="latest-blog__content">
                            <span className="latest-blog__category font-12 flx-align gap-1">
                                <span className="icon text-gradient"><i className="fas fa-folder-open"></i></span>
                                {post?.categories?.[0]?.name || 'Blog'}
                            </span>
                            <h6 className="latest-blog__title">
                                <I18nLink to={blogURL} onClick={handleBlogClick}>{title}</I18nLink>
                            </h6>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default SidebarRecentPost;
