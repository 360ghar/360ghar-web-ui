import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const TruthPage = lazy(() => import('./TruthPage'));

const AcresTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors['99acres'];
  
  const keyIssues = [
    {
      title: 'Same Spam Problem as MagicBricks',
      description: 'Like its competitor, 99acres sells user contact information to brokers. Users report receiving relentless spam calls within hours of posting inquiries.',
      source: 'User reviews, Trustpilot'
    },
    {
      title: 'Fake and Unavailable Listings',
      description: 'Despite claiming verification, 99acres has numerous complaints about fake listings, properties that were already rented, and misleading photographs.',
      source: 'Trustpilot, Google Play reviews'
    },
    {
      title: 'Poor Refund Policy',
      description: 'Users who paid for premium packages report zero returns on investment. Refund requests are denied or ignored. Premium costs ₹15,000+ with no guarantee of quality.',
      source: 'User testimonials'
    },
    {
      title: 'Unresponsive Customer Support',
      description: 'Multiple complaints filed about customer support being nonexistent. Issues go unresolved, and there\'s no escalation process for disputes.',
      source: 'Consumer Court websites'
    }
  ];
  
  return (
    <TruthPage
      competitor={competitor}
      pageTitle={tSeo('truth.99acres.title')}
      pageDescription={tSeo('truth.99acres.description')}
      canonicalPath="/truth/99acres-fake"
      truthTitle="The Truth About 99acres Listings"
      introText="99acres promises verified properties but delivers fake listings and endless spam. Here\'s what users actually experience."
      keyIssues={keyIssues}
    />
  );
};

export default AcresTruth;
