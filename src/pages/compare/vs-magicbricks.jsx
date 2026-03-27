import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const MagicBricksCompare = () => {
  const competitor = competitors.magicbricks;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs MagicBricks | Best Alternative to MagicBricks in Gurugram"
      pageDescription="Find out why 360 Ghar is the best MagicBricks alternative for Gurugram property search. Compare verified listings, virtual tours, and zero spam experience."
      canonicalPath="/vs/magicbricks"
    />
  );
};

export default MagicBricksCompare;
