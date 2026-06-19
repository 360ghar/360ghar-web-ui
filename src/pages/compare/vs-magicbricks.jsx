import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const MagicBricksCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.magicbricks;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('magicbricks.pageTitle')}
      pageDescription={t('magicbricks.pageDescription')}
      canonicalPath="/vs/magicbricks"
      />
    </Suspense>
  );
};

export default MagicBricksCompare;
