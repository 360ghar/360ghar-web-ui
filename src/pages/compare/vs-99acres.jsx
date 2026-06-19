import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const AcresCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors['99acres'];

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('99acres.pageTitle')}
      pageDescription={t('99acres.pageDescription')}
      canonicalPath="/vs/99acres"
      />
    </Suspense>
  );
};

export default AcresCompare;
