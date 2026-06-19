import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const NoBrokerCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.nobroker;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('nobroker.pageTitle')}
      pageDescription={t('nobroker.pageDescription')}
      canonicalPath="/vs/nobroker"
      />
    </Suspense>
  );
};

export default NoBrokerCompare;
