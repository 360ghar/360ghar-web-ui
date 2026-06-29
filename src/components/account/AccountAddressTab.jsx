import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useUserStore } from '../../store';

const AccountAddressTab = () => {
    const { profile, getProfile, isProfileLoading, error } = useUserStore();
    const { t } = useTranslation('account');

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    const addressBlocks = [
        {
            title: t('tabs.address.primaryAddress'),
            name: profile?.full_name || '\u2014',
            infos: [
                { title: t('tabs.address.location'), text: profile?.full_address || [profile?.locality, profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(', ') || '\u2014' },
                { title: t('tabs.address.email'), text: profile?.email || '\u2014' },
                { title: t('tabs.address.phone'), text: profile?.phone || '\u2014' },
            ],
        },
    ];

    return (
        <>
            <p className="account-alert">{t('tabs.address.description')}</p>
            {isProfileLoading && <div className="py-3">{t('tabs.address.loading')}</div>}
            {error && !isProfileLoading && <div className="alert alert-danger">{error}</div>}
            {!isProfileLoading && (
                <div className="row gy-4">
                    {addressBlocks.map((block, idx) => (
                        <div className="col-sm-6" key={idx}>
                            <div className="card common-card">
                                <div className="card-body">
                                    <h6 className="text-poppins mb-2">{block.title}</h6>
                                    <span className="fw-semibold text-poppins font-14 mb-4">{block.name}</span>
                                    {block.infos.map((info, i) => (
                                        <div className="contact-info d-flex gap-3 align-items-center mb-2" key={i}>
                                            <div className="contact-info__content">
                                                <span className="contact-info__address">
                                                    <strong className="fw-500">{info.title}</strong>
                                                    {info.text}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
};

export default AccountAddressTab;
