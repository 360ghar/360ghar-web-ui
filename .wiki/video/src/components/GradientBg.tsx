import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS } from '../theme';

type GradientVariant = 'orange' | 'light' | 'dark' | 'blue';

interface GradientBgProps {
  variant?: GradientVariant;
  // When true, adds a subtle radial highlight overlay for depth.
  radialHighlight?: boolean;
}

const getGradient = (variant: GradientVariant): string => {
  switch (variant) {
    case 'orange':
      return COLORS.orangeGradient;
    case 'light':
      return `linear-gradient(135deg, ${COLORS.mainColorLighter} 0%, ${COLORS.bgWhite} 100%)`;
    case 'dark':
      return COLORS.darkGradient;
    case 'blue':
      return COLORS.blueGradient;
    default:
      return COLORS.orangeGradient;
  }
};

/**
 * Full-screen gradient background for scenes.
 * Optionally overlays a subtle radial highlight to add depth.
 */
export const GradientBg: React.FC<GradientBgProps> = ({
  variant = 'orange',
  radialHighlight = false,
}) => {
  return (
    <AbsoluteFill
      style={{
        background: getGradient(variant),
        zIndex: 0,
      }}
    >
      {radialHighlight && (
        <AbsoluteFill
          style={{
            background:
              'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0) 55%)',
          }}
        />
      )}
    </AbsoluteFill>
  );
};

export default GradientBg;
