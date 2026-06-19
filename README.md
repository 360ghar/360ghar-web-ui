# 360Ghar Frontend

A modern real estate platform built with React 18 and Vite, featuring property listings, 360-degree virtual tours, AI-powered tools, and programmatic SEO landing pages.

## Documentation

Comprehensive documentation lives in the [`.wiki/`](.wiki/) directory and is auto-published to the [GitHub Wiki](https://github.com/360ghar/frontend/wiki) tab on every push to `main`.

### Video Overview

<video controls width="800" preload="metadata">
  <source src=".wiki/video/overview.mp4" type="video/mp4">
  Your browser does not support the video tag.
</video>

For details on the video's contents and how to re-render it, see the [Video Overview](.wiki/Video-Overview.md) wiki page.

## Features

- **Property Listings** - Browse, search, and filter properties with advanced filters
- **360-Degree Virtual Tours** - Immersive property viewing experience
- **AI-Powered Vastu Checker** - Floor plan analysis for Vastu compliance
- **3D Blueprint Designer** - Interactive floor plan design tool
- **Real Estate Calculators** - EMI, loan eligibility, area converter, capital gains
- **User Accounts** - Registration, login, favorites, property posting
- **Blog & Content** - Real estate guides and articles
- **Programmatic SEO** - Dynamic landing pages for city/property combinations
- **Mobile Responsive** - Fully responsive design with mobile navigation

## Tech Stack

- **Framework**: React 18.2 + Vite 5.1
- **State Management**: Zustand 5.0
- **Routing**: React Router DOM v6.22
- **Styling**: SCSS with 7-1 architecture
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios with interceptors
- **SEO**: React Helmet Async
- **Maps**: Google Maps/Places API

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- Backend API running (see backend repository)

### Installation

```bash
# Clone the repository
git clone https://github.com/360ghar/frontend.git
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=/api
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_publishable_key
VITE_GOOGLE_PLACES_API_KEY=your_google_places_api_key
```

Auth sessions are handled directly by Supabase SDK. The backend only verifies Supabase bearer tokens on protected business endpoints.

**Google Places API Setup:**
1. Enable Google Places API in your Google Cloud Console
2. Create an API key with HTTP referrer restrictions
3. Add allowed referrers: `http://localhost:5173/*` for development

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production (includes sitemap generation) |
| `npm run build:sitemaps` | Generate sitemaps manually |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code linting |

## Project Structure

```
frontend/
├── src/
│   ├── pages/              # Route page components
│   │   ├── account/        # Login, Register, Account dashboard
│   │   ├── blogs/          # Blog listing and details
│   │   ├── core/           # About, Contact, FAQ, Policies
│   │   ├── landing/        # Programmatic SEO pages
│   │   ├── projects/       # Project listings
│   │   ├── properties/     # Property listings and details
│   │   ├── tools/          # Calculators and tools
│   │   └── unused/         # Legacy/unused pages
│   ├── components/         # Feature components by domain
│   │   ├── account/        # Account-related components
│   │   ├── blog/           # Blog components
│   │   ├── contact/        # Contact form components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout sections
│   │   ├── project/        # Project components
│   │   ├── property/       # Property components
│   │   ├── property-filters/ # Filter components
│   │   ├── ui/             # General UI components
│   │   └── vastu/          # Vastu checker components
│   ├── common/             # Shared UI components
│   │   └── footer/         # Footer subcomponents
│   ├── services/           # API service modules
│   ├── store/              # Zustand state stores
│   ├── contextApi/         # React Context providers
│   ├── data/               # Static data by page/feature
│   ├── App.jsx             # Main app with routing
│   └── main.jsx            # Entry point
├── public/
│   ├── assets/
│   │   ├── sass/           # SCSS architecture (7-1 pattern)
│   │   └── images/         # Static images
│   ├── blueprint3d/        # 3D Blueprint tool assets
│   └── sitemap*.xml        # SEO sitemaps
├── scripts/                # Build scripts
└── package.json
```

## Key Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Home | Main landing page |
| `/properties` | Property Listings | Browse all properties |
| `/property/:id` | Property Details | Individual property page |
| `/post-property` | Post Property | Submit a new listing |
| `/login` | Login | User authentication |
| `/register` | Register | New user registration |
| `/account` | Account Dashboard | User profile and settings |
| `/blog` | Blog | Articles and guides |
| `/emi-calculator` | EMI Calculator | Loan EMI calculation |
| `/vastu-checker` | Vastu Checker | AI-powered floor plan analysis |
| `/design-blueprint` | Blueprint Designer | 3D floor plan tool |

## State Management

The app uses Zustand for state management with the following stores:

- **authStore** - Authentication state (user, token, login/logout)
- **propertyStore** - Property listings, filters, CRUD operations
- **userStore** - User profile and preferences
- **locationStore** - Geolocation with browser API
- **visitStore** - Property visit scheduling
- **agentStore** - Assigned agent information

## API Integration

The frontend integrates with the 360Ghar backend API:

- **Development**: Proxied through Vite to `http://localhost:3600/api/v1`
- **Production**: `https://api.360ghar.com`

### Authentication

- Login/register/logout handled directly by Supabase Auth SDK
- Access token is read from the active Supabase session and injected into backend requests
- Backend `/api/v1/auth/*` session endpoints are removed and must not be used
- 401 responses trigger logout and redirect

### Key Services

- `authService` - Login, register, profile
- `propertyService` - Property CRUD operations
- `propertyAPIService` - Public property search
- `blogService` - Blog posts and categories
- `vastuService` - AI Vastu analysis
- `visitService` - Property visit scheduling

## Styling

The project uses SCSS with 7-1 architecture:

```
sass/
├── abstracts/    # Variables, mixins, functions
├── base/         # Typography, margins, padding
├── components/   # Reusable component styles
├── layout/       # Header, footer, navigation
├── partials/     # Page-specific styles
└── main.scss     # Main entry point
```

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Environment Configuration

For production, ensure:
1. Google Places API key is set with production domain restrictions
2. Backend API URL is correctly configured
3. Sitemaps are generated (`npm run build` does this automatically)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Related Repositories

- [360Ghar Backend](https://github.com/360ghar/backend) - FastAPI backend

## License

Proprietary - All rights reserved.

## Documentation Maintenance

The `.wiki/` directory contains comprehensive codebase documentation that is published to the GitHub Wiki tab automatically. Keep it up to date after every change.

| Change type | Wiki page to update |
|-------------|-------------------|
| New/removed page, component, service, or store | Relevant `.wiki/pages/`, `.wiki/components/`, `.wiki/services/`, or `.wiki/state/` page |
| Feature or architecture change | `.wiki/Architecture.md` + relevant `.wiki/features/` page |
| Dependency added/removed/updated | `.wiki/reference/Reference.md` |
| Build process change | `.wiki/build/Build-Pipeline.md` |
| Branding or UI pattern change | `.wiki/how-to-contribute/Patterns-Conventions.md` |
| Video content change (features, architecture, branding) | Re-render `.wiki/video/overview.mp4` |

```bash
# Re-render the wiki overview video (after editing .wiki/video/src/)
cd .wiki/video && npm install && npx remotion render src/Root.tsx OverviewVideo overview.mp4
```

The wiki auto-publishes to the GitHub Wiki tab on push to `main` (via `.github/workflows/publish-wiki.yml`), and the video auto-renders when `.wiki/video/src/` changes (via `.github/workflows/render-wiki-video.yml`).

## Contact

- **Website**: https://360ghar.com
- **Email**: info@360ghar.com
- **Location**: Gurugram, Haryana, India
