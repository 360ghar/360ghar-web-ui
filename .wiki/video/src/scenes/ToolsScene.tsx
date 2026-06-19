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

interface Tool {
  name: string;
  icon: string;
}

const TOOLS: Tool[] = [
  { name: 'EMI Calculator', icon: '🧮' },
  { name: 'Area Converter', icon: '📐' },
  { name: 'Vastu Checker', icon: '🧭' },
  { name: '3D Blueprint', icon: '🏠' },
  { name: 'Loan Eligibility', icon: '💳' },
  { name: 'Capital Gains', icon: '📈' },
  { name: 'Document Checklist', icon: '📋' },
];

/**
 * Scene 5 (55-68s, 390 frames)
 * Orange gradient background, "Tools" title, animated tool cards with stagger.
 */
export const ToolsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const fadeOut = interpolate(
    frame,
    [SCENE_DURATIONS.tools - 20, SCENE_DURATIONS.tools],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const titleProgress = spring({ frame, fps, config: SPRING_CONFIG });
  const titleOpacity = interpolate(titleProgress, [0, 1], [0, 1]);

  // Grid: 4 columns, 2 rows (last row has 3 centered).
  const cardWidth = 360;
  const cardHeight = 220;
  const colSpacing = 40;
  const rowSpacing = 40;
  const gridStartX = (1920 - (cardWidth * 4 + colSpacing * 3)) / 2;
  const gridStartY = 360;

  return (
    <AbsoluteFill>
      <GradientBg variant="orange" radialHighlight />

      <AbsoluteFill style={{ opacity: fadeOut }}>
        {/* Title */}
        <div
          style={{
            position: 'absolute',
            top: 140,
            left: 0,
            width: '100%',
            textAlign: 'center',
            fontFamily: FONTS.heading,
            fontSize: 110,
            fontWeight: 700,
            color: COLORS.bgWhite,
            opacity: titleOpacity,
            textShadow: '0 4px 20px rgba(0,0,0,0.2)',
          }}
        >
          Tools
        </div>

        {/* Tool cards */}
        {TOOLS.map((tool, i) => {
          const col = i % 4;
          const row = Math.floor(i / 4);
          const x = gridStartX + col * (cardWidth + colSpacing);
          const y = gridStartY + row * (cardHeight + rowSpacing);
          const delay = 20 + i * 12;

          const cardProgress = spring({
            frame: frame - delay,
            fps,
            config: SPRING_CONFIG,
          });
          const scale = interpolate(cardProgress, [0, 1], [0.5, 1]);
          const opacity = interpolate(cardProgress, [0, 1], [0, 1]);

          return (
            <div
              key={tool.name}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                width: cardWidth,
                height: cardHeight,
                background: 'rgba(255,255,255,0.12)',
                border: '2px solid rgba(255,255,255,0.3)',
                borderRadius: 20,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: 24,
                transform: `scale(${scale})`,
                opacity,
                backdropFilter: 'blur(6px)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.15)',
              }}
            >
              <div style={{ fontSize: 72, marginBottom: 16 }}>{tool.icon}</div>
              <div
                style={{
                  fontFamily: FONTS.body,
                  fontSize: 30,
                  fontWeight: 600,
                  color: COLORS.bgWhite,
                  textAlign: 'center',
                  lineHeight: 1.2,
                }}
              >
                {tool.name}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export default ToolsScene;
