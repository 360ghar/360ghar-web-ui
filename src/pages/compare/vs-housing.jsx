import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const HousingCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.housing;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('housing.pageTitle')}
      pageDescription={t('housing.pageDescription')}
      canonicalPath="/vs/housing"
    />
  );
};

export default HousingCompare;
