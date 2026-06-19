import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const ZoloCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.zolo;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('zolo.pageTitle')}
      pageDescription={t('zolo.pageDescription')}
      canonicalPath="/vs/zolo"
      />
    </Suspense>
  );
};

export default ZoloCompare;
