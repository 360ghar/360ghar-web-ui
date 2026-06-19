# 360Ghar Wiki Video

A Remotion-powered codebase overview video for the 360Ghar frontend wiki. Renders a polished 75-second silent video at 1920x1080 / 30fps covering the brand, tech stack, features, architecture, and tools.

## Video Specs

- **Resolution:** 1920x1080
- **Frame rate:** 30fps
- **Duration:** 75 seconds (2250 frames)
- **Codec:** H.264 (CRF 18, pixel format yuv420p)
- **Audio:** Silent (no audio tracks)
- **Target size:** Under 10MB

## Prerequisites

- Node.js 18+
- npm

## Install

```bash
cd .wiki/video
npm install
```

## Preview in Remotion Studio

```bash
npm run dev
```

Opens the Remotion Studio where you can scrub through scenes, preview animations, and iterate quickly.

## Render the final video

```bash
npm run render
```

Outputs `overview.mp4` in the `.wiki/video/` directory using H.264 with CRF 18.

### macOS note

If the render fails with "Visited http://localhost:XXXX/index.html but got no response", Remotion needs a browser executable. Use the system Chrome:

```bash
npx remotion render src/Root.tsx OverviewVideo overview.mp4 \
  --codec=h264 --crf=18 --pixel-format=yuv420p \
  --browser-executable="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
```

Or install Chromium via Playwright: `npx playwright install chromium`

## Editing scenes

All scenes live in `src/scenes/`:

| Scene | File | Duration |
|------|------|----------|
| 1. Title | `src/scenes/TitleScene.tsx` | 0-6s (180 frames) |
| 2. Tech Stack | `src/scenes/TechStackScene.tsx` | 6-18s (360 frames) |
| 3. Features | `src/scenes/FeaturesScene.tsx` | 18-35s (510 frames) |
| 4. Architecture | `src/scenes/ArchitectureScene.tsx` | 35-55s (600 frames) |
| 5. Tools | `src/scenes/ToolsScene.tsx` | 55-68s (390 frames) |
| 6. Outro | `src/scenes/OutroScene.tsx` | 68-75s (210 frames) |

To change content, durations, or animations, edit the relevant scene file. Scene durations are defined in `src/theme.ts` under `SCENE_DURATIONS` and wired into `src/OverviewVideo.tsx` via `<Series.Sequence>`.

## Changing branding

All brand colors, fonts, spring configs, and durations are centralized in `src/theme.ts`. Update values there to retheme the entire video:

- `COLORS` - primary orange `#ff6b00`, dark `#cc5500`, light `#ff8c3a`, CTA blue `#0369A1`, text `#181616`, etc.
- `FONTS` - `Cinzel` for headings, `Josefin Sans` for body
- `SPRING_CONFIG` / `SPRING_BOUNCE` - spring animation tuning
- `SCENE_DURATIONS` - per-scene frame counts

## Project structure

```
.wiki/video/
├── package.json
├── tsconfig.json
├── remotion.config.ts
├── README.md
└── src/
    ├── Root.tsx                  # Composition registration
    ├── OverviewVideo.tsx         # Main <Series> sequencer
    ├── theme.ts                  # Brand colors, fonts, animation configs
    ├── components/
    │   ├── GradientBg.tsx        # Full-screen gradient backgrounds
    │   ├── AnimatedText.tsx      # Spring-revealed text
    │   ├── Badge.tsx             # Pill-shaped tech badges
    │   └── Transition.tsx        # Sliding panel transitions
    └── scenes/
        ├── TitleScene.tsx
        ├── TechStackScene.tsx
        ├── FeaturesScene.tsx
        ├── ArchitectureScene.tsx
        ├── ToolsScene.tsx
        └── OutroScene.tsx
```

## CI / Automation

A GitHub Action automatically re-renders the video when files under `src/` change. The rendered `overview.mp4` is committed back to the wiki and surfaced on the repository wiki page.

## Upgrading Remotion

```bash
npm run upgrade
```

Upgrades all `@remotion/*` and `remotion` packages to the latest compatible version.
