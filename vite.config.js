import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import compression from "vite-plugin-compression";
import { visualizer } from "rollup-plugin-visualizer";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";
import { VitePWA } from "vite-plugin-pwa";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readFileSync, writeFileSync } from "node:fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Custom plugin to defer the main entry CSS chunk so it does not block first paint.
// The critical above-the-fold styles are already inlined in index.html.
const deferEntryCssPlugin = () => ({
  name: "defer-entry-css",
  transformIndexHtml(html) {
    // Convert the main entry CSS chunk (<link rel="stylesheet" href="/assets/index-*.css">)
    // to a non-blocking preload pattern.
    return html.replace(
      /<link rel="stylesheet"([^>]*)href="(\/assets\/index-[a-zA-Z0-9_-]+\.css)"([^>]*)>/,
      (match, before, href, after) => {
        return `<link rel="preload" as="style"${before}href="${href}"${after} onload="this.onload=null;this.rel='stylesheet'"><noscript><link rel="stylesheet"${before}href="${href}"${after}></noscript>`;
      }
    );
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

// Custom plugin to optimize modulepreload hints
const optimizeModulepreload = () => ({
  name: "optimize-modulepreload",
  transformIndexHtml(html) {
    // Remove preload hints for heavy, rarely-used chunks to improve initial load
    // IMPORTANT: Keep this list in sync with manualChunks configuration below
    // These chunks are lazy-loaded only when needed (markdown rendering, analytics)
    return html
      .replace(/<link rel="modulepreload"[^>]*vendor-markdown[^>]*>/g, "")
      .replace(/<link rel="modulepreload"[^>]*vendor-analytics[^>]*>/g, "")
      .replace(/<link rel="modulepreload"[^>]*vendor-supabase[^>]*>/g, "");
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiServer = env.VITE_API_SERVER || 'https://api.360ghar.com';
  return {
  plugins: [
    react(),

    // Defer the bulky entry CSS so it does not block first paint.
    // Critical above-the-fold styles are inlined in index.html.
    deferEntryCssPlugin(),

    // Make PWA SW registration non-blocking
    asyncRegisterSW(),

    // Optimize modulepreload hints (remove heavy rarely-used chunks)
    optimizeModulepreload(),

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
            src: "/assets/images/logo/logo.png",
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

    // Increase chunk size warning limit
    chunkSizeWarningLimit: 500,

    // Manual chunk splitting for better caching
    rollupOptions: {
      output: {
        manualChunks: {
          // React core
          "vendor-react": ["react", "react-dom", "react-router-dom"],

          // Form libraries
          "vendor-forms": ["formik", "yup"],

          // UI libraries
          "vendor-ui": [
            "react-slick",
            "react-toastify",
            "yet-another-react-lightbox",
          ],

          // Markdown rendering
          "vendor-markdown": ["react-markdown", "remark-gfm"],

          // Utilities
          "vendor-utils": ["axios", "zustand", "dompurify"],

          // Analytics (separate for lazy loading)
          "vendor-analytics": ["posthog-js", "web-vitals"],

          // Supabase Auth SDK (lazy-loaded, not on critical path)
          "vendor-supabase": ["@supabase/supabase-js"],
        },
      },
    },

    // Minification settings
    minify: "terser",
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  server: {
    proxy: {
      "/api": {
        target: env.VITE_API_SERVER || 'http://localhost:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, "/api/v1"),
      },
    },
  },
  };
});
