// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import netlify from '@astrojs/netlify';
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
// Without these keys sign-in, the account and post property fail with no error on the page.
if (process.env.NETLIFY === 'true' && (!process.env.PUBLIC_SUPABASE_URL || !process.env.PUBLIC_SUPABASE_PUBLISHABLE_KEY)) {
  throw new Error('Set PUBLIC_SUPABASE_URL and PUBLIC_SUPABASE_PUBLISHABLE_KEY (or the old VITE_SUPABASE_* names) in Netlify.');
}

const API_ORIGIN = process.env.API_ORIGIN ?? 'https://api.360ghar.com';

export default defineConfig({
  site: 'https://360ghar.com',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'always' },
  adapter: netlify({
    imageCDN: false,
    // Local dev uses the Vite proxy; the Netlify emulation proxied /api via netlify.toml and broke gzip bodies.
    devFeatures: false,
  }),
  integrations: [react()],
  devToolbar: { enabled: false },
  prefetch: { prefetchAll: false, defaultStrategy: 'hover' },
  vite: {
    plugins: [
      tailwindcss(),
      // sanitize-html is CommonJS and requires htmlparser2, which is ESM only. Netlify runs functions with
      // --no-experimental-require-module, so loading it from node_modules throws and /blog/<slug> fell through to the 404 route.
      // Build only: in dev the bundled CommonJS copy fails to load, and dev runs on plain Node where require(esm) works.
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
    },
    server: {
      // CI e2e: a late dependency re-optimisation raises the error overlay, which blocks clicks. Page errors still fail the tests (watch()).
      hmr: process.env.CI ? { overlay: false } : undefined,
      proxy: {
        // Local dev only: the browser calls /dev-api/api/v1/... (PUBLIC_API_BASE=/dev-api).
        // A separate prefix keeps the Netlify dev plugin's netlify.toml proxy out of the way.
        '/dev-api': {
          target: API_ORIGIN,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/dev-api/, ''),
        },
      },
    },
  },
});
