import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { pageService } from '../../services/pageService';
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
  const { t } = useTranslation('policies');
  const [tSeo] = useTranslation('seo');
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
        title={tSeo('policyDetails.title', { title })}
        description={tSeo('policyDetails.description', { title })}
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

      <Header
        headerClass="dark-header has-border"
        headerMenusClass="mx-auto"
        btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
        btnLink="/add-new-listing"
        btnText={t('common:header.postProperty')}
        spanClass="icon-right text-gradient"
        showContactNumber={false}
      />

      
      <section className="policy-wrapper pt-100 pb-120">
        <div className="container px-lg-5">
          {isLoading ? (
            <div className="row justify-content-center py-5">
              <div className="col-lg-6 text-center">
                <div className="spinner-border text-main mb-3" role="status" aria-live="polite">
                  <span className="visually-hidden">{t('policyDetails.loadingAria')}</span>
                </div>
                <p className="mb-0 text-secondary">{t('policyDetails.loading')}</p>
              </div>
            </div>
          ) : error ? (
            <div className="alert alert-warning" role="alert">
              <p className="mb-0">{t('policyDetails.unableToLoad')}</p>
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
      <MobileMenu />
      <OffCanvas />
    </>
  );
};

export default PolicyDetails;
