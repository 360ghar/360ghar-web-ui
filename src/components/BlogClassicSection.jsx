import React, { useEffect, useState } from 'react';
import Pagination from '../common/Pagination';
import CommonSidebar from '../common/CommonSidebar';
import BlogClassicItem from './items/BlogClassicItem';
import { blogService } from '../services/blogService';

const BlogClassicSection = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        const fetchPosts = async () => {
            try {
                setLoading(true);
                setError(null);
                const data = await blogService.getPosts({ page: 1, limit: 10 });
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

    const mapPostToBlogItem = (post) => ({
        thumb: post.thumbnail_url || post.cover_image_url || '/assets/images/thumbs/blog1.png',
        meta: [
            { icon: <i className="fas fa-user"></i>, text: `By ${post.author_name || 'Admin'}` },
            post.published_at ? { icon: <i className="fas fa-calendar"></i>, text: new Date(post.published_at).toLocaleDateString() } : null,
        ].filter(Boolean),
        title: post.title || 'Untitled',
        admin: `By ${post.author_name || 'Admin'}`,
        desc: post.excerpt || post.summary || '',
        linkText: 'Read More',
    });

    return (
        <>
            <div className="blog-classic padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            {loading && <div className="py-4">Loading posts...</div>}
                            {error && !loading && <div className="text-danger py-2">{error}</div>}
                            {!loading && !error && posts.map((post, idx) => (
                                <BlogClassicItem blogItem={mapPostToBlogItem(post)} key={post.id || idx} />
                            ))}
                            <Pagination/>
                        </div>
                        <div className="col-lg-4">
                            <CommonSidebar renderSearch={true} renderProperties={false} renderTags={true}/>
                        </div>  
                    </div>
                </div>
            </div>   
        </>
    );
};

export default BlogClassicSection;