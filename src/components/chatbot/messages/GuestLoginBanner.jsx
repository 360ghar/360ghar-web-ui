import { useTranslation } from 'react-i18next';
import { I18nLink } from '../../../i18n/I18nLink';

export default function GuestLoginBanner() {
  const { t } = useTranslation('common');
  return (
    <div className="chatbot-guest-banner">
      <span className="chatbot-guest-banner__text">
        {t('chatbot.guestBannerText')}
      </span>
      <I18nLink to="/login" className="chatbot-guest-banner__link">
        {t('chatbot.guestBannerCta')}
      </I18nLink>
    </div>
  );
}
