import { Link } from 'react-router-dom';

export default function GuestLoginBanner() {
  return (
    <div className="chatbot-guest-banner">
      <span className="chatbot-guest-banner__text">
        Sign in for visits, rent tracking &amp; more
      </span>
      <Link to="/login" className="chatbot-guest-banner__link">
        Sign In
      </Link>
    </div>
  );
}
