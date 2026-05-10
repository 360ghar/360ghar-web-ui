import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import { I18nLink } from '../../i18n/I18nLink';

const ComparePage = lazy(() => import('./ComparePage'));

const SquareYardsCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.squareyards;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('squareyards.pageTitle')}
      pageDescription={t('squareyards.pageDescription')}
      canonicalPath="/vs/squareyards"
    />
  );
};

export default SquareYardsCompare;
