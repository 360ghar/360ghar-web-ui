import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const MagicBricksCompare = () => {
  const competitor = competitors.magicbricks;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="MagicBricks Spam Calls? 360 Ghar vs MagicBricks Alternative"
      pageDescription="Tired of MagicBricks spam calls? Compare 360 Ghar vs MagicBricks — verified listings, 360° VR tours, and no tele-calling. Make an informed choice for Gurgaon real estate."
      canonicalPath="/vs/magicbricks"
    />
  );
};

export default MagicBricksCompare;
