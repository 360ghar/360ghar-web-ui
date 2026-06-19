import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuthStore } from '../../store';
import { useI18nNavigate } from '../../i18n/I18nLink';
import AccountHomeTab from './AccountHomeTab';
import AccountProfileTab from './AccountProfileTab';
import AccountAddressTab from './AccountAddressTab';
import AccountDetailsTab from './AccountDetailsTab';
import AccountMyPropertyTab from './AccountMyPropertyTab';
import AccountFavoritePropertyTab from './AccountFavoritePropertyTab';
import AccountChangePasswordTab from './AccountChangePasswordTab';

const tabDefinitions = [
  { key: 'home', labelKey: 'account.tabs.home', icon: 'fas fa-home', Component: AccountHomeTab },
  { key: 'profile', labelKey: 'account.tabs.profile', icon: 'fas fa-user', Component: AccountProfileTab },
  { key: 'address', labelKey: 'account.tabs.address', icon: 'fas fa-map-marker-alt', Component: AccountAddressTab },
  { key: 'details', labelKey: 'account.tabs.details', icon: 'fas fa-id-card', Component: AccountDetailsTab },
  { key: 'my-properties', labelKey: 'account.tabs.myProperties', icon: 'fas fa-list', Component: AccountMyPropertyTab },
  { key: 'favorites', labelKey: 'account.tabs.favorites', icon: 'fas fa-heart', Component: AccountFavoritePropertyTab },
  { key: 'change-password', labelKey: 'account.tabs.changePassword', icon: 'fas fa-lock', Component: AccountChangePasswordTab },
];

const aliasToKey = {
  favourites: 'favorites',
  favorite: 'favorites',
  fav: 'favorites',
  properties: 'my-properties',
  myproperties: 'my-properties',
  'account-details': 'details',
  accountdetails: 'details',
  changepassword: 'change-password',
  password: 'change-password',
  visits: 'home',
  visit: 'home',
};

const AccountSection = () => {
  const navigate = useI18nNavigate();
  const [searchParams] = useSearchParams();
  const { logout } = useAuthStore();
  const { t } = useTranslation('account');

  const tabKeys = useMemo(() => tabDefinitions.map((tab) => tab.key), []);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  React.useEffect(() => {
    const raw = (searchParams.get('tab') || '').toLowerCase();
    const normalized = aliasToKey[raw] || raw || 'home';
    const nextIndex = tabKeys.indexOf(normalized);
    setSelectedIndex(nextIndex >= 0 ? nextIndex : 0);
  }, [searchParams, tabKeys]);

  const handleSelect = (index) => {
    setSelectedIndex(index);
    const key = tabKeys[index] || 'home';
    const params = new URLSearchParams(searchParams);
    params.set('tab', key);
    navigate(`?${params.toString()}`, { replace: true });
  };

  const handleLogout = async () => {
    // Await logout so isAuthenticated is cleared before navigating, avoiding
    // a race with PrivateRoute guards.
    await logout();
    toast.success(t('account.loggedOut'), { theme: 'colored' });
    navigate('/login');
  };

  return (
    <>
      <section className="account padding-y-120">
        <div className="container container-two">
          <Tabs selectedIndex={selectedIndex} onSelect={handleSelect}>
            <div className="row gy-4">
              <div className="col-12 col-lg-4 col-xl-3">
                <div className="account-sidebar search-sidebar account-sidebar--sticky">
                  <TabList className="nav side-tab flex-lg-column flex-row nav-pills me-lg-3 mb-0">
                    {tabDefinitions.map((tab) => (
                      <Tab className="nav-link" key={tab.key}>
                        <span className="icon">
                          <i className={tab.icon} aria-hidden="true"></i>
                        </span>
                        <span>{t(tab.labelKey)}</span>
                      </Tab>
                    ))}
                  </TabList>
                  <button type="button" className="nav-link account-logout-btn" onClick={() => void handleLogout()}>
                    <span className="icon">
                      <i className="fas fa-sign-out-alt" aria-hidden="true"></i>
                    </span>
                    <span>{t('account.logout')}</span>
                  </button>
                </div>
              </div>

              <div className="col-12 col-lg-8 col-xl-9">
                {tabDefinitions.map(({ key, Component }) => (
                  <TabPanel key={key}>
                    <Component />
                  </TabPanel>
                ))}
              </div>
            </div>
          </Tabs>
        </div>
      </section>
    </>
  );
};

export default AccountSection;
