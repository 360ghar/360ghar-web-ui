# Specialized Tools

360Ghar ships two specialized interactive tools that go beyond standard CRUD: an **AI-powered Vastu Checker** that analyzes floor-plan images for Vastu Shastra compliance, and a **3D Blueprint Designer** that embeds the Blueprint3D library for in-browser floor-plan authoring. Both are free, require no signup, and ship with full SEO structured data.

## Key Files

### Vastu Checker

| File | Role |
|------|------|
| `src/pages/tools/VastuChecker.jsx` | Tool page orchestration, state machine, SEO |
| `src/services/vastuService.js` | API client (separate axios, 180s timeout) |
| `src/components/vastu/FloorPlanUpload.jsx` | Image upload + preview |
| `src/components/vastu/DirectionSelector.jsx` | North-direction picker |
| `src/components/vastu/VastuLoadingState.jsx` | Loading animation with step labels |
| `src/components/vastu/VastuScoreCard.jsx` | Score gauge + summary |
| `src/components/vastu/VastuReport.jsx` | Full room-by-room report |
| `src/components/vastu/VastuWarningsBanner.jsx` | Warnings / red flags |
| `src/components/vastu/FloorPlanSummary.jsx` | Summary card |
| `src/pages/tools/VastuChecker.scss` | Styles |

### 3D Blueprint

| File | Role |
|------|------|
| `src/pages/tools/DesignBlueprint.jsx` | Tool page, iframe host, SEO |
| `src/pages/tools/DesignBlueprint.css` | Styles |
| `public/blueprint3d/index.html` | Blueprint3D app entry |
| `public/blueprint3d/js/` | Blueprint3D JS bundle |
| `public/blueprint3d/css/` | Blueprint3D styles |
| `public/blueprint3d/models/` | 3D furniture models |
| `public/blueprint3d/rooms/` | Room presets |
| `public/blueprint3d/fonts/` | Embedded fonts |

## Vastu Checker

### What it does

The Vastu Checker uploads a floor-plan image (JPEG / PNG / WebP) along with the cardinal direction of North and optional notes, sends them to the backend for AI analysis (default provider: GLM-4V-Flash), and returns a Vastu compliance score with a room-by-room report, warnings, and recommendations.

### State machine (`VastuChecker.jsx`)

`appState` cycles through `input -> loading -> result | error`. Error states are typed (`general`, `timeout`, `network`, `validation`) for tailored messaging. Blob URLs for image previews are revoked on reselect and on unmount to avoid leaks (audit fix 3.6).

### UI flow

1. **FloorPlanUpload** - drag/drop or file picker, image preview, file validation.
2. **DirectionSelector** - pick North direction: `up | down | left | right | unknown` (default `up`).
3. Optional notes textarea (max 1000 chars).
4. Submit -> **VastuLoadingState** (animated step labels: `analyzing`, etc.).
5. On success -> **VastuScoreCard** (score gauge) + **VastuReport** (room-by-room) + **VastuWarningsBanner** + **FloorPlanSummary**.
6. On error -> typed error message with retry.

### SEO

The page emits HowTo, FAQ, Breadcrumb, and Tool structured data via `src/seo/structuredData.js` and `src/seo/toolSchemas.js`. FAQs and HowTo steps are i18n-driven (`tools` namespace).

### API (`vastuService.js`)

Creates its **own axios instance** (not from the shared factory) so it can:

- Bypass Netlify's 26-second proxy timeout in production by hitting `VITE_API_SERVER` (`https://api.360ghar.com`) directly.
- Set a **180-second timeout** for AI processing.

| Method | Endpoint | Body |
|--------|----------|------|
| `analyzeFloorPlan(imageFile, northDirection, notes)` | `POST /vastu/analyze` | multipart: `image`, `north_direction`, `notes`, `provider=glm` |
| `checkHealth()` | `GET /vastu/health` | - |

The endpoint is **public** (no auth). In dev it uses the `/api` Vite proxy; in production it uses `VITE_API_SERVER` directly.

## 3D Blueprint Designer

### What it does

The 3D Blueprint Designer embeds the open-source **Blueprint3D** library in an iframe, letting users draw 2D floor plans (walls, doors, windows, furniture) and instantly switch to a 3D walk-through view. Designs can be exported as JSON for sharing with architects.

### Implementation (`DesignBlueprint.jsx`)

```js
const DESIGNER_SRC = '/blueprint3d/index.html';
```

The Blueprint3D app is served as static assets from `public/blueprint3d/` and loaded in an `<iframe>`. The React wrapper:

- Shows a loading spinner until the iframe fires `onLoad` (15s timeout, audit fix 3.6).
- On timeout, shows a fallback error state with a **Retry** button (re-keys the iframe via `retryKey`).
- Emits FAQ + HowTo + Breadcrumb structured data.
- Cross-links to the Vastu Checker (design here, then analyze there).

### Blueprint3D assets

```
public/blueprint3d/
  index.html        - app shell
  js/               - Blueprint3D bundle
  css/              - styles
  models/           - 3D furniture models
  rooms/            - room presets
  fonts/            - embedded fonts
```

### Why an iframe?

Blueprint3D is a self-contained JS app with its own bundler and global state. Embedding it in an iframe isolates its styles and globals from the React app, avoids bundler conflicts, and lets it load lazily only when the user visits `/design-blueprint` (no cost to the homepage bundle).

### Export

Blueprint3D supports saving floor-plan data as JSON. Users can download the JSON and share it with their architect or interior designer, or feed it into the Vastu Checker as a floor-plan image.

## Comparison

| Aspect | Vastu Checker | 3D Blueprint |
|--------|---------------|--------------|
| Tech | React + AI API | Iframe + Blueprint3D |
| Auth | Public | Public |
| Latency | Up to 3 min (AI) | Instant (client-side) |
| Output | Score + report | Floor plan + JSON export |
| SEO | HowTo + FAQ + Tool schema | HowTo + FAQ + Tool schema |
| Cross-link | "Design first in Blueprint" | "Analyze in Vastu Checker" |

## Cross-References

- [API Layer](../services/API-Layer) - vastuService's custom axios instance
- [Build Pipeline](../build/Build-Pipeline) - `public/blueprint3d/` is copied as static assets
