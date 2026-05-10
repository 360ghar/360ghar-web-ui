import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import { I18nLink } from '../../i18n/I18nLink';

const ComparePage = lazy(() => import('./ComparePage'));

const NestAwayCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.nestaway;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('nestaway.pageTitle')}
      pageDescription={t('nestaway.pageDescription')}
      canonicalPath="/vs/nestaway"
    />
  );
};

export default NestAwayCompare;
