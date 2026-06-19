import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const NestAwayCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.nestaway;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('nestaway.pageTitle')}
      pageDescription={t('nestaway.pageDescription')}
      canonicalPath="/vs/nestaway"
      />
    </Suspense>
  );
};

export default NestAwayCompare;
