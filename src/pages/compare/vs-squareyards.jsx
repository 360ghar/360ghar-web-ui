import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const SquareYardsCompare = () => {
  const competitor = competitors.squareyards;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="Square Yards Alternative | 360 Ghar vs SquareYards"
      pageDescription="Compare 360 Ghar vs SquareYards for Gurgaon real estate. Zero spam calls, verified listings with 360° virtual tours, and dedicated relationship managers."
      canonicalPath="/vs/squareyards"
    />
  );
};

export default SquareYardsCompare;
