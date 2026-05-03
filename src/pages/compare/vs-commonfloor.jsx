import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const CommonFloorCompare = () => {
  const competitor = competitors.commonfloor;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="CommonFloor Alternative | 360 Ghar vs CommonFloor Comparison"
      pageDescription="Compare 360 Ghar vs CommonFloor for Gurgaon real estate. See how 360 Ghar's verified listings, 360° virtual tours, and dedicated relationship managers compare."
      canonicalPath="/vs/commonfloor"
    />
  );
};

export default CommonFloorCompare;
