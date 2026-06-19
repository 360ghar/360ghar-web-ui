import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const CommonFloorCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.commonfloor;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('commonfloor.pageTitle')}
      pageDescription={t('commonfloor.pageDescription')}
      canonicalPath="/vs/commonfloor"
      />
    </Suspense>
  );
};

export default CommonFloorCompare;
