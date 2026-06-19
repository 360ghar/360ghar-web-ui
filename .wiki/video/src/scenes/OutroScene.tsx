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
} from '../theme';

/**
 * Scene 6 (68-75s, 210 frames)
 * Orange gradient, "360Ghar" large white Cinzel, "Explore the codebase at 360ghar.com"
 * in Josefin Sans. Spring entrance, fade out at end, subtle zoom on the text.
 */
export const OutroScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const entranceProgress = spring({
    frame,
    fps,
    config: SPRING_CONFIG,
  });

  const titleOpacity = interpolate(entranceProgress, [0, 1], [0, 1]);
  const titleScale = interpolate(entranceProgress, [0, 1], [0.85, 1]);

  // Subtle continuous zoom after entrance.
  const zoom = interpolate(
    frame,
    [30, SCENE_DURATIONS.outro],
    [1, 1.06],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const taglineProgress = spring({
    frame: frame - 18,
    fps,
    config: SPRING_CONFIG,
  });
  const taglineOpacity = interpolate(taglineProgress, [0, 1], [0, 1]);

  // Fade out at end.
  const fadeOut = interpolate(
    frame,
    [SCENE_DURATIONS.outro - 30, SCENE_DURATIONS.outro],
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
        <div
          style={{
            transform: `scale(${titleScale * zoom})`,
            opacity: titleOpacity,
            textAlign: 'center',
          }}
        >
          <div
            style={{
              fontFamily: FONTS.heading,
              fontSize: 200,
              fontWeight: 700,
              color: COLORS.bgWhite,
              letterSpacing: 6,
              textShadow: '0 0 50px rgba(255,140,58,0.7), 0 6px 30px rgba(0,0,0,0.25)',
              marginBottom: 24,
            }}
          >
            360Ghar
          </div>
        </div>

        <div
          style={{
            fontFamily: FONTS.body,
            fontSize: 48,
            color: COLORS.mainColorLighter,
            opacity: taglineOpacity,
            letterSpacing: 1,
            textAlign: 'center',
          }}
        >
          Explore the codebase at 360ghar.com
        </div>

        {/* Decorative underline */}
        <div
          style={{
            marginTop: 32,
            width: interpolate(
              spring({ frame: frame - 35, fps, config: SPRING_CONFIG }),
              [0, 1],
              [0, 280]
            ),
            height: 4,
            background: COLORS.bgWhite,
            borderRadius: 2,
            opacity: taglineOpacity * 0.8,
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default OutroScene;
