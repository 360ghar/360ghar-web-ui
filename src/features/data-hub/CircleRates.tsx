/** Unavailable state shared by the circle-rate directory and detail pages. */
import type { Locale } from '@/lib/i18n/locale';
import { text } from './text';

type Props = { locale: Locale };

export default function CircleRates({ locale }: Props) {
  const t = text(locale);

  return (
    <section className="tool-sheet" role="status" aria-label={t.crUnavailableTitle}>
      <p className="tool-note">{t.crUnavailableBody}</p>
    </section>
  );
}
