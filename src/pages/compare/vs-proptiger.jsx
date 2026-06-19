import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const PropTigerCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.proptiger;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('proptiger.pageTitle')}
      pageDescription={t('proptiger.pageDescription')}
      canonicalPath="/vs/proptiger"
      />
    </Suspense>
  );
};

export default PropTigerCompare;
