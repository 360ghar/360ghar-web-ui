import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { accountTabs } from '../data/OthersPageData/OthersPageData';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccountHomeTab from './AccountHomeTab';
import AccountProfileTab from './AccountProfileTab';
import AccountAddressTab from './AccountAddressTab';
import AccountDetailsTab from './AccountDetailsTab';
import AccountMyPropertyTab from './AccountMyPropertyTab';
import AccountFavoritePropertyTab from './AccountFavoritePropertyTab';
import AccountAddPropertyTab from './AccountAddPropertyTab';
import AccountChangePasswordTab from './AccountChangePasswordTab';
import { ToastContainer, toast } from 'react-toastify';
import { useAuthStore } from '../store';

const AccountSection = () => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { logout } = useAuthStore();

    const notify = () => toast.success("You have been logged out", {
        theme: "colored", 
    })

    const handleRedirectLogin = () => {
        logout();
        navigate('/login');
    }
    
    // Control selected tab via URL param (?tab=...)
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const tabKeys = [
        'home',
        'profile',
        'address',
        'details',
        'my-properties',
        'favorites',
        'add-property',
        'change-password',
    ];

    React.useEffect(() => {
        const raw = (searchParams.get('tab') || '').toLowerCase();
        if (!raw) return;

        const aliasToKey = {
            favourites: 'favorites',
            favorite: 'favorites',
            fav: 'favorites',
            properties: 'my-properties',
            myproperties: 'my-properties',
            'account-details': 'details',
            accountdetails: 'details',
            addproperty: 'add-property',
            add: 'add-property',
            changepassword: 'change-password',
            password: 'change-password',
            visits: 'home', // no dedicated visits tab yet; send to home where visits summary lives
            visit: 'home',
        };

        const key = aliasToKey[raw] || raw;
        const idx = tabKeys.indexOf(key);
        setSelectedIndex(idx >= 0 ? idx : 0);
    }, [searchParams]);

    const handleSelect = (index) => {
        setSelectedIndex(index);
        const key = tabKeys[index] || 'home';
        navigate(`?tab=${key}`, { replace: true });
    };
    
    return (
        <>
            <ToastContainer />
            <section className="account padding-y-120">
                <div className="container container-two">
                    <Tabs selectedIndex={selectedIndex} onSelect={handleSelect}>
                        <div className="row gy-4">
                            <div className="col-xl-3 col-lg-4">
                                <div className="account-sidebar search-sidebar">
                                    <TabList className="nav side-tab flex-column nav-pills me-3">
                                        {
                                            accountTabs.map((accountTab, accountTabIndex) => {
                                                return (
                                                    <Tab className={'nav-link'} key={accountTabIndex}>
                                                        <span className="icon">{accountTab.icon}</span>
                                                        {accountTab.text}
                                                    </Tab>
                                                )
                                            })
                                        }
                                        <button type='button' className="nav-link" onClick={()=>{notify(); handleRedirectLogin();}}> 
                                            <span className="icon"> <i className="fas fa-sign-out-alt"></i></span>  
                                            Logout
                                        </button>
                                    </TabList>
                                </div>
                            </div>

                            <div className="col-xl-9 col-lg-8">
                                <TabPanel>
                                    <AccountHomeTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountProfileTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountAddressTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountDetailsTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountMyPropertyTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountFavoritePropertyTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountAddPropertyTab/>
                                </TabPanel>
                                <TabPanel>
                                    <AccountChangePasswordTab/>
                                </TabPanel>
                            </div>
                        </div>
                    </Tabs>
                </div>
            </section>
        </>
    );
};

export default AccountSection;