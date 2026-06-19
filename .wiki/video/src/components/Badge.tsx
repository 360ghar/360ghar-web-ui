import React from 'react';
import {
  spring,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from 'remotion';
import { SPRING_BOUNCE, FONTS } from '../theme';

interface BadgeProps {
  label: string;
  delay?: number;
  x?: number;
  y?: number;
  color?: string;
  textColor?: string;
  fontSize?: number;
}

/**
 * Pill-shaped badge for tech stack items.
 * Springs in with a scale animation.
 */
export const Badge: React.FC<BadgeProps> = ({
  label,
  delay = 0,
  x = 0,
  y = 0,
  color = '#ff6b00',
  textColor = '#ffffff',
  fontSize = 32,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const progress = spring({
    frame: frame - delay,
    fps,
    config: SPRING_BOUNCE,
  });

  const scale = interpolate(progress, [0, 1], [0.4, 1]);
  const opacity = interpolate(progress, [0, 1], [0, 1]);

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        transform: `scale(${scale})`,
        opacity,
        background: color,
        color: textColor,
        fontFamily: FONTS.body,
        fontSize,
        fontWeight: 600,
        padding: '14px 32px',
        borderRadius: 30,
        whiteSpace: 'nowrap',
        boxShadow: '0 8px 20px rgba(0,0,0,0.12)',
        willChange: 'transform, opacity',
      }}
    >
      {label}
    </div>
  );
};

export default Badge;
