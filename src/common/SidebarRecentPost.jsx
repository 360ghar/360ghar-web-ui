import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BlogDataContext } from '../contextApi/BlogDataContext';
import { blogService } from '../services/blogService';

import LazyImage from './LazyImage';
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

    return (
        <>
            {loading && <div>Loading...</div>}
            {error && !loading && <div className="text-danger">{error}</div>}
            {!loading && !error && posts.map((post, idx) => {
                const title = post.title || 'Untitled';
                const thumb = post.thumbnail_url || post.cover_image_url || '/assets/images/thumbs/blog1.png';
                const slug = post.slug || encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
                const blogURL = `/blog/${slug}`;
                const { setBlogData } = useContext(BlogDataContext);
                const handleBlogClick = () => {
                    setBlogData({ thumb, meta: [], title, admin: `By ${post.author_name || 'Admin'}`, desc: post.excerpt || '' });
                };
                return (
                    <div className="latest-blog" key={post.id || idx}>
                        <div className="latest-blog__thumb">
                            <Link to={blogURL} onClick={handleBlogClick}> 
                                <LazyImage src={thumb} className="cover-img" alt=""/>
                            </Link>
                        </div>
                        <div className="latest-blog__content">
                            <span className="latest-blog__category font-12 flx-align gap-1">
                                <span className="icon text-gradient"><i className="fas fa-folder-open"></i></span>
                                Category
                            </span>
                            <h6 className="latest-blog__title">
                                <Link to={blogURL} onClick={handleBlogClick}>{title}</Link>
                            </h6>
                        </div>
                    </div>
                );
            })}
        </>
    );
};

export default SidebarRecentPost;