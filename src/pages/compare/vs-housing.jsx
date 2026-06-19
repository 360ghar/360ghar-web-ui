import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const HousingCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.housing;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('housing.pageTitle')}
      pageDescription={t('housing.pageDescription')}
      canonicalPath="/vs/housing"
      />
    </Suspense>
  );
};

export default HousingCompare;
