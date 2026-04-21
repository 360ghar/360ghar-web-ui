import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useI18nNavigate } from '../../i18n/I18nLink';
import { useAuthStore } from '../../store';

const Logout = ({ redirectTo = '/login' }) => {
  const { logout } = useAuthStore();
  const navigate = useI18nNavigate();
  const { t } = useTranslation('account');

  useEffect(() => {
    const executeLogout = async () => {
      await logout();
      navigate(redirectTo);
    };
    void executeLogout();
  }, [logout, navigate, redirectTo]);

  return (
    <div className="text-center py-5">
      <p>{t('logout.loggingOut')}</p>
    </div>
  );
};

export default Logout;
