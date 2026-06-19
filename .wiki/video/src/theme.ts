// 360Ghar brand theme for Remotion video
// All colors, fonts, and animation configs centralized here.

export const COLORS = {
  // Primary brand orange
  mainColor: '#ff6b00',
  mainColorDark: '#cc5500',
  mainColorLight: '#ff8c3a',
  mainColorLighter: '#fff5eb',

  // CTA & semantic colors
  ctaColor: '#0369A1',
  successColor: '#28a745',
  dangerColor: '#dc3545',
  warningColor: '#ffc107',
  infoColor: '#17a2b8',

  // Text colors
  textPrimary: '#181616',
  textSecondary: '#777777',
  textMuted: '#6b7385',

  // Borders & backgrounds
  borderColorLight: '#e0e6ed',
  bgLight: '#f8f8f8',
  bgWhite: '#ffffff',

  // Gradients
  orangeGradient: 'linear-gradient(135deg, #ff6b00 0%, #cc5500 100%)',
  orangeGradientRadial:
    'radial-gradient(circle at 30% 30%, #ff8c3a 0%, #ff6b00 40%, #cc5500 100%)',
  blueGradient: 'linear-gradient(135deg, #0369A1 0%, #024a73 100%)',
  darkGradient: 'linear-gradient(135deg, #181616 0%, #2a2522 100%)',
} as const;

export const FONTS = {
  heading: 'Cinzel',
  body: 'Josefin Sans',
} as const;

export const FONT_WEIGHTS = {
  regular: 400,
  medium: 500,
  semiBold: 600,
  bold: 700,
} as const;

// Standard spring config used across the video for natural motion.
export const SPRING_CONFIG = {
  damping: 200,
  mass: 1,
  stiffness: 100,
  overshootClamping: false,
} as const;

// Spring config with more bounce for badge/element entrances.
export const SPRING_BOUNCE = {
  damping: 12,
  mass: 0.8,
  stiffness: 120,
  overshootClamping: false,
} as const;

// Common animation durations (in frames at 30fps)
export const DURATIONS = {
  quickReveal: 15,
  standardReveal: 25,
  slowReveal: 40,
  badgeStagger: 8,
  cardStagger: 18,
  sceneTransition: 20,
  fadeOut: 30,
} as const;

// Video specs
export const VIDEO = {
  width: 1920,
  height: 1080,
  fps: 30,
  totalDurationInFrames: 2250, // 75 seconds
} as const;

// Scene durations in frames
export const SCENE_DURATIONS = {
  title: 180, // 0-6s
  techStack: 360, // 6-18s
  features: 510, // 18-35s
  architecture: 600, // 35-55s
  tools: 390, // 55-68s
  outro: 210, // 68-75s
} as const;
