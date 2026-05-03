import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const AcresCompare = () => {
  const competitor = competitors['99acres'];
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="Are 99acres Listings Fake? 360 Ghar vs 99acres Comparison"
      pageDescription="Investigate whether 99acres listings are verified. Compare 360 Ghar vs 99acres — physically verified properties with 360° virtual tours vs unverified portal listings in Gurgaon."
      canonicalPath="/vs/99acres"
    />
  );
};

export default AcresCompare;
