import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const PropTigerCompare = () => {
  const competitor = competitors.proptiger;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs PropTiger | Better Real Estate Advisory in Gurugram"
      pageDescription="Compare 360 Ghar with PropTiger. See why transparent pricing, verified properties, and no-pressure approach make 360 Ghar the better property platform."
      canonicalPath="/vs/proptiger"
    />
  );
};

export default PropTigerCompare;
