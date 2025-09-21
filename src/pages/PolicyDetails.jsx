import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../common/Header';
import Footer from '../common/Footer';
import Breadcrumb from '../common/Breadcrumb';
import PageTitle from '../common/PageTitle';
import SEO from '../common/SEO';
import { siteMetadata } from '../seo/siteMetadata';
import { pageService } from '../services/pageService';
import ReactMarkdown from 'react-markdown';

const POLICY_DEFINITIONS = {
  'terms-of-service': 'Terms of Service',
  'privacy-policy': 'Privacy Policy',
  'content-guidelines': 'Content Guidelines',
  'content-takedown-policy': 'Content Takedown Policy',
  'grievance-redressal-mechanism': 'Grievance Redressal Mechanism',
};

const resolveTitle = (page, fallback) => page?.title || page?.name || page?.heading || fallback;
const resolveContent = (page) => page?.content || page?.body || page?.description || page?.markdown || '';
const resolveLastUpdated = (page) => page?.updated_at || page?.updatedAt || page?.modified_at || page?.modifiedAt || null;

const MARKDOWN_COMPONENTS = {
  a: ({ node, ...props }) => {
    void node;
    return (
      <a {...props} target={props.target || '_blank'} rel={props.rel || 'noopener noreferrer'} />
    );
  },
  table: ({ node, ...props }) => {
    void node;
    return (
      <div className="table-responsive">
        <table className="table" {...props} />
      </div>
    );
  },
};

const PolicyDetails = () => {
  const { slug } = useParams();
  const [page, setPage] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fallbackTitle = POLICY_DEFINITIONS[slug] || 'Policy';

  useEffect(() => {
    let isMounted = true;
    const run = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await pageService.getPublicPage(slug);
        if (!isMounted) return;
        setPage(data);
      } catch (err) {
        if (!isMounted) return;
        setError(err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    run();
    return () => {
      isMounted = false;
    };
  }, [slug]);

  const title = useMemo(() => resolveTitle(page, fallbackTitle), [page, fallbackTitle]);
  const content = useMemo(() => resolveContent(page), [page]);
  const lastUpdated = useMemo(() => resolveLastUpdated(page), [page]);

  return (
    <>
      <SEO
        title={`${title} | 360Ghar`}
        description={`${title} page for 360Ghar.`}
        keywords={`360Ghar, ${title}`}
        canonical={`/policies/${slug}`}
        image={siteMetadata.defaultOgImage}
        type="article"
        structuredData={{
          '@type': 'CreativeWork',
          name: title,
          url: `${siteMetadata.siteUrl}/policies/${slug}`,
          dateModified: lastUpdated || undefined,
        }}
      />
      <PageTitle title={`360Ghar - ${title}`} />

      <Header
        headerClass="dark-header has-border"
        logoBlack={false}
        logoWhite={true}
        headerMenusClass="mx-auto"
        btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
        btnLink="/add-new-listing"
        btnText="Add Listing"
        spanClass="icon-right text-gradient"
        showHeaderBtn
        showOffCanvasBtn={false}
        offCanvasBtnClass=""
        showContactNumber={false}
      />

      <Breadcrumb pageTitle={title} pageName={title} />

      <section className="policy-wrapper pt-100 pb-120">
        <div className="container px-lg-5">
          {isLoading ? (
            <div className="row justify-content-center py-5">
              <div className="col-lg-6 text-center">
                <div className="spinner-border text-main mb-3" role="status" aria-live="polite">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mb-0 text-secondary">Loading...</p>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-warning" role="alert">
              Unable to load this policy. Please try again later.
            </div>
          ) : (
            <div className="row justify-content-center">
              <div className="col-lg-9">
                <article className="card border-0 shadow-sm rounded-4">
                  <div className="card-body p-4 p-lg-5">
                    <h3 className="mb-3">{title}</h3>
                    {lastUpdated && (
                      <p className="small text-muted mb-3">
                        Last updated:{' '}
                        {new Date(lastUpdated).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    )}
                    <div className="policy-markdown">
                      <ReactMarkdown components={MARKDOWN_COMPONENTS}>{content}</ReactMarkdown>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
};

export default PolicyDetails;
