import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import crypto from "node:crypto";
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to defer the main entry CSS chunk so it does not block first paint.
// (Bootstrap/Font Awesome are already deferred via media="print" in index.html. CSS that
// Vite injects into prerendered pages is re-deferred post-capture in the prerender script —
// see scripts/prerender-pages.mjs `reDeferCss`.)
const deferEntryCssPlugin = () => ({
  name: "defer-entry-css",
  transformIndexHtml(html) {
    return html.replace(
      /<link rel="stylesheet"([^>]*)href="(\/assets\/index-[a-zA-Z0-9_-]+\.css)"([^>]*)>/,
      (match, before, href, after) => {
        return `<link rel="preload" as="style"${before}href="${href}"${after} onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`;
      }
    );
  },
});

// Write dist/.vite-build-hash after the build so the prerender cache can bust
// when the compiled bundle changes. The hash is computed over the built
// index.html plus the names+sizes of every hashed asset under /assets/. It is
// a content proxy (filename+size, not file bytes) which is sufficient to
// detect any deploy that changed the bundle, and cheap to compute.
const writeViteBuildHash = () => ({
  name: "write-vite-build-hash",
  apply: "build",
  closeBundle() {
    const distDir = path.join(__dirname, "dist");
    const assetsDir = path.join(distDir, "assets");
    const hash = crypto.createHash("sha256");
    try {
      hash.update(readFileSync(path.join(distDir, "index.html"), "utf-8"));
    } catch {
      // dist/index.html missing — nothing meaningful to hash; bail.
      return;
    }
    try {
      for (const name of readdirSync(assetsDir).sort()) {
        const full = path.join(assetsDir, name);
        try {
          const st = statSync(full);
          if (st.isFile()) hash.update(`${name}:${st.size};`);
        } catch {
          // skip unreadable entries
        }
      }
    } catch {
      // assets dir missing — proceed with index.html-only hash
    }
    try {
      writeFileSync(path.join(distDir, ".vite-build-hash"), hash.digest("hex"));
    } catch {
      // best-effort; never fail the build over the hash file
    }
  },
});

// Make PWA service-worker registration non-blocking
const asyncRegisterSW = () => ({
  name: "async-register-sw",
  apply: "build",
  closeBundle() {
    const indexPath = path.join(__dirname, "dist", "index.html");
    let html;
    try {
      html = readFileSync(indexPath, "utf-8");
    } catch {
      return;
    }
    const processed = html.replace(
      /<script id="vite-plugin-pwa:register-sw" src="\/registerSW\.js"><\/script>/,
      `<script id="vite-plugin-pwa:register-sw" src="/registerSW.js" async></script>`
    );
    writeFileSync(indexPath, processed);
  },
});

// NOTE: modulepreload hints are disabled via `build.modulePreload = false` below.
// Vite otherwise injects (at build time AND at runtime via the preload helper) one
// modulepreload per transitive dep of every dynamically-imported chunk, which on a
// prerendered page forces the browser to eagerly fetch+compile ~15-40 JS chunks before
// it can paint. Chunks still load on demand via native dynamic import when rendered.

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiServer = env.VITE_API_SERVER || 'https://api.360ghar.com';

  // Build-time gate for the prerender data-fetch short-circuit
  // (see src/utils/prerender.js and src/services/http.js).
  //
  //   Local build             ->  __PRERENDER_NO_FETCH__ = true   (skip fetches)
  //   Netlify production      ->  __PRERENDER_NO_FETCH__ = false  (full fetches)
  //   Netlify deploy-preview  ->  __PRERENDER_NO_FETCH__ = true   (skip fetches)
  //   Netlify branch-deploy   ->  __PRERENDER_NO_FETCH__ = true   (skip fetches)
  //   Netlify dev             ->  __PRERENDER_NO_FETCH__ = true   (skip fetches)
  //
  // The short-circuit is AND-gated with the runtime `isPrerendering()` flag,
  // so real users on the deployed site always get live data regardless of
  // the value baked in here.
  const isNetlifyProduction =
    process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production';
  const prerenderNoFetch = !isNetlifyProduction;

  // Bulk-data mode: production builds pre-fetch a /prerender-data.json bundle
  // and serve it from the local preview server during Puppeteer capture, so
  // the 244 prerendered pages do NOT each fire live API calls. Non-production
  // builds keep the cheaper 'empty' short-circuit. Overridable via env.
  const prerenderDataSource =
    env.VITE_PRERENDER_DATA_SOURCE ||
    (isNetlifyProduction ? 'bulk' : 'empty');

  return {
  define: {
    __PRERENDER_NO_FETCH__: JSON.stringify(prerenderNoFetch),
    __PRERENDER_DATA_SOURCE__: JSON.stringify(prerenderDataSource),
  },
  plugins: [
    react(),

    // Defer the bulky entry CSS so it does not block first paint.
    // Critical above-the-fold styles are inlined in index.html.
    deferEntryCssPlugin(),

    // Make PWA SW registration non-blocking
    asyncRegisterSW(),

    // Write dist/.vite-build-hash for prerender cache busting
    writeViteBuildHash(),

    // Image optimization
    ViteImageOptimizer({
      png: {
        quality: 80,
      },
      jpeg: {
        quality: 80,
      },
      jpg: {
        quality: 80,
      },
      webp: {
        lossless: false,
        quality: 80,
      },
      avif: {
        quality: 60,
      },
    }),

    // Generate gzip compressed files
    compression({
      algorithm: "gzip",
      ext: ".gz",
      threshold: 1024,
    }),

    // Generate brotli compressed files
    compression({
      algorithm: "brotliCompress",
      ext: ".br",
      threshold: 1024,
    }),

    // PWA support
    VitePWA({
      registerType: "autoUpdate",
      includeAssets: ["favicon.png", "assets/images/logo/*.png"],
      manifest: {
        name: "360Ghar",
        short_name: "360Ghar",
        description: "India's First AI-Enabled Real Estate Platform",
        theme_color: "#ffffff",
        background_color: "#ffffff",
        display: "standalone",
        icons: [
          {
            src: "/assets/images/logo/favicon.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "/assets/images/logo/favicon-512.png",
            sizes: "512x512",
            type: "image/png",
          },
        ],
      },
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff2}"],
        // Exclude large blueprint3d files from precaching
        globIgnores: ["**/blueprint3d/**", "**/data/**"],
        // Increase file size limit for precaching
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024, // 5MB
        runtimeCaching: [
          {
            urlPattern: new RegExp('^' + apiServer.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/.*', 'i'),
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60, // 1 hour
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "image-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:woff2|woff)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "font-cache",
              expiration: {
                maxEntries: 20,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
    }),

    // Bundle analyzer (only in analyze mode)
    process.env.ANALYZE &&
      visualizer({
        // eslint-disable-line no-undef
        open: true,
        filename: "dist/stats.html",
        gzipSize: true,
        brotliSize: true,
      }),
  ].filter(Boolean),

  build: {
    // Keep the build syntax compatible with the Chromium version bundled by
    // Puppeteer so post-build prerendering can execute the app reliably.
    target: "es2019",

    // Disable source maps for production
    sourcemap: false,

    // Disable modulepreload hints (static + runtime). On a prerendered page these force the
    // browser to eagerly fetch+compile many JS chunks before first paint. Chunks still load
    // on demand via native dynamic import. See note above the config for full rationale.
    modulePreload: false,

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('src/data/localities.json')) return 'localities-data';
          if (id.includes('src/data/localities-index.json')) return 'localities-index';

          const staticChunks = {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-forms': ['formik', 'yup'],
            'vendor-ui': ['react-slick', 'react-toastify', 'yet-another-react-lightbox'],
            'vendor-markdown': ['react-markdown', 'remark-gfm'],
            'vendor-utils': ['axios', 'zustand', 'dompurify'],
            'vendor-analytics': ['posthog-js', 'web-vitals'],
            'vendor-supabase': ['@supabase/supabase-js'],
          };

          for (const [chunkName, modules] of Object.entries(staticChunks)) {
            if (modules.some((mod) => id.includes(`/node_modules/${mod}/`) || id.includes(`/node_modules/${mod}.js`))) {
              return chunkName;
            }
          }
        },
      },
    },

    // Minification settings
    minify: "terser",
    terserOptions: {
      compress: {
        pure_funcs: ['console.log', 'console.debug', 'console.info'],
        drop_debugger: true,
      },
    },
  },

  server: {
    proxy: {
      "/api": {
        target: env.VITE_API_SERVER || 'http://localhost:3600',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },

  preview: {
    proxy: {
      "/api": {
        target: apiServer,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
  };
});
