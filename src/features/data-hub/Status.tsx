/** Status badge for RERA, zone, builder and auction rows. Static markup: server pages import it without pulling in an island. */
import type { Locale } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';
import { label, text } from './text';

export function Status({ value, locale }: { value: string | null | undefined; locale: Locale }) {
  if (!value) return null;
  const v = value.toLowerCase();
  const tone = v === 'registered' || v === 'completed' || v === 'approved' ? 'is-good' : v === 'lapsed' || v === 'revoked' || v === 'rejected' ? 'is-bad' : v === 'pending' ? 'is-wait' : 'is-plain';
  const t = text(locale);
  return (
    <span className={`dh-status ${tone}`}>
      <Icon name={tone === 'is-good' ? 'check' : tone === 'is-bad' ? 'alert' : 'clock'} size={16} />
      {label({ ...t.statuses, ...t.approval }, v)}
    </span>
  );
}
