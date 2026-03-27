import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const ZoloCompare = () => {
  const competitor = competitors.zolo;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs Zolo Stays | Better Co-living Option in Gurugram"
      pageDescription="Compare 360 Ghar with Zolo Stays. See why verified listings, transparent pricing, and no hidden charges make 360 Ghar the better co-living choice."
      canonicalPath="/vs/zolo"
    />
  );
};

export default ZoloCompare;
