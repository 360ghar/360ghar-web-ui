import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const PropTigerCompare = () => {
  const competitor = competitors.proptiger;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="PropTiger Alternative Gurgaon | 360 Ghar vs PropTiger"
      pageDescription="Compare 360 Ghar vs PropTiger for property search in Gurgaon. Verified listings, 360° VR tours, and end-to-end assistance vs data-only platform."
      canonicalPath="/vs/proptiger"
    />
  );
};

export default PropTigerCompare;
