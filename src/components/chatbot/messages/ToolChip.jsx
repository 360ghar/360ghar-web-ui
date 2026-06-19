import { useTranslation } from 'react-i18next';

// AUDIT FIX (5.5): map backend snake_case tool names to i18n keys so the
// chip labels are translated. Unknown tools fall back to a humanized version
// of the raw tool name.
const TOOL_LABEL_KEYS = {
  owner_properties_list: 'chatbot.tools.checkingProperties',
  owner_properties_create: 'chatbot.tools.creatingProperty',
  owner_properties_get: 'chatbot.tools.gettingPropertyDetails',
  owner_properties_update: 'chatbot.tools.updatingProperty',
  owner_properties_toggle_availability: 'chatbot.tools.updatingAvailability',
  tenant_lease_current: 'chatbot.tools.checkingLease',
  tenant_rent_history: 'chatbot.tools.checkingRentHistory',
  tenant_maintenance_create: 'chatbot.tools.creatingRequest',
  tenant_maintenance_list: 'chatbot.tools.checkingMaintenance',
  bookings_check_availability: 'chatbot.tools.checkingAvailability',
  bookings_get_pricing: 'chatbot.tools.gettingPricing',
  bookings_create: 'chatbot.tools.creatingBooking',
  bookings_list: 'chatbot.tools.checkingBookings',
  bookings_get: 'chatbot.tools.gettingBookingDetails',
  bookings_cancel: 'chatbot.tools.cancellingBooking',
  user_system_status: 'chatbot.tools.checkingStatus',
  agent_properties_list: 'chatbot.tools.listingProperties',
  agent_properties_get: 'chatbot.tools.gettingProperty',
  agent_properties_create_for_owner: 'chatbot.tools.creatingPropertyForOwner',
  agent_properties_verify: 'chatbot.tools.verifyingProperty',
  agent_leases_list: 'chatbot.tools.checkingLeases',
  agent_leases_create: 'chatbot.tools.creatingLease',
  agent_leases_terminate: 'chatbot.tools.terminatingLease',
  agent_rent_list_due: 'chatbot.tools.checkingOverdueRent',
  agent_rent_record_payment: 'chatbot.tools.recordingPayment',
  agent_maintenance_list: 'chatbot.tools.checkingMaintenance',
  agent_maintenance_update_status: 'chatbot.tools.updatingMaintenance',
  agent_bookings_list_all: 'chatbot.tools.checkingAllBookings',
  agent_bookings_update_status: 'chatbot.tools.updatingBooking',
  agent_dashboard_overview: 'chatbot.tools.loadingDashboard',
  admin_system_status: 'chatbot.tools.checkingSystem',
  discovery_search: 'chatbot.tools.searchingProperties',
  discovery_property_get: 'chatbot.tools.gettingProperty',
  discovery_feed: 'chatbot.tools.loadingFeed',
};

function humanize(snakeName) {
  return snakeName
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

// Spinner SVG for running state
function Spinner() {
  return (
    <svg className="chatbot-tool-chip__spinner" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 1 1-6.219-8.56"></path>
    </svg>
  );
}

// Checkmark SVG for done state
function CheckIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"></polyline>
    </svg>
  );
}

// X icon for error state
function ErrorIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );
}

export default function ToolChip({ toolCall }) {
  const { t } = useTranslation('common');
  const { tool, status, summary } = toolCall;
  const labelKey = TOOL_LABEL_KEYS[tool];
  const label = labelKey ? t(labelKey) : humanize(tool);

  return (
    <span
      className={`chatbot-tool-chip chatbot-tool-chip--${status}`}
      title={summary || label}
      aria-label={`${label}: ${status}`}
    >
      {status === 'running' && <Spinner />}
      {status === 'done' && <CheckIcon />}
      {status === 'error' && <ErrorIcon />}
      <span className="chatbot-tool-chip__label">{label}</span>
    </span>
  );
}
