import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const HousingCompare = () => {
  const competitor = competitors.housing;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="Housing.com Alternative Gurgaon | 360 Ghar vs Housing Comparison"
      pageDescription="Looking for a Housing.com alternative in Gurgaon? Compare 360 Ghar vs Housing.com on verification, virtual tours, spam calls, and end-to-end service."
      canonicalPath="/vs/housing"
    />
  );
};

export default HousingCompare;
