import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const TruthPage = lazy(() => import('./TruthPage'));

const NoBrokerTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.nobroker;
  
  const keyIssues = [
    {
      title: 'Subscription Fees Instead of Zero Brokerage',
      description: 'Despite the name, NoBroker now charges property owners subscription fees ranging from ₹3,000 to ₹20,000+ to access tenant contact details. The "zero brokerage" promise is misleading.',
      source: 'NoBroker website & user reviews'
    },
    {
      title: 'Refund Issues with Money Back Plan',
      description: 'Multiple users report that the "Money Back Guarantee" is nearly impossible to redeem. Complaints on Consumer Court websites show refund requests being denied or delayed indefinitely.',
      source: 'Trustpilot, Consumer Court filings'
    },
    {
      title: 'Poor Customer Support',
      description: 'Users consistently report unresponsive relationship managers, lack of escalation paths, and poor issue resolution. The dedicated "RM" promised is often unreachable.',
      source: 'Trustpilot reviews'
    },
    {
      title: 'Fake and Duplicate Listings',
      description: 'NoBroker relies on self-verification by property owners. Users report encountering listings that are already rented, misleading photos, and unavailable properties.',
      source: 'User reviews on multiple platforms'
    }
  ];
  
  return (
    <TruthPage
      competitor={competitor}
      pageTitle={tSeo('truth.nobroker.title')}
      pageDescription={tSeo('truth.nobroker.description')}
      canonicalPath="/truth/nobroker-listings"
      truthTitle="The Truth About NoBroker Listings"
      introText="Despite their marketing promises, NoBroker has transformed from a zero-brokerage platform to a subscription-based service with numerous user complaints."
      keyIssues={keyIssues}
    />
  );
};

export default NoBrokerTruth;
