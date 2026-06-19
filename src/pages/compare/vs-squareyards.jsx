import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const SquareYardsCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.squareyards;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('squareyards.pageTitle')}
      pageDescription={t('squareyards.pageDescription')}
      canonicalPath="/vs/squareyards"
      />
    </Suspense>
  );
};

export default SquareYardsCompare;
