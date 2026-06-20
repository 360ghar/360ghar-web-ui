import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore, useVisitStore } from '../../store';
import { Link } from 'react-router-dom';

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
    <div className="account-home-dashboard">
      <div className="card common-card mb-4" style={{ background: 'linear-gradient(135deg, var(--main-color-lighter) 0%, var(--bg-white) 100%)', border: '1px solid var(--border-color-light)' }}>
        <div className="card-body p-4 d-flex align-items-center gap-4">
          <div className="icon-wrapper d-none d-sm-flex align-items-center justify-content-center rounded-circle" style={{ width: '60px', height: '60px', background: 'var(--main-color)', color: 'var(--bg-white)', fontSize: '1.5rem' }}>
            <i className="fas fa-user"></i>
          </div>
          <div>
            <h4 className="mb-1">{t('tabs.home.hello')} <span className="text-main fw-bold">{user?.full_name || t('tabs.home.guest')}</span>!</h4>
            <p className="text-muted mb-0">{t('tabs.home.manageDesc')}</p>
          </div>
        </div>
      </div>

      <div className="row gy-4">
        <div className="col-md-6">
          <div className="card common-card h-100" style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
            <div className="card-body p-4 text-center d-flex flex-column justify-content-center align-items-center">
              <div className="icon-wrapper mb-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', background: 'rgba(3, 105, 161, 0.1)', color: 'var(--cta-color)', fontSize: '1.8rem' }}>
                <i className="fas fa-calendar-check"></i>
              </div>
              <h2 className="mb-1 fw-bold text-heading">{upcomingVisits?.length || 0}</h2>
              <span className="text-muted fw-medium">{t('tabs.home.upcomingVisits')}</span>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card common-card h-100" style={{ transition: 'transform 0.2s ease, box-shadow 0.2s ease' }}>
            <div className="card-body p-4 text-center d-flex flex-column justify-content-center align-items-center">
              <div className="icon-wrapper mb-3 rounded-circle d-flex align-items-center justify-content-center" style={{ width: '64px', height: '64px', background: 'rgba(40, 167, 69, 0.1)', color: 'var(--success-color)', fontSize: '1.8rem' }}>
                <i className="fas fa-user-shield"></i>
              </div>
              <h2 className="mb-1 fw-bold text-heading">{completionPercent}%</h2>
              <span className="text-muted fw-medium">{t('tabs.home.profileCompletion')}</span>
              <div className="progress w-75 mt-3" style={{ height: '6px', borderRadius: '4px' }}>
                <div className="progress-bar" role="progressbar" style={{ width: `${completionPercent}%`, backgroundColor: 'var(--success-color)' }} aria-valuenow={completionPercent} aria-valuemin="0" aria-valuemax="100"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions for Admin/Agent ease of use */}
        <div className="col-12 mt-4">
          <h5 className="mb-3 text-heading fw-bold">Quick Actions</h5>
          <div className="row gy-3">
            <div className="col-sm-6 col-lg-4">
              <Link to="/post-property" className="card common-card text-decoration-none h-100">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'var(--bg-light)', color: 'var(--text-primary)' }}>
                    <i className="fas fa-plus"></i>
                  </div>
                  <span className="text-heading fw-medium">Post Property</span>
                </div>
              </Link>
            </div>
            <div className="col-sm-6 col-lg-4">
              <Link to="/account?tab=profile" className="card common-card text-decoration-none h-100">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'var(--bg-light)', color: 'var(--text-primary)' }}>
                    <i className="fas fa-edit"></i>
                  </div>
                  <span className="text-heading fw-medium">Edit Profile</span>
                </div>
              </Link>
            </div>
            <div className="col-sm-6 col-lg-4">
              <Link to="/account?tab=my-properties" className="card common-card text-decoration-none h-100">
                <div className="card-body p-3 d-flex align-items-center gap-3">
                  <div className="rounded-circle d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px', background: 'var(--bg-light)', color: 'var(--text-primary)' }}>
                    <i className="fas fa-list"></i>
                  </div>
                  <span className="text-heading fw-medium">Manage Listings</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccountHomeTab;
