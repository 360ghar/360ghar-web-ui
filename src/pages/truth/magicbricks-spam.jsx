import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const TruthPage = lazy(() => import('./TruthPage'));

const MagicBricksTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.magicbricks;
  
  const keyIssues = [
    {
      title: 'Frequent Broker Calls After Inquiries',
      description: 'Users report receiving a high volume of calls from brokers within 24 hours of posting an inquiry on MagicBricks. The platform shares contact details with agents as part of its lead-generation model.',
      source: 'User reviews, Google Play Store'
    },
    {
      title: 'Contact Details Shared With Broker Networks',
      description: 'MagicBricks monetizes by providing user contact information to broker databases. Your phone number may become available to multiple agents in the city.',
      source: 'User testimonials'
    },
    {
      title: 'Verification Inconsistencies',
      description: 'The "verified" badge on MagicBricks listings does not always reflect on-ground status. Users report that some properties they viewed were already rented or no longer available.',
      source: 'User reviews on Trustpilot'
    },
    {
      title: 'Predominantly Broker Listings',
      description: 'While positioned as a direct owner-tenant platform, MagicBricks is largely populated by broker listings. Direct owner listings are comparatively limited.',
      source: 'Platform analysis'
    }
  ];
  
  return (
    // CRITICAL FIX (audit 4.6): wrap lazy-loaded component in Suspense so a
    // slow/failed chunk shows a loader instead of crashing the route.
    <Suspense fallback={<PageLoader />}>
      <TruthPage
        competitor={competitor}
        pageTitle={tSeo('truth.magicbricks.title')}
        pageDescription={tSeo('truth.magicbricks.description')}
        canonicalPath="/truth/magicbricks-spam"
        truthTitle="What to Know About MagicBricks Spam Calls"
        introText="MagicBricks shares contact details with brokers as part of its lead-generation model. A simple property search can lead to a high volume of broker calls. Here is what users report and how to navigate it."
        keyIssues={keyIssues}
      />
    </Suspense>
  );
};

export default MagicBricksTruth;
