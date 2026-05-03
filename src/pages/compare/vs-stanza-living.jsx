import { lazy } from 'react';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const StanzaCompare = () => {
  const competitor = competitors.stanza;
  
  return (
    <ComparePage
      competitor={competitor}
      pageTitle="Stanza Living Alternative | 360 Ghar vs Stanza Living"
      pageDescription="Compare 360 Ghar vs Stanza Living for co-living in Gurgaon. Verified properties, 360° virtual tours, and end-to-end service vs managed dormitories."
      canonicalPath="/vs/stanza-living"
    />
  );
};

export default StanzaCompare;
