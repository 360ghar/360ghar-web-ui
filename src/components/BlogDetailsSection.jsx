import React, { useContext, useEffect, useState } from 'react';
import CommonSidebar from '../common/CommonSidebar';

import { Link } from 'react-router-dom';
import CommentForm from '../common/CommentForm';
import Comment from '../common/Comment';
import BlogKeyword from '../common/BlogKeyword';
import BlogShowcase from '../common/BlogShowcase';
import BlogTesti from '../common/BlogTesti';
import BlogNextPrev from '../common/BlogNextPrev';
import { BlogDataContext } from '../contextApi/BlogDataContext';
import { useParams } from 'react-router-dom';
import { blogService } from '../services/blogService';


const BlogDetailsSection = () => {

    // Blog Data Context API
    const { blogData } = useContext(BlogDataContext);
    const { title: slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        let mounted = true;
        // If context data is available, map it to a post-like object
        if (blogData) {
            setPost({
                title: blogData.title,
                thumbnail_url: blogData.thumb,
                author_name: blogData.admin?.replace(/^By\s+/, '') || 'Admin',
                excerpt: blogData.desc,
                published_at: new Date().toISOString(),
            });
            return;
        }

        // Fallback: fetch by slug from backend
        const fetchPost = async () => {
            try {
                setLoading(true);
                setError(null);
                if (!slug) return;
                const data = await blogService.getPostByIdentifier(slug);
                if (mounted) setPost(data);
            } catch (err) {
                if (mounted) setError(err?.response?.data?.detail || err?.message || 'Failed to load post');
            } finally {
                if (mounted) setLoading(false);
            }
        };
        fetchPost();
        return () => { mounted = false; };
    }, [slug, blogData]);

    // get Current Formatted Date
    const currentDate = new Date();
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    const formattedDate = currentDate.toLocaleDateString('en-US', options);


    if (loading) {
        return (
            <div className="py-5 text-center">Loading...</div>
        );
    }

    if (error) {
        return (
            <div className="py-5 text-center text-danger">{error}</div>
        );
    }

    const thumb = post?.thumbnail_url || post?.cover_image_url || blogData?.thumb;
    const title = post?.title || blogData?.title || 'Blog Details';
    const admin = `By ${post?.author_name || 'Admin'}`;
    const desc = post?.content || post?.excerpt || blogData?.desc || '';
    const meta = [
        { icon: <i className="fas fa-user"></i>, text: admin },
        post?.published_at ? { icon: <i className="fas fa-calendar"></i>, text: new Date(post.published_at).toLocaleDateString() } : null,
    ].filter(Boolean);

    return (
        <>
            <div className="blog-details-section padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            <div className="blog-details">
                                <div className="blog-details__thumb">
                                    <img src={thumb} alt="" className='cover-img'/>
                                    <span className="blog-details__date">{formattedDate}</span>
                                </div>
                                <div className="blog-details__content">
                                    <ul className="blog-infos">
                                        <li className="blog-infos__item">
                                            {admin}
                                        </li>
                                        {meta.map((m, i) => (
                                            <li className="blog-infos__item" key={i}>
                                                <Link to="#" className="blog-infos__link"> 
                                                    <span className="icon">{m.icon}</span>
                                                    {m.text}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                    <h5 className="blog-details__title">{title}</h5>
                                    {desc && <p className="blog-details__desc">{desc}</p>}
                                </div>

                                {/* Blog Testi Start */}
                                <BlogTesti/>
                                {/* Blog Testi End */}
                                
                                {/* Blog ShowCase Start */}
                                <BlogShowcase/>
                                {/* Blog ShowCase End */}

                                {/* Blog Next Prev Start */}
                                <BlogNextPrev/>
                                {/* Blog Next Prev End */}

                                {/* Blog Keyword Start */}
                                <BlogKeyword/>
                                {/* Blog Keyword End */}

                                {/* Comment Start */}
                                <Comment/>
                                {/* Comment End */}

                                {/* Form Start */}
                                <CommentForm/>
                                
                            </div>
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

export default BlogDetailsSection;