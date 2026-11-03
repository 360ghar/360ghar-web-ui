// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import cloudflare from '@astrojs/cloudflare';
import tailwindcss from '@tailwindcss/vite';

// The old site's Netlify variables (VITE_*) still work: copy them to the new names.
const OLD_NAMES = {
  PUBLIC_SUPABASE_URL: 'VITE_SUPABASE_URL',
  PUBLIC_SUPABASE_PUBLISHABLE_KEY: 'VITE_SUPABASE_PUBLISHABLE_KEY',
  PUBLIC_POSTHOG_KEY: 'VITE_PUBLIC_POSTHOG_KEY',
  PUBLIC_POSTHOG_HOST: 'VITE_PUBLIC_POSTHOG_HOST',
  PUBLIC_GOOGLE_MAPS_API_KEY: ['VITE_GOOGLE_MAPS_API_KEY', 'VITE_GOOGLE_PLACES_API_KEY'],
  API_ORIGIN: 'VITE_API_SERVER',
};
for (const [name, old] of Object.entries(OLD_NAMES)) {
  const legacy = [old].flat().map((k) => process.env[k]).find(Boolean);
  if (!process.env[name] && legacy) process.env[name] = legacy;
}

const API_ORIGIN = process.env.API_ORIGIN ?? 'https://api.360ghar.com';

// Vitest loads this config through astro/config's getViteConfig, and the Cloudflare
// Vite plugin rejects Vitest's default `ssr` resolve.external list. Tests are unit
// tests and never exercise the adapter, so it is omitted under Vitest only.
const isVitest = process.env.VITEST === 'true';

export default defineConfig({
  site: 'https://360ghar.com',
  trailingSlash: 'never',
  build: { format: 'file' },
  // Nothing reads Astro.session, so sessions are switched off entirely: the
  // adapter would otherwise wire its default KV session driver on deploy.
  session: false,
  adapter: isVitest
    ? undefined
    : cloudflare({
        // Images stay on Cloudinary: 'passthrough' avoids the Cloudflare Images binding.
        imageService: 'passthrough',
      }),
  integrations: [react()],
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    plugins: [
      tailwindcss(),
      // sanitize-html is CommonJS and requires htmlparser2, which is ESM only. Leaving it
      // external breaks the SSR bundle at runtime (workerd cannot require an ESM-only
      // package from CJS), and /blog/<slug> falls through to the 404 route. Build only:
      // in dev the bundled CommonJS copy fails to load, and dev resolves it fine.
      { name: 'bundle-sanitize-html', config: (_, { command }) => (command === 'build' ? { ssr: { noExternal: ['sanitize-html'] } } : {}) },
    ],
    // Dev only: pre-bundle modules that load lazily, so Vite does not re-optimise mid-session.
    optimizeDeps: {
      include: [
        'react-dom/client',
        '@tanstack/react-query',
        'zustand',
        'zustand/middleware',
        'react-hook-form',
        'zod',
        '@hookform/resolvers/zod',
        'openapi-fetch',
        'web-vitals',
        'posthog-js',
        '@supabase/supabase-js',
      ],
      // CI only: runtime discovery re-optimises deps when a cold route imports
      // something new, which bumps the ?v= hash on .vite/deps and fails the
      // dynamic imports of every page loaded before the bump (the e2e burst of
      // "Failed to fetch ... web-vitals.js?v=..."). The include list already
      // covers every client dependency, so discovery has nothing to add there;
      // disabling it keeps the hash stable for the whole run. Local dev keeps
      // discovery.
      noDiscovery: process.env.CI === 'true',
    },
    server: {
      // CI e2e: a late dependency re-optimisation raises the error overlay, which blocks clicks. Page errors still fail the tests (watch()).
      hmr: process.env.CI ? { overlay: false } : undefined,
      proxy: {
        // Local dev only: the browser calls /dev-api/api/v1/... (PUBLIC_API_BASE=/dev-api).
        // A separate prefix keeps the Vite proxy out of the production API origin's way.
        '/dev-api': {
          target: API_ORIGIN,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
        },
      },
    },
  },
});
