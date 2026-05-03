import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const NestAwayCompare = () => {
  const competitor = competitors.nestaway;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="NestAway Collapse: 360 Ghar vs NestAway Alternative"
      pageDescription="After NestAway's collapse, find a reliable alternative. Compare 360 Ghar vs NestAway — verified rentals with 360° virtual tours and dedicated support in Gurgaon."
      canonicalPath="/vs/nestaway"
    />
  );
};

export default NestAwayCompare;
