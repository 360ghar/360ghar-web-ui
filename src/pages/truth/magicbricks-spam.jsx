import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const TruthPage = lazy(() => import('./TruthPage'));

const MagicBricksTruth = () => {
  const [tSeo] = useTranslation('seo');
  const competitor = competitors.magicbricks;
  
  const keyIssues = [
    {
      title: 'Massive Spam Call Problem',
      description: 'Within 24 hours of posting an inquiry on MagicBricks, users report receiving 50+ calls from brokers. Their business model relies on selling user data to agents.',
      source: 'User reviews, Google Play Store'
    },
    {
      title: 'Data Sold to Broker Networks',
      description: 'MagicBricks monetizes user contact information by selling it to broker databases. Your phone number becomes available to every agent in the city.',
      source: 'User testimonials'
    },
    {
      title: 'Fake "Verified" Listings',
      description: 'The "verified" badge on MagicBricks listings is largely symbolic. Users report that half the properties they viewed were already rented or never existed.',
      source: 'User reviews on Trustpilot'
    },
    {
      title: 'Heavy Broker Reliance',
      description: 'Despite positioning as a direct owner-tenant platform, MagicBricks is dominated by broker listings. Direct owner listings are rare and hard to find.',
      source: 'Platform analysis'
    }
  ];
  
  return (
    <TruthPage
      competitor={competitor}
      pageTitle={tSeo('truth.magicbricks.title')}
      pageDescription={tSeo('truth.magicbricks.description')}
      canonicalPath="/truth/magicbricks-spam"
      truthTitle="The Truth About MagicBricks Spam Calls"
      introText="MagicBricks has perfected the art of selling your data to brokers. What starts as a simple property search becomes a nightmare of spam calls."
      keyIssues={keyIssues}
    />
  );
};

export default MagicBricksTruth;
