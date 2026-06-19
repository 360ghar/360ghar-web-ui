import React from 'react';
import { spring, useCurrentFrame, useVideoConfig, interpolate } from 'remotion';
import { SPRING_CONFIG, FONTS } from '../theme';

interface AnimatedTextProps {
  text: string | string[];
  fontSize?: number;
  fontFamily?: string;
  color?: string;
  fontWeight?: number;
  delay?: number; // frames before the reveal starts
  x?: number;
  y?: number;
  lineHeight?: number;
  letterSpacing?: number;
  textAlign?: 'left' | 'center' | 'right';
  staggerLines?: boolean; // when true, multi-line arrays reveal one line at a time
  width?: number | string;
}

/**
 * Reveals text with a spring animation (slide up + fade in).
 * Supports single strings and staggered multi-line arrays.
 */
export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize = 48,
  fontFamily = FONTS.body,
  color = '#181616',
  fontWeight = 400,
  delay = 0,
  x = 0,
  y = 0,
  lineHeight = 1.2,
  letterSpacing = 0,
  textAlign = 'left',
  staggerLines = true,
  width = '100%',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const lines = Array.isArray(text) ? text : [text];

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width,
        textAlign,
        fontFamily,
        color,
        fontSize,
        fontWeight,
        lineHeight,
        letterSpacing,
      }}
    >
      {lines.map((line, i) => {
        const lineDelay = delay + (staggerLines ? i * 10 : 0);
        const progress = spring({
          frame: frame - lineDelay,
          fps,
          config: SPRING_CONFIG,
        });
        const translateY = interpolate(progress, [0, 1], [40, 0]);
        const opacity = interpolate(progress, [0, 1], [0, 1]);

        return (
          <div
            key={`${line}-${i}`}
            style={{
              transform: `translateY(${translateY}px)`,
              opacity,
              willChange: 'transform, opacity',
            }}
          >
            {line}
          </div>
        );
      })}
    </div>
  );
};

export default AnimatedText;
