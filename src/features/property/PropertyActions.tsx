import type { CSSProperties } from 'react';
import FavouriteButton from '@/features/favourites/FavouriteButton';
import { COMPARE_MAX, toggleCompare, useCompareStore } from '@/features/search/compare';
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { toast, Toaster } from '@/ui/react/Toaster';
import { IslandBoundary } from '@/ui/react/IslandBoundary';
import { shareUrl } from '@/ui/react/share';

const T = {
  en: { share: 'Share', copied: 'Link copied', compare: 'Compare', compared: 'Added to compare', viewCompare: 'View', full: `You can compare up to ${COMPARE_MAX} homes`, print: 'Print', save: 'Save', saved: 'Saved' },
  hi: { share: 'शेयर', copied: 'लिंक कॉपी हो गया', compare: 'तुलना', compared: 'तुलना में जोड़ा', viewCompare: 'देखें', full: `आप ${COMPARE_MAX} घरों तक की तुलना कर सकते हैं`, print: 'प्रिंट', save: 'सेव करें', saved: 'सेव किया' },
};

/**
 * Save and share sit in the Home Card ("top"); compare and print sit in "More details" ("more").
 * The Toaster belongs to "top": one per page.
 */
type Props = { id: number; title: string; locale?: Locale; part?: 'top' | 'more' };

function Actions({ id, title, locale = 'en', part = 'top' }: Props) {
  const t = T[locale];
  const compare = useCompareStore();
  const inCompare = compare.ids.includes(id);

  const share = async () => {
    const url = `${location.origin}${location.pathname}?utm_source=share&utm_medium=web`;
    const result = await shareUrl({ title, url });
    if (result === 'copied') toast(t.copied, 'success');
    else if (result === 'failed') toast(url);
  };

  const top = part === 'top';
  return (
    // Phones show short labels; the save button takes its short label from these CSS variables (property.css).
    <div className={`prop-actions is-${part}`} style={{ '--save': `"${t.save}"`, '--saved': `"${t.saved}"` } as CSSProperties}>
      {top ? (
        <>
          <FavouriteButton propertyId={id} locale={locale} variant="inline" />
          <button type="button" className="btn" aria-label={t.share} onClick={() => void share()}>
            <Icon name="share" size={18} />
            <span>{t.share}</span>
          </button>
          <Toaster />
        </>
      ) : (
        <>
          <button
            type="button"
            className="btn btn-quiet"
            aria-pressed={inCompare}
            onClick={() => toggleCompare(compare, id, { full: t.full, added: { text: t.compared, view: t.viewCompare, locale } })}
          >
            <Icon name={inCompare ? 'check' : 'compare'} size={18} />
            {t.compare}
          </button>
          <button type="button" className="btn btn-quiet" onClick={() => window.print()}>
            <Icon name="print" size={18} />
            {t.print}
          </button>
        </>
      )}
    </div>
  );
}

export default function PropertyActions(props: Props) {
  return (
    <IslandBoundary locale={props.locale} fallback={null}>
      <Actions {...props} />
    </IslandBoundary>
  );
}
