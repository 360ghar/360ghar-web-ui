import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const TruthPage = lazy(() => import('./TruthPage'));

const NestAwayTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.nestaway;
  
  const keyIssues = [
    {
      title: 'Significant Valuation Decline',
      description: 'NestAway was once valued at approximately ₹1,800 crore but was acquired for around ₹90 crore in 2024, a substantial reduction in valuation. This reflects challenges in the managed-rental business model.',
      source: 'News reports, 2024'
    },
    {
      title: 'Co-founder Legal Dispute',
      description: 'A co-founder filed a First Information Report (FIR) against investors and fellow founders, alleging corporate malpractices. This indicates internal governance challenges during the company\'s downturn.',
      source: 'Media reports, 2024'
    },
    {
      title: 'Profitability Challenges',
      description: 'Despite raising $110M+ from Tiger Global, Goldman Sachs, and others, NestAway did not achieve profitability. The managed rental model proved difficult to sustain at scale.',
      source: 'Industry analysis'
    },
    {
      title: 'Property Management Concerns',
      description: 'Users report issues with property maintenance, deposit refunds, and service quality. The "managed" aspect of managed rentals did not always meet expectations.',
      source: 'User reviews'
    }
  ];
  
  return (
    <Suspense fallback={<PageLoader />}>
      <TruthPage
        competitor={competitor}
        pageTitle={tSeo('truth.nestaway.title')}
        pageDescription={tSeo('truth.nestaway.description')}
        canonicalPath="/truth/nestaway-collapse"
        truthTitle="What Happened With NestAway"
        introText="From a ₹1,800 crore valuation to an approximately ₹90 crore acquisition, NestAway\'s journey highlights the challenges of the managed-rental model. Here is a factual overview."
        keyIssues={keyIssues}
      />
    </Suspense>
  );
};

export default NestAwayTruth;
