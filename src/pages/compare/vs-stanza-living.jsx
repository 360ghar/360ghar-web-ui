import { lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import { I18nLink } from '../../i18n/I18nLink';

const ComparePage = lazy(() => import('./ComparePage'));

const StanzaCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.stanza;

  return (
    <ComparePage
      competitor={competitor}
      pageTitle={t('stanza.pageTitle')}
      pageDescription={t('stanza.pageDescription')}
      canonicalPath="/vs/stanza-living"
    />
  );
};

export default StanzaCompare;
