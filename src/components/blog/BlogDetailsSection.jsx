import { useEffect, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import { I18nLink } from '../../i18n/I18nLink';
import DOMPurify from 'dompurify';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import CommonSidebar from '../../common/listing/CommonSidebar';
import { blogService } from '../../services/blogService';
import LazyImage from '../../common/ui/LazyImage';
import { getAuthor, getAuthorSchema } from '../../data/authors';
import SEO from '../../common/SEO';
import { generateBlogStructuredData, generateBreadcrumbStructuredData } from '../../seo/structuredData';
import { siteMetadata } from '../../seo/siteMetadata';
import './BlogDetails.scss';

/**
 * Check if content contains HTML tags
 */
const isHTMLContent = (content) => {
    if (!content) return false;
    // Check for common HTML tags
    const htmlPattern = /<(p|div|h[1-6]|ul|ol|li|br|strong|em|a|img|table|blockquote)[^>]*>/i;
    return htmlPattern.test(content);
};

/**
 * Check if content is markdown (as opposed to plain text)
 * Looks for distinctive markdown syntax that wouldn't appear in plain text
 */
const isMarkdownContent = (content) => {
    if (!content) return false;
    // Strong signals — any one of these is definitive markdown
    const strongPatterns = [
        /^#{1,6}\s/m,           // ATX headings: # Title, ## Subtitle, ### etc.
        /\*\*[^*]+\*\*/,       // bold: **text**
        /\[.+?\]\(.+?\)/,      // links: [text](url)
        /!\[.*?\]\(.+?\)/,     // images: ![alt](url)
        /```/,                 // fenced code block
        /^\|.*\|.*\|$/m,       // tables: | col | col |
    ];
    if (strongPatterns.some(p => p.test(content))) return true;
    // Weak signals — need 2+ to confirm markdown (could appear in plain text)
    const weakPatterns = [
        /^[-*+]\s/m,           // unordered list: - item, * item
        /^>\s/m,               // blockquote: > text
        /^---+$/m,             // horizontal rule
    ];
    return weakPatterns.filter(p => p.test(content)).length >= 2;
};

/**
 * Extract the first image URL from markdown content
 */
const extractFirstMarkdownImage = (content) => {
    if (!content) return null;
    const match = content.match(/!\[.*?\]\((.+?)\)/);
    return match ? match[1] : null;
};

/**
 * Convert plain text content to HTML
 * Handles newlines, bullet points, numbered lists, and horizontal rules
 */
const convertPlainTextToHTML = (text) => {
    if (!text) return '';

    // Replace horizontal lines (underscores) with marker
    let content = text.replace(/_{5,}/g, '|||HR|||');

    // Split by newlines
    const lines = content.split('\n');
    const result = [];
    let currentBulletList = [];
    let currentNumberedList = [];

    const flushBulletList = () => {
        if (currentBulletList.length > 0) {
            result.push(`<ul class="blog-content-list">${currentBulletList.join('')}</ul>`);
            currentBulletList = [];
        }
    };

    const flushNumberedList = () => {
        if (currentNumberedList.length > 0) {
            result.push(`<ol class="blog-numbered-list">${currentNumberedList.join('')}</ol>`);
            currentNumberedList = [];
        }
    };

    const flushAllLists = () => {
        flushBulletList();
        flushNumberedList();
    };

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            flushAllLists();
            continue;
        }

        // Check for horizontal rule marker
        if (line === '|||HR|||' || line.includes('|||HR|||')) {
            flushAllLists();
            result.push('<hr class="blog-divider">');
            continue;
        }

        // Check if line starts with bullet point (• or · followed by optional tab/spaces)
        const bulletMatch = line.match(/^[•·]\s*/);
        if (bulletMatch) {
            flushNumberedList();
            const itemText = line.slice(bulletMatch[0].length).trim();
            if (itemText) {
                currentBulletList.push(`<li>${itemText}</li>`);
            }
            continue;
        }

        // Check if line starts with numbered list (1. 2. etc)
        const numberedMatch = line.match(/^(\d+)\.\s+/);
        if (numberedMatch) {
            flushBulletList();
            const itemText = line.slice(numberedMatch[0].length).trim();
            if (itemText) {
                currentNumberedList.push(`<li>${itemText}</li>`);
            }
            continue;
        }

        // If we were in a list, flush it
        flushAllLists();

        // Check if line looks like a heading (short, ends with ? or specific patterns)
        const isHeading = (
            line.length < 100 &&
            !line.endsWith('.') &&
            !line.endsWith(',') &&
            (
                line.endsWith('?') ||
                /^(What|Why|How|When|Where|Who|Which|Expert|Comparison|Conclusion|Introduction|FAQ|Tips|Summary|Key|Important|Understanding)/i.test(line)
            )
        );

        // Also check for standalone section titles (short lines that look like headers)
        const isSectionTitle = (
            line.length < 60 &&
            !line.endsWith('.') &&
            !line.endsWith(',') &&
            !line.includes(':') &&
            /^[A-Z]/.test(line) &&
            !/[a-z]{20,}/.test(line) // Not a long lowercase word run
        );

        if (isHeading || isSectionTitle) {
            result.push(`<h3 class="blog-heading">${line}</h3>`);
        } else {
            // Regular paragraph
            result.push(`<p>${line}</p>`);
        }
    }

    // Flush any remaining list items
    flushAllLists();

    return result.join('\n');
};

const SANITIZE_OPTIONS = {
    ALLOWED_TAGS: [
        'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li',
        'a', 'img',
        'blockquote', 'pre', 'code',
        'table', 'thead', 'tbody', 'tr', 'th', 'td',
        'div', 'span', 'hr'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel']
};

const BlogDetailsSection = () => {
    const { title: slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Always fetch full post from API — context data from listing is excerpt-only
    const fetchPost = useCallback(async () => {
        if (!slug) return;

        try {
            setLoading(true);
            setError(null);
            const data = await blogService.getPostByIdentifier(slug);
            setPost(data);
        } catch (err) {
            setError(err?.response?.data?.detail || err?.message || 'Failed to load post');
        } finally {
            setLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        fetchPost();
    }, [fetchPost]);

    // SEO metadata derived from fetched post
    const seoMeta = useMemo(() => {
        const titleText = post?.title || 'Real Estate Blog | 360Ghar';
        const descText = post?.excerpt || post?.summary || 'Read insights on buying, renting, PGs, locality guides, and investment trends in Gurugram and Delhi NCR.';
        const image = post?.thumbnail_url || post?.cover_image_url
            || post?.featured_image || post?.image_url || post?.image
            || extractFirstMarkdownImage(post?.content || '')
            || siteMetadata.defaultOgImage;
        const postSlug = post?.slug;
        const url = postSlug ? `/blog/${postSlug}` : undefined;
        const authorSlug = post?.author_slug || '360ghar-team';
        const authorSchema = getAuthorSchema(authorSlug);
        const ld = generateBlogStructuredData({
            title: titleText,
            description: descText,
            image,
            url: url ? `${siteMetadata.siteUrl}${url}` : undefined,
            slug: postSlug,
            publishedAt: post?.published_at,
            updatedAt: post?.updated_at,
            authorSchema,
        });
        const breadcrumb = generateBreadcrumbStructuredData([
            { name: 'Home', url: 'https://360ghar.com/' },
            { name: 'Blog', url: 'https://360ghar.com/blog' },
            { name: titleText, url: url ? `${siteMetadata.siteUrl}${url}` : 'https://360ghar.com/blog' }
        ]);
        const keywords = [
            post?.title,
            post?.categories?.[0]?.name,
            'real estate blog',
            'property tips',
            '360Ghar',
        ].filter(Boolean).join(', ');
        const articleTags = (post?.tags || []).map((t) => t.name).filter(Boolean);
        const articleSection = post?.categories?.[0]?.name || undefined;
        return { titleText, descText, image, url, ld, breadcrumb, keywords, articleTags, articleSection };
    }, [post]);

    // Detect content type and prepare for rendering
    // Returns { type: 'html'|'markdown'|'empty', html?, markdown? }
    const contentData = useMemo(() => {
        const rawContent = post?.content || post?.excerpt || '';
        if (!rawContent.trim()) return { type: 'empty' };
        if (isHTMLContent(rawContent)) return { type: 'html', html: DOMPurify.sanitize(rawContent, SANITIZE_OPTIONS) };
        if (isMarkdownContent(rawContent)) return { type: 'markdown', markdown: rawContent };
        // Plain text fallback
        return { type: 'html', html: DOMPurify.sanitize(convertPlainTextToHTML(rawContent), SANITIZE_OPTIONS) };
    }, [post?.content, post?.excerpt]);

    // Format date
    const formattedDate = useMemo(() => {
        const date = post?.published_at || post?.created_at;
        if (!date) return new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
        return new Date(date).toLocaleDateString('en-US', { day: '2-digit', month: 'long', year: 'numeric' });
    }, [post?.published_at, post?.created_at]);

    const rawContent = post?.content || '';
    const thumb = post?.thumbnail_url || post?.cover_image_url
        || post?.featured_image || post?.image_url || post?.image
        || extractFirstMarkdownImage(rawContent);
    const title = post?.title || 'Blog Details';
    const excerpt = post?.excerpt || post?.summary || '';
    const authorSlug = post?.author_slug || '360ghar-team';
    const authorInfo = getAuthor(authorSlug);
    const authorName = post?.author_name || authorInfo.name;
    const categories = post?.categories || [];
    const tags = post?.tags || [];

    return (
        <>
            <SEO
                title={seoMeta.titleText}
                description={seoMeta.descText}
                keywords={seoMeta.keywords}
                canonical={seoMeta.url}
                image={seoMeta.image}
                type="article"
                articlePublishedTime={post?.published_at}
                articleModifiedTime={post?.updated_at}
                articleTags={seoMeta.articleTags}
                articleSection={seoMeta.articleSection}
                structuredData={[seoMeta.ld, seoMeta.breadcrumb]}
                noindex={!loading && (!post || error)}
            />
            <div className="blog-details-section padding-y-120">
                <div className="container container-two">
                    <div className="row gy-4">
                        <div className="col-lg-8">
                            {loading ? (
                                <div className="text-center py-5">
                                    <div className="spinner-border text-main" role="status" aria-live="polite">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    <p className="mt-3 text-muted">Loading article...</p>
                                </div>
                            ) : error ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-exclamation-triangle fa-3x text-danger mb-3"></i>
                                    <h5>Failed to Load Article</h5>
                                    <p className="text-muted mb-4">{error}</p>
                                    <button className="btn btn-main" onClick={fetchPost}>
                                        <i className="fas fa-redo me-2"></i>
                                        Try Again
                                    </button>
                                    <I18nLink to="/blog" className="btn btn-outline-secondary ms-2">
                                        Back to Blog
                                    </I18nLink>
                                </div>
                            ) : !post ? (
                                <div className="text-center py-5">
                                    <i className="fas fa-file-alt fa-3x text-muted mb-3"></i>
                                    <h5>Article Not Found</h5>
                                    <p className="text-muted mb-4">The article you are looking for does not exist.</p>
                                    <I18nLink to="/blog" className="btn btn-main">
                                        Back to Blog
                                    </I18nLink>
                                </div>
                            ) : (
                                <article className="blog-details">
                                    {/* Featured Image */}
                                    {thumb && (
                                        <div className="blog-details__thumb">
                                            <LazyImage src={thumb} alt={title} className="cover-img" priority />
                                            <span className="blog-details__date">{formattedDate}</span>
                                        </div>
                                    )}

                                    <div className="blog-details__content">
                                        {/* Meta Info */}
                                        <ul className="blog-infos mb-3">
                                            <li className="blog-infos__item">
                                                <span className="icon"><i className="fas fa-user"></i></span>
                                                By <span className="fw-semibold">{authorName}</span>
                                            </li>
                                            <li className="blog-infos__item">
                                                <span className="icon"><i className="fas fa-calendar"></i></span>
                                                {formattedDate}
                                            </li>
                                        </ul>

                                        {/* Categories */}
                                        {categories.length > 0 && (
                                            <div className="mb-3">
                                                {categories.map((cat) => (
                                                    <I18nLink
                                                        key={cat.id || cat.slug}
                                                        to={`/blog?category=${cat.slug}`}
                                                        className="badge bg-main me-2 text-decoration-none"
                                                    >
                                                        {cat.name}
                                                    </I18nLink>
                                                ))}
                                            </div>
                                        )}

                                        {/* Title */}
                                        <h2 className="blog-details__title">{title}</h2>

                                        {/* Excerpt / Lead paragraph */}
                                        {excerpt && (
                                            <p className="blog-details__excerpt">{excerpt}</p>
                                        )}

                                        {/* Content - Rendered as HTML or Markdown */}
                                        {contentData.type === 'markdown' ? (
                                            <div className="blog-details__content-body">
                                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                    {contentData.markdown}
                                                </ReactMarkdown>
                                            </div>
                                        ) : contentData.type === 'html' ? (
                                            <div
                                                className="blog-details__content-body"
                                                dangerouslySetInnerHTML={{ __html: contentData.html }}
                                            />
                                        ) : null}

                                        {/* Tags */}
                                        {tags.length > 0 && (
                                            <div className="blog-details__tags mt-5 pt-4 border-top">
                                                <div className="d-flex align-items-center flex-wrap gap-2">
                                                    <strong className="me-2">Tags:</strong>
                                                    {tags.map((tag) => (
                                                        <I18nLink
                                                            key={tag.id || tag.slug}
                                                            to={`/blog?tag=${tag.slug}`}
                                                            className="badge bg-light text-dark text-decoration-none"
                                                        >
                                                            #{tag.name}
                                                        </I18nLink>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Back to blog link */}
                                        <div className="mt-5 pt-4 border-top">
                                            <I18nLink to="/blog" className="btn btn-outline-main">
                                                <i className="fas fa-arrow-left me-2"></i>
                                                Back to Blog
                                            </I18nLink>
                                        </div>
                                    </div>
                                </article>
                            )}
                        </div>
                        <div className="col-lg-4">
                            <CommonSidebar renderSearch={true} renderProperties={false} renderTags={true} />
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default BlogDetailsSection;
