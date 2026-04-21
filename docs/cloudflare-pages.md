# Cloudflare Pages Deployment

## Project Settings
- Framework preset: `None`
- Build command: `npx puppeteer browsers install chrome && npm run build`
- Build output directory: `dist`
- Node.js version: `20`

## Routing And Headers
- `public/_redirects` is the canonical source for path-based redirects and SPA fallback on Cloudflare Pages.
- `public/_headers` is the canonical source for static cache/security headers.
- Configure Cloudflare Bulk Redirects for host-level normalization:
  - `www.360ghar.com/*` -> `https://360ghar.com/$1`
  - Optional: `*.pages.dev/*` -> `https://360ghar.com/$1`

## Markdown Negotiation
- Cloudflare Pages Free does not expose native Markdown for Agents, so markdown negotiation is implemented manually in [`functions/_middleware.js`](/Users/sakshammittal/Documents/360ghar/github/360ghar/frontend/functions/_middleware.js).
- Build-time markdown assets are generated into the private `dist/__markdown/` namespace by [`scripts/generate-markdown-pages.mjs`](/Users/sakshammittal/Documents/360ghar/github/360ghar/frontend/scripts/generate-markdown-pages.mjs).
- Supported routes come from [`src/seo/markdownRoutes.js`](/Users/sakshammittal/Documents/360ghar/github/360ghar/frontend/src/seo/markdownRoutes.js).

## Verification
```bash
curl -I https://360ghar.com/
curl -I https://360ghar.com/ -H 'Accept: text/markdown'
curl https://360ghar.com/for-ai -H 'Accept: text/markdown' | head
curl -I https://360ghar.com/login -H 'Accept: text/markdown'
```

Expected results:
- Browser/default requests keep `Content-Type: text/html`
- Supported public canonical pages return `Content-Type: text/markdown; charset=utf-8`
- App/auth routes continue to return HTML
