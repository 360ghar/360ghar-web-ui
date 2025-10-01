import React, { useEffect, useState } from 'react';
import BlogItemThree from './items/BlogItemThree';
import SectionHeading from '../common/SectionHeading';
import { blogService } from '../services/blogService';

const BlogThree = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

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
            {/* ================================ Blog Three Start ============================    */}
            <section className="blog padding-y-120">
                <div className="container container-two">

                    <SectionHeading
                        headingClass="style-center"  
                        subtitle="Latest blog and news"
                        subtitleClass="bg-white" 
                        title="Investing in estate made lot easy" 
                        renderDesc={false}
                        desc="Real estate is a lucrative industry that involves the buying selling and renting of properties. It encompasses residential commercial and industrial properties Real estate agents play a crucial role in facilitating real estate"
                        renderButton={false}
                        buttonClass="btn-main"
                        buttonText="View More"
                    />

                    <div className="row gy-4">
                        {loading && <div className="col-12">Loading...</div>}
                        {error && !loading && <div className="col-12 text-danger">{error}</div>}
                        {!loading && !error && posts.slice(0,3).map((post, index) => (
                            <div className="col-lg-4 col-sm-6" key={post.id || index}>
                                <BlogItemThree blogItem={mapPost(post)} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            {/* ================================ Blog Three End ============================    */}
        </>
    );
};

export default BlogThree;