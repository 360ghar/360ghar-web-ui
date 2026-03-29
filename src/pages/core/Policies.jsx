import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../common/layout/Header';
import Footer from '../../common/layout/Footer';
import MobileMenu from '../../common/layout/MobileMenu';
import OffCanvas from '../../common/layout/OffCanvas';
import Cta from '../../components/ui/Cta';
import SEO from '../../common/SEO';
import { siteMetadata } from '../../seo/siteMetadata';
import { pageService } from '../../services/pageService';

const POLICY_DEFINITIONS = [
  {
    uniqueName: 'terms-of-service',
    fallbackTitle: 'Terms of Service',
    description: 'Understand the usage rules, disclaimers, and fair-use expectations for the 360Ghar platform.',
  },
  {
    uniqueName: 'privacy-policy',
    fallbackTitle: 'Privacy Policy',
    description: 'Learn how 360Ghar collects, secures, and utilises your information when you browse or list property.',
  },
  {
    uniqueName: 'content-guidelines',
    fallbackTitle: 'Content Guidelines',
    description: "Review the dos and don'ts for submitting listings, media assets, and community contributions.",
  },
  {
    uniqueName: 'content-takedown-policy',
    fallbackTitle: 'Content Takedown Policy',
    description: 'See how to report infringing or inaccurate listings and how 360Ghar evaluates takedown requests.',
  },
  {
    uniqueName: 'grievance-redressal-mechanism',
    fallbackTitle: 'Grievance Redressal Mechanism',
    description: 'Know the escalation channels, SLAs, and point of contact for resolving critical platform grievances.',
  },
];

const resolveTitle = (page, fallbackTitle) => page?.title || page?.name || page?.heading || fallbackTitle;
const resolveContent = (page) => page?.summary || page?.excerpt || page?.content || page?.body || page?.description || '';
const resolveLastUpdated = (page) => page?.updated_at || page?.updatedAt || page?.modified_at || page?.modifiedAt || null;

const normaliseText = (text) =>
  text
    .replace(/\r/g, '\n')
    .replace(/\n{2,}/g, '\n')
    .replace(/`{1,3}[^`]*`{1,3}/g, '')
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, '$1')
    .replace(/[*_>#~-]+/g, '')
    .trim();

const extractSummary = (page, fallbackDescription) => {
  const rawContent = resolveContent(page);
  const cleaned = normaliseText(rawContent);
  const firstMeaningfulLine = cleaned
    .split('\n')
    .map((line) => line.trim())
    .find(Boolean);
  const summary = firstMeaningfulLine || cleaned || fallbackDescription;
  if (!summary) return '';
  return summary.length > 200 ? `${summary.slice(0, 197).trim()}...` : summary;
};

const Policies = () => {
  const [fetchedPolicies, setFetchedPolicies] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadPolicies = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const slugs = POLICY_DEFINITIONS.map((policy) => policy.uniqueName);
        const response = await pageService.getManyPublicPages(slugs);
        if (!isMounted) return;
        setFetchedPolicies(response);
      } catch (err) {
        if (!isMounted) return;
        setError(err);
        setFetchedPolicies({});
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    void loadPolicies();

    return () => {
      isMounted = false;
    };
  }, []);

  const resolvedPolicies = useMemo(
    () =>
      POLICY_DEFINITIONS.map((definition) => {
        const entry = fetchedPolicies[definition.uniqueName];
        const page = entry?.page;
        const title = resolveTitle(page, definition.fallbackTitle);
        const summary = extractSummary(page, definition.description);
        const lastUpdated = resolveLastUpdated(page);

        return {
          ...definition,
          title,
          summary,
          lastUpdated,
          hasError: Boolean(entry?.error) && !page,
        };
      }),
    [fetchedPolicies]
  );

  const structuredData = useMemo(
    () => ({
      '@type': 'CollectionPage',
      name: '360Ghar Policies',
      description:
        'Official 360Ghar policies including terms of service, privacy details, content guidelines, takedown rules, and grievance process.',
      hasPart: resolvedPolicies.map((policy) => ({
        '@type': 'CreativeWork',
        name: policy.title,
        url: `${siteMetadata.siteUrl}/policies/${policy.uniqueName}`,
        dateModified: policy.lastUpdated || undefined,
      })),
    }),
    [resolvedPolicies]
  );

  return (
    <>
      <SEO
        title="360Ghar Policies | Terms, Privacy, and Guidelines"
        description="Browse 360Ghar's official policies including our Terms of Service, Privacy Policy, Content Guidelines, Takedown Policy, and Grievance Redressal process."
        keywords="360Ghar policies, terms of service, privacy policy, content guidelines"
        canonical="/policies"
        image={siteMetadata.defaultOgImage}
        type="article"
        structuredData={structuredData}
      />

      <OffCanvas />
      <MobileMenu />

      <main className="body-bg">
        <Header
          headerClass="dark-header has-border"
          headerMenusClass="mx-auto"
          btnClass="btn btn-outline-main btn-outline-main-dark d-lg-block d-none"
          btnLink="/post-property"
          btnText="Post Property"
          spanClass="icon-right text-gradient"
          showContactNumber={false}
        />
      
        <section className="policy-wrapper padding-y-120">
        <div className="container px-lg-5">
          <div className="row justify-content-center mb-40">
            <div className="col-lg-8 text-center">
              <p className="mb-0 text-secondary">
                Access the latest legal and operational policies for using the 360Ghar platform.
              </p>
            </div>
          </div>

          {error && (
            <div className="row justify-content-center mb-4">
              <div className="col-lg-8">
                <div className="alert alert-warning mb-0" role="alert">
                  We could not refresh the policy summaries. You can still open each document to see the latest
                  details.
                </div>
              </div>
            </div>
          )}

          {isLoading ? (
            <div className="row justify-content-center py-5">
              <div className="col-lg-6 text-center">
                <div className="spinner-border text-main mb-3" role="status" aria-live="polite">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mb-0 text-secondary">Loading policies...</p>
              </div>
            </div>
          ) : (
            <div className="row g-4 g-lg-5">
              {resolvedPolicies.map((policy) => (
                <div className="col-lg-6" key={policy.uniqueName}>
                  <article className="card h-100 shadow-sm border-0 rounded-4">
                    <div className="card-body d-flex flex-column p-4 p-lg-5">
                      <div className="d-flex align-items-start justify-content-between gap-3">
                        <div>
                          <h3 className="h5 mb-1">{policy.title}</h3>
                          {policy.lastUpdated && (
                            <p className="small text-muted mb-0">
                              Updated{' '}
                              {new Date(policy.lastUpdated).toLocaleDateString(undefined, {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                              })}
                            </p>
                          )}
                        </div>
                        {policy.hasError && (
                          <span className="badge bg-warning text-dark">Offline</span>
                        )}
                      </div>
                      {policy.summary && <p className="mt-3 mb-4 text-secondary flex-grow-1">{policy.summary}</p>}
                      <div className="d-flex justify-content-end mt-auto pt-3">
                        <Link to={`/policies/${policy.uniqueName}`} className="btn btn-outline-main px-4">
                          Read Policy
                        </Link>
                      </div>
                    </div>
                  </article>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

        <Cta ctaClass="" />

        <Footer />
      </main>
    </>
  );
};

export default Policies;
