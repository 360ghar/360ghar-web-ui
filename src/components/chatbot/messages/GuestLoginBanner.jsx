import { I18nLink } from '../../../i18n/I18nLink';

export default function GuestLoginBanner() {
  return (
    <div className="chatbot-guest-banner">
      <span className="chatbot-guest-banner__text">
        Sign in for visits, rent tracking &amp; more
      </span>
      <I18nLink to="/login" className="chatbot-guest-banner__link">
        Sign In
      </I18nLink>
    </div>
  );
}
