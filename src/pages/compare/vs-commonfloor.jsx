import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const CommonFloorCompare = () => {
  const competitor = competitors.commonfloor;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs CommonFloor | Modern Property Search in Gurugram"
      pageDescription="Compare 360 Ghar with CommonFloor. See why 360 Ghar's modern features, AI-powered search, and verified listings are the better choice for Gurugram property seekers."
      canonicalPath="/vs/commonfloor"
    />
  );
};

export default CommonFloorCompare;
