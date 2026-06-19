# 360Ghar Frontend

360Ghar is a real estate platform built for Gurugram, India, covering property search, listings, residential projects, blog content, and a suite of property tools (EMI calculator, area converter, Vastu checker, 3D blueprint, and more). The frontend is a React 18.2 + Vite single-page application backed by a FastAPI REST API, Supabase authentication, Google Maps/Places, and PostHog analytics. It ships programmatic SEO landing pages, an i18next Hindi translation layer, and a heavy build pipeline that prerenders pages, generates sitemaps, and optimizes images.

<video controls width="800" preload="metadata">
  <source src="video/overview.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

## Quick Links

| Section | Description |
|---------|-------------|
| [Architecture](Architecture) | System layers, Mermaid diagrams, build pipeline |
| [Getting Started](Getting-Started) | Install, env vars, dev/build/test commands |
| [Glossary](Glossary) | Project-specific terms (BHK, Vastu, RERA, GEO, AEO) |
| [By The Numbers](By-The-Numbers) | Repo statistics |
| [Lore](Lore) | Project history and context |

## Tech Stack

![React 18.2](https://img.shields.io/badge/React-18.2-61DAFB?logo=react&logoColor=white)
![Vite 7.3](https://img.shields.io/badge/Vite-7.3-646CFF?logo=vite&logoColor=white)
![Zustand 5](https://img.shields.io/badge/Zustand-5-orange)
![React Router v6](https://img.shields.io/badge/React_Router-v6-CA4245)
![Supabase](https://img.shields.io/badge/Supabase-Auth-3ECF8E?logo=supabase&logoColor=white)
![PostHog](https://img.shields.io/badge/PostHog-analytics-1D4AFF)
![i18next](https://img.shields.io/badge/i18next-Hindi-26A69A)
![SCSS 7-1](https://img.shields.io/badge/SCSS-7--1-CC6699)
![ESLint 9](https://img.shields.io/badge/ESLint-9-4B32C3)

## Prerequisites

- **Node.js** >= 18
- **npm** (bundled with Node)
- A Supabase project (for auth)
- A Google Cloud project with Places API enabled

## Quick Start

```bash
# Clone the repository
git clone github.com:360ghar/frontend.git
cd frontend

# Install dependencies
npm install

# Copy env template and fill in your keys
cp .env.example .env.local
#   VITE_GOOGLE_PLACES_API_KEY=...
#   VITE_SUPABASE_URL=...
#   VITE_SUPABASE_PUBLISHABLE_KEY=...
#   VITE_API_BASE_URL=http://localhost:3600/api/v1

# Start the dev server (http://localhost:5173)
npm run dev

# Production build (entity ingestion + sitemaps + RSS + Vite)
npm run build

# Preview the production build locally
npm run preview

# Lint
npm run lint

# Run unit tests
npm test
```

See [Architecture](Architecture) for system design, [Getting Started](Getting-Started) for full setup details, and [Glossary](Glossary) for project terminology.
