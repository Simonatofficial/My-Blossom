/**
 * The feel-tokens a theme exposes. A theme is a *mood/biome with its own light*
 * (docs/04 §3), not just a hue swap. The Sky renders the gradient + horizon haze;
 * the visual engine layers particles/atmosphere/weather on top.
 *
 * Ported from v0.0.1 (the model was right) + a `feel` block that brings in The
 * Blossom's Living Layout idea: per-surface material/density tokens that cascade
 * Module → Page → Widget so things have identity. Optional, defaulted, opt-in.
 */

/** Top→bottom gradient stops (at least two). Feeds expo-linear-gradient. */
export type Gradient = readonly [string, string, ...string[]];

/** The Living Layout feel layer (The Blossom docs/15). Cosmetic, inheritable. */
export interface FeelTokens {
  /** Card material: paper / glass / slate / card / canvas. */
  material: 'paper' | 'glass' | 'slate' | 'card' | 'canvas';
  /** Spacing rhythm. */
  density: 'cozy' | 'roomy' | 'compact';
  /** 0–1 subtle surface texture. */
  texture: number;
}

export interface Theme {
  id: string;
  name: string;

  // --- The world (back layers) ---
  sky: Gradient;
  haze: string;
  bg: string;

  // --- Floating UI (front layer) ---
  surface: string;
  surfaceOpacity: number;
  text: string;
  textMuted: string;
  accent: string;
  onAccent: string;
  radius: number;

  // --- Metadata ---
  barStyle: 'light' | 'dark';
  /** Signature particle for the visual engine. */
  particles: string;
  /** Optional Living-Layout defaults for this biome. */
  feel?: Partial<FeelTokens>;
}

export const DEFAULT_FEEL: FeelTokens = { material: 'card', density: 'cozy', texture: 0.06 };
