import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const TruthPage = lazy(() => import('./TruthPage'));

const ZoloTruth = () => {
  const competitor = competitors.zolo;
  
  const keyIssues = [
    {
      title: 'Poor Trustpilot Rating: 1.7/5',
      description: 'Zolo Stays has a Trustpilot rating of just 1.7 out of 5, indicating widespread user dissatisfaction. "Premium co-living" claims don\'t match reality.',
      source: 'Trustpilot reviews'
    },
    {
      title: 'Hidden Charges and Fee Increases',
      description: 'Users report sudden fee increases after signing agreements. What appears included in the rent suddenly becomes an additional charge.',
      source: 'User testimonials, reviews'
    },
    {
      title: 'Security Deposit Refund Problems',
      description: 'Multiple complaints about security deposits not being refunded even months after moving out. The refund process is lengthy and problematic.',
      source: 'Trustpilot, Google Play reviews'
    },
    {
      title: 'Maintenance Issues Ignored',
      description: 'Maintenance requests are reportedly ignored for weeks. Users paying premium prices experience delayed responses to critical issues.',
      source: 'User reviews'
    },
    {
      title: 'Over-promising vs Reality',
      description: 'Marketing promises amenities and services that don\'t materialize. The actual experience falls significantly short of advertised claims.',
      source: 'User testimonials'
    }
  ];
  
  return (
    <TruthPage
      competitor={competitor}
      pageTitle="Why Zolo Stays Has 1.7/5 Rating | The Truth About Zolo Service Issues"
      pageDescription="Discover why Zolo Stays has terrible reviews - hidden charges, deposit refund issues, and ignored maintenance. The truth about co-living in India."
      canonicalPath="/truth/zolo-issues"
      truthTitle="The Truth About Zolo Stays Service Issues"
      introText="With a Trustpilot rating of 1.7/5, Zolo Stays\' premium positioning masks serious service issues reported by thousands of users."
      keyIssues={keyIssues}
    />
  );
};

export default ZoloTruth;
