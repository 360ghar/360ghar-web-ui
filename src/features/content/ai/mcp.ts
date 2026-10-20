/**
 * The tools of the user MCP server (https://api.360ghar.com/mcp), read from the
 * backend: 360ghar-backend/app/mcp/user/*.py and app/mcp/chatgpt/*.py
 * (@user_mcp.tool names, annotation titles, docstrings). `open` marks tools
 * with MCP_SECURITY_SCHEMES_MIXED, which work without signing in.
 * Update this list when the backend adds or renames a tool.
 */
export const MCP_URL = 'https://api.360ghar.com/mcp';

type McpTool = { name: string; title: string; does: string; open?: boolean };
type McpGroup = { key: 'discovery' | 'visits' | 'stays' | 'listings' | 'rentals' | 'tenant' | 'system'; tools: McpTool[] };

export const MCP_GROUPS: McpGroup[] = [
  {
    key: 'discovery',
    tools: [
      { name: 'discovery_search', title: 'Search Properties', does: 'Search properties with comprehensive filtering.', open: true },
      { name: 'discovery_property_get', title: 'Get Property Details', does: 'Get detailed information about a property.', open: true },
      { name: 'discovery_feed', title: 'Property Discovery Feed', does: 'Get a discovery feed of properties for swipe-style browsing.', open: true },
      { name: 'discovery_amenities', title: 'List Property Amenities', does: 'Get the list of available amenities for filtering.', open: true },
      { name: 'discovery_recommendations', title: 'Get Property Recommendations', does: 'Get property recommendations based on your preferences.' },
      { name: 'discovery_shortlist', title: 'View Shortlisted Properties', does: 'Get your shortlisted (liked) properties.' },
      { name: 'discovery_swipe', title: 'Like or Pass Property', does: 'Record a like or pass on a property.' },
    ],
  },
  {
    key: 'visits',
    tools: [
      { name: 'visits_schedule', title: 'Schedule Property Visit', does: 'Schedule a property visit.' },
      { name: 'visits_list', title: 'List My Visits', does: 'List your property visits.' },
      { name: 'visits_get', title: 'Get Visit Details', does: 'Get details of a specific visit.' },
      { name: 'visits_cancel', title: 'Cancel Visit', does: 'Cancel a scheduled property visit.' },
    ],
  },
  {
    key: 'stays',
    tools: [
      { name: 'bookings_check_availability', title: 'Check Booking Availability', does: 'Check if a property is available for booking.', open: true },
      { name: 'bookings_get_pricing', title: 'Get Booking Pricing', does: 'Get pricing details for a potential booking.', open: true },
      { name: 'bookings_create', title: 'Create Booking', does: 'Create a new booking for a short-stay property.' },
      { name: 'bookings_list', title: 'List My Bookings', does: 'List your bookings.' },
      { name: 'bookings_get', title: 'Get Booking Details', does: 'Get details of a specific booking.' },
      { name: 'bookings_cancel', title: 'Cancel Booking', does: 'Cancel a booking.' },
    ],
  },
  {
    key: 'listings',
    tools: [
      { name: 'owner_properties_list', title: 'List My Properties', does: 'List all properties you own.' },
      { name: 'owner_properties_create', title: 'Create Property Listing', does: 'Create a new property listing.' },
      { name: 'owner_properties_get', title: 'Get Property Details (Owner)', does: 'Get detailed information about one of your properties.' },
      { name: 'owner_properties_update', title: 'Update Property Listing', does: 'Update one of your properties.' },
      { name: 'owner_properties_toggle_availability', title: 'Toggle Property Availability', does: "Turn a property's availability on or off." },
    ],
  },
  {
    key: 'rentals',
    tools: [
      { name: 'owner_dashboard_overview', title: 'Property Owner Dashboard', does: 'Get a dashboard overview for property owners.' },
      { name: 'owner_rent_status', title: 'View Rent Collection Status', does: 'View rent charges and collection totals.' },
      { name: 'owner_rent_record_payment', title: 'Record Rent Payment', does: 'Record a rent payment against an outstanding charge.' },
      { name: 'owner_rent_history', title: 'View Payment History', does: "View rent payment history for your properties." },
      { name: 'owner_leases_list', title: 'List Property Leases', does: "List leases for your properties." },
      { name: 'owner_leases_get', title: 'Get Lease Details', does: 'Get lease details for an owner or tenant.' },
      { name: 'owner_leases_terminate', title: 'Terminate Lease', does: 'Terminate an active lease early.' },
      { name: 'owner_maintenance_list', title: 'List Maintenance Requests', does: "List maintenance requests for your properties." },
      { name: 'owner_maintenance_update', title: 'Update Maintenance Request', does: 'Update maintenance status, schedule, vendor, costs or resolution notes.' },
    ],
  },
  {
    key: 'tenant',
    tools: [
      { name: 'tenant_lease_current', title: 'View My Current Lease', does: 'Get your current active lease.' },
      { name: 'tenant_rent_dues', title: 'View My Rent Dues', does: 'View your current rent dues.' },
      { name: 'tenant_rent_history', title: 'View My Rent Payment History', does: 'Get your rent payment history.' },
      { name: 'tenant_maintenance_create', title: 'Create Maintenance Request', does: "Submit a maintenance request for a property you rent." },
      { name: 'tenant_maintenance_list', title: 'List My Maintenance Requests', does: 'List the maintenance requests you submitted.' },
    ],
  },
  {
    key: 'system',
    tools: [{ name: 'user_system_status', title: 'System Status', does: 'Get system status and the available user features.', open: true }],
  },
];

export const MCP_TOOLS = MCP_GROUPS.flatMap((g) => g.tools);
