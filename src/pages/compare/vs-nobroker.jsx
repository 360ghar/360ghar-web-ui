import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const NoBrokerCompare = () => {
  const competitor = competitors.nobroker;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs NoBroker | Why 360 Ghar is Better for Gurugram Property Search"
      pageDescription="Discover why 360 Ghar is the better alternative to NoBroker. Compare features, read user reviews, and see why thousands choose 360 Ghar for verified properties with 360° virtual tours in Gurugram."
      canonicalPath="/vs/nobroker"
    />
  );
};

export default NoBrokerCompare;
