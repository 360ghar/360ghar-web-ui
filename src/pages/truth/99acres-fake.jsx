import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const TruthPage = lazy(() => import('./TruthPage'));

const AcresTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors['99acres'];
  
  const keyIssues = [
    {
      title: 'Broker Call Volume Similar to Other Portals',
      description: 'Like other lead-generation portals, 99acres shares user contact information with brokers. Users report receiving frequent calls within hours of posting inquiries.',
      source: 'User reviews, Trustpilot'
    },
    {
      title: 'Listing Accuracy Concerns',
      description: 'Despite claiming verification, 99acres has user complaints about listings that were already rented, no longer available, or with misleading photographs.',
      source: 'Trustpilot, Google Play reviews'
    },
    {
      title: 'Refund Policy Concerns',
      description: 'Users who paid for premium packages report limited returns on investment. Refund requests are sometimes denied or delayed. Premium packages cost ₹15,000+ with no guarantee of outcomes.',
      source: 'User testimonials'
    },
    {
      title: 'Customer Support Responsiveness',
      description: 'Multiple complaints note that customer support can be hard to reach and that issues may take time to resolve, with limited escalation options for disputes.',
      source: 'Consumer Court websites'
    }
  ];
  
  return (
    <Suspense fallback={<PageLoader />}>
      <TruthPage
        competitor={competitor}
        pageTitle={tSeo('truth.99acres.title')}
        pageDescription={tSeo('truth.99acres.description')}
        canonicalPath="/truth/99acres-fake"
        truthTitle="What to Know About 99acres Listings"
        introText="99acres advertises verified properties, but users report listing-accuracy issues and frequent broker calls. Here is a balanced look at what users actually experience."
        keyIssues={keyIssues}
      />
    </Suspense>
  );
};

export default AcresTruth;
