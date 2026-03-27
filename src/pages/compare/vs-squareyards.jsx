import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const SquareYardsCompare = () => {
  const competitor = competitors.squareyards;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="360 Ghar vs Square Yards | Transparent Property Search in Gurugram"
      pageDescription="Compare 360 Ghar with Square Yards. See why unbiased recommendations and transparent pricing make 360 Ghar the better choice for property seekers."
      canonicalPath="/vs/squareyards"
    />
  );
};

export default SquareYardsCompare;
