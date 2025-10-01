import React, { useEffect } from 'react';
import { useUserStore } from '../store';

const AccountAddressTab = () => {
    const { profile, getProfile, isLoading, error } = useUserStore();

    useEffect(() => {
        getProfile();
    }, [getProfile]);

    const addressBlocks = [
        {
            title: 'Primary Address',
            name: profile?.full_name || '—',
            infos: [
                { title: 'Location:', text: profile?.full_address || [profile?.locality, profile?.city, profile?.state, profile?.pincode].filter(Boolean).join(', ') || '—' },
                { title: 'Email:', text: profile?.email || '—' },
                { title: 'Phone:', text: profile?.phone || '—' },
            ],
        },
    ];

    return (
        <>
            <p className="account-alert">Your saved contact and address details.</p>
            {isLoading && <div className="py-3">Loading address...</div>}
            {error && !isLoading && <div className="alert alert-danger">{error}</div>}
            {!isLoading && (
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