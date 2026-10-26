import type { ReactNode } from 'react';
import type { Locale } from '@/lib/i18n/locale';
import { Island } from './Island';

type Fixed = { sector: string; property_type: string; rate_per_sqyd: number | null };
type Props = { locale: Locale; sectors?: string[]; fixed?: Fixed; states?: boolean; title?: string; children?: ReactNode };

const unavailable = {
  en: {
    title: 'Stamp duty estimate unavailable',
    body: 'We have not verified an official schedule and effective date for this calculation. No rate or estimate is shown.',
  },
  hi: {
    title: 'स्टैंप ड्यूटी का अनुमान उपलब्ध नहीं',
    body: 'इस गणना के लिए आधिकारिक दर-सूची और लागू होने की तारीख सत्यापित नहीं है। कोई दर या अनुमान नहीं दिखाया गया है।',
  },
};

function Notice({ locale, title }: Pick<Props, 'locale' | 'title'>) {
  const copy = unavailable[locale];
  return (
    <section className="tool-sheet" role="status" aria-labelledby="stamp-duty-unavailable">
      <h2 id="stamp-duty-unavailable" className="tool-sheet-title">
        {title ?? copy.title}
      </h2>
      <p className="tool-note mt-1">{copy.body}</p>
    </section>
  );
}

export default function StampDuty({ locale, title }: Props) {
  return (
    <Island locale={locale}>
      <Notice locale={locale} title={title} />
    </Island>
  );
}
