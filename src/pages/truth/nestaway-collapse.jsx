import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const TruthPage = lazy(() => import('./TruthPage'));

const NestAwayTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.nestaway;
  
  const keyIssues = [
    {
      title: '95% Valuation Collapse',
      description: 'NestAway was once valued at ₹1,800 crore but sold for just ₹90 crore in 2024 - a 95% destruction of value. This signals fundamental business model failure.',
      source: 'News reports, 2024'
    },
    {
      title: 'Co-founder Filed FIR Against Investors',
      description: 'The co-founder filed a First Information Report (FIR) against investors and fellow founders, alleging corporate malpractices. This speaks volumes about internal governance.',
      source: 'Media reports, 2024'
    },
    {
      title: 'Unprofitable Business Model',
      description: 'Despite raising $110M+ from Tiger Global, Goldman Sachs, and others, NestAway failed to achieve profitability. The managed rental model proved unsustainable at scale.',
      source: 'Industry analysis'
    },
    {
      title: 'Property Management Complaints',
      description: 'Users report issues with property maintenance, deposit refunds, and service quality. The "managed" aspect of managed rentals fell short of promises.',
      source: 'User reviews'
    }
  ];
  
  return (
    <TruthPage
      competitor={competitor}
      pageTitle={tSeo('truth.nestaway.title')}
      pageDescription={tSeo('truth.nestaway.description')}
      canonicalPath="/truth/nestaway-collapse"
      truthTitle="The Truth About NestAway's Collapse"
      introText="From ₹1,800 crore to ₹90 crore - NestAway represents one of India\'s most dramatic startup failures. Here\'s what really happened."
      keyIssues={keyIssues}
    />
  );
};

export default NestAwayTruth;
