import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const HousingCompare = () => {
  const competitor = competitors.housing;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs Housing.com | Better Alternative for Gurugram Property Search"
      pageDescription="Compare 360 Ghar with Housing.com. See why verified properties, 360° virtual tours, and dedicated relationship managers make 360 Ghar the better choice."
      canonicalPath="/vs/housing"
    />
  );
};

export default HousingCompare;
