import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { Badge } from '../components/Badge';
import {
  COLORS,
  FONTS,
  SCENE_DURATIONS,
  DURATIONS,
  SPRING_CONFIG,
} from '../theme';

const TECH_ITEMS: { label: string; color: string }[] = [
  { label: 'React 18', color: COLORS.mainColor },
  { label: 'Vite 7', color: COLORS.ctaColor },
  { label: 'Zustand 5', color: COLORS.mainColorDark },
  { label: 'Supabase', color: COLORS.successColor },
  { label: 'React Router v6', color: COLORS.ctaColor },
  { label: 'PostHog', color: COLORS.mainColorLight },
  { label: 'i18next', color: COLORS.mainColor },
  { label: 'Formik', color: COLORS.ctaColor },
  { label: 'SCSS', color: COLORS.mainColorDark },
  { label: 'Google Maps', color: COLORS.successColor },
];

/**
 * Scene 2 (6-18s, 360 frames)
 * Light background, "Built With" title, animated badge grid.
 */
export const TechStackScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Title spring animation
  const titleProgress = spring({ frame, fps, config: SPRING_CONFIG });
  const titleOpacity = Math.min(titleProgress, 1);
  const titleScale = 0.9 + titleProgress * 0.1;

  // Fade out near the end.
  const fadeOut = interpolateFadeOut(frame, SCENE_DURATIONS.techStack);

  // Grid layout: 5 columns x 2 rows.
  const gridStartX = 240;
  const gridStartY = 480;
  const colSpacing = 310;
  const rowSpacing = 130;

  return (
    <AbsoluteFill>
      <GradientBg variant="light" />

      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: 180,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.heading,
            fontSize: 110,
            fontWeight: 700,
            color: COLORS.mainColor,
            opacity: titleOpacity,
            transform: `scale(${titleScale})`,
          }}
        >
          Built With
        </div>

        {/* Badge grid */}
        {TECH_ITEMS.map((item, i) => {
          const col = i % 5;
          const row = Math.floor(i / 5);
          const x = gridStartX + col * colSpacing;
          const y = gridStartY + row * rowSpacing;
          const delay = 15 + i * DURATIONS.badgeStagger;
          return (
            <Badge
              key={item.label}
              label={item.label}
              delay={delay}
              x={x}
              y={y}
              color={item.color}
              fontSize={34}
            />
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

function interpolateFadeOut(frame: number, duration: number) {
  const start = duration - 20;
  const end = duration;
  if (frame <= start) return 1;
  if (frame >= end) return 0;
  return 1 - (frame - start) / (end - start);
}

export default TechStackScene;
