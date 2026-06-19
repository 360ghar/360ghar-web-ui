import React from 'react';
import { AbsoluteFill, interpolate, useCurrentFrame } from 'remotion';

type TransitionDirection = 'left' | 'right' | 'up' | 'down';

interface TransitionProps {
  direction?: TransitionDirection;
  color?: string;
  durationInFrames?: number;
}

/**
 * Full-screen transition that slides a colored panel across the screen.
 * Panel enters from one edge, fully covers mid-way, then exits the opposite edge.
 */
export const Transition: React.FC<TransitionProps> = ({
  direction = 'left',
  color = '#ff6b00',
  durationInFrames = 20,
}) => {
  const frame = useCurrentFrame();

  // Progress 0 -> 1 -> 0 (enter, cover, exit)
  const half = durationInFrames / 2;
  const enterProgress = interpolate(
    frame,
    [0, half],
    [0, 1],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );
  const exitProgress = interpolate(
    frame,
    [half, durationInFrames],
    [1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  // Position offset in pixels from the screen edge.
  const screenDimension = 1920; // assumes 1920x1080 canvas

  const getOffset = (progress: number) => {
    return interpolate(progress, [0, 1], [-screenDimension, 0]);
  };

  let transform = '';
  switch (direction) {
    case 'left':
      transform = `translateX(${getOffset(enterProgress)}px) translateX(${-getOffset(exitProgress) * 0}px)`;
      break;
    case 'right':
      transform = `translateX(${screenDimension - getOffset(enterProgress)}px)`;
      break;
    case 'up':
      transform = `translateY(${getOffset(enterProgress)}px)`;
      break;
    case 'down':
      transform = `translateY(${screenDimension - getOffset(enterProgress)}px)`;
      break;
  }

  // Hide entirely after the transition completes.
  const opacity =
    frame >= durationInFrames
      ? 0
      : interpolate(frame, [0, 1, durationInFrames - 1, durationInFrames], [0, 1, 1, 0], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });

  return (
    <AbsoluteFill style={{ opacity, zIndex: 1000 }}>
      <AbsoluteFill style={{ background: color, transform }} />
    </AbsoluteFill>
  );
};

export default Transition;
