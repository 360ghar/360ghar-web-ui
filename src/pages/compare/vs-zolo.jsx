import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const ZoloCompare = () => {
  const competitor = competitors.zolo;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="Zolo Stays Alternative | 360 Ghar vs Zolo Comparison"
      pageDescription="Looking for a Zolo Stays alternative? Compare 360 Ghar vs Zolo — verified PG listings with 360° virtual tours, no hidden charges, and dedicated support."
      canonicalPath="/vs/zolo"
    />
  );
};

export default ZoloCompare;
