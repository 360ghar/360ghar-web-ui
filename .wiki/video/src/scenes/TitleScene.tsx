import React from 'react';
import {
  AbsoluteFill,
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { GradientBg } from '../components/GradientBg';
import { AnimatedText } from '../components/AnimatedText';
import {
  COLORS,
  FONTS,
  SPRING_CONFIG,
  SCENE_DURATIONS,
} from '../theme';

/**
 * Scene 1 (0-6s, 180 frames)
 * Full-screen orange gradient with the 360Ghar logo text and tagline.
 * Subtle pulsing glow on the title.
 */
export const TitleScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  // Pulsing glow: oscillates between 0.4 and 0.9 alpha.
  const glowPulse = interpolate(
    Math.sin(frame / 12),
    [-1, 1],
    [0.4, 0.9]
  );

  const titleScale = interpolate(titleProgress, [0, 1], [0.85, 1]);
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Fade out near the end of the scene.
  const fadeOut = interpolate(
    frame,
    [SCENE_DURATIONS.title - 20, SCENE_DURATIONS.title],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  return (
    <AbsoluteFill>
      <GradientBg variant="orange" radialHighlight />

      <AbsoluteFill
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          opacity: fadeOut,
        }}
      >
        {/* Title with pulsing glow */}
        <div
          style={{
            fontFamily: FONTS.heading,
            fontSize: 180,
            fontWeight: 700,
            color: COLORS.bgWhite,
            textShadow: `0 0 ${40 + glowPulse * 30}px rgba(255,140,58,${glowPulse}), 0 4px 24px rgba(0,0,0,0.25)`,
            transform: `scale(${titleScale})`,
            opacity: titleOpacity,
            letterSpacing: 4,
            marginBottom: 24,
          }}
        >
          360Ghar
        </div>

        {/* Tagline */}
        <AnimatedText
          text="Real Estate Platform for Gurugram"
          fontSize={56}
          fontFamily={FONTS.body}
          color={COLORS.mainColorLighter}
          fontWeight={400}
          delay={15}
          x={0}
          y={0}
          textAlign="center"
          width={1200}
          letterSpacing={2}
        />

        {/* Decorative accent line */}
        <div
          style={{
            marginTop: 40,
            width: interpolate(
              spring({ frame: frame - 30, fps, config: SPRING_CONFIG }),
              [0, 1],
              [0, 320]
            ),
            height: 4,
            background: COLORS.bgWhite,
            borderRadius: 2,
            opacity: 0.85,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default TitleScene;
