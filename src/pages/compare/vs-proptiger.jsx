import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import { I18nLink } from '../../i18n/I18nLink';

const ComparePage = lazy(() => import('./ComparePage'));

const PropTigerCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.proptiger;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('proptiger.pageTitle')}
      pageDescription={t('proptiger.pageDescription')}
      canonicalPath="/vs/proptiger"
    />
  );
};

export default PropTigerCompare;
