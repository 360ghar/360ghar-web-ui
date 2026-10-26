import type { Locale } from '@/lib/i18n/locale';
import { localizePath } from '@/lib/i18n/locale';
import { Icon } from '@/ui/icons/Icon';

const T = {
  en: 'Own a home? List it with 360Ghar',
  hi: 'घर के मालिक हैं? 360Ghar पर लिस्ट करें',
};

/**
 * The owner CTA. It sits in the hero search foot on the lab pages, and on the
 * home page in its own quiet line below the card, where the search is one line.
 */
export function PostLink({ locale = 'en', className = 'link' }: { locale?: Locale; className?: string }) {
  return (
    <a className={className} href={localizePath('/post-property', locale)}>
      {T[locale]}
      <Icon name="arrow-up-right" size={16} className="arrow" />
    </a>
  );
}
