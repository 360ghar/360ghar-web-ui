import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useVisitStore } from '../../store';

const AccountHomeTab = () => {
  const { user } = useAuthStore();
  const { upcomingVisits, getUpcomingVisits } = useVisitStore();
  const { t } = useTranslation('account');

  const profileCompleteness = [
    Boolean(user?.full_name),
    Boolean(user?.email),
    Boolean(user?.phone),
  ].filter(Boolean).length;

  const completionPercent = Math.round((profileCompleteness / 3) * 100);

  useEffect(() => {
    getUpcomingVisits();
  }, [getUpcomingVisits]);

  return (
    <>
      <div className="account-home-grid">
        <div className="account-alert account-alert--welcome">
          {t('tabs.home.hello')} <strong className="text-heading fw-500 text-poppins">{user?.full_name || t('tabs.home.guest')}</strong>
          <span className="d-block mt-1 text-muted">{t('tabs.home.manageDesc')}</span>
        </div>
        <div className="account-alert account-alert--metric">
          <span className="account-alert__label">{t('tabs.home.upcomingVisits')}</span>
          <strong className="account-alert__value">{upcomingVisits?.length || 0}</strong>
        </div>
        <div className="account-alert account-alert--metric">
          <span className="account-alert__label">{t('tabs.home.profileCompletion')}</span>
          <strong className="account-alert__value">{completionPercent}%</strong>
        </div>
      </div>
    </>
  );
};

export default AccountHomeTab;
