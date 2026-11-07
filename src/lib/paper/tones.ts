/** A paper layer's colour: its kesar (or paper) fill, and the shadow it casts. One set for every vignette and scene. */
export type Tone = { fill: string; shadow: string };

export const FAR: Tone = { fill: 'var(--color-kesar-200)', shadow: 'rgb(226 91 0 / 0.3)' };
export const MID: Tone = { fill: 'var(--color-kesar-300)', shadow: 'rgb(181 70 0 / 0.35)' };
export const MAIN: Tone = { fill: 'var(--color-kesar-500)', shadow: 'rgb(138 51 0 / 0.4)' };
export const NEAR: Tone = { fill: 'var(--color-kesar-800)', shadow: 'rgb(47 15 2 / 0.45)' };
export const SHEET: Tone = { fill: 'var(--color-paper)', shadow: 'rgb(138 51 0 / 0.3)' };
export const LEAF: Tone = { fill: 'var(--color-kesar-700)', shadow: 'rgb(94 33 0 / 0.4)' };
