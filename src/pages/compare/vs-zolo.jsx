import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import { I18nLink } from '../../i18n/I18nLink';

const ComparePage = lazy(() => import('./ComparePage'));

const ZoloCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.zolo;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('zolo.pageTitle')}
      pageDescription={t('zolo.pageDescription')}
      canonicalPath="/vs/zolo"
    />
  );
};

export default ZoloCompare;
