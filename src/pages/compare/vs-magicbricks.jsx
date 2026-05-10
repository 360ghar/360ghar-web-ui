import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const MagicBricksCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.magicbricks;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('magicbricks.pageTitle')}
      pageDescription={t('magicbricks.pageDescription')}
      canonicalPath="/vs/magicbricks"
    />
  );
};

export default MagicBricksCompare;
