import React from 'react';
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { GradientBg } from '../components/GradientBg';
import {
  COLORS,
  FONTS,
  SPRING_CONFIG,
  SCENE_DURATIONS,
  DURATIONS,
} from '../theme';

interface Feature {
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    title: 'Property Search',
    description: 'Geo-aware search with rich filters for location, price, BHK, and amenities.',
  },
  {
    title: 'Listings & Details',
    description: 'Rich property detail pages with galleries, floor plans, and media.',
  },
  {
    title: 'Projects',
    description: 'Curated project listings with builder info and availability.',
  },
  {
    title: 'Blog',
    description: 'SEO-friendly blog with categories, tags, and markdown rendering.',
  },
  {
    title: 'Account Dashboard',
    description: 'User profile, preferences, saved searches, and property management.',
  },
  {
    title: 'Saved Favorites',
    description: 'Swipe-to-like interactions with persisted favorites and visit scheduling.',
  },
];

/**
 * Scene 3 (18-35s, 510 frames)
 * White background, "Key Features" title, 2-column feature cards with staggered entrance.
 */
export const FeaturesScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [SCENE_DURATIONS.features - 20, SCENE_DURATIONS.features],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Title
  const titleProgress = spring({ frame, fps, config: SPRING_CONFIG });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // 2-column grid layout
  const cardWidth = 720;
  const cardHeight = 180;
  const colSpacing = 40;
  const rowSpacing = 32;
  const startX = 200;
  const startY = 380;

  return (
    <AbsoluteFill>
      <GradientBg variant="light" />

      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: 200,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.heading,
            fontSize: 100,
            fontWeight: 700,
            color: COLORS.mainColor,
            opacity: titleOpacity,
          }}
        >
          Key Features
        </div>

        {/* Feature cards */}
        {FEATURES.map((feature, i) => {
          const col = i % 2;
          const row = Math.floor(i / 2);
          const x = startX + col * (cardWidth + colSpacing);
          const y = startY + row * (cardHeight + rowSpacing);
          const delay = 20 + i * DURATIONS.cardStagger;

          const cardProgress = spring({
            frame: frame - delay,
            fps,
            config: SPRING_CONFIG,
          });
          const translateX = interpolate(cardProgress, [0, 1], [col === 0 ? -60 : 60, 0]);
          const opacity = interpolate(cardProgress, [0, 1], [0, 1]);

          return (
            <div
              key={feature.title}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: cardWidth,
                height: cardHeight,
                background: COLORS.bgWhite,
                border: `1px solid ${COLORS.borderColorLight}`,
                borderLeft: `6px solid ${COLORS.mainColor}`,
                borderRadius: 18,
                padding: '24px 32px',
                boxShadow: '0 12px 24px rgba(16, 24, 40, 0.06)',
                transform: `translateX(${translateX}px)`,
                opacity,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  fontFamily: FONTS.heading,
                  fontSize: 42,
                  fontWeight: 600,
                  color: COLORS.textPrimary,
                  marginBottom: 12,
                }}
              >
                {feature.title}
              </div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 26,
                  color: COLORS.textSecondary,
                  lineHeight: 1.4,
                }}
              >
                {feature.description}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default FeaturesScene;
