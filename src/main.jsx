import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.scss'
import './i18n'
import { HelmetProvider } from 'react-helmet-async'
import { reportWebVitals } from './seo/reportWebVitals'
import LazyToastProvider from './common/LazyToast.jsx'
import * as posthogService from './services/posthogService'
import { isPrerendering } from './utils/prerender'

// Lazy load analytics after initial render
const loadAnalytics = () => {
  if (isPrerendering()) {
    return
  }

  // Load PostHog (includes session replay)
  posthogService.init()
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <LazyToastProvider>
      <App />
    </LazyToastProvider>
  </HelmetProvider>
)

// Load analytics after app renders and is idle
if ('requestIdleCallback' in window) {
  requestIdleCallback(loadAnalytics)
} else {
  // Fallback for Safari
  setTimeout(loadAnalytics, 2000)
}

// Start measuring Core Web Vitals after paint
requestAnimationFrame(() => {
  reportWebVitals()
})

// ── WebMCP: Register site tools for AI agent discovery ──────────────────────
// Exposes key 360Ghar actions to AI agents via the browser.
// See: https://webmachinelearning.github.io/webmcp/
// Only runs if the browser supports the WebMCP API.
if (navigator.modelContext?.registerTool) {
  const controller = new AbortController();

  navigator.modelContext.registerTool(
    {
      name: 'search_properties',
      description: 'Search verified property listings on 360Ghar by city, type, budget, and amenities',
      inputSchema: {
        type: 'object',
        properties: {
          query: { type: 'string', description: 'Text search query, e.g. "2 BHK in DLF Phase 3"' },
          city: { type: 'string', description: 'City filter, e.g. "gurgaon"' },
          purpose: { type: 'string', enum: ['buy', 'rent', 'pg'], description: 'Transaction purpose' },
          price_max: { type: 'number', description: 'Maximum budget in INR' },
          bedrooms_min: { type: 'integer', description: 'Minimum number of bedrooms' },
        },
      },
      execute: async (input) => {
        const params = new URLSearchParams();
        if (input.query) params.set('q', input.query);
        if (input.city) params.set('city', input.city);
        if (input.purpose) params.set('purpose', input.purpose);
        if (input.price_max) params.set('price_max', String(input.price_max));
        if (input.bedrooms_min) params.set('bedrooms_min', String(input.bedrooms_min));
        const url = `https://api.360ghar.com/api/v1/properties/?${params.toString()}`;
        const res = await fetch(url);
        return res.json();
      },
    },
    { signal: controller.signal }
  );

  navigator.modelContext.registerTool(
    {
      name: 'schedule_visit',
      description: 'Schedule a property visit on 360Ghar (requires user to be logged in)',
      inputSchema: {
        type: 'object',
        properties: {
          property_id: { type: 'string', description: 'ID of the property to visit' },
          scheduled_date: { type: 'string', description: 'Date for the visit (YYYY-MM-DD)' },
          special_requirements: { type: 'string', description: 'Any special requirements for the visit' },
        },
        required: ['property_id', 'scheduled_date'],
      },
      execute: async (_input) => {
        return { message: 'Please visit https://360ghar.com/mcp/login to authenticate, then schedule a visit via the API at POST /visits/' };
      },
    },
    { signal: controller.signal }
  );

  navigator.modelContext.registerTool(
    {
      name: 'calculate_emi',
      description: 'Calculate home loan EMI (Equated Monthly Installment)',
      inputSchema: {
        type: 'object',
        properties: {
          principal: { type: 'number', description: 'Loan amount in INR' },
          rate: { type: 'number', description: 'Annual interest rate (e.g. 8.5 for 8.5%)' },
          tenure_years: { type: 'integer', description: 'Loan tenure in years' },
        },
        required: ['principal', 'rate', 'tenure_years'],
      },
      execute: async (input) => {
        const p = input.principal;
        const r = input.rate / 12 / 100;
        const n = input.tenure_years * 12;
        if (r === 0) return { emi: p / n, total_payment: p, total_interest: 0 };
        const emi = (p * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        return { emi: Math.round(emi), total_payment: Math.round(totalPayment), total_interest: Math.round(totalPayment - p) };
      },
    },
    { signal: controller.signal }
  );
}
