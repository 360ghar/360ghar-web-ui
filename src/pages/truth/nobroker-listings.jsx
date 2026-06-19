import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const TruthPage = lazy(() => import('./TruthPage'));

const NoBrokerTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.nobroker;
  
  const keyIssues = [
    {
      title: 'Subscription Fees Instead of Zero Brokerage',
      description: 'Despite the name, NoBroker charges property owners subscription fees ranging from ₹3,000 to ₹20,000+ to access tenant contact details. The "zero brokerage" positioning applies to tenants but not to owners seeking visibility.',
      source: 'NoBroker website & user reviews'
    },
    {
      title: 'Refund Concerns With Money Back Plan',
      description: 'Some users report difficulty redeeming the "Money Back Guarantee". Complaints on Consumer Court websites indicate refund requests being delayed or declined in certain cases.',
      source: 'Trustpilot, Consumer Court filings'
    },
    {
      title: 'Customer Support Availability',
      description: 'Users report mixed experiences with relationship managers, including delayed responses and limited escalation paths. The dedicated "RM" is not always reachable.',
      source: 'Trustpilot reviews'
    },
    {
      title: 'Listing Verification Gaps',
      description: 'NoBroker relies primarily on self-verification by property owners. Users report encountering listings that are already rented, or photos that do not match the actual property.',
      source: 'User reviews on multiple platforms'
    }
  ];
  
  return (
    <Suspense fallback={<PageLoader />}>
      <TruthPage
        competitor={competitor}
        pageTitle={tSeo('truth.nobroker.title')}
        pageDescription={tSeo('truth.nobroker.description')}
        canonicalPath="/truth/nobroker-listings"
        truthTitle="What to Know About NoBroker Listings"
        introText="NoBroker markets itself as a zero-brokerage platform, but its model now includes owner subscription fees and mixed user experiences. Here is a balanced overview."
        keyIssues={keyIssues}
      />
    </Suspense>
  );
};

export default NoBrokerTruth;
