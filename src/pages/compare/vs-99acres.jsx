import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';

const ComparePage = lazy(() => import('./ComparePage'));

const AcresCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors['99acres'];

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('99acres.pageTitle')}
      pageDescription={t('99acres.pageDescription')}
      canonicalPath="/vs/99acres"
    />
  );
};

export default AcresCompare;
