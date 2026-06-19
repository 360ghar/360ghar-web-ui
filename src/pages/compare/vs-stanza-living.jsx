import { lazy, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { competitors } from '../../data/competitors';
import PageLoader from '../../common/PageLoader';

const ComparePage = lazy(() => import('./ComparePage'));

const StanzaCompare = () => {
  const { t } = useTranslation('compare');
  const competitor = competitors.stanza;

  return (
    <Suspense fallback={<PageLoader />}>
      <ComparePage
      competitor={competitor}
      pageTitle={t('stanza.pageTitle')}
      pageDescription={t('stanza.pageDescription')}
      canonicalPath="/vs/stanza-living"
      />
    </Suspense>
  );
};

export default StanzaCompare;
