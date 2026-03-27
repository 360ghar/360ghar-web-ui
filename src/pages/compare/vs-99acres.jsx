import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const AcresCompare = () => {
  const competitor = competitors['99acres'];
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs 99acres | Why 360 Ghar is the Better Property Platform"
      pageDescription="Compare 360 Ghar with 99acres. See why 360 Ghar offers better property verification, zero spam calls, and verified 360° virtual tours in Gurugram."
      canonicalPath="/vs/99acres"
    />
  );
};

export default AcresCompare;
