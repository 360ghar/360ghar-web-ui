import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const CommonFloorCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.commonfloor;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('commonfloor.pageTitle')}
      pageDescription={t('commonfloor.pageDescription')}
      canonicalPath="/vs/commonfloor"
    />
  );
};

export default CommonFloorCompare;
