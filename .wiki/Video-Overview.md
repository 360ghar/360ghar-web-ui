# Video overview

<video controls width="800" preload="metadata">
  <source src="video/overview.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

A silent, branded walkthrough of the 360Ghar frontend repository. The video is rendered with Remotion using 360Ghar's orange (#ff6b00) and CTA-blue (#0369A1) brand palette and contains no audio track.

## Scene-by-scene breakdown

| # | Scene | Timestamp | Content |
|---|-------|-----------|---------|
| 1 | Title | 0:00 – 0:05 | 360Ghar logo on brand-orange gradient, "Frontend Repository Overview" subtitle, Gurugram, India tag. |
| 2 | Tech Stack | 0:05 – 0:15 | React 18.2 + Vite 7.3, Zustand 5, React Router v6, Supabase, PostHog, i18next, Formik, Axios, SCSS 7-1. Logos/typeset over a card grid. |
| 3 | Features | 0:15 – 0:30 | Property search & filters, 100 page components, 161 feature components, 8 calculator tools (EMI, Area, Loan Eligibility, Capital Gains, Rent Receipt, Vastu, Blueprint, Document Checklist), AI Design Studio, AI ChatBot, Data Hub (RERA, circle rates, bank auctions). |
| 4 | Architecture | 0:30 – 0:45 | `src/pages` (100 files) → `src/components` (163) → `src/common` (75) → `src/services` (23) → `src/store` (14 Zustand stores) → `src/seo` (11). 418 source files, 61,389 lines. Supabase Auth SDK, Axios with retry, Netlify prerender via Puppeteer. |
| 5 | Tools | 0:45 – 0:55 | 24 build scripts under `scripts/`: sitemap generation, RSS feed, prerender-pages, refresh-image-assets, entity ingestion. SCSS architecture in `public/assets/sass/` (91 files, 10,868 lines). |
| 6 | Outro | 0:55 – 1:00 | 360Ghar wordmark on brand gradient, "84 commits · May 2025 – Jun 2026 · github.com/360ghar/frontend", call-to-action to the wiki. |

## Re-rendering the video

The video source lives in `.wiki/video/` and is built with Remotion. To regenerate `overview.mp4`:

```bash
cd .wiki/video && npm install && npx remotion render src/Root.tsx OverviewVideo overview.mp4
```

The Remotion composition is defined in `.wiki/video/src/` — edit the scenes, brand colors, and copy there, then re-render with the command above. The composition uses 360Ghar's brand palette (`#ff6b00`, `#0369A1`, `#cc5500`, `#ff8c3a`) and the Cinzel / Josefin Sans type pairing declared in `_theme.scss`.

## Notes

- The video is **silent** — there is no audio track, no narration, and no background music. All context is conveyed on-screen.
- Branding is **360Ghar** throughout (orange hero gradient, Cinzel headings, Gurugram localization). No third-party or Factory branding appears.
- `preload="metadata"` is set so the browser only fetches the video header until the user presses play, keeping the wiki page lightweight.
