// Shared PostHog analytics service
// Handles dynamic import, initialization, session replay, and provides
// safe wrappers so callers never need to worry about PostHog availability.

import { isPrerendering } from '../utils/prerender';

let posthogInstance = null;
let initPromise = null;
let initialPageviewCaptured = false;

export async function init() {
  if (initPromise) return initPromise;

  initPromise = (async () => {
    if (isPrerendering()) return;
    if (!import.meta.env.PROD || !import.meta.env.VITE_PUBLIC_POSTHOG_KEY) return;

    try {
      const { default: posthog } = await import('posthog-js');
      posthog.init(import.meta.env.VITE_PUBLIC_POSTHOG_KEY, {
        api_host: import.meta.env.VITE_PUBLIC_POSTHOG_HOST,
        autocapture: false,
        capture_pageview: false,
        // Session Replay configuration
        session_recording: {
          maskAllInputs: true,
          maskTextClass: 'ph-mask',
          blockClass: 'ph-no-capture',
          recordHeaders: false,
          recordBody: false,
        },
        loaded: (ph) => {
          // Capture the initial pageview once PostHog is ready.
          // Subsequent pageviews are handled by RouteScrollToTop in App.jsx.
          ph.capture('$pageview');
          initialPageviewCaptured = true;
        },
      });
      posthogInstance = posthog;
    } catch {
      // Silently fail if PostHog cannot load
    }
  })();

  return initPromise;
}

export function captureEvent(name, properties = {}) {
  if (posthogInstance) {
    try {
      posthogInstance.capture(name, properties);
    } catch {
      // Silently fail
    }
  }
}

export function capturePageView() {
  if (!posthogInstance) return;
  // Skip the first route change — the initial pageview is captured
  // in the loaded() callback of posthog.init().
  if (!initialPageviewCaptured) return;
  try {
    posthogInstance.capture('$pageview');
  } catch {
    // Silently fail
  }
}

export function identifyUser(userId, userProperties = {}) {
  if (posthogInstance) {
    try {
      posthogInstance.identify(userId, userProperties);
    } catch {
      // Silently fail
    }
  }
}

export function resetUser() {
  if (posthogInstance) {
    try {
      posthogInstance.reset();
    } catch {
      // Silently fail
    }
  }
}
