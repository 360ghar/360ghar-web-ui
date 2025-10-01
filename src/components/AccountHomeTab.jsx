import React, { useEffect } from 'react';
import { useAuthStore, useVisitStore } from '../store';

const AccountHomeTab = () => {
  const { user } = useAuthStore();
  const { upcomingVisits, getUpcomingVisits } = useVisitStore();

  useEffect(() => {
    getUpcomingVisits();
  }, [getUpcomingVisits]);

  return (
    <>
      <p className="account-alert">
        Hello <strong className="text-heading fw-500 text-poppins">{user?.full_name || 'Guest'}</strong>
      </p>
      <p className="account-alert">
        Upcoming visits: <strong>{upcomingVisits?.length || 0}</strong>
      </p>
    </>
  );
};

export default AccountHomeTab;