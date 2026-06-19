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

interface Box {
  label: string;
  x: number;
  y: number;
  color: string;
}

interface Connector {
  from: { x: number; y: number };
  to: { x: number; y: number };
  delay: number;
}

const BOX_WIDTH = 360;
const BOX_HEIGHT = 110;

const BOXES: Box[] = [
  { label: 'Pages', x: 280, y: 240, color: COLORS.mainColor },
  { label: 'Components', x: 1280, y: 240, color: COLORS.ctaColor },
  { label: 'Common', x: 280, y: 510, color: COLORS.mainColorLight },
  { label: 'Services', x: 1280, y: 510, color: COLORS.ctaColor },
  { label: 'Stores', x: 280, y: 780, color: COLORS.mainColor },
  { label: 'Supabase API', x: 1280, y: 780, color: COLORS.successColor },
];

// Connectors between paired boxes (horizontal arrows).
const CONNECTORS: Connector[] = [
  { from: { x: 280 + BOX_WIDTH, y: 240 + BOX_HEIGHT / 2 }, to: { x: 1280, y: 240 + BOX_HEIGHT / 2 }, delay: 60 },
  { from: { x: 280 + BOX_WIDTH, y: 510 + BOX_HEIGHT / 2 }, to: { x: 1280, y: 510 + BOX_HEIGHT / 2 }, delay: 90 },
  { from: { x: 280 + BOX_WIDTH, y: 780 + BOX_HEIGHT / 2 }, to: { x: 1280, y: 780 + BOX_HEIGHT / 2 }, delay: 120 },
];

/**
 * Scene 4 (35-55s, 600 frames)
 * Dark background, "Architecture" title, animated diagram with boxes and connecting lines.
 */
export const ArchitectureScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [SCENE_DURATIONS.architecture - 20, SCENE_DURATIONS.architecture],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleProgress = spring({ frame, fps, config: SPRING_CONFIG });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  return (
    <AbsoluteFill>
      <GradientBg variant="dark" />

      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: 90,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.heading,
            fontSize: 96,
            fontWeight: 700,
            color: COLORS.bgWhite,
            opacity: titleOpacity,
          }}
        >
          Architecture
        </div>

        {/* Connectors (drawn first so boxes appear on top) */}
        <svg
          width={1920}
          height={1080}
          style={{ position: 'absolute', top: 0, left: 0, zIndex: 1 }}
        >
          {CONNECTORS.map((conn, i) => {
            const length = conn.to.x - conn.from.x;
            const drawProgress = spring({
              frame: frame - conn.delay,
              fps,
              config: SPRING_CONFIG,
            });
            const drawnLength = interpolate(drawProgress, [0, 1], [0, length]);
            return (
              <line
                key={`connector-${i}`}
                x1={conn.from.x}
                y1={conn.from.y}
                x2={conn.from.x + drawnLength}
                y2={conn.from.y}
                stroke={COLORS.mainColorLight}
                strokeWidth={4}
                strokeDasharray={`${length} ${length}`}
                strokeDashoffset={length - drawnLength}
                opacity={0.7}
              />
            );
          })}
        </svg>

        {/* Boxes */}
        {BOXES.map((box, i) => {
          const delay = 30 + i * 12;
          const boxProgress = spring({
            frame: frame - delay,
            fps,
            config: SPRING_CONFIG,
          });
          const scale = interpolate(boxProgress, [0, 1], [0.6, 1]);
          const opacity = interpolate(boxProgress, [0, 1], [0, 1]);

          return (
            <div
              key={box.label}
              style={{
                position: 'absolute',
                left: box.x,
                top: box.y,
                width: BOX_WIDTH,
                height: BOX_HEIGHT,
                border: `3px solid ${box.color}`,
                borderRadius: 14,
                background: 'rgba(255,255,255,0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONTS.body,
                fontSize: 38,
                fontWeight: 600,
                color: COLORS.bgWhite,
                transform: `scale(${scale})`,
                opacity,
                zIndex: 2,
                boxShadow: `0 0 24px ${box.color}33`,
              }}
            >
              {box.label}
            </div>
          );
        })}

        {/* Caption */}
        <div
          style={{
            position: 'absolute',
            bottom: 60,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.body,
            fontSize: 28,
            color: COLORS.textSecondary,
            opacity: interpolate(
              spring({ frame: frame - 180, fps, config: SPRING_CONFIG }),
              [0, 1],
              [0, 1]
            ),
          }}
        >
          Layered architecture: UI, shared logic, services, and state stores backed by Supabase.
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ArchitectureScene;
