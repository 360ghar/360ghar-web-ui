import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const NoBrokerCompare = () => {
  const competitor = competitors.nobroker;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="NoBroker Alternatives Gurgaon | 360 Ghar vs NoBroker Comparison"
      pageDescription="Comparing 360 Ghar vs NoBroker for Gurgaon property search. See why users switch from NoBroker to 360 Ghar for verified listings with 360° virtual tours and zero spam calls."
      canonicalPath="/vs/nobroker"
    />
  );
};

export default NoBrokerCompare;
